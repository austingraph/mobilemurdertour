#!/usr/bin/env node
/**
 * Generates assets/ghost.png — a translucent spectral figure used by the
 * camera "apparition" overlay. Pure Node (zlib only), no image libraries.
 * Re-run after tweaking:  node scripts/generate-ghost.js
 * Replace assets/ghost.png with real artwork whenever you have some.
 */
const zlib = require("zlib");
const fs = require("fs");
const path = require("path");

const W = 512;
const H = 768;

// --- PNG plumbing -----------------------------------------------------------
const crcTable = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc32(buf) {
  let c = ~0;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return ~c >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

// --- Draw the apparition ----------------------------------------------------
const gauss = (d2, sigma) => Math.exp(-d2 / (2 * sigma * sigma));
const px = Buffer.alloc(W * H * 4);

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    // Wispy vertical sway so the silhouette isn't a rigid bell curve.
    const sway = 26 * Math.sin(y / 55) + 12 * Math.sin(y / 23 + 1.7);
    const cx = W / 2 + sway * (y / H);

    // Head
    const hd2 = (x - cx) ** 2 + (y - 195) ** 2;
    let a = gauss(hd2, 78);

    // Body: widens from the neck then frays toward the hem.
    if (y > 230) {
      const t = (y - 230) / (H - 230); // 0 at neck, 1 at bottom
      const width = (70 + 90 * Math.min(1, t * 1.6)) * 0.55;
      const bodyA =
        gauss((x - cx) ** 2, width) *
        (t < 0.72 ? 1 : Math.max(0, 1 - (t - 0.72) / 0.28)); // fade the hem
      a = Math.max(a, bodyA * 0.92);
    }

    // Ragged hem: tear the bottom into streamers.
    if (y > H * 0.62) {
      const tear =
        0.55 +
        0.45 * Math.sin(x / 17 + y / 90) * Math.sin(x / 41 - y / 130);
      a *= Math.max(0, Math.min(1, tear + (1 - y / H) * 1.2));
    }

    // Eyes: two voids in the head.
    const eyeL = gauss((x - (cx - 34)) ** 2 + (y - 190) ** 2, 13);
    const eyeR = gauss((x - (cx + 34)) ** 2 + (y - 190) ** 2, 13);
    const mouth = gauss((x - cx) ** 2 / 1.8 + (y - 248) ** 2, 14);
    const voids = Math.min(1, eyeL + eyeR + mouth * 0.8);

    const alpha = Math.round(215 * Math.min(1, a) * (1 - voids * 0.92));
    const i = (y * W + x) * 4;
    // Cold moonlit white, slightly blue.
    px[i] = 208;
    px[i + 1] = 222;
    px[i + 2] = 238;
    px[i + 3] = alpha;
  }
}

// --- Encode -----------------------------------------------------------------
const raw = Buffer.alloc((W * 4 + 1) * H);
for (let y = 0; y < H; y++) {
  raw[y * (W * 4 + 1)] = 0; // filter: none
  px.copy(raw, y * (W * 4 + 1) + 1, y * W * 4, (y + 1) * W * 4);
}
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 6; // RGBA
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", ihdr),
  chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
  chunk("IEND", Buffer.alloc(0)),
]);

const out = path.join(__dirname, "..", "assets", "ghost.png");
fs.writeFileSync(out, png);
console.log(`wrote ${out} (${(png.length / 1024).toFixed(1)} kB)`);
