import { createFileRoute } from "@tanstack/react-router";
import { isAdminRequest } from "@/lib/adminAuth.server";
import { readVisitStats } from "@/lib/visitStats.server";
import type { VisitStatsResponse } from "@/lib/visitData";

// 访问统计读取（仅管理员）。
export const Route = createFileRoute("/api/visit-stats")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!isAdminRequest(request)) {
          return new Response("Unauthorized", { status: 401 });
        }
        try {
          const raw = Number(new URL(request.url).searchParams.get("days") ?? "");
          const days = Number.isFinite(raw) ? Math.min(Math.max(Math.floor(raw), 7), 60) : 14;
          const stats = await readVisitStats(days);
          return Response.json({ ok: true, stats } satisfies VisitStatsResponse);
        } catch (err) {
          const msg = err instanceof Error ? err.message : "读取失败";
          return Response.json({ ok: false, error: msg } satisfies VisitStatsResponse, {
            status: 200,
          });
        }
      },
    },
  },
});
