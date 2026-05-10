from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass
from typing import Mapping

from agent_store import SCHEMA_VERSION

from .actions import ActionDescriptor
from .status_registry import SEVERITIES


NOTIFICATION_ROUTING_SCHEMA_VERSION = "notification_routing_summary.v1"
NOTIFICATION_EVENTS = frozenset(
    {
        "installation_failed",
        "approval_required",
        "feedback_owner_replied",
        "lifecycle_replacement_available",
        "security_revoked",
    }
)
SUPPORTED_CHANNELS = frozenset(
    {
        "notification_center",
        "task_center",
        "wecom",
        "risk_list",
        "owner_dashboard",
        "audit_log",
    }
)
DEFAULT_CHANNELS = {
    "installation_failed": ("notification_center", "owner_dashboard"),
    "approval_required": ("task_center", "wecom", "notification_center"),
    "feedback_owner_replied": ("notification_center",),
    "lifecycle_replacement_available": ("notification_center", "owner_dashboard"),
    "security_revoked": ("risk_list", "wecom", "notification_center", "audit_log"),
}


def _string(value: object) -> str:
    return value.strip() if isinstance(value, str) else ""


def _string_list(value: object) -> tuple[str, ...]:
    if not isinstance(value, Sequence) or isinstance(value, (str, bytes)):
        return ()
    return tuple(
        item.strip() for item in value if isinstance(item, str) and item.strip()
    )


def _contains_invalid_string_list_items(value: object) -> bool:
    if not isinstance(value, Sequence) or isinstance(value, (str, bytes)):
        return False
    return any(not isinstance(item, str) or not item.strip() for item in value)


@dataclass(frozen=True)
class NotificationRoutingIssue:
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
class NotificationRoutingSummary:
    trace_id: str
    audit_id: str
    event_id: str
    event_type: str
    agent_id: str
    agent_version: str
    routing_state: str
    delivery_status: str
    channels: tuple[dict[str, object], ...]
    audience: dict[str, object]
    routing_rule: dict[str, object]
    issues: tuple[NotificationRoutingIssue, ...]
    source_of_truth: dict[str, str]

    def to_response(self) -> dict[str, object]:
        return {
            "schema_version": SCHEMA_VERSION,
            "trace_id": self.trace_id,
            "error_code": "OK",
            "audit_id": self.audit_id,
            "notification_routing_summary": self.to_dict(),
        }

    def to_dict(self) -> dict[str, object]:
        return {
            "contract_schema_version": NOTIFICATION_ROUTING_SCHEMA_VERSION,
            "event_id": self.event_id,
            "event_type": self.event_type,
            "agent_id": self.agent_id,
            "agent_version": self.agent_version,
            "routing_state": self.routing_state,
            "delivery_status": self.delivery_status,
            "channels": list(self.channels),
            "audience": self.audience,
            "routing_rule": self.routing_rule,
            "issues": [issue.to_dict() for issue in self.issues],
            "source_of_truth": self.source_of_truth,
            "next_action": self.next_action.to_dict(),
        }

    @property
    def next_action(self) -> ActionDescriptor:
        if self.routing_state == "routing_blocked":
            return ActionDescriptor(
                action_id="fix_notification_routing_context",
                target_system="agent_store",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                message_key="notificationRouting.actions.fixContext",
            )
        if self.routing_state == "routing_degraded":
            return ActionDescriptor(
                action_id="review_notification_route",
                target_system="agent_store",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                message_key="notificationRouting.actions.reviewRoute",
            )
        return ActionDescriptor(
            action_id="enqueue_notification_route",
            target_system="agent_store",
            enabled=True,
            requires_permission=True,
            audit_required=True,
            message_key="notificationRouting.actions.enqueueRoute",
        )


