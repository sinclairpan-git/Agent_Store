from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
from typing import Mapping, Sequence

from agent_store import SCHEMA_VERSION

from .actions import ActionDescriptor
from .installation import DEVICE_OS_VALUES, ENTERPRISE_STATES, INSTALLATION_STATUSES
from .status_registry import SEVERITIES


INSTALLATION_DISTRIBUTION_SCHEMA_VERSION = "installation_distribution_summary.v1"


def _string(value: object) -> str:
    return value.strip() if isinstance(value, str) else ""


def _bool(value: object) -> bool:
    return value is True


@dataclass(frozen=True)
class InstallationDistributionIssue:
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
class InstallationDistributionSummary:
    trace_id: str
    audit_id: str
    agent_id: str
    requested_version: str
    distribution_state: str
    permission_state: str
    total_installations: int
    active_installations: int
    revoked_installations: int
    failed_installations: int
    status_counts: dict[str, int]
    os_counts: dict[str, int]
    version_counts: dict[str, int]
    enterprise_state_counts: dict[str, int]
    notification: dict[str, object]
    privacy: dict[str, object]
    issues: tuple[InstallationDistributionIssue, ...]
    source_of_truth: dict[str, str]

    def to_response(self) -> dict[str, object]:
        return {
            "schema_version": SCHEMA_VERSION,
            "trace_id": self.trace_id,
            "error_code": "OK",
            "audit_id": self.audit_id,
            "installation_distribution_summary": self.to_dict(),
        }

    def to_dict(self) -> dict[str, object]:
        return {
            "contract_schema_version": INSTALLATION_DISTRIBUTION_SCHEMA_VERSION,
            "agent_id": self.agent_id,
            "requested_version": self.requested_version,
            "distribution_state": self.distribution_state,
            "permission_state": self.permission_state,
            "total_installations": self.total_installations,
            "active_installations": self.active_installations,
            "revoked_installations": self.revoked_installations,
            "failed_installations": self.failed_installations,
            "status_counts": self.status_counts,
            "os_counts": self.os_counts,
            "version_counts": self.version_counts,
            "enterprise_state_counts": self.enterprise_state_counts,
            "notification": self.notification,
            "privacy": self.privacy,
            "issues": [issue.to_dict() for issue in self.issues],
            "source_of_truth": self.source_of_truth,
            "next_action": self.next_action.to_dict(),
        }

    @property
    def next_action(self) -> ActionDescriptor:
        if self.permission_state == "permission_required":
            return ActionDescriptor(
                action_id="request_owner_distribution_permission",
                target_system="agent_store",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                message_key="installationDistribution.actions.requestPermission",
            )
        if self.distribution_state == "distribution_unavailable":
            return ActionDescriptor(
                action_id="refresh_installation_inventory",
                target_system="agent_store",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                message_key="installationDistribution.actions.refreshInventory",
            )
        if _bool(self.notification.get("notification_required")):
            return ActionDescriptor(
                action_id="prepare_owner_notification",
                target_system="agent_store",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                message_key="installationDistribution.actions.prepareNotification",
            )
        return ActionDescriptor(
            action_id="continue_owner_distribution_review",
            target_system="agent_store",
            enabled=True,
            requires_permission=True,
            audit_required=True,
            message_key="installationDistribution.actions.continueReview",
        )


def build_installation_distribution_summary(
    *,
    agent_id: str,
    requested_version: str = "",
    installation_facts: Sequence[Mapping[str, object]] | None = None,
    viewer_context: Mapping[str, object] | None = None,
    trace_id: str,
    audit_id: str,
) -> InstallationDistributionSummary:
    viewer = viewer_context if isinstance(viewer_context, Mapping) else {}
    can_view = _bool(viewer.get("can_view_installation_distribution"))
    facts = tuple(
        fact for fact in (installation_facts or ()) if isinstance(fact, Mapping)
    )
    issue_list = _issues(
        facts,
        agent_id=agent_id,
        requested_version=requested_version,
        can_view=can_view,
    )
    usable_facts = tuple(
        fact
        for fact in facts
        if _string(fact.get("agent_id")) == agent_id
        and (
            not requested_version
            or _string(fact.get("agent_version")) == requested_version
        )
    )

    if not can_view:
        state = "permission_required"
        permission_state = "permission_required"
        usable_facts = ()
    elif not facts:
        state = "distribution_unavailable"
        permission_state = "allowed"
    elif not usable_facts:
        state = "empty_distribution"
        permission_state = "allowed"
    else:
        state = "distribution_ready"
        permission_state = "allowed"

    status_counts = _count_known(usable_facts, "status", INSTALLATION_STATUSES)
    os_counts = _count_known(usable_facts, "device_os", DEVICE_OS_VALUES)
    version_counts = _count_values(usable_facts, "agent_version")
    enterprise_state_counts = _count_known(
        usable_facts,
        "enterprise_state",
        ENTERPRISE_STATES,
    )
    active = status_counts.get("activation_required", 0) + status_counts.get(
        "reporter_pending",
        0,
    )
    revoked = status_counts.get("revoked", 0)
    failed = status_counts.get("failed", 0)

    return InstallationDistributionSummary(
        trace_id=trace_id,
        audit_id=audit_id,
        agent_id=agent_id,
        requested_version=requested_version,
        distribution_state=state,
        permission_state=permission_state,
        total_installations=len(usable_facts),
        active_installations=active,
        revoked_installations=revoked,
        failed_installations=failed,
        status_counts=status_counts,
        os_counts=os_counts,
        version_counts=version_counts,
        enterprise_state_counts=enterprise_state_counts,
        notification=_notification(
            total=len(usable_facts),
            revoked=revoked,
            failed=failed,
            requested_version=requested_version,
        ),
        privacy={
            "individual_users_exposed": False,
            "device_ids_exposed": False,
            "minimum_role": "owner",
            "aggregation_only": True,
        },
        issues=tuple(issue_list),
        source_of_truth={
            "installation_inventory": "agent_store",
            "device_binding": "agent_store",
            "permission": "agent_store_viewer_context",
            "quality": "agentops_not_computed_here",
            "projection": "agent_store",
        },
    )


