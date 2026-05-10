from agent_store.domain.installation_distribution import (
    build_installation_distribution_summary,
)


def _fact(**overrides: object) -> dict[str, object]:
    fact: dict[str, object] = {
        "installation_id": "inst-1",
        "device_id": "device-1",
        "agent_id": "agent.release-reviewer",
        "agent_version": "0.2.0",
        "status": "activation_required",
        "enterprise_state": "active",
        "device_os": "macOS",
        "user": "user@example.com",
    }
    fact.update(overrides)
    return fact


def _viewer(**overrides: object) -> dict[str, object]:
    viewer: dict[str, object] = {
        "viewer_id": "owner@example.com",
        "viewer_role": "owner",
        "can_view_installation_distribution": True,
    }
    viewer.update(overrides)
    return viewer


def _summary(
    facts: list[dict[str, object]] | None = None,
    viewer: dict[str, object] | None = None,
    *,
    requested_version: str = "0.2.0",
) -> dict[str, object]:
    return build_installation_distribution_summary(
        agent_id="agent.release-reviewer",
        requested_version=requested_version,
        installation_facts=facts if facts is not None else [_fact()],
        viewer_context=viewer if viewer is not None else _viewer(),
        trace_id="trace-036",
        audit_id="audit-036",
    ).to_response()["installation_distribution_summary"]


def test_installation_distribution_counts_status_os_version_and_enterprise_state() -> (
    None
):
    summary = _summary(
        [
            _fact(status="activation_required", device_os="macOS", user="user-1"),
            _fact(status="reporter_pending", device_os="Linux", user="user-2"),
            _fact(status="failed", device_os="Windows", user="user-3"),
            _fact(agent_version="0.3.0", status="revoked", user="user-4"),
        ]
    )

    assert summary["contract_schema_version"] == "installation_distribution_summary.v1"
    assert summary["distribution_state"] == "distribution_ready"
    assert summary["total_installations"] == 3
    assert summary["active_installations"] == 2
    assert summary["failed_installations"] == 1
    assert summary["status_counts"] == {
        "activation_required": 1,
        "failed": 1,
        "reporter_pending": 1,
    }
    assert summary["os_counts"] == {"Linux": 1, "Windows": 1, "macOS": 1}
    assert summary["version_counts"] == {"0.2.0": 3}
    assert summary["notification"]["notification_required"] is True
    assert summary["notification"]["affected_installation_count"] == 1
    assert summary["privacy"]["individual_users_exposed"] is False
    assert summary["privacy"]["device_ids_exposed"] is False


def test_installation_distribution_requires_owner_permission() -> None:
    summary = _summary(viewer=_viewer(can_view_installation_distribution=False))

    assert summary["distribution_state"] == "permission_required"
    assert summary["permission_state"] == "permission_required"
    assert summary["total_installations"] == 0
    assert summary["issues"][0]["issue_id"] == "OWNER_DISTRIBUTION_PERMISSION_REQUIRED"
    assert (
        summary["next_action"]["action_id"] == "request_owner_distribution_permission"
    )


def test_installation_distribution_reports_unavailable_without_inventory() -> None:
    summary = _summary([])

    assert summary["distribution_state"] == "distribution_unavailable"
    assert summary["issues"][0]["issue_id"] == "INSTALLATION_INVENTORY_REQUIRED"
    assert summary["next_action"]["action_id"] == "refresh_installation_inventory"


def test_installation_distribution_strips_individual_identifiers() -> None:
    summary = _summary([_fact(user="user@example.com", device_id="device-secret")])

    assert summary["privacy"]["aggregation_only"] is True
    assert summary["privacy"]["individual_users_exposed"] is False
    assert summary["privacy"]["device_ids_exposed"] is False
    assert {issue["issue_id"] for issue in summary["issues"]} == {
        "INDIVIDUAL_IDENTIFIERS_STRIPPED"
    }


def test_installation_distribution_reports_zero_affected_when_no_attention_status() -> (
    None
):
    summary = _summary(
        [
            _fact(status="activation_required", user="user-1"),
            _fact(status="reporter_pending", user="user-2"),
        ]
    )

    assert summary["notification"]["notification_required"] is False
    assert summary["notification"]["affected_installation_count"] == 0
    assert summary["notification"]["reason_code"] == "none"


def test_installation_distribution_reports_empty_version_scope() -> None:
    summary = _summary([_fact(agent_version="0.1.0")], requested_version="0.2.0")

    assert summary["distribution_state"] == "empty_distribution"
    assert summary["total_installations"] == 0
    assert {issue["issue_id"] for issue in summary["issues"]} == {
        "INDIVIDUAL_IDENTIFIERS_STRIPPED",
        "VERSION_INSTALLATION_SCOPE_EMPTY",
    }
