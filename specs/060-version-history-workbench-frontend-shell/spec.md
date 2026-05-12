# 060 Version History Workbench Frontend Shell

PRD 已冻结 Agent 详情页必须展示版本历史，并在安装、升级、回退、废弃、禁用和替代版本场景中给出可执行但不越界的下一步动作。059 已补齐管理员风险工作台，本阶段补齐版本历史工作台首屏，把 AgentVersion、Package trust、Lifecycle、Installation records 和 Notification 摘要聚合为可扫描视图。

## Scope

- 新增 `versionHistoryWorkbench` 前端 mock fixtures，覆盖 current stable、upgrade available、deprecated replacement、rollback available、security revoked 和缺 envelope 降级。
- 在 Vue root 中新增 `selectedVersionHistoryWorkbench`，按当前 Agent 映射版本历史摘要，并在缺失时保守降级为 `version_history_unavailable`。
- 新增企业 Vue2 组件 `sdlc-version-history-workbench`，展示 current version、latest version、candidate/rollback/replacement、release status、artifact trust、affected install count、source-of-truth 和 audit fields。
- 将版本历史工作台插入 Agent 详情首屏，作为使用者、Owner 和安全/IAM 共用的版本事实入口。
- 更新静态 frontend verification，确保工作台不执行自动升级、不回滚、不下架、不改 AgentVersion、不绕过 lifecycle governance、不展示 raw evidence。

## Non-Goals

- 不实现真实升级、回退、下架、禁用、替代版本推荐算法或 AgentVersion 写入。
- 不下载包、不执行安装器、不启动 Runtime、不修改 installation 状态。
- 不展示 raw Trace、raw Evidence、用户明细或设备明细。
- 不覆盖 Lifecycle Governance、PolicyDecision、Package Validation 或 AgentOps 事实。

## Acceptance

- 页面必须展示 `version_history_workbench.v1`、current/latest version、release status、upgrade/rollback/replacement cue、artifact trust、affected scope、source-of-truth 和 audit fields。
- current stable 必须显示版本事实完整，但明确没有前端变更权。
- upgrade available 必须展示候选版本和下一步动作，但不自动升级。
- deprecated replacement / rollback available 必须展示显式映射，不本地选择替代版本。
- security revoked 或缺 envelope 时必须保守降级，不展示可升级成功或可运行。
- 验证必须覆盖 frontend static check、相关 pytest/ruff、AI-SDLC truth sync/audit、dry-run/run。

## Adversarial Review Synthesis

- Product / user view：用户和 Owner 需要在详情页看到版本历史、升级/回退/替代版本路径，而不是在生命周期、安装记录和通知面板之间拼接。
- Governance / lifecycle view：版本历史工作台只能聚合不可覆盖的 AgentVersion 与生命周期摘要，不得成为升级执行器、回退执行器或替代版本推荐策略。
