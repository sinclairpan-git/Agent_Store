from __future__ import annotations

from dataclasses import dataclass
from typing import Mapping

from agent_store import SCHEMA_VERSION
from .status_registry import SEVERITIES


RUNTIME_CONTRACT_SCHEMA_VERSION = "agent_manifest_runtime_contract.v1"
REQUIRED_MANIFEST_STRINGS = (
    "manifest_schema_version",
    "agent_id",
    "version",
    "artifact_hash",
    "runtime_contract_version",
    "rollback_policy",
)
REQUIRED_MANIFEST_ARRAYS = (
    "required_runtime_capabilities",
    "skills",
    "permission_intents",
    "data_scopes",
    "secret_refs",
    "network_allowlist",
    "guardrail_refs",
)
REQUIRED_MANIFEST_OBJECTS = ("observability_contract", "provenance")


def _string(value: object) -> str:
    return value.strip() if isinstance(value, str) else ""


def _string_items(value: object) -> tuple[str, ...]:
    if not isinstance(value, list):
        return ()
    return tuple(
        item.strip() for item in value if isinstance(item, str) and item.strip()
    )


@dataclass(frozen=True)
class AgentManifestRuntimeIssue:
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
class AgentManifestRuntimeContract:
    trace_id: str
    audit_id: str
    agent_id: str
    version: str
    artifact_hash: str
    manifest_status: str
    runtime_compatibility: str
    required_runtime_capabilities: tuple[str, ...]
    runtime_capabilities: tuple[str, ...]
    missing_runtime_capabilities: tuple[str, ...]
    issues: tuple[AgentManifestRuntimeIssue, ...]
    source_of_truth: dict[str, str]

    def to_response(self) -> dict[str, object]:
        return {
            "schema_version": SCHEMA_VERSION,
            "trace_id": self.trace_id,
            "error_code": "OK",
            "audit_id": self.audit_id,
            "agent_manifest_runtime_contract": self.to_dict(),
        }

    def to_dict(self) -> dict[str, object]:
        return {
            "contract_schema_version": RUNTIME_CONTRACT_SCHEMA_VERSION,
            "agent_id": self.agent_id,
            "version": self.version,
            "artifact_hash": self.artifact_hash,
            "manifest_status": self.manifest_status,
            "runtime_compatibility": self.runtime_compatibility,
            "required_runtime_capabilities": list(self.required_runtime_capabilities),
            "runtime_capabilities": list(self.runtime_capabilities),
            "missing_runtime_capabilities": list(self.missing_runtime_capabilities),
            "issues": [issue.to_dict() for issue in self.issues],
            "source_of_truth": self.source_of_truth,
            "next_action": self.next_action,
        }

    @property
    def next_action(self) -> dict[str, object]:
        if self.manifest_status != "complete":
            action_id = "complete_agent_manifest"
        elif self.runtime_compatibility == "runtime_capability_missing":
            action_id = "view_missing_runtime_capabilities"
        elif self.runtime_compatibility == "runtime_unknown":
            action_id = "check_runtime_capabilities"
        else:
            action_id = "continue_manifest_review"
        return {
            "action_id": action_id,
            "target_system": "agent_store",
            "audit_required": True,
            "enabled": True,
        }


