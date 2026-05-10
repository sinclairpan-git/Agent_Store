from __future__ import annotations

from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from datetime import UTC, datetime

from agent_store import SCHEMA_VERSION

from .actions import ActionDescriptor
from .models import utc_now
from .status_registry import SEVERITIES


QUALITY_EVIDENCE_ACCESS_SCHEMA_VERSION = "quality_evidence_access_summary.v1"
DEFAULT_EVIDENCE_VAULT_REQUEST_URL = "/evidence-vault/access-requests"
DEFAULT_ACCEPTED_SCORE_TEMPLATE_IDS = ("agentops-owned",)


def _string(value: object) -> str:
    return value.strip() if isinstance(value, str) else ""


def _bool(value: object) -> bool:
    return value is True


def _string_list(value: object) -> tuple[str, ...]:
    if not isinstance(value, Sequence) or isinstance(value, (str, bytes)):
        return ()
    return tuple(
        item.strip() for item in value if isinstance(item, str) and item.strip()
    )


def _float_or_none(value: object) -> float | None:
    if isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        number = float(value)
        if 0 <= number <= 1:
            return number
    return None


def _parse_datetime(value: object) -> datetime | None:
    if isinstance(value, datetime):
        parsed = value
        return parsed if parsed.tzinfo is not None else parsed.replace(tzinfo=UTC)
    text = _string(value)
    if not text:
        return None
    try:
        parsed = datetime.fromisoformat(text.replace("Z", "+00:00"))
    except ValueError:
        return None
    return parsed if parsed.tzinfo is not None else parsed.replace(tzinfo=UTC)


@dataclass(frozen=True)
class QualityEvidenceAccessIssue:
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
class QualityEvidenceAccessSummary:
    trace_id: str
    audit_id: str
    agent_id: str
    agent_version: str
    summary_state: str
    permission_state: str
    display: dict[str, object]
    run_binding: dict[str, object]
    access: dict[str, object]
    raw_trace_exposed: bool
    raw_evidence_exposed: bool
    recommendation_basis_allowed: bool
    issues: tuple[QualityEvidenceAccessIssue, ...]
    source_of_truth: dict[str, str]

    def to_response(self) -> dict[str, object]:
        return {
            "schema_version": SCHEMA_VERSION,
            "trace_id": self.trace_id,
            "error_code": "OK",
            "audit_id": self.audit_id,
            "quality_evidence_access_summary": self.to_dict(),
        }

    def to_dict(self) -> dict[str, object]:
        return {
            "contract_schema_version": QUALITY_EVIDENCE_ACCESS_SCHEMA_VERSION,
            "agent_id": self.agent_id,
            "agent_version": self.agent_version,
            "summary_state": self.summary_state,
            "permission_state": self.permission_state,
            "display": self.display,
            "run_binding": self.run_binding,
            "access": self.access,
            "raw_trace_exposed": self.raw_trace_exposed,
            "raw_evidence_exposed": self.raw_evidence_exposed,
            "recommendation_basis_allowed": self.recommendation_basis_allowed,
            "issues": [issue.to_dict() for issue in self.issues],
            "source_of_truth": self.source_of_truth,
            "next_action": self.next_action.to_dict(),
        }

    @property
    def next_action(self) -> ActionDescriptor:
        if self.summary_state == "summary_redacted":
            return ActionDescriptor(
                action_id="request_evidence_access",
                target_system="evidence_vault",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                href=_string(self.access.get("request_access_url")) or None,
                message_key="qualityEvidenceAccess.actions.requestEvidenceAccess",
            )
        if self.summary_state in {"summary_expired", "summary_unavailable"}:
            return ActionDescriptor(
                action_id="refresh_agentops_quality_summary",
                target_system="agentops",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                message_key="qualityEvidenceAccess.actions.refreshAgentOpsSummary",
            )
        if self.summary_state == "template_deprecated":
            return ActionDescriptor(
                action_id="request_score_template_refresh",
                target_system="agentops",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                message_key="qualityEvidenceAccess.actions.refreshScoreTemplate",
            )
        if _bool(self.access.get("evidence_vault_request_required")):
            return ActionDescriptor(
                action_id="request_raw_evidence_access",
                target_system="evidence_vault",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                href=_string(self.access.get("request_access_url")) or None,
                message_key="qualityEvidenceAccess.actions.requestRawEvidenceAccess",
            )
        return ActionDescriptor(
            action_id="continue_quality_evidence_review",
            target_system="agent_store",
            enabled=True,
            requires_permission=True,
            audit_required=True,
            message_key="qualityEvidenceAccess.actions.continueReview",
        )


