# The AI agent is the product; wealth management is the domain

The project serves three goals — a personal wealth tool, a portfolio piece demonstrating production-grade AI agent/harness engineering, and potential side income. When these conflict, **the portfolio/AI-agent goal wins.** Concretely: wealth management is the substrate the agent operates on, not the thing we over-invest in. We will deliberately avoid rebuilding commodity personal-finance machinery (statement parsing, ledger CRUD, charting) from scratch where an existing tool can provide it, so engineering effort concentrates on the agent layer. Single-user is acceptable; commercialization is a later, conditional concern.

## Consequences

- Architecture and code quality are optimized for being demoable and explainable, not for multi-tenant scale.
- A feature is worth building only if it (a) the user personally needs it, or (b) it showcases agent engineering. Features that are merely "table stakes for a finance app" are candidates to borrow rather than build.
