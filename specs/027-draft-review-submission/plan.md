# 027 Plan

1. Freeze `draft_review_submission.v1` as the final gate between Listing Wizard preview and review queue.
2. Consume 026 Listing Wizard snapshots plus explicit Owner confirmation without introducing publish or approval behavior.
3. Add an idempotent API facade and OpenAPI contract for `/api/v1/agents/draft-review-submissions`.
4. Cover success and blockers with unit, contract, and contract-loader tests.
5. Verify with focused pytest, full pytest, ruff, and AI-SDLC dry-run.

## Risks

- Risk: Package Validation's suggested `pending_review` is mistaken for actual submission.
  Control: 027 emits `draft_review_submission.v1` and only sets `draft_status=pending_review` when all final gates pass.

- Risk: A tampered wizard snapshot hides placeholder metadata.
  Control: submission rechecks preview and field-confirmation values for TODO/unknown/TBD/N/A tokens.

- Risk: Runtime readiness is inferred locally.
  Control: submission only consumes the Runtime availability state already present in the Listing Wizard snapshot and keeps source-of-truth as `agent_runtime_echo_or_probe`.
