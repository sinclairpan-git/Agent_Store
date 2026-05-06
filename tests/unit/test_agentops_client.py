from datetime import timedelta

from agent_store.domain.agentops_summary import (
    AgentOpsSummaryBundle,
    ApprovalSummary,
    CrossSystemLink,
    QualityEvidenceSummary,
    RunEvidenceSummary,
    RuntimePolicySummary,
)
from agent_store.domain.models import utc_now
from agent_store.integrations.agentops_client import AgentOpsSummaryClient


def _summary() -> AgentOpsSummaryBundle:
    now = utc_now()
    return AgentOpsSummaryBundle(
        trace_id="trace-1",
        quality_evidence=QualityEvidenceSummary(
            evidence_level="L5-capable",
            confidence=0.88,
            missing_evidence=(),
            score_template_id="agentops-owned",
            calculated_at=now,
            valid_until=now + timedelta(hours=1),
        ),
        run_evidence=RunEvidenceSummary(
            run_id="run-1",
            session_id="session-1",
            evidence_summary_id="evidence-1",
            source_event_ids=("event-1",),
            trace_id="trace-1",
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
        links=(
            CrossSystemLink(
                rel="evidence_summary",
                target_system="agentops",
                href="/agentops/evidence/evidence-1",
                trace_id="trace-1",
            ),
        ),
    )


def test_agentops_unavailable_returns_pending_sync_degraded_summary() -> None:
    client = AgentOpsSummaryClient()
    client.unavailable = True

    response = client.get_summary(
        "framework.ai-autosdlc",
        "1.0.0",
        trace_id="trace-1",
    ).to_response()

    assert response["quality_evidence"]["summary_validity_state"] == "expired"
    assert (
        response["runtime_policy"]["degraded_reason"]
        == "enterprise_evidence_pending_sync"
    )
    assert response["credential_bootstrap"]["enterprise_state"] == "degraded"


def test_raw_evidence_denied_returns_redacted_summary_and_access_link() -> None:
    client = AgentOpsSummaryClient({("framework.ai-autosdlc", "1.0.0"): _summary()})

    response = client.get_summary(
        "framework.ai-autosdlc",
        "1.0.0",
        trace_id="trace-1",
        raw_evidence_allowed=False,
    ).to_response()

    assert response["permission_state"] == "redacted"
    assert response["quality_evidence"]["redacted"] is True
    assert response["request_access_url"] == "/evidence-vault/request-access"
    assert response["links"][0]["target_system"] == "evidence_vault"


def test_store_client_does_not_calculate_quality_score() -> None:
    client = AgentOpsSummaryClient({("framework.ai-autosdlc", "1.0.0"): _summary()})

    response = client.get_summary(
        "framework.ai-autosdlc",
        "1.0.0",
        trace_id="trace-1",
    ).to_response()

    assert "quality_score" not in response["quality_evidence"]
    assert response["quality_evidence"]["confidence"] == 0.88


def test_cached_summary_uses_current_request_trace() -> None:
    client = AgentOpsSummaryClient({("framework.ai-autosdlc", "1.0.0"): _summary()})

    response = client.get_summary(
        "framework.ai-autosdlc",
        "1.0.0",
        trace_id="trace-current",
    ).to_response()
    redacted = client.get_summary(
        "framework.ai-autosdlc",
        "1.0.0",
        trace_id="trace-redacted",
        raw_evidence_allowed=False,
    ).to_response()

    assert response["trace_id"] == "trace-current"
    assert response["run_evidence"]["trace_id"] == "trace-current"
    assert response["links"][0]["trace_id"] == "trace-current"
    assert redacted["trace_id"] == "trace-redacted"
    assert redacted["run_evidence"]["trace_id"] == "trace-redacted"
    assert redacted["links"][0]["trace_id"] == "trace-redacted"
