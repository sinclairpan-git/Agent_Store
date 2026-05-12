# 061 Listing Workbench Frontend Shell

PRD 已冻结一级导航中的“上架工作台”：Agent 开发者和 Owner 需要扫描我的草案、待修复、待审批、已发布版本、质量反馈、安装趋势和用户问题。060 已补齐版本历史工作台，本阶段补齐上架工作台首屏，把 Listing Wizard、Package Validation、Draft Review、Skill Registry、Quality Evidence、Installation Distribution 和 Feedback 摘要聚合为可扫描视图。

## Scope

- 新增 `listingWorkbench` 前端 mock fixtures，覆盖 draft active、fix required、pending approval、published active 和缺 envelope 降级。
- 在 Vue root 中新增 `selectedListingWorkbench`，按当前 Agent 映射上架工作台，并在缺失时保守降级为 `listing_workbench_unavailable`。
- 新增企业 Vue2 组件 `sdlc-listing-workbench`，展示 draft/review/published counts、quality feedback、install trend、user issues、source-of-truth 和 audit fields。
- 将上架工作台插入 Agent 详情首屏，作为开发者/Owner 的发布工作入口。
- 更新静态 frontend verification，确保工作台不发布版本、不审批、不改 Skill Registry、不写 Package Validation、不发送通知、不展示 raw evidence。

## Non-Goals

- 不实现真实草案创建、发布、拒绝、审批、版本写入或 Skill Registry 持久化。
- 不上传包、不运行扫描、不执行修复 Prompt、不自动应用 AI 生成字段。
- 不发送通知、不创建外部工单、不展示 raw Trace、raw Evidence、用户明细或设备明细。
- 不覆盖 Package Validation、Draft Review、Skill Registry、Quality Evidence、Installation Distribution 或 Feedback 的事实源。

## Acceptance

- 页面必须展示 `listing_workbench.v1`、draft counts、review queue、published versions、quality feedback、install trend、user issues、source-of-truth 和 audit fields。
- fix required 必须显示阻断 issue 和回到校验/字段确认动作，不能展示为可提交或已发布。
- pending approval 必须显示审核队列与 SLA，但不本地审批、不把 receipt 当作通过。
- published active 必须展示版本、安装趋势和反馈摘要，但不修改 AgentVersion 或生成发布说明。
- 缺 envelope 时必须保守降级为不可用，不把未知状态展示为健康。
- 验证必须覆盖 frontend static check、相关 pytest/ruff、AI-SDLC truth sync/audit、dry-run/run。

## Adversarial Review Synthesis

- Product / developer view：开发者不应该在上架向导、校验报告、草案审核、Skill Registry、反馈和安装分布之间拼接发布状态；需要一个高密度的上架工作台摘要。
- Governance / contract view：上架工作台只能聚合 Store-owned 和 AgentOps echo 摘要，不得成为发布执行器、审批执行器、Registry 写入器或证据原文查看器。
