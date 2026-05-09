from agent_store.api.agent_registry import response_envelope_ok
from agent_store.api.runtime_availability import RuntimeAvailabilitySummaryAPI


def _payload() -> dict[str, object]:
    return {
        "trace_id": "trace-runtime-availability-023",
        "audit_id": "audit-runtime-availability-023",
        "runtime_echo": {
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
        },
        "agent_manifest": {
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
        },
    }


def test_runtime_availability_api_returns_ready_summary() -> None:
    api = RuntimeAvailabilitySummaryAPI()

    status, body = api.summarize_runtime_availability(
        _payload(),
        headers={"Idempotency-Key": "runtime-023"},
    )
    summary = body["runtime_availability_summary"]

    assert status == 200
    assert response_envelope_ok(body)
    assert summary["contract_schema_version"] == "runtime_availability_summary.v1"
    assert summary["availability_state"] == "runtime_ready"
    assert summary["next_action"]["action_id"] == "continue_listing_review"


def test_runtime_availability_api_returns_missing_runtime_without_echo() -> None:
    api = RuntimeAvailabilitySummaryAPI()
    payload = _payload()
    payload.pop("runtime_echo")

    status, body = api.summarize_runtime_availability(
        payload,
        headers={"Idempotency-Key": "runtime-023"},
    )
    summary = body["runtime_availability_summary"]

    assert status == 200
    assert summary["availability_state"] == "runtime_missing"
    assert summary["runtime_facts"]["runtime_present"] is False
    assert {issue["issue_id"] for issue in summary["issues"]} == {"RUNTIME_MISSING"}


def test_runtime_availability_api_reuses_idempotent_result() -> None:
    api = RuntimeAvailabilitySummaryAPI()

    status, body = api.summarize_runtime_availability(
        _payload(),
        headers={"Idempotency-Key": "runtime-023"},
    )
    retry_status, retry_body = api.summarize_runtime_availability(
        _payload(),
        headers={"idempotency-key": "runtime-023"},
    )

    assert status == 200
    assert retry_status == 200
    assert retry_body == body


def test_runtime_availability_api_rejects_idempotency_conflict() -> None:
    api = RuntimeAvailabilitySummaryAPI()
    api.summarize_runtime_availability(
        _payload(),
        headers={"Idempotency-Key": "runtime-023"},
    )
    changed = _payload()
    changed["agent_manifest"]["version"] = "0.3.0"  # type: ignore[index]

    status, body = api.summarize_runtime_availability(
        changed,
        headers={"Idempotency-Key": "runtime-023"},
    )

    assert status == 409
    assert response_envelope_ok(body)
    assert body["error_code"] == "IDEMPOTENCY_KEY_CONFLICT"


def test_runtime_availability_api_requires_manifest_object() -> None:
    api = RuntimeAvailabilitySummaryAPI()

    status, body = api.summarize_runtime_availability(
        {"agent_manifest": None, "trace_id": "trace-runtime-availability-023"},
        headers={"Idempotency-Key": "runtime-023"},
    )

    assert status == 400
    assert response_envelope_ok(body)
    assert body["error_code"] == "VALIDATION_ERROR"


def test_runtime_availability_api_rejects_non_object_runtime_echo() -> None:
    api = RuntimeAvailabilitySummaryAPI()
    payload = _payload()
    payload["runtime_echo"] = []

    status, body = api.summarize_runtime_availability(
        payload,
        headers={"Idempotency-Key": "runtime-023"},
    )

    assert status == 400
    assert response_envelope_ok(body)
    assert body["error_code"] == "VALIDATION_ERROR"
