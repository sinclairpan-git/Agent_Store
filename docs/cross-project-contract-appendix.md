# Cross-Project Contract Appendix

## Purpose

This appendix freezes the shared contract between Agent Store, AgentOps, and Ai_AutoSDLC before the three projects continue implementation. It is intentionally product-neutral: each project must reference this appendix from its own PRD/specs, then implement its producer or consumer side without inventing local synonyms.

## Source Of Truth Boundaries

| Domain | Owner | Consumers | Contract rule |
| --- | --- | --- | --- |
| Agent, version, package, skill, installation, device binding | Agent Store | AgentOps, Ai_AutoSDLC | Agent Store is the write fact owner. AgentOps may cache and audit but must not rewrite registration facts. |
| Reporter credential, ingestion token, DeviceKey, bootstrap session, evidence, L5 result | AgentOps | Agent Store, Ai_AutoSDLC | AgentOps is the write fact owner. Agent Store may request and display status but must not issue runtime credentials or L5 results. |
| Reporter, Outbox, local run/session mapping, signed test event | Ai_AutoSDLC | AgentOps, Agent Store | Ai_AutoSDLC produces runtime evidence in enterprise mode and remains fully usable in standalone mode. |
| Runtime policy, approval, grant | AgentOps Policy Service | Agent Store, SDK/Wrapper, Ai_AutoSDLC | Agent Store may initiate and display approval status but must not sign runtime grants. |

## Bootstrap Credential Handoff V1

### Flow

1. Agent Store accepts an enterprise activation request and creates an installation plus device binding.
2. Agent Store issues `signed_installation_assertion.v1`.
3. Ai_AutoSDLC verifies the package and activation command locally, generates `device_proof.v1`, and calls AgentOps Credential Issue.
4. AgentOps validates the assertion, installation identity, artifact hash, issuer, nonce window, and device proof.
5. AgentOps issues ReporterCredential, IngestionToken, and DeviceKey.
6. Ai_AutoSDLC sends a signed test event through the Reporter.
7. AgentOps returns bootstrap state and evidence status; Agent Store displays the activation result without computing it locally.

### Credential Issue Request

The cross-project request body is `agentops_credential_handoff.v1`:

```json
{
  "schema_version": "agentops_credential_handoff.v1",
  "bootstrap_id": "boot-inst-1",
  "installation_assertion": {},
  "device_proof": {},
  "trace_id": "trace-1",
  "audit_id": "audit-1",
  "return_url": "/agent-store/installations/inst-1"
}
```

`Idempotency-Key` remains an HTTP header and is case-insensitive. The same `bootstrap_id`, assertion identity, device proof identity, and caller context must return the same credential response. A reused idempotency key with different identity must return a stable conflict.

### AgentOps 016 Consumer Acceptance

AgentOps stage `016-cross-project-credential-handoff-consumer` is the normative
consumer implementation for `agentops_credential_handoff.v1`. It must consume
the same fixture names defined in `contracts/cross-project/fixtures/` and should
record the Agent Store source commit or fixture checksum when the fixtures are
vendored into AgentOps.

AgentOps Credential Issue must reject requests unless all of these checks pass:

- `schema_version` is `agentops_credential_handoff.v1`.
- `installation_assertion.assertion_version` is `signed_installation_assertion.v1`.
- `installation_assertion.issuer` is `agent-store`.
- `installation_assertion.audience` is `agentops`.
- `installation_assertion.canonicalization` is `json-c14n-v1`.
- `installation_assertion.revocation_status` is present and accepted by policy.
- `device_proof.proof_version` is `device_proof.v1`.
- `device_proof.assertion_hash` equals `installation_assertion.assertion_hash`.
- `installation_id`, `device_id`, `user_id`, `agent_id`, `agent_version`, and `artifact_hash` stay bound across the assertion, device proof, and caller context.
- The handoff assertion hash and signature are verified against the external `signed_installation_assertion.v1` payload, not against an Agent Store internal legacy assertion representation.
- Device proof `algorithm` is independent from the assertion `algorithm`; AgentOps must not require them to be equal.
- Unsupported major schema versions return the CCT-006 unsupported-schema error shape.

