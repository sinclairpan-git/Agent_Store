import hashlib
import hmac
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


def test_assertion_exports_agentops_handoff_field_names_without_mutating_internal_model() -> None:
    assertion = InstallationAssertionService(secret=TEST_ASSERTION_SECRET).issue(
        _installation(),
        device_public_key_thumbprint="thumb-1",
        nonce="nonce-1",
        audience="agentops",
    )

    internal = assertion.to_dict()
    external = assertion.to_agentops_handoff_assertion()

    assert internal["assertion_version"] == "1"
    assert internal["issuer"] == "Agent Store"
    assert internal["alg"] == "HS256"
    assert internal["subject_user_id"] == "user-1"
    assert external["assertion_version"] == "signed_installation_assertion.v1"
    assert external["issuer"] == "agent-store"
    assert external["algorithm"] == "HS256"
    assert external["user_id"] == "user-1"
    assert external["canonicalization"] == "json-c14n-v1"
    assert external["agent_id"] == "framework.ai-autosdlc"
    assert external["agent_version"] == "1.0.0"
    assert external["assertion_hash"] != internal["assertion_hash"]
    assert external["signature"] != internal["signature"]
    assert "alg" not in external
    assert "subject_user_id" not in external


def test_agentops_handoff_assertion_signature_matches_external_payload() -> None:
    assertion = InstallationAssertionService(secret=TEST_ASSERTION_SECRET).issue(
        _installation(),
        device_public_key_thumbprint="thumb-1",
        nonce="nonce-1",
        audience="agentops",
    )

    external = assertion.to_agentops_handoff_assertion()
    signed_fields = {
        key: str(value)
        for key, value in external.items()
        if key not in {"assertion_hash", "signature"}
    }
    canonical_payload = "\n".join(
        f"{key}={signed_fields[key]}" for key in sorted(signed_fields)
    )
    expected_hash = hashlib.sha256(canonical_payload.encode("utf-8")).hexdigest()
    expected_signature = hmac.new(
        TEST_ASSERTION_SECRET,
        expected_hash.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    assert external["assertion_hash"] == expected_hash
    assert external["signature"] == expected_signature


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
