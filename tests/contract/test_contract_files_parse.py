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
        "health-summary-freshness.openapi.yaml",
        "installation-bootstrap.openapi.yaml",
        "installation-runtime-handoff.openapi.yaml",
        "package-validation.openapi.yaml",
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
