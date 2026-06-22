# Wealth Steward

A single-user wealth tracker with a proactive AI agent (the Monitor) at its core. See `CONTEXT.md` for the domain language and `docs/adr/` for architectural decisions.

## Agent skills

### Issue tracker

Issues are tracked as GitHub issues via the `gh` CLI; external PRs are not a triage surface. See `docs/agents/issue-tracker.md`.

### Triage labels

Uses the five default triage labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
