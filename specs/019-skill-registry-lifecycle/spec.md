# 019 Skill Registry Lifecycle

## 背景

018 已把 Package Validation report 固化为后端契约，并把候选 Skill 的事实源标记为 `agent_store_skill_registry_pending`。PRD 阶段 2 还要求 Skill Registry 支持注册、查询、废弃、禁用 / `security_revoked`，且 AgentOps 只消费 Agent Store 管理的 Skill Registry 事实。

本阶段承接 018 的后续建议，先落地 Skill Registry 生命周期的最小可验收后端契约：approved + validation passed 的 Skill candidate 可发布为 AgentOps-consumable registry record；已发布 Skill 可进入 deprecated 或 security_revoked；security revocation 必须带审计证据。

## 范围

- 新增 Skill Registry 领域模型，描述 publish、deprecate、security_revoked 的 record、event、issue、AgentOps consumption notice 与 source-of-truth。
- 新增 `SkillRegistryAPI.publish_skill` 与 `SkillRegistryAPI.update_skill_status`，支持 Idempotency-Key、稳定 error envelope 和内存 registry。
- 新增 `skill-registry.openapi.yaml`，纳入 contract loader。
- 覆盖 PRD 阶段 2 的 Skill Registry 关键规则：未通过 Package Validation 或未审批不得发布；高风险 Skill 必须有风险说明；security_revoked 必须有 incident / evidence ref；AgentOps 为消费者，不成为 Skill Registry 事实源。

## 非目标

- 不实现真实数据库、搜索索引、权限系统、AgentOps webhook 或异步通知。
- 不实现完整 Owner 工作台、上架向导 UI 或真实 package upload / scan adapter。
- 不允许 security_revoked 回退为 deprecated / published。

## 验收标准

- 合法 Skill candidate 返回 `registry_status=published`、`skill.status=published`、`skill_published` event 和 `notify_agentops_consumers` 下一步。
- 未审批、Package Validation 未通过、高风险无说明时返回字段级 issue，并保持 AgentOps consumption 为 `not_ready`。
- 已发布 Skill 可 deprecate，并返回 `skill_deprecated` event 与 AgentOps notice。
- security revoke 缺 evidence 时阻断；带 evidence 时返回 `skill_security_revoked` event 和 `notify_agentops_security_revocation`。
- OpenAPI contract parse gate 覆盖 publish / transition response envelope、409 conflict 与 404 not found。
