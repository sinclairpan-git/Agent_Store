from __future__ import annotations

from dataclasses import dataclass
from typing import Mapping

from agent_store import SCHEMA_VERSION

from .actions import ActionDescriptor
from .status_registry import SEVERITIES


LIFECYCLE_GOVERNANCE_SCHEMA_VERSION = "lifecycle_governance_baseline.v1"
LIFECYCLE_ACTIONS = frozenset(
    {"upgrade", "rollback", "deprecate", "disable", "security_revoke"}
)
ACTION_TARGET_STATES = {
    "upgrade": "upgrade_available",
    "rollback": "rollback_available",
    "deprecate": "deprecated",
    "disable": "disabled",
    "security_revoke": "security_revoked",
}
OWNER_ACTIONS = frozenset({"upgrade", "rollback", "deprecate", "disable"})


def _string(value: object) -> str:
    return value.strip() if isinstance(value, str) else ""


def _mapping(value: object) -> Mapping[str, object]:
    return value if isinstance(value, Mapping) else {}


@dataclass(frozen=True)
class LifecycleGovernanceIssue:
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
class LifecycleGovernanceBaseline:
    trace_id: str
    audit_id: str
    agent_id: str
    current_version: str
    lifecycle_state: str
    previous_state: str
    transition_action: str
    actor: dict[str, object]
    version_scope: dict[str, object]
    replacement: dict[str, object]
    rollback: dict[str, object]
    impact_scope: dict[str, object]
    issues: tuple[LifecycleGovernanceIssue, ...]
    source_of_truth: dict[str, str]

    def to_response(self) -> dict[str, object]:
        return {
            "schema_version": SCHEMA_VERSION,
            "trace_id": self.trace_id,
            "error_code": "OK",
            "audit_id": self.audit_id,
            "lifecycle_governance": self.to_dict(),
        }

    def to_dict(self) -> dict[str, object]:
        return {
            "contract_schema_version": LIFECYCLE_GOVERNANCE_SCHEMA_VERSION,
            "agent_id": self.agent_id,
            "current_version": self.current_version,
            "lifecycle_state": self.lifecycle_state,
            "previous_state": self.previous_state,
            "transition_action": self.transition_action,
            "actor": self.actor,
            "version_scope": self.version_scope,
            "replacement": self.replacement,
            "rollback": self.rollback,
            "impact_scope": self.impact_scope,
            "issues": [issue.to_dict() for issue in self.issues],
            "source_of_truth": self.source_of_truth,
            "next_action": self.next_action.to_dict(),
        }

    @property
    def next_action(self) -> ActionDescriptor:
        if self.issues:
            return ActionDescriptor(
                action_id="fix_lifecycle_transition",
                target_system="agent_store",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                message_key="lifecycleGovernance.actions.fixTransition",
            )
        if self.lifecycle_state == "security_revoked":
            return ActionDescriptor(
                action_id="notify_security_revocation",
                target_system="agentops",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                message_key="lifecycleGovernance.actions.notifySecurityRevocation",
            )
        if self.lifecycle_state == "disabled":
            return ActionDescriptor(
                action_id="notify_disabled_version",
                target_system="agentops",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                message_key="lifecycleGovernance.actions.notifyDisabledVersion",
            )
        if self.lifecycle_state in {"upgrade_available", "rollback_available"}:
            return ActionDescriptor(
                action_id="notify_available_replacement",
                target_system="agent_store",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                message_key="lifecycleGovernance.actions.notifyReplacement",
            )
        return ActionDescriptor(
            action_id="notify_lifecycle_change",
            target_system="agent_store",
            enabled=True,
            requires_permission=True,
            audit_required=True,
            message_key="lifecycleGovernance.actions.notifyLifecycleChange",
        )


