// Generates the favicon assets from the Necroloto brand mark (the neon
// "space invader" rendered in the TopBar Logo — see src/components/layout/Logo.tsx).
// Pure Node (zlib for PNG) so it needs no extra deps. Run: node scripts/generate-favicon.mjs
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const PUBLIC_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

// Classic 11×8 invader, mirrored from Logo.tsx.
const INVADER = [
    '00100000100',
    '00010001000',
    '00111111100',
    '01101110110',
    '11111111111',
    '10111111101',
    '10100000101',
    '00011011000',
];
const COLS = INVADER[0].length; // 11
const ROWS = INVADER.length; // 8

// Brand palette (src/styles/globals.css): neon green on near-black.
const NEON = [0x39, 0xff, 0x6a];
const BG = [0x0b, 0x0b, 0x0f];

const filled = (cx, cy) => INVADER[cy]?.[cx] === '1';

// ---- SVG (primary, scalable, with a soft neon glow) -------------------------
function buildSvg() {
    const pad = 3; // breathing room around the mark, in cell units
    const w = COLS + pad * 2;
    const h = ROWS + pad * 2;
    const side = Math.max(w, h);
    const ox = pad + (side - w) / 2;
    const oy = pad + (side - h) / 2;
    const rects = INVADER.flatMap((line, y) =>
        line
            .split('')
            .flatMap((c, x) =>
                c === '1' ? [`<rect x="${ox + x}" y="${oy + y}" width="1" height="1"/>`] : [],
            ),
    ).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${side} ${side}" width="${side}" height="${side}">
  <defs>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="0.5" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="${side}" height="${side}" rx="3" fill="#0B0B0F"/>
  <g fill="#39ff6a" filter="url(#glow)">${rects}</g>
</svg>
`;
}

// ---- PNG (fallback for clients without SVG-favicon support) -----------------
function crc32(buf) {
    let c = ~0;
    for (let i = 0; i < buf.length; i++) {
        c ^= buf[i];
        for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
    }
    return ~c >>> 0;
}
function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const body = Buffer.concat([typeBuf, data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body), 0);
    return Buffer.concat([len, body, crc]);
}
function buildPng(size) {
    // Nearest-neighbour scale of the centred invader onto a square canvas.
    const pad = 3;
    const grid = Math.max(COLS, ROWS) + pad * 2;
    const cell = size / grid;
    const ox = pad + (grid - 2 * pad - COLS) / 2;
    const oy = pad + (grid - 2 * pad - ROWS) / 2;
    const raw = Buffer.alloc((size * 4 + 1) * size);
    let p = 0;
    for (let y = 0; y < size; y++) {
        raw[p++] = 0; // filter: none
        for (let x = 0; x < size; x++) {
            const cx = Math.floor(x / cell - ox);
            const cy = Math.floor(y / cell - oy);
            const on = cx >= 0 && cx < COLS && cy >= 0 && cy < ROWS && filled(cx, cy);
            const [r, g, b] = on ? NEON : BG;
            raw[p++] = r;
            raw[p++] = g;
            raw[p++] = b;
            raw[p++] = 255;
        }
    }
    const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(size, 0);
    ihdr.writeUInt32BE(size, 4);
    ihdr[8] = 8; // bit depth
    ihdr[9] = 6; // colour type RGBA
    return Buffer.concat([
        sig,
        chunk('IHDR', ihdr),
        chunk('IDAT', deflateSync(raw, { level: 9 })),
        chunk('IEND', Buffer.alloc(0)),
    ]);
}

writeFileSync(join(PUBLIC_DIR, 'favicon.svg'), buildSvg());
writeFileSync(join(PUBLIC_DIR, 'favicon-32.png'), buildPng(32));
writeFileSync(join(PUBLIC_DIR, 'apple-touch-icon.png'), buildPng(180));
// PWA install icons (manifest). The mark sits on the full near-black canvas, so
// the same render doubles as a `maskable` icon (background fills the safe zone).
writeFileSync(join(PUBLIC_DIR, 'pwa-192.png'), buildPng(192));
writeFileSync(join(PUBLIC_DIR, 'pwa-512.png'), buildPng(512));
writeFileSync(join(PUBLIC_DIR, 'pwa-512-maskable.png'), buildPng(512));
console.log(
    'favicon.svg, favicon-32.png, apple-touch-icon.png, pwa-192/512/512-maskable.png written to public/',
);