AgentOps Credential Issue must produce the response fields defined in
`credential_issue_response.v1`, including `bootstrap_status`, `next_action`,
`installation_id`, and `device_id`. Agent Store consumes these fields as an echo
only; Agent Store must not infer `active` or issue credentials locally.

After AgentOps accepts a valid signed test event, AgentOps may echo
`bootstrap_status=signature_verified` for the same credential/bootstrap identity.
Agent Store may display this as active only from the AgentOps echo; it must not
advance from `credential_issued` to `signature_verified` locally.

AgentOps 016 must not write Agent Store registration facts, implement the
Ai_AutoSDLC CLI, upgrade dry-run or local adapter state to `verified_loaded`, or
replace the current mock signing boundary with a real key management system.

### Signed Installation Assertion

`installation_assertion` must use these external field names:

| Field | Required | Owner | Notes |
| --- | --- | --- | --- |
| `assertion_version` | Yes | Agent Store | Must be `signed_installation_assertion.v1`. |
| `issuer` | Yes | Agent Store | Canonical value is `agent-store`; display labels may render `Agent Store`. |
| `key_id` | Yes | Agent Store | Key used to verify the assertion. |
| `algorithm` | Yes | Agent Store | External field name is `algorithm`; project-local `alg` must be adapted before handoff. |
| `canonicalization` | Yes | Agent Store | Canonical value is `json-c14n-v1` unless a schema version explicitly changes it. |
| `signature` | Yes | Agent Store | Signature over the canonical assertion payload. |
| `assertion_hash` | Yes | Agent Store | Hash over the canonical assertion payload before transport. |
| `installation_id` | Yes | Agent Store | Must reference an Agent Store installation. |
| `device_id` | Yes | Agent Store | Must match the installation device binding. |
| `device_public_key_thumbprint` | Yes | Agent Store | Must match the device proof public key hash or declared binding. |
| `agent_id` | Yes | Agent Store | Agent registry identity. |
| `agent_version` | Yes | Agent Store | Agent version identity. |
| `artifact_hash` | Yes | Agent Store | Must match the installed package. |
| `user_id` | Yes | Agent Store/IAM | External field name is `user_id`; project-local `subject_user_id` must be adapted before handoff. |
| `audience` | Yes | Agent Store | Must be `agentops` for AgentOps Credential Issue. |
| `nonce` | Yes | Agent Store | Must be scoped by installation, device, audience, and issuer. |
| `replay_window_seconds` | Yes | Agent Store | Default phase-1 value is `300`. |
| `issued_at` | Yes | Agent Store | ISO-8601 timestamp. |
| `expires_at` | Yes | Agent Store | ISO-8601 timestamp; expired assertions are rejected. |
| `revocation_status` | Yes | Agent Store | `not_revoked`, `revoked`, or `unknown`. |

Agent Store may keep an internal assertion model with local names, but the cross-project handoff must use the external names above.

## Skill Registry Notification V1

After Agent Store publishes, deprecates, or security-revokes a Skill Registry
record, Agent Store may notify AgentOps with `skill_registry_notification.v1`.
This notification is downstream of the Skill Registry lifecycle decision. It
must not create a second path to publish Skills, bypass Package Validation, or
let AgentOps rewrite Skill Registry facts.

The notification request must include:

