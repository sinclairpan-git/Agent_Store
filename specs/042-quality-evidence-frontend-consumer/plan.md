# Plan: Quality Evidence Frontend Consumer

## Scope

消费 037 的 Store-safe quality evidence access summary，在前端详情页展示 AgentOps 质量证据摘要、Evidence Vault 访问边界和降级动作，不扩展真实授权、证据拉取或质量评分能力。

## Steps

1. 建立 042 阶段文档并挂入 program manifest。
2. 补充 `qualityEvidenceAccess` 前端 fixture，覆盖 ready、redacted、expired 和 deprecated score template。
3. 在 Vue 根状态中新增选中 Agent 的 quality evidence access summary 选择器和 fallback。
4. 在企业 Vue2 adapter 中新增质量证据访问组件并接入 shell。
5. 更新样式和前端验证脚本。
6. 运行 AI-SDLC、前端和后端相关验证后提交。

## Risk Controls

- `raw_trace_url` 与 `raw_evidence_url` 始终为空。
- `raw_trace_exposed` 与 `raw_evidence_exposed` 始终按摘要显示为 false。
- 缺摘要时必须降级为 `summary_unavailable`，只展示 AgentOps 刷新动作。
- 前端只展示 `recommendation_basis_allowed`，不得根据质量字段推导推荐或 L5。
