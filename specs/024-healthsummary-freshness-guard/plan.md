# 024 Plan

1. Freeze the HealthSummary freshness contract before UI expansion.
2. Implement a pure domain model that consumes AgentOps HealthSummary echo facts and projects freshness state.
3. Add an idempotent API handler with governed error envelopes.
4. Add OpenAPI and cross-project appendix coverage for producer / consumer / source-of-truth boundaries.
5. Render the summary in the existing Vue2 frontend without making recommendation, quality, L5, or Runtime execution inferences.
6. Verify with unit tests, contract tests, frontend verification, ruff, and AI-SDLC dry-run.

## Risks

- Risk: Treating expired HealthSummary as still healthy.
  Control: `valid_until <= now` always maps to `health_refresh_required` and display text “待刷新”.

- Risk: Store starts computing health or recommendation from AgentOps summary.
  Control: the model exposes `recommendation_basis_allowed=false` and source-of-truth marks recommendation as excluded.

- Risk: UI implies HealthSummary is an execution result or full Trace.
  Control: HealthSummary panel is separate from Runtime availability, AgentOps quality evidence, and trusted loop panels.
