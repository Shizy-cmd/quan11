// Cloudflare R2 上传客户端（S3 兼容 API + SigV4 签名，无第三方依赖）
// 仅在服务器路由中使用，兼容 Cloudflare Workers 与 Node 18+ 运行时。

const encoder = new TextEncoder();

function toArrayBuffer(data: string | Uint8Array): ArrayBuffer {
  if (typeof data === "string") {
    return encoder.encode(data).buffer as ArrayBuffer;
  }
  return data.buffer.slice(
    data.byteOffset,
    data.byteOffset + data.byteLength,
  ) as ArrayBuffer;
}

function toHex(bytes: Uint8Array): string {
  let out = "";
  for (const byte of bytes) {
    out += byte.toString(16).padStart(2, "0");
  }
  return out;
}

async function sha256Hex(data: string | Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", toArrayBuffer(data));
  return toHex(new Uint8Array(digest));
}

async function hmac(
  key: Uint8Array,
  data: string | Uint8Array,
): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    toArrayBuffer(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    toArrayBuffer(data),
  );
  return new Uint8Array(signature);
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} 未配置`);
  return value;
}

/**
 * 将文件上传到 Cloudflare R2（S3 兼容端点）。
 * 返回公开访问 URL；若未配置 R2_PUBLIC_BASE_URL，则退回 S3 端点地址
 * （该地址需鉴权，建议在 Cloudflare 后台开启 Bucket 公开访问后配置）。
 */
export async function uploadToR2(params: {
  key: string;
  body: ArrayBuffer | Uint8Array;
  contentType: string;
}): Promise<string> {
  const accountId = requireEnv("R2_ACCOUNT_ID");
  const accessKeyId = requireEnv("R2_ACCESS_KEY_ID");
  const secretAccessKey = requireEnv("R2_SECRET_ACCESS_KEY");
  const bucket = requireEnv("R2_BUCKET_NAME");

  const bodyBytes =
    params.body instanceof Uint8Array
      ? params.body
      : new Uint8Array(params.body);
  const payloadHash = await sha256Hex(bodyBytes);

  const host = `${accountId}.r2.cloudflarestorage.com`;
  const path = `/${bucket}/${params.key}`;
  const url = `https://${host}${path}`;

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const region = "auto";

  const headers: Record<string, string> = {
    host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
    "content-type": params.contentType || "application/octet-stream",
  };

  const signedHeaderNames = Object.keys(headers).sort();
  const canonicalHeaders =
    signedHeaderNames.map((name) => `${name}:${headers[name]}`).join("\n") +
    "\n";
  const signedHeaders = signedHeaderNames.join(";");

  const canonicalRequest = [
    "PUT",
    path,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const scope = `${dateStamp}/${region}/s3/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    scope,
    await sha256Hex(canonicalRequest),
  ].join("\n");

  const kDate = await hmac(encoder.encode(`AWS4${secretAccessKey}`), dateStamp);
  const kRegion = await hmac(kDate, region);
  const kService = await hmac(kRegion, "s3");
  const kSigning = await hmac(kService, "aws4_request");
  const signature = toHex(await hmac(kSigning, stringToSign));

  const authorization =
    `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${scope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: { ...headers, authorization },
    body: toArrayBuffer(bodyBytes),
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300);
    throw new Error(`R2 上传失败（${response.status}）: ${detail}`);
  }

  const publicBase = process.env.R2_PUBLIC_BASE_URL?.replace(/\/+$/, "");
  return publicBase ? `${publicBase}/${params.key}` : url;
}
