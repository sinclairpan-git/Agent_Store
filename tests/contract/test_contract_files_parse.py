from pathlib import Path

import pytest

from agent_store.contracts.loader import (
    ContractValidationError,
    default_contracts_dir,
    iter_contract_files,
    load_openapi_contract,
    validate_all_contracts,
    validate_contract_file,
)


def test_all_openapi_contracts_parse_and_have_response_envelopes() -> None:
    contract_files = list(iter_contract_files(default_contracts_dir()))

    assert {path.name for path in contract_files} == {
        "agent-manifest-runtime.openapi.yaml",
        "agent-registry.openapi.yaml",
        "agentops-summary.openapi.yaml",
        "contract-registry-traceability.openapi.yaml",
        "draft-review-submission.openapi.yaml",
        "feedback-owner-response-loop.openapi.yaml",
        "health-summary-freshness.openapi.yaml",
        "installation-bootstrap.openapi.yaml",
        "installation-runtime-handoff.openapi.yaml",
        "lifecycle-governance-baseline.openapi.yaml",
        "managed-installer-preview.openapi.yaml",
        "package-validation.openapi.yaml",
        "policy-approval-echo.openapi.yaml",
        "policy-approval-request.openapi.yaml",
        "recommendation-state.openapi.yaml",
        "runtime-availability.openapi.yaml",
        "skill-registry-notification.openapi.yaml",
        "skill-registry.openapi.yaml",
        "trusted-evidence-loop.openapi.yaml",
    }
    validate_all_contracts(default_contracts_dir())


def test_create_installation_contract_documents_error_responses() -> None:
    contract = load_openapi_contract(
        default_contracts_dir() / "installation-bootstrap.openapi.yaml"
    )
    operation = contract["paths"]["/api/v1/installations"]["post"]
    responses = operation["responses"]

    assert {"201", "400", "403", "404", "409"}.issubset(responses.keys())
    for status_code in ("400", "403", "404", "409"):
        schema = responses[status_code]["content"]["application/json"]["schema"]
        assert schema == {"$ref": "#/components/schemas/ErrorResponse"}


def test_create_agent_draft_contract_documents_conflict_errors() -> None:
    contract = load_openapi_contract(
        default_contracts_dir() / "agent-registry.openapi.yaml"
    )
    operation = contract["paths"]["/api/v1/agents/drafts"]["post"]
    responses = operation["responses"]
    error_codes = contract["components"]["schemas"]["ErrorResponse"]["properties"][
        "error_code"
    ]["enum"]

    assert {"201", "400", "409"}.issubset(responses.keys())
    assert responses["409"]["content"]["application/json"]["schema"] == {
        "$ref": "#/components/schemas/ErrorResponse"
    }
    assert "IDEMPOTENCY_KEY_CONFLICT" in error_codes


def test_package_validation_contract_documents_fix_report_and_conflict_errors() -> None:
    contract = load_openapi_contract(
        default_contracts_dir() / "package-validation.openapi.yaml"
    )
    operation = contract["paths"]["/api/v1/packages/validation-requests"]["post"]
    responses = operation["responses"]
    report = contract["components"]["schemas"]["PackageValidationReport"]
    manifest = contract["components"]["schemas"]["PackageManifestCandidate"]
    field_source = contract["components"]["schemas"]["FieldSource"]
    skill = contract["components"]["schemas"]["SkillCandidate"]
    error_codes = contract["components"]["schemas"]["ErrorResponse"]["properties"][
        "error_code"
    ]["enum"]

    assert {"200", "400", "409"}.issubset(responses.keys())
    assert "issues" in report["required"]
    assert "fix_prompts" in report["required"]
    assert responses["409"]["content"]["application/json"]["schema"] == {
        "$ref": "#/components/schemas/ErrorResponse"
    }
    assert "IDEMPOTENCY_KEY_CONFLICT" in error_codes
    assert "required" not in manifest
    assert "required" not in field_source
    assert "required" not in skill


