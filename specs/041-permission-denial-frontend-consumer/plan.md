# Plan: Permission Denial Frontend Consumer

## Scope

消费 038 的 Store-owned permission denial action summary，在前端详情页提供权限失败解释和下一步动作，不扩展真实授权、审批或策略裁决能力。

## Steps

1. 建立 041 阶段文档并挂入 program manifest。
2. 补充 `permissionDenialActions` 前端 fixture，覆盖五类权限失败和 raw URL stripped。
3. 在 Vue 根状态中新增选中 Agent 的 permission denial summary 选择器和 fallback。
4. 在企业 Vue2 adapter 中新增权限恢复组件并接入 shell。
5. 更新样式和前端验证脚本。
6. 运行 AI-SDLC、前端和后端相关验证后提交。

## Risk Controls

- `raw_trace_url` 与 `raw_evidence_url` 始终为空。
- `store_grant_issued` 与 `store_policy_override_allowed` 始终为 false。
- 缺可信身份或缺摘要时必须降级为 `denial_unavailable`。
