# 048 Plan

1. 建立 048 阶段文档并挂入 program manifest。
2. 读取 028 domain/API 输出字段，按合同建立 policy approval echo 前端 fixture。
3. 在 Vue 根实例新增 `selectedPolicyApprovalEcho` 和缺摘要 fallback。
4. 在企业 Vue2 adapter 新增 `sdlc-policy-approval-echo` 面板并接入详情页。
5. 更新前端静态验证，确保 Store 只展示 AgentOps echo-only projection，不覆盖 PolicyDecision、不签发 CapabilityGrant、不本地推导 policy allowed。
6. 运行 `npm run verify`、Python 验证、Playwright 渲染检查与 AI-SDLC close。

## Risk Controls

| 风险 | 控制 |
|---|---|
| pending/expired 被误当作 allowed | fixture 和 UI 固定 `store_may_continue=false` |
| Store 被误认为能 override AgentOps | projection 和 verify 固定 `store_override_allowed=false` |
| CapabilityGrant 被暗示已签发 | projection 和 UI 固定 `capability_grant_issued=false` |
| 缺 echo 时前端自推导 policy | fallback 固定 `agentops_echo_unavailable` 与 refresh action |
