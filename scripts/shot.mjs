import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const DEBUG_PORT = 9666;
const profile = mkdtempSync(join(tmpdir(), "shot-"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${profile}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-gpu",
    "--no-sandbox",
    "--disable-software-rasterizer",
    "--disable-dev-shm-usage",
    "--remote-allow-origins=*",
    "about:blank",
  ],
  { stdio: "ignore" },
);

let ws;
let seq = 0;
const pending = new Map();

function send(method, params = {}) {
  const id = ++seq;
  ws.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    setTimeout(() => {
      if (pending.has(id)) {
        pending.delete(id);
        reject(new Error(`timeout: ${method}`));
      }
    }, 30000);
  });
}

async function targets() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
      if (res.ok) {
        const list = await res.json();
        const page = list.find((t) => t.type === "page");
        if (page) return page;
      }
    } catch {
      /* not ready */
    }
    await sleep(300);
  }
  throw new Error("chrome target not ready");
}

async function connect() {
  const page = await targets();
  ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const p = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) p.reject(new Error(msg.error.message));
      else p.resolve(msg.result);
    }
  };
  await send("Page.enable");
  await send("Runtime.enable");
}

async function shot(url, outFull, outTop, width, height, mobile, scale) {
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: scale,
    mobile,
  });
  await send("Page.navigate", { url });
  await sleep(2600);
  const { result } = await send("Runtime.evaluate", {
    expression: "document.documentElement.scrollHeight",
    returnByValue: true,
  });
  const total = result.value;
  for (let y = 0; y <= total; y += Math.max(400, Math.floor(height * 0.6))) {
    await send("Runtime.evaluate", { expression: `window.scrollTo(0, ${y})` });
    await sleep(230);
  }
  await sleep(600);
  await send("Runtime.evaluate", { expression: "window.scrollTo(0, 0)" });
  await sleep(800);
  const full = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
    fromSurface: true,
  });
  writeFileSync(outFull, Buffer.from(full.data, "base64"));
  const top = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(outTop, Buffer.from(top.data, "base64"));
  console.log(`saved ${outFull}`);
}

const outDir = resolve(process.argv[2] ?? ".");
const base = "http://localhost:8080";
try {
  await connect();
  await shot(
    `${base}/`,
    resolve(outDir, "home-desktop-full.png"),
    resolve(outDir, "home-desktop.png"),
    1440,
    900,
    false,
    1,
  );
  await shot(
    `${base}/`,
    resolve(outDir, "home-mobile-full.png"),
    resolve(outDir, "home-mobile.png"),
    375,
    812,
    true,
    2,
  );
  await shot(
    `${base}/guide`,
    resolve(outDir, "guide-desktop-full.png"),
    resolve(outDir, "guide-desktop.png"),
    1440,
    900,
    false,
    1,
  );
  await shot(
    `${base}/guide`,
    resolve(outDir, "guide-mobile-full.png"),
    resolve(outDir, "guide-mobile.png"),
    375,
    812,
    true,
    2,
  );
} finally {
  chrome.kill();
  try {
    ws?.close();
  } catch {
    /* ignore */
  }
}
