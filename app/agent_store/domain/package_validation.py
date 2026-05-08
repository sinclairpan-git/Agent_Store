from __future__ import annotations

from dataclasses import dataclass
from typing import Mapping

from agent_store import SCHEMA_VERSION
from .status_registry import SEVERITIES


PLACEHOLDER_VALUES = frozenset({"unknown", "todo", "tbd", "n/a"})
RISK_LEVELS = frozenset({"low", "medium", "high", "critical"})
HIGH_RISK_LEVELS = frozenset({"high", "critical"})


def _string(value: object) -> str:
    return value.strip() if isinstance(value, str) else ""


def _list_of_mappings(value: object) -> tuple[Mapping[str, object], ...]:
    if not isinstance(value, list):
        return ()
    return tuple(item for item in value if isinstance(item, Mapping))


@dataclass(frozen=True)
class PackageValidationIssue:
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
class FixPrompt:
    prompt_id: str
    target_field: str
    title: str
    prompt_text: str
    source_issue_id: str
    safe_to_apply_in_store: bool

    def to_dict(self) -> dict[str, object]:
        return {
            "prompt_id": self.prompt_id,
            "target_field": self.target_field,
            "title": self.title,
            "prompt_text": self.prompt_text,
            "source_issue_id": self.source_issue_id,
            "safe_to_apply_in_store": self.safe_to_apply_in_store,
        }


@dataclass(frozen=True)
class PackageValidationReport:
    trace_id: str
    audit_id: str
    package_id: str
    agent_id: str
    validation_status: str
    draft_status: str
    issues: tuple[PackageValidationIssue, ...]
    fix_prompts: tuple[FixPrompt, ...]
    source_of_truth: dict[str, str]

    def to_response(self) -> dict[str, object]:
        return {
            "schema_version": SCHEMA_VERSION,
            "trace_id": self.trace_id,
            "error_code": "OK",
            "audit_id": self.audit_id,
            "package_validation": self.to_dict(),
        }

    def to_dict(self) -> dict[str, object]:
        return {
            "package_id": self.package_id,
            "agent_id": self.agent_id,
            "validation_status": self.validation_status,
            "draft_status": self.draft_status,
            "issues": [issue.to_dict() for issue in self.issues],
            "fix_prompts": [prompt.to_dict() for prompt in self.fix_prompts],
            "source_of_truth": self.source_of_truth,
            "next_action": self.next_action,
        }

    @property
    def next_action(self) -> dict[str, object]:
        if self.validation_status == "passed":
            action_id = "submit_for_review"
        elif self.validation_status == "fixable":
            action_id = "apply_fix_prompt"
        else:
            action_id = "return_to_draft"
        return {
            "action_id": action_id,
            "target_system": "agent_store",
            "audit_required": True,
            "enabled": True,
        }


def build_package_validation_report(
    manifest: Mapping[str, object],
    *,
    trace_id: str,
    audit_id: str,
) -> PackageValidationReport:
    issues: list[PackageValidationIssue] = []
    issues.extend(_required_field_issues(manifest))
    issues.extend(_placeholder_issues(manifest))
    issues.extend(_skill_issues(manifest))
    issues.extend(_ai_source_issues(manifest))
    issues.extend(_package_evidence_issues(manifest))

    validation_status = _validation_status(issues)
    draft_status = {
        "passed": "pending_review",
        "fixable": "fixable",
        "validation_failed": "validation_failed",
    }[validation_status]
    package_id = _package_id(manifest)
    return PackageValidationReport(
        trace_id=trace_id,
        audit_id=audit_id,
        package_id=package_id,
        agent_id=_string(manifest.get("agent_id")),
        validation_status=validation_status,
        draft_status=draft_status,
        issues=tuple(issues),
        fix_prompts=tuple(_fix_prompt(issue) for issue in issues),
        source_of_truth={
            "package_manifest": "agent_store_upload_candidate",
            "validation_report": "agent_store_package_validation",
            "ai_generated_fields": "candidate_only_until_user_confirmed",
            "skill_registry": "agent_store_skill_registry_pending",
        },
    )


