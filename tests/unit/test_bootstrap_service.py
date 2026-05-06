import pytest

from agent_store.domain.bootstrap_service import BootstrapError, BootstrapService
from agent_store.domain.models import AgentVersion
from agent_store.domain.permissions import AuthContext, PermissionDecision


def _auth() -> AuthContext:
    return AuthContext(
        auth_context_id="auth-1",
        subject_user_id="iam-user-1",
        identity_confidence=0.99,
    )


def _decision(auth: AuthContext) -> PermissionDecision:
    return PermissionDecision.from_auth_context(
        auth_context=auth,
        decision="allow",
        permission_decision_id="perm-1",
        audit_id="audit-1",
        trace_id="trace-1",
        client_payload={"user_id": "spoofed-user"},
    )


def _service() -> BootstrapService:
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
    return service


def test_create_installation_and_device_binding_is_idempotent() -> None:
    service = _service()
    auth = _auth()
    decision = _decision(auth)

    first = service.create_installation(
        agent_id="framework.ai-autosdlc",
        agent_version="1.0.0",
        artifact_hash="sha256:first",
        device_os="macOS",
        device_public_key_thumbprint="thumb-1",
        auth_context=auth,
        permission_decision=decision,
        trace_id="trace-1",
        idempotency_key="idem-1",
    )
    second = service.create_installation(
        agent_id="framework.ai-autosdlc",
        agent_version="1.0.0",
        artifact_hash="sha256:first",
        device_os="macOS",
        device_public_key_thumbprint="thumb-1",
        auth_context=auth,
        permission_decision=decision,
        trace_id="trace-2",
        idempotency_key="idem-1",
    )

    assert second is first
    assert second.installation.installation_id == first.installation.installation_id
    assert second.device_binding.device_id == first.device_binding.device_id
    assert second.installation.user == "iam-user-1"
    assert decision.ignored_client_user_id == "spoofed-user"


def test_hash_mismatch_returns_stable_error() -> None:
    service = _service()
    auth = _auth()

    with pytest.raises(BootstrapError) as exc_info:
        service.create_installation(
            agent_id="framework.ai-autosdlc",
            agent_version="1.0.0",
            artifact_hash="sha256:wrong",
            device_os="macOS",
            device_public_key_thumbprint="thumb-1",
            auth_context=auth,
            permission_decision=_decision(auth),
            trace_id="trace-1",
            idempotency_key="idem-1",
        )

    assert exc_info.value.status_code == 409
    assert exc_info.value.response.error_code == "PACKAGE_HASH_MISMATCH"
    assert exc_info.value.response.recommended_action_id == "regenerate_activation_command"
