import { createFileRoute } from "@tanstack/react-router";
import {
  listFeedbackRecords,
  type FeedbackView,
} from "@/lib/feedback.server";

function checkAuth(request: Request): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? "quan11-admin";
  const got = request.headers.get("x-admin-password");
  return !!got && got === expected;
}

export const Route = createFileRoute("/api/feedback-list")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!checkAuth(request)) {
          return new Response("Unauthorized", { status: 401 });
        }
        try {
          const url = new URL(request.url);
          const status = url.searchParams.get("status")?.trim() || "";
          const category = url.searchParams.get("category")?.trim() || "";
          let items = await listFeedbackRecords();
          if (status) {
            items = items.filter((x) => x.status === status);
          }
          if (category) {
            items = items.filter((x) => x.category === category);
          }
          // 最新的在前
          items = items.sort((a, b) => b.createdAt - a.createdAt);
          return Response.json({ ok: true, items });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "读取失败";
          return new Response(JSON.stringify({ ok: false, items: [], error: msg }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }
      },
    },
  },
});

export type FeedbackListResponse = {
  ok: boolean;
  items: FeedbackView[];
  error?: string;
};
