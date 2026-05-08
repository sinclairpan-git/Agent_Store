# 015 Recommendation State 后端契约

## 背景

014 已把 C 端发现页和推荐决策面板落到前端，但推荐状态仍主要由前端 mock 字段拼装。下一阶段需要把 `recommendation_state` 提升为后端可测试、可契约化的响应模型，让推荐原因、缺失证据、阻断项、下一步动作和事实源边界可以被 API 与 OpenAPI 同时验证。

## 目标

- 新增 recommendation state view model，输出 `recommendation_state`、`why_recommended`、`why_not`、`missing_evidence`、`trust_blockers`、`next_best_action`、`source_of_truth`、`trace_id` 与 `audit_id`。
- 新增 API handler，基于 catalog source 与 AgentOps summary 生成推荐决策。
- 新增 OpenAPI 契约，纳入现有 contract loader 校验。
- 覆盖负向验收：无 AgentOps summary、summary degraded 或 L5 gate 缺失时，不得默认展示实际 L5。

## 非目标

- 不实现个性化排序、学习模型、用户画像或推荐打分引擎。
- 不接入真实 AgentOps HTTP、数据库、IAM 或 KMS。
- 不改变前端安装/激活动作仍为可审计预览的边界。

## 验收标准

- `RecommendationStateAPI` 对已知 Agent 返回稳定 envelope，包含推荐决策对象。
- AgentOps 不可用时推荐状态降级，`actual_l5_display_allowed=false`，并返回 `agentops_summary` 缺失证据。
- 未知 Agent 返回治理型 `AGENT_NOT_FOUND` 错误。
- OpenAPI contract parse gate 覆盖 `recommendation-state.openapi.yaml`。
- `ai-sdlc run --dry-run`、相关 pytest、ruff、program validate 与 truth audit 通过。
