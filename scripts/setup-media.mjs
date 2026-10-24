import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicMediaDir = path.resolve(rootDir, 'public', 'media');
const markerPath = path.resolve(publicMediaDir, '.optimized_v1');

if (fs.existsSync(markerPath)) {
  console.log('[setup-media] Optimized web media assets already prepared under public/media/.');
  process.exit(0);
}

try {
  console.log('[setup-media] Running Python Pillow media optimizer for lightweight scroll performance...');
  execSync('python scripts/optimize_media.py', { cwd: rootDir, stdio: 'inherit' });
} catch (err) {
  console.warn('[setup-media] Python optimizer failed, falling back to directory junctions:', err.message);
}
