# 061 Plan

聚合上架与发布摘要，在 Agent 详情首屏提供开发者/Owner 上架工作台，不新增真实发布、审批、Registry 写入、扫描执行、通知发送或 raw evidence 展示。

1. 建立 061 阶段文档并挂入 program manifest。
2. 新增前端 `listingWorkbench` mock fixtures，覆盖 draft active、fix required、pending approval、published active 和缺 envelope 降级。
3. 新增 Vue root selector，按当前 Agent 映射上架工作台，缺 envelope 时保守降级。
4. 新增企业 Vue2 面板与样式，展示 drafts/review/published、quality feedback、install trend、user issues、source 和 audit。
5. 更新前端静态验证并运行本地与 AI-SDLC 治理验证。

## Risks

| Risk | Control |
| --- | --- |
| 工作台被误解为发布执行器 | 文案和 verify 固定 `no publish execution / no registry mutation` |
| pending approval 被误判为 approved | fixtures 与组件固定 `receipt not approval / no local approval` |
| 质量或安装趋势被前端推导 | source-of-truth 固定 AgentOps / Installation Distribution 摘要，前端只展示 |
