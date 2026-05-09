# 027 Draft Review Submission

026 建立了 Listing Wizard shell，只把草案推进到 `prepare_draft_review_submission`。本工作项承接 `027-draft-review-submission`：冻结草案提交审核的后端契约，只有 Package Validation passed、Owner 明确确认、Runtime Gate ready 且无 TODO/unknown/TBD/N/A 占位值时，才允许进入 `pending_review`。

## Scope

- 新增 `draft_review_submission.v1` domain contract，消费 Listing Wizard snapshot 与 Owner confirmation。
- 新增 Draft Review Submission API 契约，支持幂等提交与冲突检测。
- 新增 OpenAPI 合同，明确 `pending_review`、validation blocked、runtime gate blocked、owner confirmation required 四类结果。
- 单元与契约测试覆盖成功入队、Owner 未确认、validation failed、Runtime Gate blocked、placeholder 二次拦截和 idempotency。

## Non-Goals

- 不实现真实审核工作流、人工审批、PolicyDecision 或 CapabilityGrant。
- 不创建 AgentVersion、不发布 Agent、不合入 Skill Registry。
- 不绕过 018 Package Validation、023 Runtime availability 或 026 Listing Wizard shell。

## Acceptance

- 只有 `validation_report.step_state=passed`、`field_confirmation.step_state=confirmed`、Owner confirmation 显式确认且 Runtime availability 为 `runtime_ready` 时，响应才可包含 `draft_status=pending_review`。
- TODO/unknown/TBD/N/A 占位值必须在提交审核前再次阻断，即使上游 snapshot 被篡改为 passed。
- Runtime Gate 未 ready 时必须返回 `runtime_gate_blocked`，下一步指向 `agent_runtime`。
- Owner 未确认时必须返回 `owner_confirmation_required`，且不得写入 review queue。
- API 必须要求 `Idempotency-Key`，相同 key + 相同语义 payload 返回同一结果，相同 key + 不同 payload 返回 409。
- OpenAPI 响应必须继续满足 `schema_version / trace_id / error_code` envelope 检查。

## Adversarial Review Synthesis

- Product / user-flow view：Owner 点击提交审核时需要一个明确结果，不应该只看到 package validation 的建议状态。
- Governance / contract view：018 的 `draft_status=pending_review` 是校验报告的可提交建议；027 才是正式进入 review queue 的状态变更，必须绑定 Owner accountability、Runtime 可消费事实和占位值二次拦截。
