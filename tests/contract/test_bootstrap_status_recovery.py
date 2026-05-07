from agent_store.api.bootstrap_status import BootstrapStatusAPI
from agent_store.domain.agentops_summary import CredentialBootstrapSummary
from agent_store.domain.bootstrap_service import BootstrapService
from agent_store.domain.bootstrap_status import permission_denied_status
from agent_store.domain.models import AgentVersion
from agent_store.domain.permissions import AuthContext, PermissionDecision


def _record():
    auth = AuthContext(
        auth_context_id="auth-1",
        subject_user_id="user-1",
        identity_confidence=0.99,
    )
    decision = PermissionDecision.from_auth_context(
        auth_context=auth,
        decision="allow",
        permission_decision_id="perm-1",
        audit_id="audit-1",
        trace_id="trace-1",
    )
    service = BootstrapService()
    service.register_version(
        AgentVersion(
            agent_id="framework.ai-autosdlc",
            version="1.0.0",
            artifact_hash="sha256:first",
            signature="sig-1",
            issuer="Agent Store",
        )
    )
    record = service.create_installation(
        agent_id="framework.ai-autosdlc",
        agent_version="1.0.0",
        artifact_hash="sha256:first",
        device_os="macOS",
        device_public_key_thumbprint="thumb-1",
        auth_context=auth,
        permission_decision=decision,
        trace_id="trace-1",
        idempotency_key="install-1",
    )
    return service, record


def test_bootstrap_status_returns_polling_retry_and_diagnostic_fields() -> None:
    service, record = _record()

    status, body = BootstrapStatusAPI(service).get_bootstrap_status(
        record.installation.installation_id,
        auth_context=record.installation.auth_context,
    )

    assert status == 200
    payload = body["status"]
    assert payload["current_step"] == "collect_device_proof"
    assert payload["step_status"] == "running"
    assert payload["next_poll_after"] == 5
    assert payload["retryable"] is True
    assert payload["diagnostic_ref"] == "diag-trace-1"
    assert payload["primary_action"]["action_id"] == "poll_bootstrap_status"
    assert payload["source_of_truth"] == "agent_store"
    assert payload["entry_evidence"] == [
        "signed_installation_assertion.v1",
        "device_binding",
    ]
    assert (
        payload["conflict_resolution"]
        == "wait_for_ai_autosdlc_device_proof_then_agentops_echo"
    )
    assert "collect_device_proof" in payload["affected_actions"]
    assert [step["step_id"] for step in payload["timeline"]] == [
        "create_installation",
        "issue_assertion",
        "collect_device_proof",
        "issue_credential",
        "verify_signature_test",
    ]
    assert payload["timeline"][2]["owner_system"] == "ai_autosdlc"
    assert payload["timeline"][2]["status"] == "running"


def test_bootstrap_status_timeline_uses_agentops_credential_echo() -> None:
    service, record = _record()
    credential = CredentialBootstrapSummary.from_agentops_credential_response(
        {
            "credential_id": "cred-1",
            "token_id": "token-1",
            "device_key_id": "device-key-1",
            "status": "active",
            "bootstrap_status": "credential_issued",
            "installation_id": record.installation.installation_id,
            "device_id": record.installation.device_id,
            "expires_at": "2026-05-07T13:00:00+00:00",
            "next_action": "send_signature_test_event",
        }
    )

    _, body = BootstrapStatusAPI(service).get_bootstrap_status(
        record.installation.installation_id,
        auth_context=record.installation.auth_context,
        agentops_credential=credential,
    )

    payload = body["status"]
    assert payload["bootstrap_status"] == "credential_issued"
    assert payload["current_step"] == "send_signature_test_event"
    assert payload["primary_action"]["target_system"] == "ai_autosdlc_cli"
    assert payload["source_of_truth"] == "agentops"
    assert payload["entry_evidence"] == [
        "agentops_credential_echo",
        "installation_id_match",
        "device_id_match",
    ]
    assert (
        payload["conflict_resolution"]
        == "agentops_bootstrap_echo_after_identity_match"
    )
    assert payload["timeline"][2]["status"] == "completed"
    assert payload["timeline"][3]["source"] == "agentops"
    assert payload["timeline"][4]["status"] == "pending"


def test_bootstrap_status_rejects_mismatched_agentops_credential_echo() -> None:
    service, record = _record()
    credential = CredentialBootstrapSummary.from_agentops_credential_response(
        {
            "credential_id": "cred-1",
            "token_id": "token-1",
            "device_key_id": "device-key-1",
            "status": "active",
            "bootstrap_status": "credential_issued",
            "installation_id": "other-installation",
            "device_id": record.installation.device_id,
            "expires_at": "2026-05-07T13:00:00+00:00",
            "next_action": "send_signature_test_event",
        }
    )

    status, body = BootstrapStatusAPI(service).get_bootstrap_status(
        record.installation.installation_id,
        auth_context=record.installation.auth_context,
        agentops_credential=credential,
    )

    assert status == 409
    assert body["error_code"] == "VALIDATION_ERROR"
    assert body["recommended_action_id"] == "refresh_agentops_credential"
    assert body["details"]["credential_installation_id"] == "other-installation"


