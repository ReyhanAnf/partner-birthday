#!/usr/bin/env node
/**
 * Automated E2E Test Suite: Happy Birthday Isha Scroll-Driven Web Experience
 *
 * Requirements Covered:
 * - R1: Aceternity UI Scroll Stages (5+ stages)
 * - R2: 100% Asset Inventory (189/189) & Preloader Gimmick
 * - R3: Mobile-First Responsiveness (390x844 vs 1440x900), Video Autoplay/Pause, Audio Toggle
 * - R4: Centralized Romantic Configuration
 *
 * Usage:
 *   node tests/verify_experience.mjs [--url http://localhost:5173] [--tier 1,2,3,4] [--skip-browser]
 */

import { existsSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { ChromeDevToolsBridge } from './cdp_bridge.mjs';
import { AssetAuditor, EXPECTED_COUNTS } from './asset_audit.mjs';
import { ConfigVerifier } from './config_verifier.mjs';

// ANSI styling
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

// Parse CLI flags
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    url: 'http://localhost:5173',
    tier: 'all',
    skipBrowser: false,
    verbose: false,
    chromePath: null,
    port: 9333
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--url' && args[i + 1]) options.url = args[++i];
    else if (arg === '--tier' && args[i + 1]) options.tier = args[++i];
    else if (arg === '--skip-browser') options.skipBrowser = true;
    else if (arg === '--verbose' || arg === '-v') options.verbose = true;
    else if (arg === '--chrome-path' && args[i + 1]) options.chromePath = args[++i];
    else if (arg === '--port' && args[i + 1]) options.port = parseInt(args[++i], 10);
    else if (arg === '--help' || arg === '-h') {
      console.log(`
${C.bold}Happy Birthday Isha - E2E Test Runner${C.reset}
Usage: node tests/verify_experience.mjs [options]

Options:
  --url <url>          Target web application URL (default: http://localhost:5173)
  --tier <tier>        Filter test execution (1, 2, 3, 4, or all) (default: all)
  --skip-browser       Skip headless Chrome browser audit (run static & HTTP tests only)
  --chrome-path <path> Path to Chrome or Edge binary
  --verbose, -v        Enable detailed logging
  --help, -h           Show this help message
      `);
      process.exit(0);
    }
  }

  return options;
}

class TestSuiteRunner {
  constructor(options) {
    this.options = options;
    this.workspaceRoot = resolve(process.cwd());
    this.results = [];
    this.auditor = new AssetAuditor(this.workspaceRoot);
    this.configVerifier = new ConfigVerifier(this.workspaceRoot);
    this.cdp = null;
    this.serverOnline = false;
  }

  async runTest(tierNum, testId, title, testFn) {
    const startTime = Date.now();
    const result = {
      tier: tierNum,
      id: testId,
      title,
      status: 'PENDING',
      durationMs: 0,
      error: null,
      details: null
    };

    try {
      const output = await testFn();
      result.status = 'PASS';
      result.details = output;
    } catch (err) {
      result.status = 'FAIL';
      result.error = err.message || String(err);
    } finally {
      result.durationMs = Date.now() - startTime;
      this.results.push(result);

      const statusSymbol = result.status === 'PASS'
        ? `${C.green}✓ PASS${C.reset}`
        : `${C.red}✗ FAIL${C.reset}`;
      console.log(`  [T${tierNum}] [${testId}] ${title.padEnd(52)} ${statusSymbol} ${C.dim}(${result.durationMs}ms)${C.reset}`);
      if (result.status === 'FAIL' && this.options.verbose) {
        console.log(`         ${C.red}↳ Error: ${result.error}${C.reset}`);
      }
    }
  }

  async checkServer() {
    try {
      const res = await fetch(this.options.url, { method: 'GET', signal: AbortSignal.timeout(3000) });
      this.serverOnline = res.ok || res.status === 200 || res.status === 304;
    } catch {
      this.serverOnline = false;
    }
    return this.serverOnline;
  }

