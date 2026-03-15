/**
 * Gera icon-192.png e icon-512.png sem NENHUMA dependência externa.
 * Funciona no Windows, Mac e Linux com Node.js puro.
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function writePNG(width, height, pixels, filePath) {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    table[i] = c;
  }
  function crc32(buf) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }
  function chunk(type, data) {
    const tb = Buffer.from(type, 'ascii');
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const crcVal = Buffer.alloc(4); crcVal.writeUInt32BE(crc32(Buffer.concat([tb, data])));
    return Buffer.concat([len, tb, data, crcVal]);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 2;
  const raw = Buffer.alloc(height * (1 + width * 3));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 3)] = 0;
    for (let x = 0; x < width; x++) {
      const s = (y * width + x) * 4;
      const d = y * (1 + width * 3) + 1 + x * 3;
      raw[d] = pixels[s]; raw[d+1] = pixels[s+1]; raw[d+2] = pixels[s+2];
    }
  }
  const compressed = zlib.deflateSync(raw);
  fs.writeFileSync(filePath, Buffer.concat([
    Buffer.from([137,80,78,71,13,10,26,10]),
    chunk('IHDR', ihdr), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0))
  ]));
}

function drawIcon(size) {
  const px = new Uint8Array(size * size * 4);
  const cr = size * 0.18;
  const [gr, gg, gb] = [0, 232, 122];

  function set(x, y, r, g, b) {
    if (x < 0 || x >= size || y < 0 || y >= size) return;
    const i = (y * size + x) * 4;
    px[i] = r; px[i+1] = g; px[i+2] = b; px[i+3] = 255;
  }

  function inRR(x, y) {
    if (x < 0 || x >= size || y < 0 || y >= size) return false;
    if (x < cr && y < cr) return Math.hypot(x - cr, y - cr) <= cr;
    if (x > size-1-cr && y < cr) return Math.hypot(x-(size-1-cr), y-cr) <= cr;
    if (x < cr && y > size-1-cr) return Math.hypot(x-cr, y-(size-1-cr)) <= cr;
    if (x > size-1-cr && y > size-1-cr) return Math.hypot(x-(size-1-cr), y-(size-1-cr)) <= cr;
    return true;
  }

  const s = size;
  const bx = Math.round(s*0.28), bw = Math.round(s*0.12);
  const by = Math.round(s*0.20), bh = Math.round(s*0.60);
  const px2 = bx+bw, pw = Math.round(s*0.22), ph = Math.round(s*0.32);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!inRR(x, y)) continue;
      set(x, y, 10, 10, 10);

      // vertical bar
      if (x >= bx && x < bx+bw && y >= by && y < by+bh) { set(x,y,gr,gg,gb); continue; }
      // top cap
      if (x >= px2 && x < px2+pw && y >= by && y < by+bw) { set(x,y,gr,gg,gb); continue; }
      // bottom cap
      if (x >= px2 && x < px2+pw && y >= by+ph-bw && y < by+ph) { set(x,y,gr,gg,gb); continue; }
      // right rounded end
      const cx2 = px2+pw, cy2 = by+ph/2, rr2 = ph/2;
      if (x >= px2+pw && Math.hypot(x-cx2, y-cy2) <= rr2 && y >= by && y < by+ph) { set(x,y,gr,gg,gb); }
    }
  }
  return px;
}

const outDir = path.join(__dirname, 'public', 'icons');
fs.mkdirSync(outDir, { recursive: true });
[192, 512].forEach(size => {
  const filePath = path.join(outDir, `icon-${size}.png`);
  writePNG(size, size, drawIcon(size), filePath);
  console.log(`✓ icon-${size}.png (${fs.statSync(filePath).size} bytes)`);
});
console.log('\nPronto! Sem dependências externas.');
