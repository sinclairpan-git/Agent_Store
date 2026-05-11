# 047 Plan

1. 建立 047 阶段文档并挂入 program manifest。
2. 读取 033 / 034 domain/API 输出字段，按合同建立 request / receipt 前端 fixture。
3. 在 Vue 根实例新增 `selectedPolicyApprovalRequest`、`selectedPolicyApprovalReceipt` 和缺摘要 fallback。
4. 在企业 Vue2 adapter 新增 `sdlc-policy-approval-flow` 面板并接入详情页。
5. 更新前端静态验证，确保 Store 只展示 approval request / receipt 投影，不做 PolicyDecision、不 override、不签发 CapabilityGrant。
6. 运行 `npm run verify`、Python 验证、Playwright 渲染检查与 AI-SDLC close。

## Risk Controls

| 风险 | 控制 |
|---|---|
| receipt 被误展示为 approved | UI 和 verify 固定 `approval_decision_final=false` |
| Store 被误认为能授权或 override | store projection 固定 `store_decision_authority=none`、`store_override_allowed=false` |
| CapabilityGrant 被前端暗示已签发 | fixture / UI / verify 固定 `capability_grant_issued=false` |
| request 缺上下文却可分发 | policy context、justification、requester issue 阻断 dispatch |
