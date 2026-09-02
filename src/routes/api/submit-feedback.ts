import { createFileRoute } from "@tanstack/react-router";
import { uploadToR2 } from "@/lib/r2.server";
import {
  createFeedbackRecord,
  isFeedbackCategory,
} from "@/lib/feedback.server";
import type { FeedbackCategory } from "@/lib/feedbackData";

// 简单的进程内防刷（Worker 每个 isolate 生效，属于尽力而为的限流）
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const buckets = new Map<string, { count: number; resetAt: number }>();

function allowed(ip: string): boolean {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || b.resetAt < now) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (b.count >= MAX_PER_WINDOW) return false;
  b.count += 1;
  return true;
}

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export const Route = createFileRoute("/api/submit-feedback")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const ip =
            request.headers.get("CF-Connecting-IP") ?? "unknown";
          if (!allowed(ip)) {
            return json(429, { ok: false, error: "提交过于频繁，请稍后再试" });
          }

          const form = await request.formData();
          const name = String(form.get("name") ?? "").trim();
          const campus = String(form.get("campus") ?? "").trim();
          const contact = String(form.get("contact") ?? "").trim();
          const category = String(form.get("category") ?? "").trim();
          const occurredAtRaw = String(form.get("occurredAt") ?? "").trim();
          const detail = String(form.get("detail") ?? "").trim();

          if (!/^1\d{10}$/.test(contact)) {
            return json(400, { ok: false, error: "请输入正确的 11 位手机号" });
          }
          if (!campus) {
            return json(400, { ok: false, error: "请填写校区" });
          }
          if (campus.length > 30) {
            return json(400, { ok: false, error: "校区名称过长" });
          }
          if (!isFeedbackCategory(category)) {
            return json(400, { ok: false, error: "请选择有效的问题类型" });
          }
          if (detail.length < 10) {
            return json(400, { ok: false, error: "问题描述不少于 10 字" });
          }
          const occurredAt = new Date(occurredAtRaw).getTime();
          if (!Number.isFinite(occurredAt) || occurredAt <= 0) {
            return json(400, { ok: false, error: "发生时间格式不正确" });
          }

          // 附件：同时兼容 files 字段（File 数组）。先上传到 R2，拿到公开链接。
          const uploads = form
            .getAll("files")
            .filter((f): f is File => f instanceof File);
          const maxFiles = 5;
          if (uploads.length > maxFiles) {
            return json(400, {
              ok: false,
              error: `最多上传 ${maxFiles} 个附件`,
            });
          }
          for (const f of uploads) {
            if (f.size > 10 * 1024 * 1024) {
              return json(400, { ok: false, error: `${f.name} 超过 10MB` });
            }
          }

          const attachments: { link: string; text: string }[] = [];
          // 先上传，单号由 createFeedbackRecord 生成；附件目录用时间戳前缀即可
          const prefix = `feedback/${Date.now()}`;
          for (const f of uploads) {
            const safe = f.name.replace(/[^\w.\-]/g, "_");
            const key = `${prefix}_${Math.random().toString(36).slice(2, 8)}_${safe}`;
            const url = await uploadToR2({
              key,
              body: await f.arrayBuffer(),
              contentType: f.type || "application/octet-stream",
            });
            attachments.push({ link: url, text: f.name });
          }

          const id = await createFeedbackRecord({
            name: name || undefined,
            campus,
            contact,
            category: category as FeedbackCategory,
            occurredAt,
            detail,
            attachments: attachments.length ? attachments : undefined,
          });

          return Response.json({ ok: true, id, attachments });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "提交失败";
          return json(500, { ok: false, error: msg });
        }
      },
    },
  },
});
