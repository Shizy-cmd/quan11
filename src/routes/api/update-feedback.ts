import { createFileRoute } from "@tanstack/react-router";
import { isAdminRequest } from "@/lib/adminAuth.server";
import { updateFeedbackRecord } from "@/lib/feedback.server";
import {
  FEEDBACK_STATUSES,
  type FeedbackStatus,
} from "@/lib/feedbackData";

export const Route = createFileRoute("/api/update-feedback")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAdminRequest(request)) {
          return new Response("Unauthorized", { status: 401 });
        }
        try {
          const body = (await request.json()) as {
            id?: string;
            status?: string;
            remark?: string;
          };
          if (!body.id) {
            return new Response(
              JSON.stringify({ ok: false, error: "缺少 id" }),
              { status: 400, headers: { "content-type": "application/json" } },
            );
          }
          const status: FeedbackStatus | undefined = FEEDBACK_STATUSES.some(
            (s) => s.value === body.status,
          )
            ? (body.status as FeedbackStatus)
            : undefined;
          await updateFeedbackRecord(body.id, {
            status,
            remark: typeof body.remark === "string" ? body.remark : undefined,
          });
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
