from __future__ import annotations

from dataclasses import dataclass
from typing import Mapping

from agent_store import SCHEMA_VERSION

from .actions import ActionDescriptor
from .bootstrap_service import BootstrapRecord
from .status_registry import SEVERITIES


INSTALLATION_RUNTIME_HANDOFF_SCHEMA_VERSION = "installation_runtime_handoff.v1"
RUNTIME_CONSUMABLE_INSTALLATION_STATUSES = frozenset(
    {"activation_required", "reporter_pending"}
)


def _string(value: object) -> str:
    return value.strip() if isinstance(value, str) else ""


@dataclass(frozen=True)
class InstallationRuntimeHandoffIssue:
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
class InstallationRuntimeHandoff:
    trace_id: str
    audit_id: str
    installation_id: str
    handoff_state: str
    display_name_zh: str
    reason_code: str
    reason: str
    runtime_consumption_allowed: bool
    installation: dict[str, object]
    device_binding: dict[str, object]
    runtime_echo: dict[str, object]
    issues: tuple[InstallationRuntimeHandoffIssue, ...]
    source_of_truth: dict[str, str]

    def to_response(self) -> dict[str, object]:
        return {
            "schema_version": SCHEMA_VERSION,
            "trace_id": self.trace_id,
            "error_code": "OK",
            "audit_id": self.audit_id,
            "installation_runtime_handoff": self.to_dict(),
        }

    def to_dict(self) -> dict[str, object]:
        return {
            "contract_schema_version": INSTALLATION_RUNTIME_HANDOFF_SCHEMA_VERSION,
            "handoff_id": f"runtime-handoff-{self.installation_id}",
            "installation_id": self.installation_id,
            "handoff_state": self.handoff_state,
            "display_name_zh": self.display_name_zh,
            "reason_code": self.reason_code,
            "reason": self.reason,
            "runtime_consumption_allowed": self.runtime_consumption_allowed,
            "installation": self.installation,
            "device_binding": self.device_binding,
            "runtime_echo": self.runtime_echo,
            "issues": [issue.to_dict() for issue in self.issues],
            "source_of_truth": self.source_of_truth,
            "next_action": self.next_action.to_dict(),
        }

    @property
    def next_action(self) -> ActionDescriptor:
        if self.handoff_state == "runtime_handoff_ready":
            return ActionDescriptor(
                action_id="start_runtime_activation",
                target_system="agent_runtime",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                message_key="installationRuntime.actions.startRuntimeActivation",
            )
        if self.handoff_state == "artifact_hash_mismatch":
            return ActionDescriptor(
                action_id="regenerate_activation_command",
                target_system="agent_store",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                message_key="installationRuntime.actions.regenerateActivationCommand",
            )
        if self.handoff_state == "device_binding_mismatch":
            return ActionDescriptor(
                action_id="restart_activation",
                target_system="agent_store",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                message_key="installationRuntime.actions.restartActivation",
            )
        return ActionDescriptor(
            action_id="review_installation_status",
            target_system="agent_store",
            enabled=True,
            requires_permission=True,
            audit_required=True,
            message_key="installationRuntime.actions.reviewInstallationStatus",
        )


def build_installation_runtime_handoff(
    record: BootstrapRecord,
    *,
    runtime_echo: Mapping[str, object] | None = None,
    trace_id: str,
    audit_id: str,
) -> InstallationRuntimeHandoff:
    runtime_echo = runtime_echo if isinstance(runtime_echo, Mapping) else None
    installation = record.installation
    binding = record.device_binding
    issues = list(_record_issues(record))
    issues.extend(_runtime_echo_issues(record, runtime_echo))
    state = _handoff_state(tuple(issues))
    display_name, reason_code, reason = _presentation(state)

    return InstallationRuntimeHandoff(
        trace_id=trace_id,
        audit_id=audit_id,
        installation_id=installation.installation_id,
        handoff_state=state,
        display_name_zh=display_name,
        reason_code=reason_code,
        reason=reason,
        runtime_consumption_allowed=state == "runtime_handoff_ready",
        installation=installation.to_dict(),
        device_binding=binding.to_dict(),
        runtime_echo=_runtime_echo_facts(runtime_echo),
        issues=tuple(issues),
        source_of_truth={
            "installation": "agent_store",
            "device_binding": "agent_store",
            "package": "agent_store",
            "runtime_consumption": "agent_runtime_echo_or_request",
            "policy_decision": "agentops",
        },
    )


