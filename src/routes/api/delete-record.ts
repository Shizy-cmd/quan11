import { createFileRoute } from "@tanstack/react-router";
import { deleteRecord, getRecord } from "@/lib/feishu.server";
import { deleteQiniuFile, extractKeyFromUrl } from "@/lib/qiniu.server";

function checkAuth(request: Request): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? "quan11-admin";
  const got = request.headers.get("x-admin-password");
  return !!got && got === expected;
}

export const Route = createFileRoute("/api/delete-record")({
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
          // 读取记录以获取 file_url
          const record = await getRecord(body.id);
          const fileUrl =
            (record?.fields?.file_url as string) ??
            (record?.fields?.["链接"] as string) ??
            "";

          // 先删飞书行
          await deleteRecord(body.id);

          // 再尝试删七牛文件（失败不阻塞）
          if (fileUrl) {
            try {
              await deleteQiniuFile(extractKeyFromUrl(fileUrl));
            } catch (e) {
              console.warn("七牛删除失败", e);
            }
          }
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
