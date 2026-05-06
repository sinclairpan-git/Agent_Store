import pytest

from agent_store.domain.assertions import (
    AssertionValidationError,
    InstallationAssertionService,
)
from agent_store.domain.bootstrap_service import BootstrapService
from agent_store.domain.models import AgentVersion
from agent_store.domain.permissions import AuthContext, PermissionDecision


def _assertion():
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
    bootstrap = BootstrapService()
    bootstrap.register_version(
        AgentVersion(
            agent_id="framework.ai-autosdlc",
            version="1.0.0",
            artifact_hash="sha256:first",
            signature="sig-1",
            issuer="Agent Store",
        )
    )
    installation = bootstrap.create_installation(
        agent_id="framework.ai-autosdlc",
        agent_version="1.0.0",
        artifact_hash="sha256:first",
        device_os="macOS",
        device_public_key_thumbprint="thumb-1",
        auth_context=auth,
        permission_decision=decision,
        trace_id="trace-1",
        idempotency_key="install-1",
    ).installation
    service = InstallationAssertionService()
    return service, service.issue(
        installation,
        device_public_key_thumbprint="thumb-1",
        nonce="nonce-1",
        audience="agentops",
    )


def test_assertion_response_contains_security_profile_fields() -> None:
    _, assertion = _assertion()
    data = assertion.to_dict()

    for field in (
        "alg",
        "canonicalization",
        "nonce",
        "replay_window_seconds",
        "assertion_hash",
        "revocation_status",
    ):
        assert data[field]


def test_replay_is_rejected() -> None:
    service, assertion = _assertion()
    service.validate(
        assertion,
        expected_audience="agentops",
        expected_device_public_key_thumbprint="thumb-1",
        trace_id="trace-1",
    )

    with pytest.raises(AssertionValidationError) as exc_info:
        service.validate(
            assertion,
            expected_audience="agentops",
            expected_device_public_key_thumbprint="thumb-1",
            trace_id="trace-1",
        )

    assert exc_info.value.response.error_code == "ASSERTION_REPLAY_DETECTED"


def test_revoked_assertion_is_rejected() -> None:
    service, assertion = _assertion()

    with pytest.raises(AssertionValidationError) as exc_info:
        service.validate(
            assertion.with_updates(revocation_status="revoked"),
            expected_audience="agentops",
            expected_device_public_key_thumbprint="thumb-1",
            trace_id="trace-1",
        )

    assert exc_info.value.response.error_code == "ASSERTION_REVOKED"


def test_audience_mismatch_is_rejected() -> None:
    service, assertion = _assertion()

    with pytest.raises(AssertionValidationError) as exc_info:
        service.validate(
            assertion,
            expected_audience="other-system",
            expected_device_public_key_thumbprint="thumb-1",
            trace_id="trace-1",
        )

    assert exc_info.value.response.error_code == "AUDIENCE_MISMATCH"


def test_device_key_mismatch_is_rejected() -> None:
    service, assertion = _assertion()

    with pytest.raises(AssertionValidationError) as exc_info:
        service.validate(
            assertion,
            expected_audience="agentops",
            expected_device_public_key_thumbprint="thumb-2",
            trace_id="trace-1",
        )

    assert exc_info.value.response.error_code == "DEVICE_KEY_MISMATCH"


def test_tampered_assertion_integrity_is_rejected() -> None:
    service, assertion = _assertion()

    with pytest.raises(AssertionValidationError) as exc_info:
        service.validate(
            assertion.with_updates(artifact_hash="sha256:tampered"),
            expected_audience="agentops",
            expected_device_public_key_thumbprint="thumb-1",
            trace_id="trace-1",
        )

    assert exc_info.value.response.error_code == "ASSERTION_SIGNATURE_INVALID"
