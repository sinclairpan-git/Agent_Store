from agent_store.domain.runtime_availability import build_runtime_availability_summary


def _manifest() -> dict[str, object]:
    return {
        "manifest_schema_version": "agent-manifest.v1",
        "agent_id": "agent.release-reviewer",
        "version": "0.2.0",
        "artifact_hash": "sha256:release-reviewer",
        "runtime_contract_version": "runtime-contract.v2",
        "required_runtime_capabilities": [
            "tool_call",
            "policy_check",
            "outbox",
            "basic_isolation",
        ],
        "skills": [
            {
                "skill_id": "repo.read",
                "skill_version": "1.0.0",
            }
        ],
        "permission_intents": ["repo.read"],
        "data_scopes": ["repository"],
        "secret_refs": [],
        "network_allowlist": ["api.github.com"],
        "observability_contract": {
            "trace_spans": ["agent", "tool", "guardrail"],
            "event_types": ["runtime_run_started", "runtime_run_completed"],
            "outbox_required": True,
        },
        "guardrail_refs": ["guardrail.repo-boundary.v1"],
        "rollback_policy": "disable current version and restore previous version",
        "provenance": {
            "source_repo": "repo/release-reviewer",
            "source_commit": "abc123",
            "issuer": "agent-store",
        },
    }


def _runtime_echo(**overrides: object) -> dict[str, object]:
    echo: dict[str, object] = {
        "runtime_id": "runtime.local",
        "availability_state": "available",
        "runtime_contract_version": "runtime-contract.v2",
        "capabilities": [
            "tool_call",
            "policy_check",
            "outbox",
            "basic_isolation",
        ],
        "observed_at": "2026-05-09T08:00:00Z",
        "probe_ref": "runtime-probe-1",
    }
    echo.update(overrides)
    return echo


def test_runtime_availability_ready_when_runtime_echo_satisfies_manifest() -> None:
    summary = build_runtime_availability_summary(
        _manifest(),
        runtime_echo=_runtime_echo(),
        trace_id="trace-023",
        audit_id="audit-023",
    )
    body = summary.to_response()["runtime_availability_summary"]

    assert summary.availability_state == "runtime_ready"
    assert summary.display_name_zh == "可运行"
    assert summary.issues == ()
    assert body["next_action"]["action_id"] == "continue_listing_review"
    assert body["source_of_truth"]["agent_manifest"] == "agent_store"
    assert body["source_of_truth"]["runtime_availability"] == (
        "agent_runtime_echo_or_probe"
    )


def test_runtime_availability_reports_missing_runtime_without_echo() -> None:
    summary = build_runtime_availability_summary(
        _manifest(),
        trace_id="trace-023",
        audit_id="audit-023",
    )
    issue = summary.issues[0].to_dict()

    assert summary.availability_state == "runtime_missing"
    assert summary.display_name_zh == "缺 Runtime"
    assert summary.runtime_facts["runtime_present"] is False
    assert issue["issue_id"] == "RUNTIME_MISSING"
    assert summary.next_action.action_id == "install_runtime"
    assert summary.next_action.target_system == "agent_runtime"


def test_runtime_availability_requires_runtime_upgrade_for_old_contract() -> None:
    summary = build_runtime_availability_summary(
        _manifest(),
        runtime_echo=_runtime_echo(runtime_contract_version="runtime-contract.v1"),
        trace_id="trace-023",
        audit_id="audit-023",
    )

    assert summary.availability_state == "runtime_upgrade_required"
    assert summary.display_name_zh == "需升级 Runtime"
    assert summary.issues[0].issue_id == "RUNTIME_UPGRADE_REQUIRED"
    assert summary.next_action.action_id == "upgrade_runtime"


def test_runtime_availability_reports_missing_capabilities_after_version_passes() -> (
    None
):
    summary = build_runtime_availability_summary(
        _manifest(),
        runtime_echo=_runtime_echo(capabilities=["tool_call", "outbox"]),
        trace_id="trace-023",
        audit_id="audit-023",
    )

    assert summary.availability_state == "runtime_capability_missing"
    assert summary.display_name_zh == "缺 Runtime 能力"
    assert set(summary.missing_runtime_capabilities) == {
        "policy_check",
        "basic_isolation",
    }
    assert summary.issues[0].field_path == "runtime_availability.capabilities"
    assert summary.next_action.action_id == "view_missing_runtime_capabilities"


def test_runtime_availability_blocks_when_manifest_contract_is_incomplete() -> None:
    manifest = _manifest()
    manifest.pop("observability_contract")

    summary = build_runtime_availability_summary(
        manifest,
        runtime_echo=_runtime_echo(),
        trace_id="trace-023",
        audit_id="audit-023",
    )

    assert summary.availability_state == "manifest_incomplete"
    assert summary.display_name_zh == "Manifest 待补齐"
    assert summary.issues[0].issue_id == "MANIFEST_RUNTIME_CONTRACT_INCOMPLETE"
    assert summary.next_action.action_id == "complete_agent_manifest"
