from agent_store.api.notification_routing import NotificationRoutingAPI


def _payload(**overrides: object) -> dict[str, object]:
    payload: dict[str, object] = {
        "trace_id": "trace-039",
        "audit_id": "audit-039",
        "event_context": {
            "event_id": "event-039",
            "event_type": "security_revoked",
            "agent_id": "framework.ai-autosdlc",
            "agent_version": "1.0.0",
            "requested_channels": ["wecom", "notification_center"],
        },
        "audience_context": {
            "user_ids": ["user-1"],
            "owner_team_ids": ["team-agent-owner"],
            "security_group_ids": ["security-iam"],
            "audience_source": "trusted_iam_or_owner_directory",
        },
    }
    payload.update(overrides)
    return payload


def test_notification_routing_api_returns_store_projection() -> None:
    status, body = NotificationRoutingAPI().summarize_notification_route(
        _payload(),
        headers={"Idempotency-Key": "notification-route-1"},
    )

    assert status == 200
    assert body["schema_version"]
    assert body["trace_id"] == "trace-039"
    assert body["error_code"] == "OK"
    summary = body["notification_routing_summary"]
    assert summary["contract_schema_version"] == "notification_routing_summary.v1"
    assert summary["event_type"] == "security_revoked"
    assert summary["delivery_status"] == "not_sent"
    assert summary["channels"][0]["channel"] == "risk_list"
    assert summary["source_of_truth"]["delivery"] == (
        "notification_center_not_sent_by_store"
    )


def test_notification_routing_api_requires_idempotency_key() -> None:
    status, body = NotificationRoutingAPI().summarize_notification_route(
        _payload(),
        headers={},
    )

    assert status == 400
    assert body["error_code"] == "VALIDATION_ERROR"
    assert body["recommended_action_id"] == "retry_with_idempotency_key"


def test_notification_routing_api_replays_same_idempotency_key() -> None:
    api = NotificationRoutingAPI()
    first_status, first_body = api.summarize_notification_route(
        _payload(trace_id="trace-a"),
        headers={"Idempotency-Key": "notification-route-2"},
    )
    second_status, second_body = api.summarize_notification_route(
        _payload(trace_id="trace-b"),
        headers={"Idempotency-Key": "notification-route-2"},
    )

    assert first_status == 200
    assert second_status == 200
    assert second_body == first_body


def test_notification_routing_api_rejects_idempotency_conflict() -> None:
    api = NotificationRoutingAPI()
    api.summarize_notification_route(
        _payload(),
        headers={"Idempotency-Key": "notification-route-3"},
    )

    status, body = api.summarize_notification_route(
        _payload(
            event_context={
                "event_id": "event-040",
                "event_type": "approval_required",
                "agent_id": "framework.ai-autosdlc",
            }
        ),
        headers={"Idempotency-Key": "notification-route-3"},
    )

    assert status == 409
    assert body["error_code"] == "IDEMPOTENCY_KEY_CONFLICT"


def test_notification_routing_api_validates_nested_objects() -> None:
    status, body = NotificationRoutingAPI().summarize_notification_route(
        _payload(audience_context="team-agent-owner"),
        headers={"Idempotency-Key": "notification-route-4"},
    )

    assert status == 400
    assert body["error_code"] == "VALIDATION_ERROR"
    assert body["recommended_action_id"] == "attach_audience_context"


def test_notification_routing_api_preserves_missing_audit_blocker() -> None:
    payload = _payload()
    payload.pop("audit_id")

    status, body = NotificationRoutingAPI().summarize_notification_route(
        payload,
        headers={"Idempotency-Key": "notification-route-5"},
    )

    assert status == 200
    assert body["audit_id"] == ""
    summary = body["notification_routing_summary"]
    assert summary["routing_state"] == "routing_blocked"
    assert {issue["issue_id"] for issue in summary["issues"]} == {
        "AUDIT_ID_REQUIRED",
        "RISK_LIST_CHANNEL_FORCED",
    }
