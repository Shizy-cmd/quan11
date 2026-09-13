import { createFileRoute } from "@tanstack/react-router";
import { verifyAdminPassword } from "@/lib/adminAuth.server";

export const Route = createFileRoute("/api/admin-login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { password?: string };
          if (verifyAdminPassword(body.password)) {
            return Response.json({ ok: true });
          }
        } catch {
          /* ignore */
        }
        return new Response(JSON.stringify({ ok: false }), {
          status: 401,
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
