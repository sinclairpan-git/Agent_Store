# 031 Development Summary

## 完成内容

- 新增 Lifecycle Governance Baseline domain/API，输出 `lifecycle_governance_baseline.v1`。
- 状态机覆盖 `active`、`upgrade_available`、`rollback_available`、`deprecated`、`disabled`、`security_revoked`。
- upgrade/deprecate 绑定 replacement version；rollback 绑定 rollback version；disable/security_revoke 绑定影响范围。
- security_revoke 要求 security actor 和 evidence / incident reference；security_revoked 不可被降级。
- 新增 OpenAPI contract、contract parser 测试、单元测试和 API 契约测试。

## 边界说明

- 不执行真实升级、回退、禁用或 Runtime 下发。
- 不替代 Skill Registry lifecycle。
- 不签发 CapabilityGrant、不覆盖 AgentOps PolicyDecision。

## 后续建议

031 完成后，031 之前的规划批次已覆盖当前 roadmap 的近期阶段；下一步可进入 PR/守护闭环或按新 roadmap 继续拆分。
