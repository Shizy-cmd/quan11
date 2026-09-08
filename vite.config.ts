import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// 在本地开发/预览时加载 .dev.vars（与 wrangler dev 行为一致），
// 让 R2 / 飞书 / 管理员密码等环境变量在 vite dev 里也能生效。
function loadDevVars() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".dev.vars"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const cleaned = line.trim();
      if (!cleaned || cleaned.startsWith("#")) continue;
      const eq = cleaned.indexOf("=");
      if (eq === -1) continue;
      const key = cleaned.slice(0, eq).trim();
      const value = cleaned.slice(eq + 1).trim();
      if (key && !(key in process.env)) process.env[key] = value;
    }
  } catch {
    /* 没有 .dev.vars 时忽略 */
  }
}

loadDevVars();

export default defineConfig({
  plugins: [
    tanstackStart({
      // 服务端入口指向 src/server.ts（SSR 错误包装），nitro/vite 基于此构建
      server: { entry: "server" },
      importProtection: {
        behavior: "error",
        client: {
          files: ["**/server/**"],
          specifiers: ["server-only"],
        },
      },
    }),
    nitro({
      // Cloudflare Workers 部署目标
      defaultPreset: "cloudflare-module",
    }),
    react(),
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
  ],
  resolve: {
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
  server: {
    host: "::",
    port: 8080,
    watch: {
      ignored: ["**/.output/**", "**/.wrangler/**", "**/node_modules/.nitro/**", "**/dist/**"],
    },
  },
});
