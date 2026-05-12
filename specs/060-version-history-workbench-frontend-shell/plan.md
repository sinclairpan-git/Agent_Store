# 060 Plan

聚合 AgentVersion 与生命周期版本摘要，在 Agent 详情首屏提供版本历史工作台，不新增真实升级、回退、下架、禁用、AgentVersion 写入或替代版本自动推荐。

1. 建立 060 阶段文档并挂入 program manifest。
2. 新增前端 `versionHistoryWorkbench` mock fixtures，覆盖 current stable、upgrade available、deprecated replacement、rollback available、security revoked 和缺 envelope 降级。
3. 新增 Vue root selector，按当前 Agent 映射版本历史摘要，缺 envelope 时保守降级。
4. 新增企业 Vue2 面板与样式，展示 current/latest/candidate/rollback/replacement、trust、affected scope、source 和 audit。
5. 更新前端静态验证并运行本地与 AI-SDLC 治理验证。

## Risks

| Risk | Control |
| --- | --- |
| 工作台被误解为升级执行器 | 文案和 verify 固定 `no auto upgrade / no installer execution` |
| 替代版本被本地自动选择 | fixtures 与组件固定 `explicit mapping only / no replacement algorithm` |
| revoked 状态被展示为可升级 | blocked fixture 固定 `security_revoked` 和 disabled action |
