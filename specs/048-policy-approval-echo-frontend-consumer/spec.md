# 048 Policy Approval Echo Frontend Consumer

028 已冻结 `policy_approval_echo.v1`，让 Store 只回显 AgentOps-owned PolicyDecision / Approval 摘要，不覆盖裁决、不签发 CapabilityGrant。047 已补齐 approval request / receipt 链路；本工作项继续把最终 echo-only 投影接入 Agent 详情页，让用户能看到 AgentOps 是否允许继续、是否等待审批、是否过期或被拒绝。

## Scope

- 在前端 fixture 中新增 `policyApprovalEchoes`，覆盖 policy_allowed、approval_pending、approval_expired、policy_denied 和 agentops_echo_unavailable fallback。
- 在 Agent 详情页新增“Policy Echo”面板，展示 `policy_approval_echo.v1` 的 echo state、PolicyDecision、Approval summary、Store projection、source-of-truth、issue 和 next action。
- 缺 echo 时保守降级为 `agentops_echo_unavailable`，只展示刷新 AgentOps policy echo 的下一步。
- 前端验证必须覆盖 `agentops_echo_only`、`store_decision_authority=none`、`store_override_allowed=false`、`capability_grant_issued=false`、`store_may_continue` 只来自 AgentOps allow/approved。

## Non-Goals

- 不实现 AgentOps Policy Service、Approval Center 或 CapabilityGrant。
- 不把 Store 变成 PolicyDecision、Approval 或 CapabilityGrant 事实源。
- 不从 HealthSummary、Runtime 或本地 catalog 推导 policy allowed。

## Acceptance

- policy_allowed 展示 `continue_store_flow`，同时仍显示 no override / no CapabilityGrant。
- approval_pending 展示 AgentOps approval 跳转，不得显示 Store may continue。
- approval_expired 展示 refresh action 和过期 issue。
- policy_denied 展示 blocking policy action，不得展示 allowed 或 grant。
- 静态前端验证覆盖 fixture、组件注册、Shell prop、source-of-truth 和 echo-only non-goal 边界。