def build_notification_routing_summary(
    *,
    event_context: Mapping[str, object] | None,
    audience_context: Mapping[str, object] | None = None,
    trace_id: str,
    audit_id: str,
) -> NotificationRoutingSummary:
    event = event_context if isinstance(event_context, Mapping) else {}
    audience_context = audience_context if isinstance(audience_context, Mapping) else {}
    event_type = _string(event.get("event_type"))
    supported_event = event_type in NOTIFICATION_EVENTS
    response_event_type = event_type if supported_event else "installation_failed"
    channels = _channels(event, response_event_type)
    issues = tuple(_issues(event, audience_context, event_type, channels, audit_id))
    routing_state = _routing_state(issues)

    return NotificationRoutingSummary(
        trace_id=trace_id,
        audit_id=audit_id,
        event_id=_string(event.get("event_id")),
        event_type=response_event_type,
        agent_id=_string(event.get("agent_id")),
        agent_version=_string(event.get("agent_version")),
        routing_state=routing_state,
        delivery_status="not_sent",
        channels=tuple(
            _channel_payloads(channels, enabled=routing_state != "routing_blocked")
        ),
        audience=_audience(audience_context),
        routing_rule=_routing_rule(response_event_type, routing_state),
        issues=issues,
        source_of_truth={
            "event": "agent_store_event",
            "audience": "trusted_iam_or_owner_directory",
            "delivery": "notification_center_not_sent_by_store",
            "policy": "agentops_not_overridden",
            "projection": "agent_store",
        },
    )


def _channels(event: Mapping[str, object], event_type: str) -> tuple[str, ...]:
    has_requested_channels = "requested_channels" in event
    requested = _string_list(event.get("requested_channels"))
    values = (
        requested if has_requested_channels else DEFAULT_CHANNELS.get(event_type, ())
    )
    deduped: list[str] = []
    for value in values:
        if value in SUPPORTED_CHANNELS and value not in deduped:
            deduped.append(value)
    if event_type == "security_revoked" and "risk_list" not in deduped:
        deduped.insert(0, "risk_list")
    return tuple(deduped)


def _issues(
    event: Mapping[str, object],
    audience_context: Mapping[str, object],
    event_type: str,
    channels: tuple[str, ...],
    audit_id: str,
) -> list[NotificationRoutingIssue]:
    issues: list[NotificationRoutingIssue] = []
    if event_type not in NOTIFICATION_EVENTS:
        issues.append(
            _issue("NOTIFICATION_EVENT_UNSUPPORTED", "event_context.event_type")
        )
    if not _string(event.get("event_id")):
        issues.append(
            _issue("NOTIFICATION_EVENT_ID_REQUIRED", "event_context.event_id")
        )
    if not _string(event.get("agent_id")):
        issues.append(_issue("AGENT_ID_REQUIRED", "event_context.agent_id"))
    if not audit_id:
        issues.append(_issue("AUDIT_ID_REQUIRED", "audit_id"))
    if not _audience_ids(audience_context):
        issues.append(_issue("TRUSTED_AUDIENCE_REQUIRED", "audience_context"))
    requested_value = event.get("requested_channels")
    requested_channels = _string_list(requested_value)
    unsupported = [
        channel for channel in requested_channels if channel not in SUPPORTED_CHANNELS
    ]
    if unsupported or _contains_invalid_string_list_items(requested_value):
        issues.append(
            _issue(
                "NOTIFICATION_CHANNEL_UNSUPPORTED", "event_context.requested_channels"
            )
        )
    if not channels:
        issues.append(
            _issue("NOTIFICATION_CHANNEL_REQUIRED", "event_context.requested_channels")
        )
    if (
        event_type == "security_revoked"
        and "risk_list" not in requested_channels
        and "requested_channels" in event
    ):
        issues.append(
            _issue("RISK_LIST_CHANNEL_FORCED", "event_context.requested_channels")
        )
    return issues


def _routing_state(issues: tuple[NotificationRoutingIssue, ...]) -> str:
    if any(issue.severity == "blocked" for issue in issues):
        return "routing_blocked"
    if issues:
        return "routing_degraded"
    return "routing_ready"


def _channel_payloads(
    channels: tuple[str, ...],
    *,
    enabled: bool,
) -> list[dict[str, object]]:
    return [
        {
            "channel": channel,
            "enabled": enabled,
            "delivery_status": "not_sent",
            "target_system": _channel_target(channel),
        }
        for channel in channels
    ]


def _channel_target(channel: str) -> str:
    if channel == "risk_list":
        return "risk_center"
    if channel == "task_center":
        return "agentops"
    return (
        "notification_center"
        if channel in {"notification_center", "wecom"}
        else "agent_store"
    )


