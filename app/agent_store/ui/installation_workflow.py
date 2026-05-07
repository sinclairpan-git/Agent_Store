from __future__ import annotations

from dataclasses import dataclass

from agent_store import SCHEMA_VERSION
from agent_store.domain.actions import ActionDescriptor
from agent_store.ui.catalog_workbench import CatalogAgentSource, build_catalog_card


@dataclass(frozen=True)
class WorkflowStep:
    step_id: str
    label: str
    state: str
    owner_system: str
    action: ActionDescriptor | None = None
    diagnostic_ref: str | None = None

    def to_dict(self) -> dict[str, object]:
        data: dict[str, object] = {
            "step_id": self.step_id,
            "label": self.label,
            "state": self.state,
            "owner_system": self.owner_system,
        }
        if self.action is not None:
            data["action"] = self.action.to_dict()
        if self.diagnostic_ref is not None:
            data["diagnostic_ref"] = self.diagnostic_ref
        return data


@dataclass(frozen=True)
class InstallationWorkflowPreview:
    agent: dict[str, object]
    workflow_state: str
    primary_action: ActionDescriptor
    steps: tuple[WorkflowStep, ...]
    audit_id: str
    trace_id: str
    recovery_action: ActionDescriptor | None = None
    command_preview: str | None = None

    def to_response(self) -> dict[str, object]:
        workflow: dict[str, object] = {
            "agent": self.agent,
            "workflow_state": self.workflow_state,
            "primary_action": self.primary_action.to_dict(),
            "steps": [step.to_dict() for step in self.steps],
            "audit_id": self.audit_id,
        }
        if self.recovery_action is not None:
            workflow["recovery_action"] = self.recovery_action.to_dict()
        if self.command_preview is not None:
            workflow["command_preview"] = self.command_preview
        return {
            "schema_version": SCHEMA_VERSION,
            "trace_id": self.trace_id,
            "error_code": "OK",
            "workflow": workflow,
        }


def _install_steps(source: CatalogAgentSource) -> tuple[WorkflowStep, ...]:
    return (
        WorkflowStep(
            step_id="verify_package",
            label="校验包签名与 hash",
            state="ready",
            owner_system="agent_store",
        ),
        WorkflowStep(
            step_id="create_installation",
            label="创建 installation 与 device binding",
            state="ready",
            owner_system="agent_store",
            action=ActionDescriptor(
                action_id="create_installation",
                target_system="agent_store",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                href=f"#create-installation-{source.agent.agent_id}",
            ),
        ),
        WorkflowStep(
            step_id="issue_assertion",
            label="签发安装断言",
            state="pending",
            owner_system="agent_store",
        ),
        WorkflowStep(
            step_id="sync_agentops",
            label="等待 AgentOps 证据同步",
            state="pending",
            owner_system="agentops",
        ),
    )


def _activation_steps(source: CatalogAgentSource) -> tuple[WorkflowStep, ...]:
    return (
        WorkflowStep(
            step_id="confirm_enterprise_policy",
            label="确认企业策略要求",
            state="ready",
            owner_system="agent_store",
        ),
        WorkflowStep(
            step_id="start_activation",
            label="生成企业激活命令",
            state="ready",
            owner_system="agent_store",
            action=ActionDescriptor(
                action_id="start_enterprise_activation",
                target_system="agent_store",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                href=f"#activation-{source.agent.agent_id}",
            ),
        ),
        WorkflowStep(
            step_id="issue_reporter_credential",
            label="签发 Reporter credential",
            state="pending",
            owner_system="agentops",
        ),
        WorkflowStep(
            step_id="verify_signature_test",
            label="完成签名测试事件",
            state="pending",
            owner_system="agentops",
        ),
    )


def _blocked_steps(source: CatalogAgentSource) -> tuple[WorkflowStep, ...]:
    return (
        WorkflowStep(
            step_id="blocked_by_policy",
            label="策略或可信状态阻断",
            state="blocked",
            owner_system="agent_store",
            diagnostic_ref=f"blocked-{source.agent.agent_id}",
        ),
        WorkflowStep(
            step_id="request_review",
            label="申请 Owner / Security 复核",
            state="ready",
            owner_system="agent_store",
            action=ActionDescriptor(
                action_id="request_catalog_review",
                target_system="agent_store",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                href=f"#request-review-{source.agent.agent_id}",
            ),
        ),
    )


def build_installation_workflow_preview(
    *, source: CatalogAgentSource, trace_id: str
) -> dict[str, object]:
    card = build_catalog_card(source)
    installability = str(card["installability"])
    audit_id = f"audit-{source.agent.agent_id}"
    if installability == "installable":
        preview = InstallationWorkflowPreview(
            agent=card,
            workflow_state="ready_to_install",
            primary_action=ActionDescriptor(
                action_id="start_install",
                target_system="agent_store",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                href=f"#install-{source.agent.agent_id}",
            ),
            steps=_install_steps(source),
            audit_id=audit_id,
            trace_id=trace_id,
            command_preview=f"agent-store install {source.agent.agent_id}@{source.version.version}",
        )
    elif installability == "activation_required":
        preview = InstallationWorkflowPreview(
            agent=card,
            workflow_state="activation_required",
            primary_action=ActionDescriptor(
                action_id="start_enterprise_activation",
                target_system="agent_store",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                href=f"#activation-{source.agent.agent_id}",
            ),
            steps=_activation_steps(source),
            audit_id=audit_id,
            trace_id=trace_id,
            command_preview=(
                "agent-store activate "
                f"{source.agent.agent_id}@{source.version.version} --enterprise"
            ),
        )
    else:
        preview = InstallationWorkflowPreview(
            agent=card,
            workflow_state="blocked",
            primary_action=ActionDescriptor(
                action_id="view_blocking_policy",
                target_system="agent_store",
                enabled=True,
                requires_permission=False,
                audit_required=False,
                href=f"#blocked-{source.agent.agent_id}",
            ),
            steps=_blocked_steps(source),
            audit_id=audit_id,
            trace_id=trace_id,
            recovery_action=ActionDescriptor(
                action_id="request_catalog_review",
                target_system="agent_store",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                href=f"#request-review-{source.agent.agent_id}",
            ),
        )
    return preview.to_response()
