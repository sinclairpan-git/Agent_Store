# 056 Owner Governance Workbench Frontend Shell

阶段 5 已冻结 Owner 生命周期治理、反馈闭环、安装分布、审批回显和质量证据摘要等事实源；055 后 Agent 详情页已经具备逐项消费面板。本阶段补齐 PRD 中的 Owner 治理入口，把这些 Store-owned 与 AgentOps echo-only 摘要聚合成一个可扫描的 Owner 工作台首屏，用于 Owner 处理待办、风险和下一步动作。

## Scope

- 新增 `ownerGovernanceWorkbench` 前端 mock fixtures，覆盖待处理、健康、阻断和缺 envelope 降级。
- 在 Vue root 中新增 `selectedOwnerGovernanceWorkbench`，按当前 Agent 映射 Owner 工作台，并在缺失时保守降级为 `attention_required`。
- 新增企业 Vue2 组件 `sdlc-owner-governance-workbench`，展示 Owner 队列状态、待办摘要、风险摘要、下一步动作、事实源和审计字段。
- 将 Owner 工作台插入 Agent 详情首屏，作为跨面板扫描入口。
- 更新静态 frontend verification，确保工作台只聚合既有事实源，不执行审批、不修改 AgentVersion、不发送通知、不覆盖 AgentOps 裁决。

## Non-Goals

- 不实现真实 Owner queue、真实审批、真实通知发送或后台任务分配。
- 不修改 AgentVersion、Skill Registry、Installation 或 AgentOps PolicyDecision。
- 不展示 raw Trace / raw Evidence / 用户或设备明细。
- 不替代已有单项面板；工作台只做摘要聚合与导航动作。

## Acceptance

- 页面必须展示 `owner_governance_workbench.v1`、`queue_state`、Owner、pending counts、risk summary、next actions、source-of-truth 和 audit fields。
- 待处理状态必须能聚合 draft review、policy approval、feedback、lifecycle、installation distribution 与 package validation 类事项。
- 健康状态必须显示无待处理阻断，但仍保留 source-of-truth 与审计字段。
- 阻断或缺 envelope 时必须展示保守降级，不得把未知状态当作可发布或可合规。
- 工作台 copy 和 verification 必须明确 no real approval、no AgentVersion mutation、no notification sending、no AgentOps override。
- 验证必须覆盖 frontend static check、相关 pytest/ruff、AI-SDLC truth sync/audit、dry-run/run。

## Adversarial Review Synthesis

- Product / Owner view：Owner 不应该在十几个详情面板之间盲找下一步；需要一个高密度但不越界的工作台摘要。
- Governance / contract view：工作台只能聚合 Store 已有事实源和 AgentOps echo，不得产生新的审批结果、PolicyDecision、CapabilityGrant 或生命周期状态变更。
