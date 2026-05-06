from __future__ import annotations

from dataclasses import dataclass

from agent_store import SCHEMA_VERSION
from agent_store.domain.actions import ActionDescriptor
from agent_store.domain.errors import ErrorResponse
from agent_store.domain.enterprise_context import EnterpriseContext
from agent_store.domain.models import Agent, AgentVersion
from agent_store.domain.package_trust import PackageTrustSummary


@dataclass(frozen=True)
class OfficialAppViewModel:
    agent: Agent
    version: AgentVersion
    package_trust_summary: PackageTrustSummary
    enterprise_context: EnterpriseContext
    trace_id: str
    role: str = "user"
    bootstrap_completed: bool = False
    l5_gate_passed: bool = False
    violation_scan_completed: bool = False

    @property
    def actual_l5_display_allowed(self) -> bool:
        return (
            self.bootstrap_completed
            and self.l5_gate_passed
            and self.violation_scan_completed
        )

    @property
    def l5_display_state(self) -> str:
        if self.actual_l5_display_allowed:
            return "actual_l5"
        return "l5_capable_pending_verification"

    def to_response(self) -> dict[str, object]:
        view = {
            "agent_id": self.agent.agent_id,
            "display_name": self.agent.display_name,
            "summary": self.agent.summary,
            "use_cases": list(self.agent.use_cases),
            "current_user_installability": self._installability(),
            "supported_os": [item.to_dict() for item in self.agent.supported_os],
            "official_flag": self.agent.official_flag,
            "framework_capability": self.agent.is_framework_capability,
            "capability_type": "SDLC Framework" if self.agent.is_framework_capability else None,
            "maintenance": {
                "owner_team": self.agent.owner_team,
                "owner_user": self.agent.owner_user,
                "version": self.version.version,
                "release_status": self.version.release_status,
            },
            "standalone": {
                "requires_installation_id": False,
                "action": self._standalone_action().to_dict(),
            },
            "enterprise_activation": {
                "requires_enterprise": self.enterprise_context.requires_enterprise,
                "action": self._enterprise_action().to_dict(),
            },
            "l5_display_state": self.l5_display_state,
            "actual_l5_display_allowed": self.actual_l5_display_allowed,
            "package_trust_summary": self.package_trust_summary.to_dict(),
            "standalone_action": self._standalone_action().to_dict(),
            "enterprise_activation_action": self._enterprise_action().to_dict(),
            "primary_action": self._primary_action().to_dict(),
            "secondary_actions": [self._docs_action().to_dict()],
            "enterprise_context": self.enterprise_context.to_dict(),
            "role": self.role,
            "role_visible_sections": self._role_visible_sections(),
            "accessibility_contract": self._accessibility_contract(),
        }
        return {
            "schema_version": SCHEMA_VERSION,
            "trace_id": self.trace_id,
            "error_code": "OK",
            "view": view,
        }

    def _installability(self) -> str:
        if self.enterprise_context.integration_mode == "standalone":
            return "standalone_only"
        if self.enterprise_context.enterprise_state in {"required_unactivated", "activating"}:
            return "activation_required"
        if self.enterprise_context.enterprise_state == "disabled":
            return "blocked"
        return "installable"

    def _standalone_action(self) -> ActionDescriptor:
        return ActionDescriptor(
            action_id="open_standalone_readme",
            target_system="ai_autosdlc_cli",
            enabled=True,
            requires_permission=False,
            audit_required=False,
            href="/docs/ai-autosdlc/standalone",
            message_key="officialApp.actions.openStandaloneReadme",
        )

    def _enterprise_action(self) -> ActionDescriptor:
        return ActionDescriptor(
            action_id="start_enterprise_activation",
            target_system="agent_store",
            enabled=self.enterprise_context.integration_mode != "standalone",
            requires_permission=True,
            audit_required=True,
            href=f"/api/v1/agents/{self.agent.agent_id}/activate",
            message_key="officialApp.actions.startEnterpriseActivation",
        )

    def _docs_action(self) -> ActionDescriptor:
        return ActionDescriptor(
            action_id="open_enterprise_integration_docs",
            target_system="agent_store",
            enabled=True,
            requires_permission=False,
            audit_required=False,
            href="/docs/agent-store/enterprise-integration",
            message_key="officialApp.actions.openEnterpriseDocs",
        )

    def _primary_action(self) -> ActionDescriptor:
        if self.enterprise_context.integration_mode == "standalone":
            return self._standalone_action()
        return self._enterprise_action()

    def _role_visible_sections(self) -> list[str]:
        sections = [
            "summary",
            "use_cases",
            "current_user_installability",
            "supported_os",
            "standalone",
            "enterprise_activation",
            "l5_display_state",
            "package_trust_summary",
        ]
        if self.role in {"owner", "agentops_admin", "security_iam"}:
            sections.extend(["maintenance", "package_trust_diagnostics"])
        if self.role in {"agentops_admin", "security_iam"}:
            sections.extend(["enterprise_context", "traceability"])
        if self.role == "security_iam":
            sections.extend(["policy_owner", "issuer", "audit_requirements"])
        return sections

    def _accessibility_contract(self) -> dict[str, object]:
        actions = [self._primary_action(), self._standalone_action(), self._docs_action()]
        if self._enterprise_action().action_id not in {action.action_id for action in actions}:
            actions.append(self._enterprise_action())
        return {
            "keyboard_reachable_action_ids": [action.action_id for action in actions],
            "focus_return_action_id": self._primary_action().action_id,
            "copy_feedback": {
                "action_id": "copy_diagnostic_ref",
                "message_key": "officialApp.feedback.diagnosticCopied",
            },
            "status_live_update": {
                "enabled": True,
                "message_key": "officialApp.status.updated",
            },
        }


def build_official_app_view(
    *,
    agent: Agent,
    version: AgentVersion,
    trace_id: str,
    enterprise_context: EnterpriseContext | None = None,
    package_trust_summary: PackageTrustSummary | None = None,
    role: str = "user",
    bootstrap_completed: bool = False,
    l5_gate_passed: bool = False,
    violation_scan_completed: bool = False,
) -> dict[str, object]:
    model = OfficialAppViewModel(
        agent=agent,
        version=version,
        package_trust_summary=package_trust_summary
        or PackageTrustSummary.from_version(version),
        enterprise_context=enterprise_context or EnterpriseContext.standalone(),
        trace_id=trace_id,
        role=role,
        bootstrap_completed=bootstrap_completed,
        l5_gate_passed=l5_gate_passed,
        violation_scan_completed=violation_scan_completed,
    )
    return model.to_response()


def validate_standalone_boundary(view_response: dict[str, object], *, trace_id: str) -> ErrorResponse | None:
    view = view_response.get("view")
    if not isinstance(view, dict):
        return None
    standalone = view.get("standalone")
    enterprise_context = view.get("enterprise_context")
    requires_installation = isinstance(standalone, dict) and standalone.get(
        "requires_installation_id"
    )
    has_installation_id = isinstance(enterprise_context, dict) and bool(
        enterprise_context.get("installation_id")
    )
    if requires_installation or has_installation_id:
        return ErrorResponse(
            error_code="STANDALONE_OVERCOUPLED",
            message_key="errors.standaloneOvercoupled",
            severity="blocked",
            retryable=False,
            recommended_action_id="show_standalone_path",
            trace_id=trace_id,
        )
    return None
