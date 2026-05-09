from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Mapping

from agent_store import SCHEMA_VERSION

from .actions import ActionDescriptor
from .status_registry import SEVERITIES


DRAFT_REVIEW_SUBMISSION_SCHEMA_VERSION = "draft_review_submission.v1"
PLACEHOLDER_VALUES = frozenset({"unknown", "todo", "tbd", "n/a"})


def _string(value: object) -> str:
    return value.strip() if isinstance(value, str) else ""


def _mapping(value: object) -> Mapping[str, object]:
    return value if isinstance(value, Mapping) else {}


@dataclass(frozen=True)
class DraftReviewSubmissionIssue:
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
class DraftReviewSubmission:
    trace_id: str
    audit_id: str
    submission_id: str
    package_id: str
    agent_id: str
    submission_state: str
    draft_status: str
    owner_confirmation: dict[str, object]
    validation_summary: dict[str, object]
    runtime_gate: dict[str, object]
    review_queue_entry: dict[str, object]
    issues: tuple[DraftReviewSubmissionIssue, ...]
    source_of_truth: dict[str, str]

    def to_response(self) -> dict[str, object]:
        return {
            "schema_version": SCHEMA_VERSION,
            "trace_id": self.trace_id,
            "error_code": "OK",
            "audit_id": self.audit_id,
            "draft_review_submission": self.to_dict(),
        }

    def to_dict(self) -> dict[str, object]:
        return {
            "contract_schema_version": DRAFT_REVIEW_SUBMISSION_SCHEMA_VERSION,
            "submission_id": self.submission_id,
            "package_id": self.package_id,
            "agent_id": self.agent_id,
            "submission_state": self.submission_state,
            "draft_status": self.draft_status,
            "review_queue_entry": self.review_queue_entry,
            "owner_confirmation": self.owner_confirmation,
            "validation_summary": self.validation_summary,
            "runtime_gate": self.runtime_gate,
            "issues": [issue.to_dict() for issue in self.issues],
            "source_of_truth": self.source_of_truth,
            "next_action": self.next_action.to_dict(),
        }

    @property
    def next_action(self) -> ActionDescriptor:
        if self.submission_state == "pending_review":
            return ActionDescriptor(
                action_id="track_review_queue",
                target_system="agent_store",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                message_key="draftReview.actions.trackReviewQueue",
            )
        if self.submission_state == "runtime_gate_blocked":
            return ActionDescriptor(
                action_id="resolve_runtime_gate",
                target_system="agent_runtime",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                message_key="draftReview.actions.resolveRuntimeGate",
            )
        if self.submission_state == "owner_confirmation_required":
            return ActionDescriptor(
                action_id="confirm_owner_submission",
                target_system="agent_store",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                message_key="draftReview.actions.confirmOwnerSubmission",
            )
        return ActionDescriptor(
            action_id="return_to_validation_report",
            target_system="agent_store",
            enabled=True,
            requires_permission=True,
            audit_required=True,
            message_key="draftReview.actions.returnToValidationReport",
        )


def build_draft_review_submission(
    *,
    listing_wizard: Mapping[str, object],
    owner_confirmation: Mapping[str, object],
    trace_id: str,
    audit_id: str,
) -> DraftReviewSubmission:
    validation = _mapping(listing_wizard.get("validation_report"))
    detail_preview = _mapping(listing_wizard.get("detail_preview"))
    field_confirmation = _mapping(listing_wizard.get("field_confirmation"))

    issues: list[DraftReviewSubmissionIssue] = []
    issues.extend(_validation_issues(validation))
    issues.extend(_placeholder_issues(field_confirmation, detail_preview))
    issues.extend(_runtime_issues(listing_wizard, detail_preview))
    issues.extend(_owner_confirmation_issues(owner_confirmation, field_confirmation))

    submission_state = _submission_state(tuple(issues))
    package_id = _string(validation.get("package_id")) or "candidate-package"
    agent_id = _string(detail_preview.get("agent_id"))
    draft_status = (
        "pending_review"
        if submission_state == "pending_review"
        else "draft_review_blocked"
    )

    return DraftReviewSubmission(
        trace_id=trace_id,
        audit_id=audit_id,
        submission_id=f"draft-review-{package_id}",
        package_id=package_id,
        agent_id=agent_id,
        submission_state=submission_state,
        draft_status=draft_status,
        review_queue_entry=_review_queue_entry(package_id, submission_state),
        owner_confirmation=_owner_confirmation_snapshot(owner_confirmation),
        validation_summary=_validation_summary(validation),
        runtime_gate=_runtime_gate(detail_preview),
        issues=tuple(issues),
        source_of_truth={
            "package_manifest": "agent_store_upload_candidate",
            "package_validation": "agent_store_package_validation",
            "owner_confirmation": "agent_store_owner_explicit_confirmation",
            "runtime_availability": "agent_runtime_echo_or_probe",
            "draft_review_queue": "agent_store",
            "policy_decision": "agentops_not_evaluated_until_review",
        },
    )


def _validation_issues(
    validation: Mapping[str, object],
) -> tuple[DraftReviewSubmissionIssue, ...]:
    if _string(validation.get("step_state")) == "passed":
        return ()
    return (
        DraftReviewSubmissionIssue(
            issue_id="PACKAGE_VALIDATION_NOT_PASSED",
            field_path="validation_report.step_state",
            severity="blocked",
            reason="Package validation must pass before a draft can enter review.",
            impact="Prevents incomplete or unsafe package metadata from becoming review facts.",
            fix_action_id="return_to_validation_report",
            message_key="draftReview.packageValidationNotPassed",
        ),
    )