def build_lifecycle_governance_baseline(
    *,
    current_version: Mapping[str, object],
    transition: Mapping[str, object],
    trace_id: str,
    audit_id: str,
) -> LifecycleGovernanceBaseline:
    action = _string(transition.get("transition_action"))
    previous_state = _string(current_version.get("lifecycle_state")) or "active"
    issues = tuple(_transition_issues(current_version, transition, action))
    lifecycle_state = previous_state if issues else ACTION_TARGET_STATES[action]
    agent_id = _string(current_version.get("agent_id"))
    version = _string(current_version.get("version"))

    return LifecycleGovernanceBaseline(
        trace_id=trace_id,
        audit_id=audit_id,
        agent_id=agent_id,
        current_version=version,
        lifecycle_state=lifecycle_state,
        previous_state=previous_state,
        transition_action=action,
        actor=_actor_snapshot(transition),
        version_scope=_version_scope(current_version),
        replacement=_replacement(transition, action),
        rollback=_rollback(transition, action),
        impact_scope=_impact_scope(transition, action),
        issues=issues,
        source_of_truth={
            "agent_version": "agent_store_agent_version",
            "lifecycle_decision": "agent_store_lifecycle_governance",
            "replacement": "agent_store_replacement_mapping",
            "impact_scope": "agent_store_installation_inventory",
            "agentops_notification": "agent_store_notification_queue",
        },
    )


def _transition_issues(
    current_version: Mapping[str, object],
    transition: Mapping[str, object],
    action: str,
) -> list[LifecycleGovernanceIssue]:
    issues: list[LifecycleGovernanceIssue] = []
    if action not in LIFECYCLE_ACTIONS:
        issues.append(
            _issue("LIFECYCLE_ACTION_UNSUPPORTED", "transition.transition_action")
        )
    if not _string(current_version.get("agent_id")):
        issues.append(
            _issue("AGENT_VERSION_IDENTITY_REQUIRED", "current_version.agent_id")
        )
    if not _string(current_version.get("version")):
        issues.append(
            _issue("AGENT_VERSION_IDENTITY_REQUIRED", "current_version.version")
        )
    if not _string(transition.get("actor_id")):
        issues.append(_issue("ACTOR_REQUIRED", "transition.actor_id"))
    if not _string(transition.get("reason")):
        issues.append(_issue("LIFECYCLE_REASON_REQUIRED", "transition.reason"))
    if action in OWNER_ACTIONS and _string(transition.get("actor_role")) != "owner":
        issues.append(_issue("OWNER_APPROVAL_REQUIRED", "transition.actor_role"))
    if (
        action == "security_revoke"
        and _string(transition.get("actor_role")) != "security"
    ):
        issues.append(_issue("SECURITY_ACTOR_REQUIRED", "transition.actor_role"))
    if action == "security_revoke" and not _evidence_ref(transition):
        issues.append(
            _issue("SECURITY_EVIDENCE_REQUIRED", "transition.security_evidence_ref")
        )
    if action in {"upgrade", "deprecate"} and not _replacement_version(transition):
        issues.append(
            _issue("REPLACEMENT_VERSION_REQUIRED", "transition.replacement_version")
        )
    if action == "rollback" and not _string(transition.get("rollback_version")):
        issues.append(
            _issue("ROLLBACK_VERSION_REQUIRED", "transition.rollback_version")
        )
    if action in {"disable", "security_revoke"} and not _has_impact_count(transition):
        issues.append(
            _issue("IMPACT_SCOPE_REQUIRED", "transition.affected_installation_count")
        )
    previous_state = _string(current_version.get("lifecycle_state")) or "active"
    if previous_state == "security_revoked" and action != "security_revoke":
        issues.append(
            _issue("SECURITY_REVOKED_TERMINAL", "current_version.lifecycle_state")
        )
    return issues