def _audience(audience_context: Mapping[str, object]) -> dict[str, object]:
    user_ids = _string_list(audience_context.get("user_ids"))
    owner_team_ids = _string_list(audience_context.get("owner_team_ids"))
    security_group_ids = _string_list(audience_context.get("security_group_ids"))
    return {
        "trusted_audience": bool(user_ids or owner_team_ids or security_group_ids),
        "user_ids": list(user_ids),
        "owner_team_ids": list(owner_team_ids),
        "security_group_ids": list(security_group_ids),
        "audience_source": _string(audience_context.get("audience_source"))
        or "trusted_iam_or_owner_directory",
    }


def _audience_ids(audience_context: Mapping[str, object]) -> tuple[str, ...]:
    return (
        _string_list(audience_context.get("user_ids"))
        + _string_list(audience_context.get("owner_team_ids"))
        + _string_list(audience_context.get("security_group_ids"))
    )


def _routing_rule(event_type: str, routing_state: str) -> dict[str, object]:
    data = {
        "installation_failed": ("immediate", "notify_user_and_owner"),
        "approval_required": ("immediate", "create_task_center_entry"),
        "feedback_owner_replied": ("best_effort", "notify_feedback_submitter"),
        "lifecycle_replacement_available": (
            "daily_digest",
            "notify_affected_installations",
        ),
        "security_revoked": ("immediate", "notify_risk_and_security"),
    }
    sla, rule_id = data[event_type]
    return {
        "rule_id": rule_id,
        "sla": sla,
        "requires_audit": True,
        "delivery_confirmation_required": event_type
        in {"approval_required", "security_revoked"},
        "delivery_allowed": routing_state == "routing_ready",
    }


def _issue(issue_id: str, field_path: str) -> NotificationRoutingIssue:
    data = {
        "NOTIFICATION_EVENT_UNSUPPORTED": (
            "Notification event type is unsupported.",
            "Store cannot choose a stable notification route.",
            "refresh_notification_event",
            "notificationRouting.unsupportedEvent",
            "blocked",
        ),
        "NOTIFICATION_EVENT_ID_REQUIRED": (
            "Notification event_id is required.",
            "Store cannot deduplicate or audit the notification route.",
            "attach_event_id",
            "notificationRouting.eventIdRequired",
            "blocked",
        ),
        "AGENT_ID_REQUIRED": (
            "agent_id is required.",
            "Notification cannot be linked back to an Agent detail page.",
            "attach_agent_id",
            "notificationRouting.agentIdRequired",
            "blocked",
        ),
        "AUDIT_ID_REQUIRED": (
            "audit_id is required.",
            "Notification routing must remain auditable.",
            "attach_audit_id",
            "notificationRouting.auditIdRequired",
            "blocked",
        ),
        "TRUSTED_AUDIENCE_REQUIRED": (
            "Trusted audience is required.",
            "Store must not route notifications to client-supplied or empty audiences.",
            "refresh_audience_from_iam",
            "notificationRouting.trustedAudienceRequired",
            "blocked",
        ),
        "NOTIFICATION_CHANNEL_UNSUPPORTED": (
            "One or more requested channels are unsupported and were ignored.",
            "Some requested destinations cannot be routed.",
            "choose_supported_notification_channels",
            "notificationRouting.unsupportedChannel",
            "warning",
        ),
        "NOTIFICATION_CHANNEL_REQUIRED": (
            "At least one supported channel is required.",
            "No notification route can be prepared.",
            "choose_supported_notification_channels",
            "notificationRouting.channelRequired",
            "blocked",
        ),
        "RISK_LIST_CHANNEL_FORCED": (
            "security_revoked notifications must include risk_list.",
            "Security revocation must enter the risk list even if callers omitted it.",
            "include_risk_list_channel",
            "notificationRouting.riskListForced",
            "warning",
        ),
    }[issue_id]
    reason, impact, fix_action_id, message_key, severity = data
    return NotificationRoutingIssue(
        issue_id=issue_id,
        field_path=field_path,
        severity=severity,
        reason=reason,
        impact=impact,
        fix_action_id=fix_action_id,
        message_key=message_key,
    )
