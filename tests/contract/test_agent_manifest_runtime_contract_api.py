from agent_store.api.agent_manifest import AgentManifestRuntimeContractAPI
from agent_store.api.agent_registry import response_envelope_ok


def _payload() -> dict[str, object]:
    return {
        "trace_id": "trace-agent-manifest-022",
        "audit_id": "audit-agent-manifest-022",
        "runtime_capabilities": [
            "tool_call",
            "policy_check",
            "outbox",
            "basic_isolation",
        ],
        "agent_manifest": {
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
                "trace_spans": ["agent", "model", "tool", "artifact"],
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
        },
    }


def test_validate_agent_manifest_runtime_contract_returns_compatible() -> None:
    api = AgentManifestRuntimeContractAPI()

    status, body = api.validate_runtime_contract(
        _payload(),
        headers={"Idempotency-Key": "manifest-022"},
    )
    report = body["agent_manifest_runtime_contract"]

    assert status == 200
    assert response_envelope_ok(body)
    assert report["contract_schema_version"] == "agent_manifest_runtime_contract.v1"
    assert report["runtime_compatibility"] == "runtime_compatible"
    assert report["next_action"]["action_id"] == "continue_manifest_review"


def test_validate_agent_manifest_runtime_contract_returns_missing_capabilities() -> (
    None
):
    api = AgentManifestRuntimeContractAPI()
    payload = _payload()
    payload["runtime_capabilities"] = ["tool_call", "outbox"]

    status, body = api.validate_runtime_contract(
        payload,
        headers={"Idempotency-Key": "manifest-022"},
    )
    report = body["agent_manifest_runtime_contract"]

    assert status == 200
    assert report["runtime_compatibility"] == "runtime_capability_missing"
    assert set(report["missing_runtime_capabilities"]) == {
        "policy_check",
        "basic_isolation",
    }
    assert {issue["issue_id"] for issue in report["issues"]} == {
        "RUNTIME_CAPABILITY_MISSING"
    }
    assert report["next_action"]["action_id"] == "view_missing_runtime_capabilities"


def test_validate_agent_manifest_runtime_contract_reuses_idempotent_result() -> None:
    api = AgentManifestRuntimeContractAPI()

    status, body = api.validate_runtime_contract(
        _payload(),
        headers={"Idempotency-Key": "manifest-022"},
    )
    retry_status, retry_body = api.validate_runtime_contract(
        _payload(),
        headers={"idempotency-key": "manifest-022"},
    )

    assert status == 200
    assert retry_status == 200
    assert retry_body == body


def test_validate_agent_manifest_runtime_contract_rejects_conflict() -> None:
    api = AgentManifestRuntimeContractAPI()
    api.validate_runtime_contract(
        _payload(),
        headers={"Idempotency-Key": "manifest-022"},
    )
    changed = _payload()
    changed["agent_manifest"]["version"] = "0.3.0"  # type: ignore[index]

    status, body = api.validate_runtime_contract(
        changed,
        headers={"Idempotency-Key": "manifest-022"},
    )

    assert status == 409
    assert response_envelope_ok(body)
    assert body["error_code"] == "IDEMPOTENCY_KEY_CONFLICT"


def test_validate_agent_manifest_runtime_contract_requires_manifest_object() -> None:
    api = AgentManifestRuntimeContractAPI()

    status, body = api.validate_runtime_contract(
        {"agent_manifest": None, "trace_id": "trace-agent-manifest-022"},
        headers={"Idempotency-Key": "manifest-022"},
    )

    assert status == 400
    assert response_envelope_ok(body)
    assert body["error_code"] == "VALIDATION_ERROR"


def test_validate_agent_manifest_runtime_contract_rejects_non_object_body() -> None:
    api = AgentManifestRuntimeContractAPI()

    status, body = api.validate_runtime_contract(
        [],
        headers={"Idempotency-Key": "manifest-022"},
    )

    assert status == 400
    assert response_envelope_ok(body)
    assert body["error_code"] == "VALIDATION_ERROR"
