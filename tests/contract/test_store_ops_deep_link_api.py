from agent_store.api.agent_registry import response_envelope_ok
from agent_store.api.store_ops_deep_link import StoreOpsDeepLinkAPI


def _payload() -> dict[str, object]:
    return {
        "trace_id": "trace-store-ops-deep-link-035",
        "audit_id": "audit-store-ops-deep-link-035",
        "health_summary": {
            "agent_id": "agent.release-reviewer",
            "agent_version": "0.2.0",
            "health_summary_id": "health-agent-release-reviewer-1",
            "run_id": "run-024",
            "session_id": "session-024",
            "evidence_summary_id": "evidence-024",
            "agentops_run_detail_url": "/agentops/runs/run-024",
        },
        "viewer_context": {
            "viewer_id": "owner@example.com",
            "can_view_agentops_run_detail": True,
            "return_path": "/agent-store/agents/agent.release-reviewer",
        },
    }


def test_store_ops_deep_link_api_returns_sanitized_deep_link() -> None:
    status, body = StoreOpsDeepLinkAPI().build_deep_link(
        _payload(),
        headers={"Idempotency-Key": "deep-link-035"},
    )
    link = body["store_ops_deep_link"]

    assert status == 200
    assert response_envelope_ok(body)
    assert link["contract_schema_version"] == "store_ops_deep_link.v1"
    assert link["link_state"] == "deep_link_ready"
    assert link["raw_trace_exposed"] is False
    assert link["next_action"]["target_system"] == "agentops"


def test_store_ops_deep_link_api_reuses_idempotent_result() -> None:
    api = StoreOpsDeepLinkAPI()

    _, first = api.build_deep_link(
        _payload(),
        headers={"Idempotency-Key": "deep-link-035"},
    )
    retry_status, retry = api.build_deep_link(
        _payload(),
        headers={"idempotency-key": "deep-link-035"},
    )

    assert retry_status == 200
    assert retry == first


def test_store_ops_deep_link_api_rejects_idempotency_conflict() -> None:
    api = StoreOpsDeepLinkAPI()
    api.build_deep_link(_payload(), headers={"Idempotency-Key": "deep-link-035"})
    changed = _payload()
    assert isinstance(changed["health_summary"], dict)
    changed["health_summary"]["run_id"] = "run-other"

    status, body = api.build_deep_link(
        changed,
        headers={"Idempotency-Key": "deep-link-035"},
    )

    assert status == 409
    assert response_envelope_ok(body)
    assert body["error_code"] == "IDEMPOTENCY_KEY_CONFLICT"


def test_store_ops_deep_link_api_requires_idempotency_key() -> None:
    status, body = StoreOpsDeepLinkAPI().build_deep_link(_payload(), headers={})

    assert status == 400
    assert response_envelope_ok(body)
    assert body["error_code"] == "VALIDATION_ERROR"


def test_store_ops_deep_link_api_rejects_non_object_viewer_context() -> None:
    payload = _payload()
    payload["viewer_context"] = []

    status, body = StoreOpsDeepLinkAPI().build_deep_link(
        payload,
        headers={"Idempotency-Key": "deep-link-035"},
    )

    assert status == 400
    assert response_envelope_ok(body)
    assert body["details"]["reason"] == "viewer_context must be an object when present"
