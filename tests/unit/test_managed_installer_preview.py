from agent_store.domain.managed_installer import build_managed_installer_preview


def _package(**overrides: object) -> dict[str, object]:
    package = {
        "package_id": "pkg-guided-uploader-001",
        "artifact_hash": "sha256:guided-uploader",
        "artifact_url": "https://store.example/packages/guided-uploader.tgz",
        "download_state": "available",
        "signature_state": "verified",
        "hash_match_state": "matched",
    }
    package.update(overrides)
    return package


def _policy(echo_state: str = "policy_allowed") -> dict[str, object]:
    return {
        "echo_state": echo_state,
        "store_projection": {
            "store_may_continue": echo_state == "policy_allowed",
            "store_override_allowed": False,
            "capability_grant_issued": False,
        },
    }


def _handoff(
    handoff_state: str = "runtime_handoff_ready",
    allowed: bool = True,
) -> dict[str, object]:
    return {
        "handoff_state": handoff_state,
        "runtime_consumption_allowed": allowed,
        "installation": {
            "installation_id": "inst-029",
            "device_id": "dev-029",
        },
    }


def _probe(smoke_test_state: str = "not_run") -> dict[str, object]:
    return {
        "smoke_test_state": smoke_test_state,
        "smoke_test_ref": "smoke://guided-uploader/0.1.0",
        "diagnostic_ref": "diag-029",
        "isolation_profile": "basic_sandbox",
    }


def _preview(
    *,
    package: dict[str, object] | None = None,
    policy: dict[str, object] | None = None,
    handoff: dict[str, object] | None = None,
    probe: dict[str, object] | None = None,
) -> dict[str, object]:
    return build_managed_installer_preview(
        agent_id="agent.guided-uploader",
        agent_version="0.1.0",
        package=package or _package(),
        policy_approval_echo=policy or _policy(),
        installation_runtime_handoff=handoff or _handoff(),
        installer_probe=probe if probe is not None else _probe(),
        trace_id="trace-029",
        audit_id="audit-029",
    ).to_response()["managed_installer_preview"]


def test_managed_installer_preview_is_ready_without_starting_real_install() -> None:
    preview = _preview()

    assert preview["contract_schema_version"] == "managed_installer_preview.v1"
    assert preview["installer_state"] == "ready_to_install_preview"
    assert preview["execution_mode"] == "preview_only"
    assert preview["real_install_started"] is False
    assert preview["policy_gate"]["store_may_continue"] is True
    assert preview["runtime_gate"]["runtime_consumption_allowed"] is True
    assert preview["steps"][0]["step_id"] == "download_artifact"
    assert preview["steps"][3]["step_state"] == "pending"
    assert preview["next_action"]["action_id"] == "prepare_managed_install"


def test_managed_installer_preview_passes_after_smoke_test_echo() -> None:
    preview = _preview(probe=_probe("passed"))

    assert preview["installer_state"] == "preview_passed"
    assert preview["smoke_test"]["smoke_test_state"] == "passed"
    assert preview["steps"][3]["step_state"] == "passed"
    assert preview["diagnostics"]["copyable"] is False


def test_managed_installer_preview_blocks_missing_download() -> None:
    preview = _preview(package=_package(artifact_url="", download_state="missing"))

    assert preview["installer_state"] == "download_blocked"
    assert preview["issues"][0]["issue_id"] == "DOWNLOAD_SOURCE_UNAVAILABLE"
    assert preview["steps"][0]["step_state"] == "blocked"
    assert preview["next_action"]["action_id"] == "refresh_package_download"


def test_managed_installer_preview_blocks_untrusted_signature_or_hash() -> None:
    preview = _preview(package=_package(signature_state="mismatch"))

    assert preview["installer_state"] == "signature_blocked"
    assert preview["issues"][0]["issue_id"] == "SIGNATURE_OR_HASH_UNTRUSTED"
    assert preview["steps"][1]["step_state"] == "blocked"
    assert preview["next_action"]["action_id"] == "regenerate_package_signature"


def test_managed_installer_preview_blocks_policy_until_agentops_allows() -> None:
    preview = _preview(policy=_policy("approval_pending"))

    assert preview["installer_state"] == "policy_blocked"
    assert preview["policy_gate"]["store_may_continue"] is False
    assert preview["issues"][0]["issue_id"] == "POLICY_APPROVAL_NOT_ALLOWED"
    assert preview["next_action"]["target_system"] == "agentops"


def test_managed_installer_preview_blocks_runtime_handoff_mismatch() -> None:
    preview = _preview(handoff=_handoff("artifact_hash_mismatch", False))

    assert preview["installer_state"] == "runtime_handoff_blocked"
    assert preview["runtime_gate"]["handoff_state"] == "artifact_hash_mismatch"
    assert preview["issues"][0]["issue_id"] == "RUNTIME_HANDOFF_NOT_READY"
    assert preview["next_action"]["target_system"] == "agent_runtime"


def test_managed_installer_preview_exposes_failed_smoke_test_diagnostic() -> None:
    preview = _preview(probe=_probe("failed"))

    assert preview["installer_state"] == "smoke_test_failed"
    assert preview["issues"][0]["issue_id"] == "SMOKE_TEST_FAILED"
    assert preview["steps"][4]["step_state"] == "ready"
    assert preview["diagnostics"]["diagnostic_ref"] == "diag-029"
    assert preview["diagnostics"]["copyable"] is True
    assert preview["next_action"]["action_id"] == "copy_installer_diagnostic"
