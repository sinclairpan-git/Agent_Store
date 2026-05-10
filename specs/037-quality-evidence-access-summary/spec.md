# Spec: Quality Evidence Access Summary

036 已补齐 Owner 安装分布的聚合回显。037 承接 PRD 中 Quality / Evidence Summary 的展示与权限边界：Agent Store 必须展示 AgentOps 质量证据摘要、缺失证据、模板与有效期状态，但不能在 Store 内计算质量分，也不能暴露 raw Trace / raw Evidence URL。

## Goals

- 新增 `quality_evidence_access_summary.v1`，把 AgentOps `quality_evidence` 和 `run_evidence` 投影为 Store/UI 可展示摘要。
- 未授权 viewer 返回 redacted summary，并指向 Evidence Vault 申请入口。
- `valid_until` 过期时展示 `待刷新`，且不得作为推荐依据。
- 未被接受的 `score_template_id` 降级为 `template_deprecated`。
- 所有 raw Trace / raw Evidence URL 必须剥离，响应中保持空字符串和 `raw_*_exposed=false`。

## Non-Goals

- 不实现真实 AgentOps HTTP client、Evidence Vault IAM 或数据库持久化。
- 不在 Agent Store 内计算质量分、重写 score template 或裁决 raw evidence 权限。
- 不替代 `agentops_summary.v1`；本阶段只新增 Store 展示/权限投影契约。

## Acceptance Criteria

- 单元测试覆盖 ready、redacted、expired、template deprecated、raw link stripped 和 unavailable 状态。
- 合同测试覆盖 API envelope、idempotency、validation、OpenAPI 枚举与 raw URL 常量约束。
- Contract Registry 新增 `quality_evidence_access_summary.v1`，映射 CCT-022。
- 跨项目 appendix 新增 CCT-022，并更新 Agent Store / AgentOps PRD required update 行。
