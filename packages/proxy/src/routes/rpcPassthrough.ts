/**
 * /api/rpc/:method route — restricted RPC passthrough
 *
 * Only methods in the allowlist may be called. The web UI does not
 * currently use this endpoint; it exists as an escape hatch for local
 * tooling. Add methods here only after review.
 */

import type { Hono } from "hono";
import { rpc } from "../routing.js";
import { handleRPCError } from "../errors.js";

/**
 * Allowlist of LS methods that may be called via the passthrough.
 * Keep this minimal — every entry widens the attack surface.
 */
export const RPC_PASSTHROUGH_ALLOWLIST: ReadonlySet<string> = new Set([
  // Add methods here as needed after security review, e.g.:
  // "GetWorkspaceInfos",
]);

export function registerRpcPassthroughRoutes(app: Hono): void {
  app.post("/api/rpc/:method", async (c) => {
    const method = c.req.param("method");

    if (!RPC_PASSTHROUGH_ALLOWLIST.has(method)) {
      return c.json(
        { error: `Method "${method}" is not allowed via RPC passthrough` },
        403,
      );
    }

    try {
      const body = await c.req.json().catch(() => ({}));
      const data = await rpc.call(method, body);
      return c.json(data);
    } catch (err) {
      return handleRPCError(c, err);
    }
  });
}
