// ─────────────────────────────────────────────────────────────────────────────
//  kafaah · make-assets.mjs — يولّد أيقونات PWA وصورة المشاركة PNG من SVG
//  التشغيل: node scripts/make-assets.mjs
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUB = path.join(__dirname, '..', 'public');

const icon = fs.readFileSync(path.join(PUB, 'icon.svg'));
const maskable = fs.readFileSync(path.join(PUB, 'icon-maskable.svg'));

const ogSvg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0f766e"/><stop offset="1" stop-color="#062925"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f0c069"/><stop offset="1" stop-color="#c8963e"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <circle cx="1080" cy="90" r="240" fill="#14b8a6" opacity="0.18"/>
  <circle cx="120" cy="600" r="200" fill="#c8963e" opacity="0.14"/>
  <g transform="translate(96,150)">
    <rect width="150" height="150" rx="38" fill="#0b3d38" stroke="rgba(255,255,255,0.16)" stroke-width="3"/>
    <rect x="30" y="86" width="18" height="34" rx="7" fill="#fff" opacity="0.92"/>
    <rect x="60" y="68" width="18" height="52" rx="7" fill="#fff" opacity="0.96"/>
    <rect x="90" y="48" width="18" height="72" rx="7" fill="#fff"/>
    <path d="M36 62 L58 84 L120 26" fill="none" stroke="url(#gold)" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <text x="96" y="400" fill="#ffffff" font-family="Arial, sans-serif" font-size="96" font-weight="800">KAFA'AH</text>
  <text x="96" y="470" fill="#9fd8d1" font-family="Arial, sans-serif" font-size="38" font-weight="600">Professional Licensure Exam Platform</text>
  <text x="96" y="524" fill="#7fc7bf" font-family="Arial, sans-serif" font-size="30">Medical · Engineering · Law · Finance · Education</text>
</svg>`;

async function main() {
  const jobs = [
    [icon, 'icon-192.png', 192],
    [icon, 'icon-512.png', 512],
    [icon, 'apple-touch-icon.png', 180],
    [maskable, 'icon-512-maskable.png', 512],
  ];
  for (const [buf, name, size] of jobs) {
    await sharp(buf, { density: 400 }).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(path.join(PUB, name));
    console.log('✓', name);
  }
  await sharp(Buffer.from(ogSvg)).png().toFile(path.join(PUB, 'og.png'));
  console.log('✓ og.png');

  // أيقونة صغيرة للمتصفح
  await sharp(icon, { density: 400 }).resize(48, 48).png().toFile(path.join(PUB, 'favicon-48.png'));
  console.log('✓ favicon-48.png');
}

main().catch((e) => { console.error(e); process.exit(1); });
