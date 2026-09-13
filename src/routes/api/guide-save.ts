import { createFileRoute } from "@tanstack/react-router";
import { isAdminRequest } from "@/lib/adminAuth.server";
import { saveGuideChapters } from "@/lib/guide.server";
import type { GuideChapter } from "@/lib/freshmanGuide";

export const Route = createFileRoute("/api/guide-save")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAdminRequest(request)) {
          return new Response("Unauthorized", { status: 401 });
        }
        try {
          const body = (await request.json()) as { chapters?: GuideChapter[] };
          if (!Array.isArray(body.chapters) || body.chapters.length === 0) {
            return Response.json({ ok: false, error: "内容为空" }, { status: 400 });
          }
          await saveGuideChapters(body.chapters);
          return Response.json({ ok: true });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "保存失败";
          return Response.json({ ok: false, error: msg }, { status: 500 });
        }
      },
    },
  },
});
