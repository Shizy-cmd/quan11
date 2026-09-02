// R2 孤儿文件清理：对比「校园指南文件」表与「权益反馈列表」表引用的资源，
// 找出仍留在 R2 中却已不被任何记录引用的对象。
// 仅在服务器路由中使用。

import { listRecords } from "@/lib/feishu.server";
import { listFeedbackRecords } from "@/lib/feedback.server";
import { deleteFromR2, listR2Keys, publicUrlToKey } from "@/lib/r2.server";

const MANAGED_PREFIXES = ["guides/", "feedback/", "announcements/"];

function collectKeysFromFields(
  fields: Record<string, unknown>,
  out: Set<string>,
): void {
  const visit = (v: unknown) => {
    if (typeof v === "string") {
      const k = publicUrlToKey(v);
      if (k) out.add(k);
    } else if (Array.isArray(v)) {
      v.forEach(visit);
    } else if (v && typeof v === "object") {
      Object.values(v).forEach(visit);
    }
  };
  Object.values(fields).forEach(visit);
}

/** 汇总两张飞书表引用的所有 R2 key */
export async function collectReferencedKeys(): Promise<Set<string>> {
  const keys = new Set<string>();
  const guideRecords = await listRecords();
  for (const r of guideRecords) {
    collectKeysFromFields(r.fields as Record<string, unknown>, keys);
  }
  const feedbackRecords = await listFeedbackRecords();
  for (const f of feedbackRecords) {
    for (const a of f.attachments) {
      const k = publicUrlToKey(a.link);
      if (k) keys.add(k);
    }
  }
  return keys;
}

export type CleanupResult = {
  nonManaged: string[];
  orphans: string[];
  total: number;
};

/**
 * 计算孤儿对象。nonManaged 为不在 guides//feedback/ 前缀下、本次不会删除的对象（供人工确认）。
 */
export async function findOrphans(): Promise<CleanupResult> {
  const all = await listR2Keys();
  const referenced = await collectReferencedKeys();
  const nonManaged = all.filter((k) => !MANAGED_PREFIXES.some((p) => k.startsWith(p)));
  const orphans = all.filter(
    (k) => MANAGED_PREFIXES.some((p) => k.startsWith(p)) && !referenced.has(k),
  );
  return { nonManaged, orphans, total: all.length };
}

/** 删除指定孤儿对象，返回成功数 */
export async function deleteOrphans(keys: string[]): Promise<number> {
  let ok = 0;
  for (const k of keys) {
    try {
      await deleteFromR2(k);
      ok += 1;
    } catch {
      // 单个失败不阻断整体清理
    }
  }
  return ok;
}
