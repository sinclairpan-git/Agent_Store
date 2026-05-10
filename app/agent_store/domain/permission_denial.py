from __future__ import annotations

from dataclasses import dataclass
from typing import Mapping

from agent_store import SCHEMA_VERSION

from .actions import ActionDescriptor
from .status_registry import SEVERITIES


PERMISSION_DENIAL_ACTION_SCHEMA_VERSION = "permission_denial_action_summary.v1"
DENIAL_SCENARIOS = frozenset(
    {
        "not_visible",
        "visible_not_installable",
        "raw_evidence_denied",
        "high_risk_approval_required",
        "policy_blocked",
    }
)
SCENARIO_STATES = {
    "not_visible": "visibility_denied",
    "visible_not_installable": "install_permission_required",
    "raw_evidence_denied": "raw_evidence_access_required",
    "high_risk_approval_required": "agentops_approval_required",
    "policy_blocked": "agentops_policy_blocked",
}


def _string(value: object) -> str:
    return value.strip() if isinstance(value, str) else ""


def _mapping(value: object) -> Mapping[str, object]:
    return value if isinstance(value, Mapping) else {}


@dataclass(frozen=True)
class PermissionDenialIssue:
    issue_id: str
    field_path: str
    severity: str
    reason: str
    impact: str
    fix_action_id: str
    message_key: str

    def __post_init__(self) -> None:
        if not self.issue_id:
            raise ValueError("issue_id is required")
        if not self.field_path:
            raise ValueError("field_path is required")
        if self.severity not in SEVERITIES:
            raise ValueError(f"unsupported severity: {self.severity}")
        if not self.fix_action_id:
            raise ValueError("fix_action_id is required")

    def to_dict(self) -> dict[str, object]:
        return {
            "issue_id": self.issue_id,
            "field_path": self.field_path,
            "severity": self.severity,
            "reason": self.reason,
            "impact": self.impact,
            "fix_action_id": self.fix_action_id,
            "message_key": self.message_key,
        }


@dataclass(frozen=True)
class PermissionDenialActionSummary:
    trace_id: str
    audit_id: str
    agent_id: str
    agent_version: str
    denial_scenario: str
    denial_state: str
    permission_state: str
    page: dict[str, object]
    permission: dict[str, object]
    raw_trace_exposed: bool
    raw_evidence_exposed: bool
    store_grant_issued: bool
    store_policy_override_allowed: bool
    primary_action: ActionDescriptor
    secondary_action: ActionDescriptor
    issues: tuple[PermissionDenialIssue, ...]
    source_of_truth: dict[str, str]

    def to_response(self) -> dict[str, object]:
        return {
            "schema_version": SCHEMA_VERSION,
            "trace_id": self.trace_id,
            "error_code": "OK",
            "audit_id": self.audit_id,
            "permission_denial_action_summary": self.to_dict(),
        }

    def to_dict(self) -> dict[str, object]:
        return {
            "contract_schema_version": PERMISSION_DENIAL_ACTION_SCHEMA_VERSION,
            "agent_id": self.agent_id,
            "agent_version": self.agent_version,
            "denial_scenario": self.denial_scenario,
            "denial_state": self.denial_state,
            "permission_state": self.permission_state,
            "page": self.page,
            "permission": self.permission,
            "raw_trace_exposed": self.raw_trace_exposed,
            "raw_evidence_exposed": self.raw_evidence_exposed,
            "store_grant_issued": self.store_grant_issued,
            "store_policy_override_allowed": self.store_policy_override_allowed,
            "primary_action": self.primary_action.to_dict(),
            "secondary_action": self.secondary_action.to_dict(),
            "issues": [issue.to_dict() for issue in self.issues],
            "source_of_truth": self.source_of_truth,
            "next_action": self.next_action.to_dict(),
        }

    @property
    def next_action(self) -> ActionDescriptor:
        return self.primary_action


