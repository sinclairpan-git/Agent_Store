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

## HealthSummary Freshness V1

Agent Store consumes AgentOps HealthSummary echo facts and projects them into
`health_summary_freshness.v1` for Store UI/API consumers. AgentOps remains the
owner of health state, observed window, evidence summary linkage, and
`valid_until`. Store owns only the freshness guard projection, next action,
audit id, and display wording.

The freshness projection must distinguish these states:

| State | Meaning | Store action |
| --- | --- | --- |
| `health_unavailable` | No AgentOps HealthSummary echo is available. | Route the user to request AgentOps health summary. |
| `health_invalid` | Required fields such as `valid_until` are missing or malformed. | Route the user to refresh AgentOps HealthSummary. |
| `health_refresh_required` | `valid_until` is in the past. | Display “待刷新” and do not present an effective health conclusion. |
| `health_attention_required` | Summary is fresh but `health_state` is `degraded`, `unhealthy`, or `unknown`. | Display AgentOps-owned attention state and route to detail. |
| `health_fresh` | Summary is within `valid_until` and reports `healthy`. | Display the summary as fresh without using it as recommendation basis. |

Source-of-truth fields are fixed:

| Fact | Source of truth |
| --- | --- |
| `health_summary` | `agentops` |
| `summary_projection` | `agent_store` |
| `recommendation` | `recommendation_state_excludes_health_summary` |
| `policy_decision` | `agentops` |

The projection must always expose `recommendation_basis_allowed=false`.
HealthSummary freshness may explain whether the displayed health summary is
fresh, expired, or unavailable, but Store must not use it to compute quality
score, Actual L5, PolicyDecision, CapabilityGrant, or recommendation ranking.

## Installation Runtime Handoff V1

Agent Store projects Store-owned installation and device binding facts into
`installation_runtime_handoff.v1` for Agent Runtime consumption. Runtime remains
the owner of execution, process lifecycle, local isolation, and runtime echo
facts. Store owns only the installation, device binding, package hash, projection
wording, audit id, and next action.

The handoff must distinguish these states:

| State | Meaning | Store action |
| --- | --- | --- |
| `runtime_handoff_ready` | Installation, device binding, and Runtime echo identity are bound to the same package hash. | Allow Runtime consumption and route to Runtime activation. |
| `artifact_hash_mismatch` | Runtime echo or device binding artifact hash differs from the Store installation fact. | Block Runtime consumption and regenerate the activation command. |
| `device_binding_mismatch` | Runtime echo references a different installation or device. | Block Runtime consumption and restart activation. |
| `installation_not_ready` | Installation or device binding is failed, revoked, expired, or otherwise not active enough for Runtime. | Keep Runtime consumption blocked and review Store installation status. |

Source-of-truth fields are fixed:

| Fact | Source of truth |
| --- | --- |
| `installation` | `agent_store` |
| `device_binding` | `agent_store` |
| `package` | `agent_store` |
| `runtime_consumption` | `agent_runtime_echo_or_request` |
| `policy_decision` | `agentops` |

The handoff must expose `runtime_consumption_allowed=false` whenever any
mismatch or not-ready state is present. Store must not start the Runtime, sign a
CapabilityGrant, issue credentials, or infer execution success from this
projection. `artifact_hash` mismatch is a blocked state with the next action
`regenerate_activation_command`, not a warning that Runtime may ignore.

## Draft Review Submission V1

Agent Store owns `draft_review_submission.v1` as the final gate between Listing
Wizard preview and formal review queue. Package Validation owns validation
facts, Agent Runtime owns runtime availability facts, and Owner confirmation is
an explicit Store audit fact. AgentOps remains the future owner of policy
decision after the draft is already pending review.

The submission must distinguish these states:

| State | Meaning | Store action |
| --- | --- | --- |
| `pending_review` | Validation passed, Owner confirmation is explicit, Runtime is ready, and no placeholder values remain. | Enqueue the draft for review and track review status. |
| `validation_blocked` | Package validation failed, is fixable, or placeholder values are still present. | Keep the draft out of review and return to validation report. |
| `runtime_gate_blocked` | Runtime availability is not `runtime_ready`. | Keep the draft out of review and route to Runtime Gate remediation. |
| `owner_confirmation_required` | Owner confirmation is missing, incomplete, or fields are not confirmed. | Keep the draft out of review and request Owner confirmation. |

