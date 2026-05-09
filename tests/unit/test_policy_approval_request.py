from agent_store.domain.policy_approval_request import build_policy_approval_request


def _request(
    *,
    requester_role: str = "owner",
    policy_context: dict[str, object] | None = None,
    justification: str = "Need tenant approval before managed install.",
    requested_action: str = "install_agent",
) -> dict[str, object]:
    return build_policy_approval_request(
        agent_id="agent.guided-uploader",
        agent_version="0.1.0",
        requested_action=requested_action,
        requester={
            "actor_id": "owner-1",
            "actor_role": requester_role,
            "tenant_id": "tenant-1",
        },
        policy_context=policy_context
        or {
            "policy_ref": "policy://agentops/runtime/default",
            "risk_level": "medium",
            "runtime_contract_version": "runtime-contract.v1",
            "permission_intents": ["read_repo"],
            "data_scopes": ["repo_metadata"],
        },
        justification=justification,
        trace_id="trace-033",
        audit_id="audit-033",
    ).to_response()["policy_approval_request"]


def test_policy_approval_request_ready_for_agentops_dispatch() -> None:
    request = _request()

    assert request["contract_schema_version"] == "policy_approval_request.v1"
    assert request["request_state"] == "approval_request_ready"
    assert request["agentops_request"]["dispatch_allowed"] is True
    assert request["store_projection"]["store_decision_authority"] == "none"
    assert request["store_projection"]["capability_grant_issued"] is False
    assert request["source_of_truth"]["approval_request"] == "agent_store"
    assert request["source_of_truth"]["approval"] == "agentops"
    assert request["next_action"]["target_system"] == "agentops"


def test_policy_approval_request_requires_authorized_requester() -> None:
    request = _request(requester_role="viewer")

    assert request["request_state"] == "requester_required"
    assert request["agentops_request"]["dispatch_allowed"] is False
    assert request["issues"][0]["issue_id"] == "REQUESTER_ROLE_UNAUTHORIZED"
    assert request["next_action"]["action_id"] == "assign_authorized_requester"


def test_policy_approval_request_requires_policy_context() -> None:
    request = _request(policy_context={"policy_ref": "policy://agentops/default"})

    assert request["request_state"] == "policy_context_incomplete"
    assert request["issues"][0]["issue_id"] == "POLICY_CONTEXT_INCOMPLETE"
    assert request["next_action"]["action_id"] == "complete_policy_context"


def test_policy_approval_request_requires_justification() -> None:
    request = _request(justification="")

    assert request["request_state"] == "justification_required"
    assert request["issues"][0]["issue_id"] == "JUSTIFICATION_REQUIRED"
    assert request["next_action"]["action_id"] == "add_approval_justification"


def test_policy_approval_request_blocks_unsupported_action() -> None:
    request = _request(requested_action="mint_capability_grant")

    assert request["request_state"] == "approval_request_blocked"
    assert request["issues"][0]["issue_id"] == "REQUESTED_ACTION_UNSUPPORTED"
    assert request["store_projection"]["dispatch_allowed"] is False