def build_agent_manifest_runtime_contract(
    manifest: Mapping[str, object],
    *,
    runtime_capabilities: tuple[str, ...] = (),
    runtime_probe_provided: bool = False,
    trace_id: str,
    audit_id: str,
) -> AgentManifestRuntimeContract:
    issues: list[AgentManifestRuntimeIssue] = []
    issues.extend(_required_string_issues(manifest))
    issues.extend(_required_array_issues(manifest))
    issues.extend(_required_object_issues(manifest))
    issues.extend(_skill_reference_issues(manifest))
    issues.extend(_runtime_capability_item_issues(manifest))
    issues.extend(_observability_contract_issues(manifest))

    required_capabilities = _string_items(manifest.get("required_runtime_capabilities"))
    runtime_capability_set = frozenset(runtime_capabilities)
    runtime_probe_available = runtime_probe_provided or bool(runtime_capabilities)
    missing_capabilities = (
        tuple(
            capability
            for capability in required_capabilities
            if capability not in runtime_capability_set
        )
        if runtime_probe_available
        else ()
    )
    if runtime_probe_available and missing_capabilities:
        issues.append(
            AgentManifestRuntimeIssue(
                issue_id="RUNTIME_CAPABILITY_MISSING",
                field_path="runtime.capabilities",
                severity="blocked",
                reason="Runtime does not provide every capability required by this AgentManifest.",
                impact="Agent Store must not present this Agent version as runnable in the current Runtime.",
                fix_action_id="upgrade_runtime_or_select_compatible_version",
                message_key="agentManifest.runtimeCapabilityMissing",
            )
        )

    manifest_status = (
        "complete"
        if not any(issue.field_path.startswith("agent_manifest.") for issue in issues)
        else "incomplete"
    )
    runtime_compatibility = _runtime_compatibility(
        manifest_status=manifest_status,
        runtime_probe_available=runtime_probe_available,
        missing_capabilities=missing_capabilities,
    )
    return AgentManifestRuntimeContract(
        trace_id=trace_id,
        audit_id=audit_id,
        agent_id=_string(manifest.get("agent_id")),
        version=_string(manifest.get("version")),
        artifact_hash=_string(manifest.get("artifact_hash")),
        manifest_status=manifest_status,
        runtime_compatibility=runtime_compatibility,
        required_runtime_capabilities=required_capabilities,
        runtime_capabilities=runtime_capabilities,
        missing_runtime_capabilities=missing_capabilities,
        issues=tuple(issues),
        source_of_truth={
            "agent_manifest": "agent_store",
            "package": "agent_store",
            "skill_registry": "agent_store",
            "runtime_availability": "agent_runtime_echo_or_probe",
            "policy_decision": "agentops",
        },
    )


def _runtime_compatibility(
    *,
    manifest_status: str,
    runtime_probe_available: bool,
    missing_capabilities: tuple[str, ...],
) -> str:
    if manifest_status != "complete":
        return "manifest_incomplete"
    if not runtime_probe_available:
        return "runtime_unknown"
    if missing_capabilities:
        return "runtime_capability_missing"
    return "runtime_compatible"


def _required_string_issues(
    manifest: Mapping[str, object],
) -> tuple[AgentManifestRuntimeIssue, ...]:
    return tuple(
        AgentManifestRuntimeIssue(
            issue_id=f"{field.upper()}_REQUIRED",
            field_path=f"agent_manifest.{field}",
            severity="blocked",
            reason=f"{field} is required in AgentManifest runtime contract.",
            impact="Runtime cannot safely consume or verify this AgentManifest.",
            fix_action_id=f"add_{field}",
            message_key="agentManifest.requiredField",
        )
        for field in REQUIRED_MANIFEST_STRINGS
        if not _string(manifest.get(field))
    )


def _required_array_issues(
    manifest: Mapping[str, object],
) -> tuple[AgentManifestRuntimeIssue, ...]:
    issues: list[AgentManifestRuntimeIssue] = []
    for field in REQUIRED_MANIFEST_ARRAYS:
        value = manifest.get(field)
        if not isinstance(value, list):
            issues.append(
                AgentManifestRuntimeIssue(
                    issue_id=f"{field.upper()}_REQUIRED",
                    field_path=f"agent_manifest.{field}",
                    severity="blocked",
                    reason=f"{field} must be present as an array in AgentManifest.",
                    impact="Runtime and AgentOps cannot reason about this AgentManifest contract.",
                    fix_action_id=f"add_{field}",
                    message_key="agentManifest.requiredArray",
                )
            )
        elif field in {"required_runtime_capabilities", "skills"} and not value:
            issues.append(
                AgentManifestRuntimeIssue(
                    issue_id=f"{field.upper()}_REQUIRED",
                    field_path=f"agent_manifest.{field}",
                    severity="blocked",
                    reason=f"{field} must contain at least one entry.",
                    impact="Runtime cannot determine required capabilities or Skill surface.",
                    fix_action_id=f"add_{field}",
                    message_key="agentManifest.requiredArrayEntry",
                )
            )
    return tuple(issues)


def _required_object_issues(
    manifest: Mapping[str, object],
) -> tuple[AgentManifestRuntimeIssue, ...]:
    return tuple(
        AgentManifestRuntimeIssue(
            issue_id=f"{field.upper()}_REQUIRED",
            field_path=f"agent_manifest.{field}",
            severity="blocked",
            reason=f"{field} must be present as an object in AgentManifest.",
            impact="Runtime and AgentOps cannot verify required execution and provenance facts.",
            fix_action_id=f"add_{field}",
            message_key="agentManifest.requiredObject",
        )
        for field in REQUIRED_MANIFEST_OBJECTS
        if not isinstance(manifest.get(field), Mapping)
    )


