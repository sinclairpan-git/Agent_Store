# 031 Lifecycle Governance Baseline

030 建立了反馈与 Owner response 闭环。031 承接阶段 5 生命周期治理：建立 Agent/version 级别的 upgrade、rollback、deprecated、disabled、security_revoked 与替代版本影响范围契约。

## Scope

- 新增 `lifecycle_governance_baseline.v1` domain contract，表达 Agent version lifecycle transition。
- 新增幂等 API facade，输出 lifecycle decision、replacement mapping、rollback mapping 与 impact scope。
- 新增 OpenAPI contract，明确 security revocation 终态、owner/security actor 要求、replacement/rollback/impact 必填约束。
- 单元与契约测试覆盖 upgrade、rollback、deprecated、disabled、security_revoked、security_revoked 终态不可降级和 idempotency。

## Non-Goals

- 不修改 AgentVersion 存储、不执行真实升级/回退、不下发 Runtime 操作。
- 不替代 Skill Registry lifecycle；Skill Registry 继续管理 Skill status。
- 不签发 CapabilityGrant、不覆盖 AgentOps PolicyDecision。

## Acceptance

- 状态集合必须包含 `active`、`upgrade_available`、`rollback_available`、`deprecated`、`disabled`、`security_revoked`。
- `upgrade` / `deprecate` 必须绑定 replacement version。
- `rollback` 必须绑定 rollback version。
- `disable` / `security_revoke` 必须带 affected installation count。
- `security_revoke` 必须由 `actor_role=security` 且带 evidence / incident reference。
- `security_revoked` 是终态，不得降级为 deprecated / disabled / upgrade / rollback。
- API 必须要求 `Idempotency-Key`，相同 key + 相同语义 payload 返回同一结果，相同 key + 不同 payload 返回 409。

## Adversarial Review Synthesis

- Product / user-flow view：用户和 Owner 需要知道当前版本是否有升级、回退、替代版本，以及禁用/安全撤销影响多少安装。
- Governance / contract view：Agent/version lifecycle 与 Skill Registry lifecycle 分层；security_revoked 是最强安全信号，不可被普通 owner lifecycle action 降级。
