# Plan: Policy Approval Request

1. Run AI-SDLC dry-run before editing.
2. Add `policy_approval_request.v1` domain contract.
3. Add typed API with idempotency and validation errors.
4. Add OpenAPI contract and parser coverage.
5. Update contract registry traceability and cross-project appendix.
6. Verify with focused tests, ruff, full pytest, and AI-SDLC dry-run.

## Boundary

This is a request assembly contract only. AgentOps owns evaluation and response.
Store may dispatch a ready request but must not issue grants or infer approval.
