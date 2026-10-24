/**
 * Asset Audit: 100% Media Asset Verification Module
 * Verifies all 185 assets across exclusive, isha, and reyhan&isha collections.
 */

import { readdirSync, existsSync, statSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

export const EXPECTED_COUNTS = {
  exclusive: 95,
  isha: 58,
  reyhan_isha: 36,
  total: 189,
  videos: 5,
  images: 184
};

export class AssetAuditor {
  constructor(workspaceRoot = process.cwd()) {
    this.root = resolve(workspaceRoot);
    this.collections = [
      { name: 'exclusive', dir: 'exclusive', expected: 95 },
      { name: 'isha', dir: 'isha', expected: 58 },
      { name: 'reyhan&isha', dir: 'reyhan&isha', expected: 36 }
    ];
  }

  scanLocalAssets() {
    const catalog = [];
    const summary = {
      total: 0,
      images: 0,
      videos: 0,
      byCollection: {},
      specialCharAssets: []
    };

    for (const col of this.collections) {
      const colDir = join(this.root, col.dir);
      if (!existsSync(colDir)) {
        summary.byCollection[col.name] = { count: 0, exists: false, error: `Directory ${col.dir} does not exist.` };
        continue;
      }

      const files = readdirSync(colDir);
      summary.byCollection[col.name] = { count: files.length, exists: true };

      for (const file of files) {
        const fullPath = join(colDir, file);
        const stat = statSync(fullPath);
        if (stat.isDirectory()) continue;

        const ext = file.split('.').pop()?.toLowerCase();
        const isVideo = ext === 'mp4' || ext === 'webm';
        const hasSpecialChar = /[&() ]/.test(file) || col.dir.includes('&');

        const relPath = `${col.dir}/${file}`;
        const item = {
          collection: col.name,
          filename: file,
          relPath,
          fullPath,
          sizeBytes: stat.size,
          type: isVideo ? 'video' : 'image',
          extension: ext,
          hasSpecialChar
        };

        catalog.push(item);
        summary.total++;
        if (isVideo) summary.videos++;
        else summary.images++;

        if (hasSpecialChar) {
          summary.specialCharAssets.push(relPath);
        }
      }
    }

    return { catalog, summary };
  }

  inspectManifestFile() {
    const candidates = [
      join(this.root, 'src', 'data', 'assetsManifest.ts'),
      join(this.root, 'src', 'data', 'assetsManifest.js'),
      join(this.root, '.agents', 'teamwork', 'explorer_m1_2', 'proposed_assetsManifest.ts')
    ];

    let foundPath = null;
    let content = null;

    for (const p of candidates) {
      if (existsSync(p)) {
        foundPath = p;
        content = readFileSync(p, 'utf-8');
        break;
      }
    }

    if (!foundPath) {
      return {
        found: false,
        path: null,
        error: 'No assetsManifest.ts found in src/data/ or explorer blueprints.'
      };
    }

    // Inspect manifest content
    const hasExclusiveVideo = content.includes('EXCLUSIVE_VIDEO');
    const hasIshaAssets = content.includes('ISHA_ASSETS');
    const hasReyhanIshaAssets = content.includes('REYHAN_ISHA_ASSETS');
    const hasExclusiveImages = content.includes('EXCLUSIVE_IMAGES');
    const hasAllAssets = content.includes('ALL_ASSETS');

    // Count IDs in manifest (literal image entries + makeVideo(...) factory entries)
    const idMatches = content.match(/"id"\s*:\s*"[^"]+"/g) || [];
    const videoFactoryMatches = content.match(/makeVideo\(\d+,/g) || [];
    const urlMatches = content.match(/"url"\s*:\s*"[^"]+"/g) || [];

    return {
      found: true,
      path: foundPath,
      assetIdCount: idMatches.length + videoFactoryMatches.length,
      assetUrlCount: urlMatches.length,
      exports: {
        hasExclusiveVideo,
        hasIshaAssets,
        hasReyhanIshaAssets,
        hasExclusiveImages,
        hasAllAssets
      }
    };
  }

  async verifyMediaEndpoints(baseUrl = 'http://localhost:5173', assetUrls = []) {
    const results = {
      totalTested: 0,
      passed: 0,
      failed: 0,
      failures: []
    };

    // If no explicit URLs provided, generate standard candidate URLs from local scan
    let urlsToTest = assetUrls;
    if (urlsToTest.length === 0) {
      const { catalog } = this.scanLocalAssets();
      urlsToTest = catalog.map(item => {
        // Test primary Vite public mount paths: /media/exclusive/... or /exclusive/...
        const cleanCol = item.collection.replace('&', '_');
        const encodedFile = encodeURIComponent(item.filename);
        return [
          `/media/${cleanCol}/${encodedFile}`,
          `/media/${item.collection}/${encodedFile}`,
          `/${cleanCol}/${encodedFile}`,
          `/${item.collection}/${encodedFile}`
        ];
      });
    }

    // Test in batches of 15 concurrent requests to avoid socket exhaustion
    const batchSize = 15;
    for (let i = 0; i < urlsToTest.length; i += batchSize) {
      const batch = urlsToTest.slice(i, i + batchSize);
      await Promise.all(batch.map(async (candidateGroup) => {
        results.totalTested++;
        const group = Array.isArray(candidateGroup) ? candidateGroup : [candidateGroup];
        let found200 = false;
        let lastStatus = 0;
        let successfulUrl = '';

        for (const urlPath of group) {
          const fullUrl = new URL(urlPath, baseUrl).toString();
          try {
            const res = await fetch(fullUrl, { method: 'HEAD' });
            if (res.status === 200) {
              found200 = true;
              successfulUrl = fullUrl;
              break;
            } else if (res.status === 405) {
              // Some dev servers don't support HEAD; try GET
              const getRes = await fetch(fullUrl, { method: 'GET' });
              if (getRes.status === 200) {
                found200 = true;
                successfulUrl = fullUrl;
                break;
              }
              lastStatus = getRes.status;
            } else {
              lastStatus = res.status;
            }
          } catch {
            lastStatus = 500;
          }
        }

        if (found200) {
          results.passed++;
        } else {
          results.failed++;
          results.failures.push({
            paths: group,
            lastStatus
          });
        }
      }));
    }

    return results;
  }

  async verifyAudioEndpoint(baseUrl = 'http://localhost:5173') {
    const candidates = [
      '/audio/romantic_ambiance.mp3',
      '/audio/bgm.mp3',
      '/audio/music.mp3'
    ];

    for (const urlPath of candidates) {
      const fullUrl = new URL(urlPath, baseUrl).toString();
      try {
        const res = await fetch(fullUrl, { method: 'HEAD' });
        if (res.status === 200) {
          return { found: true, url: fullUrl, status: 200 };
        }
        const getRes = await fetch(fullUrl, { method: 'GET' });
        if (getRes.status === 200) {
          return { found: true, url: fullUrl, status: 200 };
        }
      } catch {}
    }

    return { found: false, tested: candidates };
  }
}
