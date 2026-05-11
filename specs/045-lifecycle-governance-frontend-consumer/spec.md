# 045 Lifecycle Governance Frontend Consumer

031 已冻结 `lifecycle_governance_baseline.v1` 后端投影，覆盖 Agent/version 级 upgrade、rollback、deprecated、disabled 和 security_revoked。044 已让详情页展示反馈与 Owner response 闭环；本工作项继续补齐生命周期治理的前端消费，让 Owner / Security 能在 Agent 详情页看到版本状态、替代版本、回退版本、影响范围和下一步。

## Scope

- 在前端 fixture 中新增 `lifecycleGovernance`，覆盖 upgrade_available、rollback_available、disabled、security_revoked 和 blocked terminal downgrade。
- 在 Agent 详情页新增“生命周期治理”面板，展示 `lifecycle_governance_baseline.v1` 的 lifecycle state、previous state、transition action、actor、version scope、replacement、rollback、impact scope、source-of-truth、issue 和 next action。
- 缺摘要时保守降级为 `active`，只展示返回 lifecycle queue / refresh governance projection。
- 前端验证必须覆盖 security_revoked terminal、Owner/Security actor 分工、replacement/rollback/impact 必填、no AgentVersion mutation、no Runtime execution、no CapabilityGrant / AgentOps PolicyDecision override。

## Non-Goals

- 不修改 AgentVersion 存储、不执行真实升级/回退、不下发 Runtime 操作。
- 不替代 Skill Registry lifecycle；Skill Registry 继续管理 Skill status。
- 不签发 CapabilityGrant、不覆盖 AgentOps PolicyDecision。

## Acceptance

- upgrade/deprecate 展示 replacement version 和通知替代版本动作。
- rollback 展示 rollback version 和通知替代版本动作。
- disabled/security_revoked 展示 affected installation count 和通知动作。
- security_revoked 终态不可被普通 Owner downgrade；阻断 issue 必须可见。
- 静态前端验证覆盖 fixture、组件注册、shell prop、source-of-truth 和 non-goal 边界。
