from agent_store.api.agent_registry import response_envelope_ok
from agent_store.api.installation_distribution import InstallationDistributionAPI


def _payload() -> dict[str, object]:
    return {
        "trace_id": "trace-installation-distribution-036",
        "audit_id": "audit-installation-distribution-036",
        "agent_id": "agent.release-reviewer",
        "requested_version": "0.2.0",
        "installation_facts": [
            {
                "installation_id": "inst-1",
                "device_id": "device-1",
                "agent_id": "agent.release-reviewer",
                "agent_version": "0.2.0",
                "status": "activation_required",
                "enterprise_state": "active",
                "device_os": "macOS",
                "user": "user@example.com",
            }
        ],
        "viewer_context": {
            "viewer_id": "owner@example.com",
            "viewer_role": "owner",
            "can_view_installation_distribution": True,
        },
    }


def test_installation_distribution_api_returns_aggregate_summary() -> None:
    status, body = InstallationDistributionAPI().summarize_distribution(
        _payload(),
        headers={"Idempotency-Key": "distribution-036"},
    )
    summary = body["installation_distribution_summary"]

    assert status == 200
    assert response_envelope_ok(body)
    assert summary["contract_schema_version"] == "installation_distribution_summary.v1"
    assert summary["distribution_state"] == "distribution_ready"
    assert summary["total_installations"] == 1
    assert summary["privacy"]["aggregation_only"] is True


def test_installation_distribution_api_reuses_idempotent_result() -> None:
    api = InstallationDistributionAPI()
    _, first = api.summarize_distribution(
        _payload(),
        headers={"Idempotency-Key": "distribution-036"},
    )
    status, second = api.summarize_distribution(
        _payload(),
        headers={"idempotency-key": "distribution-036"},
    )

    assert status == 200
    assert second == first


def test_installation_distribution_api_rejects_idempotency_conflict() -> None:
    api = InstallationDistributionAPI()
    api.summarize_distribution(
        _payload(),
        headers={"Idempotency-Key": "distribution-036"},
    )
    changed = _payload()
    changed["requested_version"] = "0.3.0"

    status, body = api.summarize_distribution(
        changed,
        headers={"Idempotency-Key": "distribution-036"},
    )

    assert status == 409
    assert response_envelope_ok(body)
    assert body["error_code"] == "IDEMPOTENCY_KEY_CONFLICT"


def test_installation_distribution_api_requires_agent_id() -> None:
    payload = _payload()
    payload["agent_id"] = ""

    status, body = InstallationDistributionAPI().summarize_distribution(
        payload,
        headers={"Idempotency-Key": "distribution-036"},
    )

    assert status == 400
    assert response_envelope_ok(body)
    assert body["details"]["reason"] == "agent_id is required"


def test_installation_distribution_api_rejects_non_object_installation_facts() -> None:
    payload = _payload()
    payload["installation_facts"] = ["not-an-object"]

    status, body = InstallationDistributionAPI().summarize_distribution(
        payload,
        headers={"Idempotency-Key": "distribution-036"},
    )

    assert status == 400
    assert response_envelope_ok(body)
    assert body["details"]["reason"] == (
        "installation_facts must be an array of objects when present"
    )