def _placeholder_issues(
    field_confirmation: Mapping[str, object],
    detail_preview: Mapping[str, object],
) -> tuple[DraftReviewSubmissionIssue, ...]:
    issues: list[DraftReviewSubmissionIssue] = []
    preview_fields = (
        "display_name",
        "summary",
        "owner_team",
    )
    for field in preview_fields:
        if _contains_placeholder_token(_string(detail_preview.get(field))):
            issues.append(_placeholder_issue(f"detail_preview.{field}", field))

    fields = field_confirmation.get("fields")
    if isinstance(fields, list):
        for index, field in enumerate(fields):
            if not isinstance(field, Mapping):
                continue
            value = _string(field.get("value"))
            field_path = _string(field.get("field_path")) or f"fields[{index}]"
            if _contains_placeholder_token(value):
                issues.append(
                    _placeholder_issue(
                        f"field_confirmation.fields[{index}].value",
                        field_path,
                    )
                )
    return tuple(issues)


def _placeholder_issue(field_path: str, fix_field: str) -> DraftReviewSubmissionIssue:
    return DraftReviewSubmissionIssue(
        issue_id="PLACEHOLDER_VALUE_BLOCKED",
        field_path=field_path,
        severity="blocked",
        reason="Unknown, TODO, TBD, or N/A values cannot enter formal review.",
        impact="Prevents placeholder metadata from becoming governance review facts.",
        fix_action_id=f"replace_{fix_field}_placeholder",
        message_key="draftReview.placeholderValue",
    )


def _runtime_issues(
    listing_wizard: Mapping[str, object],
    detail_preview: Mapping[str, object],
) -> tuple[DraftReviewSubmissionIssue, ...]:
    runtime_state = _string(detail_preview.get("runtime_availability_state"))
    wizard_state = _string(listing_wizard.get("wizard_state"))
    if runtime_state == "runtime_ready" and wizard_state != "runtime_gate_blocked":
        return ()
    return (
        DraftReviewSubmissionIssue(
            issue_id="RUNTIME_GATE_NOT_READY",
            field_path="detail_preview.runtime_availability_state",
            severity="blocked",
            reason="Runtime availability must be ready before review submission.",
            impact="Prevents review from approving packages that Runtime cannot consume.",
            fix_action_id="resolve_runtime_gate",
            message_key="draftReview.runtimeGateNotReady",
        ),
    )


def _owner_confirmation_issues(
    owner_confirmation: Mapping[str, object],
    field_confirmation: Mapping[str, object],
) -> tuple[DraftReviewSubmissionIssue, ...]:
    confirmed = owner_confirmation.get("confirmed") is True
    confirmed_by = _string(owner_confirmation.get("confirmed_by"))
    confirmed_at = _string(owner_confirmation.get("confirmed_at"))
    fields_confirmed = _string(field_confirmation.get("step_state")) == "confirmed"
    if confirmed and confirmed_by and confirmed_at and fields_confirmed:
        return ()
    return (
        DraftReviewSubmissionIssue(
            issue_id="OWNER_CONFIRMATION_REQUIRED",
            field_path="owner_confirmation",
            severity="blocked",
            reason="Owner must explicitly confirm the listing fields before review.",
            impact="Prevents candidate or AI-derived fields from becoming review facts without owner accountability.",
            fix_action_id="confirm_owner_submission",
            message_key="draftReview.ownerConfirmationRequired",
        ),
    )


def _contains_placeholder_token(value: str) -> bool:
    normalized = value.lower().strip()
    if normalized in PLACEHOLDER_VALUES:
        return True
    if re.search(r"(?<![a-z0-9])n/a(?![a-z0-9])", normalized):
        return True
    return bool(set(re.findall(r"[a-z0-9]+", normalized)) & PLACEHOLDER_VALUES)


def _submission_state(issues: tuple[DraftReviewSubmissionIssue, ...]) -> str:
    issue_ids = {issue.issue_id for issue in issues}
    if issue_ids & {"PACKAGE_VALIDATION_NOT_PASSED", "PLACEHOLDER_VALUE_BLOCKED"}:
        return "validation_blocked"
    if "RUNTIME_GATE_NOT_READY" in issue_ids:
        return "runtime_gate_blocked"
    if "OWNER_CONFIRMATION_REQUIRED" in issue_ids:
        return "owner_confirmation_required"
    return "pending_review"


def _owner_confirmation_snapshot(
    owner_confirmation: Mapping[str, object],
) -> dict[str, object]:
    return {
        "confirmed": owner_confirmation.get("confirmed") is True,
        "confirmed_by": _string(owner_confirmation.get("confirmed_by")),
        "confirmed_at": _string(owner_confirmation.get("confirmed_at")),
        "confirmation_basis": _string(owner_confirmation.get("confirmation_basis"))
        or "owner_reviewed_listing_wizard",
    }


def _validation_summary(validation: Mapping[str, object]) -> dict[str, object]:
    return {
        "validation_status": _string(validation.get("step_state")),
        "draft_status_before_submission": _string(validation.get("draft_status")),
        "issue_count": int(validation.get("issue_count") or 0),
        "fix_prompt_count": int(validation.get("fix_prompt_count") or 0),
    }


def _runtime_gate(detail_preview: Mapping[str, object]) -> dict[str, object]:
    return {
        "runtime_availability_state": _string(
            detail_preview.get("runtime_availability_state")
        ),
        "runtime_display_name_zh": _string(
            detail_preview.get("runtime_display_name_zh")
        ),
    }


def _review_queue_entry(package_id: str, submission_state: str) -> dict[str, object]:
    if submission_state != "pending_review":
        return {
            "queue_state": "not_enqueued",
            "review_status": "not_submitted",
        }
    return {
        "queue_state": "enqueued",
        "review_status": "pending_review",
        "review_queue_id": f"review-{package_id}",
    }
