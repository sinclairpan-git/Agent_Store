from __future__ import annotations

import hashlib
import json
from copy import deepcopy
from dataclasses import replace
from datetime import timedelta
from collections.abc import Mapping

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
        assertion_hash = assertion.get("assertion_hash")
        device_assertion_hash = device_proof.get("assertion_hash")
        if not isinstance(assertion_hash, str) or not assertion_hash:
            raise ValueError("installation_assertion.assertion_hash is required")
        if not isinstance(device_assertion_hash, str) or not device_assertion_hash:
            raise ValueError("device_proof.assertion_hash is required")
        if assertion_hash != device_assertion_hash:
            raise ValueError(
                "device_proof must bind to installation_assertion.assertion_hash"
            )


class AgentOpsSkillRegistryNoticeClient:
    """Consumes Agent Store Skill Registry lifecycle notices as AgentOps."""

    def __init__(self) -> None:
        self._idempotency: dict[tuple[str, str], dict[str, object]] = {}
        self._accepted_notices: list[dict[str, object]] = []
        self.unavailable = False

    @property
    def accepted_notices(self) -> tuple[dict[str, object], ...]:
        return tuple(deepcopy(self._accepted_notices))

    def notify_skill_registry(
        self,
        registry_response: Mapping[str, object],
        *,
        headers: Mapping[str, str],
    ) -> dict[str, object]:
        if self.unavailable:
            raise AgentOpsUnavailableError("agentops skill registry notice unavailable")

        idempotency_key = self._idempotency_key(headers)
        notice = self._notice_from_response(
            registry_response,
            idempotency_key=idempotency_key,
        )
        fingerprint = self._fingerprint(notice)
        cache_key = ("skill_registry_notice", idempotency_key)
        cached = self._idempotency.get(cache_key)
        if cached is not None:
            if cached["fingerprint"] != fingerprint:
                raise ValueError("Idempotency-Key conflicts with a different notice")
            return deepcopy(cached["ack"])

        self._accepted_notices.append(deepcopy(notice))
        ack = self._ack(notice)
        self._idempotency[cache_key] = {
            "fingerprint": fingerprint,
            "ack": deepcopy(ack),
        }
        return deepcopy(ack)

    @staticmethod
    def _idempotency_key(headers: Mapping[str, str]) -> str:
        for name, value in headers.items():
            if name.lower() == "idempotency-key" and value.strip():
                return value.strip()
        raise ValueError("Idempotency-Key header is required")

    @staticmethod
    def _notice_from_response(
        registry_response: Mapping[str, object],
        *,
        idempotency_key: str,
    ) -> dict[str, object]:
        if registry_response.get("error_code") != "OK":
            raise ValueError("only successful Skill Registry responses can be notified")
        registry = registry_response.get("skill_registry")
        if not isinstance(registry, Mapping):
            raise ValueError("skill_registry response is required")
        skill = registry.get("skill")
        event = registry.get("event")
        consumption = registry.get("agentops_consumption")
        source_of_truth = registry.get("source_of_truth")
        issues = registry.get("issues")
        if issues:
            raise ValueError("blocked Skill Registry decisions cannot be notified")
        if not isinstance(skill, Mapping):
            raise ValueError("skill registry notice requires a skill record")
        if not isinstance(event, Mapping):
            raise ValueError("skill registry notice requires a lifecycle event")
        if (
            not isinstance(consumption, Mapping)
            or consumption.get("notify_required") is not True
        ):
            raise ValueError("agentops consumption must require notification")
        if not isinstance(source_of_truth, Mapping):
            raise ValueError("source_of_truth is required")
        if source_of_truth.get("skill_registry") != "agent_store":
            raise ValueError("Agent Store must remain the Skill Registry fact owner")

        trace_id = str(registry_response.get("trace_id") or "")
        audit_id = str(registry_response.get("audit_id") or "")
        event_id = str(event.get("event_id") or "")
        registry_key = str(skill.get("registry_key") or "")
        if not trace_id:
            raise ValueError("trace_id is required")
        if not audit_id:
            raise ValueError("audit_id is required")
        if not event_id:
            raise ValueError("event.event_id is required")
        if not registry_key:
            raise ValueError("skill.registry_key is required")

        notice = {
            "schema_version": "skill_registry_notification.v1",
            "trace_id": trace_id,
            "audit_id": audit_id,
            "idempotency_key": idempotency_key,
            "source_system": "agent_store",
            "target_system": "agentops",
            "contract": str(consumption.get("contract") or "skill_registry.v1"),
            "consumer": "agentops",
            "notice_type": str(event.get("event_type") or ""),
            "registry_key": registry_key,
            "skill": deepcopy(dict(skill)),
            "event": deepcopy(dict(event)),
            "source_of_truth": deepcopy(dict(source_of_truth)),
        }
        notice["payload_hash"] = AgentOpsSkillRegistryNoticeClient._fingerprint(notice)
        return notice

    @staticmethod
    def _fingerprint(notice: Mapping[str, object]) -> str:
        payload = {
            key: value
            for key, value in notice.items()
            if key not in {"idempotency_key", "payload_hash"}
        }
        encoded = json.dumps(
            payload, sort_keys=True, separators=(",", ":"), default=str
        ).encode("utf-8")
        return "sha256:" + hashlib.sha256(encoded).hexdigest()

    @staticmethod
    def _delivery_attempt_id(notice: Mapping[str, object]) -> str:
        event = notice["event"]
        assert isinstance(event, Mapping)
        seed = (
            f"{event['event_id']}:{notice['idempotency_key']}:{notice['payload_hash']}"
        )
        return "delivery-" + hashlib.sha256(seed.encode("utf-8")).hexdigest()[:20]

    @staticmethod
    def _ack(notice: Mapping[str, object]) -> dict[str, object]:
        registry_key = str(notice["registry_key"])
        event = notice["event"]
        assert isinstance(event, Mapping)
        event_id = str(event["event_id"])
        delivery_attempt_id = AgentOpsSkillRegistryNoticeClient._delivery_attempt_id(
            notice
        )
        notification = {
            "notification_id": f"agentops-notice-{event_id}",
            "agentops_ack_id": f"agentops-ack-{delivery_attempt_id}",
            "delivery_attempt_id": delivery_attempt_id,
            "delivery_state": "accepted",
            "sent_at": utc_now().isoformat(),
            "target_system": "agentops",
            "consumer": "agentops",
            "contract": notice["contract"],
            "received_event_id": event_id,
            "registry_key": registry_key,
            "source_system": "agent_store",
            "source_of_truth": notice["source_of_truth"],
            "request_payload_hash": notice["payload_hash"],
        }
        notification["response_payload_hash"] = (
            AgentOpsSkillRegistryNoticeClient._fingerprint(notification)
        )
        return {
            "schema_version": "skill_registry_notification_ack.v1",
            "trace_id": notice["trace_id"],
            "error_code": "OK",
            "audit_id": notice["audit_id"],
            "agentops_notification": notification,
        }


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