Source-of-truth fields are fixed:

| Fact | Source of truth |
| --- | --- |
| `package_manifest` | `agent_store_upload_candidate` |
| `package_validation` | `agent_store_package_validation` |
| `owner_confirmation` | `agent_store_owner_explicit_confirmation` |
| `runtime_availability` | `agent_runtime_echo_or_probe` |
| `draft_review_queue` | `agent_store` |
| `policy_decision` | `agentops_not_evaluated_until_review` |

`draft_status=pending_review` is allowed only when all final gates pass. Store
must not treat Package Validation's earlier suggested `pending_review` status as
review queue entry, and must recheck TODO/unknown/TBD/N/A placeholders before
submission.

## Policy Approval Echo V1

Agent Store consumes AgentOps-owned PolicyDecision and Approval echo facts and
projects them into `policy_approval_echo.v1` for Store display and routing.
AgentOps remains the sole owner of policy decisions, approval status, and
CapabilityGrant issuance. Store owns only the echo projection wording, audit
id, and next action.

The echo must distinguish these states:

| State | Meaning | Store action |
| --- | --- | --- |
| `policy_allowed` | AgentOps policy allows the action and approval is approved or not required. | Continue the Store flow while preserving AgentOps as decision source. |
| `approval_pending` | AgentOps requires approval or approval is still pending. | Route to AgentOps approval center. |
| `approval_expired` | AgentOps approval echo is past its valid window. | Request a fresh AgentOps approval echo. |
| `policy_denied` | AgentOps denied policy or approval was rejected/revoked. | Show blocking policy and keep Store action blocked. |
| `agentops_echo_unavailable` | AgentOps echo is missing, incomplete, or unsupported. | Refresh AgentOps policy echo; do not locally interpret it. |

Source-of-truth fields are fixed:

| Fact | Source of truth |
| --- | --- |
| `policy_decision` | `agentops` |
| `approval` | `agentops` |
| `capability_grant` | `agentops_not_issued_by_store` |
| `store_projection` | `agent_store_echo_only` |

The Store projection must always expose `store_decision_authority=none`,
`store_override_allowed=false`, and `capability_grant_issued=false`. Store may
continue only when AgentOps echo is `policy_allowed`; it must not rewrite unknown
AgentOps decisions into allow, deny, or approval-required.

## Policy Approval Request V1

Agent Store may initiate `policy_approval_request.v1` to ask AgentOps to evaluate
an install, publish, upgrade, or enable action. This contract is the upstream
request half of Policy Approval Echo: Store owns the request audit and payload
assembly, while AgentOps remains the only owner of policy decisions, approval
status, and CapabilityGrant issuance.

The request must distinguish these states:

| State | Meaning | Store action |
| --- | --- | --- |
| `approval_request_ready` | Requester, policy context, and justification are complete. | Submit request to AgentOps. |
| `requester_required` | Requester is missing or unauthorized. | Assign an authorized requester. |
| `policy_context_incomplete` | Policy ref, risk, runtime contract, or permission context is incomplete. | Complete policy context before dispatch. |
| `justification_required` | Auditable business justification is missing. | Add justification before dispatch. |
| `approval_request_blocked` | Agent identity or requested action is unsupported. | Fix request identity/action. |

The Store projection must expose `store_decision_authority=none`,
`store_override_allowed=false`, and `capability_grant_issued=false`. A ready
request may set `agentops_request.dispatch_allowed=true`; no other state may be
dispatched to AgentOps.

## Policy Approval Receipt V1

AgentOps produces `policy_approval_receipt.v1` after it accepts, queues, or
rejects a Store-originated `policy_approval_request.v1`. Agent Store consumes
this receipt only to link the approval flow and route the user to AgentOps. A
receipt is not a final policy decision, not an approval decision, and not a
CapabilityGrant.

