# 030 Feedback And Owner Response Loop

029 建立了托管安装器预览。030 承接阶段 4 产品闭环：建立反馈生命周期与 Owner response 契约，覆盖 `submitted -> triaged -> owner_replied -> planned/fixed/rejected -> released`。

## Scope

- 新增 `feedback_owner_response_loop.v1` domain contract，约束反馈状态迁移、Owner 回复、release linkage 和 timeline。
- 新增幂等 API facade，输出可审计的 feedback lifecycle projection。
- 新增 OpenAPI contract，明确 supported transitions、Owner action 角色要求和 release link 要求。
- 单元与契约测试覆盖 triage、owner reply、planned/fixed/rejected/released、非法跳转、Owner 缺失、release link 缺失和 idempotency。

## Non-Goals

- 不实现评论系统、排名、商业化 marketplace 运营。
- 不发送真实通知、不生成 release notes、不修改 AgentVersion。
- 不把 feedback loop 作为 AgentOps policy / Runtime evidence 事实源。

## Acceptance

- 状态集合必须包含 `submitted`、`triaged`、`owner_replied`、`planned`、`fixed`、`rejected`、`released`。
- `owner_reply`、`plan`、`fix`、`reject`、`release` 必须由 `actor_role=owner` 执行。
- `release` 必须从 `fixed` 进入，并且必须包含 `release_ref`。
- 所有 transition 必须包含 actor、message、audit/trace，可写入 timeline。
- API 必须要求 `Idempotency-Key`，相同 key + 相同语义 payload 返回同一结果，相同 key + 不同 payload 返回 409。

## Adversarial Review Synthesis

- Product / user-flow view：用户需要看到“已提交、已分诊、Owner 已回复、已计划/已修复/已拒绝、已发布”的明确闭环，而不是开放式评论。
- Governance / contract view：Owner response 是可审计事实，不能让非 Owner 角色替 Owner 关闭反馈，也不能在没有 release linkage 时标记 released。
