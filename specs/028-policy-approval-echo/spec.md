# 028 Policy And Approval Echo

027 将草稿正式推进到 `pending_review`。本工作项承接 `028-policy-approval-echo`：Store 只回显 AgentOps 的 PolicyDecision / Approval 摘要，用于展示和路由，不覆盖裁决、不签发 CapabilityGrant。

## Scope

- 新增 `policy_approval_echo.v1` domain contract，消费 AgentOps-owned policy / approval echo。
- 新增幂等 API facade，输出 Store echo-only projection。
- 新增 OpenAPI contract，明确 Store 没有裁决权、不能 override、不能签发 grant。
- 单元与契约测试覆盖 allow、approval pending、deny、expired、unsupported echo 与 idempotency。

## Non-Goals

- 不实现 AgentOps Policy Service、Approval Center 或 CapabilityGrant。
- 不把 Store 变成 PolicyDecision 事实源。
- 不修改推荐算法、不从 HealthSummary 或 runtime 状态推导 policy 结论。

## Acceptance

- 响应必须包含 `source_of_truth.policy_decision=agentops` 与 `source_of_truth.approval=agentops`。
- 响应必须固定 `store_projection.projection_mode=agentops_echo_only`、`store_decision_authority=none`、`store_override_allowed=false`、`capability_grant_issued=false`。
- AgentOps allow + approved/not_required 才可返回 `policy_allowed` 与 `store_may_continue=true`。
- approval pending、approval expired、policy denied 或 unsupported echo 均不得让 Store 继续安装/发布动作。
- API 必须要求 `Idempotency-Key`，相同 key + 相同语义 payload 返回同一结果，相同 key + 不同 payload 返回 409。

## Adversarial Review Synthesis

- Product / user-flow view：Store 需要告诉用户“为什么卡住、去哪里处理”，但不应该复制 AgentOps 的审批工作台。
- Governance / contract view：PolicyDecision、Approval、CapabilityGrant 均属 AgentOps；Store 只能做 echo-only projection，避免 UI 或 API 本地改写 AgentOps 裁决。
