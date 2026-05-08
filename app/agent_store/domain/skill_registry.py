from __future__ import annotations

from dataclasses import dataclass
from typing import Mapping

from agent_store import SCHEMA_VERSION
from .status_registry import SEVERITIES


RISK_LEVELS = frozenset({"low", "medium", "high", "critical"})
HIGH_RISK_LEVELS = frozenset({"high", "critical"})
TERMINAL_SECURITY_STATUS = "security_revoked"


def _string(value: object) -> str:
    return value.strip() if isinstance(value, str) else ""


@dataclass(frozen=True)
class SkillRegistryIssue:
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
class SkillRegistryRecord:
    skill_id: str
    skill_version: str
    schema_ref: str
    risk_level: str
    package_id: str
    agent_id: str
    owner_team: str
    owner_user: str
    status: str
    status_reason: str
    risk_justification: str = ""

    @property
    def registry_key(self) -> str:
        return f"{self.skill_id}@{self.skill_version}"

    def with_status(self, status: str, reason: str) -> SkillRegistryRecord:
        return SkillRegistryRecord(
            skill_id=self.skill_id,
            skill_version=self.skill_version,
            schema_ref=self.schema_ref,
            risk_level=self.risk_level,
            package_id=self.package_id,
            agent_id=self.agent_id,
            owner_team=self.owner_team,
            owner_user=self.owner_user,
            status=status,
            status_reason=reason,
            risk_justification=self.risk_justification,
        )

    def to_dict(self) -> dict[str, object]:
        data: dict[str, object] = {
            "skill_id": self.skill_id,
            "skill_version": self.skill_version,
            "schema_ref": self.schema_ref,
            "risk_level": self.risk_level,
            "package_id": self.package_id,
            "agent_id": self.agent_id,
            "owner_team": self.owner_team,
            "owner_user": self.owner_user,
            "status": self.status,
            "status_reason": self.status_reason,
            "registry_key": self.registry_key,
        }
        if self.risk_justification:
            data["risk_justification"] = self.risk_justification
        return data


@dataclass(frozen=True)
class SkillRegistryEvent:
    event_id: str
    event_type: str
    skill_id: str
    skill_version: str
    audit_required: bool
    reason: str
    evidence_ref: str = ""

    def to_dict(self) -> dict[str, object]:
        data: dict[str, object] = {
            "event_id": self.event_id,
            "event_type": self.event_type,
            "skill_id": self.skill_id,
            "skill_version": self.skill_version,
            "audit_required": self.audit_required,
            "reason": self.reason,
        }
        if self.evidence_ref:
            data["evidence_ref"] = self.evidence_ref
        return data


@dataclass(frozen=True)
class SkillRegistryDecision:
    trace_id: str
    audit_id: str
    registry_status: str
    skill: SkillRegistryRecord | None
    issues: tuple[SkillRegistryIssue, ...]
    event: SkillRegistryEvent | None
    next_action: dict[str, object]
    agentops_consumption: dict[str, object]
    source_of_truth: dict[str, str]

    def to_response(self) -> dict[str, object]:
        return {
            "schema_version": SCHEMA_VERSION,
            "trace_id": self.trace_id,
            "error_code": "OK",
            "audit_id": self.audit_id,
            "skill_registry": self.to_dict(),
        }

    def to_dict(self) -> dict[str, object]:
        return {
            "registry_status": self.registry_status,
            "skill": self.skill.to_dict() if self.skill is not None else None,
            "issues": [issue.to_dict() for issue in self.issues],
            "event": self.event.to_dict() if self.event is not None else None,
            "next_action": self.next_action,
            "agentops_consumption": self.agentops_consumption,
            "source_of_truth": self.source_of_truth,
        }


def build_skill_publish_decision(
    payload: Mapping[str, object],
    *,
    trace_id: str,
    audit_id: str,
) -> SkillRegistryDecision:
    skill = payload.get("skill")
    candidate = skill if isinstance(skill, Mapping) else {}
    issues = list(_publish_issues(payload, candidate))

    record = _record_from_candidate(candidate, status="published")
    if issues:
        return SkillRegistryDecision(
            trace_id=trace_id,
            audit_id=audit_id,
            registry_status="registration_blocked",
            skill=record if _string(candidate.get("skill_id")) else None,
            issues=tuple(issues),
            event=None,
            next_action=_next_action("return_to_validation", enabled=True),
            agentops_consumption=_agentops_consumption("not_ready"),
            source_of_truth=_source_of_truth(),
        )

    event = _event(
        "skill_published",
        record,
        "Skill published after approval.",
        audit_id=audit_id,
    )
    return SkillRegistryDecision(
        trace_id=trace_id,
        audit_id=audit_id,
        registry_status="published",
        skill=record,
        issues=(),
        event=event,
        next_action=_next_action("notify_agentops_consumers", enabled=True),
        agentops_consumption=_agentops_consumption("ready_for_consumption"),
        source_of_truth=_source_of_truth(),
    )


