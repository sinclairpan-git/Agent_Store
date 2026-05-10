from agent_store.api.agent_registry import response_envelope_ok
from agent_store.api.lifecycle_governance import LifecycleGovernanceAPI


def _payload() -> dict[str, object]:
    return {
        "trace_id": "trace-031",
        "audit_id": "audit-031",
        "current_version": {
            "agent_id": "agent.guided-uploader",
            "version": "0.1.0",
            "artifact_hash": "sha256:guided-uploader",
            "release_status": "manual_installable-preview",
            "lifecycle_state": "active",
        },
        "transition": {
            "transition_action": "upgrade",
            "actor_id": "owner@example.com",
            "actor_role": "owner",
            "reason": "New release is ready.",
            "replacement_version": "0.2.0",
            "affected_installation_count": 3,
            "affected_user_count": 2,
        },
    }


def test_apply_lifecycle_transition_returns_governance_contract() -> None:
    status, body = LifecycleGovernanceAPI().apply_lifecycle_transition(
        _payload(),
        headers={"Idempotency-Key": "lifecycle-031"},
    )
    lifecycle = body["lifecycle_governance"]

    assert status == 200
    assert response_envelope_ok(body)
    assert lifecycle["contract_schema_version"] == "lifecycle_governance_baseline.v1"
    assert lifecycle["lifecycle_state"] == "upgrade_available"
    assert lifecycle["replacement"]["replacement_version"] == "0.2.0"


def test_apply_lifecycle_transition_reuses_idempotent_result() -> None:
    api = LifecycleGovernanceAPI()

    _, first = api.apply_lifecycle_transition(
        _payload(),
        headers={"Idempotency-Key": "lifecycle-031"},
    )
    first["lifecycle_governance"]["lifecycle_state"] = "mutated"
    status, second = api.apply_lifecycle_transition(
        _payload(),
        headers={"Idempotency-Key": "lifecycle-031"},
    )

    assert status == 200
    assert second["lifecycle_governance"]["lifecycle_state"] == "upgrade_available"


def test_apply_lifecycle_transition_ignores_observability_for_idempotency() -> None:
    api = LifecycleGovernanceAPI()

    _, first = api.apply_lifecycle_transition(
        _payload(),
        headers={"Idempotency-Key": "lifecycle-031"},
    )
    retry = _payload()
    retry["trace_id"] = "trace-retry"
    retry["audit_id"] = "audit-retry"
    status, second = api.apply_lifecycle_transition(
        retry,
        headers={"Idempotency-Key": "lifecycle-031"},
    )

    assert status == 200
    assert second == first


def test_apply_lifecycle_transition_rejects_idempotency_conflict() -> None:
    api = LifecycleGovernanceAPI()
    api.apply_lifecycle_transition(
        _payload(),
        headers={"Idempotency-Key": "lifecycle-031"},
    )
    changed = _payload()
    changed["transition"]["replacement_version"] = "0.3.0"

    status, body = api.apply_lifecycle_transition(
        changed,
        headers={"Idempotency-Key": "lifecycle-031"},
    )

    assert status == 409
    assert response_envelope_ok(body)
    assert body["error_code"] == "IDEMPOTENCY_KEY_CONFLICT"


def test_apply_lifecycle_transition_requires_current_version_object() -> None:
    payload = _payload()
    payload["current_version"] = None

    status, body = LifecycleGovernanceAPI().apply_lifecycle_transition(
        payload,
        headers={"Idempotency-Key": "lifecycle-031"},
    )

    assert status == 400
    assert response_envelope_ok(body)
    assert body["details"]["reason"] == "current_version must be an object"


def test_apply_lifecycle_transition_requires_transition_object() -> None:
    payload = _payload()
    payload["transition"] = None

    status, body = LifecycleGovernanceAPI().apply_lifecycle_transition(
        payload,
        headers={"Idempotency-Key": "lifecycle-031"},
    )

    assert status == 400
    assert response_envelope_ok(body)
    assert body["details"]["reason"] == "transition must be an object"
