# Provider-agnostic models via PydanticAI (LiteLLM later)

The agent must not be locked to a single model vendor — we want to switch to cheaper or open-source/local models over time. The agent therefore depends on a **provider-abstraction layer**, never a vendor SDK directly.

- **Now:** **PydanticAI** is the agent framework. It gives first-class approve-before-execute HITL (matches [[0004-evidence-based-categorization-autonomy]]), `pydantic-evals` for the calibration harness, native multi-provider support, and OpenTelemetry-native tracing. We start with its native providers (Claude first).
- **Later, only if needed:** introduce a **LiteLLM proxy** behind PydanticAI (OpenAI-compatible endpoint) when we want gateway features — centralized cost tracking/budgets, fallbacks/load-balancing, rate-limiting, response caching, and access to providers PydanticAI doesn't natively wrap. We do not run it until it earns its keep.

This explicitly **rules out the Claude Agent SDK** despite its strong HITL, because it is Claude-locked.

## Trade-off accepted

We give up *automatic* Claude-specific optimizations — prompt caching (cost saver as few-shot examples grow) and extended thinking — and accept that weaker open/local models may lower categorization quality. This is acceptable because the **eval/calibration harness is what makes model-switching safe**: swap model → re-run the eval set → compare accuracy and cost with data. Provider-agnosticism plus the eval harness is itself a portfolio artifact ("compare Claude vs GPT vs local, switch with confidence").
