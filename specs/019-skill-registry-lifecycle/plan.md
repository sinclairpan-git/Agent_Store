# 019 实施计划

1. 建立 019 阶段文档，绑定 PRD 阶段 2 的 Skill Registry publish / deprecate / security_revoked 第一片。
2. 新增 Skill Registry 领域模型，定义 record、issue、event、next_action、AgentOps consumption 和 source-of-truth。
3. 新增 Skill Registry API handler，支持 publish、status transition、idempotency、duplicate conflict 与 not found error。
4. 新增 OpenAPI contract，并纳入 contract loader 校验。
5. 新增 unit/contract tests，覆盖发布、审批/校验阻断、高风险说明、废弃、安全吊销和幂等。
6. 运行本地验证、AI-SDLC truth sync/audit、dry-run 与 close gate。

## 风险与控制

- 风险：把 AgentOps 当成 Skill Registry 写入方。
  控制：source-of-truth 固定为 Agent Store，AgentOps 字段仅表达 consumption / notice。
- 风险：把 security_revoked 做成可逆普通状态。
  控制：领域模型将 security_revoked 作为 terminal safety signal。
- 风险：发布绕过 Package Validation 或 Owner 审批。
  控制：publish 前置条件同时检查 `approval_status=approved` 与 `package_validation.validation_status=passed`。