def build_quality_evidence_access_summary(
    *,
    agentops_summary: Mapping[str, object] | None,
    viewer_context: Mapping[str, object] | None = None,
    trace_id: str,
    audit_id: str,
    accepted_score_template_ids: Sequence[str] = DEFAULT_ACCEPTED_SCORE_TEMPLATE_IDS,
) -> QualityEvidenceAccessSummary:
    summary = agentops_summary if isinstance(agentops_summary, Mapping) else {}
    viewer = viewer_context if isinstance(viewer_context, Mapping) else {}
    quality = _mapping(summary.get("quality_evidence")) or _mapping(
        summary.get("quality_summary")
    )
    run = _mapping(summary.get("run_evidence")) or {}
    can_view_summary = viewer.get("can_view_quality_summary") is True
    can_view_raw_evidence = _bool(viewer.get("can_view_raw_evidence"))
    request_access_url = (
        _string(viewer.get("request_access_url")) or DEFAULT_EVIDENCE_VAULT_REQUEST_URL
    )
    accepted_templates = {
        template for template in accepted_score_template_ids if _string(template)
    }
    issues = tuple(
        _issues(
            summary,
            quality=quality,
            can_view_summary=can_view_summary,
            accepted_score_template_ids=accepted_templates,
        )
    )
    summary_state = _summary_state(
        quality=quality,
        can_view_summary=can_view_summary,
        accepted_score_template_ids=accepted_templates,
    )
    permission_state = (
        "summary_redacted"
        if not can_view_summary
        else "allowed"
        if quality
        else "unavailable"
    )
    return QualityEvidenceAccessSummary(
        trace_id=trace_id,
        audit_id=audit_id,
        agent_id=_string(summary.get("agent_id")),
        agent_version=_string(summary.get("agent_version")),
        summary_state=summary_state,
        permission_state=permission_state,
        display=_display(
            quality,
            redacted=not can_view_summary,
        ),
        run_binding={
            "run_id": _string(run.get("run_id")),
            "session_id": _string(run.get("session_id")),
            "evidence_summary_id": _string(run.get("evidence_summary_id")),
            "source_event_count": _source_event_count(run),
        },
        access={
            "can_view_quality_summary": can_view_summary,
            "can_view_raw_evidence": can_view_raw_evidence,
            "evidence_vault_request_required": not can_view_raw_evidence,
            "request_access_url": "" if can_view_raw_evidence else request_access_url,
            "raw_trace_url": "",
            "raw_evidence_url": "",
        },
        raw_trace_exposed=False,
        raw_evidence_exposed=False,
        recommendation_basis_allowed=summary_state == "summary_ready",
        issues=issues,
        source_of_truth={
            "quality_summary": "agentops",
            "run_evidence": "agentops",
            "raw_evidence": "evidence_vault",
            "raw_trace": "evidence_vault",
            "permission": "agent_store_viewer_context",
            "projection": "agent_store",
        },
    )


def _mapping(value: object) -> Mapping[str, object] | None:
    return value if isinstance(value, Mapping) else None


def _summary_state(
    *,
    quality: Mapping[str, object] | None,
    can_view_summary: bool,
    accepted_score_template_ids: set[str],
) -> str:
    if not quality:
        return "summary_unavailable"
    if not can_view_summary:
        return "summary_redacted"
    if _quality_expired(quality):
        return "summary_expired"
    if _string(quality.get("score_template_id")) not in accepted_score_template_ids:
        return "template_deprecated"
    return "summary_ready"


def _quality_expired(quality: Mapping[str, object]) -> bool:
    if _string(quality.get("summary_validity_state")) == "expired":
        return True
    valid_until = _parse_datetime(quality.get("valid_until"))
    return valid_until is not None and valid_until <= utc_now()


