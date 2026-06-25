import express, { Request, Response } from 'express';
import * as http from 'http';
import * as https from 'https';

const app = express();
const PORT = parseInt(process.env.PORT ?? '3001', 10);
const ACTUAL_SERVER_URL = process.env.ACTUAL_SERVER_URL ?? 'http://localhost:5006';

app.use(express.json());

function checkActualReachable(baseUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    const mod = baseUrl.startsWith('https') ? https : http;
    const req = mod.get(`${baseUrl}/health`, { timeout: 5000 }, (res) => {
      resolve(res.statusCode !== undefined && res.statusCode < 500);
      res.resume();
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

app.get('/health', async (_req: Request, res: Response) => {
  const actualReachable = await checkActualReachable(ACTUAL_SERVER_URL);
  const status = actualReachable ? 'ok' : 'degraded';
  res.status(actualReachable ? 200 : 503).json({
    status,
    checks: {
      actual: actualReachable ? 'reachable' : 'unreachable',
    },
  });
});

app.listen(PORT, () => {
  console.log(`ledger listening on :${PORT}`);
  console.log(`actual-server: ${ACTUAL_SERVER_URL}`);
});
