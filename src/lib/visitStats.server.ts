// 访问统计：以云存储（R2）上的单个 JSON 对象作为轻量计数器。
//
// 只保存聚合数字与「访客标识的哈希」，不保存原始访客标识、IP 或 UA；
// 对象即使被公开读取，也无法还原到具体的人。
// 仅在服务器路由中使用。

import { getObjectFromR2, uploadToR2 } from "@/lib/r2.server";
import type { VisitDayPoint, VisitPageRow, VisitStatsSummary } from "@/lib/visitData";

const STATS_KEY = "stats/visits.json";
/** 明细保留天数 */
const KEEP_DAYS = 90;
/** 终身去重访客上限（超出后不再计入新增访客，避免对象无限增长） */
const MAX_VISITOR_HASHES = 5000;
/** 单日去重访客上限 */
const MAX_DAY_VISITOR_HASHES = 1000;
/** 路径维度最多保留的条目数 */
const MAX_PAGE_KEYS = 60;

type DayRecord = {
  pageviews: number;
  visitorHashes: string[];
};

type StoredStats = {
  version: 1;
  since: string;
  updatedAt: string;
  pageviews: number;
  visitorHashes: string[];
  days: Record<string, DayRecord>;
  pages: Record<string, number>;
};

/** 北京时间（UTC+8）的 YYYY-MM-DD */
function beijingDay(now: Date): string {
  return new Date(now.getTime() + 8 * 3600 * 1000).toISOString().slice(0, 10);
}