def test_agent_manifest_runtime_contract_documents_runtime_mismatch() -> None:
    contract = load_openapi_contract(
        default_contracts_dir() / "agent-manifest-runtime.openapi.yaml"
    )
    operation = contract["paths"][
        "/api/v1/agent-manifests/runtime-contract-validations"
    ]["post"]
    responses = operation["responses"]
    manifest = contract["components"]["schemas"]["AgentManifest"]
    result = contract["components"]["schemas"]["AgentManifestRuntimeContract"]
    source_of_truth = contract["components"]["schemas"][
        "AgentManifestRuntimeSourceOfTruth"
    ]
    error_codes = contract["components"]["schemas"]["ErrorResponse"]["properties"][
        "error_code"
    ]["enum"]

    assert {"200", "400", "409"}.issubset(responses.keys())
    assert {
        "manifest_schema_version",
        "agent_id",
        "version",
        "artifact_hash",
        "runtime_contract_version",
        "required_runtime_capabilities",
        "skills",
        "permission_intents",
        "data_scopes",
        "secret_refs",
        "network_allowlist",
        "observability_contract",
        "guardrail_refs",
        "rollback_policy",
        "provenance",
    }.issubset(manifest["required"])
    assert (
        "runtime_capability_missing"
        in result["properties"]["runtime_compatibility"]["enum"]
    )
    assert "missing_runtime_capabilities" in result["required"]
    assert source_of_truth["properties"]["agent_manifest"]["enum"] == ["agent_store"]
    assert source_of_truth["properties"]["runtime_availability"]["enum"] == [
        "agent_runtime_echo_or_probe"
    ]
    assert "IDEMPOTENCY_KEY_CONFLICT" in error_codes


def test_runtime_availability_contract_documents_store_summary_states() -> None:
    contract = load_openapi_contract(
        default_contracts_dir() / "runtime-availability.openapi.yaml"
    )
    operation = contract["paths"][
        "/api/v1/agent-manifests/runtime-availability-summaries"
    ]["post"]
    responses = operation["responses"]
    summary = contract["components"]["schemas"]["RuntimeAvailabilitySummary"]
    source_of_truth = contract["components"]["schemas"][
        "RuntimeAvailabilitySourceOfTruth"
    ]
    action = contract["components"]["schemas"]["ActionDescriptor"]
    error_codes = contract["components"]["schemas"]["ErrorResponse"]["properties"][
        "error_code"
    ]["enum"]

    assert {"200", "400", "409"}.issubset(responses.keys())
    assert {
        "runtime_missing",
        "runtime_upgrade_required",
        "runtime_capability_missing",
        "runtime_ready",
    }.issubset(set(summary["properties"]["availability_state"]["enum"]))
    assert "missing_runtime_capabilities" in summary["required"]
    assert source_of_truth["properties"]["agent_manifest"]["enum"] == ["agent_store"]
    assert source_of_truth["properties"]["runtime_availability"]["enum"] == [
        "agent_runtime_echo_or_probe"
    ]
    assert "agent_runtime" in action["properties"]["target_system"]["enum"]
    assert "IDEMPOTENCY_KEY_CONFLICT" in error_codes


def test_health_summary_freshness_contract_documents_refresh_guard() -> None:
    contract = load_openapi_contract(
        default_contracts_dir() / "health-summary-freshness.openapi.yaml"
    )
    operation = contract["paths"]["/api/v1/agents/health-summary-freshness"]["post"]
    responses = operation["responses"]
    summary = contract["components"]["schemas"]["HealthSummaryFreshness"]
    source_of_truth = contract["components"]["schemas"][
        "HealthSummaryFreshnessSourceOfTruth"
    ]
    action = contract["components"]["schemas"]["ActionDescriptor"]
    error_codes = contract["components"]["schemas"]["ErrorResponse"]["properties"][
        "error_code"
    ]["enum"]

    assert {"200", "400", "409"}.issubset(responses.keys())
    assert {
        "health_unavailable",
        "health_invalid",
        "health_refresh_required",
        "health_attention_required",
        "health_fresh",
    }.issubset(set(summary["properties"]["freshness_state"]["enum"]))
    assert "recommendation_basis_allowed" in summary["required"]
    assert summary["properties"]["recommendation_basis_allowed"]["const"] is False
    assert source_of_truth["properties"]["health_summary"]["enum"] == ["agentops"]
    assert source_of_truth["properties"]["recommendation"]["enum"] == [
        "recommendation_state_excludes_health_summary"
    ]
    assert "agentops" in action["properties"]["target_system"]["enum"]
    assert "IDEMPOTENCY_KEY_CONFLICT" in error_codes


