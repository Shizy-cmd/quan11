// 生成站点图标：从 src/assets/hdsu-su-mark.png（校会标图形标）生成 public/favicon.png 与 public/favicon.ico。
// 用法：node scripts/gen-favicon.mjs
import sharp from "sharp";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const src = resolve("src/assets/hdsu-su-mark.png");
const outDir = resolve("public");
mkdirSync(outDir, { recursive: true });

// PNG 图标（现代浏览器直接读取）：透明底压平为白底，等比放入方形
const pngBuf = await sharp(src)
  .resize(256, 256, { fit: "contain", background: "#ffffff" })
  .flatten({ background: "#ffffff" })
  .png()
  .toBuffer();
writeFileSync(resolve(outDir, "favicon.png"), pngBuf);

// ICO 图标（内嵌 32x32 PNG）
const icoPng = await sharp(src)
  .resize(32, 32, { fit: "contain", background: "#ffffff" })
  .flatten({ background: "#ffffff" })
  .png()
  .toBuffer();
function buildIco(png) {
  // ICO header
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // image count
  // ICO directory entry
  const entry = Buffer.alloc(16);
  entry.writeUInt8(32, 0); // width
  entry.writeUInt8(32, 1); // height
  entry.writeUInt8(0, 2); // color count
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(png.length, 8); // data size
  entry.writeUInt32LE(22, 12); // data offset (6 + 16)
  return Buffer.concat([header, entry, png]);
}

writeFileSync(resolve(outDir, "favicon.ico"), buildIco(icoPng));

console.log("Generated public/favicon.png and public/favicon.ico");
