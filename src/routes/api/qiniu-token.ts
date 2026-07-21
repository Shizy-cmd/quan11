import { createFileRoute } from "@tanstack/react-router";
import { generateUploadToken } from "@/lib/qiniu.server";

function checkAuth(request: Request): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? "quan11-admin";
  const got = request.headers.get("x-admin-password");
  return !!got && got === expected;
}

export const Route = createFileRoute("/api/qiniu-token")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!checkAuth(request)) {
          return new Response("Unauthorized", { status: 401 });
        }
        try {
          const body = (await request.json().catch(() => ({}))) as {
            fileName?: string;
          };
          const safe = (body.fileName ?? "file").replace(/[^\w.\-]/g, "_");
          const key = `guides/${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${safe}`;
          const token = await generateUploadToken({ key });
          return Response.json({
            ok: true,
            token,
            key,
            domain: process.env.QINIU_DOMAIN ?? "",
          });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "获取上传凭证失败";
          return new Response(JSON.stringify({ ok: false, error: msg }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }
      },
    },
  },
});
