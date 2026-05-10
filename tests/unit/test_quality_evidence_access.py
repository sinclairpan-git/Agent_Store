from datetime import timedelta

from agent_store.domain.models import utc_now
from agent_store.domain.quality_evidence_access import (
    build_quality_evidence_access_summary,
)


def _agentops_summary(**overrides: object) -> dict[str, object]:
    now = utc_now()
    summary: dict[str, object] = {
        "agent_id": "agent.release-reviewer",
        "agent_version": "0.2.0",
        "quality_evidence": {
            "evidence_level": "L5-capable",
            "confidence": 0.91,
            "identity_confidence": 0.97,
            "missing_evidence": [],
            "score_template_id": "agentops-owned",
            "calculated_at": now.isoformat(),
            "valid_until": (now + timedelta(hours=1)).isoformat(),
            "summary_validity_state": "fresh",
        },
        "run_evidence": {
            "run_id": "run-037",
            "session_id": "session-037",
            "evidence_summary_id": "evidence-037",
            "source_event_ids": ["event-1", "event-2"],
        },
    }
    summary.update(overrides)
    return summary


def _viewer(**overrides: object) -> dict[str, object]:
    viewer: dict[str, object] = {
        "viewer_id": "owner@example.com",
        "can_view_quality_summary": True,
        "can_view_raw_evidence": True,
    }
    viewer.update(overrides)
    return viewer


def _summary(
    agentops_summary: dict[str, object] | None = None,
    viewer: dict[str, object] | None = None,
) -> dict[str, object]:
    return build_quality_evidence_access_summary(
        agentops_summary=agentops_summary
        if agentops_summary is not None
        else _agentops_summary(),
        viewer_context=viewer if viewer is not None else _viewer(),
        trace_id="trace-037",
        audit_id="audit-037",
    ).to_response()["quality_evidence_access_summary"]


def test_quality_evidence_access_projects_agentops_summary_without_raw_evidence() -> (
    None
):
    summary = _summary()

    assert summary["contract_schema_version"] == "quality_evidence_access_summary.v1"
    assert summary["summary_state"] == "summary_ready"
    assert summary["display"]["evidence_level"] == "L5-capable"
    assert summary["display"]["confidence"] == 0.91
    assert summary["run_binding"]["source_event_count"] == 2
    assert summary["raw_trace_exposed"] is False
    assert summary["raw_evidence_exposed"] is False
    assert summary["access"]["raw_trace_url"] == ""
    assert summary["next_action"]["action_id"] == "continue_quality_evidence_review"


def test_quality_evidence_access_redacts_unauthorized_summary() -> None:
    summary = _summary(
        viewer=_viewer(
            can_view_quality_summary=False,
            can_view_raw_evidence=False,
            request_access_url="/evidence-vault/requests/new",
        )
    )

    assert summary["summary_state"] == "summary_redacted"
    assert summary["permission_state"] == "summary_redacted"
    assert summary["display"]["evidence_level"] == "redacted"
    assert summary["display"]["confidence"] is None
    assert summary["access"]["evidence_vault_request_required"] is True
    assert summary["access"]["request_access_url"] == "/evidence-vault/requests/new"
    assert summary["next_action"]["target_system"] == "evidence_vault"
    assert {issue["issue_id"] for issue in summary["issues"]} == {
        "QUALITY_SUMMARY_REDACTED"
    }


def test_quality_evidence_access_redacts_when_viewer_permission_is_absent() -> None:
    summary = build_quality_evidence_access_summary(
        agentops_summary=_agentops_summary(),
        viewer_context={},
        trace_id="trace-037",
        audit_id="audit-037",
    ).to_response()["quality_evidence_access_summary"]

    assert summary["summary_state"] == "summary_redacted"
    assert summary["display"]["confidence"] is None
    assert summary["access"]["evidence_vault_request_required"] is True
    assert summary["next_action"]["action_id"] == "request_evidence_access"


def test_quality_evidence_access_marks_expired_summary_pending_refresh() -> None:
    now = utc_now()
    agentops_summary = _agentops_summary(
        quality_evidence={
            "evidence_level": "L4",
            "confidence": 0.7,
            "missing_evidence": [],
            "score_template_id": "agentops-owned",
            "calculated_at": (now - timedelta(hours=2)).isoformat(),
            "valid_until": (now - timedelta(minutes=1)).isoformat(),
            "summary_validity_state": "fresh",
        }
    )

    summary = _summary(agentops_summary)

    assert summary["summary_state"] == "summary_expired"
    assert summary["display"]["summary_validity_state"] == "expired"
    assert summary["display"]["display_label"] == "待刷新"
    assert summary["recommendation_basis_allowed"] is False
    assert summary["next_action"]["action_id"] == "refresh_agentops_quality_summary"