def test_bootstrap_status_rejects_mismatched_agentops_device_echo() -> None:
    service, record = _record()
    credential = CredentialBootstrapSummary.from_agentops_credential_response(
        {
            "credential_id": "cred-1",
            "token_id": "token-1",
            "device_key_id": "device-key-1",
            "status": "active",
            "bootstrap_status": "signature_verified",
            "installation_id": record.installation.installation_id,
            "device_id": "other-device",
            "expires_at": "2026-05-07T13:00:00+00:00",
            "next_action": "send_signature_test_event",
        }
    )

    status, body = BootstrapStatusAPI(service).get_bootstrap_status(
        record.installation.installation_id,
        auth_context=record.installation.auth_context,
        agentops_credential=credential,
    )

    assert status == 409
    assert body["error_code"] == "VALIDATION_ERROR"
    assert body["details"]["credential_device_id"] == "other-device"


def test_bootstrap_status_timeline_marks_signature_verified_complete() -> None:
    service, record = _record()
    credential = CredentialBootstrapSummary.from_agentops_credential_response(
        {
            "credential_id": "cred-1",
            "token_id": "token-1",
            "device_key_id": "device-key-1",
            "status": "active",
            "bootstrap_status": "signature_verified",
            "installation_id": record.installation.installation_id,
            "device_id": record.installation.device_id,
            "expires_at": "2026-05-07T13:00:00+00:00",
            "next_action": "send_signature_test_event",
        }
    )

    _, body = BootstrapStatusAPI(service).get_bootstrap_status(
        record.installation.installation_id,
        auth_context=record.installation.auth_context,
        agentops_credential=credential,
    )

    payload = body["status"]
    assert payload["bootstrap_status"] == "signature_verified"
    assert payload["step_status"] == "completed"
    assert payload["source_of_truth"] == "agentops"
    assert "signature_test_verified" in payload["entry_evidence"]
    assert payload["conflict_resolution"] == "agentops_signature_verified_is_display_fact"
    assert payload["timeline"][4]["status"] == "completed"
    assert payload["primary_action"]["action_id"] == "view_agentops_evidence"


def test_bootstrap_status_blocks_failed_agentops_credential_echo() -> None:
    service, record = _record()
    credential = CredentialBootstrapSummary.from_agentops_credential_response(
        {
            "credential_id": "cred-1",
            "token_id": "token-1",
            "device_key_id": "device-key-1",
            "status": "revoked",
            "bootstrap_status": "failed",
            "installation_id": record.installation.installation_id,
            "device_id": record.installation.device_id,
            "expires_at": "2026-05-07T13:00:00+00:00",
            "next_action": "send_signature_test_event",
        }
    )

    _, body = BootstrapStatusAPI(service).get_bootstrap_status(
        record.installation.installation_id,
        auth_context=record.installation.auth_context,
        agentops_credential=credential,
    )

    payload = body["status"]
    assert payload["bootstrap_status"] == "failed"
    assert payload["step_status"] == "blocked"
    assert payload["retryable"] is False
    assert payload["last_error_code"] == "AGENTOPS_BOOTSTRAP_FAILED"
    assert payload["primary_action"]["target_system"] == "agentops"
    assert payload["source_of_truth"] == "agentops"
    assert "agentops_credential_echo" in payload["entry_evidence"]
    assert payload["timeline"][2]["status"] == "completed"
    assert payload["timeline"][3]["status"] == "blocked"
    assert payload["timeline"][4]["source"] == "agentops"
    assert payload["timeline"][4]["status"] == "blocked"


def test_bootstrap_status_blocks_expired_agentops_credential_echo() -> None:
    service, record = _record()
    credential = CredentialBootstrapSummary.from_agentops_credential_response(
        {
            "credential_id": "cred-1",
            "token_id": "token-1",
            "device_key_id": "device-key-1",
            "status": "expired",
            "bootstrap_status": "expired",
            "installation_id": record.installation.installation_id,
            "device_id": record.installation.device_id,
            "expires_at": "2026-05-07T13:00:00+00:00",
            "next_action": "send_signature_test_event",
        }
    )

    _, body = BootstrapStatusAPI(service).get_bootstrap_status(
        record.installation.installation_id,
        auth_context=record.installation.auth_context,
        agentops_credential=credential,
    )

    payload = body["status"]
    assert payload["bootstrap_status"] == "expired"
    assert payload["step_status"] == "blocked"
    assert payload["last_error_code"] == "AGENTOPS_BOOTSTRAP_EXPIRED"
    assert payload["primary_action"]["action_id"] == "view_agentops_bootstrap_failure"
    assert payload["source_of_truth"] == "agentops"
    assert payload["timeline"][0]["status"] == "completed"
    assert payload["timeline"][1]["status"] == "completed"
    assert payload["timeline"][3]["source"] == "agentops"
    assert payload["timeline"][4]["source"] == "agentops"


