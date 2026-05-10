from agent_store.domain.store_ops_deep_link import build_store_ops_deep_link


def _summary(**overrides: object) -> dict[str, object]:
    summary: dict[str, object] = {
        "agent_id": "agent.release-reviewer",
        "agent_version": "0.2.0",
        "health_summary_id": "health-agent-release-reviewer-1",
        "run_id": "run-024",
        "session_id": "session-024",
        "evidence_summary_id": "evidence-024",
        "agentops_run_detail_url": "/agentops/runs/run-024",
    }
    summary.update(overrides)
    return summary


def _viewer(**overrides: object) -> dict[str, object]:
    viewer: dict[str, object] = {
        "viewer_id": "owner@example.com",
        "can_view_agentops_run_detail": True,
        "return_path": "/agent-store/agents/agent.release-reviewer",
    }
    viewer.update(overrides)
    return viewer


def _link(
    summary: dict[str, object] | None = None,
    viewer: dict[str, object] | None = None,
) -> dict[str, object]:
    return build_store_ops_deep_link(
        health_summary=summary if summary is not None else _summary(),
        viewer_context=viewer if viewer is not None else _viewer(),
        trace_id="trace-035",
        audit_id="audit-035",
    ).to_response()["store_ops_deep_link"]


def test_store_ops_deep_link_allows_sanitized_agentops_run_detail() -> None:
    link = _link()

    assert link["contract_schema_version"] == "store_ops_deep_link.v1"
    assert link["link_state"] == "deep_link_ready"
    assert link["permission_state"] == "allowed"
    assert link["target"]["system"] == "agentops"
    assert link["target"]["params"]["run_id"] == "run-024"
    assert link["target"]["raw_trace_url"] == ""
    assert link["raw_trace_exposed"] is False
    assert link["raw_evidence_exposed"] is False
    assert link["next_action"]["action_id"] == "open_agentops_run_detail"


def test_store_ops_deep_link_requires_run_and_session_binding() -> None:
    link = _link(_summary(run_id="", session_id=""))

    assert link["link_state"] == "link_unavailable"
    assert link["target"]["href"] == ""
    assert {issue["issue_id"] for issue in link["issues"]} == {
        "RUN_ID_REQUIRED",
        "SESSION_ID_REQUIRED",
    }
    assert (
        link["next_action"]["action_id"] == "request_agentops_summary_with_run_binding"
    )


def test_store_ops_deep_link_routes_unauthorized_viewer_to_evidence_vault() -> None:
    link = _link(viewer=_viewer(can_view_agentops_run_detail=False))

    assert link["link_state"] == "permission_required"
    assert link["permission_state"] == "evidence_vault_required"
    assert link["target"]["href"] == ""
    assert link["next_action"]["target_system"] == "evidence_vault"
    assert link["next_action"]["action_id"] == "request_evidence_access"


def test_store_ops_deep_link_strips_raw_trace_and_evidence_urls() -> None:
    link = _link(
        _summary(
            raw_trace_url="https://agentops.example/raw-trace/run-024",
            raw_evidence_url="https://agentops.example/evidence/raw-024",
        )
    )

    assert link["link_state"] == "link_sanitized"
    assert link["target"]["raw_trace_url"] == ""
    assert link["target"]["raw_evidence_url"] == ""
    assert link["raw_trace_exposed"] is False
    assert link["raw_evidence_exposed"] is False
    assert {issue["issue_id"] for issue in link["issues"]} == {
        "RAW_TRACE_LINK_STRIPPED"
    }
