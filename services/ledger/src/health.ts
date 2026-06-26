export interface HealthResult {
  status: "ok" | "degraded";
  actual: "reachable" | "unreachable";
}

/**
 * Probes the Actual sync server. "Reachable" means the server answered an HTTP
 * request at all (any non-5xx status) — proving the Ledger Service can talk to
 * the Actual engine it will later wrap. A network/timeout error, or a 5xx,
 * counts as unreachable.
 */
export async function checkActualReachable(
  actualServerUrl: string,
  fetchFn: typeof fetch = fetch,
  timeoutMs = 2000,
): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchFn(actualServerUrl, { signal: controller.signal });
    // Any HTTP response below 500 (even a 404) proves the server is up.
    return res.status < 500;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export async function ledgerHealth(
  actualServerUrl: string,
  fetchFn: typeof fetch = fetch,
): Promise<HealthResult> {
  const reachable = await checkActualReachable(actualServerUrl, fetchFn);
  return reachable
    ? { status: "ok", actual: "reachable" }
    : { status: "degraded", actual: "unreachable" };
}