def _skill_reference_issues(
    manifest: Mapping[str, object],
) -> tuple[AgentManifestRuntimeIssue, ...]:
    skills = manifest.get("skills")
    if not isinstance(skills, list):
        return ()
    issues: list[AgentManifestRuntimeIssue] = []
    for index, skill in enumerate(skills):
        if not isinstance(skill, Mapping):
            issues.append(
                AgentManifestRuntimeIssue(
                    issue_id="SKILL_REFERENCE_INVALID",
                    field_path=f"agent_manifest.skills[{index}]",
                    severity="blocked",
                    reason="Skill entries must be objects with stable Skill Registry identity.",
                    impact="Runtime and AgentOps cannot policy-check an unstructured Skill reference.",
                    fix_action_id="replace_skill_reference",
                    message_key="agentManifest.skillReferenceInvalid",
                )
            )
            continue
        for field in ("skill_id", "skill_version"):
            if not _string(skill.get(field)):
                issues.append(
                    AgentManifestRuntimeIssue(
                        issue_id=f"SKILL_{field.removeprefix('skill_').upper()}_REQUIRED",
                        field_path=f"agent_manifest.skills[{index}].{field}",
                        severity="blocked",
                        reason=f"{field} is required for Runtime and AgentOps consumption.",
                        impact="Runtime cannot bind this Manifest to a Store-owned Skill Registry fact.",
                        fix_action_id=f"add_{field}",
                        message_key="agentManifest.skillIdentityRequired",
                    )
                )
    return tuple(issues)


def _runtime_capability_item_issues(
    manifest: Mapping[str, object],
) -> tuple[AgentManifestRuntimeIssue, ...]:
    capabilities = manifest.get("required_runtime_capabilities")
    if not isinstance(capabilities, list):
        return ()
    issues: list[AgentManifestRuntimeIssue] = []
    for index, capability in enumerate(capabilities):
        if not _string(capability):
            issues.append(
                AgentManifestRuntimeIssue(
                    issue_id="RUNTIME_CAPABILITY_INVALID",
                    field_path=(
                        f"agent_manifest.required_runtime_capabilities[{index}]"
                    ),
                    severity="blocked",
                    reason="Runtime capability entries must be non-empty strings.",
                    impact="Runtime cannot safely match malformed capability requirements.",
                    fix_action_id="replace_runtime_capability",
                    message_key="agentManifest.runtimeCapabilityInvalid",
                )
            )
    return tuple(issues)


def _observability_contract_issues(
    manifest: Mapping[str, object],
) -> tuple[AgentManifestRuntimeIssue, ...]:
    observability = manifest.get("observability_contract")
    if not isinstance(observability, Mapping):
        return ()
    trace_spans = observability.get("trace_spans")
    if not isinstance(trace_spans, list) or not _string_items(trace_spans):
        return (
            AgentManifestRuntimeIssue(
                issue_id="OBSERVABILITY_TRACE_SPANS_REQUIRED",
                field_path="agent_manifest.observability_contract.trace_spans",
                severity="blocked",
                reason="AgentManifest must declare the minimum TraceSpan kinds Runtime must emit.",
                impact="AgentOps cannot build Run Detail, EvidenceSummary, or HealthSummary without observable Runtime facts.",
                fix_action_id="add_observability_trace_spans",
                message_key="agentManifest.observabilityTraceSpansRequired",
            ),
        )
    issues: list[AgentManifestRuntimeIssue] = []
    for index, span in enumerate(trace_spans):
        if not _string(span):
            issues.append(
                AgentManifestRuntimeIssue(
                    issue_id="OBSERVABILITY_TRACE_SPAN_INVALID",
                    field_path=(
                        f"agent_manifest.observability_contract.trace_spans[{index}]"
                    ),
                    severity="blocked",
                    reason="TraceSpan entries must be non-empty strings.",
                    impact="Runtime and AgentOps cannot consume malformed observability contracts.",
                    fix_action_id="replace_observability_trace_span",
                    message_key="agentManifest.observabilityTraceSpanInvalid",
                )
            )
    return tuple(issues)
