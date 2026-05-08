# 018 实施计划

1. 建立 018 阶段文档，绑定 PRD 阶段 2 的上架向导/包校验/修复 Prompt 第一片。
2. 新增 Package Validation 领域模型，定义 issue、fix prompt、validation status、draft status 和 source-of-truth 边界。
3. 新增 Package Validation API handler，支持 idempotency、稳定 error envelope 和 validation report。
4. 新增 OpenAPI contract，并纳入现有 contract loader 校验。
5. 新增 unit/contract tests，覆盖通过、可修复、阻断、AI 来源和幂等冲突。
6. 运行本地验证、program truth sync/audit 与 AI-SDLC close gate。

## 风险与控制

- 风险：把启发式校验误表述为真实包扫描。
  控制：source_of_truth 标注为 `agent_store_upload_candidate` / `agent_store_package_validation`，不声明 SBOM 或静态扫描已真实执行。
- 风险：AI 生成字段进入治理事实。
  控制：未声明 `field_sources.*.source_id` 时返回 blocked issue；response 明确 `candidate_only_until_user_confirmed`。
- 风险：Skill Registry 边界过早扩大。
  控制：本阶段仅输出候选 Skill 校验报告，Skill Registry source 标记为 pending。
