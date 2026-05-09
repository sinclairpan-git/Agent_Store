from __future__ import annotations

from dataclasses import dataclass
from typing import Mapping

from agent_store import SCHEMA_VERSION

from .actions import ActionDescriptor
from .status_registry import SEVERITIES


POLICY_APPROVAL_REQUEST_SCHEMA_VERSION = "policy_approval_request.v1"
SUPPORTED_REQUEST_ACTIONS = frozenset(
    {"install_agent", "publish_agent", "upgrade_agent", "enable_agent"}
)
REQUESTER_ROLES = frozenset({"owner", "security", "agentops_admin"})


def _string(value: object) -> str:
    return value.strip() if isinstance(value, str) else ""


def _mapping(value: object) -> Mapping[str, object]:
    return value if isinstance(value, Mapping) else {}


@dataclass(frozen=True)
class PolicyApprovalRequestIssue:
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
class PolicyApprovalRequest:
    trace_id: str
    audit_id: str
    agent_id: str
    agent_version: str
    requested_action: str
    requester: dict[str, str]
    policy_context: dict[str, object]
    justification: str
    request_state: str
    agentops_request: dict[str, object]
    issues: tuple[PolicyApprovalRequestIssue, ...]
    source_of_truth: dict[str, str]

    def to_response(self) -> dict[str, object]:
        return {
            "schema_version": SCHEMA_VERSION,
            "trace_id": self.trace_id,
            "error_code": "OK",
            "audit_id": self.audit_id,
            "policy_approval_request": self.to_dict(),
        }

    def to_dict(self) -> dict[str, object]:
        return {
            "contract_schema_version": POLICY_APPROVAL_REQUEST_SCHEMA_VERSION,
            "agent_id": self.agent_id,
            "agent_version": self.agent_version,
            "requested_action": self.requested_action,
            "request_state": self.request_state,
            "requester": self.requester,
            "policy_context": self.policy_context,
            "justification": self.justification,
            "agentops_request": self.agentops_request,
            "store_projection": {
                "store_decision_authority": "none",
                "store_override_allowed": False,
                "capability_grant_issued": False,
                "agentops_approval_required": True,
                "dispatch_allowed": self.request_state == "approval_request_ready",
            },
            "issues": [issue.to_dict() for issue in self.issues],
            "source_of_truth": self.source_of_truth,
            "next_action": self.next_action.to_dict(),
        }

    @property
    def next_action(self) -> ActionDescriptor:
        if self.request_state == "approval_request_ready":
            return ActionDescriptor(
                action_id="submit_agentops_approval_request",
                target_system="agentops",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                message_key="policyApprovalRequest.actions.submitAgentOpsRequest",
            )
        if self.request_state == "policy_context_incomplete":
            return ActionDescriptor(
                action_id="complete_policy_context",
                target_system="agent_store",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                message_key="policyApprovalRequest.actions.completePolicyContext",
            )
        if self.request_state == "justification_required":
            return ActionDescriptor(
                action_id="add_approval_justification",
                target_system="agent_store",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                message_key="policyApprovalRequest.actions.addJustification",
            )
        return ActionDescriptor(
            action_id="assign_authorized_requester",
            target_system="agent_store",
            enabled=True,
            requires_permission=True,
            audit_required=True,
            message_key="policyApprovalRequest.actions.assignRequester",
        )


def build_policy_approval_request(
    *,
    agent_id: str,
    agent_version: str,
    requested_action: str,
    requester: Mapping[str, object],
    policy_context: Mapping[str, object],
    justification: str,
    trace_id: str,
    audit_id: str,
) -> PolicyApprovalRequest:
    requester_snapshot = _requester_snapshot(requester)
    policy_context_snapshot = _policy_context_snapshot(policy_context)
    issues = tuple(
        _identity_issues(agent_id, agent_version, requested_action)
        + _requester_issues(requester_snapshot)
        + _policy_context_issues(policy_context_snapshot)
        + _justification_issues(justification)
    )
    state = _request_state(issues)

    return PolicyApprovalRequest(
        trace_id=trace_id,
        audit_id=audit_id,
        agent_id=agent_id,
        agent_version=agent_version,
        requested_action=requested_action,
        requester=requester_snapshot,
        policy_context=policy_context_snapshot,
        justification=justification,
        request_state=state,
        agentops_request=_agentops_request(
            agent_id=agent_id,
            agent_version=agent_version,
            requested_action=requested_action,
            requester=requester_snapshot,
            policy_context=policy_context_snapshot,
            justification=justification,
            audit_id=audit_id,
            dispatch_allowed=state == "approval_request_ready",
        ),
        issues=issues,
        source_of_truth={
            "approval_request": "agent_store",
            "policy_decision": "agentops",
            "approval": "agentops",
            "capability_grant": "agentops_not_issued_by_store",
            "request_audit": "agent_store",
        },
    )


def _requester_snapshot(requester: Mapping[str, object]) -> dict[str, str]:
    return {
        "actor_id": _string(requester.get("actor_id")),
        "actor_role": _string(requester.get("actor_role")),
        "tenant_id": _string(requester.get("tenant_id")),
    }


