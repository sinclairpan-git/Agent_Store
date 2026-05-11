# 047 Policy Approval Frontend Consumer

033 / 034 已冻结 `policy_approval_request.v1` 和 `policy_approval_receipt.v1`，把 Store 发起审批请求与 AgentOps 回执拆成两个只读投影。046 已补齐 Store -> Ops 深链；本工作项继续把审批 request / receipt 接入 Agent 详情页，让 Owner / Security 能看到请求是否可分发、AgentOps 是否已接收、以及 receipt 不等于最终 approval 的边界。

## Scope

- 在前端 fixture 中新增 `policyApprovalRequests` 和 `policyApprovalReceipts`，覆盖 approval_request_ready、policy_context_incomplete、justification_required、approval_request_blocked、approval_receipt_accepted、approval_receipt_pending、approval_receipt_rejected 和 approval_receipt_unavailable。
- 在 Agent 详情页新增“Policy Approval”面板，展示 request state、receipt state、requester、policy context、AgentOps request、approval request ref、AgentOps receipt、Store projection、source-of-truth、issue 和 next action。
- 缺 request / receipt 摘要时保守降级为 blocked / unavailable，只展示补齐 policy context 或刷新 AgentOps receipt 的下一步。
- 前端验证必须覆盖 Store decision authority none、store_override_allowed=false、capability_grant_issued=false、approval_decision_final=false、AgentOps 是唯一 policy / approval / CapabilityGrant 事实源。

## Non-Goals

- 不实现真实 AgentOps HTTP、approval center、polling worker 或权限中心。
- 不生成 AgentOps PolicyDecision、approval decision 或 CapabilityGrant。
- 不把 receipt accepted/pending 展示为 approved。

## Acceptance

- request ready 时展示 dispatch_allowed=true 和 `submit_agentops_approval_request`。
- policy context / justification / requester / unsupported action 阻断必须展示 issue 和修复动作。
- receipt accepted/pending 展示 AgentOps approval flow linkage，但 `approval_decision_final=false`。
- receipt rejected/unavailable 不得展示 approved 或 grant。
- 静态前端验证覆盖 fixture、组件注册、Shell prop、source-of-truth 和 no decision/no grant 边界。
