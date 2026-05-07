from __future__ import annotations

import re
from dataclasses import dataclass
from shlex import quote

from agent_store import SCHEMA_VERSION
from agent_store.domain.actions import ActionDescriptor
from agent_store.ui.catalog_workbench import CatalogAgentSource, build_catalog_card


def _safe_id(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-") or "agent"


def _agent_coordinate(source: CatalogAgentSource) -> str:
    return f"{source.agent.agent_id}@{source.version.version}"


def _quoted_agent_coordinate(source: CatalogAgentSource) -> str:
    return quote(_agent_coordinate(source))


def allowed_request_actions(source: CatalogAgentSource) -> tuple[str, ...]:
    if source.installability == "installable":
        return ("start_install",)
    if source.installability == "activation_required":
        return ("start_enterprise_activation",)
    if source.installability == "standalone_only":
        return ("open_standalone_readme",)
    return ("request_catalog_review",)


def default_request_action(source: CatalogAgentSource) -> str:
    return allowed_request_actions(source)[0]


@dataclass(frozen=True)
class InstallationRequest:
    request_id: str
    agent: dict[str, object]
    agent_coordinate: str
    requested_action_id: str
    request_state: str
    queue: str
    owner_system: str
    audit_id: str
    trace_id: str
    requested_by: str
    next_action: ActionDescriptor
    command_preview: str | None = None
    blockers: tuple[str, ...] = ()

    def to_response(self) -> dict[str, object]:
        request: dict[str, object] = {
            "request_id": self.request_id,
            "agent": self.agent,
            "agent_coordinate": self.agent_coordinate,
            "requested_action_id": self.requested_action_id,
            "request_state": self.request_state,
            "queue": self.queue,
            "owner_system": self.owner_system,
            "audit_id": self.audit_id,
            "requested_by": self.requested_by,
            "next_action": self.next_action.to_dict(),
            "blockers": list(self.blockers),
        }
        if self.command_preview is not None:
            request["command_preview"] = self.command_preview
        return {
            "schema_version": SCHEMA_VERSION,
            "trace_id": self.trace_id,
            "error_code": "OK",
            "request": request,
        }


def build_installation_request(
    *,
    source: CatalogAgentSource,
    trace_id: str,
    requested_by: str,
    action_id: str | None = None,
) -> dict[str, object]:
    requested_action_id = action_id or default_request_action(source)
    safe_agent_id = _safe_id(source.agent.agent_id)
    request_id = f"req-{safe_agent_id}-{_safe_id(requested_action_id)}"
    audit_id = f"audit-{safe_agent_id}-{_safe_id(requested_action_id)}"
    agent = build_catalog_card(source)
    coordinate = _agent_coordinate(source)

    if requested_action_id == "start_install":
        request = InstallationRequest(
            request_id=request_id,
            agent=agent,
            agent_coordinate=coordinate,
            requested_action_id=requested_action_id,
            request_state="accepted",
            queue="installation_bootstrap",
            owner_system="agent_store",
            audit_id=audit_id,
            trace_id=trace_id,
            requested_by=requested_by,
            next_action=ActionDescriptor(
                action_id="create_installation",
                target_system="agent_store",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                href=f"#create-installation-{source.agent.agent_id}",
            ),
            command_preview=f"agent-store install {_quoted_agent_coordinate(source)}",
        )
    elif requested_action_id == "start_enterprise_activation":
        request = InstallationRequest(
            request_id=request_id,
            agent=agent,
            agent_coordinate=coordinate,
            requested_action_id=requested_action_id,
            request_state="pending_enterprise_activation",
            queue="enterprise_activation",
            owner_system="agentops",
            audit_id=audit_id,
            trace_id=trace_id,
            requested_by=requested_by,
            next_action=ActionDescriptor(
                action_id="issue_reporter_credential",
                target_system="agentops",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                href=f"#agentops-activation-{source.agent.agent_id}",
            ),
            command_preview=(
                f"agent-store activate {_quoted_agent_coordinate(source)} --enterprise"
            ),
        )
    elif requested_action_id == "open_standalone_readme":
        request = InstallationRequest(
            request_id=request_id,
            agent=agent,
            agent_coordinate=coordinate,
            requested_action_id=requested_action_id,
            request_state="standalone_ready",
            queue="standalone_access",
            owner_system="agent_store",
            audit_id=audit_id,
            trace_id=trace_id,
            requested_by=requested_by,
            next_action=ActionDescriptor(
                action_id="open_standalone_readme",
                target_system="agent_store",
                enabled=True,
                requires_permission=False,
                audit_required=False,
                href=f"#standalone-{source.agent.agent_id}",
            ),
            command_preview=f"agent-store open {_quoted_agent_coordinate(source)} --standalone",
        )
    else:
        request = InstallationRequest(
            request_id=request_id,
            agent=agent,
            agent_coordinate=coordinate,
            requested_action_id=requested_action_id,
            request_state="pending_catalog_review",
            queue="catalog_review",
            owner_system="security",
            audit_id=audit_id,
            trace_id=trace_id,
            requested_by=requested_by,
            next_action=ActionDescriptor(
                action_id="review_catalog_blocker",
                target_system="agent_store",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                href=f"#review-catalog-blocker-{source.agent.agent_id}",
            ),
            blockers=(
                str(agent["trust_state"]),
                str(agent["enterprise_state"]),
                str(agent["installability"]),
            ),
        )
    return request.to_response()