def _policy_context_snapshot(policy_context: Mapping[str, object]) -> dict[str, object]:
    return {
        "policy_ref": _string(policy_context.get("policy_ref")),
        "risk_level": _string(policy_context.get("risk_level")),
        "runtime_contract_version": _string(
            policy_context.get("runtime_contract_version")
        ),
        "permission_intents": _string_list(policy_context.get("permission_intents")),
        "data_scopes": _string_list(policy_context.get("data_scopes")),
    }


def _string_list(value: object) -> list[str]:
    if not isinstance(value, list):
        return []
    return [item.strip() for item in value if isinstance(item, str) and item.strip()]


def _identity_issues(
    agent_id: str, agent_version: str, requested_action: str
) -> list[PolicyApprovalRequestIssue]:
    issues: list[PolicyApprovalRequestIssue] = []
    if not agent_id or not agent_version:
        issues.append(
            PolicyApprovalRequestIssue(
                issue_id="AGENT_VERSION_IDENTITY_REQUIRED",
                field_path="agent_id",
                severity="blocked",
                reason="Agent identity and version are required for approval requests.",
                impact="AgentOps cannot bind the approval request to an Agent version.",
                fix_action_id="attach_agent_identity",
                message_key="policyApprovalRequest.agentIdentityRequired",
            )
        )
    if requested_action not in SUPPORTED_REQUEST_ACTIONS:
        issues.append(
            PolicyApprovalRequestIssue(
                issue_id="REQUESTED_ACTION_UNSUPPORTED",
                field_path="requested_action",
                severity="blocked",
                reason="Requested approval action is not supported.",
                impact="Store must not send ambiguous approval requests to AgentOps.",
                fix_action_id="select_supported_action",
                message_key="policyApprovalRequest.requestedActionUnsupported",
            )
        )
    return issues


def _requester_issues(
    requester: Mapping[str, str],
) -> list[PolicyApprovalRequestIssue]:
    if not requester["actor_id"] or not requester["actor_role"]:
        return [
            PolicyApprovalRequestIssue(
                issue_id="REQUESTER_REQUIRED",
                field_path="requester",
                severity="blocked",
                reason="Approval requester must be attributable.",
                impact="AgentOps cannot audit an anonymous approval request.",
                fix_action_id="assign_authorized_requester",
                message_key="policyApprovalRequest.requesterRequired",
            )
        ]
    if requester["actor_role"] not in REQUESTER_ROLES:
        return [
            PolicyApprovalRequestIssue(
                issue_id="REQUESTER_ROLE_UNAUTHORIZED",
                field_path="requester.actor_role",
                severity="blocked",
                reason="Requester role is not allowed to initiate approval requests.",
                impact="Store must not let unauthorized actors request AgentOps approvals.",
                fix_action_id="assign_authorized_requester",
                message_key="policyApprovalRequest.requesterUnauthorized",
            )
        ]
    return []


def _policy_context_issues(
    policy_context: Mapping[str, object],
) -> list[PolicyApprovalRequestIssue]:
    missing = [
        field
        for field in (
            "policy_ref",
            "risk_level",
            "runtime_contract_version",
        )
        if not _string(policy_context.get(field))
    ]
    if not policy_context.get("permission_intents"):
        missing.append("permission_intents")
    if missing:
        return [
            PolicyApprovalRequestIssue(
                issue_id="POLICY_CONTEXT_INCOMPLETE",
                field_path="policy_context",
                severity="blocked",
                reason="Approval request is missing policy context.",
                impact="AgentOps cannot evaluate the request without policy and runtime context.",
                fix_action_id="complete_policy_context",
                message_key="policyApprovalRequest.policyContextIncomplete",
            )
        ]
    return []


def _justification_issues(justification: str) -> list[PolicyApprovalRequestIssue]:
    if justification.strip():
        return []
    return [
        PolicyApprovalRequestIssue(
            issue_id="JUSTIFICATION_REQUIRED",
            field_path="justification",
            severity="blocked",
            reason="Approval request requires an auditable justification.",
            impact="AgentOps reviewers cannot assess the business reason.",
            fix_action_id="add_approval_justification",
            message_key="policyApprovalRequest.justificationRequired",
        )
    ]


def _request_state(issues: tuple[PolicyApprovalRequestIssue, ...]) -> str:
    issue_ids = {issue.issue_id for issue in issues}
    if issue_ids & {"REQUESTER_REQUIRED", "REQUESTER_ROLE_UNAUTHORIZED"}:
        return "requester_required"
    if "POLICY_CONTEXT_INCOMPLETE" in issue_ids:
        return "policy_context_incomplete"
    if "JUSTIFICATION_REQUIRED" in issue_ids:
        return "justification_required"
    if issue_ids:
        return "approval_request_blocked"
    return "approval_request_ready"


def _agentops_request(
    *,
    agent_id: str,
    agent_version: str,
    requested_action: str,
    requester: Mapping[str, str],
    policy_context: Mapping[str, object],
    justification: str,
    audit_id: str,
    dispatch_allowed: bool,
) -> dict[str, object]:
    return {
        "target_system": "agentops",
        "request_contract": POLICY_APPROVAL_REQUEST_SCHEMA_VERSION,
        "agent_id": agent_id,
        "agent_version": agent_version,
        "requested_action": requested_action,
        "requester": dict(requester),
        "policy_context": dict(policy_context),
        "justification": justification,
        "store_audit_id": audit_id,
        "dispatch_allowed": dispatch_allowed,
    }
