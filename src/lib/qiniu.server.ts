// 七牛云服务端工具：生成上传凭证 + 删除文件（华东区默认，可按需修改 zone）
// 使用 Web Crypto，兼容 Workers / Vercel Edge & Node 18+。

const encoder = new TextEncoder();

async function hmacSha1(secret: string, data: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return new Uint8Array(sig);
}

function urlSafeBase64(input: string | Uint8Array): string {
  const bytes =
    typeof input === "string" ? encoder.encode(input) : input;
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  const b64 =
    typeof btoa !== "undefined"
      ? btoa(bin)
      : Buffer.from(bin, "binary").toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_");
}

function creds() {
  const ak = process.env.QINIU_ACCESS_KEY;
  const sk = process.env.QINIU_SECRET_KEY;
  const bucket = process.env.QINIU_BUCKET;
  if (!ak || !sk || !bucket) {
    throw new Error("七牛云环境变量未配置 (QINIU_ACCESS_KEY/SECRET_KEY/BUCKET)");
  }
  return { ak, sk, bucket };
}

export async function generateUploadToken(opts?: {
  key?: string;
  expiresIn?: number;
}): Promise<string> {
  const { ak, sk, bucket } = creds();
  const scope = opts?.key ? `${bucket}:${opts.key}` : bucket;
  const deadline = Math.floor(Date.now() / 1000) + (opts?.expiresIn ?? 3600);
  const putPolicy = { scope, deadline };
  const encodedPolicy = urlSafeBase64(JSON.stringify(putPolicy));
  const sig = await hmacSha1(sk, encodedPolicy);
  const encodedSign = urlSafeBase64(sig);
  return `${ak}:${encodedSign}:${encodedPolicy}`;
}

async function accessToken(pathAndQuery: string, body = ""): Promise<string> {
  const { ak, sk } = creds();
  const data = `${pathAndQuery}\n${body}`;
  const sig = await hmacSha1(sk, data);
  return `${ak}:${urlSafeBase64(sig)}`;
}

/**
 * 删除七牛云文件。key 为存入七牛云时的文件名（对象 key）。
 * 华东区管理域名 rs.qiniu.com；如你使用其他区域请调整。
 */
export async function deleteQiniuFile(key: string): Promise<void> {
  const { bucket } = creds();
  const encodedEntry = urlSafeBase64(`${bucket}:${key}`);
  const path = `/delete/${encodedEntry}`;
  const token = await accessToken(path);
  const res = await fetch(`https://rs.qiniu.com${path}`, {
    method: "POST",
    headers: { Authorization: `QBox ${token}` },
  });
  if (res.status !== 200 && res.status !== 612) {
    // 612 = 文件不存在，视为已删除
    const txt = await res.text();
    throw new Error(`七牛删除失败 ${res.status}: ${txt}`);
  }
}

/** 从完整 file_url 中提取 key（去掉域名前缀） */
export function extractKeyFromUrl(fileUrl: string): string {
  const domain = process.env.QINIU_DOMAIN ?? "";
  const stripped = domain
    ? fileUrl.replace(/^https?:\/\/[^/]+\//, "")
    : fileUrl;
  return decodeURIComponent(stripped.split("?")[0]);
}