| Field | Required | Owner | Notes |
| --- | --- | --- | --- |
| `schema_version` | Yes | Agent Store | Must be `skill_registry_notification.v1`. |
| `trace_id` | Yes | Agent Store | Correlates the lifecycle decision and delivery attempt. |
| `audit_id` | Yes | Agent Store | Audit id from the Skill Registry lifecycle decision. |
| `idempotency_key` | Yes | Agent Store | Outbound delivery key; same payload must replay, changed payload must conflict. |
| `source_system` | Yes | Agent Store | Must be `agent_store`. |
| `target_system` | Yes | Agent Store | Must be `agentops`; Agent Store executes delivery, AgentOps consumes it. |
| `contract` | Yes | Agent Store | Must be `skill_registry.v1`. |
| `consumer` | Yes | Agent Store | Must be `agentops`. |
| `notice_type` | Yes | Agent Store | `skill_published`, `skill_deprecated`, or `skill_security_revoked`. |
| `registry_key` | Yes | Agent Store | Stable `skill_id@skill_version`. |
| `skill` | Yes | Agent Store | Full immutable Skill Registry record, including `agent_id`, `package_id`, `schema_ref`, `risk_level`, `status`, and `registry_key`. |
| `event` | Yes | Agent Store | Lifecycle event emitted by Agent Store. Security revocation must preserve `evidence_ref`. |
| `source_of_truth` | Yes | Agent Store | Must state `skill_registry=agent_store` and `agentops_consumption=agentops_consumes_agent_store_registry`. |
| `payload_hash` | Yes | Agent Store | Hash of the outbound notice excluding transport idempotency. |

AgentOps may respond with `skill_registry_notification_ack.v1`. The ack is a
receipt only and may include delivery metadata such as `delivery_attempt_id`,
`sent_at`, `agentops_ack_id`, `request_payload_hash`, and
`response_payload_hash`. It must not include a replacement Skill record or
change `skill.status`, `risk_level`, `schema_ref`, `package_id`, or
`source_of_truth`.

If AgentOps is unavailable, Agent Store keeps the Skill Registry decision as the
authoritative fact and treats delivery as pending/retryable. UI copy must
distinguish "published in Agent Store" from "AgentOps notification accepted".
For `security_revoked`, downstream views must preserve the strongest security
status even while delivery is pending.

## AgentManifest Runtime Contract V1

Agent Store owns `AgentManifest` as the supply-side contract consumed by
Agent Runtime, AgentOps, and Ai_AutoSDLC. Runtime may reject or block execution
when the manifest is incomplete or incompatible, but Runtime must not rewrite
manifest facts or silently fill missing permission, Skill, provenance, or
observability fields.

The contract response is `agent_manifest_runtime_contract.v1` and must include:

| Field | Required | Owner | Notes |
| --- | --- | --- | --- |
| `manifest_schema_version` | Yes | Agent Store | Version of the Store-owned manifest schema. |
| `agent_id` | Yes | Agent Store | Stable Agent registry identity. |
| `version` | Yes | Agent Store | Immutable Agent version. |
| `artifact_hash` | Yes | Agent Store | Must bind package, installation, and Runtime execution. |
| `runtime_contract_version` | Yes | Agent Store + Runtime contract owners | Declares the Runtime contract expected by this Agent version. |
| `required_runtime_capabilities` | Yes | Agent Store | Non-empty array such as `tool_call`, `policy_check`, `outbox`, `basic_isolation`. |
| `skills` | Yes | Agent Store | Non-empty Store-owned Skill references, each with `skill_id` and `skill_version`. |
| `permission_intents` | Yes | Agent Store | Declared intent only; AgentOps still owns PolicyDecision and CapabilityGrant. |
| `data_scopes` | Yes | Agent Store | Declared data scope for review and policy. |
| `secret_refs` | Yes | Agent Store | References only; no cleartext secrets. |
| `network_allowlist` | Yes | Agent Store | Declared external network scope. |
| `observability_contract` | Yes | Agent Store + Runtime contract owners | Must include minimum TraceSpan kinds Runtime emits. |
| `guardrail_refs` | Yes | Agent Store / AgentOps policy references | Declares guardrails to bind; Ops owns enforcement facts. |
| `rollback_policy` | Yes | Agent Store | Describes rollback or force-disable behavior. |
| `provenance` | Yes | Agent Store | Package source, build source, and signing source. |

When a Runtime capability probe is available, Store validates
`required_runtime_capabilities` against the Runtime echo. Missing capabilities
must produce `runtime_compatibility=runtime_capability_missing` and a blocked
issue at `runtime.capabilities`. Store must not display that Agent version as
runnable in the current Runtime. If no Runtime echo is available, Store may
return `runtime_compatibility=runtime_unknown` with the next action
`check_runtime_capabilities`.

Source-of-truth fields are fixed:

| Fact | Source of truth |
| --- | --- |
| `agent_manifest` | `agent_store` |
| `package` | `agent_store` |
| `skill_registry` | `agent_store` |
| `runtime_availability` | `agent_runtime_echo_or_probe` |
| `policy_decision` | `agentops` |

Consumer-driven tests must cover complete manifest compatibility, missing
required Runtime fields, missing Runtime capabilities, and Store not computing
PolicyDecision or Runtime execution state.

## Runtime Availability Summary V1

Agent Store consumes Runtime echo/probe facts and projects them into
`runtime_availability_summary.v1` for Store UI/API consumers. Runtime remains
the owner of runtime presence, contract version, and capability echo facts.
Store owns only the projection, next action, audit id, and display wording.

The summary must distinguish these states:

| State | Meaning | Store action |
| --- | --- | --- |
| `runtime_missing` | No Runtime echo/probe proves that a compatible Runtime exists. | Route the user to install or configure Runtime. |
| `runtime_upgrade_required` | Runtime exists but its `runtime_contract_version` is lower than the AgentManifest requirement. | Route the user to Runtime upgrade. |
| `runtime_capability_missing` | Runtime exists and version is acceptable, but required capabilities are missing. | Show `missing_runtime_capabilities` and remediation. |
| `runtime_ready` | Runtime version and capabilities satisfy the Store-owned AgentManifest. | Continue listing review or installation gating. |
| `manifest_incomplete` | Store-owned AgentManifest is missing Runtime-facing required fields. | Return to AgentManifest completion before Runtime availability can be trusted. |

Source-of-truth fields are fixed:

| Fact | Source of truth |
| --- | --- |
| `agent_manifest` | `agent_store` |
| `runtime_availability` | `agent_runtime_echo_or_probe` |
| `summary_projection` | `agent_store` |
| `policy_decision` | `agentops` |

The summary must not include full Trace, Runtime execution result, quality
score, CapabilityGrant, or AgentOps PolicyDecision replacement. Store may show
the next action and missing capabilities, but must not claim an Agent ran
successfully from availability alone.

### Device Proof

`device_proof` must bind the local device to the same installation:

| Field | Required | Owner | Notes |
| --- | --- | --- | --- |
| `proof_version` | Yes | Ai_AutoSDLC | Must be `device_proof.v1`. |
| `installation_id` | Yes | Ai_AutoSDLC | Must match the assertion. |
| `device_id` | Yes | Ai_AutoSDLC | Must match the assertion. |
| `public_key_hash` | Yes | Ai_AutoSDLC | Must match or prove the Agent Store thumbprint binding. |
| `key_id` | Yes | Ai_AutoSDLC | Device key identifier. |
| `algorithm` | Yes | Ai_AutoSDLC | Device proof algorithm; it does not need to equal assertion algorithm. |
| `canonicalization` | Yes | Ai_AutoSDLC | Must be versioned. |
| `nonce` | Yes | Ai_AutoSDLC | Separate from assertion nonce. |
| `assertion_hash` | Yes | Ai_AutoSDLC | Binds this proof to the assertion being consumed. |
| `signature` | Yes | Ai_AutoSDLC | Signature with the local device private key. |
| `issued_at` | Yes | Ai_AutoSDLC | ISO-8601 timestamp. |
| `expires_at` | Yes | Ai_AutoSDLC | ISO-8601 timestamp. |

### Credential Issue Response

AgentOps owns the response:

| Field | Required | Owner | Notes |
| --- | --- | --- | --- |
| `credential_id` | Yes | AgentOps | ReporterCredential identity. |
| `token_id` | Yes | AgentOps | IngestionToken identity. |
| `device_key_id` | Yes | AgentOps | AgentOps DeviceKey identity. |
| `status` | Yes | AgentOps | `active`, `rotating`, `expired`, or `revoked`. |
| `bootstrap_status` | Yes | AgentOps | See state crosswalk below. |
| `installation_id` | Yes | AgentOps | Echo of Agent Store installation. |
| `device_id` | Yes | AgentOps | Echo of bound device. |
| `expires_at` | Yes | AgentOps | Credential expiration. |
| `next_action` | Yes | AgentOps | Usually `send_signature_test_event`. |