The receipt projection must distinguish these states:

| State | Meaning | Store action |
| --- | --- | --- |
| `approval_receipt_accepted` | AgentOps accepted the approval request and returned an approval id. | Link to AgentOps approval center. |
| `approval_receipt_pending` | AgentOps has queued receipt processing. | Poll or refresh AgentOps receipt. |
| `approval_receipt_rejected` | AgentOps rejected the request envelope before approval review. | Fix and resubmit the Store request. |
| `approval_receipt_unavailable` | Receipt is missing, unsupported, incomplete, or mismatched. | Refresh AgentOps receipt and do not link approval flow. |

The Store projection must expose `projection_mode=agentops_receipt_only`,
`store_decision_authority=none`, `capability_grant_issued=false`, and
`approval_decision_final=false`.

## Managed Installer Preview V1

Agent Store projects package trust, Policy Approval echo, and Installation
Runtime handoff facts into `managed_installer_preview.v1` for installer UX.
This projection is preview-only: it does not download packages, create
sandboxes, run smoke tests, or issue CapabilityGrant. Agent Runtime remains the
owner of execution and isolation; AgentOps remains policy and grant authority.

The preview must distinguish these states:

| State | Meaning | Store action |
| --- | --- | --- |
| `ready_to_install_preview` | Download source, signature/hash, policy echo, and Runtime handoff are ready; smoke test has not run. | Prepare managed install without starting it. |
| `preview_passed` | Installer probe reports smoke test passed. | Keep install preparation available and display smoke evidence reference. |
| `download_blocked` | Package download source is missing or failed. | Refresh package download metadata. |
| `signature_blocked` | Signature or artifact hash is untrusted. | Regenerate or re-verify package signature facts. |
| `policy_blocked` | AgentOps policy/approval echo does not allow Store to continue. | Route to AgentOps approval or blocking policy. |
| `runtime_handoff_blocked` | Installation Runtime handoff is not consumable by Runtime. | Resolve Runtime Gate / handoff mismatch. |
| `smoke_test_failed` | Installer probe reports smoke test failure. | Copy diagnostic reference for remediation. |

Source-of-truth fields are fixed:

| Fact | Source of truth |
| --- | --- |
| `package` | `agent_store_package_trust` |
| `policy_approval` | `agentops_via_policy_approval_echo` |
| `runtime_handoff` | `agent_store_installation_runtime_handoff` |
| `installer_execution` | `not_started_preview_only` |
| `diagnostics` | `agent_store_preview` |

The preview must always expose `execution_mode=preview_only` and
`real_install_started=false`. The required steps are `download_artifact`,
`verify_signature`, `create_isolated_install`, `smoke_test`, and
`failure_diagnostics`; a passing preview never proves Runtime execution beyond
the supplied installer probe.

## Feedback Owner Response Loop V1

Agent Store owns `feedback_owner_response_loop.v1` as the product feedback
lifecycle projection for submitted user feedback and Owner responses. This is a
Store product loop, not an AgentOps policy decision or Runtime evidence fact.

The loop must distinguish these states:

| State | Meaning | Store action |
| --- | --- | --- |
| `submitted` | User feedback has been captured. | Triage feedback. |
| `triaged` | Store triage accepted the feedback for Owner attention. | Request Owner response. |
| `owner_replied` | Owner has responded with an accountable message. | Plan or reject the feedback. |
| `planned` | Owner committed to a planned fix or improvement. | Mark fixed when work is complete. |
| `fixed` | Owner marks the feedback fixed but not yet released. | Attach release linkage. |
| `rejected` | Owner rejected the feedback with an explanation. | Display the decision. |
| `released` | Fixed feedback is linked to a release. | Display release notes or release reference. |

Source-of-truth fields are fixed:

| Fact | Source of truth |
| --- | --- |
| `feedback` | `agent_store_feedback` |
| `owner_response` | `agent_store_owner_response` |
| `release_linkage` | `agent_store_release_linkage` |
| `notifications` | `agent_store_notification_queue` |

