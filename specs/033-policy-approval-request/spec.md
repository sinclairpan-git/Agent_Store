# 033 Policy Approval Request

028 已冻结 Store 对 AgentOps Policy / Approval 的 echo-only 投影，但阶段 3 的审批闭环还缺上游请求契约。033 建立 `policy_approval_request.v1`，让 Store 能以可审计方式向 AgentOps 发起审批请求，同时继续保持 AgentOps 是唯一决策、审批和 CapabilityGrant 事实源。

## Scope

- 新增 Policy Approval Request domain/API，输出 `policy_approval_request.v1`。
- 新增 OpenAPI contract，明确 request state、requester、policy context、justification、AgentOps request payload 和 Store projection。
- 更新 Contract Registry traceability，确保新增合同可反查 owner/producer/consumer/CCT/test。
- 更新 cross-project appendix，新增 Policy Approval Request V1 与 CCT-018。
- 单元与契约测试覆盖 ready、requester、policy context、justification、unsupported action 和 idempotency。

## Non-Goals

- 不实现真实 AgentOps 网络调用或 approval center。
- 不生成 AgentOps `approval_id`、PolicyDecision 或 CapabilityGrant。
- 不改变 028 `policy_approval_echo.v1` 的 echo-only 消费边界。

## Acceptance

- 只有 requester、policy context 和 justification 完整时，`request_state=approval_request_ready` 且 `agentops_request.dispatch_allowed=true`。
- Store projection 必须始终包含 `store_decision_authority=none`、`store_override_allowed=false`、`capability_grant_issued=false`。
- requester 缺失/未授权、policy context 不完整、justification 缺失和 unsupported action 均返回可解释 blocked issue。
- OpenAPI、contract registry、appendix CCT 和 tests 一起约束新增合同。
