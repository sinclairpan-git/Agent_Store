from agent_store.api.agent_registry import response_envelope_ok
from agent_store.api.health_summary import HealthSummaryFreshnessAPI


def _payload() -> dict[str, object]:
    return {
        "trace_id": "trace-health-summary-024",
        "audit_id": "audit-health-summary-024",
        "health_summary": {
            "agent_id": "agent.release-reviewer",
            "agent_version": "0.2.0",
            "health_summary_id": "health-agent-release-reviewer-1",
            "health_state": "healthy",
            "calculated_at": "2026-05-09T09:45:00Z",
            "valid_until": "2099-05-09T10:15:00Z",
            "observed_window_start": "2026-05-09T09:00:00Z",
            "observed_window_end": "2026-05-09T09:45:00Z",
            "signal_count": 8,
            "evidence_summary_id": "evidence-agent-release-reviewer-1",
            "trace_id": "trace-agentops-health",
        },
    }


def test_health_summary_freshness_api_returns_fresh_summary() -> None:
    api = HealthSummaryFreshnessAPI()

    status, body = api.summarize_health_freshness(
        _payload(),
        headers={"Idempotency-Key": "health-024"},
    )
    summary = body["health_summary_freshness"]

    assert status == 200
    assert response_envelope_ok(body)
    assert summary["contract_schema_version"] == "health_summary_freshness.v1"
    assert summary["freshness_state"] == "health_fresh"
    assert summary["recommendation_basis_allowed"] is False
    assert summary["next_action"]["action_id"] == "continue_health_review"


def test_health_summary_freshness_api_returns_unavailable_without_echo() -> None:
    api = HealthSummaryFreshnessAPI()

    status, body = api.summarize_health_freshness(
        {"trace_id": "trace-health-summary-024"},
        headers={"Idempotency-Key": "health-024"},
    )
    summary = body["health_summary_freshness"]

    assert status == 200
    assert response_envelope_ok(body)
    assert summary["freshness_state"] == "health_unavailable"
    assert summary["health_facts"]["health_summary_present"] is False
    assert {issue["issue_id"] for issue in summary["issues"]} == {
        "HEALTH_SUMMARY_UNAVAILABLE"
    }


def test_health_summary_freshness_api_reuses_idempotent_result() -> None:
    api = HealthSummaryFreshnessAPI()

    status, body = api.summarize_health_freshness(
        _payload(),
        headers={"Idempotency-Key": "health-024"},
    )
    retry_status, retry_body = api.summarize_health_freshness(
        _payload(),
        headers={"idempotency-key": "health-024"},
    )

    assert status == 200
    assert retry_status == 200
    assert retry_body == body


def test_health_summary_freshness_api_rejects_idempotency_conflict() -> None:
    api = HealthSummaryFreshnessAPI()
    api.summarize_health_freshness(
        _payload(),
        headers={"Idempotency-Key": "health-024"},
    )
    changed = _payload()
    health_summary = changed["health_summary"]
    assert isinstance(health_summary, dict)
    health_summary["health_state"] = "degraded"

    status, body = api.summarize_health_freshness(
        changed,
        headers={"Idempotency-Key": "health-024"},
    )

    assert status == 409
    assert response_envelope_ok(body)
    assert body["error_code"] == "IDEMPOTENCY_KEY_CONFLICT"


def test_health_summary_freshness_api_requires_idempotency_key() -> None:
    api = HealthSummaryFreshnessAPI()

    status, body = api.summarize_health_freshness(_payload(), headers={})

    assert status == 400
    assert response_envelope_ok(body)
    assert body["error_code"] == "VALIDATION_ERROR"


def test_health_summary_freshness_api_rejects_non_object_health_summary() -> None:
    api = HealthSummaryFreshnessAPI()
    payload = _payload()
    payload["health_summary"] = []

    status, body = api.summarize_health_freshness(
        payload,
        headers={"Idempotency-Key": "health-024"},
    )

    assert status == 400
    assert response_envelope_ok(body)
    assert body["error_code"] == "VALIDATION_ERROR"
