import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/admin-login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env.ADMIN_PASSWORD ?? "quan11-admin";
        try {
          const body = (await request.json()) as { password?: string };
          if (body.password && body.password === expected) {
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
