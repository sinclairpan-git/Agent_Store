from agent_store.domain.permission_denial import (
    build_permission_denial_action_summary,
)


def _viewer(**overrides: object) -> dict[str, object]:
    data: dict[str, object] = {
        "auth_context_id": "auth-038",
        "subject_user_id": "user-038",
        "identity_source": "sso_token",
        "return_path": "/agents/framework.ai-autosdlc",
    }
    data.update(overrides)
    return data


def _decision(**overrides: object) -> dict[str, object]:
    data: dict[str, object] = {
        "permission_decision_id": "perm-038",
        "decision": "deny",
        "denied_scope": "agent.install",
        "request_access_url": "/access/request",
    }
    data.update(overrides)
    return data


def _summary(scenario: str, **context_overrides: object) -> dict[str, object]:
    context: dict[str, object] = {
        "denial_scenario": scenario,
        "agent_id": "framework.ai-autosdlc",
        "agent_version": "1.0.0",
        "agent_display_name": "Ai AutoSDLC",
        "denied_scope": "agent.install",
        "resource_scope": "repo:demo",
        "request_id": "req-038",
        "request_access_url": "/access/request",
    }
    context.update(context_overrides)
    return build_permission_denial_action_summary(
        denial_context=context,
        viewer_context=_viewer(),
        permission_decision=_decision(),
        trace_id="trace-038",
        audit_id="audit-038",
    ).to_dict()


def test_permission_denial_not_visible_returns_catalog_and_visibility_request() -> None:
    summary = _summary("not_visible")

    assert summary["denial_state"] == "visibility_denied"
    assert summary["permission_state"] == "visibility_denied"
    assert summary["page"]["title"] == "当前无权查看此 Agent"
    assert summary["primary_action"]["action_id"] == "return_to_catalog"
    assert summary["secondary_action"]["action_id"] == "request_visibility_access"
    assert summary["store_grant_issued"] is False
    assert summary["store_policy_override_allowed"] is False


def test_permission_denial_visible_not_installable_requests_install_permission() -> (
    None
):
    summary = _summary("visible_not_installable")

    assert summary["denial_state"] == "install_permission_required"
    assert summary["permission_state"] == "install_denied"
    assert summary["primary_action"]["action_id"] == "request_install_permission"
    assert summary["secondary_action"]["action_id"] == "contact_agent_owner"
    assert summary["page"]["notification_rule"] == "notify_owner_on_request"


def test_permission_denial_raw_evidence_routes_to_vault_and_strips_urls() -> None:
    summary = _summary(
        "raw_evidence_denied",
        raw_trace_url="https://agentops/raw-trace",
        raw_evidence_url="https://agentops/raw-evidence",
    )

    assert summary["denial_state"] == "raw_evidence_access_required"
    assert summary["permission_state"] == "evidence_vault_required"
    assert summary["primary_action"]["target_system"] == "evidence_vault"
    assert summary["permission"]["raw_trace_url"] == ""
    assert summary["permission"]["raw_evidence_url"] == ""
    assert summary["raw_trace_exposed"] is False
    assert summary["raw_evidence_exposed"] is False
    assert summary["issues"][0]["issue_id"] == "RAW_PERMISSION_LINK_STRIPPED"


def test_permission_denial_high_risk_requires_agentops_approval() -> None:
    summary = _summary("high_risk_approval_required")

    assert summary["denial_state"] == "agentops_approval_required"
    assert summary["permission_state"] == "approval_required"
    assert summary["primary_action"]["action_id"] == "submit_agentops_approval"
    assert summary["primary_action"]["target_system"] == "agentops"
    assert summary["page"]["visible_roles"] == ["requester", "owner", "security_iam"]


def test_permission_denial_policy_blocked_requires_policy_ref() -> None:
    summary = _summary("policy_blocked")

    assert summary["denial_state"] == "agentops_policy_blocked"
    assert summary["permission_state"] == "policy_denied"
    assert summary["primary_action"]["action_id"] == "view_policy_reason"
    assert summary["issues"][0]["issue_id"] == "POLICY_REF_REQUIRED"


def test_permission_denial_policy_blocked_with_ref_is_actionable() -> None:
    summary = _summary("policy_blocked", policy_ref="policy/risk-block")

    assert summary["issues"] == []
    assert summary["permission"]["policy_ref"] == "policy/risk-block"
    assert summary["secondary_action"]["action_id"] == "view_replacement_agent"


def test_permission_denial_unsupported_scenario_degrades_to_refresh_identity() -> None:
    summary = _summary("unknown_denial")

    assert summary["denial_scenario"] == "not_visible"
    assert summary["denial_state"] == "denial_unavailable"
    assert summary["permission_state"] == "permission_unknown"
    assert summary["primary_action"]["action_id"] == "refresh_identity"
    assert summary["issues"][0]["issue_id"] == "DENIAL_SCENARIO_UNSUPPORTED"


def test_permission_denial_rejects_client_supplied_identity_context() -> None:
    context = {
        "denial_scenario": "visible_not_installable",
        "agent_id": "framework.ai-autosdlc",
        "agent_version": "1.0.0",
    }
    summary = build_permission_denial_action_summary(
        denial_context=context,
        viewer_context=_viewer(identity_source="client_user_id"),
        permission_decision=_decision(),
        trace_id="trace-038",
        audit_id="audit-038",
    ).to_dict()

    assert summary["denial_state"] == "denial_unavailable"
    assert summary["page"]["title"] == "权限状态待刷新"
    assert summary["primary_action"]["action_id"] == "refresh_identity"
    assert {issue["issue_id"] for issue in summary["issues"]} == {
        "TRUSTED_AUTH_CONTEXT_REQUIRED"
    }


def test_permission_denial_untrusted_identity_does_not_render_specific_policy_page() -> (
    None
):
    context = {
        "denial_scenario": "policy_blocked",
        "agent_id": "framework.ai-autosdlc",
        "agent_version": "1.0.0",
        "policy_ref": "policy/high-risk",
    }
    summary = build_permission_denial_action_summary(
        denial_context=context,
        viewer_context=_viewer(identity_source="client_user_id"),
        permission_decision=_decision(),
        trace_id="trace-038",
        audit_id="audit-038",
    ).to_dict()

    assert summary["denial_scenario"] == "policy_blocked"
    assert summary["denial_state"] == "denial_unavailable"
    assert summary["page"]["title"] == "权限状态待刷新"
    assert summary["page"]["notification_rule"] == "audit_only"
