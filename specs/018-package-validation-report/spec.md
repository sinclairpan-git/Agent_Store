# 018 Package Validation Report

## 背景

PRD 阶段 2 要落地上架向导、包校验、修复 Prompt、Skill Registry 与校验报告。001-017 已完成阶段 1 可信闭环和 C 端推荐状态消费，本阶段开始承接阶段 2 的第一片：把“上传/连接来源后的包校验结果”固化为可测试 API 契约，避免上架向导先做成不可验证的前端表单。

## 范围

- 新增 Package Validation 领域模型，输出字段级 issue、影响说明、修复动作和修复 Prompt。
- 新增 `PackageValidationAPI.validate_package`，对候选 `package_manifest` 返回可审计 validation report。
- 新增 OpenAPI 契约 `package-validation.openapi.yaml`，纳入 contract parse gate。
- 覆盖 PRD 阶段 2 的关键规则：`unknown` / `TODO` 不得进入正式审核；AI 生成字段必须声明来源；高风险 Skill 必须补风险说明；Skill 必须有 schema reference。
- 保留 Skill Registry 事实源边界：本阶段只返回 `agent_store_skill_registry_pending`，不注册正式 Skill。

## 非目标

- 不实现真实包上传、真实静态扫描、SBOM 生成或代码仓连接。
- 不实现完整上架向导 UI、Owner 审批台或通知系统。
- 不把 AI 生成字段升级为治理事实。
- 不接入真实数据库、IAM、AgentOps 或 Skill Registry 发布流程。

## 验收

- 完整候选包返回 `validation_status=passed`、`draft_status=pending_review` 和 `submit_for_review` 下一步。
- 缺 Owner、TODO/unknown 占位、高风险 Skill 无说明时返回字段级 blocked issue 与修复 Prompt。
- 缺 Skill schema 时返回字段级 issue，且报告保留对 AgentOps 消费边界的解释。
- OpenAPI contract parse gate 覆盖 Package Validation response envelope、fix report 与 idempotency conflict error。
- 输出前必须完成两个对抗专家视角评审，并把合议优化结论写入执行日志。