Owner lifecycle actions (`owner_reply`, `plan`, `fix`, `reject`, and `release`)
must require `actor_role=owner`. `release` may only follow `fixed` and must
include a `release_ref`. Every transition must carry actor id, actor role,
message, audit id, trace id, and a timeline event.

## Lifecycle Governance Baseline V1

Agent Store owns `lifecycle_governance_baseline.v1` as the Agent/version
lifecycle governance projection. This is separate from Skill Registry lifecycle:
Skill Registry governs Skill records, while this contract governs Agent version
upgrade, rollback, deprecation, disablement, security revocation, replacement
mapping, and affected installation scope.

The lifecycle projection must distinguish these states:

| State | Meaning | Store action |
| --- | --- | --- |
| `active` | Current version remains the active baseline. | Continue normal Store flow. |
| `upgrade_available` | Owner has designated a replacement version. | Notify affected users/installations of the upgrade path. |
| `rollback_available` | Owner has designated a rollback version. | Notify affected users/installations of rollback path. |
| `deprecated` | Version remains visible but should move to replacement. | Show replacement mapping and deprecation reason. |
| `disabled` | Version is disabled for governance reasons. | Notify AgentOps and affected installations. |
| `security_revoked` | Version is terminally revoked by security authority. | Notify AgentOps and preserve strongest security signal. |

Source-of-truth fields are fixed:

| Fact | Source of truth |
| --- | --- |
| `agent_version` | `agent_store_agent_version` |
| `lifecycle_decision` | `agent_store_lifecycle_governance` |
| `replacement` | `agent_store_replacement_mapping` |
| `impact_scope` | `agent_store_installation_inventory` |
| `agentops_notification` | `agent_store_notification_queue` |

`upgrade` and `deprecate` require replacement version. `rollback` requires
rollback version. `disable` and `security_revoke` require affected installation
count. `security_revoke` must be performed by `actor_role=security` and include
evidence or incident reference. `security_revoked` is terminal and must not be
downgraded to weaker lifecycle states.

## Contract Registry Traceability V1

Agent Store owns `contract_registry_traceability.v1` as the read-only projection
that lets Store, AgentOps, Agent Runtime, Ai_AutoSDLC, and Store UI trace every
OpenAPI contract back to its governance metadata.

Each registry entry must include:

| Field | Required | Owner | Notes |
| --- | --- | --- | --- |
| `contract_id` | Yes | Agent Store | Stable schema identifier, usually the payload contract version. |
| `contract_file` | Yes | Agent Store | File under `specs/001-agent-store-phase1-trusted-min-loop/contracts`. |
| `primary_schema` | Yes | Agent Store | Main OpenAPI component schema for review. |
| `owner` | Yes | Domain owner | System accountable for the fact boundary. |
| `producer` | Yes | Producing system | System emitting the contract payload or projection. |
| `consumers` | Yes | Consuming systems | One or more downstream systems/UI surfaces. |
| `cct_ids` | Yes | Agent Store | Appendix CCT rows that cover this contract; may be empty for local-only contracts. |
| `contract_test_files` | Yes | Agent Store | Test files that parse or exercise the contract. |
| `appendix_anchor` | Yes | Agent Store | Human-review anchor in this appendix. |

