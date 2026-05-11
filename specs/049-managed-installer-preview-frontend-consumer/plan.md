# 049 Plan

消费 029 的 Store-owned `managed_installer_preview.v1`，在 Agent 详情页提供可解释的托管安装预览状态机，不扩展真实安装执行能力。

1. 复用 040-048 的前端 consumer 模式，新增 mock fixtures、Vue root selector 和 shell prop。
2. 新增 `sdlc-managed-installer-preview` 企业 Vue2 面板，展示五步、gate、诊断和 source-of-truth。
3. 为 preview 缺失提供保守降级，不从 catalog 或 policy echo 推导安装通过。
4. 扩展 frontend verification，固定 preview-only、real_install_started=false、no CapabilityGrant 边界。
5. 运行 frontend verify、pytest、ruff、truth sync/audit、AI-SDLC dry-run/run，并记录结果。

## Risks

| Risk | Control |
| --- | --- |
| 前端被误读为已执行安装 | 面板和验证固定 `preview-only`、`real_install_started=false`、`not_started_preview_only` |
| Policy pending 被误当作 allowed | policy gate 独立展示 `store_may_continue`，pending/denied 走 blocked |
| Runtime Handoff 缺失时继续展示安装通过 | selector fallback 固定 blocked，下一步为刷新/修复 preview |
| 诊断引用撑破移动端布局 | 面板使用稳定 grid 与 `overflow-wrap:anywhere` |
