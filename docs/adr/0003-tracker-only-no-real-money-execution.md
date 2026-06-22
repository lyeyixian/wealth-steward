# Tracker-only: the agent never executes real-world money movement

The system is a **wealth tracker**, not a trading or payments platform. The agent may **read** market/price data and **propose** actions (e.g. "consider rebalancing 5% into bonds", "this bill is due"), but it will **never execute** real-world money movement — no broker trades, no crypto transactions, no transfers. A human acts on proposals outside the app. Any external financial credentials are read-only at most.

"Actions" the agent can take are confined to **tracker-internal mutations** of the user's own records (recategorize, edit/split transactions, adjust budgets, update tracked balances) — fully reversible, no real money involved.

## Why

- The portfolio goal ([[0001-ai-agent-is-the-product]]) is best served by a clean, safe, auditable agent — not an LLM trading real money, which reads as reckless rather than senior.
- Holding trade-enabled API keys is a severe security liability for a side project.
- Real-money execution on behalf of users invites investment-adviser/broker regulation the moment commercialization is considered. A tracker has none of that.
- Execution plumbing is large and off-goal.

## Consequences

- We can freely ingest read-only market data for valuation and "propose" suggestions.
- If execution is ever revisited, it would be a major new scope with its own ADR, custody design, and legal review.
