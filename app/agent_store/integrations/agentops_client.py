from __future__ import annotations

from dataclasses import replace
from datetime import timedelta

from agent_store.domain.agentops_summary import (
    AgentOpsSummaryBundle,
    ApprovalSummary,
    CredentialBootstrapSummary,
    CrossSystemLink,
    GovernanceLoadSummary,
    L5GateSummary,
    QualityEvidenceSummary,
    RunEvidenceSummary,
    RuntimePolicySummary,
    empty_run_evidence,
    pending_quality_summary,
)
from agent_store.domain.models import utc_now


class AgentOpsUnavailableError(RuntimeError):
    """Raised by test/provider fakes when AgentOps cannot be reached."""


class AgentOpsCredentialIssueClient:
    """Consumes AgentOps credential echo responses without issuing credentials."""

    def __init__(
        self,
        responses: dict[str, dict[str, object]] | None = None,
    ) -> None:
        self._responses = responses or {}
        self.unavailable = False

    def register_response(
        self,
        bootstrap_id: str,
        response: dict[str, object],
    ) -> None:
        self._responses[bootstrap_id] = dict(response)

    def issue_credentials(
        self,
        handoff: dict[str, object],
        *,
        headers: dict[str, str],
    ) -> CredentialBootstrapSummary:
        if self.unavailable:
            raise AgentOpsUnavailableError("agentops credential issue unavailable")
        self._validate_handoff(handoff, headers=headers)
        bootstrap_id = str(handoff["bootstrap_id"])
        response = self._responses.get(bootstrap_id)
        if response is None:
            raise AgentOpsUnavailableError(
                f"agentops credential response not registered: {bootstrap_id}"
            )
        return CredentialBootstrapSummary.from_agentops_credential_response(response)

    @staticmethod
    def _validate_handoff(
        handoff: dict[str, object],
        *,
        headers: dict[str, str],
    ) -> None:
        if handoff.get("schema_version") != "agentops_credential_handoff.v1":
            raise ValueError("schema_version must be agentops_credential_handoff.v1")
        bootstrap_id = handoff.get("bootstrap_id")
        if not isinstance(bootstrap_id, str) or not bootstrap_id:
            raise ValueError("bootstrap_id must be a non-empty string")
        has_idempotency_key = any(
            name.lower() == "idempotency-key" and value
            for name, value in headers.items()
        )
        if not has_idempotency_key:
            raise ValueError("Idempotency-Key header is required")
        assertion = handoff.get("installation_assertion")
        if not isinstance(assertion, dict):
            raise ValueError("installation_assertion must be provided by Agent Store")
        device_proof = handoff.get("device_proof")
        if not isinstance(device_proof, dict):
            raise ValueError("device_proof must be provided by Ai_AutoSDLC")
        if assertion.get("assertion_version") != "signed_installation_assertion.v1":
            raise ValueError(
                "installation_assertion must use signed_installation_assertion.v1"
            )
        if device_proof.get("proof_version") != "device_proof.v1":
            raise ValueError("device_proof must use device_proof.v1")
        if assertion.get("assertion_hash") != device_proof.get("assertion_hash"):
            raise ValueError(
                "device_proof must bind to installation_assertion.assertion_hash"
            )


