from __future__ import annotations

from dataclasses import dataclass
from typing import Mapping

from agent_store import SCHEMA_VERSION

from .actions import ActionDescriptor
from .status_registry import SEVERITIES


FEEDBACK_OWNER_RESPONSE_LOOP_SCHEMA_VERSION = "feedback_owner_response_loop.v1"
FEEDBACK_STATES = frozenset(
    {
        "submitted",
        "triaged",
        "owner_replied",
        "planned",
        "fixed",
        "rejected",
        "released",
    }
)
TRANSITIONS = {
    "submit": {"new", ""},
    "triage": {"submitted"},
    "owner_reply": {"triaged"},
    "plan": {"owner_replied"},
    "fix": {"planned"},
    "reject": {"owner_replied", "planned"},
    "release": {"fixed"},
}
TRANSITION_TARGETS = {
    "submit": "submitted",
    "triage": "triaged",
    "owner_reply": "owner_replied",
    "plan": "planned",
    "fix": "fixed",
    "reject": "rejected",
    "release": "released",
}
OWNER_ACTIONS = frozenset({"owner_reply", "plan", "fix", "reject", "release"})


def _string(value: object) -> str:
    return value.strip() if isinstance(value, str) else ""


@dataclass(frozen=True)
class FeedbackLoopIssue:
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
class FeedbackOwnerResponseLoop:
    trace_id: str
    audit_id: str
    feedback_id: str
    agent_id: str
    agent_version: str
    feedback_state: str
    previous_state: str
    transition_action: str
    feedback: dict[str, object]
    owner_response: dict[str, object]
    release_linkage: dict[str, object]
    timeline: tuple[dict[str, object], ...]
    issues: tuple[FeedbackLoopIssue, ...]
    source_of_truth: dict[str, str]

    def to_response(self) -> dict[str, object]:
        return {
            "schema_version": SCHEMA_VERSION,
            "trace_id": self.trace_id,
            "error_code": "OK",
            "audit_id": self.audit_id,
            "feedback_owner_response_loop": self.to_dict(),
        }

    def to_dict(self) -> dict[str, object]:
        return {
            "contract_schema_version": FEEDBACK_OWNER_RESPONSE_LOOP_SCHEMA_VERSION,
            "feedback_id": self.feedback_id,
            "agent_id": self.agent_id,
            "agent_version": self.agent_version,
            "feedback_state": self.feedback_state,
            "previous_state": self.previous_state,
            "transition_action": self.transition_action,
            "feedback": self.feedback,
            "owner_response": self.owner_response,
            "release_linkage": self.release_linkage,
            "timeline": list(self.timeline),
            "issues": [issue.to_dict() for issue in self.issues],
            "source_of_truth": self.source_of_truth,
            "next_action": self.next_action.to_dict(),
        }

    @property
    def next_action(self) -> ActionDescriptor:
        action_map = {
            "submitted": ("triage_feedback", "agent_store"),
            "triaged": ("request_owner_response", "agent_store"),
            "owner_replied": ("plan_or_reject_feedback", "agent_store"),
            "planned": ("mark_feedback_fixed", "agent_store"),
            "fixed": ("attach_release", "agent_store"),
            "rejected": ("view_feedback_decision", "agent_store"),
            "released": ("view_release_notes", "agent_store"),
        }
        action_id, target_system = action_map.get(
            self.feedback_state,
            ("return_to_feedback_queue", "agent_store"),
        )
        return ActionDescriptor(
            action_id=action_id,
            target_system=target_system,
            enabled=not self.issues,
            requires_permission=self.feedback_state not in {"rejected", "released"},
            audit_required=True,
            message_key=f"feedbackLoop.actions.{action_id}",
        )


def build_feedback_owner_response_loop(
    *,
    feedback: Mapping[str, object],
    transition: Mapping[str, object],
    trace_id: str,
    audit_id: str,
) -> FeedbackOwnerResponseLoop:
    action = _string(transition.get("transition_action"))
    current_state = _string(feedback.get("feedback_state")) or "new"
    issues = tuple(_transition_issues(feedback, transition, current_state, action))
    next_state = current_state if issues else TRANSITION_TARGETS[action]

    feedback_id = _string(feedback.get("feedback_id")) or _string(
        transition.get("feedback_id")
    )
    agent_id = _string(feedback.get("agent_id")) or _string(transition.get("agent_id"))
    agent_version = _string(feedback.get("agent_version")) or _string(
        transition.get("agent_version")
    )
    event = _event_snapshot(
        feedback_id=feedback_id,
        action=action,
        state=next_state,
        transition=transition,
        audit_id=audit_id,
        trace_id=trace_id,
    )
    timeline = tuple(_existing_timeline(feedback) + [event])

    return FeedbackOwnerResponseLoop(
        trace_id=trace_id,
        audit_id=audit_id,
        feedback_id=feedback_id,
        agent_id=agent_id,
        agent_version=agent_version,
        feedback_state=next_state,
        previous_state=current_state,
        transition_action=action,
        feedback=_feedback_snapshot(feedback, feedback_id, agent_id, agent_version),
        owner_response=_owner_response_snapshot(transition, action),
        release_linkage=_release_linkage_snapshot(transition, next_state),
        timeline=timeline,
        issues=issues,
        source_of_truth={
            "feedback": "agent_store_feedback",
            "owner_response": "agent_store_owner_response",
            "release_linkage": "agent_store_release_linkage",
            "notifications": "agent_store_notification_queue",
        },
    )


