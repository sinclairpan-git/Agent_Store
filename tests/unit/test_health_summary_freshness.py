from datetime import UTC, datetime

from agent_store.domain.health_summary import build_health_summary_freshness


NOW = datetime(2026, 5, 9, 10, 0, tzinfo=UTC)


def _health_summary(**overrides: object) -> dict[str, object]:
    summary: dict[str, object] = {
        "agent_id": "agent.release-reviewer",
        "agent_version": "0.2.0",
        "health_summary_id": "health-agent-release-reviewer-1",
        "health_state": "healthy",
        "calculated_at": "2026-05-09T09:45:00Z",
        "valid_until": "2026-05-09T10:15:00Z",
        "observed_window_start": "2026-05-09T09:00:00Z",
        "observed_window_end": "2026-05-09T09:45:00Z",
        "signal_count": 8,
        "evidence_summary_id": "evidence-agent-release-reviewer-1",
        "trace_id": "trace-agentops-health",
    }
    summary.update(overrides)
    return summary


def test_health_summary_freshness_accepts_fresh_healthy_summary() -> None:
    freshness = build_health_summary_freshness(
        _health_summary(),
        trace_id="trace-024",
        audit_id="audit-024",
        now=NOW,
    )
    body = freshness.to_response()["health_summary_freshness"]

    assert freshness.freshness_state == "health_fresh"
    assert freshness.display_name_zh == "健康摘要新鲜"
    assert freshness.issues == ()
    assert freshness.recommendation_basis_allowed is False
    assert body["recommendation_basis_allowed"] is False
    assert body["next_action"]["action_id"] == "continue_health_review"
    assert body["source_of_truth"]["health_summary"] == "agentops"
    assert (
        body["source_of_truth"]["recommendation"]
        == "recommendation_state_excludes_health_summary"
    )


def test_health_summary_freshness_expires_at_valid_until_boundary() -> None:
    freshness = build_health_summary_freshness(
        _health_summary(valid_until="2026-05-09T10:00:00Z"),
        trace_id="trace-024",
        audit_id="audit-024",
        now=NOW,
    )
    issue = freshness.issues[0].to_dict()

    assert freshness.freshness_state == "health_refresh_required"
    assert freshness.display_name_zh == "待刷新"
    assert freshness.recommendation_basis_allowed is False
    assert issue["issue_id"] == "HEALTH_SUMMARY_EXPIRED"
    assert issue["field_path"] == "agentops_health_summary.valid_until"
    assert freshness.next_action.action_id == "refresh_agentops_health_summary"
    assert freshness.next_action.target_system == "agentops"


def test_health_summary_freshness_requires_valid_until() -> None:
    summary = _health_summary()
    summary.pop("valid_until")

    freshness = build_health_summary_freshness(
        summary,
        trace_id="trace-024",
        audit_id="audit-024",
        now=NOW,
    )

    assert freshness.freshness_state == "health_invalid"
    assert freshness.display_name_zh == "摘要无效"
    assert freshness.issues[0].issue_id == "HEALTH_SUMMARY_INVALID"
    assert freshness.next_action.action_id == "refresh_agentops_health_summary"


def test_health_summary_freshness_rejects_malformed_timestamp() -> None:
    freshness = build_health_summary_freshness(
        _health_summary(calculated_at="not-a-date"),
        trace_id="trace-024",
        audit_id="audit-024",
        now=NOW,
    )

    assert freshness.freshness_state == "health_invalid"
    assert "calculated_at" in freshness.issues[0].reason


def test_health_summary_freshness_reports_agentops_attention_state() -> None:
    freshness = build_health_summary_freshness(
        _health_summary(health_state="degraded"),
        trace_id="trace-024",
        audit_id="audit-024",
        now=NOW,
    )

    assert freshness.freshness_state == "health_attention_required"
    assert freshness.display_name_zh == "健康需关注"
    assert freshness.health_state == "degraded"
    assert freshness.issues[0].issue_id == "AGENTOPS_HEALTH_ATTENTION"
    assert freshness.next_action.action_id == "view_agentops_health_detail"


def test_health_summary_freshness_reports_unavailable_without_echo() -> None:
    freshness = build_health_summary_freshness(
        trace_id="trace-024",
        audit_id="audit-024",
        now=NOW,
    )

    assert freshness.freshness_state == "health_unavailable"
    assert freshness.display_name_zh == "摘要不可用"
    assert freshness.health_facts["health_summary_present"] is False
    assert freshness.issues[0].issue_id == "HEALTH_SUMMARY_UNAVAILABLE"
    assert freshness.next_action.action_id == "request_agentops_health_summary"
