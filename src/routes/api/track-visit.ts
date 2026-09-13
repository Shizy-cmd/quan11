import { createFileRoute } from "@tanstack/react-router";
import { normalizePath, recordVisit } from "@/lib/visitStats.server";
import type { TrackVisitResponse } from "@/lib/visitData";

// 访客端上报：每次页面浏览 POST 一次。
// 统计失败不影响访客，一律返回 200，错误信息放在 body 里。
export const Route = createFileRoute("/api/track-visit")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json().catch(() => ({}))) as {
            path?: string;
            visitorId?: string;
          };
          const path = normalizePath(body.path);
          // 管理后台与接口请求不进统计
          if (path.startsWith("/api") || path.startsWith("/admin")) {
            return Response.json({ ok: true } satisfies TrackVisitResponse);
          }
          const visitorId =
            typeof body.visitorId === "string" && body.visitorId
              ? body.visitorId.slice(0, 64)
              : undefined;
          const result = await recordVisit({ path, visitorId });
          return Response.json(result);
        } catch (err) {
          const msg = err instanceof Error ? err.message : "统计失败";
          return Response.json({ ok: false, error: msg } satisfies TrackVisitResponse);
        }
      },
    },
  },
});