Coverage summary must expose `total_contracts`, `contracts_with_cct`,
`contracts_with_contract_tests`, `complete_traceability`, and
`unmapped_contracts`. A contract change is not review-ready if any OpenAPI file
is missing owner, producer, consumer, test file, or appendix traceability.

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
| CCT-010 HealthSummary freshness guard | AgentOps | Agent Store | Store projects AgentOps HealthSummary freshness into `health_summary_freshness.v1`; expired `valid_until` displays “待刷新” and never becomes a recommendation basis. |
| CCT-011 Installation Runtime handoff | Agent Store | Agent Runtime | Runtime consumes `installation_runtime_handoff.v1`; `artifact_hash` mismatch blocks consumption and returns `regenerate_activation_command`. |
| CCT-012 Draft Review submission | Agent Store | AgentOps | Store emits `draft_review_submission.v1`; only full final-gate pass may set `pending_review`, while validation, Runtime, Owner, or placeholder blockers remain `not_enqueued`. |
| CCT-013 Policy approval echo | AgentOps | Agent Store | Store consumes `policy_approval_echo.v1` as echo-only; `store_decision_authority=none`, no Store override, and no Store-issued CapabilityGrant. |
| CCT-014 Managed installer preview | Agent Store | Agent Runtime, AgentOps | Store emits `managed_installer_preview.v1` with `execution_mode=preview_only`; signature/hash, policy echo, Runtime handoff, and smoke diagnostics must remain distinct facts. |
| CCT-015 Feedback owner response loop | Agent Store | Agent Store UI | Store emits `feedback_owner_response_loop.v1`; Owner actions require owner actor role and released feedback requires release linkage. |
| CCT-016 Lifecycle governance baseline | Agent Store | AgentOps, Agent Store UI | Store emits `lifecycle_governance_baseline.v1`; security revocation is terminal, replacement/rollback mappings are explicit, and affected installation scope is disclosed. |
| CCT-017 Contract Registry traceability | Agent Store | AgentOps, Agent Runtime, Ai_AutoSDLC, Agent Store UI | Store emits `contract_registry_traceability.v1`; every OpenAPI contract must map to owner, producer, consumers, appendix anchor, and contract tests. |
| CCT-018 Policy approval request | Agent Store | AgentOps, Agent Store UI | Store emits `policy_approval_request.v1` only when requester, policy context, and justification are complete; Store still has no decision authority and issues no CapabilityGrant. |
| CCT-019 Policy approval receipt | AgentOps | Agent Store, Agent Store UI | Store consumes `policy_approval_receipt.v1` only as an AgentOps receipt; receipt links approval flow but never means approved and never issues CapabilityGrant. |

## Project PRD Updates Required

| Project | Required PRD/spec update |
| --- | --- |
| Top-level PRD | Add this appendix as the normative cross-project contract for bootstrap, credential, and status crosswalk. |
| Agent Store PRD | Reference `agentops_credential_handoff.v1`, `agent_manifest_runtime_contract.v1`, `runtime_availability_summary.v1`, `health_summary_freshness.v1`, `installation_runtime_handoff.v1`, `draft_review_submission.v1`, `policy_approval_echo.v1`, `policy_approval_request.v1`, `policy_approval_receipt.v1`, `managed_installer_preview.v1`, `feedback_owner_response_loop.v1`, `lifecycle_governance_baseline.v1`, and `contract_registry_traceability.v1`; require external assertion field names, AgentOps credential echo, Runtime availability projection, HealthSummary freshness guard, Runtime handoff artifact-hash binding, explicit Owner-confirmed draft review submission, AgentOps-only policy/approval authority, preview-only installer diagnostics, audited Owner feedback responses, Agent/version lifecycle governance, and contract registry traceability. |
| AgentOps PRD | Reference `signed_installation_assertion.v1`, `skill_registry_notification.v1`, `agent_manifest_runtime_contract.v1`, Store-consumed `runtime_availability_summary.v1`, Store-consumed `health_summary_freshness.v1`, Runtime-consumed `installation_runtime_handoff.v1`, Store-produced `draft_review_submission.v1`, Store-consumed `policy_approval_echo.v1`, Store-produced `policy_approval_request.v1`, AgentOps-produced `policy_approval_receipt.v1`, Store-produced `managed_installer_preview.v1`, and Store-produced `contract_registry_traceability.v1`; credential issue must validate this schema and must not require assertion and device proof algorithms to be equal. |
| Ai_AutoSDLC PRD | Activation CLI must generate `device_proof.v1`, call AgentOps Credential Issue, store credentials securely, and send a signed test event. |

## Implementation Order

1. Freeze fixtures and schema names in all three projects.
2. Update Agent Store producer tests and handoff adapter.
3. Update AgentOps consumer tests and credential issue adapter.
4. Update Ai_AutoSDLC activation command/device proof and signed test event.
5. Add one end-to-end contract test: Agent Store assertion fixture plus Ai_AutoSDLC device proof fixture consumed by AgentOps, followed by Agent Store status echo.
