import { describe, expect, it } from "vitest";
import { RPC_PASSTHROUGH_ALLOWLIST } from "../routes/rpcPassthrough.js";

describe("RPC passthrough allowlist", () => {
  it("rejects arbitrary methods not in the allowlist", () => {
    expect(RPC_PASSTHROUGH_ALLOWLIST.has("GetAllCascadeTrajectories")).toBe(
      false,
    );
    expect(RPC_PASSTHROUGH_ALLOWLIST.has("StartCascade")).toBe(false);
    expect(RPC_PASSTHROUGH_ALLOWLIST.has("DeleteCascadeTrajectory")).toBe(false);
    expect(RPC_PASSTHROUGH_ALLOWLIST.has("SendUserCascadeMessage")).toBe(false);
    expect(RPC_PASSTHROUGH_ALLOWLIST.has("")).toBe(false);
    expect(RPC_PASSTHROUGH_ALLOWLIST.has("__proto__")).toBe(false);
  });

  it("allowlist is currently empty (no methods exposed)", () => {
    expect(RPC_PASSTHROUGH_ALLOWLIST.size).toBe(0);
  });
});