def test_installation_runtime_handoff_contract_documents_runtime_binding() -> None:
    contract = load_openapi_contract(
        default_contracts_dir() / "installation-runtime-handoff.openapi.yaml"
    )
    operation = contract["paths"][
        "/api/v1/installations/{installation_id}/runtime-handoff"
    ]["post"]
    responses = operation["responses"]
    handoff = contract["components"]["schemas"]["InstallationRuntimeHandoff"]
    source_of_truth = contract["components"]["schemas"][
        "InstallationRuntimeSourceOfTruth"
    ]
    action = contract["components"]["schemas"]["ActionDescriptor"]
    error_codes = contract["components"]["schemas"]["ErrorResponse"]["properties"][
        "error_code"
    ]["enum"]

    assert {"200", "400", "403", "404", "409"}.issubset(responses.keys())
    assert {
        "runtime_handoff_ready",
        "artifact_hash_mismatch",
        "device_binding_mismatch",
        "installation_not_ready",
    }.issubset(set(handoff["properties"]["handoff_state"]["enum"]))
    assert "runtime_consumption_allowed" in handoff["required"]
    assert source_of_truth["properties"]["installation"]["enum"] == ["agent_store"]
    assert source_of_truth["properties"]["device_binding"]["enum"] == ["agent_store"]
    assert source_of_truth["properties"]["runtime_consumption"]["enum"] == [
        "agent_runtime_echo_or_request"
    ]
    assert "agent_runtime" in action["properties"]["target_system"]["enum"]
    assert (
        "ARTIFACT_HASH_MISMATCH"
        in contract["components"]["schemas"]["InstallationRuntimeHandoffIssue"][
            "properties"
        ]["issue_id"]["enum"]
    )
    assert "IDEMPOTENCY_KEY_CONFLICT" in error_codes


def test_draft_review_submission_contract_documents_final_review_gate() -> None:
    contract = load_openapi_contract(
        default_contracts_dir() / "draft-review-submission.openapi.yaml"
    )
    operation = contract["paths"]["/api/v1/agents/draft-review-submissions"]["post"]
    responses = operation["responses"]
    submission = contract["components"]["schemas"]["DraftReviewSubmission"]
    issue = contract["components"]["schemas"]["DraftReviewSubmissionIssue"]
    source_of_truth = contract["components"]["schemas"][
        "DraftReviewSubmissionSourceOfTruth"
    ]
    action = contract["components"]["schemas"]["ActionDescriptor"]
    error_codes = contract["components"]["schemas"]["ErrorResponse"]["properties"][
        "error_code"
    ]["enum"]

    assert {"200", "400", "409"}.issubset(responses.keys())
    assert {
        "pending_review",
        "validation_blocked",
        "runtime_gate_blocked",
        "owner_confirmation_required",
    }.issubset(set(submission["properties"]["submission_state"]["enum"]))
    assert submission["properties"]["draft_status"]["enum"] == [
        "pending_review",
        "draft_review_blocked",
    ]
    assert "review_queue_entry" in submission["required"]
    assert {
        "PACKAGE_VALIDATION_NOT_PASSED",
        "PLACEHOLDER_VALUE_BLOCKED",
        "RUNTIME_GATE_NOT_READY",
        "OWNER_CONFIRMATION_REQUIRED",
    }.issubset(set(issue["properties"]["issue_id"]["enum"]))
    assert source_of_truth["properties"]["owner_confirmation"]["enum"] == [
        "agent_store_owner_explicit_confirmation"
    ]
    assert source_of_truth["properties"]["draft_review_queue"]["enum"] == [
        "agent_store"
    ]
    assert "agent_runtime" in action["properties"]["target_system"]["enum"]
    assert "IDEMPOTENCY_KEY_CONFLICT" in error_codes


