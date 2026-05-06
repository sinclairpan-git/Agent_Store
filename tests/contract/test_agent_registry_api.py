from agent_store.api.agent_registry import AgentRegistryAPI, response_envelope_ok


def _payload() -> dict[str, object]:
    return {
        "agent_id": "framework.ai-autosdlc",
        "display_name": "Ai_AutoSDLC",
        "type": "framework_capability",
        "category": "sdlc_framework",
        "owner_team": "SDLC Platform",
        "owner_user": "owner@example.com",
        "version": "1.0.0",
        "artifact_hash": "sha256:first",
        "signature": "sig-1",
        "issuer": "Agent Store",
        "release_status": "manual_installable-preview",
    }


def test_create_agent_draft_response_contains_required_envelope_and_idempotency() -> (
    None
):
    api = AgentRegistryAPI()

    status, body = api.create_agent_draft(
        _payload(),
        headers={"Idempotency-Key": "idem-1"},
    )
    retry_status, retry_body = api.create_agent_draft(
        _payload(),
        headers={"Idempotency-Key": "idem-1"},
    )

    assert status == 201
    assert retry_status == 201
    assert response_envelope_ok(body)
    assert retry_body["trace_id"] == body["trace_id"]
    assert body["agent"]["package_trust_summary"]["hash_match_state"] == "matched"


def test_create_agent_draft_rejects_idempotency_key_for_different_payload() -> None:
    api = AgentRegistryAPI()
    api.create_agent_draft(_payload(), headers={"Idempotency-Key": "idem-1"})

    status, body = api.create_agent_draft(
        {**_payload(), "artifact_hash": "sha256:second", "trace_id": "trace-2"},
        headers={"Idempotency-Key": "idem-1"},
    )

    assert status == 409
    assert response_envelope_ok(body)
    assert body["error_code"] == "IDEMPOTENCY_KEY_CONFLICT"
    assert body["trace_id"] == "trace-2"


def test_get_agent_detail_response_contains_required_envelope() -> None:
    api = AgentRegistryAPI()
    api.create_agent_draft(_payload(), headers={"Idempotency-Key": "idem-1"})

    status, body = api.get_agent_detail("framework.ai-autosdlc")

    assert status == 200
    assert response_envelope_ok(body)
    assert body["agent"]["agent_id"] == "framework.ai-autosdlc"


def test_create_agent_draft_requires_idempotency_key() -> None:
    api = AgentRegistryAPI()

    status, body = api.create_agent_draft(_payload(), headers={})

    assert status == 400
    assert response_envelope_ok(body)
    assert body["error_code"] == "VALIDATION_ERROR"


def test_create_agent_draft_missing_required_field_returns_validation_error() -> None:
    api = AgentRegistryAPI()
    payload = _payload()
    del payload["agent_id"]

    status, body = api.create_agent_draft(
        payload,
        headers={"Idempotency-Key": "idem-1"},
    )

    assert status == 400
    assert response_envelope_ok(body)
    assert body["error_code"] == "VALIDATION_ERROR"


def test_create_agent_draft_rejects_null_required_field() -> None:
    api = AgentRegistryAPI()
    payload = _payload()
    payload["artifact_hash"] = None

    status, body = api.create_agent_draft(
        payload,
        headers={"Idempotency-Key": "idem-1"},
    )

    assert status == 400
    assert response_envelope_ok(body)
    assert body["error_code"] == "VALIDATION_ERROR"
    assert "artifact_hash" in body["details"]["reason"]