def _transition_issues(
    feedback: Mapping[str, object],
    transition: Mapping[str, object],
    current_state: str,
    action: str,
) -> list[FeedbackLoopIssue]:
    issues: list[FeedbackLoopIssue] = []
    if action not in TRANSITIONS:
        issues.append(
            _issue("INVALID_TRANSITION_ACTION", "transition.transition_action")
        )
    elif current_state not in TRANSITIONS[action]:
        issues.append(_issue("INVALID_FEEDBACK_TRANSITION", "feedback.feedback_state"))
    required_fields = ("feedback_id", "agent_id", "agent_version")
    for field in required_fields:
        if not _string(feedback.get(field)) and not _string(transition.get(field)):
            issues.append(_issue("FEEDBACK_IDENTITY_REQUIRED", field))
    if not _string(transition.get("actor_id")):
        issues.append(_issue("ACTOR_REQUIRED", "transition.actor_id"))
    if not _string(transition.get("message")):
        issues.append(_issue("TRANSITION_MESSAGE_REQUIRED", "transition.message"))
    if action in OWNER_ACTIONS and _string(transition.get("actor_role")) != "owner":
        issues.append(_issue("OWNER_RESPONSE_REQUIRED", "transition.actor_role"))
    if action == "release" and not _string(transition.get("release_ref")):
        issues.append(_issue("RELEASE_LINK_REQUIRED", "transition.release_ref"))
    return issues


def _issue(issue_id: str, field_path: str) -> FeedbackLoopIssue:
    data = {
        "INVALID_TRANSITION_ACTION": (
            "Unsupported feedback transition action.",
            "Store cannot apply an unknown feedback lifecycle action.",
            "choose_supported_transition",
            "feedbackLoop.invalidTransitionAction",
        ),
        "INVALID_FEEDBACK_TRANSITION": (
            "Feedback transition is not allowed from the current state.",
            "Prevents lifecycle jumps that bypass triage or owner response.",
            "choose_allowed_transition",
            "feedbackLoop.invalidFeedbackTransition",
        ),
        "FEEDBACK_IDENTITY_REQUIRED": (
            "Feedback identity fields are required.",
            "Store cannot audit a feedback lifecycle event without stable identity.",
            "attach_feedback_identity",
            "feedbackLoop.feedbackIdentityRequired",
        ),
        "ACTOR_REQUIRED": (
            "Actor id is required for feedback lifecycle events.",
            "Owner response and triage actions must be attributable.",
            "attach_actor",
            "feedbackLoop.actorRequired",
        ),
        "TRANSITION_MESSAGE_REQUIRED": (
            "Transition message is required.",
            "Users need an explainable owner or triage response.",
            "attach_transition_message",
            "feedbackLoop.transitionMessageRequired",
        ),
        "OWNER_RESPONSE_REQUIRED": (
            "Owner role is required for owner response lifecycle actions.",
            "Prevents non-owner actors from closing the owner response loop.",
            "request_owner_response",
            "feedbackLoop.ownerResponseRequired",
        ),
        "RELEASE_LINK_REQUIRED": (
            "Release reference is required before marking feedback released.",
            "Users need a concrete release linkage for fixed feedback.",
            "attach_release_link",
            "feedbackLoop.releaseLinkRequired",
        ),
    }[issue_id]
    reason, impact, fix_action_id, message_key = data
    return FeedbackLoopIssue(
        issue_id=issue_id,
        field_path=field_path,
        severity="blocked",
        reason=reason,
        impact=impact,
        fix_action_id=fix_action_id,
        message_key=message_key,
    )


def _feedback_snapshot(
    feedback: Mapping[str, object],
    feedback_id: str,
    agent_id: str,
    agent_version: str,
) -> dict[str, object]:
    return {
        "feedback_id": feedback_id,
        "agent_id": agent_id,
        "agent_version": agent_version,
        "feedback_state": _string(feedback.get("feedback_state")) or "new",
        "title": _string(feedback.get("title")),
        "feedback_type": _string(feedback.get("feedback_type")) or "general",
        "severity": _string(feedback.get("severity")) or "info",
        "submitted_by": _string(feedback.get("submitted_by")),
    }


def _owner_response_snapshot(
    transition: Mapping[str, object],
    action: str,
) -> dict[str, object]:
    return {
        "owner_response_required": action in OWNER_ACTIONS,
        "actor_id": _string(transition.get("actor_id")),
        "actor_role": _string(transition.get("actor_role")),
        "message": _string(transition.get("message")),
        "commitment": _string(transition.get("commitment")),
    }


def _release_linkage_snapshot(
    transition: Mapping[str, object],
    state: str,
) -> dict[str, object]:
    return {
        "release_required": state == "released",
        "release_ref": _string(transition.get("release_ref")),
        "release_version": _string(transition.get("release_version")),
        "released_at": _string(transition.get("released_at")),
    }


def _event_snapshot(
    *,
    feedback_id: str,
    action: str,
    state: str,
    transition: Mapping[str, object],
    audit_id: str,
    trace_id: str,
) -> dict[str, object]:
    return {
        "event_id": _string(transition.get("event_id"))
        or f"feedback-event-{feedback_id}-{action}",
        "transition_action": action,
        "result_state": state,
        "actor_id": _string(transition.get("actor_id")),
        "actor_role": _string(transition.get("actor_role")),
        "message": _string(transition.get("message")),
        "occurred_at": _string(transition.get("occurred_at")),
        "audit_id": audit_id,
        "trace_id": trace_id,
    }


def _existing_timeline(feedback: Mapping[str, object]) -> list[dict[str, object]]:
    value = feedback.get("timeline")
    if not isinstance(value, list):
        return []
    return [dict(item) for item in value if isinstance(item, Mapping)]
