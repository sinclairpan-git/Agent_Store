# 028 Plan

1. Freeze `policy_approval_echo.v1` as the Store projection of AgentOps-owned policy and approval facts.
2. Add domain state mapping for allowed, approval pending, approval expired, denied, and unavailable echo states.
3. Add idempotent API facade and OpenAPI contract.
4. Cover Store echo-only invariants with unit, API, and contract-loader tests.
5. Verify with focused pytest, full pytest, ruff, and AI-SDLC dry-run.

## Risks

- Risk: Store accidentally becomes the policy authority.
  Control: response fixes `store_decision_authority=none`, `store_override_allowed=false`, and AgentOps source-of-truth labels.

- Risk: Approval expiry is shown as still approved.
  Control: projection computes effective approval status from AgentOps `expires_at` and routes to refresh.

- Risk: Unknown AgentOps decisions are locally interpreted.
  Control: unsupported decision/status becomes `agentops_echo_unavailable` and routes to AgentOps refresh.
