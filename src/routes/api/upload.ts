import { createFileRoute } from "@tanstack/react-router";
import { uploadToR2 } from "@/lib/r2.server";

function checkAuth(request: Request): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? "quan11-admin";
  const got = request.headers.get("x-admin-password");
  return !!got && got === expected;
}

export const Route = createFileRoute("/api/upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!checkAuth(request)) {
          return new Response("Unauthorized", { status: 401 });
        }
        try {
          const form = await request.formData();
          const file = form.get("file");
          if (!(file instanceof File)) {
            return new Response(
              JSON.stringify({ ok: false, error: "缺少文件" }),
              {
                status: 400,
                headers: { "content-type": "application/json" },
              },
            );
          }
          const safe = file.name.replace(/[^\w.\-]/g, "_");
          const key = `guides/${Date.now()}_${Math.random()
            .toString(36)
            .slice(2, 8)}_${safe}`;
          const url = await uploadToR2({
            key,
            body: await file.arrayBuffer(),
            contentType: file.type || "application/octet-stream",
          });
          return Response.json({ ok: true, url });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "上传失败";
          return new Response(JSON.stringify({ ok: false, error: msg }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }
      },
    },
  },
});
