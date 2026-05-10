# 035 Store Ops Deep Link

034 补齐了 Policy Approval receipt。035 承接 PRD `AS-CT-011 Store -> Ops Deep Link`：Store 的健康/证据摘要必须能跳转到 AgentOps Run Detail，但不得在 Store 内暴露无权限 Trace 原文或 Evidence 原文。

## Scope

- 新增 `store_ops_deep_link.v1` domain/API projection。
- 新增 OpenAPI contract，冻结 run/session binding、permission state、raw trace stripping 和 Evidence Vault fallback。
- 更新 Contract Registry traceability 与 cross-project appendix，新增 CCT-020。
- 单元与契约测试覆盖可跳转、缺 run/session、无权限、raw trace/evidence URL 被剥离和 idempotency。

## Non-Goals

- 不实现真实 AgentOps HTTP、Evidence Vault 申请流或权限中心。
- 不展示完整 Trace Timeline、raw Trace URL 或 Evidence 原文。
- 不改变 `health_summary_freshness.v1` 的 freshness / recommendation 边界。

## Acceptance

- 有 `run_id` + `session_id` 且 viewer 有权限时，返回 `deep_link_ready` 和 AgentOps Run Detail action。
- 缺 `run_id` 或 `session_id` 时，返回 `link_unavailable`，下一步要求 AgentOps 重新提供 run binding。
- viewer 无权限时，返回 `permission_required`，下一步指向 Evidence Vault access request。
- 上游传入 `raw_trace_url` 或 `raw_evidence_url` 时，响应必须清空 raw URL，`raw_trace_exposed=false`，并返回 `RAW_TRACE_LINK_STRIPPED`。