def _display(
    quality: Mapping[str, object] | None,
    *,
    redacted: bool,
) -> dict[str, object]:
    if not quality:
        return {
            "evidence_level": "unavailable",
            "confidence": None,
            "identity_confidence": None,
            "missing_evidence": ["agentops_quality_summary"],
            "score_template_id": "",
            "calculated_at": "",
            "valid_until": "",
            "summary_validity_state": "degraded",
            "display_label": "待刷新",
            "redacted": False,
        }
    valid_until = _string(quality.get("valid_until"))
    validity = (
        "expired"
        if _quality_expired(quality)
        else _string(quality.get("summary_validity_state")) or "fresh"
    )
    return {
        "evidence_level": "redacted"
        if redacted
        else _string(quality.get("evidence_level")),
        "confidence": None if redacted else _float_or_none(quality.get("confidence")),
        "identity_confidence": None
        if redacted
        else _float_or_none(quality.get("identity_confidence")),
        "missing_evidence": list(_string_list(quality.get("missing_evidence"))),
        "score_template_id": _string(quality.get("score_template_id")),
        "calculated_at": _string(quality.get("calculated_at")),
        "valid_until": valid_until,
        "summary_validity_state": validity,
        "display_label": "待刷新" if validity == "expired" else "可展示",
        "redacted": redacted,
    }


def _source_event_count(run: Mapping[str, object]) -> int:
    value = run.get("source_event_count")
    if isinstance(value, int) and value >= 0:
        return value
    return len(_string_list(run.get("source_event_ids")))


def _issues(
    summary: Mapping[str, object],
    *,
    quality: Mapping[str, object] | None,
    can_view_summary: bool,
    accepted_score_template_ids: set[str],
) -> list[QualityEvidenceAccessIssue]:
    issues: list[QualityEvidenceAccessIssue] = []
    if not quality:
        issues.append(
            _issue(
                "AGENTOPS_QUALITY_SUMMARY_REQUIRED",
                "agentops_summary.quality_evidence",
            )
        )
        return issues
    if not can_view_summary:
        issues.append(_issue("QUALITY_SUMMARY_REDACTED", "viewer_context"))
    if _quality_expired(quality):
        issues.append(_issue("QUALITY_SUMMARY_EXPIRED", "quality_evidence.valid_until"))
    if _string(quality.get("score_template_id")) not in accepted_score_template_ids:
        issues.append(
            _issue("SCORE_TEMPLATE_DEPRECATED", "quality_evidence.score_template_id")
        )
    if _contains_raw_link(summary):
        issues.append(
            _issue("RAW_EVIDENCE_LINK_STRIPPED", "agentops_summary.raw_links")
        )
    return issues


def _contains_raw_link(value: object) -> bool:
    if isinstance(value, Mapping):
        for key, item in value.items():
            if key in {"raw_trace_url", "raw_evidence_url"} and _string(item):
                return True
            if _contains_raw_link(item):
                return True
    if isinstance(value, Sequence) and not isinstance(value, (str, bytes)):
        return any(_contains_raw_link(item) for item in value)
    return False


def _issue(issue_id: str, field_path: str) -> QualityEvidenceAccessIssue:
    data = {
        "AGENTOPS_QUALITY_SUMMARY_REQUIRED": (
            "AgentOps quality evidence summary is required.",
            "Store cannot present a trusted quality summary.",
            "refresh_agentops_quality_summary",
            "qualityEvidenceAccess.agentopsSummaryRequired",
            "blocked",
        ),
        "QUALITY_SUMMARY_REDACTED": (
            "Viewer is not authorized to inspect quality evidence detail.",
            "Store returns a redacted summary and routes raw access to Evidence Vault.",
            "request_evidence_access",
            "qualityEvidenceAccess.summaryRedacted",
            "warning",
        ),
        "QUALITY_SUMMARY_EXPIRED": (
            "AgentOps quality evidence valid_until is expired.",
            "Store must display the summary as pending refresh.",
            "refresh_agentops_quality_summary",
            "qualityEvidenceAccess.summaryExpired",
            "warning",
        ),
        "SCORE_TEMPLATE_DEPRECATED": (
            "The AgentOps score_template_id is not accepted by this Store projection.",
            "Store may display degraded context but cannot treat it as current quality evidence.",
            "request_score_template_refresh",
            "qualityEvidenceAccess.scoreTemplateDeprecated",
            "warning",
        ),
        "RAW_EVIDENCE_LINK_STRIPPED": (
            "Raw Trace or Evidence links were provided and stripped.",
            "Store never exposes raw evidence or trace URLs from this projection.",
            "strip_raw_evidence_links",
            "qualityEvidenceAccess.rawEvidenceLinkStripped",
            "warning",
        ),
    }[issue_id]
    reason, impact, fix_action_id, message_key, severity = data
    return QualityEvidenceAccessIssue(
        issue_id=issue_id,
        field_path=field_path,
        severity=severity,
        reason=reason,
        impact=impact,
        fix_action_id=fix_action_id,
        message_key=message_key,
    )
