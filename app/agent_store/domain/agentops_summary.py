from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

from agent_store import SCHEMA_VERSION
from .models import utc_now


SUMMARY_VALIDITY_STATES = frozenset({"fresh", "stale", "expired", "degraded"})
APPROVAL_STATUSES = frozenset(
    {"not_required", "pending", "approved", "rejected", "expired", "revoked"}
)


@dataclass(frozen=True)
class QualityEvidenceSummary:
    evidence_level: str
    confidence: float
    missing_evidence: tuple[str, ...]
    score_template_id: str
    calculated_at: datetime
    valid_until: datetime
    summary_validity_state: str = "fresh"
    identity_confidence: float | None = None
    degraded_reason: str | None = None
    redacted: bool = False

    def __post_init__(self) -> None:
        if not 0 <= self.confidence <= 1:
            raise ValueError("confidence must be between 0 and 1")
        if self.summary_validity_state not in SUMMARY_VALIDITY_STATES:
            raise ValueError(f"unsupported summary_validity_state: {self.summary_validity_state}")
        if self.identity_confidence is not None and not 0 <= self.identity_confidence <= 1:
            raise ValueError("identity_confidence must be between 0 and 1")

    def is_expired(self, now: datetime | None = None) -> bool:
        return self.valid_until <= (now or utc_now())

    def effective_validity_state(self, now: datetime | None = None) -> str:
        if self.is_expired(now):
            return "expired"
        return self.summary_validity_state

    def to_dict(self, *, now: datetime | None = None) -> dict[str, object]:
        data: dict[str, object] = {
            "evidence_level": self.evidence_level,
            "confidence": self.confidence,
            "missing_evidence": list(self.missing_evidence),
            "score_template_id": self.score_template_id,
            "calculated_at": self.calculated_at.isoformat(),
            "valid_until": self.valid_until.isoformat(),
            "summary_validity_state": self.effective_validity_state(now),
        }
        if self.identity_confidence is not None:
            data["identity_confidence"] = self.identity_confidence
        if self.degraded_reason is not None:
            data["degraded_reason"] = self.degraded_reason
        if self.redacted:
            data["redacted"] = True
        return data


@dataclass(frozen=True)
class RunEvidenceSummary:
    run_id: str
    session_id: str
    evidence_summary_id: str
    source_event_ids: tuple[str, ...]
    trace_id: str
    source_event_count: int | None = None
    last_verified_at: datetime | None = None

    def to_dict(self) -> dict[str, object]:
        data: dict[str, object] = {
            "run_id": self.run_id,
            "session_id": self.session_id,
            "evidence_summary_id": self.evidence_summary_id,
            "source_event_ids": list(self.source_event_ids),
            "trace_id": self.trace_id,
            "source_event_count": (
                self.source_event_count
                if self.source_event_count is not None
                else len(self.source_event_ids)
            ),
        }
        if self.last_verified_at is not None:
            data["last_verified_at"] = self.last_verified_at.isoformat()
        return data


@dataclass(frozen=True)
class L5GateSummary:
    l5_gate_result: str
    violation_scan_completed: bool
    missing_requirements: tuple[str, ...] = ()

    @property
    def actual_l5_display_allowed(self) -> bool:
        return self.l5_gate_result == "passed" and self.violation_scan_completed

    def to_dict(self) -> dict[str, object]:
        return {
            "l5_gate_result": self.l5_gate_result,
            "violation_scan_completed": self.violation_scan_completed,
            "actual_l5_display_allowed": self.actual_l5_display_allowed,
            "missing_requirements": list(self.missing_requirements),
        }


@dataclass(frozen=True)
class GovernanceLoadSummary:
    adapter_state: str
    load_verification_method: str
    verified_at: datetime | None = None
    evidence_hash: str | None = None
    degraded_reason: str | None = None
    unsupported_reason: str | None = None

    def to_dict(self) -> dict[str, object]:
        data: dict[str, object] = {
            "adapter_state": self.adapter_state,
            "load_verification_method": self.load_verification_method,
        }
        optional = {
            "verified_at": self.verified_at.isoformat() if self.verified_at else None,
            "evidence_hash": self.evidence_hash,
            "degraded_reason": self.degraded_reason,
            "unsupported_reason": self.unsupported_reason,
        }
        data.update({key: value for key, value in optional.items() if value is not None})
        return data


@dataclass(frozen=True)
class ApprovalSummary:
    approval_id: str
    status: str
    audit_id: str
    sla: str | None = None
    decision: str | None = None
    expires_at: datetime | None = None
    permission_state: str | None = None
    request_access_url: str | None = None

    def __post_init__(self) -> None:
        if self.status not in APPROVAL_STATUSES:
            raise ValueError(f"unsupported approval status: {self.status}")

    def is_expired(self, now: datetime | None = None) -> bool:
        return self.expires_at is not None and self.expires_at <= (now or utc_now())

    def effective_status(self, now: datetime | None = None) -> str:
        if self.is_expired(now):
            return "expired"
        return self.status

    def to_dict(self, *, now: datetime | None = None) -> dict[str, object]:
        data: dict[str, object] = {
            "approval_id": self.approval_id,
            "status": self.effective_status(now),
            "audit_id": self.audit_id,
        }
        optional = {
            "sla": self.sla,
            "decision": self.decision,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "permission_state": self.permission_state,
            "request_access_url": self.request_access_url,
        }
        data.update({key: value for key, value in optional.items() if value is not None})
        return data


