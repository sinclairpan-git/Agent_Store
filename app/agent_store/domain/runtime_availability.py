from __future__ import annotations

from dataclasses import dataclass
from typing import Mapping

from agent_store import SCHEMA_VERSION

from .actions import ActionDescriptor
from .agent_manifest import build_agent_manifest_runtime_contract
from .status_registry import SEVERITIES


RUNTIME_AVAILABILITY_SCHEMA_VERSION = "runtime_availability_summary.v1"

_RUNTIME_MISSING_STATES = frozenset(
    {"", "missing", "not_installed", "unavailable", "offline", "unknown"}
)
_RUNTIME_PRESENT_STATES = frozenset(
    {"available", "ready", "running", "installed", "healthy"}
)


def _string(value: object) -> str:
    return value.strip() if isinstance(value, str) else ""


def _string_items(value: object) -> tuple[str, ...]:
    if not isinstance(value, list):
        return ()
    return tuple(
        item.strip() for item in value if isinstance(item, str) and item.strip()
    )


@dataclass(frozen=True)
class RuntimeAvailabilityIssue:
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
class RuntimeAvailabilitySummary:
    trace_id: str
    audit_id: str
    agent_id: str
    agent_version: str
    artifact_hash: str
    availability_state: str
    display_name_zh: str
    reason_code: str
    reason: str
    required_runtime_contract_version: str
    runtime_contract_version: str
    required_runtime_capabilities: tuple[str, ...]
    runtime_capabilities: tuple[str, ...]
    missing_runtime_capabilities: tuple[str, ...]
    issues: tuple[RuntimeAvailabilityIssue, ...]
    source_of_truth: dict[str, str]
    runtime_facts: dict[str, object]

    def to_response(self) -> dict[str, object]:
        return {
            "schema_version": SCHEMA_VERSION,
            "trace_id": self.trace_id,
            "error_code": "OK",
            "audit_id": self.audit_id,
            "runtime_availability_summary": self.to_dict(),
        }

    def to_dict(self) -> dict[str, object]:
        return {
            "contract_schema_version": RUNTIME_AVAILABILITY_SCHEMA_VERSION,
            "agent_id": self.agent_id,
            "agent_version": self.agent_version,
            "artifact_hash": self.artifact_hash,
            "availability_state": self.availability_state,
            "display_name_zh": self.display_name_zh,
            "reason_code": self.reason_code,
            "reason": self.reason,
            "required_runtime_contract_version": (
                self.required_runtime_contract_version
            ),
            "runtime_contract_version": self.runtime_contract_version,
            "required_runtime_capabilities": list(self.required_runtime_capabilities),
            "runtime_capabilities": list(self.runtime_capabilities),
            "missing_runtime_capabilities": list(self.missing_runtime_capabilities),
            "issues": [issue.to_dict() for issue in self.issues],
            "source_of_truth": self.source_of_truth,
            "runtime_facts": self.runtime_facts,
            "next_action": self.next_action.to_dict(),
        }

    @property
    def next_action(self) -> ActionDescriptor:
        if self.availability_state == "runtime_ready":
            return ActionDescriptor(
                action_id="continue_listing_review",
                target_system="agent_store",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                message_key="runtimeAvailability.actions.continueListingReview",
            )
        if self.availability_state == "runtime_upgrade_required":
            return ActionDescriptor(
                action_id="upgrade_runtime",
                target_system="agent_runtime",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                message_key="runtimeAvailability.actions.upgradeRuntime",
            )
        if self.availability_state == "runtime_capability_missing":
            return ActionDescriptor(
                action_id="view_missing_runtime_capabilities",
                target_system="agent_runtime",
                enabled=True,
                requires_permission=False,
                audit_required=True,
                message_key="runtimeAvailability.actions.viewMissingCapabilities",
            )
        if self.availability_state == "manifest_incomplete":
            return ActionDescriptor(
                action_id="complete_agent_manifest",
                target_system="agent_store",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                message_key="runtimeAvailability.actions.completeManifest",
            )
        return ActionDescriptor(
            action_id="install_runtime",
            target_system="agent_runtime",
            enabled=True,
            requires_permission=True,
            audit_required=True,
            message_key="runtimeAvailability.actions.installRuntime",
        )


