/**
 * CDP Bridge: Zero-dependency Chrome DevTools Protocol client for Node.js
 * Uses native Node WebSocket and HTTP fetch to control headless Chrome.
 */

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const DEFAULT_CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium'
];

export class ChromeDevToolsBridge {
  constructor(options = {}) {
    this.port = options.port || 9333;
    this.chromePath = options.chromePath || this.findChromeBinary();
    this.chromeProcess = null;
    this.ws = null;
    this.messageId = 1;
    this.pendingCommands = new Map();
    this.consoleLogs = [];
    this.consoleErrors = [];
    this.networkRequests = [];
    this.failedRequests = [];
    this.runtimeExceptions = [];
    this.isConnected = false;
  }

  findChromeBinary() {
    if (process.env.CHROME_BIN && existsSync(process.env.CHROME_BIN)) {
      return process.env.CHROME_BIN;
    }
    for (const p of DEFAULT_CHROME_PATHS) {
      if (existsSync(p)) return p;
    }
    throw new Error('Google Chrome binary not found in standard paths. Specify via CHROME_BIN or --chrome-path.');
  }

  async launchAndConnect(timeoutMs = 15000) {
    if (this.isConnected) return;

    // Launch Chrome process with isolated user-data-dir and extensions disabled
    this.userDataDir = mkdtempSync(join(tmpdir(), 'hbd-cdp-'));
    const args = [
      '--headless=new',
      `--remote-debugging-port=${this.port}`,
      `--user-data-dir=${this.userDataDir}`,
      '--disable-extensions',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--mute-audio',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--window-size=1440,900',
      'about:blank'
    ];

    this.chromeProcess = spawn(this.chromePath, args, { stdio: 'ignore' });

    // Poll for debugging endpoint readiness
    const startTime = Date.now();
    let pageWsUrl = null;

    while (Date.now() - startTime < timeoutMs) {
      try {
        const res = await fetch(`http://127.0.0.1:${this.port}/json/list`);
        if (res.ok) {
          const list = await res.json();
          const pageTarget = Array.isArray(list)
            ? list.find(t => t.type === 'page' && !String(t.url || '').startsWith('chrome-extension://')) || list.find(t => t.type === 'page')
            : null;
          if (pageTarget && pageTarget.webSocketDebuggerUrl) {
            pageWsUrl = pageTarget.webSocketDebuggerUrl;
            break;
          }
        }
      } catch {
        // Wait and retry
      }
      await new Promise(r => setTimeout(r, 200));
    }

    if (!pageWsUrl) {
      this.close();
      throw new Error(`Failed to connect to headless Chrome on port ${this.port} within ${timeoutMs}ms.`);
    }

    // Connect to Page WebSocket
    this.ws = new WebSocket(pageWsUrl);
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });

    this.ws.onmessage = (event) => this.handleMessage(event);
    this.isConnected = true;

    // Enable necessary domains
    await this.send('Page.enable');
    await this.send('DOM.enable');
    await this.send('Runtime.enable');
    await this.send('Network.enable');
    await this.send('Log.enable');
  }

  handleMessage(event) {
    let msg;
    try {
      msg = JSON.parse(event.data);
    } catch {
      return;
    }

    if (msg.id && this.pendingCommands.has(msg.id)) {
      const { resolve, reject } = this.pendingCommands.get(msg.id);
      this.pendingCommands.delete(msg.id);
      if (msg.error) {
        reject(new Error(msg.error.message || JSON.stringify(msg.error)));
      } else {
        resolve(msg.result);
      }
      return;
    }

    // Event handlers
    if (msg.method === 'Runtime.consoleAPICalled') {
      const type = msg.params.type;
      const text = (msg.params.args || [])
        .map(a => a.value !== undefined ? String(a.value) : (a.description || ''))
        .join(' ');
      
      this.consoleLogs.push({ type, text, timestamp: Date.now() });
      if (type === 'error') {
        this.consoleErrors.push({ text, timestamp: Date.now() });
      }
    } else if (msg.method === 'Runtime.exceptionThrown') {
      const desc = msg.params.exceptionDetails?.exception?.description ||
                   msg.params.exceptionDetails?.text || 'Unknown exception';
      this.runtimeExceptions.push({ description: desc, timestamp: Date.now() });
      this.consoleErrors.push({ text: `[Uncaught Exception] ${desc}`, timestamp: Date.now() });
    } else if (msg.method === 'Network.responseReceived') {
      const { response } = msg.params;
      this.networkRequests.push({
        url: response.url,
        status: response.status,
        mimeType: response.mimeType,
        timestamp: Date.now()
      });
      if (response.status >= 400) {
        this.failedRequests.push({
          url: response.url,
          status: response.status,
          statusText: response.statusText
        });
      }
    }
  }

  send(method, params = {}, timeoutMs = 10000) {
    if (!this.isConnected || !this.ws) {
      return Promise.reject(new Error('CDP Bridge is not connected.'));
    }

    const curId = this.messageId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (this.pendingCommands.has(curId)) {
          this.pendingCommands.delete(curId);
          reject(new Error(`CDP command ${method} timed out after ${timeoutMs}ms`));
        }
      }, timeoutMs);

      this.pendingCommands.set(curId, {
        resolve: (res) => { clearTimeout(timer); resolve(res); },
        reject: (err) => { clearTimeout(timer); reject(err); }
      });

      this.ws.send(JSON.stringify({ id: curId, method, params }));
    });
  }

  async navigate(url, waitMs = 2500) {
    await this.send('Page.navigate', { url });
    await new Promise(r => setTimeout(r, waitMs));
  }

  async setViewport(width, height, isMobile = false, deviceScaleFactor = 1) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor,
      mobile: isMobile,
      screenOrientation: isMobile ? { angle: 0, type: 'portraitPrimary' } : { angle: 0, type: 'landscapePrimary' }
    });
    // Give layout time to reflow
    await new Promise(r => setTimeout(r, 200));
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res?.result?.value;
  }

  async getScrollMetrics() {
    return await this.evaluate(`(() => {
      const el = document.documentElement;
      return {
        scrollWidth: el.scrollWidth,
        scrollHeight: el.scrollHeight,
        clientWidth: el.clientWidth,
        clientHeight: el.clientHeight,
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        scrollX: window.scrollX,
        scrollY: window.scrollY,
        hasHorizontalOverflow: el.scrollWidth > window.innerWidth
      };
    })()`);
  }

  async scrollDownGradually(steps = 10, delayPerStepMs = 150) {
    return await this.evaluate(`(async () => {
      const totalHeight = document.documentElement.scrollHeight;
      const stepSize = Math.max(200, Math.floor(totalHeight / ${steps}));
      let current = 0;
      while (current < totalHeight) {
        current += stepSize;
        window.scrollTo(0, current);
        await new Promise(r => setTimeout(r, ${delayPerStepMs}));
      }
      return { finalScrollY: window.scrollY, totalHeight };
    })()`);
  }

  async queryElement(selector) {
    return await this.evaluate(`(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return {
        tagName: el.tagName.toLowerCase(),
        id: el.id,
        className: el.className,
        textContent: (el.textContent || '').trim().slice(0, 100),
        isVisible: rect.width > 0 && rect.height > 0,
        rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
        attributes: Array.from(el.attributes).reduce((acc, a) => { acc[a.name] = a.value; return acc; }, {})
      };
    })()`);
  }

  async click(selector) {
    return await this.evaluate(`(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return false;
      el.scrollIntoView({ behavior: 'instant', block: 'center' });
      el.click();
      return true;
    })()`);
  }

  close() {
    this.isConnected = false;
    if (this.ws) {
      try { this.ws.close(); } catch {}
      this.ws = null;
    }
    if (this.chromeProcess) {
      try { this.chromeProcess.kill(); } catch {}
      this.chromeProcess = null;
    }
  }
}
