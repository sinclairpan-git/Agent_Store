from agent_store.domain.notification_routing import (
    build_notification_routing_summary,
)


def _event(event_type: str, **overrides: object) -> dict[str, object]:
    data: dict[str, object] = {
        "event_id": "event-039",
        "event_type": event_type,
        "agent_id": "framework.ai-autosdlc",
        "agent_version": "1.0.0",
    }
    data.update(overrides)
    return data


def _audience(**overrides: object) -> dict[str, object]:
    data: dict[str, object] = {
        "user_ids": ["user-1"],
        "owner_team_ids": ["team-agent-owner"],
        "security_group_ids": [],
        "audience_source": "trusted_iam_or_owner_directory",
    }
    data.update(overrides)
    return data


def _summary(
    event_type: str,
    *,
    event_overrides: dict[str, object] | None = None,
    audience_overrides: dict[str, object] | None = None,
    audit_id: str = "audit-039",
) -> dict[str, object]:
    return build_notification_routing_summary(
        event_context=_event(event_type, **(event_overrides or {})),
        audience_context=_audience(**(audience_overrides or {})),
        trace_id="trace-039",
        audit_id=audit_id,
    ).to_dict()


def test_notification_routing_prepares_installation_failed_route() -> None:
    summary = _summary("installation_failed")

    assert summary["routing_state"] == "routing_ready"
    assert summary["delivery_status"] == "not_sent"
    assert [channel["channel"] for channel in summary["channels"]] == [
        "notification_center",
        "owner_dashboard",
    ]
    assert summary["routing_rule"]["rule_id"] == "notify_user_and_owner"
    assert summary["next_action"]["action_id"] == "enqueue_notification_route"


def test_notification_routing_approval_required_targets_task_center_and_wecom() -> None:
    summary = _summary("approval_required")

    assert [channel["channel"] for channel in summary["channels"]] == [
        "task_center",
        "wecom",
        "notification_center",
    ]
    assert summary["routing_rule"]["delivery_confirmation_required"] is True
    assert summary["channels"][0]["target_system"] == "agentops"


def test_notification_routing_feedback_owner_replied_notifies_submitter() -> None:
    summary = _summary("feedback_owner_replied")

    assert summary["routing_rule"]["sla"] == "best_effort"
    assert summary["channels"][0]["channel"] == "notification_center"


def test_notification_routing_lifecycle_replacement_goes_to_owner_dashboard() -> None:
    summary = _summary("lifecycle_replacement_available")

    assert summary["routing_rule"]["rule_id"] == "notify_affected_installations"
    assert "owner_dashboard" in {channel["channel"] for channel in summary["channels"]}


def test_notification_routing_security_revoked_forces_risk_list() -> None:
    summary = _summary(
        "security_revoked",
        event_overrides={"requested_channels": ["wecom", "notification_center"]},
    )

    assert summary["routing_state"] == "routing_degraded"
    assert summary["channels"][0]["channel"] == "risk_list"
    assert summary["channels"][0]["target_system"] == "risk_center"
    assert summary["issues"][0]["issue_id"] == "RISK_LIST_CHANNEL_FORCED"


def test_notification_routing_blocks_missing_trusted_audience() -> None:
    summary = _summary(
        "approval_required",
        audience_overrides={
            "user_ids": [],
            "owner_team_ids": [],
            "security_group_ids": [],
        },
    )

    assert summary["routing_state"] == "routing_blocked"
    assert summary["audience"]["trusted_audience"] is False
    assert summary["channels"][0]["enabled"] is False
    assert summary["next_action"]["action_id"] == "fix_notification_routing_context"
    assert {issue["issue_id"] for issue in summary["issues"]} == {
        "TRUSTED_AUDIENCE_REQUIRED"
    }


def test_notification_routing_unsupported_event_uses_contract_safe_event_type() -> None:
    summary = _summary("unknown_event")

    assert summary["event_type"] == "installation_failed"
    assert summary["routing_state"] == "routing_blocked"
    assert summary["issues"][0]["issue_id"] == "NOTIFICATION_EVENT_UNSUPPORTED"


def test_notification_routing_deduplicates_and_ignores_unsupported_channels() -> None:
    summary = _summary(
        "installation_failed",
        event_overrides={
            "requested_channels": [
                "wecom",
                "wecom",
                "unsupported",
                "notification_center",
            ]
        },
    )

    assert summary["routing_state"] == "routing_degraded"
    assert [channel["channel"] for channel in summary["channels"]] == [
        "wecom",
        "notification_center",
    ]
    assert summary["issues"][0]["issue_id"] == "NOTIFICATION_CHANNEL_UNSUPPORTED"


def test_notification_routing_blocks_explicit_empty_requested_channels() -> None:
    summary = _summary(
        "installation_failed",
        event_overrides={"requested_channels": []},
    )

    assert summary["routing_state"] == "routing_blocked"
    assert summary["channels"] == []
    assert {issue["issue_id"] for issue in summary["issues"]} == {
        "NOTIFICATION_CHANNEL_REQUIRED"
    }


def test_notification_routing_blocks_invalid_requested_channel_items() -> None:
    summary = _summary(
        "installation_failed",
        event_overrides={"requested_channels": [123]},
    )

    assert summary["routing_state"] == "routing_blocked"
    assert summary["channels"] == []
    assert {issue["issue_id"] for issue in summary["issues"]} == {
        "NOTIFICATION_CHANNEL_REQUIRED",
        "NOTIFICATION_CHANNEL_UNSUPPORTED",
    }


def test_notification_routing_blocks_missing_event_identity() -> None:
    summary = _summary(
        "installation_failed",
        event_overrides={"event_id": "", "agent_id": ""},
    )

    assert summary["routing_state"] == "routing_blocked"
    assert {issue["issue_id"] for issue in summary["issues"]} == {
        "NOTIFICATION_EVENT_ID_REQUIRED",
        "AGENT_ID_REQUIRED",
    }