def _count_known(
    facts: Sequence[Mapping[str, object]],
    field: str,
    allowed: frozenset[str],
) -> dict[str, int]:
    counter = Counter(
        value for fact in facts if (value := _string(fact.get(field))) in allowed
    )
    return {key: counter[key] for key in sorted(counter)}


def _count_values(
    facts: Sequence[Mapping[str, object]],
    field: str,
) -> dict[str, int]:
    counter = Counter(value for fact in facts if (value := _string(fact.get(field))))
    return {key: counter[key] for key in sorted(counter)}


def _notification(
    *,
    total: int,
    revoked: int,
    failed: int,
    requested_version: str,
) -> dict[str, object]:
    impacted = revoked + failed
    return {
        "notification_required": impacted > 0,
        "affected_installation_count": impacted,
        "reason_code": "attention_required" if impacted > 0 else "none",
        "target_version": requested_version,
    }


def _issues(
    facts: Sequence[Mapping[str, object]],
    *,
    agent_id: str,
    requested_version: str,
    can_view: bool,
) -> list[InstallationDistributionIssue]:
    issues: list[InstallationDistributionIssue] = []
    if not can_view:
        issues.append(
            _issue("OWNER_DISTRIBUTION_PERMISSION_REQUIRED", "viewer_context")
        )
    if not facts:
        issues.append(_issue("INSTALLATION_INVENTORY_REQUIRED", "installation_facts"))
    for index, fact in enumerate(facts):
        if _string(fact.get("user")) or _string(fact.get("device_id")):
            issues.append(
                _issue(
                    "INDIVIDUAL_IDENTIFIERS_STRIPPED",
                    f"installation_facts[{index}]",
                )
            )
            break
    if facts and not any(_string(fact.get("agent_id")) == agent_id for fact in facts):
        issues.append(_issue("AGENT_INSTALLATION_SCOPE_EMPTY", "installation_facts"))
    if (
        requested_version
        and facts
        and not any(
            _string(fact.get("agent_version")) == requested_version
            and _string(fact.get("agent_id")) == agent_id
            for fact in facts
        )
    ):
        issues.append(_issue("VERSION_INSTALLATION_SCOPE_EMPTY", "requested_version"))
    return issues


def _issue(issue_id: str, field_path: str) -> InstallationDistributionIssue:
    data = {
        "OWNER_DISTRIBUTION_PERMISSION_REQUIRED": (
            "Viewer lacks permission to inspect installation distribution.",
            "Owner installation distribution must not be exposed to unauthorized viewers.",
            "request_owner_distribution_permission",
            "installationDistribution.permissionRequired",
            "blocked",
        ),
        "INSTALLATION_INVENTORY_REQUIRED": (
            "Installation inventory is required to compute distribution.",
            "Store cannot show installation trends without Store-owned inventory facts.",
            "refresh_installation_inventory",
            "installationDistribution.inventoryRequired",
            "blocked",
        ),
        "INDIVIDUAL_IDENTIFIERS_STRIPPED": (
            "Individual user or device identifiers were provided and stripped.",
            "Owner distribution only exposes aggregate counts.",
            "strip_individual_installation_identifiers",
            "installationDistribution.identifiersStripped",
            "warning",
        ),
        "AGENT_INSTALLATION_SCOPE_EMPTY": (
            "No installation facts match the requested Agent.",
            "Owner distribution would be misleading for this Agent scope.",
            "select_agent_with_installations",
            "installationDistribution.agentScopeEmpty",
            "warning",
        ),
        "VERSION_INSTALLATION_SCOPE_EMPTY": (
            "No installation facts match the requested Agent version.",
            "Owner distribution would be misleading for this version scope.",
            "select_version_with_installations",
            "installationDistribution.versionScopeEmpty",
            "warning",
        ),
    }[issue_id]
    reason, impact, fix_action_id, message_key, severity = data
    return InstallationDistributionIssue(
        issue_id=issue_id,
        field_path=field_path,
        severity=severity,
        reason=reason,
        impact=impact,
        fix_action_id=fix_action_id,
        message_key=message_key,
    )
