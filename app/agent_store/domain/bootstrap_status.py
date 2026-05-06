from __future__ import annotations

from dataclasses import dataclass

from .actions import ActionDescriptor
from .installation import Installation
from .permissions import PermissionDecision


@dataclass(frozen=True)
class BootstrapStatus:
    installation_id: str
    bootstrap_status: str
    current_step: str
    step_status: str
    primary_action: ActionDescriptor
    next_poll_after: int | None = None
    retryable: bool | None = None
    retry_after: int | None = None
    regenerate_command_url: str | None = None
    diagnostic_ref: str | None = None
    last_error_code: str | None = None
    safe_to_rerun: bool | None = None
    secondary_actions: tuple[ActionDescriptor, ...] = ()
    denied_scope: str | None = None
    request_access_url: str | None = None
    audit_id: str | None = None
    return_path: str | None = None

    def to_dict(self) -> dict[str, object]:
        data: dict[str, object] = {
            "installation_id": self.installation_id,
            "bootstrap_status": self.bootstrap_status,
            "current_step": self.current_step,
            "step_status": self.step_status,
            "primary_action": self.primary_action.to_dict(),
        }
        optional = {
            "next_poll_after": self.next_poll_after,
            "retryable": self.retryable,
            "retry_after": self.retry_after,
            "regenerate_command_url": self.regenerate_command_url,
            "diagnostic_ref": self.diagnostic_ref,
            "last_error_code": self.last_error_code,
            "safe_to_rerun": self.safe_to_rerun,
            "denied_scope": self.denied_scope,
            "request_access_url": self.request_access_url,
            "audit_id": self.audit_id,
            "return_path": self.return_path,
        }
        data.update({key: value for key, value in optional.items() if value is not None})
        if self.secondary_actions:
            data["secondary_actions"] = [action.to_dict() for action in self.secondary_actions]
        return data


def status_for_installation(
    installation: Installation,
    *,
    last_error_code: str | None = None,
) -> BootstrapStatus:
    if last_error_code == "INSTALLATION_ASSERTION_EXPIRED":
        return BootstrapStatus(
            installation_id=installation.installation_id,
            bootstrap_status="expired",
            current_step="issue_assertion",
            step_status="blocked",
            retryable=True,
            retry_after=0,
            regenerate_command_url=f"/api/v1/installations/{installation.installation_id}/assertion",
            diagnostic_ref=f"diag-{installation.trace_id}",
            last_error_code=last_error_code,
            safe_to_rerun=False,
            primary_action=ActionDescriptor(
                action_id="regenerate_activation_command",
                target_system="agent_store",
                enabled=True,
                audit_required=True,
            ),
        )

    return BootstrapStatus(
        installation_id=installation.installation_id,
        bootstrap_status="assertion_issued",
        current_step="issue_credential",
        step_status="running",
        next_poll_after=5,
        retryable=True,
        retry_after=30,
        diagnostic_ref=f"diag-{installation.trace_id}",
        safe_to_rerun=True,
        primary_action=ActionDescriptor(
            action_id="poll_bootstrap_status",
            target_system="agent_store",
            enabled=True,
            audit_required=False,
        ),
        secondary_actions=(
            ActionDescriptor(
                action_id="copy_diagnostic_ref",
                target_system="agent_store",
                enabled=True,
                audit_required=False,
            ),
        ),
    )


def permission_denied_status(
    installation_id: str,
    decision: PermissionDecision,
    *,
    return_path: str,
) -> BootstrapStatus:
    return BootstrapStatus(
        installation_id=installation_id,
        bootstrap_status="failed",
        current_step="issue_credential",
        step_status="blocked",
        retryable=False,
        diagnostic_ref=f"diag-{decision.trace_id}",
        last_error_code="PERMISSION_DENIED",
        safe_to_rerun=False,
        denied_scope=decision.denied_scope,
        request_access_url=decision.request_access_url,
        audit_id=decision.audit_id,
        return_path=return_path,
        primary_action=ActionDescriptor(
            action_id="request_enterprise_access",
            target_system="agentops",
            enabled=bool(decision.request_access_url),
            requires_permission=True,
            audit_required=True,
            href=decision.request_access_url,
        ),
    )