def test_policy_approval_echo_contract_documents_agentops_authority() -> None:
    contract = load_openapi_contract(
        default_contracts_dir() / "policy-approval-echo.openapi.yaml"
    )
    operation = contract["paths"]["/api/v1/agents/policy-approval-echoes"]["post"]
    responses = operation["responses"]
    echo = contract["components"]["schemas"]["PolicyApprovalEcho"]
    projection = contract["components"]["schemas"]["StoreProjection"]
    source_of_truth = contract["components"]["schemas"]["PolicyApprovalSourceOfTruth"]
    issue = contract["components"]["schemas"]["PolicyApprovalEchoIssue"]
    action = contract["components"]["schemas"]["ActionDescriptor"]
    error_codes = contract["components"]["schemas"]["ErrorResponse"]["properties"][
        "error_code"
    ]["enum"]

    assert {"200", "400", "409"}.issubset(responses.keys())
    assert {
        "policy_allowed",
        "approval_pending",
        "approval_expired",
        "policy_denied",
        "agentops_echo_unavailable",
    }.issubset(set(echo["properties"]["echo_state"]["enum"]))
    assert projection["properties"]["projection_mode"]["enum"] == ["agentops_echo_only"]
    assert projection["properties"]["store_decision_authority"]["enum"] == ["none"]
    assert projection["properties"]["store_override_allowed"]["const"] is False
    assert projection["properties"]["capability_grant_issued"]["const"] is False
    assert source_of_truth["properties"]["policy_decision"]["enum"] == ["agentops"]
    assert source_of_truth["properties"]["approval"]["enum"] == ["agentops"]
    assert source_of_truth["properties"]["capability_grant"]["enum"] == [
        "agentops_not_issued_by_store"
    ]
    assert "AGENTOPS_APPROVAL_EXPIRED" in issue["properties"]["issue_id"]["enum"]
    assert "agentops" in action["properties"]["target_system"]["enum"]
    assert "IDEMPOTENCY_KEY_CONFLICT" in error_codes


def test_policy_approval_request_contract_documents_agentops_request_boundary() -> None:
    contract = load_openapi_contract(
        default_contracts_dir() / "policy-approval-request.openapi.yaml"
    )
    operation = contract["paths"]["/api/v1/agents/policy-approval-requests"]["post"]
    responses = operation["responses"]
    request = contract["components"]["schemas"]["PolicyApprovalRequest"]
    agentops_request = contract["components"]["schemas"]["AgentOpsApprovalRequest"]
    projection = contract["components"]["schemas"]["StoreProjection"]
    issue = contract["components"]["schemas"]["PolicyApprovalRequestIssue"]
    source_of_truth = contract["components"]["schemas"][
        "PolicyApprovalRequestSourceOfTruth"
    ]
    action = contract["components"]["schemas"]["ActionDescriptor"]
    error_codes = contract["components"]["schemas"]["ErrorResponse"]["properties"][
        "error_code"
    ]["enum"]

    assert {"200", "400", "409"}.issubset(responses.keys())
    assert request["properties"]["contract_schema_version"]["enum"] == [
        "policy_approval_request.v1"
    ]
    assert {
        "approval_request_ready",
        "requester_required",
        "policy_context_incomplete",
        "justification_required",
    }.issubset(set(request["properties"]["request_state"]["enum"]))
    assert agentops_request["properties"]["target_system"]["enum"] == ["agentops"]
    assert agentops_request["properties"]["request_contract"]["enum"] == [
        "policy_approval_request.v1"
    ]
    assert projection["properties"]["store_decision_authority"]["enum"] == ["none"]
    assert projection["properties"]["store_override_allowed"]["const"] is False
    assert projection["properties"]["capability_grant_issued"]["const"] is False
    assert {
        "REQUESTER_ROLE_UNAUTHORIZED",
        "POLICY_CONTEXT_INCOMPLETE",
        "JUSTIFICATION_REQUIRED",
    }.issubset(set(issue["properties"]["issue_id"]["enum"]))
    assert source_of_truth["properties"]["approval_request"]["enum"] == ["agent_store"]
    assert source_of_truth["properties"]["approval"]["enum"] == ["agentops"]
    assert "agentops" in action["properties"]["target_system"]["enum"]
    assert "IDEMPOTENCY_KEY_CONFLICT" in error_codes


