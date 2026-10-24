import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const audioDir = path.resolve(rootDir, 'public', 'audio');

if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

const mp3Path = path.resolve(audioDir, 'romantic_ambiance.mp3');
if (fs.existsSync(mp3Path) && fs.statSync(mp3Path).size > 10000) {
  console.log('[generate-audio] romantic_ambiance.mp3 already exists.');
  process.exit(0);
}

console.log('[generate-audio] Synthesizing romantic ambient audio track...');

const sampleRate = 44100;
const durationSeconds = 32;
const totalSamples = sampleRate * durationSeconds;
const channels = 2;

const left = new Float32Array(totalSamples);
const right = new Float32Array(totalSamples);

// 4-Chord Progression (8 seconds each): Cmaj9 -> Am9 -> Fmaj7 -> G6/9
const chords = [
  { start: 0, freqs: [130.81, 196.00, 246.94, 329.63, 392.00] },
  { start: 8, freqs: [110.00, 164.81, 196.00, 261.63, 329.63] },
  { start: 16, freqs: [87.31, 130.81, 164.81, 220.00, 261.63] },
  { start: 24, freqs: [98.00, 146.83, 196.00, 246.94, 329.63] }
];

const melody = [
  { time: 1.0, freq: 523.25 }, { time: 2.5, freq: 659.25 },
  { time: 4.0, freq: 783.99 }, { time: 5.5, freq: 987.77 },
  { time: 9.0, freq: 440.00 }, { time: 10.5, freq: 523.25 },
  { time: 12.0, freq: 659.25 }, { time: 13.5, freq: 783.99 },
  { time: 17.0, freq: 349.23 }, { time: 18.5, freq: 440.00 },
  { time: 20.0, freq: 523.25 }, { time: 21.5, freq: 659.25 },
  { time: 25.0, freq: 392.00 }, { time: 26.5, freq: 493.88 },
  { time: 28.0, freq: 587.33 }, { time: 29.5, freq: 659.25 }
];

for (const chord of chords) {
  const startSample = Math.floor(chord.start * sampleRate);
  const chordSamples = Math.floor(8 * sampleRate);
  for (let i = 0; i < chordSamples; i++) {
    const sampleIdx = (startSample + i) % totalSamples;
    const t = i / sampleRate;
    const attack = Math.min(1.0, t / 1.5);
    const release = Math.min(1.0, (8.0 - t) / 1.5);
    const env = attack * release * 0.12;

    for (const baseFreq of chord.freqs) {
      const sigL = Math.sin(2 * Math.PI * baseFreq * 0.998 * t) * 0.7 +
                   Math.sin(4 * Math.PI * baseFreq * 0.998 * t) * 0.2 +
                   Math.sin(6 * Math.PI * baseFreq * 0.998 * t) * 0.1;
      const sigR = Math.sin(2 * Math.PI * baseFreq * 1.002 * t) * 0.7 +
                   Math.sin(4 * Math.PI * baseFreq * 1.002 * t) * 0.2 +
                   Math.sin(6 * Math.PI * baseFreq * 1.002 * t) * 0.1;
      left[sampleIdx] += sigL * env;
      right[sampleIdx] += sigR * env;
    }
  }
}

for (const note of melody) {
  const startSample = Math.floor(note.time * sampleRate);
  const noteSamples = Math.floor(3.0 * sampleRate);
  for (let i = 0; i < noteSamples; i++) {
    const sampleIdx = (startSample + i) % totalSamples;
    const t = i / sampleRate;
    const env = Math.min(1.0, t / 0.015) * Math.exp(-t * 2.2) * 0.15;
    const sig = Math.sin(2 * Math.PI * note.freq * t) + 0.3 * Math.sin(4 * Math.PI * note.freq * t);
    left[sampleIdx] += sig * env * 0.5;
    right[sampleIdx] += sig * env * 0.5;
  }
}

const delaySamples = Math.floor(sampleRate * 0.35);
for (let i = delaySamples; i < totalSamples; i++) {
  left[i] += right[i - delaySamples] * 0.35;
  right[i] += left[i - delaySamples] * 0.35;
}

const bytesPerSample = 2;
const blockAlign = channels * bytesPerSample;
const dataSize = totalSamples * blockAlign;
const buffer = Buffer.alloc(44 + dataSize);

buffer.write('RIFF', 0);
buffer.writeUInt32LE(36 + dataSize, 4);
buffer.write('WAVE', 8);
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20);
buffer.writeUInt16LE(channels, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(sampleRate * blockAlign, 28);
buffer.writeUInt16LE(blockAlign, 32);
buffer.writeUInt16LE(16, 34);
buffer.write('data', 36);
buffer.writeUInt32LE(dataSize, 40);

let offset = 44;
for (let i = 0; i < totalSamples; i++) {
  buffer.writeInt16LE(Math.floor(Math.max(-1, Math.min(1, left[i])) * 32767), offset);
  buffer.writeInt16LE(Math.floor(Math.max(-1, Math.min(1, right[i])) * 32767), offset + 2);
  offset += 4;
}

const wavPath = path.resolve(audioDir, 'romantic_ambiance.wav');
fs.writeFileSync(wavPath, buffer);
console.log(`[generate-audio] Wrote WAV: ${wavPath} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);

try {
  execSync(`ffmpeg -i "${wavPath}" -codec:a libmp3lame -b:a 192k "${mp3Path}" -y`, { stdio: 'pipe' });
  console.log(`[generate-audio] Encoded MP3: ${mp3Path} (${(fs.statSync(mp3Path).size / 1024).toFixed(1)} KB)`);
  fs.unlinkSync(wavPath);
} catch (err) {
  console.warn(`[generate-audio] ffmpeg encoding failed (${err.message}). Copying WAV as fallback.`);
  fs.copyFileSync(wavPath, mp3Path);
}
