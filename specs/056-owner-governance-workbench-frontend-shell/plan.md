# 056 Plan

聚合已冻结的 Owner 治理事实源，在 Agent 详情首屏提供 Owner 工作台摘要，不新增真实队列、审批、通知发送或版本变更。

1. 建立 056 阶段文档并挂入 program manifest。
2. 新增前端 `ownerGovernanceWorkbench` mock fixtures，覆盖 pending、healthy、blocked 和缺 envelope 降级输入。
3. 新增 Vue root selector，按当前 Agent 映射 Owner 工作台，缺 envelope 时保守降级。
4. 新增企业 Vue2 面板与样式，展示 pending counts、风险、下一步动作、source-of-truth、audit fields 和边界。
5. 更新前端静态验证并运行本地与 AI-SDLC 治理验证。

## Risks

| Risk | Control |
| --- | --- |
| 工作台被误解为真实审批队列 | 文案与 verify 固定 `no real approval / no notification sending` |
| 聚合状态覆盖 AgentOps 裁决 | fixtures 与组件声明 echo-only，不产生 PolicyDecision 或 CapabilityGrant |
| Owner 操作误改版本生命周期 | action copy 和 boundary 固定 `no AgentVersion mutation` |