def test_managed_installer_preview_contract_documents_preview_only_state_machine() -> (
    None
):
    contract = load_openapi_contract(
        default_contracts_dir() / "managed-installer-preview.openapi.yaml"
    )
    operation = contract["paths"]["/api/v1/agents/managed-installer-previews"]["post"]
    responses = operation["responses"]
    preview = contract["components"]["schemas"]["ManagedInstallerPreview"]
    step = contract["components"]["schemas"]["ManagedInstallerStep"]
    issue = contract["components"]["schemas"]["ManagedInstallerIssue"]
    source_of_truth = contract["components"]["schemas"]["ManagedInstallerSourceOfTruth"]
    action = contract["components"]["schemas"]["ActionDescriptor"]
    error_codes = contract["components"]["schemas"]["ErrorResponse"]["properties"][
        "error_code"
    ]["enum"]

    assert {"200", "400", "409"}.issubset(responses.keys())
    assert {
        "ready_to_install_preview",
        "preview_passed",
        "download_blocked",
        "signature_blocked",
        "policy_blocked",
        "runtime_handoff_blocked",
        "smoke_test_failed",
    }.issubset(set(preview["properties"]["installer_state"]["enum"]))
    assert preview["properties"]["execution_mode"]["enum"] == ["preview_only"]
    assert preview["properties"]["real_install_started"]["const"] is False
    assert {
        "download_artifact",
        "verify_signature",
        "create_isolated_install",
        "smoke_test",
        "failure_diagnostics",
    }.issubset(set(step["properties"]["step_id"]["enum"]))
    assert {
        "DOWNLOAD_SOURCE_UNAVAILABLE",
        "SIGNATURE_OR_HASH_UNTRUSTED",
        "POLICY_APPROVAL_NOT_ALLOWED",
        "RUNTIME_HANDOFF_NOT_READY",
        "SMOKE_TEST_FAILED",
    }.issubset(set(issue["properties"]["issue_id"]["enum"]))
    assert source_of_truth["properties"]["installer_execution"]["enum"] == [
        "not_started_preview_only"
    ]
    assert "agent_runtime" in action["properties"]["target_system"]["enum"]
    assert "IDEMPOTENCY_KEY_CONFLICT" in error_codes


def test_feedback_owner_response_loop_contract_documents_lifecycle() -> None:
    contract = load_openapi_contract(
        default_contracts_dir() / "feedback-owner-response-loop.openapi.yaml"
    )
    operation = contract["paths"]["/api/v1/agents/feedback-owner-response-loops"][
        "post"
    ]
    responses = operation["responses"]
    loop = contract["components"]["schemas"]["FeedbackOwnerResponseLoop"]
    transition = contract["components"]["schemas"]["FeedbackTransition"]
    issue = contract["components"]["schemas"]["FeedbackLoopIssue"]
    source_of_truth = contract["components"]["schemas"]["FeedbackLoopSourceOfTruth"]
    error_codes = contract["components"]["schemas"]["ErrorResponse"]["properties"][
        "error_code"
    ]["enum"]

    assert {"200", "400", "409"}.issubset(responses.keys())
    assert {
        "submitted",
        "triaged",
        "owner_replied",
        "planned",
        "fixed",
        "rejected",
        "released",
    }.issubset(set(loop["properties"]["feedback_state"]["enum"]))
    assert {
        "submit",
        "triage",
        "owner_reply",
        "plan",
        "fix",
        "reject",
        "release",
    }.issubset(set(transition["properties"]["transition_action"]["enum"]))
    assert {
        "OWNER_RESPONSE_REQUIRED",
        "RELEASE_LINK_REQUIRED",
        "INVALID_FEEDBACK_TRANSITION",
    }.issubset(set(issue["properties"]["issue_id"]["enum"]))
    assert source_of_truth["properties"]["owner_response"]["enum"] == [
        "agent_store_owner_response"
    ]
    assert source_of_truth["properties"]["release_linkage"]["enum"] == [
        "agent_store_release_linkage"
    ]
    assert "IDEMPOTENCY_KEY_CONFLICT" in error_codes


