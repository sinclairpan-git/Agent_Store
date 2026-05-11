# 050 Draft Review Submission Frontend Consumer

027 已冻结 `draft_review_submission.v1` 后端/API 契约，区分 018 Package Validation 的“可提交建议”和正式进入 `pending_review` review queue 的状态变更。049 已完成托管安装预览前端消费；本阶段补齐草案提交审核结果在 Agent 详情页的前端消费。

## Scope

- 在前端 mock fixtures 中新增 `draftReviewSubmissions`，覆盖 pending review、validation blocked、runtime gate blocked 和 owner confirmation required。
- 在 Vue root 中新增 `selectedDraftReviewSubmission`，按当前 Agent 选择提交审核结果，并在缺失时保守降级为 blocked。
- 新增企业 Vue2 组件 `sdlc-draft-review-submission`，展示 review queue、Owner confirmation、validation summary、Runtime gate、source-of-truth、issue 和下一步动作。
- 更新静态 frontend verification，确保 `draft_review_submission.v1`、review queue、Owner confirmation 和不越界边界可被机器检查。

## Non-Goals

- 不实现真实人工审核工作流、审核审批、Agent 发布或 Skill Registry publish。
- 不创建 AgentVersion、不触发 AgentOps PolicyDecision、不签发 CapabilityGrant。
- 不绕过 018 Package Validation、023 Runtime availability 或 026 Listing Wizard shell。

## Acceptance

- 页面必须展示 `draft_review_submission.v1`、`submission_state`、`draft_status`、`review_queue_entry`、`owner_confirmation`、`validation_summary` 与 `runtime_gate`。
- `pending_review` 只能由 fixture/API envelope 提供；缺少 submission envelope 时不得从 Listing Wizard 本地推导已入队。
- validation failed、placeholder blocked、Runtime Gate blocked 或 Owner 未确认时，必须展示 blocked 状态和对应下一步动作。
- 组件必须明确 Store 不创建 AgentVersion、不发布 Agent、不触发 PolicyDecision、不签发 CapabilityGrant。
- 验证必须覆盖 frontend static check、相关 pytest/ruff、AI-SDLC truth sync/audit 与 dry-run/run。

## Adversarial Review Synthesis

- Product / user-flow view：Owner 点击“提交审核”后需要看到明确的入队、阻断或待确认结果，而不是停留在 Listing Wizard 的准备状态。
- Governance / contract view：Package Validation 的 `pending_review` 是建议，027 的 `draft_review_submission.v1` 才是正式 review queue 事实；前端必须保守消费，不本地制造 queue state。
