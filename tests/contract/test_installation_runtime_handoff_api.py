from agent_store.api.agent_registry import response_envelope_ok
from agent_store.api.installation_runtime import InstallationRuntimeHandoffAPI
from agent_store.domain.bootstrap_service import BootstrapService
from agent_store.domain.models import AgentVersion
from agent_store.domain.permissions import AuthContext, PermissionDecision


def _auth(auth_context_id: str = "auth-025") -> AuthContext:
    return AuthContext(
        auth_context_id=auth_context_id,
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


def _service_with_record() -> tuple[BootstrapService, str, AuthContext]:
    version = AgentVersion(
        agent_id="agent.release-reviewer",
        version="1.0.0",
        artifact_hash="sha256:release-reviewer",
        signature="sig",
        issuer="Agent Store",
        release_status="manual_installable-preview",
    )
    service = BootstrapService(versions={version.identity_key: version})
    auth = _auth()
    record = service.create_installation(
        agent_id="agent.release-reviewer",
        agent_version="1.0.0",
        artifact_hash="sha256:release-reviewer",
        device_os="macOS",
        device_public_key_thumbprint="thumb-025",
        auth_context=auth,
        permission_decision=_decision(auth),
        trace_id="trace-025",
        idempotency_key="install-025",
    )
    return service, record.installation.installation_id, auth


def _payload(**runtime_echo: object) -> dict[str, object]:
    echo: dict[str, object] = {
        "runtime_id": "runtime.local",
        "artifact_hash": "sha256:release-reviewer",
        "observed_at": "2026-05-09T08:00:00Z",
    }
    echo.update(runtime_echo)
    return {
        "trace_id": "trace-025",
        "audit_id": "audit-025",
        "runtime_echo": echo,
    }


def test_runtime_handoff_exposes_installation_and_device_binding_for_runtime() -> None:
    service, installation_id, auth = _service_with_record()

    status, body = InstallationRuntimeHandoffAPI(
        bootstrap_service=service,
    ).create_runtime_handoff(
        installation_id,
        _payload(),
        headers={"Idempotency-Key": "runtime-handoff-025"},
        auth_context=auth,
    )
    handoff = body["installation_runtime_handoff"]

    assert status == 200
    assert response_envelope_ok(body)
    assert handoff["contract_schema_version"] == "installation_runtime_handoff.v1"
    assert handoff["handoff_state"] == "runtime_handoff_ready"
    assert handoff["runtime_consumption_allowed"] is True
    assert handoff["installation"]["installation_id"] == installation_id
    assert handoff["device_binding"]["artifact_hash"] == "sha256:release-reviewer"
    assert handoff["source_of_truth"]["device_binding"] == "agent_store"


def test_runtime_handoff_reports_artifact_hash_mismatch_with_next_action() -> None:
    service, installation_id, auth = _service_with_record()

    status, body = InstallationRuntimeHandoffAPI(
        bootstrap_service=service,
    ).create_runtime_handoff(
        installation_id,
        _payload(artifact_hash="sha256:tampered"),
        headers={"Idempotency-Key": "runtime-handoff-025"},
        auth_context=auth,
    )
    handoff = body["installation_runtime_handoff"]

    assert status == 200
    assert response_envelope_ok(body)
    assert handoff["handoff_state"] == "artifact_hash_mismatch"
    assert handoff["runtime_consumption_allowed"] is False
    assert handoff["issues"][0]["issue_id"] == "ARTIFACT_HASH_MISMATCH"
    assert handoff["next_action"]["action_id"] == "regenerate_activation_command"


def test_runtime_handoff_is_idempotent_and_returns_defensive_copy() -> None:
    service, installation_id, auth = _service_with_record()
    api = InstallationRuntimeHandoffAPI(bootstrap_service=service)

    _, first = api.create_runtime_handoff(
        installation_id,
        _payload(),
        headers={"Idempotency-Key": "runtime-handoff-025"},
        auth_context=auth,
    )
    first["installation_runtime_handoff"]["handoff_state"] = "mutated"
    status, second = api.create_runtime_handoff(
        installation_id,
        _payload(),
        headers={"Idempotency-Key": "runtime-handoff-025"},
        auth_context=auth,
    )

    assert status == 200
    assert (
        second["installation_runtime_handoff"]["handoff_state"]
        == "runtime_handoff_ready"
    )


def test_runtime_handoff_rejects_idempotency_conflict() -> None:
    service, installation_id, auth = _service_with_record()
    api = InstallationRuntimeHandoffAPI(bootstrap_service=service)

    api.create_runtime_handoff(
        installation_id,
        _payload(),
        headers={"Idempotency-Key": "runtime-handoff-025"},
        auth_context=auth,
    )
    status, body = api.create_runtime_handoff(
        installation_id,
        _payload(runtime_id="runtime.other"),
        headers={"Idempotency-Key": "runtime-handoff-025"},
        auth_context=auth,
    )

    assert status == 409
    assert response_envelope_ok(body)
    assert body["error_code"] == "IDEMPOTENCY_KEY_CONFLICT"


def test_runtime_handoff_rejects_auth_context_mismatch() -> None:
    service, installation_id, _ = _service_with_record()
    other_auth = AuthContext(
        auth_context_id="auth-other",
        subject_user_id="operator@example.com",
        identity_confidence=0.99,
        tenant_id="tenant-other",
    )

    status, body = InstallationRuntimeHandoffAPI(
        bootstrap_service=service,
    ).create_runtime_handoff(
        installation_id,
        _payload(),
        headers={"Idempotency-Key": "runtime-handoff-025"},
        auth_context=other_auth,
    )

    assert status == 403
    assert response_envelope_ok(body)
    assert body["error_code"] == "PERMISSION_DENIED"


def test_runtime_handoff_returns_not_found_for_unknown_installation() -> None:
    status, body = InstallationRuntimeHandoffAPI().create_runtime_handoff(
        "inst-missing",
        _payload(),
        headers={"Idempotency-Key": "runtime-handoff-025"},
        auth_context=_auth(),
    )

    assert status == 404
    assert response_envelope_ok(body)
    assert body["error_code"] == "INSTALLATION_NOT_FOUND"