def build_permission_denial_action_summary(
    *,
    denial_context: Mapping[str, object] | None,
    viewer_context: Mapping[str, object] | None = None,
    permission_decision: Mapping[str, object] | None = None,
    trace_id: str,
    audit_id: str,
) -> PermissionDenialActionSummary:
    context = denial_context if isinstance(denial_context, Mapping) else {}
    viewer = viewer_context if isinstance(viewer_context, Mapping) else {}
    decision = permission_decision if isinstance(permission_decision, Mapping) else {}
    scenario = _string(context.get("denial_scenario"))
    issues = tuple(_issues(context, viewer, decision, scenario))
    trusted_identity = not any(
        issue.issue_id == "TRUSTED_AUTH_CONTEXT_REQUIRED" for issue in issues
    )
    supported_scenario = scenario in DENIAL_SCENARIOS
    denial_state = (
        SCENARIO_STATES[scenario]
        if trusted_identity and supported_scenario
        else "denial_unavailable"
    )
    primary_action, secondary_action = _actions(
        scenario,
        context=context,
        viewer=viewer,
        enabled=trusted_identity and supported_scenario,
    )

    return PermissionDenialActionSummary(
        trace_id=trace_id,
        audit_id=audit_id,
        agent_id=_string(context.get("agent_id")),
        agent_version=_string(context.get("agent_version")),
        denial_scenario=scenario,
        denial_state=denial_state,
        permission_state=_permission_state(scenario, denial_state),
        page=_page(scenario, context=context, viewer=viewer, state=denial_state),
        permission=_permission_payload(context, viewer, decision),
        raw_trace_exposed=False,
        raw_evidence_exposed=False,
        store_grant_issued=False,
        store_policy_override_allowed=False,
        primary_action=primary_action,
        secondary_action=secondary_action,
        issues=issues,
        source_of_truth={
            "identity": "trusted_iam_auth_context",
            "permission_decision": "iam_or_agentops_policy_echo",
            "policy": "agentops",
            "raw_evidence": "evidence_vault",
            "projection": "agent_store",
        },
    )


def _issues(
    context: Mapping[str, object],
    viewer: Mapping[str, object],
    decision: Mapping[str, object],
    scenario: str,
) -> list[PermissionDenialIssue]:
    issues: list[PermissionDenialIssue] = []
    if scenario not in DENIAL_SCENARIOS:
        issues.append(
            _issue("DENIAL_SCENARIO_UNSUPPORTED", "denial_context.denial_scenario")
        )
    if not _string(viewer.get("auth_context_id")) or not _string(
        viewer.get("subject_user_id")
    ):
        issues.append(_issue("TRUSTED_AUTH_CONTEXT_REQUIRED", "viewer_context"))
    if _string(viewer.get("identity_source")) == "client_user_id":
        issues.append(
            _issue("TRUSTED_AUTH_CONTEXT_REQUIRED", "viewer_context.identity_source")
        )
    if not _string(decision.get("permission_decision_id")):
        issues.append(
            _issue(
                "PERMISSION_DECISION_REQUIRED",
                "permission_decision.permission_decision_id",
            )
        )
    if scenario == "policy_blocked" and not _string(context.get("policy_ref")):
        issues.append(_issue("POLICY_REF_REQUIRED", "denial_context.policy_ref"))
    if _string(context.get("raw_trace_url")) or _string(
        context.get("raw_evidence_url")
    ):
        issues.append(
            _issue("RAW_PERMISSION_LINK_STRIPPED", "denial_context.raw_links")
        )
    return issues


