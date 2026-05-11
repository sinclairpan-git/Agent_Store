# 050 Plan

消费 027 的 Store-owned `draft_review_submission.v1`，在 Agent 详情页提供正式草案提交审核结果，不扩展真实审核或发布能力。

1. 复用 040-049 的前端 consumer 模式，新增 mock fixtures、Vue root selector 和 shell prop。
2. 新增 `sdlc-draft-review-submission` 企业 Vue2 面板，展示 queue、Owner、validation、Runtime、issue 和 source-of-truth。
3. 为 submission 缺失提供保守降级，不从 Listing Wizard `prepare_draft_review_submission` 推导 `pending_review`。
4. 扩展 frontend verification，固定 no AgentVersion creation、no publish、no PolicyDecision、no CapabilityGrant 边界。
5. 运行 frontend verify、pytest、ruff、truth sync/audit、AI-SDLC dry-run/run，并记录结果。

## Risks

| Risk | Control |
| --- | --- |
| 把 018/026 的建议状态误读为正式入队 | 只有 `draftReviewSubmissions` envelope 显示 `pending_review`，fallback 固定 blocked |
| Owner 未确认也展示已提交 | 面板单独展示 `owner_confirmation`，缺确认走 `owner_confirmation_required` |
| Runtime Gate 未 ready 仍进入审核 | Runtime gate 独立展示，blocked 下一步指向 `agent_runtime` |
| 用户误以为发布或授权已发生 | 面板固定 no AgentVersion creation / no publish / no PolicyDecision / no CapabilityGrant |
