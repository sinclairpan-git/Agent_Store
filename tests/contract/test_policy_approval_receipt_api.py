from agent_store.api.agent_registry import response_envelope_ok
from agent_store.api.policy_approval_receipt import PolicyApprovalReceiptAPI


def _payload() -> dict[str, object]:
    return {
        "trace_id": "trace-034",
        "audit_id": "audit-034",
        "approval_request": {
            "contract_schema_version": "policy_approval_request.v1",
            "agent_id": "agent.guided-uploader",
            "agent_version": "0.1.0",
            "requested_action": "install_agent",
            "audit_id": "audit-store-034",
        },
        "agentops_receipt": {
            "receipt_contract": "policy_approval_receipt.v1",
            "approval_request_id": "agentops-request-034",
            "approval_id": "approval-034",
            "receipt_status": "accepted",
            "agent_id": "agent.guided-uploader",
            "agent_version": "0.1.0",
            "requested_action": "install_agent",
            "request_access_url": "/agentops/approvals/approval-034",
            "agentops_audit_id": "audit-agentops-034",
            "received_at": "2026-05-09T12:00:00+00:00",
        },
    }


def test_project_policy_approval_receipt_returns_receipt_only_projection() -> None:
    status, body = PolicyApprovalReceiptAPI().project_policy_approval_receipt(
        _payload(),
        headers={"Idempotency-Key": "policy-approval-receipt-034"},
    )
    receipt = body["policy_approval_receipt"]

    assert status == 200
    assert response_envelope_ok(body)
    assert receipt["contract_schema_version"] == "policy_approval_receipt.v1"
    assert receipt["receipt_state"] == "approval_receipt_accepted"
    assert receipt["store_projection"]["approval_decision_final"] is False
    assert receipt["source_of_truth"]["policy_decision"] == (
        "agentops_not_decided_by_receipt"
    )


def test_project_policy_approval_receipt_reuses_idempotent_result() -> None:
    api = PolicyApprovalReceiptAPI()

    _, first = api.project_policy_approval_receipt(
        _payload(),
        headers={"Idempotency-Key": "policy-approval-receipt-034"},
    )
    first["policy_approval_receipt"]["receipt_state"] = "mutated"
    status, second = api.project_policy_approval_receipt(
        _payload(),
        headers={"Idempotency-Key": "policy-approval-receipt-034"},
    )

    assert status == 200
    assert second["policy_approval_receipt"]["receipt_state"] == (
        "approval_receipt_accepted"
    )


def test_project_policy_approval_receipt_ignores_observability_for_idempotency() -> (
    None
):
    api = PolicyApprovalReceiptAPI()

    _, first = api.project_policy_approval_receipt(
        _payload(),
        headers={"Idempotency-Key": "policy-approval-receipt-034"},
    )
    retry = _payload()
    retry["trace_id"] = "trace-retry"
    retry["audit_id"] = "audit-retry"
    status, second = api.project_policy_approval_receipt(
        retry,
        headers={"Idempotency-Key": "policy-approval-receipt-034"},
    )

    assert status == 200
    assert second == first


def test_project_policy_approval_receipt_rejects_idempotency_conflict() -> None:
    api = PolicyApprovalReceiptAPI()
    api.project_policy_approval_receipt(
        _payload(),
        headers={"Idempotency-Key": "policy-approval-receipt-034"},
    )
    changed = _payload()
    changed["agentops_receipt"]["approval_id"] = "approval-other"

    status, body = api.project_policy_approval_receipt(
        changed,
        headers={"Idempotency-Key": "policy-approval-receipt-034"},
    )

    assert status == 409
    assert response_envelope_ok(body)
    assert body["error_code"] == "IDEMPOTENCY_KEY_CONFLICT"


def test_project_policy_approval_receipt_requires_request_object() -> None:
    payload = _payload()
    payload["approval_request"] = None

    status, body = PolicyApprovalReceiptAPI().project_policy_approval_receipt(
        payload,
        headers={"Idempotency-Key": "policy-approval-receipt-034"},
    )

    assert status == 400
    assert response_envelope_ok(body)
    assert body["details"]["reason"] == "approval_request must be an object"


def test_project_policy_approval_receipt_requires_receipt_object() -> None:
    payload = _payload()
    payload["agentops_receipt"] = None

    status, body = PolicyApprovalReceiptAPI().project_policy_approval_receipt(
        payload,
        headers={"Idempotency-Key": "policy-approval-receipt-034"},
    )

    assert status == 400
    assert response_envelope_ok(body)
    assert body["details"]["reason"] == "agentops_receipt must be an object"