def test_lifecycle_governance_contract_documents_version_lifecycle() -> None:
    contract = load_openapi_contract(
        default_contracts_dir() / "lifecycle-governance-baseline.openapi.yaml"
    )
    operation = contract["paths"]["/api/v1/agents/lifecycle-governance"]["post"]
    responses = operation["responses"]
    lifecycle = contract["components"]["schemas"]["LifecycleGovernance"]
    issue = contract["components"]["schemas"]["LifecycleGovernanceIssue"]
    source_of_truth = contract["components"]["schemas"]["LifecycleSourceOfTruth"]
    impact = contract["components"]["schemas"]["ImpactScope"]
    action = contract["components"]["schemas"]["ActionDescriptor"]
    error_codes = contract["components"]["schemas"]["ErrorResponse"]["properties"][
        "error_code"
    ]["enum"]

    assert {"200", "400", "409"}.issubset(responses.keys())
    assert {
        "active",
        "upgrade_available",
        "rollback_available",
        "deprecated",
        "disabled",
        "security_revoked",
    }.issubset(set(lifecycle["properties"]["lifecycle_state"]["enum"]))
    assert {
        "upgrade",
        "rollback",
        "deprecate",
        "disable",
        "security_revoke",
    }.issubset(set(lifecycle["properties"]["transition_action"]["enum"]))
    assert {
        "SECURITY_EVIDENCE_REQUIRED",
        "SECURITY_REVOKED_TERMINAL",
        "REPLACEMENT_VERSION_REQUIRED",
        "ROLLBACK_VERSION_REQUIRED",
        "IMPACT_SCOPE_REQUIRED",
    }.issubset(set(issue["properties"]["issue_id"]["enum"]))
    assert "affected_installation_count" in impact["required"]
    assert source_of_truth["properties"]["replacement"]["enum"] == [
        "agent_store_replacement_mapping"
    ]
    assert source_of_truth["properties"]["impact_scope"]["enum"] == [
        "agent_store_installation_inventory"
    ]
    assert "agentops" in action["properties"]["target_system"]["enum"]
    assert "IDEMPOTENCY_KEY_CONFLICT" in error_codes


def test_contract_registry_traceability_contract_documents_registry_axes() -> None:
    contract = load_openapi_contract(
        default_contracts_dir() / "contract-registry-traceability.openapi.yaml"
    )
    operation = contract["paths"]["/api/v1/contracts/traceability"]["get"]
    responses = operation["responses"]
    registry = contract["components"]["schemas"]["ContractRegistryTraceability"]
    entry = contract["components"]["schemas"]["ContractTraceabilityEntry"]
    summary = contract["components"]["schemas"]["ContractCoverageSummary"]
    source_of_truth = contract["components"]["schemas"]["ContractRegistrySourceOfTruth"]
    action = contract["components"]["schemas"]["ActionDescriptor"]

    assert {"200"}.issubset(responses.keys())
    assert registry["properties"]["contract_schema_version"]["enum"] == [
        "contract_registry_traceability.v1"
    ]
    assert {"complete", "incomplete"}.issubset(
        set(registry["properties"]["registry_status"]["enum"])
    )
    assert {
        "contract_id",
        "contract_file",
        "primary_schema",
        "owner",
        "producer",
        "consumers",
        "cct_ids",
        "contract_test_files",
        "appendix_anchor",
    }.issubset(entry["required"])
    assert (
        "contract_registry_traceability.v1"
        in entry["properties"]["contract_id"]["enum"]
    )
    assert {
        "Agent Store",
        "AgentOps",
        "Agent Runtime",
    }.issubset(set(entry["properties"]["producer"]["enum"]))
    assert "Ai_AutoSDLC" in entry["properties"]["consumers"]["items"]["enum"]
    assert {
        "total_contracts",
        "contracts_with_cct",
        "contracts_with_contract_tests",
        "complete_traceability",
        "unmapped_contracts",
    }.issubset(summary["required"])
    assert source_of_truth["properties"]["appendix"]["enum"] == [
        "docs/cross-project-contract-appendix.md"
    ]
    assert "complete_contract_traceability" in action["properties"]["action_id"]["enum"]


