# 024 HealthSummary Freshness Guard

021 将 Runtime 分层后的 P0-C 归档为下一批需求：Agent Store 可以展示 AgentOps HealthSummary 摘要，但必须把 `valid_until` 作为硬边界。过期、缺失或无法解析的新鲜度不得继续展示为有效健康结论，也不得参与推荐判断。

## Scope

- 新增 `health_summary_freshness.v1` domain model 和 API handler。
- 新增 `health-summary-freshness.openapi.yaml`，冻结 AgentOps HealthSummary echo 输入、Store freshness projection 输出、状态枚举和 source-of-truth。
- 消费 AgentOps 提供的 `health_summary_id`、`health_state`、`calculated_at`、`valid_until`、观测窗口和信号计数等摘要字段。
- UI 增加 HealthSummary freshness 摘要，展示 machine state、中文展示、原因、有效期、下一步动作、事实源和审计字段。
- 更新 cross-project contract appendix，明确 Agent Store 只投影健康摘要新鲜度，不计算质量、不替代推荐或 PolicyDecision。

## Non-Goals

- 不实现真实 AgentOps HTTP 调用、HealthSummary 生产、健康评分计算或 Evidence 原文展示。
- 不把 HealthSummary 当作推荐排序、Actual L5、PolicyDecision 或 CapabilityGrant 的依据。
- 不修改 Agent Runtime 可用性判断；Runtime availability 已由 023 覆盖。
- 不改变 Ai_AutoSDLC standalone 使用路径。

## Acceptance

- 没有 AgentOps HealthSummary echo 时返回 `health_unavailable`，下一步为申请 AgentOps health summary。
- `valid_until` 缺失或格式无法解析时返回 `health_invalid`，不得展示为有效健康结论。
- 当前时间超过 `valid_until` 时返回 `health_refresh_required`，中文展示为“待刷新”，下一步为刷新 AgentOps health summary。
- 新鲜但 `health_state` 为 `degraded`、`unhealthy` 或 `unknown` 时返回 `health_attention_required`，只展示需关注摘要和 AgentOps 跳转。
- 新鲜且 `health_state=healthy` 时返回 `health_fresh`，但响应仍必须标记 `recommendation_basis_allowed=false`。
- 响应必须包含 `source_of_truth.health_summary=agentops`、`source_of_truth.summary_projection=agent_store`、`source_of_truth.recommendation=recommendation_state_excludes_health_summary`、`source_of_truth.policy_decision=agentops`。
- UI 不得把 HealthSummary 摘要扩展成完整 Trace、质量评分、Actual L5 或推荐依据。

## Adversarial Review Synthesis

- Product / user-flow view：用户需要看到健康摘要是否新鲜，否则过期的“健康”状态会误导安装或上架判断。
- Governance / contract view：HealthSummary 是 AgentOps 事实；Store 只能做可解释展示和刷新路由，不能用它替代 QualityEvidence、L5 gate、PolicyDecision 或 Runtime execution。
