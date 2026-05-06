import pytest

from agent_store.domain.installation import DeviceBinding, Installation
from agent_store.domain.permissions import AuthContext, PermissionDecision


def _auth() -> AuthContext:
    return AuthContext(
        auth_context_id="auth-1",
        subject_user_id="user-1",
        identity_confidence=0.99,
    )


def _decision(auth: AuthContext) -> PermissionDecision:
    return PermissionDecision.from_auth_context(
        auth_context=auth,
        decision="allow",
        permission_decision_id="perm-1",
        audit_id="audit-1",
        trace_id="trace-1",
    )


def test_installation_contains_phase1_required_fields() -> None:
    auth = _auth()
    installation = Installation(
        installation_id="inst-1",
        device_id="dev-1",
        agent_id="framework.ai-autosdlc",
        agent_version="1.0.0",
        artifact_hash="sha256:first",
        user="user-1",
        device_os="macOS",
        status="activation_required",
        trace_id="trace-1",
        auth_context=auth,
        permission_decision=_decision(auth),
    )

    assert installation.to_dict() == {
        "installation_id": "inst-1",
        "device_id": "dev-1",
        "agent_id": "framework.ai-autosdlc",
        "agent_version": "1.0.0",
        "artifact_hash": "sha256:first",
        "status": "activation_required",
        "enterprise_state": "activating",
    }


def test_installation_rejects_status_outside_phase1_enum() -> None:
    auth = _auth()

    with pytest.raises(ValueError, match="unsupported installation status"):
        Installation(
            installation_id="inst-1",
            device_id="dev-1",
            agent_id="framework.ai-autosdlc",
            agent_version="1.0.0",
            artifact_hash="sha256:first",
            user="user-1",
            device_os="macOS",
            status="installed",
            trace_id="trace-1",
            auth_context=auth,
            permission_decision=_decision(auth),
        )


def test_device_binding_contains_phase1_required_fields() -> None:
    binding = DeviceBinding(
        device_id="dev-1",
        installation_id="inst-1",
        user="user-1",
        artifact_hash="sha256:first",
        device_public_key_thumbprint="thumb-1",
    )

    assert binding.to_dict()["device_id"] == "dev-1"
    assert binding.to_dict()["installation_id"] == "inst-1"
    assert binding.to_dict()["device_public_key_thumbprint"] == "thumb-1"
