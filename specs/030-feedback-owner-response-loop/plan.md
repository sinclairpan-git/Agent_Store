# 030 Plan

1. Freeze `feedback_owner_response_loop.v1` as the Store-owned feedback lifecycle projection.
2. Add transition validation for submitted, triaged, owner_replied, planned, fixed, rejected, and released states.
3. Add idempotent API facade and OpenAPI contract.
4. Cover valid and blocked lifecycle paths with unit, API, and contract-loader tests.
5. Verify with focused pytest, full pytest, ruff, and AI-SDLC dry-run.

## Risks

- Risk: Non-owner actors can close feedback.
  Control: owner lifecycle actions require `actor_role=owner`.

- Risk: Feedback can jump directly to released.
  Control: `release` is only valid from `fixed` and requires `release_ref`.

- Risk: Feedback becomes unauditable commentary.
  Control: every transition requires actor, message, audit id, trace id, and timeline event.
