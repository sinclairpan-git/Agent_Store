from agent_store.domain.agent_manifest import build_agent_manifest_runtime_contract


def _manifest() -> dict[str, object]:
    return {
        "manifest_schema_version": "agent-manifest.v1",
        "agent_id": "agent.release-reviewer",
        "version": "0.2.0",
        "artifact_hash": "sha256:release-reviewer",
        "runtime_contract_version": "runtime-contract.v1",
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
            "trace_spans": ["agent", "model", "tool", "guardrail", "artifact"],
            "event_types": ["runtime_run_started", "runtime_run_completed"],
            "outbox_required": True,
        },
        "guardrail_refs": ["guardrail.repo-boundary.v1"],
        "rollback_policy": "disable current version and return to previous stable version",
        "provenance": {
            "source_repo": "repo/release-reviewer",
            "source_commit": "abc123",
            "issuer": "agent-store",
        },
    }


def test_agent_manifest_runtime_contract_accepts_compatible_runtime() -> None:
    report = build_agent_manifest_runtime_contract(
        _manifest(),
        runtime_capabilities=(
            "tool_call",
            "policy_check",
            "outbox",
            "basic_isolation",
        ),
        trace_id="trace-022",
        audit_id="audit-022",
    )
    body = report.to_response()["agent_manifest_runtime_contract"]

    assert report.manifest_status == "complete"
    assert report.runtime_compatibility == "runtime_compatible"
    assert body["missing_runtime_capabilities"] == []
    assert body["issues"] == []
    assert body["next_action"]["action_id"] == "continue_manifest_review"
    assert body["source_of_truth"]["agent_manifest"] == "agent_store"
    assert body["source_of_truth"]["policy_decision"] == "agentops"


def test_agent_manifest_runtime_contract_blocks_missing_required_fields() -> None:
    manifest = _manifest()
    manifest.pop("required_runtime_capabilities")
    manifest.pop("observability_contract")

    report = build_agent_manifest_runtime_contract(
        manifest,
        runtime_capabilities=("tool_call", "policy_check"),
        trace_id="trace-022",
        audit_id="audit-022",
    )
    issue_ids = {issue.issue_id for issue in report.issues}

    assert report.manifest_status == "incomplete"
    assert report.runtime_compatibility == "manifest_incomplete"
    assert "REQUIRED_RUNTIME_CAPABILITIES_REQUIRED" in issue_ids
    assert "OBSERVABILITY_CONTRACT_REQUIRED" in issue_ids
    assert report.next_action["action_id"] == "complete_agent_manifest"


def test_agent_manifest_runtime_contract_blocks_runtime_capability_mismatch() -> None:
    report = build_agent_manifest_runtime_contract(
        _manifest(),
        runtime_capabilities=("tool_call", "outbox"),
        trace_id="trace-022",
        audit_id="audit-022",
    )
    issues = [issue.to_dict() for issue in report.issues]

    assert report.manifest_status == "complete"
    assert report.runtime_compatibility == "runtime_capability_missing"
    assert set(report.missing_runtime_capabilities) == {
        "policy_check",
        "basic_isolation",
    }
    assert issues[0]["issue_id"] == "RUNTIME_CAPABILITY_MISSING"
    assert issues[0]["field_path"] == "runtime.capabilities"
    assert report.next_action["action_id"] == "view_missing_runtime_capabilities"


def test_agent_manifest_runtime_contract_requires_skill_identity() -> None:
    manifest = _manifest()
    manifest["skills"] = [{"skill_id": "repo.read"}]

    report = build_agent_manifest_runtime_contract(
        manifest,
        runtime_capabilities=(
            "tool_call",
            "policy_check",
            "outbox",
            "basic_isolation",
        ),
        trace_id="trace-022",
        audit_id="audit-022",
    )

    assert report.manifest_status == "incomplete"
    assert any(issue.issue_id == "SKILL_VERSION_REQUIRED" for issue in report.issues)


def test_agent_manifest_runtime_contract_keeps_unknown_runtime_not_runnable() -> None:
    report = build_agent_manifest_runtime_contract(
        _manifest(),
        runtime_capabilities=(),
        trace_id="trace-022",
        audit_id="audit-022",
    )

    assert report.manifest_status == "complete"
    assert report.runtime_compatibility == "runtime_unknown"
    assert report.next_action["action_id"] == "check_runtime_capabilities"


def test_agent_manifest_runtime_contract_rejects_malformed_capabilities() -> None:
    manifest = _manifest()
    manifest["required_runtime_capabilities"] = ["tool_call", 123, " "]

    report = build_agent_manifest_runtime_contract(
        manifest,
        runtime_capabilities=("tool_call",),
        trace_id="trace-022",
        audit_id="audit-022",
    )
    field_paths = {
        issue.field_path
        for issue in report.issues
        if issue.issue_id == "RUNTIME_CAPABILITY_INVALID"
    }

    assert report.manifest_status == "incomplete"
    assert report.runtime_compatibility == "manifest_incomplete"
    assert field_paths == {
        "agent_manifest.required_runtime_capabilities[1]",
        "agent_manifest.required_runtime_capabilities[2]",
    }
