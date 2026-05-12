# 058 System Settings Workbench Frontend Shell

PRD 已冻结“系统设置”入口：管理员需要查看分类、标签、推荐位、镜像源、安装器配置和 AgentOps endpoint 状态。057 已补齐使用者侧安装记录工作台，本阶段补齐系统设置工作台首屏，把 Store 配置摘要和外部 endpoint 健康回显聚合为可扫描视图。

## Scope

- 新增 `systemSettingsWorkbench` 前端 mock fixtures，覆盖 ready、attention required、blocked 和缺 envelope 降级。
- 在 Vue root 中新增 `selectedSystemSettingsWorkbench`，按当前 Agent / tenant context 映射系统设置摘要，并在缺失时保守降级为 `settings_unavailable`。
- 新增企业 Vue2 组件 `sdlc-system-settings-workbench`，展示 taxonomy、recommendation slot、mirror source、installer config、AgentOps endpoint、source-of-truth 和 audit fields。
- 将系统设置工作台插入 Agent 详情首屏，作为管理员/平台侧配置摘要入口。
- 更新静态 frontend verification，确保工作台不写配置、不暴露 credential secret、不覆盖推荐算法、不启动安装器、不改 AgentOps endpoint。

## Non-Goals

- 不实现真实系统设置保存、分类/标签 CRUD、推荐位发布、镜像源切换或 installer config 写入。
- 不展示 endpoint secret、token、credential 原文或连接串。
- 不修改推荐算法、推荐权重、AgentOps endpoint 或安装器配置。
- 不替代单项治理面板；工作台只做配置摘要和下一步动作投影。

## Acceptance

- 页面必须展示 `system_settings_workbench.v1`、`settings_state`、taxonomy、recommendation slot、mirror source、installer config、AgentOps endpoint、source-of-truth 和 audit fields。
- ready 状态必须显示配置摘要可查看，但明确不代表前端可写配置。
- attention required 必须显示缺口和下一步动作，不本地修复 endpoint 或镜像配置。
- blocked 或缺 envelope 时必须保守降级，不能展示为 settings ready。
- 工作台必须明确 no settings mutation、no credential exposure、no recommendation override、no installer execution、no endpoint rewrite。
- 验证必须覆盖 frontend static check、相关 pytest/ruff、AI-SDLC truth sync/audit、dry-run/run。

## Adversarial Review Synthesis

- Product / admin view：管理员需要在详情页快速知道配置入口是否健康，尤其是推荐位、镜像源、安装器和 AgentOps endpoint 的缺口。
- Governance / security view：系统设置摘要不能变成配置写入器，不能泄露 endpoint secret，也不能绕过推荐、安装器或 AgentOps 的真实控制面。