def build_runtime_availability_summary(
    manifest: Mapping[str, object],
    *,
    runtime_echo: Mapping[str, object] | None = None,
    trace_id: str,
    audit_id: str,
) -> RuntimeAvailabilitySummary:
    runtime_echo = runtime_echo if isinstance(runtime_echo, Mapping) else None
    runtime_capabilities = _runtime_capabilities(runtime_echo)
    runtime_present = _runtime_present(runtime_echo)
    manifest_contract = build_agent_manifest_runtime_contract(
        manifest,
        runtime_capabilities=runtime_capabilities,
        runtime_probe_provided=runtime_echo is not None,
        trace_id=trace_id,
        audit_id=audit_id,
    )

    required_contract_version = _string(manifest.get("runtime_contract_version"))
    runtime_contract_version = _string(
        runtime_echo.get("runtime_contract_version") if runtime_echo else None
    )
    missing_capabilities = (
        tuple(
            capability
            for capability in manifest_contract.required_runtime_capabilities
            if capability not in frozenset(runtime_capabilities)
        )
        if runtime_present
        else ()
    )

    state = _availability_state(
        manifest_status=manifest_contract.manifest_status,
        runtime_present=runtime_present,
        required_runtime_contract_version=required_contract_version,
        runtime_contract_version=runtime_contract_version,
        missing_runtime_capabilities=missing_capabilities,
    )
    issue = _availability_issue(
        state,
        required_runtime_contract_version=required_contract_version,
        runtime_contract_version=runtime_contract_version,
        missing_runtime_capabilities=missing_capabilities,
    )
    display_name, reason_code, reason = _presentation(
        state,
        missing_runtime_capabilities=missing_capabilities,
    )

    return RuntimeAvailabilitySummary(
        trace_id=trace_id,
        audit_id=audit_id,
        agent_id=manifest_contract.agent_id,
        agent_version=manifest_contract.version,
        artifact_hash=manifest_contract.artifact_hash,
        availability_state=state,
        display_name_zh=display_name,
        reason_code=reason_code,
        reason=reason,
        required_runtime_contract_version=required_contract_version,
        runtime_contract_version=runtime_contract_version,
        required_runtime_capabilities=manifest_contract.required_runtime_capabilities,
        runtime_capabilities=runtime_capabilities,
        missing_runtime_capabilities=missing_capabilities,
        issues=(issue,) if issue else (),
        source_of_truth={
            "agent_manifest": "agent_store",
            "runtime_availability": "agent_runtime_echo_or_probe",
            "summary_projection": "agent_store",
            "policy_decision": "agentops",
        },
        runtime_facts=_runtime_facts(runtime_echo, runtime_present),
    )


def _availability_state(
    *,
    manifest_status: str,
    runtime_present: bool,
    required_runtime_contract_version: str,
    runtime_contract_version: str,
    missing_runtime_capabilities: tuple[str, ...],
) -> str:
    if manifest_status != "complete":
        return "manifest_incomplete"
    if not runtime_present:
        return "runtime_missing"
    if not _runtime_contract_satisfies(
        runtime_contract_version,
        required_runtime_contract_version,
    ):
        return "runtime_upgrade_required"
    if missing_runtime_capabilities:
        return "runtime_capability_missing"
    return "runtime_ready"


def _runtime_present(runtime_echo: Mapping[str, object] | None) -> bool:
    if not runtime_echo:
        return False
    present = runtime_echo.get("runtime_present")
    if isinstance(present, bool):
        return present
    state = (
        _string(runtime_echo.get("availability_state"))
        or _string(runtime_echo.get("runtime_state"))
        or _string(runtime_echo.get("status"))
    ).lower()
    if state in _RUNTIME_PRESENT_STATES:
        return True
    if state and state in _RUNTIME_MISSING_STATES:
        return False
    return bool(
        _string(runtime_echo.get("runtime_id"))
        or _string(runtime_echo.get("runtime_contract_version"))
        or _string_items(runtime_echo.get("capabilities"))
    )


def _runtime_capabilities(
    runtime_echo: Mapping[str, object] | None,
) -> tuple[str, ...]:
    if not runtime_echo:
        return ()
    return _string_items(runtime_echo.get("capabilities"))


def _runtime_contract_satisfies(runtime_version: str, required_version: str) -> bool:
    if not required_version:
        return False
    if runtime_version == required_version:
        return True
    runtime_contract = _contract_family_and_major(runtime_version)
    required_contract = _contract_family_and_major(required_version)
    if runtime_contract is None or required_contract is None:
        return False
    runtime_family, runtime_major = runtime_contract
    required_family, required_major = required_contract
    return runtime_family == required_family and runtime_major >= required_major


