import { createFileRoute } from "@tanstack/react-router";
import { listRecords } from "@/lib/feishu.server";

export type GuideFile = {
  id: string;
  name: string;
  section: string;
  url: string;
};

export const Route = createFileRoute("/api/get-files")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const records = await listRecords();
          const items: GuideFile[] = records
            .map((r) => {
              const f = r.fields as Record<string, unknown>;
              const readField = (key: string) => {
                const v = f[key];
                if (typeof v === "string") return v;
                if (Array.isArray(v) && v[0] && typeof v[0] === "object") {
                  const text = (v[0] as { text?: string }).text;
                  if (typeof text === "string") return text;
                }
                return "";
              };
              return {
                id: r.record_id,
                name: readField("文件名") || readField("name"),
                section: readField("板块") || readField("section"),
                url: readField("file_url") || readField("链接"),
              };
            })
            .filter((x) => x.name && x.section && x.url);
          return Response.json({ ok: true, items });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "读取失败";
          // 后端未配置时返回空列表，前端仍可展示静态结构
          return Response.json({ ok: false, items: [], error: msg });
        }
      },
    },
  },
});
