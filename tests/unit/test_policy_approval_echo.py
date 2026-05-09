from datetime import UTC, datetime, timedelta

from agent_store.domain.policy_approval import build_policy_approval_echo


NOW = datetime(2026, 5, 9, 12, 0, tzinfo=UTC)


def _agentops_echo(
    *,
    decision: str = "allow",
    approval_status: str = "approved",
    approval_expires_at: str = "2026-05-09T13:00:00+00:00",
) -> dict[str, object]:
    return {
        "policy_decision": {
            "policy_decision_id": "policy-decision-028",
            "decision": decision,
            "policy_ref": "policy://agentops/runtime/default",
            "reason_code": "tenant_policy_passed",
            "evaluated_at": "2026-05-09T12:00:00+00:00",
            "valid_until": "2026-05-09T13:00:00+00:00",
            "trace_id": "trace-agentops-028",
            "audit_id": "audit-agentops-028",
        },
        "approval": {
            "approval_id": "approval-028",
            "status": approval_status,
            "decision": approval_status,
            "expires_at": approval_expires_at,
            "request_access_url": "/agentops/approvals/approval-028",
            "audit_id": "audit-agentops-approval-028",
        },
        "store_override_allowed": True,
        "capability_grant_issued": True,
    }


def _projection(
    agentops_echo: dict[str, object] | None = None,
) -> dict[str, object]:
    return build_policy_approval_echo(
        agent_id="agent.guided-uploader",
        agent_version="0.1.0",
        agentops_policy_echo=agentops_echo or _agentops_echo(),
        trace_id="trace-028",
        audit_id="audit-028",
        now=NOW,
    ).to_response()["policy_approval_echo"]


def test_policy_approval_echo_allows_store_flow_only_from_agentops_allow() -> None:
    echo = _projection()

    assert echo["contract_schema_version"] == "policy_approval_echo.v1"
    assert echo["echo_state"] == "policy_allowed"
    assert echo["policy_decision"]["decision"] == "allow"
    assert echo["approval_summary"]["status"] == "approved"
    assert echo["store_projection"]["store_may_continue"] is True
    assert echo["store_projection"]["store_override_allowed"] is False
    assert echo["store_projection"]["capability_grant_issued"] is False
    assert echo["source_of_truth"]["policy_decision"] == "agentops"
    assert echo["next_action"]["action_id"] == "continue_store_flow"


def test_policy_approval_echo_keeps_approval_required_pending_in_agentops() -> None:
    echo = _projection(
        _agentops_echo(decision="approval_required", approval_status="pending")
    )

    assert echo["echo_state"] == "approval_pending"
    assert echo["store_projection"]["store_may_continue"] is False
    assert echo["store_projection"]["store_block_reason"] == "approval_pending"
    assert echo["next_action"]["target_system"] == "agentops"
    assert echo["next_action"]["action_id"] == "view_agentops_approval"


def test_policy_approval_echo_denied_policy_does_not_become_store_decision() -> None:
    echo = _projection(_agentops_echo(decision="deny", approval_status="rejected"))

    assert echo["echo_state"] == "policy_denied"
    assert echo["store_projection"]["agentops_decision"] == "deny"
    assert echo["store_projection"]["store_decision_authority"] == "none"
    assert echo["next_action"]["action_id"] == "view_blocking_policy"


def test_policy_approval_echo_marks_expired_approval_as_refresh_required() -> None:
    echo = _projection(
        _agentops_echo(
            approval_status="approved",
            approval_expires_at=(NOW - timedelta(minutes=1)).isoformat(),
        )
    )

    assert echo["echo_state"] == "approval_expired"
    assert echo["approval_summary"]["status"] == "expired"
    assert echo["issues"][0]["issue_id"] == "AGENTOPS_APPROVAL_EXPIRED"
    assert echo["next_action"]["action_id"] == "request_approval_refresh"


def test_policy_approval_echo_blocks_unknown_agentops_decision() -> None:
    echo = _projection(_agentops_echo(decision="locally_allowed"))

    assert echo["echo_state"] == "agentops_echo_unavailable"
    assert echo["store_projection"]["store_may_continue"] is False
    assert echo["issues"][0]["issue_id"] == "AGENTOPS_POLICY_DECISION_UNSUPPORTED"
