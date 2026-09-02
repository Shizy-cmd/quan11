// 飞书多维表格轻量客户端（fetch 版，兼容 Cloudflare Workers / Vercel Edge & Node）
// 仅在服务器路由中使用。

const FEISHU_BASE = "https://open.feishu.cn/open-apis";

let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getTenantAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60_000) {
    return cachedToken.token;
  }
  const appId = process.env.FEISHU_APP_ID;
  const appSecret = process.env.FEISHU_APP_SECRET;
  if (!appId || !appSecret) {
    throw new Error("FEISHU_APP_ID / FEISHU_APP_SECRET 未配置");
  }
  const res = await fetch(`${FEISHU_BASE}/auth/v3/tenant_access_token/internal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
  });
  const json = (await res.json()) as {
    code: number;
    msg: string;
    tenant_access_token?: string;
    expire?: number;
  };
  if (json.code !== 0 || !json.tenant_access_token) {
    throw new Error(`飞书鉴权失败: ${json.msg}`);
  }
  cachedToken = {
    token: json.tenant_access_token,
    expiresAt: now + (json.expire ?? 7200) * 1000,
  };
  return cachedToken.token;
}

function tableEndpoint(path: string, appToken?: string, tableId?: string) {
  const app = appToken ?? process.env.FEISHU_APP_TOKEN;
  const tid = tableId ?? process.env.FEISHU_TABLE_ID;
  if (!app || !tid) {
    throw new Error("FEISHU_APP_TOKEN / FEISHU_TABLE_ID 未配置");
  }
  return `${FEISHU_BASE}/bitable/v1/apps/${app}/tables/${tid}${path}`;
}

export type FeishuRecord = {
  record_id: string;
  fields: Record<string, unknown>;
};

export async function listRecords(
  tableId?: string,
  appToken?: string,
): Promise<FeishuRecord[]> {
  const token = await getTenantAccessToken();
  const all: FeishuRecord[] = [];
  let pageToken: string | undefined;
  do {
    const url = new URL(tableEndpoint("/records", appToken, tableId));
    url.searchParams.set("page_size", "500");
    if (pageToken) url.searchParams.set("page_token", pageToken);
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = (await res.json()) as {
      code: number;
      msg: string;
      data?: {
        items?: FeishuRecord[];
        page_token?: string;
        has_more?: boolean;
      };
    };
    if (json.code !== 0) throw new Error(`飞书读取失败: ${json.msg}`);
    all.push(...(json.data?.items ?? []));
    pageToken = json.data?.has_more ? json.data.page_token : undefined;
  } while (pageToken);
  return all;
}

export async function createRecord(
  fields: Record<string, unknown>,
  tableId?: string,
  appToken?: string,
): Promise<string> {
  const token = await getTenantAccessToken();
  const res = await fetch(tableEndpoint("/records", appToken, tableId), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
  });
  const json = (await res.json()) as {
    code: number;
    msg: string;
    data?: { record?: FeishuRecord };
  };
  if (json.code !== 0 || !json.data?.record?.record_id) {
    throw new Error(`飞书写入失败: ${json.msg}`);
  }
  return json.data.record.record_id;
}

export async function updateRecord(
  recordId: string,
  fields: Record<string, unknown>,
  tableId?: string,
  appToken?: string,
): Promise<void> {
  const token = await getTenantAccessToken();
  const res = await fetch(tableEndpoint(`/records/${recordId}`, appToken, tableId), {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
  });
  const json = (await res.json()) as { code: number; msg: string };
  if (json.code !== 0) throw new Error(`飞书更新失败: ${json.msg}`);
}

export async function deleteRecord(
  recordId: string,
  tableId?: string,
  appToken?: string,
): Promise<void> {
  const token = await getTenantAccessToken();
  const res = await fetch(tableEndpoint(`/records/${recordId}`, appToken, tableId), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = (await res.json()) as { code: number; msg: string };
  if (json.code !== 0) throw new Error(`飞书删除失败: ${json.msg}`);
}

export async function getRecord(
  recordId: string,
  tableId?: string,
  appToken?: string,
): Promise<FeishuRecord | null> {
  const token = await getTenantAccessToken();
  const res = await fetch(tableEndpoint(`/records/${recordId}`, appToken, tableId), {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = (await res.json()) as {
    code: number;
    msg: string;
    data?: { record?: FeishuRecord };
  };
  if (json.code !== 0) return null;
  return json.data?.record ?? null;
}
