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


def test_idempotent_retry_allows_fresh_permission_decision_id() -> None:
    service = _service()
    auth = _auth()
    first_decision = _decision(auth)
    second_decision = PermissionDecision.from_auth_context(
        auth_context=auth,
        decision="allow",
        permission_decision_id="perm-retry",
        audit_id="audit-retry",
        trace_id="trace-retry",
    )

    first = service.create_installation(
        agent_id="framework.ai-autosdlc",
        agent_version="1.0.0",
        artifact_hash="sha256:first",
        device_os="macOS",
        device_public_key_thumbprint="thumb-1",
        auth_context=auth,
        permission_decision=first_decision,
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
        permission_decision=second_decision,
        trace_id="trace-2",
        idempotency_key="idem-1",
    )

    assert second is first


def test_idempotency_key_reuse_requires_same_request_identity_within_caller_scope() -> None:
    service = _service()
    auth = _auth()
    decision = _decision(auth)
    service.create_installation(
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

    with pytest.raises(BootstrapError) as exc_info:
        service.create_installation(
            agent_id="framework.ai-autosdlc",
            agent_version="1.0.0",
            artifact_hash="sha256:first",
            device_os="macOS",
            device_public_key_thumbprint="thumb-2",
            auth_context=auth,
            permission_decision=decision,
            trace_id="trace-2",
            idempotency_key="idem-1",
        )

    assert exc_info.value.status_code == 409
    assert exc_info.value.response.error_code == "VALIDATION_ERROR"


def test_idempotency_key_reuse_is_scoped_by_caller_context() -> None:
    service = _service()
    auth = _auth()
    first = service.create_installation(
        agent_id="framework.ai-autosdlc",
        agent_version="1.0.0",
        artifact_hash="sha256:first",
        device_os="macOS",
        device_public_key_thumbprint="thumb-1",
        auth_context=auth,
        permission_decision=_decision(auth),
        trace_id="trace-1",
        idempotency_key="idem-1",
    )
    other_auth = AuthContext(
        auth_context_id="auth-2",
        subject_user_id="iam-user-2",
        identity_confidence=0.99,
    )
    other_decision = PermissionDecision.from_auth_context(
        auth_context=other_auth,
        decision="allow",
        permission_decision_id="perm-2",
        audit_id="audit-2",
        trace_id="trace-2",
    )

    second = service.create_installation(
        agent_id="framework.ai-autosdlc",
        agent_version="1.0.0",
        artifact_hash="sha256:first",
        device_os="macOS",
        device_public_key_thumbprint="thumb-1",
        auth_context=other_auth,
        permission_decision=other_decision,
        trace_id="trace-2",
        idempotency_key="idem-1",
    )

    assert second is not first
    assert second.installation.installation_id != first.installation.installation_id


@pytest.mark.parametrize("decision", ["deny", "approval_required"])
def test_non_allow_permission_decision_blocks_installation(decision: str) -> None:
    service = _service()
    auth = _auth()
    permission_decision = PermissionDecision.from_auth_context(
        auth_context=auth,
        decision=decision,
        permission_decision_id="perm-1",
        audit_id="audit-1",
        trace_id="trace-1",
        denied_scope="agent.install",
        request_access_url="https://example.test/access",
    )

    with pytest.raises(BootstrapError) as exc_info:
        service.create_installation(
            agent_id="framework.ai-autosdlc",
            agent_version="1.0.0",
            artifact_hash="sha256:first",
            device_os="macOS",
            device_public_key_thumbprint="thumb-1",
            auth_context=auth,
            permission_decision=permission_decision,
            trace_id="trace-1",
            idempotency_key="idem-1",
        )

    assert exc_info.value.status_code == 403
    assert exc_info.value.response.error_code == "PERMISSION_DENIED"


def test_permission_decision_must_match_auth_context() -> None:
    service = _service()
    auth = _auth()
    other_auth = AuthContext(
        auth_context_id="auth-2",
        subject_user_id="iam-user-2",
        identity_confidence=0.99,
    )
    stale_decision = PermissionDecision.from_auth_context(
        auth_context=other_auth,
        decision="allow",
        permission_decision_id="perm-2",
        audit_id="audit-2",
        trace_id="trace-2",
    )

    with pytest.raises(BootstrapError) as exc_info:
        service.create_installation(
            agent_id="framework.ai-autosdlc",
            agent_version="1.0.0",
            artifact_hash="sha256:first",
            device_os="macOS",
            device_public_key_thumbprint="thumb-1",
            auth_context=auth,
            permission_decision=stale_decision,
            trace_id="trace-1",
            idempotency_key="idem-1",
        )

    assert exc_info.value.status_code == 403
    assert exc_info.value.response.error_code == "PERMISSION_DENIED"
    assert exc_info.value.response.message_key == "errors.permissionContextMismatch"


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


def test_unknown_agent_version_is_rejected_before_installation() -> None:
    service = _service()
    auth = _auth()

    with pytest.raises(BootstrapError) as exc_info:
        service.create_installation(
            agent_id="framework.ai-autosdlc",
            agent_version="9.9.9",
            artifact_hash="sha256:first",
            device_os="macOS",
            device_public_key_thumbprint="thumb-1",
            auth_context=auth,
            permission_decision=_decision(auth),
            trace_id="trace-1",
            idempotency_key="idem-1",
        )

    assert exc_info.value.status_code == 404
    assert exc_info.value.response.error_code == "PACKAGE_HASH_MISMATCH"
    assert exc_info.value.response.message_key == "errors.agentVersionUnknown"
    assert exc_info.value.response.details["reason"] == "version_not_registered"
