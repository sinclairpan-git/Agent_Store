from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Mapping

from agent_store import SCHEMA_VERSION

from .actions import ActionDescriptor
from .models import utc_now
from .status_registry import SEVERITIES


POLICY_APPROVAL_ECHO_SCHEMA_VERSION = "policy_approval_echo.v1"
POLICY_DECISIONS = frozenset({"allow", "deny", "approval_required"})
APPROVAL_STATUSES = frozenset(
    {"not_required", "pending", "approved", "rejected", "expired", "revoked"}
)


def _string(value: object) -> str:
    return value.strip() if isinstance(value, str) else ""


def _mapping(value: object) -> Mapping[str, object]:
    return value if isinstance(value, Mapping) else {}


@dataclass(frozen=True)
class PolicyApprovalEchoIssue:
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
class PolicyApprovalEcho:
    trace_id: str
    audit_id: str
    agent_id: str
    agent_version: str
    echo_state: str
    policy_decision: dict[str, object]
    approval_summary: dict[str, object]
    store_projection: dict[str, object]
    issues: tuple[PolicyApprovalEchoIssue, ...]
    source_of_truth: dict[str, str]

    def to_response(self) -> dict[str, object]:
        return {
            "schema_version": SCHEMA_VERSION,
            "trace_id": self.trace_id,
            "error_code": "OK",
            "audit_id": self.audit_id,
            "policy_approval_echo": self.to_dict(),
        }

    def to_dict(self) -> dict[str, object]:
        return {
            "contract_schema_version": POLICY_APPROVAL_ECHO_SCHEMA_VERSION,
            "agent_id": self.agent_id,
            "agent_version": self.agent_version,
            "echo_state": self.echo_state,
            "policy_decision": self.policy_decision,
            "approval_summary": self.approval_summary,
            "store_projection": self.store_projection,
            "issues": [issue.to_dict() for issue in self.issues],
            "source_of_truth": self.source_of_truth,
            "next_action": self.next_action.to_dict(),
        }

    @property
    def next_action(self) -> ActionDescriptor:
        if self.echo_state == "policy_allowed":
            return ActionDescriptor(
                action_id="continue_store_flow",
                target_system="agent_store",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                message_key="policyApproval.actions.continueStoreFlow",
            )
        if self.echo_state == "approval_pending":
            return ActionDescriptor(
                action_id="view_agentops_approval",
                target_system="agentops",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                message_key="policyApproval.actions.viewAgentOpsApproval",
            )
        if self.echo_state == "approval_expired":
            return ActionDescriptor(
                action_id="request_approval_refresh",
                target_system="agentops",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                message_key="policyApproval.actions.requestApprovalRefresh",
            )
        if self.echo_state == "policy_denied":
            return ActionDescriptor(
                action_id="view_blocking_policy",
                target_system="agentops",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                message_key="policyApproval.actions.viewBlockingPolicy",
            )
        return ActionDescriptor(
            action_id="refresh_agentops_policy_echo",
            target_system="agentops",
            enabled=True,
            requires_permission=True,
            audit_required=True,
            message_key="policyApproval.actions.refreshAgentOpsPolicyEcho",
        )


def build_policy_approval_echo(
    *,
    agent_id: str,
    agent_version: str,
    agentops_policy_echo: Mapping[str, object],
    trace_id: str,
    audit_id: str,
    now: datetime | None = None,
) -> PolicyApprovalEcho:
    now = now or utc_now()
    policy = _mapping(agentops_policy_echo.get("policy_decision"))
    approval = _mapping(agentops_policy_echo.get("approval"))
    issues = tuple(_policy_issues(policy) + _approval_issues(approval, now))
    echo_state = _echo_state(policy, approval, issues, now)
    decision = _string(policy.get("decision"))

    return PolicyApprovalEcho(
        trace_id=trace_id,
        audit_id=audit_id,
        agent_id=agent_id,
        agent_version=agent_version,
        echo_state=echo_state,
        policy_decision=_policy_decision_snapshot(policy),
        approval_summary=_approval_summary_snapshot(approval, now),
        store_projection=_store_projection(echo_state, decision),
        issues=issues,
        source_of_truth={
            "policy_decision": "agentops",
            "approval": "agentops",
            "capability_grant": "agentops_not_issued_by_store",
            "store_projection": "agent_store_echo_only",
        },
    )