def _issue(issue_id: str, field_path: str) -> LifecycleGovernanceIssue:
    data = {
        "LIFECYCLE_ACTION_UNSUPPORTED": (
            "Unsupported lifecycle transition action.",
            "Store cannot emit ambiguous lifecycle governance changes.",
            "choose_supported_lifecycle_action",
            "lifecycleGovernance.actionUnsupported",
        ),
        "AGENT_VERSION_IDENTITY_REQUIRED": (
            "Agent version identity is required.",
            "Lifecycle changes must bind to a stable Agent version.",
            "attach_agent_version_identity",
            "lifecycleGovernance.identityRequired",
        ),
        "ACTOR_REQUIRED": (
            "Actor id is required.",
            "Lifecycle decisions must be attributable.",
            "attach_actor",
            "lifecycleGovernance.actorRequired",
        ),
        "LIFECYCLE_REASON_REQUIRED": (
            "Lifecycle transition reason is required.",
            "Owners and consumers need an explainable governance decision.",
            "attach_lifecycle_reason",
            "lifecycleGovernance.reasonRequired",
        ),
        "OWNER_APPROVAL_REQUIRED": (
            "Owner role is required for non-security lifecycle actions.",
            "Store must not let non-owners upgrade, roll back, deprecate, or disable versions.",
            "request_owner_approval",
            "lifecycleGovernance.ownerApprovalRequired",
        ),
        "SECURITY_ACTOR_REQUIRED": (
            "Security role is required for security revocation.",
            "Security revocation must be controlled by the security authority.",
            "request_security_review",
            "lifecycleGovernance.securityActorRequired",
        ),
        "SECURITY_EVIDENCE_REQUIRED": (
            "Security revocation requires evidence or incident reference.",
            "Consumers need a concrete security basis for terminal revocation.",
            "attach_security_evidence",
            "lifecycleGovernance.securityEvidenceRequired",
        ),
        "REPLACEMENT_VERSION_REQUIRED": (
            "Replacement version is required.",
            "Users and installations need a concrete alternative version.",
            "attach_replacement_version",
            "lifecycleGovernance.replacementRequired",
        ),
        "ROLLBACK_VERSION_REQUIRED": (
            "Rollback version is required.",
            "Rollback must point to a concrete previous version.",
            "attach_rollback_version",
            "lifecycleGovernance.rollbackRequired",
        ),
        "IMPACT_SCOPE_REQUIRED": (
            "Affected installation count is required.",
            "Disable and security revoke decisions must disclose blast radius.",
            "attach_impact_scope",
            "lifecycleGovernance.impactScopeRequired",
        ),
        "SECURITY_REVOKED_TERMINAL": (
            "security_revoked is a terminal lifecycle state.",
            "The strongest security signal must not be downgraded.",
            "open_security_review",
            "lifecycleGovernance.securityRevokedTerminal",
        ),
    }[issue_id]
    reason, impact, fix_action_id, message_key = data
    return LifecycleGovernanceIssue(
        issue_id=issue_id,
        field_path=field_path,
        severity="blocked",
        reason=reason,
        impact=impact,
        fix_action_id=fix_action_id,
        message_key=message_key,
    )


def _actor_snapshot(transition: Mapping[str, object]) -> dict[str, object]:
    return {
        "actor_id": _string(transition.get("actor_id")),
        "actor_role": _string(transition.get("actor_role")),
        "reason": _string(transition.get("reason")),
        "evidence_ref": _evidence_ref(transition),
    }


def _version_scope(current_version: Mapping[str, object]) -> dict[str, object]:
    return {
        "agent_id": _string(current_version.get("agent_id")),
        "version": _string(current_version.get("version")),
        "artifact_hash": _string(current_version.get("artifact_hash")),
        "release_status": _string(current_version.get("release_status")),
        "lifecycle_state": _string(current_version.get("lifecycle_state")) or "active",
    }


def _replacement(transition: Mapping[str, object], action: str) -> dict[str, object]:
    version = _replacement_version(transition)
    return {
        "required": action in {"upgrade", "deprecate"},
        "replacement_version": version,
        "replacement_reason": _string(transition.get("replacement_reason")),
    }


def _rollback(transition: Mapping[str, object], action: str) -> dict[str, object]:
    return {
        "required": action == "rollback",
        "rollback_version": _string(transition.get("rollback_version")),
        "rollback_reason": _string(transition.get("rollback_reason")),
    }


def _impact_scope(transition: Mapping[str, object], action: str) -> dict[str, object]:
    affected = _impact_count(transition)
    return {
        "impact_required": action in {"disable", "security_revoke"},
        "affected_installation_count": affected,
        "affected_user_count": _int_value(transition.get("affected_user_count")),
        "replacement_available": bool(
            _replacement_version(transition)
            or _string(transition.get("rollback_version"))
        ),
        "notification_required": action in LIFECYCLE_ACTIONS,
    }


def _replacement_version(transition: Mapping[str, object]) -> str:
    return _string(transition.get("replacement_version")) or _string(
        transition.get("target_version")
    )


def _impact_count(transition: Mapping[str, object]) -> int:
    return _int_value(transition.get("affected_installation_count"))


def _has_impact_count(transition: Mapping[str, object]) -> bool:
    value = transition.get("affected_installation_count")
    return type(value) is int and value >= 0


def _int_value(value: object) -> int:
    return value if type(value) is int and value >= 0 else 0


def _evidence_ref(transition: Mapping[str, object]) -> str:
    return (
        _string(transition.get("security_evidence_ref"))
        or _string(transition.get("evidence_ref"))
        or _string(transition.get("incident_id"))
    )
