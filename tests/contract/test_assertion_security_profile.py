from datetime import timedelta

import pytest

from agent_store.domain.assertions import (
    AssertionValidationError,
    InstallationAssertionService,
)
from agent_store.domain.bootstrap_service import BootstrapService
from agent_store.domain.models import AgentVersion
from agent_store.domain.permissions import AuthContext, PermissionDecision

TEST_ASSERTION_SECRET = b"test-assertion-secret"


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
    service = InstallationAssertionService(secret=TEST_ASSERTION_SECRET)
    return service, service.issue(
        installation,
        device_public_key_thumbprint="thumb-1",
        nonce="nonce-1",
        audience="agentops",
    )


def _installation(idempotency_key: str = "install-1"):
    auth = AuthContext(
        auth_context_id=f"auth-{idempotency_key}",
        subject_user_id="user-1",
        identity_confidence=0.99,
    )
    decision = PermissionDecision.from_auth_context(
        auth_context=auth,
        decision="allow",
        permission_decision_id=f"perm-{idempotency_key}",
        audit_id=f"audit-{idempotency_key}",
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
    return bootstrap.create_installation(
        agent_id="framework.ai-autosdlc",
        agent_version="1.0.0",
        artifact_hash="sha256:first",
        device_os="macOS",
        device_public_key_thumbprint="thumb-1",
        auth_context=auth,
        permission_decision=decision,
        trace_id="trace-1",
        idempotency_key=idempotency_key,
    ).installation


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


def test_replay_window_allows_nonce_reuse_after_window_expires() -> None:
    service, assertion = _assertion()
    first_seen = assertion.issued_at + timedelta(seconds=1)
    after_window = first_seen + timedelta(seconds=assertion.replay_window_seconds)

    service.validate(
        assertion,
        expected_audience="agentops",
        expected_device_public_key_thumbprint="thumb-1",
        trace_id="trace-1",
        now=first_seen,
    )
    service.validate(
        assertion,
        expected_audience="agentops",
        expected_device_public_key_thumbprint="thumb-1",
        trace_id="trace-2",
        now=after_window,
    )


def test_same_nonce_is_allowed_for_different_installation_contexts() -> None:
    service = InstallationAssertionService(secret=TEST_ASSERTION_SECRET)
    first = service.issue(
        _installation("install-1"),
        device_public_key_thumbprint="thumb-1",
        nonce="nonce-shared",
        audience="agentops",
    )
    second = service.issue(
        _installation("install-2"),
        device_public_key_thumbprint="thumb-1",
        nonce="nonce-shared",
        audience="agentops",
    )

    service.validate(
        first,
        expected_audience="agentops",
        expected_device_public_key_thumbprint="thumb-1",
        trace_id="trace-1",
    )
    service.validate(
        second,
        expected_audience="agentops",
        expected_device_public_key_thumbprint="thumb-1",
        trace_id="trace-2",
    )


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
