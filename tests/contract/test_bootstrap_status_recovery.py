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
    assert payload["current_step"] == "issue_credential"
    assert payload["step_status"] == "running"
    assert payload["next_poll_after"] == 5
    assert payload["retryable"] is True
    assert payload["diagnostic_ref"] == "diag-trace-1"
    assert payload["primary_action"]["action_id"] == "poll_bootstrap_status"
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
    assert payload["timeline"][2]["status"] == "completed"
    assert payload["timeline"][3]["source"] == "agentops"
    assert payload["timeline"][4]["status"] == "pending"


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
    assert payload["timeline"][2]["status"] == "completed"
    assert payload["timeline"][3]["status"] == "blocked"
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
    assert payload["timeline"][0]["status"] == "completed"
    assert payload["timeline"][1]["status"] == "completed"
    assert payload["timeline"][3]["source"] == "agentops"


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
    assert payload["timeline"][2]["step_id"] == "collect_device_proof"
    assert payload["timeline"][2]["status"] == "blocked"
    assert payload["timeline"][3]["status"] == "blocked"
    assert payload["timeline"][4]["status"] == "blocked"


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