def test_skill_registry_contract_documents_lifecycle_and_conflict_errors() -> None:
    contract = load_openapi_contract(
        default_contracts_dir() / "skill-registry.openapi.yaml"
    )
    publish = contract["paths"]["/api/v1/skills"]["post"]
    transition = contract["paths"][
        "/api/v1/skills/{skill_id}/versions/{skill_version}/status"
    ]["patch"]
    transition_request = contract["components"]["schemas"][
        "SkillStatusTransitionRequest"
    ]
    decision = contract["components"]["schemas"]["SkillRegistryDecision"]
    record = contract["components"]["schemas"]["SkillRegistryRecord"]
    event = contract["components"]["schemas"]["SkillRegistryEvent"]
    event_types = event["properties"]["event_type"]["enum"]
    error_codes = contract["components"]["schemas"]["ErrorResponse"]["properties"][
        "error_code"
    ]["enum"]

    assert {"201", "400", "409"}.issubset(publish["responses"].keys())
    assert {"200", "400", "404", "409"}.issubset(transition["responses"].keys())
    assert {"transition_action", "reason"}.issubset(transition_request["required"])
    assert {"security_revoke"} == {
        rule["if"]["properties"]["transition_action"]["const"]
        for rule in transition_request["allOf"]
    }
    assert {
        tuple(option["required"])
        for option in transition_request["allOf"][0]["then"]["anyOf"]
    } == {
        ("evidence_ref",),
        ("security_evidence_ref",),
        ("incident_id",),
    }
    assert "agentops_consumption" in decision["required"]
    assert "registry_key" in record["required"]
    assert "skill_security_revoked" in event_types
    assert "evidence_ref" in event["properties"]
    assert "SKILL_VERSION_ALREADY_PUBLISHED" in error_codes
    assert "SKILL_NOT_FOUND" in error_codes


def test_skill_registry_notification_contract_freezes_agentops_consumption() -> None:
    contract = load_openapi_contract(
        default_contracts_dir() / "skill-registry-notification.openapi.yaml"
    )
    operation = contract["paths"]["/api/v1/agentops/skill-registry-notices"]["post"]
    notice = contract["components"]["schemas"]["SkillRegistryNotification"]
    ack = contract["components"]["schemas"]["AgentOpsNotificationReceipt"]
    record = contract["components"]["schemas"]["SkillRegistryRecord"]
    source_of_truth = contract["components"]["schemas"]["SourceOfTruth"]

    assert {"202", "400", "409"}.issubset(operation["responses"].keys())
    assert {
        "schema_version",
        "trace_id",
        "audit_id",
        "idempotency_key",
        "target_system",
        "registry_key",
        "skill",
        "event",
        "source_of_truth",
        "payload_hash",
    }.issubset(notice["required"])
    assert notice["properties"]["schema_version"]["enum"] == [
        "skill_registry_notification.v1"
    ]
    assert "package_id" in record["required"]
    assert "schema_ref" in record["required"]
    assert "risk_level" in record["required"]
    assert {
        "delivery_attempt_id",
        "agentops_ack_id",
        "request_payload_hash",
        "response_payload_hash",
    }.issubset(ack["required"])
    assert source_of_truth["properties"]["skill_registry"]["enum"] == ["agent_store"]


def test_installation_assertion_contract_documents_error_responses() -> None:
    contract = load_openapi_contract(
        default_contracts_dir() / "installation-bootstrap.openapi.yaml"
    )
    operation = contract["paths"]["/api/v1/installations/{installation_id}/assertion"][
        "post"
    ]
    responses = operation["responses"]

    assert {"200", "400", "403", "404", "409"}.issubset(responses.keys())
    for status_code in ("400", "403", "404", "409"):
        schema = responses[status_code]["content"]["application/json"]["schema"]
        assert schema == {"$ref": "#/components/schemas/ErrorResponse"}


def test_contract_validation_rejects_response_without_trace_fields(
    tmp_path: Path,
) -> None:
    contract = tmp_path / "broken.openapi.yaml"
    contract.write_text(
        """
openapi: 3.1.0
info:
  title: Broken API
  version: 0.1.0
paths:
  /broken:
    get:
      operationId: getBroken
      responses:
        "200":
          description: Broken
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/BrokenResponse"
components:
  schemas:
    BrokenResponse:
      type: object
      required: [trace_id]
      properties:
        trace_id:
          type: string
""",
        encoding="utf-8",
    )

    with pytest.raises(ContractValidationError, match="error_code"):
        validate_contract_file(contract)
