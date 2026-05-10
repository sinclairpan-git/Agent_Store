# Plan: Permission Denial Action Summary

1. 运行 AI-SDLC adapter status 与 dry-run，确认治理入口可用。
2. 冻结 `permission_denial_action_summary.v1` OpenAPI contract。
3. 新增 domain projector：输入 trusted viewer / permission decision / scenario facts，输出 UI-safe denial action summary。
4. 新增幂等 API facade，覆盖 request validation 和 idempotency conflict。
5. 更新 Contract Registry、cross-project appendix 和 program manifest truth。
6. 运行单元、契约、ruff、AI-SDLC dry-run / run 验证。

## Risks

- 风险：把 Store 的 action summary 误写成授权裁决。
  Control: `source_of_truth` 明确 IAM / AgentOps / Evidence Vault；响应暴露 `store_grant_issued=false` 和 `store_policy_override_allowed=false`。
- 风险：证据原文 URL 通过权限失败页面泄露。
  Control: raw URL 字段在 contract 中固定为空字符串，domain 始终返回 `raw_trace_exposed=false` / `raw_evidence_exposed=false`。
- 风险：未认证或 spoofed viewer 仍得到可执行审批入口。
  Control: 缺 trusted auth 时降级为 `denial_unavailable`，主动作改为 `refresh_identity`。
