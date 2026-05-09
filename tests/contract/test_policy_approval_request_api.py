from agent_store.api.agent_registry import response_envelope_ok
from agent_store.api.policy_approval_request import PolicyApprovalRequestAPI


def _payload() -> dict[str, object]:
    return {
        "trace_id": "trace-033",
        "audit_id": "audit-033",
        "agent_id": "agent.guided-uploader",
        "agent_version": "0.1.0",
        "requested_action": "install_agent",
        "requester": {
            "actor_id": "owner-1",
            "actor_role": "owner",
            "tenant_id": "tenant-1",
        },
        "policy_context": {
            "policy_ref": "policy://agentops/runtime/default",
            "risk_level": "medium",
            "runtime_contract_version": "runtime-contract.v1",
            "permission_intents": ["read_repo"],
            "data_scopes": ["repo_metadata"],
        },
        "justification": "Need tenant approval before managed install.",
    }


def test_submit_policy_approval_request_returns_agentops_request() -> None:
    status, body = PolicyApprovalRequestAPI().submit_policy_approval_request(
        _payload(),
        headers={"Idempotency-Key": "policy-approval-request-033"},
    )
    request = body["policy_approval_request"]

    assert status == 200
    assert response_envelope_ok(body)
    assert request["contract_schema_version"] == "policy_approval_request.v1"
    assert request["request_state"] == "approval_request_ready"
    assert request["agentops_request"]["target_system"] == "agentops"
    assert request["store_projection"]["capability_grant_issued"] is False


def test_submit_policy_approval_request_reuses_idempotent_result() -> None:
    api = PolicyApprovalRequestAPI()

    _, first = api.submit_policy_approval_request(
        _payload(),
        headers={"Idempotency-Key": "policy-approval-request-033"},
    )
    first["policy_approval_request"]["request_state"] = "mutated"
    status, second = api.submit_policy_approval_request(
        _payload(),
        headers={"Idempotency-Key": "policy-approval-request-033"},
    )

    assert status == 200
    assert second["policy_approval_request"]["request_state"] == (
        "approval_request_ready"
    )


def test_submit_policy_approval_request_ignores_observability_for_idempotency() -> None:
    api = PolicyApprovalRequestAPI()

    _, first = api.submit_policy_approval_request(
        _payload(),
        headers={"Idempotency-Key": "policy-approval-request-033"},
    )
    retry = _payload()
    retry["trace_id"] = "trace-retry"
    retry["audit_id"] = "audit-retry"
    status, second = api.submit_policy_approval_request(
        retry,
        headers={"Idempotency-Key": "policy-approval-request-033"},
    )

    assert status == 200
    assert second == first


def test_submit_policy_approval_request_rejects_idempotency_conflict() -> None:
    api = PolicyApprovalRequestAPI()
    api.submit_policy_approval_request(
        _payload(),
        headers={"Idempotency-Key": "policy-approval-request-033"},
    )
    changed = _payload()
    changed["requested_action"] = "upgrade_agent"

    status, body = api.submit_policy_approval_request(
        changed,
        headers={"Idempotency-Key": "policy-approval-request-033"},
    )

    assert status == 409
    assert response_envelope_ok(body)
    assert body["error_code"] == "IDEMPOTENCY_KEY_CONFLICT"


def test_submit_policy_approval_request_requires_requester_object() -> None:
    payload = _payload()
    payload["requester"] = None

    status, body = PolicyApprovalRequestAPI().submit_policy_approval_request(
        payload,
        headers={"Idempotency-Key": "policy-approval-request-033"},
    )

    assert status == 400
    assert response_envelope_ok(body)
    assert body["details"]["reason"] == "requester must be an object"


def test_submit_policy_approval_request_requires_policy_context_object() -> None:
    payload = _payload()
    payload["policy_context"] = None

    status, body = PolicyApprovalRequestAPI().submit_policy_approval_request(
        payload,
        headers={"Idempotency-Key": "policy-approval-request-033"},
    )

    assert status == 400
    assert response_envelope_ok(body)
    assert body["details"]["reason"] == "policy_context must be an object"
