from __future__ import annotations

from dataclasses import dataclass

from .actions import ActionDescriptor
from .agentops_summary import CredentialBootstrapSummary
from .installation import Installation
from .permissions import PermissionDecision


@dataclass(frozen=True)
class BootstrapTimelineStep:
    step_id: str
    label: str
    owner_system: str
    status: str
    source: str
    action_id: str | None = None

    def to_dict(self) -> dict[str, object]:
        data: dict[str, object] = {
            "step_id": self.step_id,
            "label": self.label,
            "owner_system": self.owner_system,
            "status": self.status,
            "source": self.source,
        }
        if self.action_id is not None:
            data["action_id"] = self.action_id
        return data


@dataclass(frozen=True)
class BootstrapSourceSignal:
    source_of_truth: str
    state: str
    entry_evidence: tuple[str, ...]
    last_verified_at: str | None = None

    def to_dict(self) -> dict[str, object]:
        data: dict[str, object] = {
            "source_of_truth": self.source_of_truth,
            "state": self.state,
            "entry_evidence": list(self.entry_evidence),
        }
        if self.last_verified_at is not None:
            data["last_verified_at"] = self.last_verified_at
        return data


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
    timeline: tuple[BootstrapTimelineStep, ...] = ()
    source_of_truth: str = "agent_store"
    entry_evidence: tuple[str, ...] = ()
    conflict_resolution: str = "show_degraded_when_sources_conflict"
    can_ignore: bool = False
    affected_actions: tuple[str, ...] = ()
    source_conflicts: tuple[BootstrapSourceSignal, ...] = ()

    def to_dict(self) -> dict[str, object]:
        data: dict[str, object] = {
            "installation_id": self.installation_id,
            "bootstrap_status": self.bootstrap_status,
            "current_step": self.current_step,
            "step_status": self.step_status,
            "primary_action": self.primary_action.to_dict(),
            "source_of_truth": self.source_of_truth,
            "entry_evidence": list(self.entry_evidence),
            "conflict_resolution": self.conflict_resolution,
            "can_ignore": self.can_ignore,
            "affected_actions": list(self.affected_actions),
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
        data.update(
            {key: value for key, value in optional.items() if value is not None}
        )
        if self.secondary_actions:
            data["secondary_actions"] = [
                action.to_dict() for action in self.secondary_actions
            ]
        if self.timeline:
            data["timeline"] = [step.to_dict() for step in self.timeline]
        if self.source_conflicts:
            data["source_conflicts"] = [
                signal.to_dict() for signal in self.source_conflicts
            ]
        return data


def status_for_installation(
    installation: Installation,
    *,
    last_error_code: str | None = None,
    agentops_credential: CredentialBootstrapSummary | None = None,
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
            timeline=_timeline_for_status("expired", None),
            source_of_truth="agent_store",
            entry_evidence=("assertion_expires_at", "last_error_code"),
            conflict_resolution="agent_store_assertion_error_overrides_agentops_echo",
            affected_actions=(
                "issue_assertion",
                "collect_device_proof",
                "issue_credential",
                "send_signature_test_event",
            ),
            return_path="/official-apps/framework.ai-autosdlc",
            source_conflicts=_agentops_conflicts(agentops_credential),
        )

    if agentops_credential is not None:
        if agentops_credential.bootstrap_status in {"expired", "failed"}:
            return BootstrapStatus(
                installation_id=installation.installation_id,
                bootstrap_status=agentops_credential.bootstrap_status,
                current_step="issue_credential",
                step_status="blocked",
                retryable=False,
                diagnostic_ref=f"diag-{installation.trace_id}",
                last_error_code=(
                    "AGENTOPS_BOOTSTRAP_EXPIRED"
                    if agentops_credential.bootstrap_status == "expired"
                    else "AGENTOPS_BOOTSTRAP_FAILED"
                ),
                safe_to_rerun=False,
                primary_action=ActionDescriptor(
                    action_id="view_agentops_bootstrap_failure",
                    target_system="agentops",
                    enabled=True,
                    audit_required=False,
                    href=f"#agentops-evidence-{installation.installation_id}",
                ),
                timeline=_timeline_for_status(
                    agentops_credential.bootstrap_status,
                    agentops_credential,
                ),
                source_of_truth="agentops",
                entry_evidence=(
                    "agentops_credential_echo",
                    "installation_id_match",
                    "device_id_match",
                ),
                conflict_resolution="agentops_bootstrap_echo_after_identity_match",
                affected_actions=("issue_credential", "send_signature_test_event"),
                return_path="/official-apps/framework.ai-autosdlc",
            )
        if agentops_credential.bootstrap_status == "credential_issued":
            return BootstrapStatus(
                installation_id=installation.installation_id,
                bootstrap_status="credential_issued",
                current_step="send_signature_test_event",
                step_status="running",
                next_poll_after=5,
                retryable=True,
                retry_after=30,
                diagnostic_ref=f"diag-{installation.trace_id}",
                safe_to_rerun=True,
                primary_action=ActionDescriptor(
                    action_id="send_signature_test_event",
                    target_system="ai_autosdlc_cli",
                    enabled=True,
                    audit_required=True,
                ),
                timeline=_timeline_for_status(
                    agentops_credential.bootstrap_status,
                    agentops_credential,
                ),
                source_of_truth="agentops",
                entry_evidence=(
                    "agentops_credential_echo",
                    "installation_id_match",
                    "device_id_match",
                ),
                conflict_resolution="agentops_bootstrap_echo_after_identity_match",
                affected_actions=("send_signature_test_event",),
                return_path="/official-apps/framework.ai-autosdlc",
            )
        if agentops_credential.bootstrap_status == "signature_verified":
            return BootstrapStatus(
                installation_id=installation.installation_id,
                bootstrap_status="signature_verified",
                current_step="complete",
                step_status="completed",
                next_poll_after=0,
                retryable=False,
                diagnostic_ref=f"diag-{installation.trace_id}",
                safe_to_rerun=False,
                primary_action=ActionDescriptor(
                    action_id="view_agentops_evidence",
                    target_system="agentops",
                    enabled=True,
                    audit_required=False,
                    href=f"#agentops-evidence-{installation.installation_id}",
                ),
                timeline=_timeline_for_status(
                    agentops_credential.bootstrap_status,
                    agentops_credential,
                ),
                source_of_truth="agentops",
                entry_evidence=(
                    "agentops_credential_echo",
                    "installation_id_match",
                    "device_id_match",
                    "signature_test_verified",
                ),
                conflict_resolution="agentops_signature_verified_is_display_fact",
                affected_actions=("view_agentops_evidence",),
                return_path="/official-apps/framework.ai-autosdlc",
            )

    return BootstrapStatus(
        installation_id=installation.installation_id,
        bootstrap_status="assertion_issued",
        current_step="collect_device_proof",
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
        timeline=_timeline_for_status("assertion_issued", agentops_credential),
        source_of_truth="agent_store",
        entry_evidence=("signed_installation_assertion.v1", "device_binding"),
        conflict_resolution="wait_for_ai_autosdlc_device_proof_then_agentops_echo",
        affected_actions=("collect_device_proof", "issue_credential"),
        return_path="/official-apps/framework.ai-autosdlc",
    )


def _agentops_conflicts(
    agentops_credential: CredentialBootstrapSummary | None,
) -> tuple[BootstrapSourceSignal, ...]:
    if agentops_credential is None:
        return ()
    return (
        BootstrapSourceSignal(
            source_of_truth="agentops",
            state=agentops_credential.bootstrap_status,
            entry_evidence=("agentops_credential_echo",),
            last_verified_at=(
                agentops_credential.expires_at.isoformat()
                if agentops_credential.expires_at
                else None
            ),
        ),
    )


def _timeline_for_status(
    bootstrap_status: str,
    agentops_credential: CredentialBootstrapSummary | None,
) -> tuple[BootstrapTimelineStep, ...]:
    credential_ready = bootstrap_status in {"credential_issued", "signature_verified"}
    signature_verified = bootstrap_status == "signature_verified"
    blocked = bootstrap_status in {"expired", "failed"}
    agentops_blocked = blocked and agentops_credential is not None
    store_blocked = blocked and agentops_credential is None
    proof_status = (
        "completed"
        if credential_ready or agentops_blocked
        else "blocked" if blocked else "running"
    )
    credential_status = "blocked" if blocked else "completed" if credential_ready else "pending"
    signature_status = (
        "blocked" if blocked else "completed" if signature_verified else "pending"
    )

    return (
        BootstrapTimelineStep(
            step_id="create_installation",
            label="Create installation and device binding",
            owner_system="agent_store",
            status="blocked" if store_blocked else "completed",
            source="agent_store",
            action_id="create_installation",
        ),
        BootstrapTimelineStep(
            step_id="issue_assertion",
            label="Issue signed_installation_assertion.v1",
            owner_system="agent_store",
            status="blocked" if store_blocked else "completed",
            source="agent_store",
            action_id="issue_installation_assertion",
        ),
        BootstrapTimelineStep(
            step_id="collect_device_proof",
            label="Collect device_proof.v1 from Ai_AutoSDLC",
            owner_system="ai_autosdlc",
            status=proof_status,
            source="ai_autosdlc" if credential_ready or agentops_blocked else "pending",
            action_id="collect_device_proof",
        ),
        BootstrapTimelineStep(
            step_id="issue_credential",
            label="Issue AgentOps credential echo",
            owner_system="agentops",
            status=credential_status,
            source="agentops" if agentops_credential is not None else "pending",
            action_id="issue_credentials",
        ),
        BootstrapTimelineStep(
            step_id="verify_signature_test",
            label="Verify signed test event",
            owner_system="agentops",
            status=signature_status,
            source="agentops" if signature_verified or agentops_blocked else "pending",
            action_id="send_signature_test_event",
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
        source_of_truth="agentops",
        entry_evidence=("permission_decision", "denied_scope"),
        conflict_resolution="agentops_permission_denial_blocks_bootstrap",
        affected_actions=("issue_credential", "enterprise_activation"),
        primary_action=ActionDescriptor(
            action_id="request_enterprise_access",
            target_system="agentops",
            enabled=bool(decision.request_access_url),
            requires_permission=True,
            audit_required=True,
            href=decision.request_access_url,
        ),
    )
