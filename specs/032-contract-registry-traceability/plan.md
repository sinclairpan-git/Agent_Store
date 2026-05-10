# Plan: Contract Registry Traceability

1. Confirm AI-SDLC dry-run passes before editing.
2. Add domain projection for `contract_registry_traceability.v1`.
3. Add read-only API handler and OpenAPI contract.
4. Add unit/contract tests covering full OpenAPI file coverage and traceability axes.
5. Update cross-project appendix and roadmap archive.
6. Verify with focused tests, full tests, ruff, format check, and AI-SDLC dry-run.

## Design Notes

- The registry is deliberately static for this batch so it can be reviewed like a governance contract.
- CCT rows remain appendix-owned; registry entries point at CCT ids and contract test files.
- Local-only contracts may have empty `cct_ids`, but may not have empty owner, producer, consumers, or tests.
