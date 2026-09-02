// 权益反馈：飞书多维表格服务端封装（仅在服务器路由中使用）
// 依赖 FEISHU_FEEDBACK_TABLE_ID（请在飞书建好「权益反馈」表后填写）

import {
  createRecord,
  deleteRecord,
  getRecord,
  listRecords,
  updateRecord,
} from "@/lib/feishu.server";
import { deleteFromR2, publicUrlToKey } from "@/lib/r2.server";
import {
  FEEDBACK_CATEGORIES,
  FEEDBACK_STATUSES,
  categoryLabel,
  categoryValue,
  statusLabel,
  statusValue,
  type FeedbackView,
  type FeedbackCategory,
  type FeedbackStatus,
} from "@/lib/feedbackData";

function feedbackEnv(): { appToken: string; tableId: string } {
  const appToken = process.env.FEISHU_FEEDBACK_APP_TOKEN;
  const id = process.env.FEISHU_FEEDBACK_TABLE_ID;
  if (!appToken || !id) {
    throw new Error(
      "FEISHU_FEEDBACK_APP_TOKEN / FEISHU_FEEDBACK_TABLE_ID 未配置：请在飞书多维表格后台创建「权益反馈」表，并填入其 app_token 与 table_id",
    );
  }
  return { appToken, tableId: id };
}

export function generateTicketId(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `QY-${y}${m}${day}-${rand}`;
}

/**
 * 读取飞书字段：兼容 string、string[]、[{ text }]、[{ link, text }] 等返回形态。
 */
function readText(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const first = value[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object") {
      const t = (first as { text?: string }).text;
      if (typeof t === "string") return t;
    }
  }
  return "";
}

function readLinks(value: unknown): { link: string; text: string }[] {
  // 兼容「多行文本」：每行一个 URL
  if (typeof value === "string") {
    return value
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter((s) => /^https?:\/\//i.test(s))
      .map((link) => ({ link, text: link.split("/").pop() || link }));
  }
  // 兼容「超链接」字段：单个对象或数组（对象含 link/text）
  const toEntry = (v: unknown): { link: string; text: string } | null => {
    if (typeof v === "string") return { link: v, text: v };
    if (v && typeof v === "object") {
      const o = v as { link?: string; text?: string };
      if (typeof o.link === "string") {
        return { link: o.link, text: o.text || o.link };
      }
    }
    return null;
  };
  if (Array.isArray(value)) {
    return value.map(toEntry).filter((x): x is { link: string; text: string } => x !== null);
  }
  const single = toEntry(value);
  return single ? [single] : [];
}

function toText(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export type FeedbackCreateInput = {
  name?: string;
  contact: string;
  category: FeedbackCategory;
  occurredAt: number;
  detail: string;
  attachments?: { link: string; text: string }[];
};

export async function createFeedbackRecord(
  input: FeedbackCreateInput,
): Promise<string> {
  const { appToken, tableId } = feedbackEnv();
  const ticket = generateTicketId();
  const fields: Record<string, unknown> = {
    单号: ticket,
    联系方式: input.contact,
    问题类型: categoryLabel(input.category),
    发生时间: input.occurredAt,
    问题描述: input.detail,
    状态: statusLabel("pending"),
    提交时间: Date.now(),
  };
  if (input.name && input.name.trim()) fields["姓名"] = input.name.trim();
  if (input.attachments && input.attachments.length > 0) {
    // 「附件」建议用法：每行一个 URL 的多行文本字段，以保留全部附件
    fields["附件"] = input.attachments.map((a) => a.link).join("\n");
  }
  await createRecord(fields, tableId, appToken);
  return ticket;
}

export async function listFeedbackRecords(): Promise<FeedbackView[]> {
  const { appToken, tableId } = feedbackEnv();
  const records = await listRecords(tableId, appToken);
  return records.map((r) => {
    const f = r.fields as Record<string, unknown>;
    const catLabel = readText(f["问题类型"]) || readText(f["category"]);
    const stLabel = readText(f["状态"]) || readText(f["status"]);
    const occurred = typeof f["发生时间"] === "number" ? f["发生时间"] : 0;
    const created = typeof f["提交时间"] === "number" ? f["提交时间"] : 0;
    const attachments = readLinks(f["附件"]);
    const contact = readText(f["联系方式"]);
    return {
      id: r.record_id,
      ticket: readText(f["单号"]) || r.record_id,
      name: readText(f["姓名"]) || readText(f["name"]),
      contact,
      category: categoryValue(catLabel) as FeedbackCategory,
      categoryLabel: catLabel,
      occurredAt: occurred,
      occurredAtText: occurred ? toText(occurred) : "",
      detail: readText(f["问题描述"]) || readText(f["detail"]),
      attachments,
      status: statusValue(stLabel) as FeedbackStatus,
      statusLabel: stLabel,
      remark: readText(f["处理备注"]) || readText(f["remark"]),
      createdAt: created,
      createdAtText: created ? toText(created) : "",
    };
  });
}

export async function updateFeedbackRecord(
  recordId: string,
  patch: { status?: FeedbackStatus; remark?: string },
): Promise<void> {
  const { appToken, tableId } = feedbackEnv();
  const fields: Record<string, unknown> = {};
  if (patch.status && FEEDBACK_STATUSES.some((s) => s.value === patch.status)) {
    fields["状态"] = statusLabel(patch.status);
  }
  if (typeof patch.remark === "string") {
    fields["处理备注"] = patch.remark;
  }
  if (Object.keys(fields).length === 0) {
    throw new Error("没有需要更新的字段");
  }
  await updateRecord(recordId, fields, tableId, appToken);
}

export async function deleteFeedbackRecord(recordId: string): Promise<void> {
  const { appToken, tableId } = feedbackEnv();
  await deleteRecord(recordId, tableId, appToken);
}

/** 删除反馈记录：先删除其 R2 附件，再删除飞书行。 */
export async function deleteFeedbackWithAttachments(
  recordId: string,
): Promise<void> {
  const { appToken, tableId } = feedbackEnv();
  const rec = await getRecord(recordId, tableId, appToken);
  if (rec) {
    const links = readLinks((rec.fields as Record<string, unknown>)["附件"]);
    for (const l of links) {
      const key = publicUrlToKey(l.link);
      if (key) {
        try {
          await deleteFromR2(key);
        } catch {
          // 单个附件删除失败不阻断记录删除
        }
      }
    }
  }
  await deleteRecord(recordId, tableId, appToken);
}

export function isFeedbackCategory(value: string): value is FeedbackCategory {
  return FEEDBACK_CATEGORIES.some((c) => c.value === value);
}
