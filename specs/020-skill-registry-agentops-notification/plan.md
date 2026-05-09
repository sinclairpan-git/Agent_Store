# 020 Plan

1. Freeze `skill_registry_notification.v1` and `skill_registry_notification_ack.v1` in the shared OpenAPI contracts.
2. Extend AgentOps integration fakes with a Skill Registry notice consumer that validates Store-owned lifecycle decisions.
3. Add regression tests for publish, deprecate, security revocation, idempotency replay/conflict, defensive copies, blocked decisions, and AgentOps outage.
4. Update cross-project appendix and stage evidence so the notification remains downstream of 018/019.

## Risks

- Risk: Treating AgentOps receipt as a Skill Registry state owner.
  Control: ack schema contains receipt metadata only and tests assert no replacement Skill status appears in the ack.

- Risk: Notification bypasses Package Validation / Owner approval.
  Control: adapter only consumes successful 019 lifecycle responses and rejects error/issue decisions.

- Risk: Retries duplicate or mutate notifications.
  Control: outbound idempotency is keyed separately from Skill Registry API idempotency and fingerprints full notice payload.
