import { createFileRoute } from "@tanstack/react-router";
import { isAdminRequest } from "@/lib/adminAuth.server";
import { createRecord } from "@/lib/feishu.server";

export const Route = createFileRoute("/api/add-record")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAdminRequest(request)) {
          return new Response("Unauthorized", { status: 401 });
        }
        try {
          const body = (await request.json()) as {
            name?: string;
            section?: string;
            url?: string;
          };
          if (!body.name || !body.section || !body.url) {
            return new Response(
              JSON.stringify({ ok: false, error: "缺少必填字段" }),
              {
                status: 400,
                headers: { "content-type": "application/json" },
              },
            );
          }
          const id = await createRecord({
            文件名: body.name,
            板块: body.section,
            file_url: body.url,
          });
          return Response.json({ ok: true, id });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "写入失败";
          return new Response(JSON.stringify({ ok: false, error: msg }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }
      },
    },
  },
});
