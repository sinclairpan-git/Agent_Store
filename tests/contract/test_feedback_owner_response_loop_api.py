from agent_store.api.agent_registry import response_envelope_ok
from agent_store.api.feedback_loop import FeedbackOwnerResponseLoopAPI


def _payload() -> dict[str, object]:
    return {
        "trace_id": "trace-030",
        "audit_id": "audit-030",
        "feedback": {
            "feedback_id": "fb-030",
            "agent_id": "agent.guided-uploader",
            "agent_version": "0.1.0",
            "feedback_state": "triaged",
            "title": "Installer smoke test is confusing",
            "feedback_type": "bug",
            "severity": "warning",
            "submitted_by": "user@example.com",
        },
        "transition": {
            "transition_action": "owner_reply",
            "actor_id": "owner@example.com",
            "actor_role": "owner",
            "message": "We reviewed this and will update the installer copy.",
            "occurred_at": "2026-05-09T12:00:00Z",
            "commitment": "next_patch",
        },
    }


def test_transition_feedback_returns_owner_response_loop_contract() -> None:
    status, body = FeedbackOwnerResponseLoopAPI().transition_feedback(
        _payload(),
        headers={"Idempotency-Key": "feedback-loop-030"},
    )
    loop = body["feedback_owner_response_loop"]

    assert status == 200
    assert response_envelope_ok(body)
    assert loop["contract_schema_version"] == "feedback_owner_response_loop.v1"
    assert loop["feedback_state"] == "owner_replied"
    assert loop["timeline"][0]["transition_action"] == "owner_reply"


def test_transition_feedback_reuses_idempotent_result() -> None:
    api = FeedbackOwnerResponseLoopAPI()

    _, first = api.transition_feedback(
        _payload(),
        headers={"Idempotency-Key": "feedback-loop-030"},
    )
    first["feedback_owner_response_loop"]["feedback_state"] = "mutated"
    status, second = api.transition_feedback(
        _payload(),
        headers={"Idempotency-Key": "feedback-loop-030"},
    )

    assert status == 200
    assert second["feedback_owner_response_loop"]["feedback_state"] == "owner_replied"


def test_transition_feedback_ignores_observability_for_idempotency() -> None:
    api = FeedbackOwnerResponseLoopAPI()

    _, first = api.transition_feedback(
        _payload(),
        headers={"Idempotency-Key": "feedback-loop-030"},
    )
    retry = _payload()
    retry["trace_id"] = "trace-retry"
    retry["audit_id"] = "audit-retry"
    status, second = api.transition_feedback(
        retry,
        headers={"Idempotency-Key": "feedback-loop-030"},
    )

    assert status == 200
    assert second == first


def test_transition_feedback_rejects_idempotency_conflict() -> None:
    api = FeedbackOwnerResponseLoopAPI()
    api.transition_feedback(
        _payload(),
        headers={"Idempotency-Key": "feedback-loop-030"},
    )
    changed = _payload()
    changed["transition"]["message"] = "Different response."

    status, body = api.transition_feedback(
        changed,
        headers={"Idempotency-Key": "feedback-loop-030"},
    )

    assert status == 409
    assert response_envelope_ok(body)
    assert body["error_code"] == "IDEMPOTENCY_KEY_CONFLICT"


def test_transition_feedback_requires_feedback_object() -> None:
    payload = _payload()
    payload["feedback"] = None

    status, body = FeedbackOwnerResponseLoopAPI().transition_feedback(
        payload,
        headers={"Idempotency-Key": "feedback-loop-030"},
    )

    assert status == 400
    assert response_envelope_ok(body)
    assert body["details"]["reason"] == "feedback must be an object"


def test_transition_feedback_requires_transition_object() -> None:
    payload = _payload()
    payload["transition"] = None

    status, body = FeedbackOwnerResponseLoopAPI().transition_feedback(
        payload,
        headers={"Idempotency-Key": "feedback-loop-030"},
    )

    assert status == 400
    assert response_envelope_ok(body)
    assert body["details"]["reason"] == "transition must be an object"
