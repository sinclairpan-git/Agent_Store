# 029 Plan

1. Freeze `managed_installer_preview.v1` as a preview-only installer state machine.
2. Consume package trust, policy approval echo, Runtime handoff, and optional installer probe facts.
3. Add idempotent API facade and OpenAPI contract.
4. Cover the happy path and each blocked/failure stage with unit, API, and contract-loader tests.
5. Verify with focused pytest, full pytest, ruff, and AI-SDLC dry-run.

## Risks

- Risk: Preview is mistaken for actual installation.
  Control: response fixes `execution_mode=preview_only`, `real_install_started=false`, and source-of-truth `installer_execution=not_started_preview_only`.

- Risk: Policy or Runtime gates are bypassed.
  Control: preview requires 028 `policy_allowed` and 025 `runtime_handoff_ready` before isolation/smoke steps can proceed.

- Risk: Diagnostics are too vague for recovery.
  Control: every blocker emits a stage-specific issue and a copyable diagnostic reference when blocked.
