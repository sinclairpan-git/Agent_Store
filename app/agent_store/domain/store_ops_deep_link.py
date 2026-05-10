from __future__ import annotations

from dataclasses import dataclass
from typing import Mapping

from agent_store import SCHEMA_VERSION

from .actions import ActionDescriptor
from .status_registry import SEVERITIES


STORE_OPS_DEEP_LINK_SCHEMA_VERSION = "store_ops_deep_link.v1"


def _string(value: object) -> str:
    return value.strip() if isinstance(value, str) else ""


def _bool(value: object) -> bool:
    return value is True


@dataclass(frozen=True)
class StoreOpsDeepLinkIssue:
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
class StoreOpsDeepLink:
    trace_id: str
    audit_id: str
    agent_id: str
    agent_version: str
    health_summary_id: str
    run_id: str
    session_id: str
    evidence_summary_id: str
    link_state: str
    permission_state: str
    target: dict[str, object]
    return_path: str
    raw_trace_exposed: bool
    raw_evidence_exposed: bool
    issues: tuple[StoreOpsDeepLinkIssue, ...]
    source_of_truth: dict[str, str]

    def to_response(self) -> dict[str, object]:
        return {
            "schema_version": SCHEMA_VERSION,
            "trace_id": self.trace_id,
            "error_code": "OK",
            "audit_id": self.audit_id,
            "store_ops_deep_link": self.to_dict(),
        }

    def to_dict(self) -> dict[str, object]:
        return {
            "contract_schema_version": STORE_OPS_DEEP_LINK_SCHEMA_VERSION,
            "agent_id": self.agent_id,
            "agent_version": self.agent_version,
            "health_summary_id": self.health_summary_id,
            "run_id": self.run_id,
            "session_id": self.session_id,
            "evidence_summary_id": self.evidence_summary_id,
            "link_state": self.link_state,
            "permission_state": self.permission_state,
            "target": self.target,
            "return_path": self.return_path,
            "raw_trace_exposed": self.raw_trace_exposed,
            "raw_evidence_exposed": self.raw_evidence_exposed,
            "issues": [issue.to_dict() for issue in self.issues],
            "source_of_truth": self.source_of_truth,
            "next_action": self.next_action.to_dict(),
        }

    @property
    def next_action(self) -> ActionDescriptor:
        if self.link_state == "deep_link_ready":
            return ActionDescriptor(
                action_id="open_agentops_run_detail",
                target_system="agentops",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                href=_string(self.target.get("href")) or None,
                message_key="storeOpsDeepLink.actions.openRunDetail",
            )
        if self.link_state == "permission_required":
            return ActionDescriptor(
                action_id="request_evidence_access",
                target_system="evidence_vault",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                href="/evidence-vault/access-requests",
                message_key="storeOpsDeepLink.actions.requestEvidenceAccess",
            )
        if self.link_state == "link_sanitized":
            return ActionDescriptor(
                action_id="open_sanitized_agentops_run_detail",
                target_system="agentops",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                href=_string(self.target.get("href")) or None,
                message_key="storeOpsDeepLink.actions.openSanitizedRunDetail",
            )
        return ActionDescriptor(
            action_id="request_agentops_summary_with_run_binding",
            target_system="agentops",
            enabled=True,
            requires_permission=True,
            audit_required=True,
            message_key="storeOpsDeepLink.actions.requestRunBinding",
        )


