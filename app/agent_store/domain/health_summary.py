from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Mapping

from agent_store import SCHEMA_VERSION

from .actions import ActionDescriptor
from .models import utc_now
from .status_registry import SEVERITIES


HEALTH_SUMMARY_FRESHNESS_SCHEMA_VERSION = "health_summary_freshness.v1"
HEALTH_STATES = frozenset({"healthy", "degraded", "unhealthy", "unknown"})


def _string(value: object) -> str:
    return value.strip() if isinstance(value, str) else ""


def _integer(value: object) -> int:
    if isinstance(value, bool):
        return 0
    if isinstance(value, int) and value >= 0:
        return value
    return 0


def _parse_datetime(value: object) -> datetime | None:
    text = _string(value)
    if not text:
        return None
    try:
        parsed = datetime.fromisoformat(text.replace("Z", "+00:00"))
    except ValueError:
        return None
    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=UTC)
    return parsed.astimezone(UTC)


@dataclass(frozen=True)
class HealthSummaryFreshnessIssue:
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
class HealthSummaryFreshness:
    trace_id: str
    audit_id: str
    agent_id: str
    agent_version: str
    health_summary_id: str
    freshness_state: str
    display_name_zh: str
    reason_code: str
    reason: str
    health_state: str
    calculated_at: str
    valid_until: str
    observed_window_start: str
    observed_window_end: str
    signal_count: int
    recommendation_basis_allowed: bool
    issues: tuple[HealthSummaryFreshnessIssue, ...]
    source_of_truth: dict[str, str]
    health_facts: dict[str, object]

    def to_response(self) -> dict[str, object]:
        return {
            "schema_version": SCHEMA_VERSION,
            "trace_id": self.trace_id,
            "error_code": "OK",
            "audit_id": self.audit_id,
            "health_summary_freshness": self.to_dict(),
        }

    def to_dict(self) -> dict[str, object]:
        return {
            "contract_schema_version": HEALTH_SUMMARY_FRESHNESS_SCHEMA_VERSION,
            "agent_id": self.agent_id,
            "agent_version": self.agent_version,
            "health_summary_id": self.health_summary_id,
            "freshness_state": self.freshness_state,
            "display_name_zh": self.display_name_zh,
            "reason_code": self.reason_code,
            "reason": self.reason,
            "health_state": self.health_state,
            "calculated_at": self.calculated_at,
            "valid_until": self.valid_until,
            "observed_window_start": self.observed_window_start,
            "observed_window_end": self.observed_window_end,
            "signal_count": self.signal_count,
            "recommendation_basis_allowed": self.recommendation_basis_allowed,
            "issues": [issue.to_dict() for issue in self.issues],
            "source_of_truth": self.source_of_truth,
            "health_facts": self.health_facts,
            "next_action": self.next_action.to_dict(),
        }

    @property
    def next_action(self) -> ActionDescriptor:
        if self.freshness_state == "health_fresh":
            return ActionDescriptor(
                action_id="continue_health_review",
                target_system="agent_store",
                enabled=True,
                requires_permission=False,
                audit_required=True,
                message_key="healthSummary.actions.continueHealthReview",
            )
        if self.freshness_state == "health_attention_required":
            return ActionDescriptor(
                action_id="view_agentops_health_detail",
                target_system="agentops",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                message_key="healthSummary.actions.viewAgentOpsHealthDetail",
            )
        if self.freshness_state in {"health_invalid", "health_refresh_required"}:
            return ActionDescriptor(
                action_id="refresh_agentops_health_summary",
                target_system="agentops",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                message_key="healthSummary.actions.refreshAgentOpsHealthSummary",
            )
        return ActionDescriptor(
            action_id="request_agentops_health_summary",
            target_system="agentops",
            enabled=True,
            requires_permission=True,
            audit_required=True,
            message_key="healthSummary.actions.requestAgentOpsHealthSummary",
        )


def build_health_summary_freshness(
    health_summary: Mapping[str, object] | None = None,
    *,
    trace_id: str,
    audit_id: str,
    now: datetime | None = None,
) -> HealthSummaryFreshness:
    now = now or utc_now()
    if not isinstance(health_summary, Mapping):
        state = "health_unavailable"
        issue = _freshness_issue(state)
        display_name, reason_code, reason = _presentation(state)
        return HealthSummaryFreshness(
            trace_id=trace_id,
            audit_id=audit_id,
            agent_id="",
            agent_version="",
            health_summary_id="",
            freshness_state=state,
            display_name_zh=display_name,
            reason_code=reason_code,
            reason=reason,
            health_state="unknown",
            calculated_at="",
            valid_until="",
            observed_window_start="",
            observed_window_end="",
            signal_count=0,
            recommendation_basis_allowed=False,
            issues=(issue,),
            source_of_truth=_source_of_truth(),
            health_facts=_health_facts(None),
        )

    health_state = _string(health_summary.get("health_state")).lower()
    calculated_at = _parse_datetime(health_summary.get("calculated_at"))
    valid_until = _parse_datetime(health_summary.get("valid_until"))
    invalid_fields = _invalid_fields(
        health_summary,
        health_state=health_state,
        calculated_at=calculated_at,
        valid_until=valid_until,
    )
    state = _freshness_state(
        health_state=health_state,
        valid_until=valid_until,
        invalid_fields=invalid_fields,
        now=now,
    )
    issue = _freshness_issue(state, invalid_fields=invalid_fields)
    display_name, reason_code, reason = _presentation(
        state,
        health_state=health_state,
    )

    return HealthSummaryFreshness(
        trace_id=trace_id,
        audit_id=audit_id,
        agent_id=_string(health_summary.get("agent_id")),
        agent_version=_string(health_summary.get("agent_version")),
        health_summary_id=_string(health_summary.get("health_summary_id")),
        freshness_state=state,
        display_name_zh=display_name,
        reason_code=reason_code,
        reason=reason,
        health_state=health_state if health_state in HEALTH_STATES else "unknown",
        calculated_at=_string(health_summary.get("calculated_at")),
        valid_until=_string(health_summary.get("valid_until")),
        observed_window_start=_string(health_summary.get("observed_window_start")),
        observed_window_end=_string(health_summary.get("observed_window_end")),
        signal_count=_integer(health_summary.get("signal_count")),
        recommendation_basis_allowed=False,
        issues=(issue,) if issue else (),
        source_of_truth=_source_of_truth(),
        health_facts=_health_facts(health_summary),
    )


