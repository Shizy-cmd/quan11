import { createFileRoute } from "@tanstack/react-router";
import { deleteFeedbackWithAttachments } from "@/lib/feedback.server";

function checkAuth(request: Request): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? "quan11-admin";
  const got = request.headers.get("x-admin-password");
  return !!got && got === expected;
}

export const Route = createFileRoute("/api/delete-feedback")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!checkAuth(request)) {
          return new Response("Unauthorized", { status: 401 });
        }
        try {
          const body = (await request.json()) as { id?: string };
          if (!body.id) {
            return new Response(
              JSON.stringify({ ok: false, error: "缺少 id" }),
              { status: 400, headers: { "content-type": "application/json" } },
            );
          }
          // 先删 R2 附件，再删飞书行
          await deleteFeedbackWithAttachments(body.id);
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
