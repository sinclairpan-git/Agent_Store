# 059 Plan

聚合安全/IAM 视角的风险摘要，在 Agent 详情首屏提供管理员风险工作台，不新增真实处置、禁用、下架、Grant、Policy override 或 raw evidence 展示。

1. 建立 059 阶段文档并挂入 program manifest。
2. 新增前端 `adminRiskWorkbench` mock fixtures，覆盖 low risk、evidence gaps、policy blocked、security revoked 和缺 envelope 降级。
3. 新增 Vue root selector，按当前 Agent 映射管理员风险摘要，缺 envelope 时保守降级。
4. 新增企业 Vue2 面板与样式，展示 risk、evidence、policy、permission、security action、source 和 audit。
5. 更新前端静态验证并运行本地与 AI-SDLC 治理验证。

## Risks

| Risk | Control |
| --- | --- |
| 工作台被误解为禁用执行器 | 文案和 verify 固定 `no disable execution / no lifecycle mutation` |
| 风险摘要覆盖 AgentOps policy | boundary 固定 `no AgentOps policy override / no CapabilityGrant` |
| 证据缺失诱导 raw evidence 泄露 | fixtures 和组件固定 `no raw Trace / no raw Evidence / no user-device details` |