def build_skill_transition_decision(
    record: SkillRegistryRecord,
    payload: Mapping[str, object],
    *,
    trace_id: str,
    audit_id: str,
) -> SkillRegistryDecision:
    action = _string(payload.get("transition_action"))
    issues = list(_transition_issues(payload, action, record))
    if issues:
        return SkillRegistryDecision(
            trace_id=trace_id,
            audit_id=audit_id,
            registry_status="transition_blocked",
            skill=record,
            issues=tuple(issues),
            event=None,
            next_action=_next_action("fix_transition_request", enabled=True),
            agentops_consumption=_agentops_consumption("current_record_retained"),
            source_of_truth=_source_of_truth(),
        )

    status = "deprecated" if action == "deprecate" else TERMINAL_SECURITY_STATUS
    reason = _string(payload.get("reason"))
    updated = record.with_status(status, reason)
    event_type = (
        "skill_deprecated" if status == "deprecated" else "skill_security_revoked"
    )
    next_action = (
        "notify_agentops_deprecation"
        if status == "deprecated"
        else "notify_agentops_security_revocation"
    )
    return SkillRegistryDecision(
        trace_id=trace_id,
        audit_id=audit_id,
        registry_status=status,
        skill=updated,
        issues=(),
        event=_event(
            event_type,
            updated,
            reason,
            audit_id=audit_id,
            evidence_ref=_evidence_ref(payload),
        ),
        next_action=_next_action(next_action, enabled=True),
        agentops_consumption=_agentops_consumption("notice_required"),
        source_of_truth=_source_of_truth(),
    )


def _publish_issues(
    payload: Mapping[str, object],
    candidate: Mapping[str, object],
) -> tuple[SkillRegistryIssue, ...]:
    issues: list[SkillRegistryIssue] = []
    for field in (
        "skill_id",
        "skill_version",
        "schema_ref",
        "risk_level",
        "package_id",
        "agent_id",
        "owner_team",
        "owner_user",
    ):
        if not _string(candidate.get(field)):
            issues.append(
                SkillRegistryIssue(
                    issue_id=f"{field.upper()}_REQUIRED",
                    field_path=f"skill.{field}",
                    severity="blocked",
                    reason=f"{field} is required before Skill Registry publication.",
                    impact="Skill cannot become an AgentOps-consumable registry fact.",
                    fix_action_id=f"add_{field}",
                    message_key="skillRegistry.requiredField",
                )
            )

    risk = _string(candidate.get("risk_level")).lower()
    if risk and risk not in RISK_LEVELS:
        issues.append(
            SkillRegistryIssue(
                issue_id="SKILL_RISK_LEVEL_UNSUPPORTED",
                field_path="skill.risk_level",
                severity="blocked",
                reason="Skill risk level must be one of low, medium, high, or critical.",
                impact="AgentOps cannot policy-check an unsupported risk level.",
                fix_action_id="set_supported_risk_level",
                message_key="skillRegistry.unsupportedRiskLevel",
            )
        )
    if risk in HIGH_RISK_LEVELS and not _string(candidate.get("risk_justification")):
        issues.append(
            SkillRegistryIssue(
                issue_id="SKILL_RISK_REQUIRED",
                field_path="skill.risk_justification",
                severity="blocked",
                reason="High-risk Skills require risk justification before publication.",
                impact="High-risk Skill publication cannot proceed without review context.",
                fix_action_id="add_skill_risk_justification",
                message_key="skillRegistry.riskJustificationRequired",
            )
        )

    approval_status = _string(payload.get("approval_status")).lower()
    if approval_status != "approved":
        issues.append(
            SkillRegistryIssue(
                issue_id="SKILL_APPROVAL_REQUIRED",
                field_path="approval_status",
                severity="blocked",
                reason="Owner approval is required before Skill publication.",
                impact="Unapproved candidate Skills must remain outside the registry.",
                fix_action_id="complete_owner_review",
                message_key="skillRegistry.approvalRequired",
            )
        )

    validation = payload.get("package_validation")
    validation_status = (
        _string(validation.get("validation_status")).lower()
        if isinstance(validation, Mapping)
        else ""
    )
    if validation_status != "passed":
        issues.append(
            SkillRegistryIssue(
                issue_id="PACKAGE_VALIDATION_NOT_PASSED",
                field_path="package_validation.validation_status",
                severity="blocked",
                reason="Package Validation must pass before Skill publication.",
                impact="Skill Registry cannot publish a package with unresolved validation issues.",
                fix_action_id="rerun_package_validation",
                message_key="skillRegistry.packageValidationRequired",
            )
        )
    return tuple(issues)


