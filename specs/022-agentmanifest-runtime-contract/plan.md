# 022 Plan

1. Add AgentManifest runtime validation domain model and API handler.
2. Freeze `agent_manifest_runtime_contract.v1` as an OpenAPI contract.
3. Add unit tests for complete manifest, missing required runtime fields, capability mismatch, and source-of-truth boundaries.
4. Add contract tests for OpenAPI parse coverage and runtime mismatch semantics.
5. Update the cross-project appendix and stage execution evidence.

## Risks

- Risk: Duplicating 018 Package Validation.
  Control: 022 only validates Runtime-facing AgentManifest contract fields and capability compatibility.

- Risk: Store starts making Runtime facts.
  Control: response source_of_truth marks Runtime availability as Runtime echo/probe, while AgentManifest remains Store-owned.

- Risk: Missing capability is treated as warning.
  Control: mismatch produces blocked issue and `runtime_capability_missing` compatibility status.

