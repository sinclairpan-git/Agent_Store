from agent_store.domain.bootstrap_service import BootstrapRecord
from agent_store.domain.installation import DeviceBinding, Installation
from agent_store.domain.installation_runtime import build_installation_runtime_handoff
from agent_store.domain.permissions import AuthContext, PermissionDecision


def _auth() -> AuthContext:
    return AuthContext(
        auth_context_id="auth-025",
        subject_user_id="operator@example.com",
        identity_confidence=0.99,
        tenant_id="tenant-1",
    )


def _decision(auth: AuthContext) -> PermissionDecision:
    return PermissionDecision.from_auth_context(
        auth_context=auth,
        decision="allow",
        permission_decision_id="perm-025",
        audit_id="audit-025",
        trace_id="trace-025",
    )


def _record(
    *,
    installation_status: str = "activation_required",
    binding_status: str = "active",
    binding_artifact_hash: str = "sha256:release-reviewer",
) -> BootstrapRecord:
    auth = _auth()
    installation = Installation(
        installation_id="inst-025",
        device_id="dev-025",
        agent_id="agent.release-reviewer",
        agent_version="1.0.0",
        artifact_hash="sha256:release-reviewer",
        user="operator@example.com",
        device_os="macOS",
        status=installation_status,
        trace_id="trace-025",
        auth_context=auth,
        permission_decision=_decision(auth),
    )
    binding = DeviceBinding(
        device_id="dev-025",
        installation_id="inst-025",
        user="operator@example.com",
        artifact_hash=binding_artifact_hash,
        device_public_key_thumbprint="thumb-025",
        status=binding_status,
    )
    return BootstrapRecord(installation=installation, device_binding=binding)


def test_installation_runtime_handoff_allows_bound_runtime_consumption() -> None:
    handoff = build_installation_runtime_handoff(
        _record(),
        runtime_echo={
            "runtime_id": "runtime.local",
            "installation_id": "inst-025",
            "device_id": "dev-025",
            "artifact_hash": "sha256:release-reviewer",
            "observed_at": "2026-05-09T08:00:00Z",
            "handoff_ref": "runtime-handoff-1",
        },
        trace_id="trace-025",
        audit_id="audit-025",
    )
    body = handoff.to_response()["installation_runtime_handoff"]

    assert handoff.handoff_state == "runtime_handoff_ready"
    assert handoff.runtime_consumption_allowed is True
    assert handoff.issues == ()
    assert body["next_action"]["action_id"] == "start_runtime_activation"
    assert body["source_of_truth"]["installation"] == "agent_store"
    assert body["source_of_truth"]["runtime_consumption"] == (
        "agent_runtime_echo_or_request"
    )
    assert body["device_binding"]["device_public_key_thumbprint"] == "thumb-025"


def test_installation_runtime_handoff_blocks_runtime_artifact_hash_mismatch() -> None:
    handoff = build_installation_runtime_handoff(
        _record(),
        runtime_echo={
            "runtime_id": "runtime.local",
            "installation_id": "inst-025",
            "device_id": "dev-025",
            "observed_artifact_hash": "sha256:tampered",
        },
        trace_id="trace-025",
        audit_id="audit-025",
    )
    issue = handoff.issues[0].to_dict()

    assert handoff.handoff_state == "artifact_hash_mismatch"
    assert handoff.display_name_zh == "包哈希不一致"
    assert handoff.runtime_consumption_allowed is False
    assert issue["issue_id"] == "ARTIFACT_HASH_MISMATCH"
    assert issue["field_path"] == "runtime_echo.artifact_hash"
    assert handoff.next_action.action_id == "regenerate_activation_command"


def test_installation_runtime_handoff_blocks_store_binding_artifact_mismatch() -> None:
    handoff = build_installation_runtime_handoff(
        _record(binding_artifact_hash="sha256:old"),
        trace_id="trace-025",
        audit_id="audit-025",
    )

    assert handoff.handoff_state == "artifact_hash_mismatch"
    assert handoff.runtime_consumption_allowed is False
    assert handoff.issues[0].field_path == "device_binding.artifact_hash"


def test_installation_runtime_handoff_blocks_runtime_device_mismatch() -> None:
    handoff = build_installation_runtime_handoff(
        _record(),
        runtime_echo={
            "runtime_id": "runtime.local",
            "installation_id": "inst-025",
            "device_id": "dev-other",
            "artifact_hash": "sha256:release-reviewer",
        },
        trace_id="trace-025",
        audit_id="audit-025",
    )

    assert handoff.handoff_state == "device_binding_mismatch"
    assert handoff.runtime_consumption_allowed is False
    assert handoff.issues[0].field_path == "runtime_echo.device_id"
    assert handoff.next_action.action_id == "restart_activation"


def test_installation_runtime_handoff_blocks_inactive_binding() -> None:
    handoff = build_installation_runtime_handoff(
        _record(binding_status="revoked"),
        trace_id="trace-025",
        audit_id="audit-025",
    )

    assert handoff.handoff_state == "installation_not_ready"
    assert handoff.runtime_consumption_allowed is False
    assert handoff.issues[0].issue_id == "DEVICE_BINDING_NOT_ACTIVE"
    assert handoff.next_action.action_id == "review_installation_status"


def test_installation_runtime_handoff_blocks_not_installed_status() -> None:
    handoff = build_installation_runtime_handoff(
        _record(installation_status="not_installed"),
        trace_id="trace-025",
        audit_id="audit-025",
    )

    assert handoff.handoff_state == "installation_not_ready"
    assert handoff.runtime_consumption_allowed is False
    assert handoff.issues[0].issue_id == "INSTALLATION_NOT_READY"
