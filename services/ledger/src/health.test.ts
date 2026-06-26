import { describe, expect, it, vi } from "vitest";
import { checkActualReachable, ledgerHealth } from "./health";

const fakeResponse = (status: number) => ({ status }) as Response;

describe("checkActualReachable", () => {
  it("is true when Actual answers with a 2xx", async () => {
    const fetchFn = vi.fn().mockResolvedValue(fakeResponse(200));
    expect(await checkActualReachable("http://actual:5006", fetchFn)).toBe(true);
  });

  it("treats a 404 as reachable (server up, route just absent)", async () => {
    const fetchFn = vi.fn().mockResolvedValue(fakeResponse(404));
    expect(await checkActualReachable("http://actual:5006", fetchFn)).toBe(true);
  });

  it("is false on a 5xx", async () => {
    const fetchFn = vi.fn().mockResolvedValue(fakeResponse(503));
    expect(await checkActualReachable("http://actual:5006", fetchFn)).toBe(false);
  });

  it("is false when the request throws (network error / timeout)", async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error("ECONNREFUSED"));
    expect(await checkActualReachable("http://actual:5006", fetchFn)).toBe(false);
  });
});

describe("ledgerHealth", () => {
  it("reports ok + reachable when Actual responds", async () => {
    const fetchFn = vi.fn().mockResolvedValue(fakeResponse(200));
    expect(await ledgerHealth("http://actual:5006", fetchFn)).toEqual({
      status: "ok",
      actual: "reachable",
    });
  });

  it("reports degraded + unreachable when Actual is down", async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error("down"));
    expect(await ledgerHealth("http://actual:5006", fetchFn)).toEqual({
      status: "degraded",
      actual: "unreachable",
    });
  });
});
