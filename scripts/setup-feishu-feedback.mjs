#!/usr/bin/env node
// 在飞书多维表格 App 中创建「权益反馈」表及其字段，并输出 table_id。
// 用法：node scripts/setup-feishu-feedback.mjs
// 前提：.dev.vars 已配置 FEISHU_APP_ID / FEISHU_APP_SECRET / FEISHU_APP_TOKEN

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const BASE = "https://open.feishu.cn/open-apis";
const TABLE_NAME = "权益反馈";

const FEEDBACK_FIELDS = [
  { name: "单号", type: 1 },
  { name: "姓名", type: 1 },
  { name: "联系方式", type: 1 },
  {
    name: "问题类型",
    type: 3,
    options: ["学生公寓", "教学楼", "食堂", "教育超市", "校园环境", "图书馆", "其他"],
  },
  { name: "发生时间", type: 5 },
  { name: "问题描述", type: 1 },
  { name: "附件", type: 15 },
  { name: "状态", type: 3, options: ["待处理", "处理中", "已办结"] },
  { name: "提交时间", type: 5 },
  { name: "处理备注", type: 1 },
];

function loadEnv() {
  const path = fileURLToPath(new URL("../.dev.vars", import.meta.url));
  const raw = readFileSync(path, "utf8");
  const out = {};
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#") || !t.includes("=")) continue;
    const idx = t.indexOf("=");
    out[t.slice(0, idx).trim()] = t.slice(idx + 1).trim();
  }
  return out;
}

async function dotEnvFetch(env, method, url, body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${url}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (json.code !== 0) {
    const err = new Error(`飞书接口 ${method} ${url} 失败 [${json.code}]: ${json.msg}`);
    err.code = json.code;
    err.msg = json.msg;
    throw err;
  }
  return json;
}

async function main() {
  const env = loadEnv();
  const {
    FEISHU_APP_ID,
    FEISHU_APP_SECRET,
    FEISHU_APP_TOKEN,
    FEISHU_FEEDBACK_APP_TOKEN,
    FEISHU_FEEDBACK_TABLE_ID,
  } = env;
  if (!FEISHU_APP_ID || !FEISHU_APP_SECRET || !FEISHU_APP_TOKEN) {
    throw new Error("FEISHU_APP_ID / FEISHU_APP_SECRET / FEISHU_APP_TOKEN 未在 .dev.vars 配置");
  }
  // 反馈使用独立 base（若配置），否则退回指南所在的 app
  const appToken = FEISHU_FEEDBACK_APP_TOKEN || FEISHU_APP_TOKEN;

  const auth = await dotEnvFetch(
    env,
    "POST",
    "/auth/v3/tenant_access_token/internal",
    { app_id: FEISHU_APP_ID, app_secret: FEISHU_APP_SECRET },
  );
  const token = auth.tenant_access_token;

  // 1. 确定 feedback 表：优先用已配置的 table_id；否则在该 base 内按名称查找 / 尝试创建
  let tableId = FEISHU_FEEDBACK_TABLE_ID;
  const tableList = await dotEnvFetch(
    env,
    "GET",
    `/bitable/v1/apps/${appToken}/tables?page_size=100`,
    null,
    token,
  );
  const tables = tableList.data?.items ?? [];
  if (!tableId) {
    tableId = tables.find((t) => t.name === TABLE_NAME)?.table_id;
  }

  if (!tableId) {
    try {
      const created = await dotEnvFetch(env, "POST", `/bitable/v1/apps/${appToken}/tables`, {
        table: {
          name: TABLE_NAME,
          default_view_name: "表格",
          fields: [{ field_name: "单号", type: 1 }],
        },
      }, token);
      tableId = created.data?.table_id;
      console.log(`已创建表「${TABLE_NAME}」：${tableId}`);
    } catch (err) {
      if (err.code === 1254302 || /RolePermNotAllow|没有.*权限|权限/.test(String(err.msg))) {
        console.error(`\n✖ 当前应用无「新建数据表」权限（角色权限不足，code=1254302）。`);
        console.error("两种解决方案任选其一：");
        console.error("  方案 A（推荐）：直接在飞书多维表格 App 里手动新建一张「权益反馈」表，");
        console.error("       按说明建好 10 个字段，然后把该表的 table_id 填入 FEISHU_FEEDBACK_TABLE_ID。");
        console.error("  方案 B：在飞书开发者后台给应用勾选「多维表格」下的 `bitable:app`（管理) 权限后重新运行本脚本。");
        process.exit(1);
      }
      throw err;
    }
  } else if (!FEISHU_FEEDBACK_TABLE_ID) {
    console.log(`表「${TABLE_NAME}」已存在：${tableId}`);
  } else {
    console.log(`使用已配置反馈表：${tableId}（位于 base ${appToken}）`);
  }

  // 2. 确保字段齐全（新增字段同样需要管理权限，无权限时仅提示）
  try {
    const fieldList = await dotEnvFetch(
      env,
      "GET",
      `/bitable/v1/apps/${appToken}/tables/${tableId}/fields?page_size=500`,
      null,
      token,
    );
    const existing = new Map(
      (fieldList.data?.items ?? []).map((f) => [f.field_name, f.type]),
    );

    for (const field of FEEDBACK_FIELDS) {
      const existingType = existing.get(field.name);
      if (existingType !== undefined) {
        const typeName = { 1: "文本", 3: "单选", 5: "日期", 15: "超链接" }[existingType];
        console.log(`字段「${field.name}」(type ${existingType} / ${typeName ?? "未知"}) 已存在，跳过`);
        continue;
      }
      const body = { field_name: field.name, type: field.type };
      if (field.type === 3) {
        body.property = { options: field.options.map((name) => ({ name })) };
      }
      await dotEnvFetch(
        env,
        "POST",
        `/bitable/v1/apps/${appToken}/tables/${tableId}/fields`,
        body,
        token,
      );
      console.log(`已添加字段「${field.name}」`);
    }
  } catch (err) {
    if (err.code === 1254302 || /RolePermNotAllow|没有.*权限|权限/.test(String(err.msg))) {
      console.warn(`\n⚠ 无法自动补齐字段（无管理权限）。若表是手动创建的，请手工添加以下字段：`);
      for (const f of FEEDBACK_FIELDS) {
        const t = { 1: "文本", 3: "单选", 5: "日期", 15: "超链接" }[f.type];
        const opts = f.options ? `（${f.options.join("/")}）` : "";
        console.warn(`   - ${f.name}：${t}${opts}`);
      }
    } else {
      throw err;
    }
  }

  console.log("\n✔ 完成。请在 .dev.vars 中设置：");
  console.log(`FEISHU_FEEDBACK_APP_TOKEN=${appToken}`);
  console.log(`FEISHU_FEEDBACK_TABLE_ID=${tableId}`);
  console.log("并在部署时以 secret/vars 提供同名变量。");
}

main().catch((err) => {
  console.error(`\n✖ ${err.message}`);
  console.error("请确认：① 应用已开通「多维表格」权限；② .dev.vars 配置正确。");
  process.exit(1);
});
