/**
 * 管理员鉴权。
 *
 * 密码只从环境变量 ADMIN_PASSWORD 读取：
 * - 线上：Cloudflare Worker Secret（`wrangler secret put ADMIN_PASSWORD` 或后台 Secret）
 * - 本地：.dev.vars（已被 .gitignore 忽略）
 *
 * 这里刻意不提供兜底密码：未配置 ADMIN_PASSWORD 时一律拒绝，
 * 避免源码里出现明文密码，也避免“忘记配置 Secret 就退回到某个固定密码”。
 */

const ADMIN_HEADER = "x-admin-password";

export function getAdminPassword(): string | null {
  const raw = process.env.ADMIN_PASSWORD;
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  return value ? value : null;
}

/** 定长逐字节比较，避免提前 return 带来的时间差。 */
function safeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const left = encoder.encode(a);
  const right = encoder.encode(b);
  let diff = left.length ^ right.length;
  const len = Math.max(left.length, right.length);
  for (let i = 0; i < len; i += 1) {
    diff |= (left[i % left.length] ?? 0) ^ (right[i % right.length] ?? 0);
  }
  return diff === 0;
}

/** 校验候选密码（登录接口的请求体用）。 */
export function verifyAdminPassword(candidate: unknown): boolean {
  const expected = getAdminPassword();
  if (!expected) return false;
  if (typeof candidate !== "string" || candidate.length === 0) return false;
  return safeEqual(candidate, expected);
}

/** 校验请求头 `X-Admin-Password`（其余管理接口用）。 */
export function isAdminRequest(request: Request): boolean {
  return verifyAdminPassword(request.headers.get(ADMIN_HEADER));
}