def _page(
    scenario: str,
    *,
    context: Mapping[str, object],
    viewer: Mapping[str, object],
    state: str,
) -> dict[str, object]:
    data = {
        "not_visible": (
            "当前无权查看此 Agent",
            "该 Agent 对你的组织或项目不可见。",
            "visibility_denied",
            "申请可见性后再返回列表继续浏览。",
        ),
        "visible_not_installable": (
            "可查看，但暂不能安装",
            "你缺少项目、角色或资源授权。",
            "install_permission_required",
            "提交安装权限申请或联系 Owner。",
        ),
        "raw_evidence_denied": (
            "仅可查看脱敏摘要",
            "证据原文需走 Evidence Vault 审批。",
            "raw_evidence_access_required",
            "申请查看原文，Store 不展示 raw Trace 或 raw Evidence。",
        ),
        "high_risk_approval_required": (
            "此安装需要审批",
            "该 Agent 会访问高风险资源或 Skill。",
            "agentops_approval_required",
            "提交 AgentOps 审批并查看访问范围。",
        ),
        "policy_blocked": (
            "当前策略阻断运行",
            "AgentOps Policy Service 返回 block。",
            "agentops_policy_blocked",
            "查看阻断原因或选择替代版本。",
        ),
    }
    title, explanation, message_key, empty_state = data.get(
        scenario,
        (
            "权限状态待刷新",
            "当前缺少可信权限事实，无法生成可执行动作。",
            "denial_unavailable",
            "刷新身份和权限事实后重试。",
        ),
    )
    return {
        "title": title,
        "plain_language_explanation": explanation,
        "message_key": f"permissionDenial.pages.{message_key}",
        "severity": "blocked" if state != "denial_unavailable" else "warning",
        "return_path": _string(viewer.get("return_path")) or "/agent-store/agents",
        "empty_state_copy": empty_state,
        "error_state_copy": "权限事实不可用，请刷新后重试。",
        "visible_roles": _visible_roles(scenario),
        "notification_rule": _notification_rule(scenario),
        "audit_required": True,
        "agent_display_name": _string(context.get("agent_display_name")),
    }


def _permission_payload(
    context: Mapping[str, object],
    viewer: Mapping[str, object],
    decision: Mapping[str, object],
) -> dict[str, object]:
    return {
        "permission_decision_id": _string(decision.get("permission_decision_id")),
        "decision": _string(decision.get("decision")) or "deny",
        "denied_scope": _string(context.get("denied_scope"))
        or _string(decision.get("denied_scope")),
        "resource_scope": _string(context.get("resource_scope")),
        "request_id": _string(context.get("request_id")),
        "policy_ref": _string(context.get("policy_ref")),
        "auth_context_id": _string(viewer.get("auth_context_id")),
        "subject_user_id": _string(viewer.get("subject_user_id")),
        "request_access_url": _string(context.get("request_access_url"))
        or _string(decision.get("request_access_url")),
        "raw_trace_url": "",
        "raw_evidence_url": "",
    }


def _actions(
    scenario: str,
    *,
    context: Mapping[str, object],
    viewer: Mapping[str, object],
    enabled: bool,
) -> tuple[ActionDescriptor, ActionDescriptor]:
    if not enabled:
        return (
            ActionDescriptor(
                action_id="refresh_identity",
                target_system="agent_store",
                enabled=True,
                requires_permission=False,
                audit_required=True,
                message_key="permissionDenial.actions.refreshIdentity",
            ),
            ActionDescriptor(
                action_id="return_to_catalog",
                target_system="agent_store",
                enabled=True,
                requires_permission=False,
                audit_required=False,
                href=_string(viewer.get("return_path")) or "/agent-store/agents",
                message_key="permissionDenial.actions.returnToCatalog",
            ),
        )

    action_data = {
        "not_visible": (
            (
                "return_to_catalog",
                "agent_store",
                False,
                False,
                _string(viewer.get("return_path")) or "/agent-store/agents",
            ),
            (
                "request_visibility_access",
                "agent_store",
                True,
                True,
                _string(context.get("request_access_url")),
            ),
        ),
        "visible_not_installable": (
            (
                "request_install_permission",
                "agent_store",
                True,
                True,
                _string(context.get("request_access_url")),
            ),
            (
                "contact_agent_owner",
                "agent_store",
                True,
                True,
                _string(context.get("owner_contact_url")),
            ),
        ),
        "raw_evidence_denied": (
            (
                "request_evidence_access",
                "evidence_vault",
                True,
                True,
                _string(context.get("request_access_url"))
                or "/evidence-vault/access-requests",
            ),
            (
                "return_to_evidence_summary",
                "agent_store",
                False,
                False,
                _string(viewer.get("return_path")) or "/agent-store/agents",
            ),
        ),
        "high_risk_approval_required": (
            (
                "submit_agentops_approval",
                "agentops",
                True,
                True,
                _string(context.get("request_access_url")) or "/agentops/approvals",
            ),
            (
                "view_access_scope",
                "agent_store",
                False,
                True,
                _string(context.get("scope_url")),
            ),
        ),
        "policy_blocked": (
            (
                "view_policy_reason",
                "agentops",
                True,
                True,
                _string(context.get("policy_url")),
            ),
            (
                "view_replacement_agent",
                "agent_store",
                False,
                True,
                _string(context.get("replacement_url")),
            ),
        ),
    }
    primary, secondary = action_data[scenario]
    return _action(primary), _action(secondary)


