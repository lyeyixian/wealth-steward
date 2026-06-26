import express from "express";
import { ledgerHealth } from "./health";

const PORT = Number(process.env.PORT ?? 3001);
const ACTUAL_SERVER_URL =
  process.env.ACTUAL_SERVER_URL ?? "http://actual-server:5006";

export const app = express();

app.get("/health", async (_req, res) => {
  const health = await ledgerHealth(ACTUAL_SERVER_URL);
  res.status(health.status === "ok" ? 200 : 503).json(health);
});

// Only start listening when run directly, so tests can import `app` cheaply.
if (require.main === module) {
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(
      `ledger service listening on :${PORT} (actual: ${ACTUAL_SERVER_URL})`,
    );
  });
}
