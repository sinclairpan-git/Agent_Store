# 026 Plan

1. Freeze `listing_wizard_shell.v1` as a view-model contract for the shell experience.
2. Compose existing package validation, Runtime availability, and HealthSummary freshness facts without creating new producer facts.
3. Add Vue2 UI for source selection, field confirmation, validation report, Runtime Gate, and detail preview.
4. Extend frontend verification to assert the shell is rendered and does not submit drafts.
5. Verify with unit tests, frontend verification, ruff, full pytest, and AI-SDLC dry-run.

## Risks

- Risk: The shell accidentally becomes draft submission.
  Control: `next_action=prepare_draft_review_submission` and `source_of_truth.draft_review=not_submitted_until_027`; no `pending_review` transition is executed here.

- Risk: Runtime or HealthSummary facts are inferred locally.
  Control: wizard consumes existing summary states and keeps Runtime / AgentOps source-of-truth labels visible.

- Risk: UI hides validation blockers behind a polished preview.
  Control: validation issues and Runtime Gate status remain in the same panel before the preview action.
