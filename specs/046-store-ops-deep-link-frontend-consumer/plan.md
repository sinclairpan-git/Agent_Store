# 046 Plan

1. 建立 046 阶段文档并挂入 program manifest。
2. 读取 035 domain/API 输出字段，按合同建立前端 fixture。
3. 在 Vue 根实例新增 `selectedStoreOpsDeepLink` 和缺摘要 fallback。
4. 在企业 Vue2 adapter 新增 `sdlc-store-ops-deep-link` 面板并接入详情页。
5. 更新前端静态验证，确保 Store 只展示 sanitized AgentOps Run Detail，不暴露 raw Trace/raw Evidence，也不执行真实 AgentOps/Evidence Vault 流程。
6. 运行 `npm run verify`、Python 验证、Playwright 渲染检查与 AI-SDLC close。

## Risk Controls

| 风险 | 控制 |
|---|---|
| raw Trace / Evidence URL 泄露 | fixture、组件和 verify 固定 `raw_trace_url: ""` / `raw_evidence_url: ""` 与 exposure=false |
| 缺 run/session 仍展示跳转 | `link_unavailable` fallback 和 RUN_ID/SESSION_ID issue 阻断 |
| 无权限 viewer 被误导可跳转 | `permission_required` 固定 Evidence Vault 下一步 |
| Store 被误认为执行 AgentOps 跳转事实 | source-of-truth 固定 AgentOps run detail，Store 只展示 sanitized projection |