def build_store_ops_deep_link(
    *,
    health_summary: Mapping[str, object] | None,
    viewer_context: Mapping[str, object] | None = None,
    trace_id: str,
    audit_id: str,
) -> StoreOpsDeepLink:
    summary = health_summary if isinstance(health_summary, Mapping) else {}
    viewer = viewer_context if isinstance(viewer_context, Mapping) else {}
    run_id = _string(summary.get("run_id"))
    session_id = _string(summary.get("session_id"))
    can_view_detail = _bool(viewer.get("can_view_agentops_run_detail"))
    return_path = _string(viewer.get("return_path")) or "/agent-store/agents"
    issues = tuple(_issues(summary, run_id=run_id, session_id=session_id))

    if not run_id or not session_id:
        link_state = "link_unavailable"
        permission_state = "unavailable"
    elif not can_view_detail:
        link_state = "permission_required"
        permission_state = "evidence_vault_required"
    elif any(issue.issue_id == "RAW_TRACE_LINK_STRIPPED" for issue in issues):
        link_state = "link_sanitized"
        permission_state = "allowed"
    else:
        link_state = "deep_link_ready"
        permission_state = "allowed"

    return StoreOpsDeepLink(
        trace_id=trace_id,
        audit_id=audit_id,
        agent_id=_string(summary.get("agent_id")),
        agent_version=_string(summary.get("agent_version")),
        health_summary_id=_string(summary.get("health_summary_id")),
        run_id=run_id,
        session_id=session_id,
        evidence_summary_id=_string(summary.get("evidence_summary_id")),
        link_state=link_state,
        permission_state=permission_state,
        target=_target(
            summary,
            run_id=run_id,
            session_id=session_id,
            return_path=return_path,
            enabled=link_state in {"deep_link_ready", "link_sanitized"},
        ),
        return_path=return_path,
        raw_trace_exposed=False,
        raw_evidence_exposed=False,
        issues=issues,
        source_of_truth={
            "health_summary": "agentops",
            "run_detail": "agentops",
            "permission": "agent_store_viewer_context",
            "raw_trace": "evidence_vault",
            "projection": "agent_store",
        },
    )


def _target(
    summary: Mapping[str, object],
    *,
    run_id: str,
    session_id: str,
    return_path: str,
    enabled: bool,
) -> dict[str, object]:
    base_url = _string(summary.get("agentops_run_detail_url"))
    href = ""
    if enabled:
        href = base_url or f"/agentops/runs/{run_id}"
    return {
        "system": "agentops",
        "route": "run_detail",
        "href": href,
        "params": {
            "run_id": run_id,
            "session_id": session_id,
            "return_path": return_path,
        },
        "raw_trace_url": "",
        "raw_evidence_url": "",
    }


def _issues(
    summary: Mapping[str, object],
    *,
    run_id: str,
    session_id: str,
) -> list[StoreOpsDeepLinkIssue]:
    issues: list[StoreOpsDeepLinkIssue] = []
    if not run_id:
        issues.append(_issue("RUN_ID_REQUIRED", "agentops_health_summary.run_id"))
    if not session_id:
        issues.append(
            _issue("SESSION_ID_REQUIRED", "agentops_health_summary.session_id")
        )
    if _string(summary.get("raw_trace_url")) or _string(
        summary.get("raw_evidence_url")
    ):
        issues.append(_issue("RAW_TRACE_LINK_STRIPPED", "agentops_raw_links"))
    return issues


def _issue(issue_id: str, field_path: str) -> StoreOpsDeepLinkIssue:
    data = {
        "RUN_ID_REQUIRED": (
            "AgentOps run_id is required to open Run Detail.",
            "Store cannot create an auditable AgentOps deep link.",
            "request_agentops_summary_with_run_binding",
            "storeOpsDeepLink.runIdRequired",
            "blocked",
        ),
        "SESSION_ID_REQUIRED": (
            "AgentOps session_id is required to open Run Detail.",
            "Store cannot preserve run/session binding on navigation.",
            "request_agentops_summary_with_run_binding",
            "storeOpsDeepLink.sessionIdRequired",
            "blocked",
        ),
        "RAW_TRACE_LINK_STRIPPED": (
            "Raw trace or evidence URLs were provided and stripped.",
            "Store only exposes sanitized Run Detail navigation or Evidence Vault access.",
            "strip_raw_trace_links",
            "storeOpsDeepLink.rawTraceStripped",
            "warning",
        ),
    }[issue_id]
    reason, impact, fix_action_id, message_key, severity = data
    return StoreOpsDeepLinkIssue(
        issue_id=issue_id,
        field_path=field_path,
        severity=severity,
        reason=reason,
        impact=impact,
        fix_action_id=fix_action_id,
        message_key=message_key,
    )
