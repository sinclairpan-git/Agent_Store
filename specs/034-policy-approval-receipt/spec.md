# 034 Policy Approval Receipt

033 建立了 Store 发起 AgentOps 审批请求的上游契约。034 补齐请求被 AgentOps 接收后的回执契约：`policy_approval_receipt.v1` 只表示 AgentOps 已接受、排队或拒绝请求 envelope，不表示 approval approved，也不表示 CapabilityGrant 已签发。

## Scope

- 新增 Policy Approval Receipt domain/API，消费 AgentOps receipt 并输出 Store receipt-only projection。
- 新增 OpenAPI contract，明确 receipt state、request binding、AgentOps receipt、Store projection 和 source-of-truth。
- 更新 Contract Registry traceability，确保新增合同可反查 producer/consumer/CCT/test。
- 更新 cross-project appendix，新增 Policy Approval Receipt V1 与 CCT-019。
- 单元与契约测试覆盖 accepted、pending、rejected、contract drift、request mismatch、idempotency。

## Non-Goals

- 不实现真实 AgentOps 网络调用、approval center 或 polling worker。
- 不产生 AgentOps PolicyDecision、approval decision 或 CapabilityGrant。
- 不改变 028 `policy_approval_echo.v1` 的最终状态消费边界。

## Acceptance

- receipt accepted/pending 可链接 approval flow，但 `approval_decision_final=false`。
- receipt rejected 或 unavailable 不得让 Store 展示 approved 或 grant。
- AgentOps receipt 必须绑定 originating `policy_approval_request.v1` 的 agent/version/action。
- Store projection 必须固定 `store_decision_authority=none`、`capability_grant_issued=false`。
