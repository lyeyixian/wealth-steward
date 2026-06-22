# Multi-currency: single base currency, time-correct FX

The system supports multiple currencies (SGD/MYR/USD are all realistic for one SG/MY user — see [[sg-my-financial-context]]) under these rules:

- **Single base currency**, chosen by the user (e.g. SGD). Every account, holding, and loan stores its **native currency as the source of truth**; all aggregate figures (Net Worth, Invested Capital, Savings Rate, cash flow) convert to base at the **read/aggregation layer** — conversion is never baked into stored transactions.
- **Net-Worth History locks FX at snapshot time.** Each snapshot persists native values, the FX rate used, and the base-converted value as of that date. History is immutable: a past month's number never shifts when rates later move. Real wealth movement is not polluted by currency noise.
- **Flows convert at per-transaction-date rates.** Each income/expense converts to base using the FX rate on its own date — consistent with snapshot locking and accurate for cross-currency Savings Rate.
- **Daily FX rate table**, backfilled from a free read-only feed; missing dates fall back to the nearest prior date. Read-only, consistent with the tracker-only stance ([[0003-tracker-only-no-real-money-execution]]).

## Considered & rejected

- **Reconvert all history at the latest rate** — simpler (store native only) but the entire past net-worth curve shifts with FX, conflating currency swings with actual saving/returns. Rejected on correctness.
- **Multi-base display** (show every figure in N currencies) — premature UI complexity.

## Consequences / deferred

- The model must carry a `currency` on every account/holding/loan and a dated `fx_rates` table queried at read time.
- **FX gain/loss attribution** (decomposing a net-worth change into FX vs contributions vs returns) is explicitly deferred; Net Worth reflects converted values without attribution for now.
