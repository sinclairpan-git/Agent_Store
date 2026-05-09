from agent_store.api.agent_registry import response_envelope_ok
from agent_store.api.managed_installer import ManagedInstallerPreviewAPI


def _payload() -> dict[str, object]:
    return {
        "trace_id": "trace-029",
        "audit_id": "audit-029",
        "agent_id": "agent.guided-uploader",
        "agent_version": "0.1.0",
        "package": {
            "package_id": "pkg-guided-uploader-001",
            "artifact_hash": "sha256:guided-uploader",
            "artifact_url": "https://store.example/packages/guided-uploader.tgz",
            "download_state": "available",
            "signature_state": "verified",
            "hash_match_state": "matched",
        },
        "policy_approval_echo": {
            "echo_state": "policy_allowed",
            "store_projection": {
                "store_may_continue": True,
                "store_override_allowed": False,
                "capability_grant_issued": False,
            },
        },
        "installation_runtime_handoff": {
            "handoff_state": "runtime_handoff_ready",
            "runtime_consumption_allowed": True,
            "installation": {
                "installation_id": "inst-029",
                "device_id": "dev-029",
            },
        },
        "installer_probe": {
            "smoke_test_state": "not_run",
            "diagnostic_ref": "diag-029",
            "isolation_profile": "basic_sandbox",
        },
    }


def test_preview_managed_installer_returns_preview_contract() -> None:
    status, body = ManagedInstallerPreviewAPI().preview_managed_installer(
        _payload(),
        headers={"Idempotency-Key": "managed-installer-029"},
    )
    preview = body["managed_installer_preview"]

    assert status == 200
    assert response_envelope_ok(body)
    assert preview["contract_schema_version"] == "managed_installer_preview.v1"
    assert preview["installer_state"] == "ready_to_install_preview"
    assert preview["real_install_started"] is False
    assert preview["source_of_truth"]["installer_execution"] == (
        "not_started_preview_only"
    )


def test_preview_managed_installer_reuses_idempotent_result() -> None:
    api = ManagedInstallerPreviewAPI()

    _, first = api.preview_managed_installer(
        _payload(),
        headers={"Idempotency-Key": "managed-installer-029"},
    )
    first["managed_installer_preview"]["installer_state"] = "mutated"
    status, second = api.preview_managed_installer(
        _payload(),
        headers={"Idempotency-Key": "managed-installer-029"},
    )

    assert status == 200
    assert second["managed_installer_preview"]["installer_state"] == (
        "ready_to_install_preview"
    )


def test_preview_managed_installer_ignores_observability_for_idempotency() -> None:
    api = ManagedInstallerPreviewAPI()

    _, first = api.preview_managed_installer(
        _payload(),
        headers={"Idempotency-Key": "managed-installer-029"},
    )
    retry = _payload()
    retry["trace_id"] = "trace-retry"
    retry["audit_id"] = "audit-retry"
    status, second = api.preview_managed_installer(
        retry,
        headers={"Idempotency-Key": "managed-installer-029"},
    )

    assert status == 200
    assert second == first


def test_preview_managed_installer_rejects_idempotency_conflict() -> None:
    api = ManagedInstallerPreviewAPI()
    api.preview_managed_installer(
        _payload(),
        headers={"Idempotency-Key": "managed-installer-029"},
    )
    changed = _payload()
    changed["package"]["signature_state"] = "mismatch"

    status, body = api.preview_managed_installer(
        changed,
        headers={"Idempotency-Key": "managed-installer-029"},
    )

    assert status == 409
    assert response_envelope_ok(body)
    assert body["error_code"] == "IDEMPOTENCY_KEY_CONFLICT"


def test_preview_managed_installer_requires_package_object() -> None:
    payload = _payload()
    payload["package"] = None

    status, body = ManagedInstallerPreviewAPI().preview_managed_installer(
        payload,
        headers={"Idempotency-Key": "managed-installer-029"},
    )

    assert status == 400
    assert response_envelope_ok(body)
    assert body["details"]["reason"] == "package must be an object"


def test_preview_managed_installer_requires_runtime_handoff_object() -> None:
    payload = _payload()
    payload["installation_runtime_handoff"] = None

    status, body = ManagedInstallerPreviewAPI().preview_managed_installer(
        payload,
        headers={"Idempotency-Key": "managed-installer-029"},
    )

    assert status == 400
    assert response_envelope_ok(body)
    assert body["details"]["reason"] == (
        "installation_runtime_handoff must be an object"
    )
