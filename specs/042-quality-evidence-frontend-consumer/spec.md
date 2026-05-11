# Spec: Quality Evidence Frontend Consumer

037 已交付 `quality_evidence_access_summary.v1` 后端投影。042 负责把该摘要接到 Agent Store 前端详情页，让用户能看到 AgentOps 质量证据摘要的展示状态、Evidence Vault 访问边界、有效期和模板降级，而不让 Store 前端本地计算质量或暴露 raw Trace / raw Evidence。

## Goals

- 在前端 mock/API fixture 中暴露 `qualityEvidenceAccess`，覆盖 ready、redacted、expired 和 template deprecated 状态。
- 在 Agent 详情页新增“质量证据访问”面板，展示 summary state、permission state、display、run binding、Evidence Vault access、source-of-truth、issue 和 next action。
- raw Trace / raw Evidence URL 必须固定为空，页面必须明确 Store 不展示原文。
- `recommendation_basis_allowed` 必须来自后端摘要；前端不得把质量摘要本地计算成推荐依据。
- 前端验证脚本必须覆盖 fixture、Vue 根状态、shell prop、组件注册和关键边界文案。

## Non-Goals

- 不实现真实 AgentOps HTTP 调用。
- 不实现 Evidence Vault IAM 或 raw evidence 授权。
- 不修改 037 API 语义，不引入 Store-owned quality score。
- 不改变 recommendation_state、HealthSummary 或 PermissionDenial 的既有 contract。

## Acceptance Criteria

- `frontend/src/mock-data.js` 包含 `quality_evidence_access_summary.v1` fixture，并覆盖 ready/redacted/expired/template deprecated。
- `frontend/src/app.js` 输出 `selectedQualityEvidenceAccess`，缺摘要时保守降级为 `summary_unavailable` 并请求 AgentOps 刷新。
- `frontend/src/sdlc-enterprise-vue2.js` 注册 `sdlc-quality-evidence-access` 并接入 `sdlc-shell`。
- `frontend/index.html` 将 `selectedQualityEvidenceAccess` 传入 shell。
- `frontend/scripts/verify-frontend.mjs` 对 raw URL stripped、Evidence Vault action、AgentOps refresh、score template refresh 和 no Store quality calculation 边界进行静态验证。
