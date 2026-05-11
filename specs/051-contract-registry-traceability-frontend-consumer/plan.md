# 051 Plan

消费 032 的 Store-owned `contract_registry_traceability.v1`，在 Agent 详情页提供只读合同追踪摘要，不扩展真实 registry、PR 扫描或 CI 状态能力。

1. 建立 051 阶段文档并挂入 program manifest。
2. 新增前端 `contractRegistryTraceability` mock fixture，保留 032 的 coverage summary、source-of-truth 和 traceability axes。
3. 新增 Vue root selector，按当前 Agent 映射 focus contract，缺 envelope 时保守降级。
4. 新增企业 Vue2 面板与样式，展示 coverage、focus contract、CCT、contract test 和只读边界。
5. 更新前端静态验证并运行本地、浏览器和 AI-SDLC 治理验证。

## Risks

| Risk | Control |
| --- | --- |
| UI 被误解为真实 registry 管理后台 | 文案和 verify 明确 read-only projection / no external registry service |
| 缺 envelope 时被视为 complete | fallback 固定 `incomplete` 且下一步为 `complete_contract_traceability` |
| 前端本地扫描 contract files | fixture 只消费 envelope，不读取文件系统或 PR / CI 状态 |