def _record_issues(
    record: BootstrapRecord,
) -> tuple[InstallationRuntimeHandoffIssue, ...]:
    installation = record.installation
    binding = record.device_binding
    issues: list[InstallationRuntimeHandoffIssue] = []
    if installation.status not in RUNTIME_CONSUMABLE_INSTALLATION_STATUSES:
        issues.append(
            InstallationRuntimeHandoffIssue(
                issue_id="INSTALLATION_NOT_READY",
                field_path="installation.status",
                severity="blocked",
                reason="Installation status cannot be consumed by Runtime.",
                impact="Runtime must not activate a failed or revoked installation.",
                fix_action_id="review_installation_status",
                message_key="installationRuntime.installationNotReady",
            )
        )
    if binding.status != "active":
        issues.append(
            InstallationRuntimeHandoffIssue(
                issue_id="DEVICE_BINDING_NOT_ACTIVE",
                field_path="device_binding.status",
                severity="blocked",
                reason="Device binding is not active.",
                impact="Runtime cannot trust an expired or revoked device binding.",
                fix_action_id="restart_activation",
                message_key="installationRuntime.deviceBindingNotActive",
            )
        )
    if (
        binding.installation_id != installation.installation_id
        or binding.device_id != installation.device_id
    ):
        issues.append(
            InstallationRuntimeHandoffIssue(
                issue_id="DEVICE_BINDING_MISMATCH",
                field_path="device_binding",
                severity="blocked",
                reason="Device binding identity does not match the installation.",
                impact="Runtime cannot safely bind the installation to this device.",
                fix_action_id="restart_activation",
                message_key="installationRuntime.deviceBindingMismatch",
            )
        )
    if binding.artifact_hash != installation.artifact_hash:
        issues.append(
            InstallationRuntimeHandoffIssue(
                issue_id="ARTIFACT_HASH_MISMATCH",
                field_path="device_binding.artifact_hash",
                severity="blocked",
                reason="Device binding artifact hash differs from the installation.",
                impact="Runtime might execute a package different from the Store fact.",
                fix_action_id="regenerate_activation_command",
                message_key="installationRuntime.artifactHashMismatch",
            )
        )
    return tuple(issues)


def _runtime_echo_issues(
    record: BootstrapRecord,
    runtime_echo: Mapping[str, object] | None,
) -> tuple[InstallationRuntimeHandoffIssue, ...]:
    if not runtime_echo:
        return ()
    installation = record.installation
    binding = record.device_binding
    issues: list[InstallationRuntimeHandoffIssue] = []
    echoed_installation_id = _string(runtime_echo.get("installation_id"))
    if (
        echoed_installation_id
        and echoed_installation_id != installation.installation_id
    ):
        issues.append(
            InstallationRuntimeHandoffIssue(
                issue_id="DEVICE_BINDING_MISMATCH",
                field_path="runtime_echo.installation_id",
                severity="blocked",
                reason="Runtime echo references a different installation.",
                impact="Runtime handoff cannot be consumed across installations.",
                fix_action_id="restart_activation",
                message_key="installationRuntime.deviceBindingMismatch",
            )
        )
    echoed_device_id = _string(runtime_echo.get("device_id"))
    if echoed_device_id and echoed_device_id != binding.device_id:
        issues.append(
            InstallationRuntimeHandoffIssue(
                issue_id="DEVICE_BINDING_MISMATCH",
                field_path="runtime_echo.device_id",
                severity="blocked",
                reason="Runtime echo references a different device binding.",
                impact="Runtime handoff cannot be consumed by a different device.",
                fix_action_id="restart_activation",
                message_key="installationRuntime.deviceBindingMismatch",
            )
        )
    runtime_hash = _runtime_artifact_hash(runtime_echo)
    if runtime_hash and runtime_hash != installation.artifact_hash:
        issues.append(
            InstallationRuntimeHandoffIssue(
                issue_id="ARTIFACT_HASH_MISMATCH",
                field_path="runtime_echo.artifact_hash",
                severity="blocked",
                reason="Runtime echo artifact hash differs from the Store installation fact.",
                impact="Runtime must not activate an artifact that does not match Agent Store.",
                fix_action_id="regenerate_activation_command",
                message_key="installationRuntime.artifactHashMismatch",
            )
        )
    return tuple(issues)


def _handoff_state(issues: tuple[InstallationRuntimeHandoffIssue, ...]) -> str:
    issue_ids = {issue.issue_id for issue in issues}
    if "ARTIFACT_HASH_MISMATCH" in issue_ids:
        return "artifact_hash_mismatch"
    if "DEVICE_BINDING_MISMATCH" in issue_ids:
        return "device_binding_mismatch"
    if issue_ids:
        return "installation_not_ready"
    return "runtime_handoff_ready"


def _presentation(state: str) -> tuple[str, str, str]:
    if state == "runtime_handoff_ready":
        return (
            "Runtime 可消费",
            "runtime_handoff_ready",
            "Installation and device binding facts are bound and may be consumed by Runtime.",
        )
    if state == "artifact_hash_mismatch":
        return (
            "包哈希不一致",
            "artifact_hash_mismatch",
            "Runtime echo or device binding artifact hash does not match Agent Store.",
        )
    if state == "device_binding_mismatch":
        return (
            "设备绑定不一致",
            "device_binding_mismatch",
            "Runtime echo does not match the Store-owned installation and device binding.",
        )
    return (
        "安装未就绪",
        "installation_not_ready",
        "Installation or device binding state is not ready for Runtime consumption.",
    )


def _runtime_echo_facts(
    runtime_echo: Mapping[str, object] | None,
) -> dict[str, object]:
    if not runtime_echo:
        return {
            "runtime_id": "",
            "installation_id": "",
            "device_id": "",
            "artifact_hash": "",
            "observed_at": "",
            "handoff_ref": "",
        }
    return {
        "runtime_id": _string(runtime_echo.get("runtime_id")),
        "installation_id": _string(runtime_echo.get("installation_id")),
        "device_id": _string(runtime_echo.get("device_id")),
        "artifact_hash": _runtime_artifact_hash(runtime_echo),
        "observed_at": _string(runtime_echo.get("observed_at")),
        "handoff_ref": _string(runtime_echo.get("handoff_ref")),
    }


def _runtime_artifact_hash(runtime_echo: Mapping[str, object]) -> str:
    return _string(runtime_echo.get("artifact_hash")) or _string(
        runtime_echo.get("observed_artifact_hash")
    )
