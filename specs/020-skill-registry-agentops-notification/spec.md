# 020 Skill Registry AgentOps Notification

019 已把 Skill Registry publish / deprecate / security_revoked 生命周期固化为 Agent Store 事实。下一步需要把这些 Store-owned lifecycle facts 以稳定通知契约交给 AgentOps 消费，同时保持 AgentOps 只接收、缓存和审计，不写回 Skill Registry。

## Scope

- 新增 `skill_registry_notification.v1` / `skill_registry_notification_ack.v1` 契约，冻结 Agent Store 到 AgentOps 的通知 payload 与 receipt metadata。
- 新增 AgentOps Skill Registry notice consumer test client，消费 019 的成功 lifecycle decision。
- 覆盖 publish、deprecate、security_revoked 三类通知。
- 覆盖 outbound idempotency、payload hash、defensive copy、AgentOps unavailable 不缓存失败。
- 更新跨项目 contract appendix，明确 Agent Store 是 Skill Registry 事实源，AgentOps ack 不得改变 Skill record。

## Non-Goals

- 不实现真实 AgentOps webhook、消息队列、数据库 outbox 或后台重试器。
- 不把 AgentOps ack 作为 Skill Registry 状态事实，不新增 AgentOps 写入 Skill 的路径。
- 不实现上架向导 UI、Owner 审批台、真实 package upload / scan adapter。

## Acceptance

- 只有 019 返回 `error_code=OK`、无 issues、event 存在、`agentops_consumption.notify_required=true` 且 `source_of_truth.skill_registry=agent_store` 时才能通知 AgentOps。
- 通知 payload 必须包含完整 immutable Skill record、event、source_of_truth、trace/audit、idempotency key 和 payload hash。
- AgentOps ack 只能返回 delivery receipt metadata：`delivery_attempt_id`、`sent_at`、`agentops_ack_id`、`request_payload_hash`、`response_payload_hash` 等，不得返回替代 Skill fact。
- `security_revoked` 通知必须保留 evidence reference 和终端安全状态。
- 同一 outbound idempotency key + 同一 payload replay 返回同一 ack；同 key + 不同 payload 稳定冲突。
- AgentOps unavailable 时抛出 pending/retryable 风格错误，不缓存失败，不改变 Skill Registry status。

## Adversarial Review Synthesis

- PRD / product-flow view：020 必须是 018/019 的下游通知，不得成为绕过 Package Validation、Owner approval 或 terminal security status 的发布捷径。UI/流程语义上要区分“Store 已发布/撤销”与“AgentOps 已接收通知”。
- Governance / contract view：通知 schema 必须冻结；payload 必须带完整 Skill record 与 source-of-truth；ack 只能表达 receipt metadata；idempotency 与 hash 要让审计能证明“精确 Store fact 已投递且未被 AgentOps 改写”。
