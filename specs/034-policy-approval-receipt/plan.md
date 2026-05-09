# Plan: Policy Approval Receipt

1. Run AI-SDLC dry-run before editing.
2. Add `policy_approval_receipt.v1` domain projection.
3. Add API idempotency and request-body validation.
4. Add OpenAPI contract and contract parser assertions.
5. Update Contract Registry traceability and cross-project appendix.
6. Verify with focused tests, ruff, full pytest, and AI-SDLC dry-run.

## Boundary

Receipt is a link/acknowledgement fact from AgentOps. Store may route users to
AgentOps approval center, but final allow/deny still comes from
`policy_approval_echo.v1`.