def _invalid_fields(
    health_summary: Mapping[str, object],
    *,
    health_state: str,
    calculated_at: datetime | None,
    valid_until: datetime | None,
) -> tuple[str, ...]:
    invalid: list[str] = []
    for field in (
        "agent_id",
        "agent_version",
        "health_summary_id",
        "health_state",
        "calculated_at",
        "valid_until",
    ):
        if not _string(health_summary.get(field)):
            invalid.append(field)
    if health_state and health_state not in HEALTH_STATES:
        invalid.append("health_state")
    if _string(health_summary.get("calculated_at")) and calculated_at is None:
        invalid.append("calculated_at")
    if _string(health_summary.get("valid_until")) and valid_until is None:
        invalid.append("valid_until")
    return tuple(dict.fromkeys(invalid))


def _freshness_state(
    *,
    health_state: str,
    valid_until: datetime | None,
    invalid_fields: tuple[str, ...],
    now: datetime,
) -> str:
    if invalid_fields:
        return "health_invalid"
    if valid_until is None:
        return "health_invalid"
    if valid_until <= now:
        return "health_refresh_required"
    if health_state != "healthy":
        return "health_attention_required"
    return "health_fresh"


def _freshness_issue(
    state: str,
    *,
    invalid_fields: tuple[str, ...] = (),
) -> HealthSummaryFreshnessIssue | None:
    if state == "health_fresh":
        return None
    if state == "health_unavailable":
        return HealthSummaryFreshnessIssue(
            issue_id="HEALTH_SUMMARY_UNAVAILABLE",
            field_path="agentops_health_summary",
            severity="warning",
            reason="No AgentOps HealthSummary echo is available.",
            impact="Store can show catalog and Runtime facts, but must not display an effective health conclusion.",
            fix_action_id="request_agentops_health_summary",
            message_key="healthSummary.unavailable",
        )
    if state == "health_invalid":
        fields = ", ".join(invalid_fields) if invalid_fields else "valid_until"
        return HealthSummaryFreshnessIssue(
            issue_id="HEALTH_SUMMARY_INVALID",
            field_path="agentops_health_summary",
            severity="blocked",
            reason=f"AgentOps HealthSummary is missing or malformed: {fields}.",
            impact="Store must not display this HealthSummary as an effective health conclusion.",
            fix_action_id="refresh_agentops_health_summary",
            message_key="healthSummary.invalid",
        )
    if state == "health_refresh_required":
        return HealthSummaryFreshnessIssue(
            issue_id="HEALTH_SUMMARY_EXPIRED",
            field_path="agentops_health_summary.valid_until",
            severity="warning",
            reason="AgentOps HealthSummary valid_until is in the past.",
            impact="Store must show the HealthSummary as waiting for refresh.",
            fix_action_id="refresh_agentops_health_summary",
            message_key="healthSummary.expired",
        )
    return HealthSummaryFreshnessIssue(
        issue_id="AGENTOPS_HEALTH_ATTENTION",
        field_path="agentops_health_summary.health_state",
        severity="warning",
        reason="AgentOps HealthSummary is fresh but the health state requires attention.",
        impact="Store can display the AgentOps summary and route to detail, but must not compute health locally.",
        fix_action_id="view_agentops_health_detail",
        message_key="healthSummary.attentionRequired",
    )


def _presentation(
    state: str,
    *,
    health_state: str = "unknown",
) -> tuple[str, str, str]:
    if state == "health_fresh":
        return (
            "健康摘要新鲜",
            "health_fresh",
            "AgentOps HealthSummary is within valid_until and reports healthy.",
        )
    if state == "health_refresh_required":
        return (
            "待刷新",
            "health_refresh_required",
            "AgentOps HealthSummary has expired and must be refreshed before display as an effective health conclusion.",
        )
    if state == "health_attention_required":
        return (
            "健康需关注",
            "health_attention_required",
            f"AgentOps HealthSummary is fresh but reports {health_state or 'unknown'}.",
        )
    if state == "health_invalid":
        return (
            "摘要无效",
            "health_invalid",
            "AgentOps HealthSummary is missing required freshness fields or contains malformed timestamps.",
        )
    return (
        "摘要不可用",
        "health_unavailable",
        "No AgentOps HealthSummary echo is available for this Agent version.",
    )


def _source_of_truth() -> dict[str, str]:
    return {
        "health_summary": "agentops",
        "summary_projection": "agent_store",
        "recommendation": "recommendation_state_excludes_health_summary",
        "policy_decision": "agentops",
    }


def _health_facts(
    health_summary: Mapping[str, object] | None,
) -> dict[str, object]:
    if not isinstance(health_summary, Mapping):
        return {
            "health_summary_present": False,
            "agentops_trace_id": "",
            "evidence_summary_id": "",
        }
    return {
        "health_summary_present": True,
        "agentops_trace_id": _string(health_summary.get("trace_id")),
        "evidence_summary_id": _string(health_summary.get("evidence_summary_id")),
    }
