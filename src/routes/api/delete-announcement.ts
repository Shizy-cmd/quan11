import { createFileRoute } from "@tanstack/react-router";
import { deleteAnnouncementWithAttachments } from "@/lib/announcement.server";

function checkAuth(request: Request): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? "quan11-admin";
  const got = request.headers.get("x-admin-password");
  return !!got && got === expected;
}

export const Route = createFileRoute("/api/delete-announcement")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!checkAuth(request)) return new Response("Unauthorized", { status: 401 });
        try {
          const body = (await request.json()) as { id?: string };
          if (!body.id) {
            return new Response(
              JSON.stringify({ ok: false, error: "缺少 id" }),
              { status: 400, headers: { "content-type": "application/json" } },
            );
          }
          await deleteAnnouncementWithAttachments(body.id);
          return Response.json({ ok: true });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "删除失败";
          return new Response(JSON.stringify({ ok: false, error: msg }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }
      },
    },
  },
});
