# 025 Plan

1. Freeze `installation_runtime_handoff.v1` before expanding installer or Runtime orchestration.
2. Implement a pure domain model that projects Store-owned Installation and DeviceBinding facts into Runtime-consumable handoff state.
3. Add an idempotent API handler with governed error envelopes and auth-context checks.
4. Add OpenAPI and cross-project appendix coverage for producer / consumer / source-of-truth boundaries.
5. Verify with unit tests, contract tests, ruff, and AI-SDLC dry-run.

## Risks

- Risk: Treating `artifact_hash` mismatch as a warning.
  Control: mismatch always maps to `artifact_hash_mismatch`, `runtime_consumption_allowed=false`, blocked issue, and `regenerate_activation_command`.

- Risk: Runtime handoff becomes a Runtime execution API.
  Control: response source-of-truth marks Runtime consumption as Runtime echo/request and does not include process state, Trace, Grant, credential, or execution result.

- Risk: Device binding identity is partially matched.
  Control: `installation_id`, `device_id`, and `artifact_hash` are checked independently and produce explicit blocked states.
