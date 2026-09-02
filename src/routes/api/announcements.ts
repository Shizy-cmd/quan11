import { createFileRoute } from "@tanstack/react-router";
import { listAnnouncements } from "@/lib/announcement.server";

export const Route = createFileRoute("/api/announcements")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const items = await listAnnouncements();
          // 最新在前，置顶优先
          items.sort((a, b) => {
            if (!!b.pinned !== !!a.pinned) return b.pinned ? 1 : -1;
            return b.date.localeCompare(a.date);
          });
          return Response.json({ ok: true, items });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "读取失败";
          return Response.json({ ok: false, items: [], error: msg });
        }
      },
    },
  },
});