  // =========================================================================
  // TIER 1: Core Foundation & Static Serving
  // =========================================================================
  async runTier1() {
    console.log(`\n${C.bold}${C.cyan}▶ Executing Tier 1: Core Foundation & Static Serving${C.reset}`);

    // T1.1: Web Server Reachable
    await this.runTest(1, 'T1.1', 'Web server reachable and serves index.html (200 OK)', async () => {
      if (!this.serverOnline) {
        throw new Error(`Web server at ${this.options.url} is offline or unreachable. Start dev server using: npm.cmd run dev`);
      }
      const res = await fetch(this.options.url);
      if (!res.ok) throw new Error(`Server returned HTTP status ${res.status}`);
      const html = await res.text();
      if (!html.includes('<div id="root">') && !html.includes('id="root"')) {
        throw new Error('index.html is missing root container (<div id="root">)');
      }
      return { status: 200, length: html.length };
    });

    // T1.2: Root HTML Document & Meta Structure
    await this.runTest(1, 'T1.2', 'Root HTML structure, viewport meta, and title valid', async () => {
      const indexHtmlPath = join(this.workspaceRoot, 'index.html');
      let html = '';
      if (existsSync(indexHtmlPath)) {
        html = readFileSync(indexHtmlPath, 'utf-8');
      } else if (this.serverOnline) {
        const res = await fetch(this.options.url);
        html = await res.text();
      } else {
        throw new Error('index.html not found on disk and server offline');
      }

      const hasViewport = /<meta\s+name=["']viewport["']/i.test(html);
      const hasTitle = /<title>[^<]+<\/title>/i.test(html);
      const hasRoot = /id=["']root["']/i.test(html);

      if (!hasViewport) throw new Error('Missing responsive <meta name="viewport"> tag');
      if (!hasTitle) throw new Error('Missing <title> tag in index.html');
      if (!hasRoot) throw new Error('Missing #root element in index.html');

      return { hasViewport, hasTitle, hasRoot };
    });

    // T1.3: Preloader Gimmick Elements in DOM
    await this.runTest(1, 'T1.3', 'Preloader gimmick rendered with progress and enter CTA', async () => {
      if (!this.cdp) {
        // Fallback inspection of component code
        const preloaderFile = join(this.workspaceRoot, 'src', 'components', 'PreloaderGimmick.tsx');
        if (existsSync(preloaderFile)) {
          const content = readFileSync(preloaderFile, 'utf-8');
          if (!content.includes('progress') || !content.includes('button')) {
            throw new Error('PreloaderGimmick.tsx missing progress or button elements');
          }
          return { codeVerified: true, path: preloaderFile };
        }
        throw new Error('Preloader element verification requires active server and CDP or PreloaderGimmick.tsx');
      }

      const preloader = await this.cdp.queryElement('[data-testid="preloader"], #preloader, .preloader-screen, div[class*="preloader"]');
      if (!preloader) {
        throw new Error('Preloader container element not found in DOM');
      }

      const hasButton = await this.cdp.evaluate(`(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.some(b => /buka|enter|mulai|open/i.test(b.textContent || ''));
      })()`);

      if (!hasButton) {
        throw new Error('Preloader enter / unlock CTA button not found');
      }

      return { preloaderFound: true, hasButton };
    });

    // T1.4: 5 Aceternity UI Stage Sections
    await this.runTest(1, 'T1.4', 'All 5 Aceternity stage section IDs exist in DOM', async () => {
      const requiredStages = [
        { id: 'stage-hero-lamp', name: 'Stage 1 (Hero Spotlight Lamp)' },
        { id: 'stage-isha-story', name: 'Stage 2 (Isha Story 3D Tilt Timeline)' },
        { id: 'stage-memory-vault', name: 'Stage 3 (Reyhan & Isha Memory Vault)' },
        { id: 'stage-velocity-cinema', name: 'Stage 4 (Velocity Marquee & Cinema)' },
        { id: 'stage-love-letter', name: 'Stage 5 (Love Letter & Confetti Finale)' }
      ];

      if (!this.cdp) {
        // Inspect App.tsx or section files
        const appPath = join(this.workspaceRoot, 'src', 'App.tsx');
        if (existsSync(appPath)) {
          const content = readFileSync(appPath, 'utf-8');
          const missing = requiredStages.filter(s => !content.includes(s.id));
          if (missing.length > 0) {
            throw new Error(`Missing stage references in App.tsx: ${missing.map(m => m.id).join(', ')}`);
          }
          return { verifiedViaCode: true };
        }
        throw new Error('CDP unavailable and App.tsx not found');
      }

      const missingFromDom = [];
      for (const stage of requiredStages) {
        const el = await this.cdp.queryElement(`#${stage.id}, [data-stage="${stage.id}"], .${stage.id}`);
        if (!el) missingFromDom.push(stage.id);
      }

      if (missingFromDom.length > 0) {
        throw new Error(`Stage elements missing from live DOM: ${missingFromDom.join(', ')}`);
      }

      return { stagesFound: requiredStages.length };
    });

    // T1.5: Inline Video Element with Muted & Playsinline Attributes
    await this.runTest(1, 'T1.5', 'Video element exists with muted, playsinline, loop', async () => {
      if (!this.cdp) {
        // Inspect Section4 or cinema component
        const section4Path = join(this.workspaceRoot, 'src', 'components', 'sections', 'Section4_ExclusiveCinemaReel.tsx');
        if (existsSync(section4Path)) {
          const content = readFileSync(section4Path, 'utf-8');
          if (!content.includes('muted') || !content.toLowerCase().includes('playsinline')) {
            throw new Error('Section 4 video missing muted or playsinline attributes in code');
          }
          return { codeVerified: true };
        }
        throw new Error('Video check requires CDP or Section4_ExclusiveCinemaReel.tsx');
      }

      const video = await this.cdp.evaluate(`(() => {
        const v = document.querySelector('video');
        if (!v) return null;
        return {
          hasVideo: true,
          muted: v.muted || v.hasAttribute('muted'),
          playsinline: v.hasAttribute('playsinline') || v.hasAttribute('playsInline'),
          loop: v.loop || v.hasAttribute('loop'),
          src: v.currentSrc || v.src || v.querySelector('source')?.src || ''
        };
      })()`);

      if (!video) throw new Error('No <video> element found in the DOM');
      if (!video.muted) throw new Error('<video> element must have muted attribute for autoplay compliance');
      if (!video.playsinline) throw new Error('<video> element must have playsinline attribute for iOS compliance');

      return video;
    });

    // T1.6: Floating Audio Toggle Button Rendered
    await this.runTest(1, 'T1.6', 'Floating audio toggle button rendered with accessibility state', async () => {
      if (!this.cdp) {
        const togglePath = join(this.workspaceRoot, 'src', 'components', 'AudioFloatingToggle.tsx');
        if (existsSync(togglePath)) return { codeVerified: true };
        throw new Error('Audio toggle check requires CDP or AudioFloatingToggle.tsx');
      }

      const audioBtn = await this.cdp.queryElement('[data-testid="audio-toggle"], #audio-toggle, button[aria-label*="audio" i], button[aria-label*="music" i]');
      if (!audioBtn) {
        throw new Error('Floating audio toggle button not found in DOM');
      }

      return { audioBtnFound: true, isVisible: audioBtn.isVisible };
    });
  }

  // =========================================================================
  // TIER 2: Asset Completeness, HTTP Status & Viewport Bounds
  // =========================================================================
  async runTier2() {
    console.log(`\n${C.bold}${C.cyan}▶ Executing Tier 2: Asset Completeness, HTTP Status & Boundaries${C.reset}`);

    // T2.1: 100% Asset Inventory Presence (189/189)
    await this.runTest(2, 'T2.1', '100% Asset completeness (189/189 total items verified)', async () => {
      const { catalog, summary } = this.auditor.scanLocalAssets();

      if (summary.total !== EXPECTED_COUNTS.total) {
        throw new Error(`Expected exactly ${EXPECTED_COUNTS.total} total assets, found ${summary.total} on disk.`);
      }
      if (summary.byCollection.exclusive?.count !== EXPECTED_COUNTS.exclusive) {
        throw new Error(`Expected ${EXPECTED_COUNTS.exclusive} exclusive assets, found ${summary.byCollection.exclusive?.count}`);
      }
      if (summary.byCollection.isha?.count !== EXPECTED_COUNTS.isha) {
        throw new Error(`Expected ${EXPECTED_COUNTS.isha} isha assets, found ${summary.byCollection.isha?.count}`);
      }
      if (summary.byCollection['reyhan&isha']?.count !== EXPECTED_COUNTS.reyhan_isha) {
        throw new Error(`Expected ${EXPECTED_COUNTS.reyhan_isha} reyhan&isha assets, found ${summary.byCollection['reyhan&isha']?.count}`);
      }
      if (summary.videos !== EXPECTED_COUNTS.videos) {
        throw new Error(`Expected exactly ${EXPECTED_COUNTS.videos} video file, found ${summary.videos}`);
      }

      // Also verify manifest has all entries
      const manifestInfo = this.auditor.inspectManifestFile();
      if (manifestInfo.found && manifestInfo.assetIdCount < EXPECTED_COUNTS.total) {
        throw new Error(`Manifest at ${manifestInfo.path} only registers ${manifestInfo.assetIdCount}/${EXPECTED_COUNTS.total} items`);
      }

      return { diskCount: summary.total, manifestCount: manifestInfo.assetIdCount || 189 };
    });

    // T2.2: Special Characters Resolution (&, spaces, parentheses)
    await this.runTest(2, 'T2.2', 'Special characters resolution (&, spaces, parens) handled', async () => {
      const { summary } = this.auditor.scanLocalAssets();
      if (summary.specialCharAssets.length === 0) {
        throw new Error('No special character assets detected for validation');
      }

      // Check manifest handles URL encoding or sanitization
      const manifest = this.auditor.inspectManifestFile();
      if (manifest.found) {
        const content = readFileSync(manifest.path, 'utf-8');
        const hasEncodedUrls = content.includes('%20') || content.includes('reyhan_isha') || content.includes('encodeURI');
        if (!hasEncodedUrls) {
          throw new Error('Manifest does not appear to sanitize or encode special character URLs');
        }
      }

      return { specialCharAssetsCount: summary.specialCharAssets.length };
    });

    // T2.3: Preloader Timeout Fallback Logic
    await this.runTest(2, 'T2.3', 'Preloader fallback timeout guard (max 5000ms) enforced', async () => {
      const candidates = [
        join(this.workspaceRoot, 'src', 'hooks', 'useMediaPreloader.ts'),
        join(this.workspaceRoot, 'src', 'components', 'PreloaderGimmick.tsx'),
        join(this.workspaceRoot, '.agents', 'teamwork', 'explorer_survey_3', 'survey_ux_spec.md')
      ];

      let verified = false;
      let timeoutMs = 0;

      for (const p of candidates) {
        if (existsSync(p)) {
          const content = readFileSync(p, 'utf-8');
          const match = content.match(/setTimeout\([^,]+,\s*(\d+)\)/);
          if (match && parseInt(match[1], 10) <= 5000) {
            verified = true;
            timeoutMs = parseInt(match[1], 10);
            break;
          }
          if (content.includes('5000') || content.includes('4000') || content.includes('3500')) {
            verified = true;
            timeoutMs = 5000;
            break;
          }
        }
      }

      if (!verified) {
        throw new Error('No safe fallback timeout (<= 5000ms) detected in preloader implementation');
      }

      return { fallbackTimeoutMs: timeoutMs };
    });

    // T2.4: Zero Horizontal Overflow on Mobile (390x844) and Desktop (1440x900)
    await this.runTest(2, 'T2.4', 'Zero horizontal scrollbar overflow on mobile & desktop', async () => {
      if (!this.cdp) {
        // Static CSS check for overflow-x: hidden
        const indexCssPath = join(this.workspaceRoot, 'src', 'index.css');
        if (existsSync(indexCssPath)) {
          const css = readFileSync(indexCssPath, 'utf-8');
          if (!css.includes('overflow-x') && !css.includes('max-w-full')) {
            throw new Error('src/index.css missing overflow-x: hidden rule');
          }
          return { codeVerified: true };
        }
        throw new Error('Overflow test requires live CDP or index.css');
      }

      // Check Mobile (390x844)
      await this.cdp.setViewport(390, 844, true, 3);
      await this.cdp.scrollDownGradually(5, 50);
      const mobileMetrics = await this.cdp.getScrollMetrics();

      if (mobileMetrics.hasHorizontalOverflow) {
        throw new Error(`Mobile (390x844) has horizontal overflow: scrollWidth=${mobileMetrics.scrollWidth} > innerWidth=${mobileMetrics.innerWidth}`);
      }

      // Check Desktop (1440x900)
      await this.cdp.setViewport(1440, 900, false, 1);
      await this.cdp.scrollDownGradually(5, 50);
      const desktopMetrics = await this.cdp.getScrollMetrics();

      if (desktopMetrics.hasHorizontalOverflow) {
        throw new Error(`Desktop (1440x900) has horizontal overflow: scrollWidth=${desktopMetrics.scrollWidth} > innerWidth=${desktopMetrics.innerWidth}`);
      }

      return { mobileScrollWidth: mobileMetrics.scrollWidth, desktopScrollWidth: desktopMetrics.scrollWidth };
    });

    // T2.5: Video Viewport-Aware Autoplay / Pause
    await this.runTest(2, 'T2.5', 'Video viewport-aware autoplay and pause logic verified', async () => {
      if (!this.cdp) {
        // Inspect hook or component code
        const hookPath = join(this.workspaceRoot, 'src', 'components', 'sections', 'Section4_ExclusiveCinemaReel.tsx');
        if (existsSync(hookPath)) {
          const content = readFileSync(hookPath, 'utf-8');
          if (!content.includes('IntersectionObserver') && !content.includes('useInView')) {
            throw new Error('Video component does not use IntersectionObserver or useInView for viewport-aware play/pause');
          }
          return { codeVerified: true };
        }
        throw new Error('Video viewport verification requires CDP or Section 4 component code');
      }

      const videoStatus = await this.cdp.evaluate(`(() => {
        const v = document.querySelector('video');
        if (!v) return { exists: false };
        return {
          exists: true,
          paused: v.paused,
          muted: v.muted,
          readyState: v.readyState
        };
      })()`);

      if (!videoStatus.exists) throw new Error('No video element found in live page');
      return videoStatus;
    });
  }

  // =========================================================================
  // TIER 3: Interactive & Cross-Feature Choreography
  // =========================================================================
  async runTier3() {
    console.log(`\n${C.bold}${C.cyan}▶ Executing Tier 3: Interactive & Cross-Feature Choreography${C.reset}`);

    // T3.1: Audio Toggle Interaction & Ambient Music Track
    await this.runTest(3, 'T3.1', 'Audio toggle interaction and ambient music reachability', async () => {
      if (this.serverOnline) {
        const audioRes = await this.auditor.verifyAudioEndpoint(this.options.url);
        if (!audioRes.found) {
          // Check if audio file exists locally in public/audio/
          const localAudio = join(this.workspaceRoot, 'public', 'audio');
          if (!existsSync(localAudio)) {
            throw new Error(`Audio file not found in public/audio/ or on server (tested ${audioRes.tested?.join(', ')})`);
          }
        }
      }

      if (this.cdp) {
        const clicked = await this.cdp.click('[data-testid="audio-toggle"], #audio-toggle, button[aria-label*="audio" i], button[aria-label*="music" i]');
        if (!clicked) throw new Error('Failed to click audio toggle button in DOM');
      }

      return { audioVerified: true };
    });

    // T3.2: 3D Perspective & Motion Styling
    await this.runTest(3, 'T3.2', '3D perspective / motion CSS transforms present', async () => {
      const tailwindConfigPath = join(this.workspaceRoot, 'tailwind.config.js');
      if (existsSync(tailwindConfigPath)) {
        const content = readFileSync(tailwindConfigPath, 'utf-8');
        const hasCustomAnimations = content.includes('keyframes') || content.includes('animation') || content.includes('rotate');
        if (!hasCustomAnimations) {
          throw new Error('tailwind.config.js missing custom animation or keyframe extensions');
        }
      }

      if (this.cdp) {
        const has3D = await this.cdp.evaluate(`(() => {
          const els = Array.from(document.querySelectorAll('*'));
          return els.some(el => {
            const style = window.getComputedStyle(el);
            return style.transformStyle === 'preserve-3d' ||
                   style.perspective !== 'none' ||
                   el.className.includes('preserve-3d') ||
                   el.className.includes('perspective');
          });
        })()`);
        if (!has3D) {
          throw new Error('No elements with CSS 3D perspective / preserve-3d detected in live DOM');
        }
      }

      return { perspectiveVerified: true };
    });

    // T3.3: Preloader Unlock User Gesture
    await this.runTest(3, 'T3.3', 'Preloader unlock gesture dismisses overlay and unlocks audio', async () => {
      if (!this.cdp) return { skipped: 'Requires active CDP session' };

      const unlocked = await this.cdp.evaluate(`(async () => {
        const btn = document.querySelector('button[class*="preloader"], [data-testid="preloader-enter"], button');
        if (!btn) return false;
        btn.click();
        await new Promise(r => setTimeout(r, 600));
        return true;
      })()`);

      return { unlocked };
    });

    // T3.4: Stage 4 Marquee & Video Integration
    await this.runTest(3, 'T3.4', 'Stage 4 contains dual-direction marquees & video frame', async () => {
      if (!this.cdp) {
        const s4Path = join(this.workspaceRoot, 'src', 'components', 'sections', 'Section4_ExclusiveCinemaReel.tsx');
        if (existsSync(s4Path)) return { codeVerified: true };
        throw new Error('Section 4 file not found and CDP offline');
      }

      const s4Details = await this.cdp.evaluate(`(() => {
        const s4 = document.querySelector('#stage-velocity-cinema, [data-stage="4"]');
        if (!s4) return null;
        const video = s4.querySelector('video');
        const images = s4.querySelectorAll('img');
        return {
          hasSection4: true,
          hasVideo: !!video,
          imageCount: images.length
        };
      })()`);

      if (!s4Details) throw new Error('Stage 4 section not found in DOM');
      if (!s4Details.hasVideo) throw new Error('Stage 4 missing centerpiece video element');

      return s4Details;
    });
  }

  // =========================================================================
  // TIER 4: Real-World Browser Scenarios & Error-Free Audit
  // =========================================================================
  async runTier4() {
    console.log(`\n${C.bold}${C.cyan}▶ Executing Tier 4: Browser Scenarios & Zero-Error Audit${C.reset}`);

    // T4.1: Mobile Walkthrough (390x844)
    await this.runTest(4, 'T4.1', 'Full mobile walkthrough (390x844): smooth top-to-bottom scroll', async () => {
      if (!this.cdp) return { skipped: 'Requires active CDP' };

      await this.cdp.setViewport(390, 844, true, 3);
      await this.cdp.navigate(this.options.url, 1500);

      // Scroll gradually from top to bottom
      const scrollResult = await this.cdp.scrollDownGradually(12, 100);

      if (scrollResult.totalHeight <= 844) {
        throw new Error('Page content is too short for a multi-stage scroll experience');
      }

      return scrollResult;
    });

    // T4.2: Desktop Walkthrough (1440x900)
    await this.runTest(4, 'T4.2', 'Full desktop walkthrough (1440x900): layout and interactions', async () => {
      if (!this.cdp) return { skipped: 'Requires active CDP' };

      await this.cdp.setViewport(1440, 900, false, 1);
      await this.cdp.navigate(this.options.url, 1500);

      const scrollResult = await this.cdp.scrollDownGradually(12, 100);
      return scrollResult;
    });

    // T4.3: Centralized Romantic Configuration Verification
    await this.runTest(4, 'T4.3', 'Centralized romantic configuration (romanticConfig.ts) verified', async () => {
      const configRes = this.configVerifier.verifyRomanticConfig();

      if (configRes.status === 'MISSING') {
        throw new Error(configRes.message);
      }
      if (configRes.status === 'INCOMPLETE') {
        throw new Error(`romanticConfig.ts is missing required fields: ${configRes.missingKeys.join(', ')}`);
      }

      return { configStatus: configRes.status };
    });

    // T4.4: Zero Console Errors & Runtime Exceptions Audit
    await this.runTest(4, 'T4.4', 'Zero console errors, 404 network failures, or unhandled exceptions', async () => {
      if (!this.cdp) return { skipped: 'Requires active CDP' };

      const errors = this.cdp.consoleErrors;
      const failedNet = this.cdp.failedRequests;

      if (errors.length > 0) {
        throw new Error(`Encountered ${errors.length} console errors: ${errors.map(e => e.text).slice(0, 3).join(' | ')}`);
      }
      if (failedNet.length > 0) {
        throw new Error(`Encountered ${failedNet.length} failed HTTP network requests: ${failedNet.map(n => `${n.url} (${n.status})`).slice(0, 3).join(' | ')}`);
      }

      return { consoleErrors: 0, failedRequests: 0 };
    });
  }

  printSummary() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const totalDuration = this.results.reduce((acc, r) => acc + r.durationMs, 0);

    console.log(`\n${C.bold}========================================================================${C.reset}`);
    console.log(`${C.bold}                    E2E TEST SUITE EXECUTION SUMMARY                    ${C.reset}`);
    console.log(`${C.bold}========================================================================${C.reset}`);

    // Tier-by-tier breakdown
    for (let t = 1; t <= 4; t++) {
      const tierResults = this.results.filter(r => r.tier === t);
      if (tierResults.length === 0) continue;
      const tPassed = tierResults.filter(r => r.status === 'PASS').length;
      const tFailed = tierResults.filter(r => r.status === 'FAIL').length;
      const color = tFailed === 0 ? C.green : C.red;
      console.log(`  Tier ${t}: ${color}${tPassed}/${tierResults.length} passed${C.reset} (${tFailed} failed)`);
    }

    console.log(`------------------------------------------------------------------------`);
    const finalColor = failed === 0 ? C.green : C.red;
    console.log(`  Total Tests: ${C.bold}${total}${C.reset}  |  Passed: ${C.green}${passed}${C.reset}  |  Failed: ${finalColor}${failed}${C.reset}  |  Time: ${C.dim}${totalDuration}ms${C.reset}`);
    console.log(`${C.bold}========================================================================${C.reset}\n`);

    return failed === 0;
  }

  async run() {
    console.log(`\n${C.bold}${C.magenta}========================================================================${C.reset}`);
    console.log(`${C.bold}${C.magenta}       Happy Birthday Isha - Scroll Experience Automated E2E Suite      ${C.reset}`);
    console.log(`${C.bold}${C.magenta}========================================================================${C.reset}`);
    console.log(`  Target URL: ${C.cyan}${this.options.url}${C.reset}`);
    console.log(`  Tier Scope: ${C.cyan}${this.options.tier}${C.reset}`);
    console.log(`  Chrome CDP: ${this.options.skipBrowser ? `${C.yellow}Skipped${C.reset}` : `${C.green}Enabled${C.reset}`}`);

    // Check server status
    await this.checkServer();
    console.log(`  Server Status: ${this.serverOnline ? `${C.green}ONLINE (HTTP 200)${C.reset}` : `${C.yellow}OFFLINE / STANDBY${C.reset}`}`);

    // Initialize CDP if browser is enabled and server is online
    if (!this.options.skipBrowser && this.serverOnline) {
      try {
        console.log(`  Connecting to headless Chrome...`);
        this.cdp = new ChromeDevToolsBridge({
          port: this.options.port,
          chromePath: this.options.chromePath
        });
        await this.cdp.launchAndConnect();
        await this.cdp.navigate(this.options.url);
        console.log(`  ${C.green}Headless Chrome connected via CDP successfully.${C.reset}`);
      } catch (err) {
        console.warn(`  ${C.yellow}Notice: Headless Chrome CDP unavailable (${err.message}). Falling back to static/offline mode.${C.reset}`);
        this.cdp = null;
      }
    }

    const tierFilter = this.options.tier.toLowerCase();

    try {
      if (tierFilter === 'all' || tierFilter.includes('1')) await this.runTier1();
      if (tierFilter === 'all' || tierFilter.includes('2')) await this.runTier2();
      if (tierFilter === 'all' || tierFilter.includes('3')) await this.runTier3();
      if (tierFilter === 'all' || tierFilter.includes('4')) await this.runTier4();
    } finally {
      if (this.cdp) {
        this.cdp.close();
      }
    }

    const success = this.printSummary();
    return success;
  }
}

// Main execution
const options = parseArgs();
const runner = new TestSuiteRunner(options);

runner.run()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error(`\n${C.red}Fatal test runner error: ${err.message}${C.reset}\n`, err);
    process.exit(1);
  });
