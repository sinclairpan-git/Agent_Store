# 031 Plan

1. Freeze `lifecycle_governance_baseline.v1` as the Agent/version lifecycle governance projection.
2. Add transition validation for upgrade, rollback, deprecate, disable, and security_revoke.
3. Add replacement, rollback, and impact scope summaries.
4. Add idempotent API facade and OpenAPI contract.
5. Verify with focused pytest, full pytest, ruff, and AI-SDLC dry-run.

## Risks

- Risk: security_revoked is treated as a reversible owner state.
  Control: security_revoked blocks weaker lifecycle actions and requires security actor plus evidence.

- Risk: upgrades/deprecations leave users without alternatives.
  Control: upgrade and deprecate require replacement version.

- Risk: disable/revoke hides blast radius.
  Control: disable and security_revoke require affected installation count.
