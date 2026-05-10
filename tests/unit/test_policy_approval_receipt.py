from agent_store.domain.policy_approval_receipt import build_policy_approval_receipt


def _approval_request(**overrides: object) -> dict[str, object]:
    request = {
        "contract_schema_version": "policy_approval_request.v1",
        "agent_id": "agent.guided-uploader",
        "agent_version": "0.1.0",
        "requested_action": "install_agent",
        "audit_id": "audit-store-034",
    }
    request.update(overrides)
    return request


def _agentops_receipt(**overrides: object) -> dict[str, object]:
    receipt = {
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
    }
    receipt.update(overrides)
    return receipt


def _projection(
    approval_request: dict[str, object] | None = None,
    agentops_receipt: dict[str, object] | None = None,
) -> dict[str, object]:
    return build_policy_approval_receipt(
        approval_request=approval_request or _approval_request(),
        agentops_receipt=agentops_receipt or _agentops_receipt(),
        trace_id="trace-034",
        audit_id="audit-034",
    ).to_response()["policy_approval_receipt"]


def test_policy_approval_receipt_links_agentops_approval_without_decision() -> None:
    receipt = _projection()

    assert receipt["contract_schema_version"] == "policy_approval_receipt.v1"
    assert receipt["receipt_state"] == "approval_receipt_accepted"
    assert receipt["agentops_receipt"]["approval_id"] == "approval-034"
    assert receipt["store_projection"]["store_decision_authority"] == "none"
    assert receipt["store_projection"]["capability_grant_issued"] is False
    assert receipt["store_projection"]["approval_decision_final"] is False
    assert receipt["source_of_truth"]["approval_receipt"] == "agentops"
    assert receipt["next_action"]["action_id"] == "view_agentops_approval"


def test_policy_approval_receipt_pending_routes_to_poll() -> None:
    receipt = _projection(agentops_receipt=_agentops_receipt(receipt_status="pending"))

    assert receipt["receipt_state"] == "approval_receipt_pending"
    assert receipt["store_projection"]["approval_flow_linked"] is True
    assert receipt["next_action"]["action_id"] == "poll_agentops_approval_receipt"


def test_policy_approval_receipt_rejected_does_not_link_flow() -> None:
    receipt = _projection(agentops_receipt=_agentops_receipt(receipt_status="rejected"))

    assert receipt["receipt_state"] == "approval_receipt_rejected"
    assert receipt["store_projection"]["approval_flow_linked"] is False
    assert receipt["next_action"]["action_id"] == "fix_agentops_approval_request"


def test_policy_approval_receipt_blocks_contract_drift() -> None:
    receipt = _projection(
        agentops_receipt=_agentops_receipt(receipt_contract="agentops-local.v9")
    )

    assert receipt["receipt_state"] == "approval_receipt_unavailable"
    assert receipt["issues"][0]["issue_id"] == "AGENTOPS_RECEIPT_CONTRACT_UNSUPPORTED"


def test_policy_approval_receipt_blocks_request_mismatch() -> None:
    receipt = _projection(agentops_receipt=_agentops_receipt(agent_id="agent.other"))

    assert receipt["receipt_state"] == "approval_receipt_unavailable"
    assert receipt["issues"][0]["issue_id"] == "APPROVAL_RECEIPT_REQUEST_MISMATCH"


def test_policy_approval_receipt_requires_receipt_agent_binding() -> None:
    receipt = _projection(agentops_receipt=_agentops_receipt(agent_id=""))

    assert receipt["receipt_state"] == "approval_receipt_unavailable"
    assert receipt["issues"][0]["issue_id"] == "AGENTOPS_RECEIPT_INCOMPLETE"
    assert receipt["store_projection"]["approval_flow_linked"] is False


def test_policy_approval_receipt_requires_originating_request() -> None:
    receipt = _projection(approval_request=_approval_request(agent_id=""))

    assert receipt["receipt_state"] == "approval_receipt_unavailable"
    assert receipt["issues"][0]["issue_id"] == "APPROVAL_REQUEST_REF_INVALID"
