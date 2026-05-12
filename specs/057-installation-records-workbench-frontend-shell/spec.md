# 057 Installation Records Workbench Frontend Shell

PRD 已冻结“安装与运行记录”入口：使用者需要查看我的安装、设备、版本、升级、运行健康、禁用/下架通知和下一步动作。056 已补齐 Owner 治理工作台，本阶段补齐使用者侧安装记录工作台首屏，把已有 Installation、Runtime handoff、Runtime availability、HealthSummary、Lifecycle 和 Notification 摘要聚合成可扫描视图。

## Scope

- 新增 `installationRecordsWorkbench` 前端 mock fixtures，覆盖 installed healthy、activation required、upgrade available、revoked/blocked 和缺 envelope 降级。
- 在 Vue root 中新增 `selectedInstallationRecordsWorkbench`，按当前 Agent 映射安装记录工作台，并在缺失时保守降级为 `records_unavailable`。
- 新增企业 Vue2 组件 `sdlc-installation-records-workbench`，展示 installation state、device binding、version、upgrade cue、health cue、revocation notice、source-of-truth 和 audit fields。
- 将安装记录工作台插入 Agent 详情首屏，靠近 Owner 工作台和推荐决策入口。
- 更新静态 frontend verification，确保工作台不执行真实安装、不启动 Runtime、不展示 raw Trace / raw Evidence、不把 HealthSummary 作为推荐依据、不绕过 policy/approval。

## Non-Goals

- 不实现真实安装记录 API、设备绑定注册、卸载、升级、回滚或 Runtime 启动。
- 不展示 installation/user/device 明细列表或 raw Trace / raw Evidence。
- 不改变 AgentVersion、Lifecycle 状态或 PolicyDecision。
- 不替代单项面板；工作台只聚合可解释状态和下一步动作。

## Acceptance

- 页面必须展示 `installation_records_workbench.v1`、`installation_state`、`device_binding_state`、version、upgrade cue、health cue、revocation notice、source-of-truth 和 audit fields。
- installed healthy 必须显示可运行/健康摘要，但明确健康由 AgentOps 回显且不作为推荐依据。
- activation required 必须显示 device binding / runtime handoff 的下一步，不伪造 installed。
- upgrade available 必须展示候选版本和替代/升级动作，但不自动升级。
- revoked/blocked 或缺 envelope 时必须保守降级，不展示可运行或可升级成功。
- 验证必须覆盖 frontend static check、相关 pytest/ruff、AI-SDLC truth sync/audit、dry-run/run。

## Adversarial Review Synthesis

- Product / user view：使用者不应在安装器、Runtime、健康和通知面板之间猜当前安装状态；需要一个“我的安装”摘要。
- Governance / contract view：工作台只能聚合 Store/Ops/Runtime 摘要，不能变成安装执行器、Runtime launcher、证据查看器或 Policy bypass。
