import { createFileRoute } from "@tanstack/react-router";
import { getGuideChapters } from "@/lib/guide.server";

export const Route = createFileRoute("/api/guide")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const chapters = await getGuideChapters();
          return Response.json({ ok: true, chapters });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "读取失败";
          return Response.json({ ok: false, error: msg });
        }
      },
    },
  },
});