function shiftDay(day: string, delta: number): string {
  const d = new Date(`${day}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

function emptyStats(now: Date): StoredStats {
  return {
    version: 1,
    since: now.toISOString(),
    updatedAt: now.toISOString(),
    pageviews: 0,
    visitorHashes: [],
    days: {},
    pages: {},
  };
}

function num(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

function strList(value: unknown, cap: number): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((x): x is string => typeof x === "string").slice(0, cap);
}

/** 兼容字段缺失 / 手工改坏的对象，保证读回的结构可用。 */
function normalize(raw: unknown, now: Date): StoredStats {
  const base = emptyStats(now);
  if (!raw || typeof raw !== "object") return base;
  const o = raw as Partial<StoredStats>;

  const days: Record<string, DayRecord> = {};
  if (o.days && typeof o.days === "object") {
    for (const [day, value] of Object.entries(o.days)) {
      const d = (value ?? {}) as Partial<DayRecord>;
      days[day] = {
        pageviews: num(d.pageviews),
        visitorHashes: strList(d.visitorHashes, MAX_DAY_VISITOR_HASHES),
      };
    }
  }

  const pages: Record<string, number> = {};
  if (o.pages && typeof o.pages === "object") {
    for (const [path, count] of Object.entries(o.pages)) {
      pages[path] = num(count);
    }
  }

  return {
    version: 1,
    since: typeof o.since === "string" ? o.since : base.since,
    updatedAt: typeof o.updatedAt === "string" ? o.updatedAt : base.updatedAt,
    pageviews: num(o.pageviews),
    visitorHashes: strList(o.visitorHashes, MAX_VISITOR_HASHES),
    days,
    pages,
  };
}

/**
 * 读取统计对象。对象不存在时返回 null；凭据缺失 / 网络异常时抛出，
 * 由调用方决定是「静默忽略」还是「向管理员报错」。
 */
async function loadStats(): Promise<StoredStats | null> {
  const raw = await getObjectFromR2(STATS_KEY);
  if (!raw) return null;
  try {
    return normalize(JSON.parse(raw), new Date());
  } catch {
    return null;
  }
}

async function saveStats(stats: StoredStats): Promise<void> {
  await uploadToR2({
    key: STATS_KEY,
    body: new TextEncoder().encode(JSON.stringify(stats)),
    contentType: "application/json; charset=utf-8",
  });
}

/** 访客标识的短哈希（只用于去重，不可逆推）。 */
async function visitorHash(visitorId: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`hdsu-visit:${visitorId}`),
  );
  const hex = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hex.slice(0, 16);
}

/** 归一化路径：去掉查询串、结尾斜杠与超长内容。 */
export function normalizePath(raw: unknown): string {
  if (typeof raw !== "string") return "/";
  const path = raw.split("?")[0].split("#")[0].trim();
  if (!path.startsWith("/")) return "/";
  const trimmed = path.length > 1 ? path.replace(/\/+$/, "") : path;
  return (trimmed || "/").slice(0, 120);
}

/**
 * 记录一次访问（页面浏览量 + 访客去重）。失败只返回错误，不抛出，
 * 避免影响访客本身的浏览体验。
 */
export async function recordVisit(input: {
  path: string;
  visitorId?: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const now = new Date();
    const today = beijingDay(now);
    const path = normalizePath(input.path);
    const hash = input.visitorId ? await visitorHash(input.visitorId) : "";

    const stats = (await loadStats()) ?? emptyStats(now);

    stats.pageviews += 1;
    if (hash && !stats.visitorHashes.includes(hash)) {
      if (stats.visitorHashes.length < MAX_VISITOR_HASHES) {
        stats.visitorHashes.push(hash);
      }
    }

    const day = stats.days[today] ?? { pageviews: 0, visitorHashes: [] };
    day.pageviews += 1;
    if (hash && !day.visitorHashes.includes(hash)) {
      if (day.visitorHashes.length < MAX_DAY_VISITOR_HASHES) {
        day.visitorHashes.push(hash);
      }
    }
    stats.days[today] = day;

    stats.pages[path] = (stats.pages[path] ?? 0) + 1;

    // 清理：过期明细与超出上限的路径
    const oldest = shiftDay(today, -KEEP_DAYS);
    for (const key of Object.keys(stats.days)) {
      if (key < oldest) delete stats.days[key];
    }
    const pageKeys = Object.keys(stats.pages);
    if (pageKeys.length > MAX_PAGE_KEYS) {
      pageKeys
        .sort((a, b) => stats.pages[a] - stats.pages[b])
        .slice(0, pageKeys.length - MAX_PAGE_KEYS)
        .forEach((k) => delete stats.pages[k]);
    }

    stats.updatedAt = now.toISOString();
    await saveStats(stats);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "统计失败" };
  }
}

/** 汇总统计，供管理后台展示。读取失败时抛出，便于后台提示配置问题。 */
export async function readVisitStats(days = 14): Promise<VisitStatsSummary> {
  const now = new Date();
  const today = beijingDay(now);
  const stats = (await loadStats()) ?? emptyStats(now);

  const daily: VisitDayPoint[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const day = shiftDay(today, -i);
    const record = stats.days[day];
    daily.push({
      date: day,
      pageviews: record?.pageviews ?? 0,
      visitors: record?.visitorHashes.length ?? 0,
    });
  }

  const week = daily.slice(-7);
  const topPages: VisitPageRow[] = Object.entries(stats.pages)
    .map(([path, pageviews]) => ({ path, pageviews }))
    .sort((a, b) => b.pageviews - a.pageviews)
    .slice(0, 6);

  const todayRecord = stats.days[today];
  const hasData = stats.pageviews > 0 || Object.keys(stats.days).length > 0 || topPages.length > 0;

  return {
    since: stats.since,
    updatedAt: hasData ? stats.updatedAt : null,
    totalPageviews: stats.pageviews,
    totalVisitors: stats.visitorHashes.length,
    todayPageviews: todayRecord?.pageviews ?? 0,
    todayVisitors: todayRecord?.visitorHashes.length ?? 0,
    weekPageviews: week.reduce((n, d) => n + d.pageviews, 0),
    weekVisitors: week.reduce((n, d) => n + d.visitors, 0),
    daily,
    topPages,
  };
}