class AgentOpsSummaryClient:
    def __init__(
        self,
        summaries: dict[tuple[str, str], AgentOpsSummaryBundle] | None = None,
    ) -> None:
        self._summaries = summaries or {}
        self.unavailable = False

    def register_summary(
        self,
        agent_id: str,
        version: str,
        summary: AgentOpsSummaryBundle,
    ) -> None:
        self._summaries[(agent_id, version)] = summary

    def get_summary(
        self,
        agent_id: str,
        version: str,
        *,
        trace_id: str,
        raw_evidence_allowed: bool = True,
    ) -> AgentOpsSummaryBundle:
        if self.unavailable:
            return self._degraded_summary(trace_id)
        summary = self._summaries.get((agent_id, version))
        if summary is not None:
            summary = self._with_trace(summary, trace_id)
        else:
            summary = self._default_summary(trace_id)
        if raw_evidence_allowed:
            return summary
        return self._redacted_summary(summary, trace_id=trace_id)

    @staticmethod
    def _degraded_summary(trace_id: str) -> AgentOpsSummaryBundle:
        return AgentOpsSummaryBundle(
            trace_id=trace_id,
            quality_evidence=pending_quality_summary(trace_id),
            run_evidence=empty_run_evidence(trace_id),
            approval=ApprovalSummary(
                approval_id="pending",
                status="pending",
                audit_id=f"audit-{trace_id}",
            ),
            runtime_policy=RuntimePolicySummary(
                policy_ref="agentops-unavailable",
                fallback_action="warn",
                runtime_risk_level="medium",
                enforcement_mode="observe",
                degraded_reason="enterprise_evidence_pending_sync",
            ),
            credential_bootstrap=CredentialBootstrapSummary(
                bootstrap_status="not_started",
                credential_status="expired",
                reporter_status="degraded",
                enterprise_state="degraded",
                degraded_reason="agentops_unavailable",
            ),
            l5_gate=L5GateSummary(
                l5_gate_result="pending",
                violation_scan_completed=False,
                missing_requirements=("agentops_summary",),
            ),
            governance_load=GovernanceLoadSummary(
                adapter_state="materialized",
                load_verification_method="AGENTS.md",
            ),
            links=(
                CrossSystemLink(
                    rel="return_to_store",
                    target_system="agent_store",
                    href="/official-apps/framework.ai-autosdlc",
                    trace_id=trace_id,
                ),
            ),
            permission_state="allowed",
        )

    @staticmethod
    def _default_summary(trace_id: str) -> AgentOpsSummaryBundle:
        now = utc_now()
        return AgentOpsSummaryBundle(
            trace_id=trace_id,
            quality_evidence=QualityEvidenceSummary(
                evidence_level="L5-capable",
                confidence=0.82,
                missing_evidence=(),
                score_template_id="agentops-owned",
                calculated_at=now,
                valid_until=now + timedelta(hours=1),
                identity_confidence=0.98,
            ),
            run_evidence=RunEvidenceSummary(
                run_id="run-1",
                session_id="session-1",
                evidence_summary_id="evidence-1",
                source_event_ids=("event-1",),
                trace_id=trace_id,
            ),
            approval=ApprovalSummary(
                approval_id="approval-1",
                status="approved",
                audit_id="audit-1",
            ),
            runtime_policy=RuntimePolicySummary(
                policy_ref="policy-1",
                fallback_action="warn",
                runtime_risk_level="low",
                enforcement_mode="warn",
            ),
            credential_bootstrap=CredentialBootstrapSummary(
                bootstrap_status="signature_verified",
                credential_status="active",
                reporter_status="sent",
                enterprise_state="active",
            ),
            l5_gate=L5GateSummary(
                l5_gate_result="passed",
                violation_scan_completed=True,
            ),
            governance_load=GovernanceLoadSummary(
                adapter_state="materialized",
                load_verification_method="AGENTS.md",
            ),
            links=(
                CrossSystemLink(
                    rel="evidence_summary",
                    target_system="agentops",
                    href="/agentops/evidence/evidence-1",
                    trace_id=trace_id,
                    permission_state="allowed",
                ),
            ),
        )

    @staticmethod
    def _with_trace(
        summary: AgentOpsSummaryBundle, trace_id: str
    ) -> AgentOpsSummaryBundle:
        return replace(
            summary,
            trace_id=trace_id,
            run_evidence=replace(summary.run_evidence, trace_id=trace_id),
            links=tuple(replace(link, trace_id=trace_id) for link in summary.links),
        )

    @staticmethod
    def _redacted_summary(
        summary: AgentOpsSummaryBundle,
        *,
        trace_id: str,
    ) -> AgentOpsSummaryBundle:
        redacted_quality = replace(
            summary.quality_evidence,
            redacted=True,
            degraded_reason="raw_evidence_access_denied",
        )
        access_url = "/evidence-vault/request-access"
        redacted_link = CrossSystemLink(
            rel="evidence_request_access",
            target_system="evidence_vault",
            href=access_url,
            trace_id=trace_id,
            audit_id=summary.approval.audit_id,
            permission_state="denied",
            redaction_reason="raw_evidence_access_denied",
        )
        return replace(
            summary,
            quality_evidence=redacted_quality,
            links=(redacted_link,),
            permission_state="redacted",
            redaction_reason="raw_evidence_access_denied",
            request_access_url=access_url,
            return_url="/official-apps/framework.ai-autosdlc",
        )