def _policy_issues(policy: Mapping[str, object]) -> tuple[PolicyApprovalEchoIssue, ...]:
    decision = _string(policy.get("decision"))
    required_fields = (
        "policy_decision_id",
        "decision",
        "policy_ref",
        "evaluated_at",
    )
    missing = [field for field in required_fields if not _string(policy.get(field))]
    issues: list[PolicyApprovalEchoIssue] = []
    if missing:
        issues.append(
            PolicyApprovalEchoIssue(
                issue_id="AGENTOPS_POLICY_ECHO_INCOMPLETE",
                field_path="agentops_policy_echo.policy_decision",
                severity="blocked",
                reason="AgentOps policy echo is missing required policy fields.",
                impact="Store cannot display or route a policy decision without an AgentOps-owned echo.",
                fix_action_id="refresh_agentops_policy_echo",
                message_key="policyApproval.policyEchoIncomplete",
            )
        )
    if decision and decision not in POLICY_DECISIONS:
        issues.append(
            PolicyApprovalEchoIssue(
                issue_id="AGENTOPS_POLICY_DECISION_UNSUPPORTED",
                field_path="agentops_policy_echo.policy_decision.decision",
                severity="blocked",
                reason="AgentOps policy decision is not supported by this Store contract.",
                impact="Store must not reinterpret unknown AgentOps decisions.",
                fix_action_id="refresh_agentops_policy_echo",
                message_key="policyApproval.policyDecisionUnsupported",
            )
        )
    return tuple(issues)


def _approval_issues(
    approval: Mapping[str, object],
    now: datetime,
) -> tuple[PolicyApprovalEchoIssue, ...]:
    status = _string(approval.get("status")) or "not_required"
    if status and status not in APPROVAL_STATUSES:
        return (
            PolicyApprovalEchoIssue(
                issue_id="AGENTOPS_APPROVAL_STATUS_UNSUPPORTED",
                field_path="agentops_policy_echo.approval.status",
                severity="blocked",
                reason="AgentOps approval status is not supported by this Store contract.",
                impact="Store must not reinterpret unknown AgentOps approval states.",
                fix_action_id="refresh_agentops_policy_echo",
                message_key="policyApproval.approvalStatusUnsupported",
            ),
        )
    expires_at = _parse_datetime(approval.get("expires_at"))
    if expires_at is not None and expires_at <= now:
        return (
            PolicyApprovalEchoIssue(
                issue_id="AGENTOPS_APPROVAL_EXPIRED",
                field_path="agentops_policy_echo.approval.expires_at",
                severity="warning",
                reason="AgentOps approval echo is past its valid window.",
                impact="Store must request a fresh AgentOps approval echo before continuing.",
                fix_action_id="request_approval_refresh",
                message_key="policyApproval.approvalExpired",
            ),
        )
    return ()


def _echo_state(
    policy: Mapping[str, object],
    approval: Mapping[str, object],
    issues: tuple[PolicyApprovalEchoIssue, ...],
    now: datetime,
) -> str:
    issue_ids = {issue.issue_id for issue in issues}
    if issue_ids - {"AGENTOPS_APPROVAL_EXPIRED"}:
        return "agentops_echo_unavailable"
    if "AGENTOPS_APPROVAL_EXPIRED" in issue_ids:
        return "approval_expired"
    decision = _string(policy.get("decision"))
    status = _approval_status(approval, now)
    if decision == "deny" or status in {"rejected", "revoked"}:
        return "policy_denied"
    if decision == "approval_required" or status == "pending":
        return "approval_pending"
    if decision == "allow" and status in {"not_required", "approved"}:
        return "policy_allowed"
    return "agentops_echo_unavailable"


def _policy_decision_snapshot(policy: Mapping[str, object]) -> dict[str, object]:
    return {
        "policy_decision_id": _string(policy.get("policy_decision_id")),
        "decision": _string(policy.get("decision")),
        "policy_ref": _string(policy.get("policy_ref")),
        "reason_code": _string(policy.get("reason_code")),
        "evaluated_at": _string(policy.get("evaluated_at")),
        "valid_until": _string(policy.get("valid_until")),
        "agentops_trace_id": _string(policy.get("trace_id")),
        "agentops_audit_id": _string(policy.get("audit_id")),
    }


def _approval_summary_snapshot(
    approval: Mapping[str, object],
    now: datetime,
) -> dict[str, object]:
    return {
        "approval_id": _string(approval.get("approval_id")),
        "status": _approval_status(approval, now),
        "decision": _string(approval.get("decision")),
        "expires_at": _string(approval.get("expires_at")),
        "request_access_url": _string(approval.get("request_access_url")),
        "agentops_audit_id": _string(approval.get("audit_id")),
    }


def _store_projection(echo_state: str, decision: str) -> dict[str, object]:
    return {
        "projection_mode": "agentops_echo_only",
        "store_decision_authority": "none",
        "agentops_decision": decision,
        "store_override_allowed": False,
        "capability_grant_issued": False,
        "store_may_continue": echo_state == "policy_allowed",
        "store_block_reason": "" if echo_state == "policy_allowed" else echo_state,
    }


def _approval_status(approval: Mapping[str, object], now: datetime) -> str:
    status = _string(approval.get("status")) or "not_required"
    expires_at = _parse_datetime(approval.get("expires_at"))
    if expires_at is not None and expires_at <= now:
        return "expired"
    return status


def _parse_datetime(value: object) -> datetime | None:
    raw = _string(value)
    if not raw:
        return None
    parsed = datetime.fromisoformat(raw.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=UTC)
    return parsed