def test_quality_evidence_access_uses_one_captured_now_for_expiry() -> None:
    now = utc_now()
    agentops_summary = _agentops_summary(
        quality_evidence={
            "evidence_level": "L4",
            "confidence": 0.7,
            "missing_evidence": [],
            "score_template_id": "agentops-owned",
            "calculated_at": (now - timedelta(hours=1)).isoformat(),
            "valid_until": now.isoformat(),
            "summary_validity_state": "fresh",
        }
    )

    summary = build_quality_evidence_access_summary(
        agentops_summary=agentops_summary,
        viewer_context=_viewer(),
        trace_id="trace-037",
        audit_id="audit-037",
        now=now,
    ).to_response()["quality_evidence_access_summary"]

    assert summary["summary_state"] == "summary_expired"
    assert summary["display"]["summary_validity_state"] == "expired"
    assert {issue["issue_id"] for issue in summary["issues"]} == {
        "QUALITY_SUMMARY_EXPIRED"
    }


def test_quality_evidence_access_handles_naive_valid_until_without_crashing() -> None:
    now = utc_now()
    naive_valid_until = (now + timedelta(hours=1)).replace(tzinfo=None).isoformat()
    agentops_summary = _agentops_summary(
        quality_evidence={
            **_agentops_summary()["quality_evidence"],
            "valid_until": naive_valid_until,
        }
    )

    summary = _summary(agentops_summary)

    assert summary["summary_state"] == "summary_ready"
    assert summary["display"]["summary_validity_state"] == "fresh"


def test_quality_evidence_access_degrades_unknown_score_template() -> None:
    agentops_summary = _agentops_summary(
        quality_evidence={
            **_agentops_summary()["quality_evidence"],
            "score_template_id": "agentops-legacy",
        }
    )

    summary = _summary(agentops_summary)

    assert summary["summary_state"] == "template_deprecated"
    assert summary["recommendation_basis_allowed"] is False
    assert {issue["issue_id"] for issue in summary["issues"]} == {
        "SCORE_TEMPLATE_DEPRECATED"
    }
    assert summary["next_action"]["action_id"] == "request_score_template_refresh"


def test_quality_evidence_access_normalizes_accepted_template_ids() -> None:
    summary = build_quality_evidence_access_summary(
        agentops_summary=_agentops_summary(),
        viewer_context=_viewer(),
        trace_id="trace-037",
        audit_id="audit-037",
        accepted_score_template_ids=(" agentops-owned ",),
    ).to_response()["quality_evidence_access_summary"]

    assert summary["summary_state"] == "summary_ready"
    assert summary["issues"] == []


def test_quality_evidence_access_ignores_boolean_source_event_count() -> None:
    agentops_summary = _agentops_summary(
        run_evidence={
            "run_id": "run-037",
            "session_id": "session-037",
            "evidence_summary_id": "evidence-037",
            "source_event_count": True,
            "source_event_ids": ["event-1", "event-2"],
        }
    )

    summary = _summary(agentops_summary)

    assert summary["run_binding"]["source_event_count"] == 2


def test_quality_evidence_access_strips_raw_trace_and_evidence_urls() -> None:
    summary = _summary(
        _agentops_summary(
            raw_trace_url="https://agentops.example/raw-trace/run-037",
            raw_evidence_url="https://agentops.example/evidence/raw-037",
        )
    )

    assert summary["summary_state"] == "summary_ready"
    assert summary["access"]["raw_trace_url"] == ""
    assert summary["access"]["raw_evidence_url"] == ""
    assert summary["raw_trace_exposed"] is False
    assert summary["raw_evidence_exposed"] is False
    assert {issue["issue_id"] for issue in summary["issues"]} == {
        "RAW_EVIDENCE_LINK_STRIPPED"
    }


def test_quality_evidence_access_handles_missing_agentops_summary() -> None:
    summary = _summary(agentops_summary={})

    assert summary["summary_state"] == "summary_unavailable"
    assert summary["display"]["evidence_level"] == "unavailable"
    assert summary["display"]["missing_evidence"] == ["agentops_quality_summary"]
    assert summary["next_action"]["action_id"] == "refresh_agentops_quality_summary"


def test_quality_evidence_access_prioritizes_redaction_when_summary_missing() -> None:
    summary = build_quality_evidence_access_summary(
        agentops_summary={},
        viewer_context={},
        trace_id="trace-037",
        audit_id="audit-037",
    ).to_response()["quality_evidence_access_summary"]

    assert summary["summary_state"] == "summary_redacted"
    assert summary["permission_state"] == "summary_redacted"
    assert summary["display"]["redacted"] is True
    assert summary["next_action"]["action_id"] == "request_evidence_access"
