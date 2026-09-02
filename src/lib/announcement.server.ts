// 权益公告：飞书多维表格 + Cloudflare R2 服务端封装。
// 依赖 FEISHU_ANNOUNCEMENT_APP_TOKEN / FEISHU_ANNOUNCEMENT_TABLE_ID（建议与指南/反馈同 base）。

import {
  createRecord,
  deleteRecord,
  getRecord,
  listRecords,
  updateRecord,
} from "@/lib/feishu.server";
import { deleteFromR2, publicUrlToKey } from "@/lib/r2.server";
import {
  announceLabel,
  announceValue,
  type AnnounceCategory,
  type AnnouncementView,
} from "@/lib/announceData";

function announcementEnv(): { appToken: string; tableId: string } {
  const appToken = process.env.FEISHU_ANNOUNCEMENT_APP_TOKEN;
  const tableId = process.env.FEISHU_ANNOUNCEMENT_TABLE_ID;
  if (!appToken || !tableId) {
    throw new Error(
      "FEISHU_ANNOUNCEMENT_APP_TOKEN / FEISHU_ANNOUNCEMENT_TABLE_ID 未配置：请创建「权益公告」表并填入",
    );
  }
  return { appToken, tableId };
}

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

function readBool(value: unknown): boolean {
  return value === true || value === "true" || value === 1;
}

function readLinks(value: unknown): { link: string; text: string }[] {
  if (typeof value === "string") {
    return value
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter((s) => /^https?:\/\//i.test(s))
      .map((link) => ({ link, text: link.split("/").pop() || link }));
  }
  if (Array.isArray(value)) {
    const toEntry = (v: unknown): { link: string; text: string } | null => {
      if (typeof v === "string") return { link: v, text: v };
      if (v && typeof v === "object") {
        const o = v as { link?: string; text?: string };
        if (typeof o.link === "string") return { link: o.link, text: o.text || o.link };
      }
      return null;
    };
    return value.map(toEntry).filter((x): x is { link: string; text: string } => x !== null);
  }
  return [];
}

function toDate(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function mapRecord(r: { record_id: string; fields: Record<string, unknown> }): AnnouncementView {
  const f = r.fields;
  const cat = readText(f["分类"]);
  const contentText = readText(f["正文"]) || readText(f["content"]);
  const attachments = readLinks(f["附件"]);
  const cover = readText(f["封面"]) || undefined;
  return {
    id: r.record_id,
    category: announceValue(cat),
    title: readText(f["标题"]) || readText(f["title"]),
    summary: readText(f["摘要"]) || readText(f["summary"]),
    date: toDate(typeof f["日期"] === "number" ? f["日期"] : 0),
    author: readText(f["作者"]) || "学生权益中心",
    readingTime: readText(f["阅读时长"]) || "3 分钟",
    pinned: readBool(f["置顶"]),
    content: contentText
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean),
    cover: cover || undefined,
    attachments: attachments.length ? attachments : undefined,
  };
}

export async function listAnnouncements(): Promise<AnnouncementView[]> {
  const { appToken, tableId } = announcementEnv();
  const records = await listRecords(tableId, appToken);
  return records.map((r) => mapRecord(r as { record_id: string; fields: Record<string, unknown> }));
}

export type AnnouncementCreateInput = {
  category: AnnounceCategory;
  title: string;
  summary: string;
  author: string;
  readingTime: string;
  pinned: boolean;
  content: string[];
  date?: string;
  coverUrl?: string;
  attachmentUrls?: string[];
};

export async function createAnnouncement(
  input: AnnouncementCreateInput,
): Promise<{ recordId: string; item: AnnouncementView }> {
  const { appToken, tableId } = announcementEnv();
  const now = input.date ?? toDate(Date.now());
  const fields: Record<string, unknown> = {
    分类: announceLabel(input.category),
    标题: input.title,
    摘要: input.summary,
    日期: new Date(`${now}T00:00:00`).getTime(),
    作者: input.author,
    阅读时长: input.readingTime,
    正文: input.content.join("\n"),
    置顶: !!input.pinned,
  };
  if (input.coverUrl) fields["封面"] = input.coverUrl;
  if (input.attachmentUrls && input.attachmentUrls.length > 0) {
    fields["附件"] = input.attachmentUrls.join("\n");
  }
  const recordId = await createRecord(fields, tableId, appToken);
  return {
    recordId,
    item: {
      id: recordId,
      category: input.category,
      title: input.title,
      summary: input.summary,
      date: now,
      author: input.author,
      readingTime: input.readingTime,
      pinned: !!input.pinned,
      content: input.content,
      cover: input.coverUrl,
      attachments: input.attachmentUrls?.length
        ? input.attachmentUrls.map((link) => ({ link, text: link.split("/").pop() || link }))
        : undefined,
    },
  };
}

export async function toggleAnnouncementPin(
  recordId: string,
  nextPinned: boolean,
): Promise<void> {
  const { appToken, tableId } = announcementEnv();
  await updateRecord(recordId, { 置顶: nextPinned }, tableId, appToken);
}

export async function deleteAnnouncementWithAttachments(
  recordId: string,
): Promise<void> {
  const { appToken, tableId } = announcementEnv();
  const rec = await getRecord(recordId, tableId, appToken);
  if (rec) {
    const f = rec.fields as Record<string, unknown>;
    const keys = new Set<string>();
    const cover = readText(f["封面"]);
    if (cover) {
      const k = publicUrlToKey(cover);
      if (k) keys.add(k);
    }
    for (const l of readLinks(f["附件"])) {
      const k = publicUrlToKey(l.link);
      if (k) keys.add(k);
    }
    for (const key of keys) {
      try {
        await deleteFromR2(key);
      } catch {
        // 单文件失败不阻断记录删除
      }
    }
  }
  await deleteRecord(recordId, tableId, appToken);
}
