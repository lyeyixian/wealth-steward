# Wealth Steward

A single-user **wealth tracker** with a proactive AI agent at its core. It mirrors the user's finances (cash via a headless Actual Budget ledger, plus an own-built wealth layer for investments, loans, and FIRE projections) and runs an agent that monitors that state, surfaces what matters, and edits the user's records under a tiered-autonomy authority model. See ADRs for architectural decisions.

## Language

### The agent

**Monitor**:
The proactive agent loop. Triggered by events (statement imported, month rollover, threshold crossed) or schedule; it gathers financial state, reasons about it, and produces proposals, alerts, and auto-actions. The system's centerpiece.
_Avoid_: bot, assistant (the reactive chat interface is a later, separate surface over the same tools)

**Proposal**:
A concrete, reviewable record mutation the agent drafts and queues for the user to approve, edit, or reject (e.g. "recategorize these 12 transactions Dining→Groceries"). Only executes on approval.
_Avoid_: suggestion, recommendation (those are prose advice, not an executable queued action)

**Auto-action**:
A record mutation the agent applies on its own without approval, allowed only for low-risk, high-confidence cases (e.g. confident categorization). Every auto-action is logged and reversible.
_Avoid_: automatic change

**Alert**:
An informational output of the Monitor that needs no action and mutates nothing — a heads-up or nudge (bill due soon, low balance, FIRE milestone). The third Monitor output type alongside [[#Proposal]] (action to approve) and [[#Auto-action]] (action applied).
_Avoid_: notification (the delivery channel), warning

**Job**:
A discrete Monitor capability (categorize, bill-remind, anomaly-flag, FIRE-refresh, …) with its own trigger, prompt/tools, authority rules, and eval set, run through the shared harness. Deterministic jobs use no LLM. See [[0007-monitor-harness-event-schedule-modular-jobs]].
_Avoid_: task, handler (implementation term)

**Confidence**:
Grounds for trusting an agent decision enough to auto-apply it. In this project confidence is **evidence-based** (a track record — e.g. an earned rule), deliberately *not* the LLM's self-reported certainty, which is not trusted to gate writes. See [[0004-evidence-based-categorization-autonomy]].

**Rule**:
A deterministic payee→category mapping in the Cash Ledger. A rule is *earned* when the user confirms a categorization, which both creates the rule and makes that payee auto-categorizable thereafter. The rule boundary is the autonomy boundary (rule → auto-action; no rule → proposal).
_Avoid_: filter, mapping

### The data split

**Cash Ledger**:
The system of record for cash-side data (transactions, cash/credit accounts, categories, payees), owned by a headless Actual Budget instance and accessed via its API.
_Avoid_: the database, Actual (when speaking about our data, name the concept not the vendor)

**Wealth Layer**:
Our own store for concepts Actual cannot represent: investment holdings (position-level), loans (with amortization), CPF/EPF balances, FIRE scenarios, and net-worth history.
_Avoid_: the wealth db

**Holding**:
A position-level investment record: a security (ticker/identifier) with current quantity and current price (from a read-only market feed), grouped by asset class. Enables portfolio/allocation views and rebalancing *proposals*. No per-lot cost basis is tracked — there is no capital-gains tax in SG/MY to justify tax-lots.
_Avoid_: lot, position (use "holding")

**Loan**:
A liability modelled by its principal, interest rate, and term, from which an amortization schedule is generated. Each scheduled payment is split into principal (a saving) and interest (an expense). Supports payoff projection and extra-payment / rate-change scenarios. Deterministic; no AI.
_Avoid_: debt (debt is the broader category incl. revolving credit-card balances)

**Restricted Retirement Assets**:
CPF (Singapore) / EPF (Malaysia) balances — forced-savings retirement funds that are illiquid until statutory age and partly use-restricted. Tracked as a bucket distinct from liquid Invested Capital, and modelled as the Phase-2 income floor in the [[#FIRE-Number]]. See [[sg-my-financial-context]].
_Avoid_: retirement savings (ambiguous), pension

### Currency

**Base Currency**:
The single user-chosen currency (e.g. SGD) all aggregate figures are expressed in. Conversion to base happens at the read/aggregation layer.
_Avoid_: home currency, default currency

**Native Currency**:
The currency an individual account, holding, or loan is denominated in — the stored source of truth. CPF is SGD-native, EPF is MYR-native. Distinct from [[#Base-Currency]], into which natives are converted for figures.
_Avoid_: local currency, account currency

**FX Rate**:
A dated exchange rate from a daily, backfilled, read-only rate table. Figures use the rate that applied at the relevant *time*: snapshots lock the rate at snapshot date; flows convert at per-transaction-date rate (see [[0008-multi-currency-base-and-temporal-fx]]).
_Avoid_: exchange rate, conversion rate

### Projections & history

**Net-Worth History**:
A time series of Net Worth built from periodic (default monthly) **snapshots** of all asset and liability values at that point — not retroactively recomputed, since historical prices/balances aren't always recoverable.
_Avoid_: net worth chart (that's a view of this series)

**Scenario**:
A named set of parameter overrides (safe-withdrawal rate, retirement age, expected returns, inflation, CPF/EPF income, extra loan payments, savings rate) applied to projections such as the FIRE Number and Time to FIRE, letting the user compare financial futures.
_Avoid_: simulation, what-if (use "scenario")

### Wealth figures

**Net Worth**:
The overall scorecard: **all** assets (cash + investments + property + vehicles + other) minus **all** liabilities (loans + credit balances). Includes the primary residence's equity. Tracked over time.
_Avoid_: wealth, total assets (assets alone omit liabilities)

**Invested Capital**:
The return-generating subset of assets that can actually fund retirement — investments — **excluding the primary residence**. The figure the FIRE target is computed against. Always ≤ Net Worth. CPF/EPF balances are *restricted* retirement assets and are tracked as a distinct bucket, not folded into liquid Invested Capital (see [[sg-my-financial-context]]).
_Avoid_: savings (savings is cash; invested capital is deployed), investable assets, portfolio

**Savings Rate**:
Full-picture basis: **(savings + employee CPF/EPF + employer CPF/EPF) / (take-home income + employee CPF/EPF + employer CPF/EPF)**. CPF/EPF is forced savings and is included in both numerator and denominator from day one; it is computed from gross salary + age (or ingested), since it never appears in bank statements. Canonical sub-rules: transfers into one's own investment/savings accounts and **debt principal** repayment count as *saving*; **debt interest** is an *expense*; internal transfers are neither income nor expense.
_Avoid_: savings ratio

**Take-home income**:
Cash income actually received in bank accounts (net of CPF/EPF and any deductions). The visible-in-statements income figure; distinct from gross salary.
_Avoid_: net income, salary (ambiguous between gross and take-home)

**FIRE Number**:
The target capital, defined **two-phase**: (1) *bridge* capital to cover full annual expenses from now until CPF LIFE / EPF payout age, plus (2) capital to cover the post-payout *shortfall* (expenses minus the CPF LIFE/EPF income floor) at the chosen safe-withdrawal rate. Its inputs (SWR, retirement age, CPF/EPF income, return rate, inflation) are the adjustable scenario parameters.
_Avoid_: FIRE target, 25x rule (that simple rule is explicitly rejected for this region)

**Time to FIRE**:
A projection — not the target — of how long until Invested Capital reaches the FIRE Number, given current Invested Capital, Savings Rate, and assumed returns.
_Avoid_: FIRE date
