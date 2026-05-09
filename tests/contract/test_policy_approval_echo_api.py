from agent_store.api.agent_registry import response_envelope_ok
from agent_store.api.policy_approval import PolicyApprovalEchoAPI


def _payload() -> dict[str, object]:
    return {
        "trace_id": "trace-028",
        "audit_id": "audit-028",
        "agent_id": "agent.guided-uploader",
        "agent_version": "0.1.0",
        "agentops_policy_echo": {
            "policy_decision": {
                "policy_decision_id": "policy-decision-028",
                "decision": "allow",
                "policy_ref": "policy://agentops/runtime/default",
                "reason_code": "tenant_policy_passed",
                "evaluated_at": "2026-05-09T12:00:00+00:00",
                "valid_until": "2026-05-09T13:00:00+00:00",
                "trace_id": "trace-agentops-028",
                "audit_id": "audit-agentops-028",
            },
            "approval": {
                "approval_id": "approval-028",
                "status": "approved",
                "decision": "approved",
                "expires_at": "2027-05-09T13:00:00+00:00",
                "request_access_url": "/agentops/approvals/approval-028",
                "audit_id": "audit-agentops-approval-028",
            },
        },
    }


def test_project_policy_approval_echo_returns_echo_only_projection() -> None:
    status, body = PolicyApprovalEchoAPI().project_policy_approval_echo(
        _payload(),
        headers={"Idempotency-Key": "policy-approval-028"},
    )
    echo = body["policy_approval_echo"]

    assert status == 200
    assert response_envelope_ok(body)
    assert echo["contract_schema_version"] == "policy_approval_echo.v1"
    assert echo["echo_state"] == "policy_allowed"
    assert echo["source_of_truth"]["approval"] == "agentops"
    assert echo["store_projection"]["capability_grant_issued"] is False


def test_project_policy_approval_echo_reuses_idempotent_result() -> None:
    api = PolicyApprovalEchoAPI()

    _, first = api.project_policy_approval_echo(
        _payload(),
        headers={"Idempotency-Key": "policy-approval-028"},
    )
    first["policy_approval_echo"]["echo_state"] = "mutated"
    status, second = api.project_policy_approval_echo(
        _payload(),
        headers={"Idempotency-Key": "policy-approval-028"},
    )

    assert status == 200
    assert second["policy_approval_echo"]["echo_state"] == "policy_allowed"


def test_project_policy_approval_echo_ignores_observability_for_idempotency() -> None:
    api = PolicyApprovalEchoAPI()

    _, first = api.project_policy_approval_echo(
        _payload(),
        headers={"Idempotency-Key": "policy-approval-028"},
    )
    retry = _payload()
    retry["trace_id"] = "trace-retry"
    retry["audit_id"] = "audit-retry"
    status, second = api.project_policy_approval_echo(
        retry,
        headers={"Idempotency-Key": "policy-approval-028"},
    )

    assert status == 200
    assert second == first


def test_project_policy_approval_echo_rejects_idempotency_conflict() -> None:
    api = PolicyApprovalEchoAPI()
    api.project_policy_approval_echo(
        _payload(),
        headers={"Idempotency-Key": "policy-approval-028"},
    )
    changed = _payload()
    changed["agentops_policy_echo"]["policy_decision"]["decision"] = "deny"

    status, body = api.project_policy_approval_echo(
        changed,
        headers={"Idempotency-Key": "policy-approval-028"},
    )

    assert status == 409
    assert response_envelope_ok(body)
    assert body["error_code"] == "IDEMPOTENCY_KEY_CONFLICT"


def test_project_policy_approval_echo_requires_agentops_echo_object() -> None:
    payload = _payload()
    payload["agentops_policy_echo"] = None

    status, body = PolicyApprovalEchoAPI().project_policy_approval_echo(
        payload,
        headers={"Idempotency-Key": "policy-approval-028"},
    )

    assert status == 400
    assert response_envelope_ok(body)
    assert body["error_code"] == "VALIDATION_ERROR"
    assert body["details"]["reason"] == "agentops_policy_echo must be an object"


def test_project_policy_approval_echo_requires_agent_identity() -> None:
    payload = _payload()
    payload["agent_version"] = ""

    status, body = PolicyApprovalEchoAPI().project_policy_approval_echo(
        payload,
        headers={"Idempotency-Key": "policy-approval-028"},
    )

    assert status == 400
    assert response_envelope_ok(body)
    assert body["details"]["reason"] == "agent_id and agent_version are required"
