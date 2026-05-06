from datetime import timedelta

import pytest

from agent_store.domain.assertions import (
    AssertionValidationError,
    InstallationAssertionService,
)
from agent_store.domain.bootstrap_service import BootstrapService
from agent_store.domain.models import AgentVersion, utc_now
from agent_store.domain.permissions import AuthContext, PermissionDecision

TEST_ASSERTION_SECRET = b"test-assertion-secret"


def _installation():
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
    return service.create_installation(
        agent_id="framework.ai-autosdlc",
        agent_version="1.0.0",
        artifact_hash="sha256:first",
        device_os="macOS",
        device_public_key_thumbprint="thumb-1",
        auth_context=auth,
        permission_decision=decision,
        trace_id="trace-1",
        idempotency_key="idem-1",
    ).installation


def test_assertion_contains_required_phase1_and_security_fields() -> None:
    assertion = InstallationAssertionService(secret=TEST_ASSERTION_SECRET).issue(
        _installation(),
        device_public_key_thumbprint="thumb-1",
        nonce="nonce-1",
        audience="agentops",
    )

    data = assertion.to_dict()
    assert data["installation_id"]
    assert data["device_id"]
    assert data["artifact_hash"] == "sha256:first"
    assert data["issuer"] == "Agent Store"
    assert data["expires_at"]
    assert data["key_id"]
    assert data["signature"]
    assert data["alg"] == "HS256"
    assert data["canonicalization"] == "json-c14n-v1"
    assert data["assertion_hash"]
    assert data["revocation_status"] == "not_revoked"


def test_expired_assertion_returns_stable_error() -> None:
    service = InstallationAssertionService(secret=TEST_ASSERTION_SECRET)
    now = utc_now()
    assertion = service.issue(
        _installation(),
        device_public_key_thumbprint="thumb-1",
        nonce="nonce-1",
        audience="agentops",
        now=now - timedelta(hours=1),
    )

    with pytest.raises(AssertionValidationError) as exc_info:
        service.validate(
            assertion,
            expected_audience="agentops",
            expected_device_public_key_thumbprint="thumb-1",
            trace_id="trace-1",
            now=now,
        )

    assert exc_info.value.response.error_code == "INSTALLATION_ASSERTION_EXPIRED"


def test_assertion_service_requires_external_signing_secret() -> None:
    with pytest.raises(ValueError, match="assertion signing secret"):
        InstallationAssertionService(secret=b"")
