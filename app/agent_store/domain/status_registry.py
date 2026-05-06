from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

from .actions import ActionDescriptor


SEVERITIES = frozenset({"info", "warning", "error", "blocked"})


@dataclass(frozen=True)
class StatusPresentation:
    machine_value: str
    display_name: str
    plain_language_explanation: str
    severity: str
    primary_action: ActionDescriptor
    secondary_action: ActionDescriptor | None
    owner_system: str
    visible_roles: tuple[str, ...] = ("user", "owner", "agentops_admin", "security_iam")
    notification_rule: str = "none"
    audit_required: bool = False
    allowed_next_states: tuple[str, ...] = ()
    source_of_truth: str = "agent_store"
    entry_evidence: tuple[str, ...] = ()
    last_verified_at: str | None = None
    conflict_resolution: str = "show_degraded_when_sources_conflict"
    can_ignore: bool = False
    affected_actions: tuple[str, ...] = ()
    return_path: str = "/official-apps/framework.ai-autosdlc"

    def __post_init__(self) -> None:
        if self.severity not in SEVERITIES:
            raise ValueError(f"unsupported severity: {self.severity}")
        if not self.machine_value:
            raise ValueError("machine_value is required")
        if not self.display_name:
            raise ValueError("display_name is required")
        if not self.plain_language_explanation:
            raise ValueError("plain_language_explanation is required")
        if not self.owner_system:
            raise ValueError("owner_system is required")


def _action(action_id: str, target_system: str = "agent_store") -> ActionDescriptor:
    return ActionDescriptor(
        action_id=action_id,
        target_system=target_system,
        enabled=True,
        requires_permission=False,
        audit_required=True,
    )


_STATUSES: dict[str, StatusPresentation] = {
    "AGENT_OWNER_REQUIRED": StatusPresentation(
        machine_value="AGENT_OWNER_REQUIRED",
        display_name="Owner required",
        plain_language_explanation="An agent draft needs a traceable team or user owner before it can proceed.",
        severity="blocked",
        primary_action=_action("add_owner"),
        secondary_action=_action("return_to_draft"),
        owner_system="agent_store",
        entry_evidence=("draft_owner_missing",),
        affected_actions=("create_agent_draft",),
    ),
    "PACKAGE_HASH_MISMATCH": StatusPresentation(
        machine_value="PACKAGE_HASH_MISMATCH",
        display_name="Package hash mismatch",
        plain_language_explanation="The local package hash does not match the Agent Store version fact.",
        severity="blocked",
        primary_action=_action("regenerate_activation_command"),
        secondary_action=_action("view_package_trust_summary"),
        owner_system="agent_store",
        entry_evidence=("artifact_hash_comparison",),
        affected_actions=("create_installation", "issue_assertion"),
    ),
    "INSTALLATION_ASSERTION_EXPIRED": StatusPresentation(
        machine_value="INSTALLATION_ASSERTION_EXPIRED",
        display_name="Installation assertion expired",
        plain_language_explanation="The activation assertion is no longer valid and must be regenerated.",
        severity="blocked",
        primary_action=_action("regenerate_activation_command"),
        secondary_action=_action("view_bootstrap_status"),
        owner_system="agent_store",
        entry_evidence=("assertion_expires_at",),
        affected_actions=("issue_credential",),
    ),
    "STANDALONE_OVERCOUPLED": StatusPresentation(
        machine_value="STANDALONE_OVERCOUPLED",
        display_name="Standalone path overcoupled",
        plain_language_explanation="Standalone usage must stay available without enterprise installation facts.",
        severity="error",
        primary_action=_action("show_standalone_path", "ai_autosdlc_cli"),
        secondary_action=_action("report_contract_violation"),
        owner_system="agent_store",
        entry_evidence=("standalone_requires_enterprise_field",),
        affected_actions=("view_standalone_instructions",),
        can_ignore=False,
    ),
    "APPROVAL_EXPIRED": StatusPresentation(
        machine_value="APPROVAL_EXPIRED",
        display_name="Approval expired",
        plain_language_explanation="The AgentOps approval summary is past its valid window.",
        severity="warning",
        primary_action=_action("request_approval_refresh", "agentops"),
        secondary_action=_action("return_to_store"),
        owner_system="agentops",
        entry_evidence=("approval_expires_at",),
        affected_actions=("show_actual_l5", "enterprise_activation"),
    ),
}


def get_status(machine_value: str) -> StatusPresentation:
    try:
        return _STATUSES[machine_value]
    except KeyError as exc:
        raise KeyError(f"unknown status: {machine_value}") from exc


def all_statuses() -> tuple[StatusPresentation, ...]:
    return tuple(_STATUSES.values())


def assert_statuses_registered(required: Iterable[str]) -> None:
    missing = sorted(set(required) - set(_STATUSES))
    if missing:
        raise ValueError(f"missing status registrations: {', '.join(missing)}")