def _action(data: tuple[str, str, bool, bool, str]) -> ActionDescriptor:
    action_id, target_system, requires_permission, audit_required, href = data
    return ActionDescriptor(
        action_id=action_id,
        target_system=target_system,
        enabled=True,
        requires_permission=requires_permission,
        audit_required=audit_required,
        href=href or None,
        message_key=f"permissionDenial.actions.{action_id}",
    )


def _permission_state(scenario: str, denial_state: str) -> str:
    if denial_state == "denial_unavailable":
        return "permission_unknown"
    return {
        "not_visible": "visibility_denied",
        "visible_not_installable": "install_denied",
        "raw_evidence_denied": "evidence_vault_required",
        "high_risk_approval_required": "approval_required",
        "policy_blocked": "policy_denied",
    }[scenario]


def _visible_roles(scenario: str) -> list[str]:
    return {
        "not_visible": ["requester"],
        "visible_not_installable": ["requester", "owner"],
        "raw_evidence_denied": ["requester", "owner", "agentops_admin"],
        "high_risk_approval_required": ["requester", "owner", "security_iam"],
        "policy_blocked": ["requester", "owner", "security_iam"],
    }.get(scenario, ["requester"])


def _notification_rule(scenario: str) -> str:
    return {
        "not_visible": "audit_only",
        "visible_not_installable": "notify_owner_on_request",
        "raw_evidence_denied": "notify_evidence_vault_on_request",
        "high_risk_approval_required": "notify_agentops_approval_center",
        "policy_blocked": "notify_security_iam_and_owner",
    }.get(scenario, "audit_only")


def _issue(issue_id: str, field_path: str) -> PermissionDenialIssue:
    data = {
        "DENIAL_SCENARIO_UNSUPPORTED": (
            "Permission denial scenario is unsupported.",
            "Store cannot select a governed permission failure page.",
            "refresh_permission_denial_context",
            "permissionDenial.unsupportedScenario",
            "blocked",
        ),
        "TRUSTED_AUTH_CONTEXT_REQUIRED": (
            "Trusted IAM auth context is required.",
            "Store cannot expose permission actions from client-supplied identity.",
            "refresh_identity",
            "permissionDenial.trustedAuthRequired",
            "blocked",
        ),
        "PERMISSION_DECISION_REQUIRED": (
            "Permission decision identity is required.",
            "Store cannot audit the denial action without a decision id.",
            "refresh_permission_decision",
            "permissionDenial.permissionDecisionRequired",
            "warning",
        ),
        "POLICY_REF_REQUIRED": (
            "AgentOps policy_ref is required for policy-blocked pages.",
            "Users cannot inspect the blocking policy reason.",
            "refresh_agentops_policy_echo",
            "permissionDenial.policyRefRequired",
            "blocked",
        ),
        "RAW_PERMISSION_LINK_STRIPPED": (
            "Raw Trace or Evidence URL was supplied and stripped.",
            "Raw evidence access must go through Evidence Vault.",
            "request_evidence_access",
            "permissionDenial.rawLinkStripped",
            "warning",
        ),
    }[issue_id]
    reason, impact, fix_action_id, message_key, severity = data
    return PermissionDenialIssue(
        issue_id=issue_id,
        field_path=field_path,
        severity=severity,
        reason=reason,
        impact=impact,
        fix_action_id=fix_action_id,
        message_key=message_key,
    )