@dataclass(frozen=True)
class RuntimePolicySummary:
    policy_ref: str
    fallback_action: str
    runtime_risk_level: str
    enforcement_mode: str
    degraded_reason: str | None = None

    def to_dict(self) -> dict[str, object]:
        data: dict[str, object] = {
            "policy_ref": self.policy_ref,
            "fallback_action": self.fallback_action,
            "runtime_risk_level": self.runtime_risk_level,
            "enforcement_mode": self.enforcement_mode,
        }
        if self.degraded_reason is not None:
            data["degraded_reason"] = self.degraded_reason
        return data


@dataclass(frozen=True)
class CredentialBootstrapSummary:
    bootstrap_status: str
    credential_status: str
    reporter_status: str
    enterprise_state: str
    degraded_reason: str | None = None

    def to_dict(self) -> dict[str, object]:
        data: dict[str, object] = {
            "bootstrap_status": self.bootstrap_status,
            "credential_status": self.credential_status,
            "reporter_status": self.reporter_status,
            "enterprise_state": self.enterprise_state,
        }
        if self.degraded_reason is not None:
            data["degraded_reason"] = self.degraded_reason
        return data


@dataclass(frozen=True)
class CrossSystemLink:
    rel: str
    target_system: str
    href: str
    trace_id: str
    audit_id: str | None = None
    permission_state: str | None = None
    redaction_reason: str | None = None

    def to_dict(self) -> dict[str, object]:
        data: dict[str, object] = {
            "rel": self.rel,
            "target_system": self.target_system,
            "href": self.href,
            "trace_id": self.trace_id,
        }
        optional = {
            "audit_id": self.audit_id,
            "permission_state": self.permission_state,
            "redaction_reason": self.redaction_reason,
        }
        data.update({key: value for key, value in optional.items() if value is not None})
        return data


@dataclass(frozen=True)
class AgentOpsSummaryBundle:
    trace_id: str
    quality_evidence: QualityEvidenceSummary
    run_evidence: RunEvidenceSummary
    approval: ApprovalSummary
    runtime_policy: RuntimePolicySummary
    links: tuple[CrossSystemLink, ...]
    credential_bootstrap: CredentialBootstrapSummary | None = None
    l5_gate: L5GateSummary | None = None
    governance_load: GovernanceLoadSummary | None = None
    permission_state: str = "allowed"
    redaction_reason: str | None = None
    request_access_url: str | None = None
    return_url: str | None = None

    def error_code(self, *, now: datetime | None = None) -> str:
        if self.approval.effective_status(now) == "expired":
            return "APPROVAL_EXPIRED"
        return "OK"

    def to_response(self, *, now: datetime | None = None) -> dict[str, object]:
        body: dict[str, object] = {
            "schema_version": SCHEMA_VERSION,
            "trace_id": self.trace_id,
            "error_code": self.error_code(now=now),
            "quality_evidence": self.quality_evidence.to_dict(now=now),
            "run_evidence": self.run_evidence.to_dict(),
            "approval": self.approval.to_dict(now=now),
            "runtime_policy": self.runtime_policy.to_dict(),
            "links": [link.to_dict() for link in self.links],
            "permission_state": self.permission_state,
        }
        if self.credential_bootstrap is not None:
            body["credential_bootstrap"] = self.credential_bootstrap.to_dict()
        if self.l5_gate is not None:
            body["l5_gate"] = self.l5_gate.to_dict()
        if self.governance_load is not None:
            body["governance_load"] = self.governance_load.to_dict()
        optional = {
            "redaction_reason": self.redaction_reason,
            "request_access_url": self.request_access_url,
            "return_url": self.return_url,
        }
        body.update({key: value for key, value in optional.items() if value is not None})
        return body


def empty_run_evidence(trace_id: str) -> RunEvidenceSummary:
    return RunEvidenceSummary(
        run_id="pending",
        session_id="pending",
        evidence_summary_id="pending",
        source_event_ids=(),
        trace_id=trace_id,
    )


def pending_quality_summary(trace_id: str) -> QualityEvidenceSummary:
    now = utc_now()
    return QualityEvidenceSummary(
        evidence_level="pending_sync",
        confidence=0,
        missing_evidence=("agentops_summary",),
        score_template_id="agentops-owned",
        calculated_at=now,
        valid_until=now,
        summary_validity_state="degraded",
        degraded_reason=f"agentops_unavailable:{trace_id}",
    )