def test_expired_command_blocks_old_command_and_returns_regenerate_action() -> None:
    service, record = _record()

    _, body = BootstrapStatusAPI(service).get_bootstrap_status(
        record.installation.installation_id,
        auth_context=record.installation.auth_context,
        last_error_code="INSTALLATION_ASSERTION_EXPIRED",
    )

    payload = body["status"]
    assert payload["bootstrap_status"] == "expired"
    assert payload["step_status"] == "blocked"
    assert payload["safe_to_rerun"] is False
    assert payload["regenerate_command_url"].endswith("/assertion")
    assert payload["primary_action"]["action_id"] == "regenerate_activation_command"
    assert payload["source_of_truth"] == "agent_store"
    assert payload["entry_evidence"] == ["assertion_expires_at", "last_error_code"]
    assert (
        payload["conflict_resolution"]
        == "agent_store_assertion_error_overrides_agentops_echo"
    )
    assert payload["timeline"][2]["step_id"] == "collect_device_proof"
    assert payload["timeline"][2]["status"] == "blocked"
    assert payload["timeline"][3]["status"] == "blocked"
    assert payload["timeline"][4]["status"] == "blocked"


def test_expired_command_uses_store_timeline_even_with_agentops_echo() -> None:
    service, record = _record()
    credential = CredentialBootstrapSummary.from_agentops_credential_response(
        {
            "credential_id": "cred-1",
            "token_id": "token-1",
            "device_key_id": "device-key-1",
            "status": "active",
            "bootstrap_status": "credential_issued",
            "installation_id": record.installation.installation_id,
            "device_id": record.installation.device_id,
            "expires_at": "2026-05-07T13:00:00+00:00",
            "next_action": "send_signature_test_event",
        }
    )

    _, body = BootstrapStatusAPI(service).get_bootstrap_status(
        record.installation.installation_id,
        auth_context=record.installation.auth_context,
        last_error_code="INSTALLATION_ASSERTION_EXPIRED",
        agentops_credential=credential,
    )

    payload = body["status"]
    assert payload["bootstrap_status"] == "expired"
    assert payload["current_step"] == "issue_assertion"
    assert payload["timeline"][0]["status"] == "blocked"
    assert payload["timeline"][1]["status"] == "blocked"
    assert payload["timeline"][2]["source"] == "pending"
    assert payload["timeline"][3]["source"] == "pending"
    assert payload["source_conflicts"] == [
        {
            "source_of_truth": "agentops",
            "state": "credential_issued",
            "entry_evidence": ["agentops_credential_echo"],
            "last_verified_at": "2026-05-07T13:00:00+00:00",
        }
    ]


def test_permission_denied_status_returns_access_and_return_path() -> None:
    auth = AuthContext(
        auth_context_id="auth-1",
        subject_user_id="user-1",
        identity_confidence=0.99,
    )
    decision = PermissionDecision.from_auth_context(
        auth_context=auth,
        decision="deny",
        permission_decision_id="perm-deny",
        audit_id="audit-deny",
        trace_id="trace-deny",
        denied_scope="agentops.credential.issue",
        request_access_url="/agentops/access/request",
    )

    status = permission_denied_status(
        "inst-1",
        decision,
        return_path="/official-apps/framework.ai-autosdlc",
    ).to_dict()

    assert status["denied_scope"] == "agentops.credential.issue"
    assert status["request_access_url"] == "/agentops/access/request"
    assert status["audit_id"] == "audit-deny"
    assert status["return_path"] == "/official-apps/framework.ai-autosdlc"
    assert status["source_of_truth"] == "agentops"
    assert status["entry_evidence"] == ["permission_decision", "denied_scope"]
    assert status["primary_action"]["action_id"] == "request_enterprise_access"


def test_bootstrap_status_rejects_mismatched_auth_context() -> None:
    service, record = _record()
    other_auth = AuthContext(
        auth_context_id="auth-2",
        subject_user_id="user-2",
        identity_confidence=0.99,
    )

    status, body = BootstrapStatusAPI(service).get_bootstrap_status(
        record.installation.installation_id,
        auth_context=other_auth,
    )

    assert status == 403
    assert body["error_code"] == "PERMISSION_DENIED"
    assert body["retryable"] is False
