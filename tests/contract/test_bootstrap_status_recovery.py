from agent_store.api.bootstrap_status import BootstrapStatusAPI
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
