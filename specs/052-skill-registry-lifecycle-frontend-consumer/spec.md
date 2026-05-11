# 052 Skill Registry Lifecycle Frontend Consumer

019 已冻结 `skill_registry.v1` 后端/API 契约，020 又冻结了 `skill_registry_notification.v1` / `skill_registry_notification_ack.v1` 的 AgentOps 下游通知边界。051 已让详情页展示 Contract Registry traceability；本阶段继续补齐 Skill Registry 生命周期在 Agent 详情页的前端消费，让 Owner / reviewer 能看到 Skill 是否已发布、废弃、安全撤销或被注册门禁阻断，以及 AgentOps 是否只是 receipt-only 消费方。

## Scope

- 在前端 mock fixtures 中新增 `skillRegistryLifecycle`，覆盖 published、deprecated、security_revoked 和 registration_blocked。
- 在 Vue root 中新增 `selectedSkillRegistryLifecycle`，按当前 Agent 选择 Skill Registry 决策，并在缺失时保守降级为 `registration_blocked`。
- 新增企业 Vue2 组件 `sdlc-skill-registry-lifecycle`，展示 registry record、lifecycle event、AgentOps consumption、notification ack、source-of-truth、issue 和下一步动作。
- 更新静态 frontend verification，确保 `skill_registry.v1`、`skill_registry_notification.v1`、`skill_registry_notification_ack.v1`、AgentOps receipt-only 边界和 no publish bypass 可被机器检查。

## Non-Goals

- 不实现真实 Skill Registry 数据库、搜索索引、后台管理 UI、AgentOps webhook、消息队列或 outbox 重试器。
- 不把 AgentOps ack 解释为 Skill Registry 状态事实，不允许 AgentOps 改写 Skill record。
- 不绕过 Package Validation、Owner approval、security evidence 或 security_revoked 终态。

## Acceptance

- 页面必须展示 `skill_registry.v1`、`skill_registry_notification.v1`、`skill_registry_notification_ack.v1`、`registry_status`、`skill`、`event`、`agentops_consumption` 和 notification receipt。
- published / deprecated / security_revoked 必须展示对应 lifecycle event 和 AgentOps 通知状态。
- registration_blocked 必须展示 issue 与 `return_to_validation`，不得显示为已通知 AgentOps。
- 组件必须明确 Store 是 Skill Registry 事实源，AgentOps ack 只是 receipt，不代表状态改写。
- 验证必须覆盖 frontend static check、相关 pytest/ruff、AI-SDLC truth sync/audit、dry-run/run 与浏览器验证。

## Adversarial Review Synthesis

- Product / reviewer view：Owner 需要在详情页看到上架审核后 Skill Registry 的最终状态、阻断原因和 AgentOps 通知 receipt，而不是只看到“草案已提交”。
- Governance / contract view：019/020 的边界很硬：Store owns Skill Registry；AgentOps consumes only；ack 不能成为状态事实，也不能绕过 Package Validation / Owner approval / security evidence。
