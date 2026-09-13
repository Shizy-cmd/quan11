import { createFileRoute } from "@tanstack/react-router";
import { isAdminRequest } from "@/lib/adminAuth.server";
import { toggleAnnouncementPin } from "@/lib/announcement.server";

export const Route = createFileRoute("/api/toggle-announcement-pin")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAdminRequest(request)) return new Response("Unauthorized", { status: 401 });
        try {
          const body = (await request.json()) as { id?: string; pinned?: boolean };
          if (!body.id) {
            return new Response(
              JSON.stringify({ ok: false, error: "缺少 id" }),
              { status: 400, headers: { "content-type": "application/json" } },
            );
          }
          await toggleAnnouncementPin(body.id, !!body.pinned);
          return Response.json({ ok: true });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "更新失败";
          return new Response(JSON.stringify({ ok: false, error: msg }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }
      },
    },
  },
});
