# 059 Admin Risk Workbench Frontend Shell

PRD 已冻结“管理员风险卡”：管理员 / 安全 / IAM 需要查看风险等级、证据缺失、越权记录、禁用/下架动作。058 已补齐系统设置摘要，本阶段补齐管理员风险工作台首屏，把 Policy、Permission、Quality Evidence、Package Validation、Lifecycle 和 Notification 摘要聚合为可扫描视图。

## Scope

- 新增 `adminRiskWorkbench` 前端 mock fixtures，覆盖 low risk、evidence gaps、policy blocked、security revoked 和缺 envelope 降级。
- 在 Vue root 中新增 `selectedAdminRiskWorkbench`，按当前 Agent 映射管理员风险摘要，并在缺失时保守降级为 `risk_unknown`。
- 新增企业 Vue2 组件 `sdlc-admin-risk-workbench`，展示 risk level、evidence gaps、policy/permission signal、security actions、audit refs、source-of-truth 和边界。
- 将管理员风险工作台插入 Agent 详情首屏，作为安全/IAM 角色的高密度摘要入口。
- 更新静态 frontend verification，确保工作台不执行禁用/下架、不签发 grant、不覆盖 AgentOps policy、不展示 raw Trace / raw Evidence、不泄露用户或设备明细。

## Non-Goals

- 不实现真实风险处置、禁用、下架、吊销传播或通知发送。
- 不展示 raw Trace、raw Evidence、用户明细、设备明细或 credential secret。
- 不覆盖 AgentOps PolicyDecision、Approval、QualityEvidence 或 Risk Center 事实。
- 不改变 AgentVersion / Skill / Installation 生命周期状态。

## Acceptance

- 页面必须展示 `admin_risk_workbench.v1`、`risk_level`、evidence gaps、policy/permission signal、security actions、source-of-truth 和 audit fields。
- low risk 必须显示可复核摘要，但明确没有前端处置权。
- evidence gaps 必须展示缺口并保持不可见原文边界。
- policy blocked / security revoked 必须展示阻断原因和下一步动作，不降级为 warning。
- 缺 envelope 时必须保守降级为 `risk_unknown`，不得展示安全可通过。
- 验证必须覆盖 frontend static check、相关 pytest/ruff、AI-SDLC truth sync/audit、dry-run/run。

## Adversarial Review Synthesis

- Product / security view：安全/IAM 需要一屏扫到高风险、证据缺失和禁用动作入口，而不是在多个面板之间拼接风险。
- Governance / security view：风险工作台只能聚合摘要和跳转动作，不得成为禁用执行器、Policy override、Grant issuer 或 raw evidence viewer。
