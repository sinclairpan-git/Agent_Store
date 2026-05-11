# 046 Store Ops Deep Link Frontend Consumer

035 已冻结 `store_ops_deep_link.v1` 后端投影，用 AgentOps health / run summary 和 viewer context 生成可审计的 Run Detail 跳转，同时强制剥离 raw Trace / raw Evidence URL。045 已补齐生命周期治理面板，本工作项继续把 Store -> Ops deep link 投影接入 Agent 详情页，让用户能看到 run/session binding、权限状态、净化状态和下一步。

## Scope

- 在前端 fixture 中新增 `storeOpsDeepLinks`，覆盖 deep_link_ready、link_sanitized、permission_required 和 link_unavailable。
- 在 Agent 详情页新增“Store -> Ops 深链”面板，展示 `store_ops_deep_link.v1` 的 link state、permission state、health summary id、run/session binding、evidence summary id、target、return path、source-of-truth、issue 和 next action。
- 缺摘要时保守降级为 `link_unavailable`，只展示申请 AgentOps run/session binding。
- 前端验证必须覆盖 raw_trace_url / raw_evidence_url 为空、raw exposure 为 false、run/session 缺失阻断、Evidence Vault 权限路径和 sanitized Run Detail 边界。

## Non-Goals

- 不实现真实 AgentOps HTTP、Evidence Vault 申请流或权限中心。
- 不展示完整 Trace Timeline、raw Trace URL、raw Evidence URL 或 Evidence 原文。
- 不把 HealthSummary 或 QualityEvidence 重新计算为推荐依据。

## Acceptance

- 有 run_id + session_id 且 viewer 有权限时，展示 `deep_link_ready` 和 `open_agentops_run_detail`。
- 上游携带 raw link 时，展示 `link_sanitized`、`RAW_TRACE_LINK_STRIPPED`，且 target raw URL 保持空字符串。
- viewer 无权时展示 `permission_required`，下一步为 Evidence Vault access request。
- 缺 run_id/session_id 时展示 `link_unavailable`，下一步为请求 AgentOps summary with run binding。
- 静态前端验证覆盖 fixture、组件注册、Shell prop、source-of-truth 和 raw trace/evidence non-goal 边界。
