# 023 Plan

1. Define the Runtime availability summary contract before UI expansion.
2. Implement a pure domain model that consumes Store-owned AgentManifest fields and Runtime echo/probe facts.
3. Add an idempotent API handler with governed error envelopes.
4. Add OpenAPI and cross-project appendix coverage for producer / consumer / source-of-truth boundaries.
5. Render the summary in the existing Vue2 frontend without making frontend trust or Runtime execution inferences.
6. Verify with unit tests, contract tests, frontend verification, ruff, and AI-SDLC dry-run.

## Risks

- Risk: Treating no Runtime echo as “probably runnable”.
  Control: no echo/probe maps to `runtime_missing` and a blocked issue.

- Risk: Store starts acting like Runtime.
  Control: the API only projects supplied echo/probe facts and emits remediation actions.

- Risk: UI accidentally implies L5 or execution success.
  Control: Runtime panel is separate from AgentOps L5 and evidence panels and labels source-of-truth explicitly.
