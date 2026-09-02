import { createFileRoute } from "@tanstack/react-router";
import {
  deleteOrphans,
  findOrphans,
  type CleanupResult,
} from "@/lib/cleanup.server";

function checkAuth(request: Request): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? "quan11-admin";
  const got = request.headers.get("x-admin-password");
  return !!got && got === expected;
}

export type R2CleanupResponse = {
  ok: boolean;
  dryRun?: boolean;
  result?: CleanupResult;
  deleted?: number;
  error?: string;
};

export const Route = createFileRoute("/api/r2-cleanup")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!checkAuth(request)) {
          return new Response("Unauthorized", { status: 401 });
        }
        try {
          const body = (await request.json().catch(() => ({}))) as {
            commit?: boolean;
          };
          const result = await findOrphans();
          if (!body.commit) {
            return Response.json({ ok: true, dryRun: true, result });
          }
          const deleted = await deleteOrphans(result.orphans);
          return Response.json({ ok: true, dryRun: false, deleted });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "清理失败";
          return new Response(JSON.stringify({ ok: false, error: msg }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }
      },
    },
  },
});