def _required_field_issues(
    manifest: Mapping[str, object],
) -> tuple[PackageValidationIssue, ...]:
    required = (
        "agent_id",
        "display_name",
        "owner_team",
        "owner_user",
        "version",
        "entrypoint",
    )
    return tuple(
        PackageValidationIssue(
            issue_id=f"{field.upper()}_REQUIRED",
            field_path=field,
            severity="blocked",
            reason=f"{field} is required before a draft can enter review.",
            impact="Draft cannot be submitted for review.",
            fix_action_id=f"add_{field}",
            message_key="packageValidation.requiredField",
        )
        for field in required
        if not _string(manifest.get(field))
    )


def _placeholder_issues(
    manifest: Mapping[str, object],
) -> tuple[PackageValidationIssue, ...]:
    issues: list[PackageValidationIssue] = []
    for field in ("display_name", "summary", "entrypoint", "owner_team", "owner_user"):
        value = _string(manifest.get(field))
        if value.lower() in PLACEHOLDER_VALUES or "todo" in value.lower():
            issues.append(
                PackageValidationIssue(
                    issue_id="PLACEHOLDER_VALUE_BLOCKED",
                    field_path=field,
                    severity="blocked",
                    reason="Unknown, TODO, or placeholder values cannot enter formal review.",
                    impact="Prevents low-confidence AI or placeholder metadata from becoming governance facts.",
                    fix_action_id=f"replace_{field}_placeholder",
                    message_key="packageValidation.placeholderValue",
                )
            )
    return tuple(issues)


def _skill_issues(manifest: Mapping[str, object]) -> tuple[PackageValidationIssue, ...]:
    skills = _list_of_mappings(manifest.get("skills"))
    if not skills:
        return (
            PackageValidationIssue(
                issue_id="SKILL_DECLARATION_REQUIRED",
                field_path="skills",
                severity="error",
                reason="At least one Skill declaration is required for package validation.",
                impact="AgentOps cannot consume or policy-check an undeclared Skill surface.",
                fix_action_id="add_skill_declaration",
                message_key="packageValidation.skillDeclarationRequired",
            ),
        )

    issues: list[PackageValidationIssue] = []
    for index, skill in enumerate(skills):
        prefix = f"skills[{index}]"
        if not _string(skill.get("skill_id")):
            issues.append(
                PackageValidationIssue(
                    issue_id="SKILL_ID_REQUIRED",
                    field_path=f"{prefix}.skill_id",
                    severity="blocked",
                    reason="Skill id is required before registration.",
                    impact="Skill Registry cannot create a stable identity.",
                    fix_action_id="add_skill_id",
                    message_key="packageValidation.skillIdRequired",
                )
            )
        if not _string(skill.get("skill_version")):
            issues.append(
                PackageValidationIssue(
                    issue_id="SKILL_VERSION_REQUIRED",
                    field_path=f"{prefix}.skill_version",
                    severity="error",
                    reason="Skill version is required before validation can produce a stable registry candidate.",
                    impact="Skill Registry cannot reason about compatibility without a versioned Skill identity.",
                    fix_action_id="add_skill_version",
                    message_key="packageValidation.skillVersionRequired",
                )
            )
        if not _string(skill.get("schema_ref")):
            issues.append(
                PackageValidationIssue(
                    issue_id="SKILL_SCHEMA_REQUIRED",
                    field_path=f"{prefix}.schema_ref",
                    severity="error",
                    reason="Skill schema reference is required for validation and AgentOps consumption.",
                    impact="AgentOps cannot verify action input/output contracts.",
                    fix_action_id="add_skill_schema_ref",
                    message_key="packageValidation.skillSchemaRequired",
                )
            )
        risk = _string(skill.get("risk_level")).lower()
        if risk not in RISK_LEVELS:
            issues.append(
                PackageValidationIssue(
                    issue_id="SKILL_RISK_LEVEL_REQUIRED",
                    field_path=f"{prefix}.risk_level",
                    severity="error",
                    reason="Skill risk level must be one of low, medium, high, or critical.",
                    impact="AgentOps and Owner review cannot policy-check a Skill without a stable risk level.",
                    fix_action_id="add_skill_risk_level",
                    message_key="packageValidation.skillRiskLevelRequired",
                )
            )
        if risk in HIGH_RISK_LEVELS and not _string(skill.get("risk_justification")):
            issues.append(
                PackageValidationIssue(
                    issue_id="SKILL_RISK_REQUIRED",
                    field_path=f"{prefix}.risk_justification",
                    severity="blocked",
                    reason="High-risk Skills require a plain-language risk justification.",
                    impact="High-risk publishing and approval cannot proceed without review context.",
                    fix_action_id="add_skill_risk_justification",
                    message_key="packageValidation.skillRiskRequired",
                )
            )
    return tuple(issues)


