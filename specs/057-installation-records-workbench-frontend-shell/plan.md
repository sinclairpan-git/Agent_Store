# 057 Plan

聚合已冻结的安装与运行摘要，在 Agent 详情首屏提供使用者侧安装记录工作台，不新增真实安装、升级、卸载、Runtime 启动或 raw evidence 展示。

1. 建立 057 阶段文档并挂入 program manifest。
2. 新增前端 `installationRecordsWorkbench` mock fixtures，覆盖 installed healthy、activation required、upgrade available、revoked blocked 和缺 envelope 降级。
3. 新增 Vue root selector，按当前 Agent 映射安装记录工作台，缺 envelope 时保守降级。
4. 新增企业 Vue2 面板与样式，展示 installation/device/version/upgrade/health/revocation/source/audit。
5. 更新前端静态验证并运行本地与 AI-SDLC 治理验证。

## Risks

| Risk | Control |
| --- | --- |
| 工作台被误解为真实安装器 | 文案和 verify 固定 `no real install / no Runtime launch` |
| 健康摘要被用于推荐 | fixtures 和组件固定 `health_summary_not_recommendation_basis` |
| revoked 状态被降级为普通错误 | blocked fixture 固定 revocation notice 和 disabled next action |
