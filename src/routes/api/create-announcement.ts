import { createFileRoute } from "@tanstack/react-router";
import { uploadToR2 } from "@/lib/r2.server";
import { createAnnouncement } from "@/lib/announcement.server";
import { isAnnounceCategory, type AnnounceCategory } from "@/lib/announceData";

function checkAuth(request: Request): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? "quan11-admin";
  const got = request.headers.get("x-admin-password");
  return !!got && got === expected;
}

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export const Route = createFileRoute("/api/create-announcement")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!checkAuth(request)) return json(401, { ok: false, error: "Unauthorized" });
        try {
          const form = await request.formData();
          const category = String(form.get("category") ?? "").trim();
          const title = String(form.get("title") ?? "").trim();
          const summary = String(form.get("summary") ?? "").trim();
          const author = String(form.get("author") ?? "").trim() || "学生权益中心";
          const readingTime = String(form.get("readingTime") ?? "").trim() || "3 分钟";
          const pinned = String(form.get("pinned") ?? "false") === "true";
          let content: string[] = [];
          try {
            content = JSON.parse(String(form.get("content") ?? "[]")) as string[];
          } catch {
            content = String(form.get("content") ?? "")
              .split(/\n+/)
              .map((s) => s.trim())
              .filter(Boolean);
          }
          const date = String(form.get("date") ?? "").trim();

          if (!isAnnounceCategory(category)) return json(400, { ok: false, error: "分类无效" });
          if (!title || !summary) return json(400, { ok: false, error: "请填写标题与摘要" });
          if (!content.length) return json(400, { ok: false, error: "请填写正文" });

          const coverFile = form.get("cover");
          const attachmentFiles = form
            .getAll("attachments")
            .filter((f): f is File => f instanceof File);

          let coverUrl: string | undefined;
          if (coverFile instanceof File && coverFile.size > 0) {
            const safe = coverFile.name.replace(/[^\w.\-]/g, "_");
            const key = `announcements/cover/${Date.now()}_${safe}`;
            coverUrl = await uploadToR2({
              key,
              body: await coverFile.arrayBuffer(),
              contentType: coverFile.type || "application/octet-stream",
            });
          }

          const attachmentUrls: string[] = [];
          for (const f of attachmentFiles.slice(0, 10)) {
            if (f.size > 20 * 1024 * 1024) continue;
            const safe = f.name.replace(/[^\w.\-]/g, "_");
            const key = `announcements/attachments/${Date.now()}_${Math.random()
              .toString(36)
              .slice(2, 8)}_${safe}`;
            const url = await uploadToR2({
              key,
              body: await f.arrayBuffer(),
              contentType: f.type || "application/octet-stream",
            });
            attachmentUrls.push(url);
          }

          const { item } = await createAnnouncement({
            category: category as AnnounceCategory,
            title,
            summary,
            author,
            readingTime,
            pinned,
            content,
            date: date || undefined,
            coverUrl,
            attachmentUrls: attachmentUrls.length ? attachmentUrls : undefined,
          });

          return Response.json({ ok: true, item });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "发布失败";
          return json(500, { ok: false, error: msg });
        }
      },
    },
  },
});
