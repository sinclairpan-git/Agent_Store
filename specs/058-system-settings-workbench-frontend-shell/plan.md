# 058 Plan

聚合系统设置摘要，在 Agent 详情首屏提供管理员侧配置工作台，不新增真实配置写入、推荐位发布、镜像源切换、安装器执行或 AgentOps endpoint 修改。

1. 建立 058 阶段文档并挂入 program manifest。
2. 新增前端 `systemSettingsWorkbench` mock fixtures，覆盖 ready、attention required、blocked 和缺 envelope 降级。
3. 新增 Vue root selector，按当前 Agent 映射系统设置摘要，缺 envelope 时保守降级。
4. 新增企业 Vue2 面板与样式，展示 taxonomy、recommendation、mirror、installer、AgentOps endpoint、source 和 audit。
5. 更新前端静态验证并运行本地与 AI-SDLC 治理验证。

## Risks

| Risk | Control |
| --- | --- |
| 工作台被误解为配置写入入口 | 文案和 verify 固定 `no settings mutation` |
| endpoint secret 泄露 | fixtures 与组件只展示状态和 redacted ref，固定 `no credential exposure` |
| 推荐位摘要覆盖推荐算法 | boundary 固定 `no recommendation override` |