## State Crosswalk

| Shared stage | Agent Store state | AgentOps state | Ai_AutoSDLC state |
| --- | --- | --- | --- |
| Not started | `not_started` | none | `enterprise_unconfigured` |
| Installation created | `activation_required` | `created` or none | `activation_command_ready` |
| Assertion issued | `assertion_issued` | `authenticated` after verify | `device_proof_required` |
| Credential issued | `credential_issued` | `credential_issued` | `credential_configured` |
| Signature test passed | `signature_verified` | `verified` | `reporter_active` |
| Expired | `expired` | `expired` | `reactivation_required` |
| Failed | `failed` | `failed` | `activation_failed` |

No project may display `active`, `verified_loaded`, or L5 eligibility from a weaker predecessor state.

## Consumer-Driven Contract Tests

Each project must implement contract tests against the same fixture set:

| Test | Producer | Consumer | Assertion |
| --- | --- | --- | --- |
| CCT-001 assertion handoff sample | Agent Store | AgentOps | AgentOps accepts `signed_installation_assertion.v1` without field-name adapters in test code. |
| CCT-002 device proof binding | Ai_AutoSDLC | AgentOps | Device proof must bind `installation_id`, `device_id`, and `assertion_hash`. |
| CCT-003 credential response echo | AgentOps | Agent Store | AgentOps produces `credential_issue_response.v1` and `signature_verified` bootstrap echo; Agent Store only displays AgentOps echo fields and does not infer `active` from predecessor states. |
| CCT-004 signed test event | Ai_AutoSDLC | AgentOps | Enterprise managed event requires active credential, active device key, installation id, signature, sequence number, and idempotency key. |
| CCT-005 standalone regression | Ai_AutoSDLC | Agent Store, AgentOps | No Agent Store or AgentOps dependency may block `ai-sdlc run --dry-run` or local reports. |
| CCT-006 stale schema rejection | All | All | Unknown major schema versions return explainable unsupported-schema errors. |
| CCT-007 Skill Registry notification | Agent Store | AgentOps | AgentOps accepts `skill_registry_notification.v1` as an immutable Store-owned fact and returns receipt metadata without rewriting Skill fields. |
| CCT-008 AgentManifest Runtime contract | Agent Store | Agent Runtime | Runtime consumes Store-owned `agent_manifest_runtime_contract.v1`; missing required capabilities produce `runtime_capability_missing`, not a silent runnable state. |
| CCT-009 Runtime availability summary | Agent Runtime | Agent Store | Store projects Runtime echo/probe into `runtime_availability_summary.v1` and distinguishes missing Runtime, upgrade required, missing capability, and ready states. |

## Project PRD Updates Required

| Project | Required PRD/spec update |
| --- | --- |
| Top-level PRD | Add this appendix as the normative cross-project contract for bootstrap, credential, and status crosswalk. |
| Agent Store PRD | Reference `agentops_credential_handoff.v1`, `agent_manifest_runtime_contract.v1`, and `runtime_availability_summary.v1`; require external assertion field names, AgentOps credential echo, and Runtime availability projection. |
| AgentOps PRD | Reference `signed_installation_assertion.v1`, `skill_registry_notification.v1`, `agent_manifest_runtime_contract.v1`, and Store-consumed `runtime_availability_summary.v1`; credential issue must validate this schema and must not require assertion and device proof algorithms to be equal. |
| Ai_AutoSDLC PRD | Activation CLI must generate `device_proof.v1`, call AgentOps Credential Issue, store credentials securely, and send a signed test event. |

## Implementation Order

1. Freeze fixtures and schema names in all three projects.
2. Update Agent Store producer tests and handoff adapter.
3. Update AgentOps consumer tests and credential issue adapter.
4. Update Ai_AutoSDLC activation command/device proof and signed test event.
5. Add one end-to-end contract test: Agent Store assertion fixture plus Ai_AutoSDLC device proof fixture consumed by AgentOps, followed by Agent Store status echo.