def _transition_issues(
    payload: Mapping[str, object],
    action: str,
    record: SkillRegistryRecord,
) -> tuple[SkillRegistryIssue, ...]:
    issues: list[SkillRegistryIssue] = []
    if record.status == TERMINAL_SECURITY_STATUS and action == "deprecate":
        issues.append(
            SkillRegistryIssue(
                issue_id="SKILL_SECURITY_REVOKED_TERMINAL",
                field_path="skill.status",
                severity="blocked",
                reason="security_revoked Skills cannot transition back to a weaker state.",
                impact="AgentOps consumers must retain the strongest security signal.",
                fix_action_id="open_security_review",
                message_key="skillRegistry.securityRevokedTerminal",
            )
        )
    if action not in {"deprecate", "security_revoke"}:
        issues.append(
            SkillRegistryIssue(
                issue_id="SKILL_TRANSITION_UNSUPPORTED",
                field_path="transition_action",
                severity="blocked",
                reason="transition_action must be deprecate or security_revoke.",
                impact="Skill Registry cannot emit an ambiguous lifecycle event.",
                fix_action_id="choose_supported_transition",
                message_key="skillRegistry.transitionUnsupported",
            )
        )
    if not _string(payload.get("reason")):
        issues.append(
            SkillRegistryIssue(
                issue_id="SKILL_TRANSITION_REASON_REQUIRED",
                field_path="reason",
                severity="blocked",
                reason="Lifecycle transitions require an auditable reason.",
                impact="Consumers cannot understand why a Skill status changed.",
                fix_action_id="add_transition_reason",
                message_key="skillRegistry.transitionReasonRequired",
            )
        )
    if action == "security_revoke" and not _evidence_ref(payload):
        issues.append(
            SkillRegistryIssue(
                issue_id="SECURITY_EVIDENCE_REQUIRED",
                field_path="security_evidence_ref",
                severity="blocked",
                reason="Security revocation requires incident or evidence reference.",
                impact="AgentOps cannot propagate security revocation without evidence.",
                fix_action_id="attach_security_evidence",
                message_key="skillRegistry.securityEvidenceRequired",
            )
        )
    return tuple(issues)


def _record_from_candidate(
    candidate: Mapping[str, object],
    *,
    status: str,
) -> SkillRegistryRecord:
    return SkillRegistryRecord(
        skill_id=_string(candidate.get("skill_id")),
        skill_version=_string(candidate.get("skill_version")),
        schema_ref=_string(candidate.get("schema_ref")),
        risk_level=_string(candidate.get("risk_level")).lower(),
        package_id=_string(candidate.get("package_id")),
        agent_id=_string(candidate.get("agent_id")),
        owner_team=_string(candidate.get("owner_team")),
        owner_user=_string(candidate.get("owner_user")),
        status=status,
        status_reason="Published after approved Package Validation.",
        risk_justification=_string(candidate.get("risk_justification")),
    )


def _event(
    event_type: str,
    record: SkillRegistryRecord,
    reason: str,
    *,
    audit_id: str,
    evidence_ref: str = "",
) -> SkillRegistryEvent:
    return SkillRegistryEvent(
        event_id=f"{event_type}-{record.skill_id}-{record.skill_version}-{audit_id}",
        event_type=event_type,
        skill_id=record.skill_id,
        skill_version=record.skill_version,
        audit_required=True,
        reason=reason,
        evidence_ref=evidence_ref,
    )


def _evidence_ref(payload: Mapping[str, object]) -> str:
    return (
        _string(payload.get("security_evidence_ref"))
        or _string(payload.get("evidence_ref"))
        or _string(payload.get("incident_id"))
    )


def _next_action(action_id: str, *, enabled: bool) -> dict[str, object]:
    return {
        "action_id": action_id,
        "target_system": "agent_store",
        "audit_required": True,
        "enabled": enabled,
    }


def _agentops_consumption(sync_status: str) -> dict[str, object]:
    return {
        "consumer": "agentops",
        "contract": "skill_registry.v1",
        "sync_status": sync_status,
        "notify_required": sync_status
        in {
            "ready_for_consumption",
            "notice_required",
        },
    }


def _source_of_truth() -> dict[str, str]:
    return {
        "skill_registry": "agent_store",
        "package_validation": "agent_store_package_validation",
        "agentops_consumption": "agentops_consumes_agent_store_registry",
    }