def _package_id(manifest: Mapping[str, object]) -> str:
    explicit = _string(manifest.get("package_id"))
    if explicit:
        return explicit
    agent_id = _string(manifest.get("agent_id"))
    version = _string(manifest.get("version"))
    if agent_id and version:
        return f"{agent_id}@{version}"
    return "candidate-package"


def _ai_source_issues(
    manifest: Mapping[str, object],
) -> tuple[PackageValidationIssue, ...]:
    fields = manifest.get("ai_generated_fields")
    if not isinstance(fields, list):
        return ()
    sources = manifest.get("field_sources")
    source_map = sources if isinstance(sources, Mapping) else {}
    issues: list[PackageValidationIssue] = []
    for field in (str(item) for item in fields):
        source = source_map.get(field)
        if not isinstance(source, Mapping) or not _string(source.get("source_id")):
            issues.append(
                PackageValidationIssue(
                    issue_id="AI_FIELD_SOURCE_REQUIRED",
                    field_path=f"field_sources.{field}",
                    severity="blocked",
                    reason="AI-generated metadata must declare source before it can be reviewed.",
                    impact="AI-generated text remains a candidate and cannot become a governance fact.",
                    fix_action_id="add_ai_field_source",
                    message_key="packageValidation.aiFieldSourceRequired",
                )
            )
    return tuple(issues)


def _package_evidence_issues(
    manifest: Mapping[str, object],
) -> tuple[PackageValidationIssue, ...]:
    optional_evidence = {
        "manifest_lock": "Package lock evidence is missing.",
        "sbom_ref": "SBOM reference is missing.",
        "scan_report_ref": "Static scan report is missing.",
    }
    issues: list[PackageValidationIssue] = []
    for field, reason in optional_evidence.items():
        if not _string(manifest.get(field)):
            issues.append(
                PackageValidationIssue(
                    issue_id=f"{field.upper()}_MISSING",
                    field_path=field,
                    severity="warning",
                    reason=reason,
                    impact="Review can continue, but the validation report must keep this evidence gap visible.",
                    fix_action_id=f"attach_{field}",
                    message_key="packageValidation.evidenceMissing",
                )
            )
    return tuple(issues)


def _validation_status(issues: list[PackageValidationIssue]) -> str:
    if any(issue.severity == "blocked" for issue in issues):
        return "validation_failed"
    if issues:
        return "fixable"
    return "passed"


def _fix_prompt(issue: PackageValidationIssue) -> FixPrompt:
    return FixPrompt(
        prompt_id=f"fix-{issue.issue_id.lower()}",
        target_field=issue.field_path,
        title=f"Fix {issue.field_path}",
        prompt_text=(
            f"Update `{issue.field_path}` so the package validation issue "
            f"`{issue.issue_id}` is resolved. Preserve auditability and do not invent "
            "governance facts that are not present in the package or owner input."
        ),
        source_issue_id=issue.issue_id,
        safe_to_apply_in_store=issue.severity in {"warning", "error"},
    )