def _contract_family_and_major(value: str) -> tuple[str, int] | None:
    family, separator, version = value.rpartition(".v")
    if not separator or not family or not version:
        return None
    major_text = version.split(".", maxsplit=1)[0]
    if not major_text.isdigit():
        return None
    return family, int(major_text)


def _availability_issue(
    state: str,
    *,
    required_runtime_contract_version: str,
    runtime_contract_version: str,
    missing_runtime_capabilities: tuple[str, ...],
) -> RuntimeAvailabilityIssue | None:
    if state == "runtime_ready":
        return None
    if state == "manifest_incomplete":
        return RuntimeAvailabilityIssue(
            issue_id="MANIFEST_RUNTIME_CONTRACT_INCOMPLETE",
            field_path="agent_manifest",
            severity="blocked",
            reason="AgentManifest runtime contract is incomplete.",
            impact="Store must not show this Agent version as runnable.",
            fix_action_id="complete_agent_manifest",
            message_key="runtimeAvailability.manifestIncomplete",
        )
    if state == "runtime_missing":
        return RuntimeAvailabilityIssue(
            issue_id="RUNTIME_MISSING",
            field_path="runtime_availability.runtime_present",
            severity="blocked",
            reason="No Runtime echo or probe proves that a compatible Runtime exists.",
            impact="Store can explain installation prerequisites but must not show this Agent version as runnable.",
            fix_action_id="install_runtime",
            message_key="runtimeAvailability.runtimeMissing",
        )
    if state == "runtime_upgrade_required":
        return RuntimeAvailabilityIssue(
            issue_id="RUNTIME_UPGRADE_REQUIRED",
            field_path="runtime_availability.runtime_contract_version",
            severity="blocked",
            reason=(
                "Runtime contract version "
                f"{runtime_contract_version or '<missing>'} does not satisfy "
                f"{required_runtime_contract_version or '<missing>'}."
            ),
            impact="Runtime may reject or mis-handle this AgentManifest.",
            fix_action_id="upgrade_runtime",
            message_key="runtimeAvailability.runtimeUpgradeRequired",
        )
    return RuntimeAvailabilityIssue(
        issue_id="RUNTIME_CAPABILITY_MISSING",
        field_path="runtime_availability.capabilities",
        severity="blocked",
        reason="Runtime echo does not include every capability required by AgentManifest.",
        impact=(
            "Store must route the user to Runtime remediation before listing this "
            "Agent as runnable."
        ),
        fix_action_id="view_missing_runtime_capabilities",
        message_key="runtimeAvailability.runtimeCapabilityMissing",
    )


def _presentation(
    state: str,
    *,
    missing_runtime_capabilities: tuple[str, ...],
) -> tuple[str, str, str]:
    if state == "runtime_ready":
        return (
            "可运行",
            "runtime_ready",
            "Runtime echo satisfies the AgentManifest contract and required capabilities.",
        )
    if state == "runtime_upgrade_required":
        return (
            "需升级 Runtime",
            "runtime_upgrade_required",
            "Installed Runtime contract version is older than the AgentManifest requirement.",
        )
    if state == "runtime_capability_missing":
        missing = ", ".join(missing_runtime_capabilities)
        return (
            "缺 Runtime 能力",
            "runtime_capability_missing",
            f"Runtime echo is missing required capabilities: {missing}.",
        )
    if state == "manifest_incomplete":
        return (
            "Manifest 待补齐",
            "manifest_incomplete",
            "AgentManifest runtime contract must be completed before Runtime availability can be trusted.",
        )
    return (
        "缺 Runtime",
        "runtime_missing",
        "No Runtime availability echo or probe is available for this Agent version.",
    )


def _runtime_facts(
    runtime_echo: Mapping[str, object] | None,
    runtime_present: bool,
) -> dict[str, object]:
    if not runtime_echo:
        return {
            "runtime_present": False,
            "availability_echo_state": "missing",
            "runtime_id": "",
            "probe_ref": "",
            "observed_at": "",
        }
    return {
        "runtime_present": runtime_present,
        "availability_echo_state": (
            _string(runtime_echo.get("availability_state"))
            or _string(runtime_echo.get("runtime_state"))
            or _string(runtime_echo.get("status"))
            or ("available" if runtime_present else "missing")
        ),
        "runtime_id": _string(runtime_echo.get("runtime_id")),
        "probe_ref": _string(runtime_echo.get("probe_ref")),
        "observed_at": _string(runtime_echo.get("observed_at")),
    }
