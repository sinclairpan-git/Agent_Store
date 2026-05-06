from datetime import timedelta

from agent_store.api.agentops_summary import AgentOpsSummaryAPI
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


def _expired_summary() -> AgentOpsSummaryBundle:
    now = utc_now()
    return AgentOpsSummaryBundle(
        trace_id="trace-expired",
        quality_evidence=QualityEvidenceSummary(
            evidence_level="L4",
            confidence=0.7,
            missing_evidence=(),
            score_template_id="agentops-owned",
            calculated_at=now - timedelta(hours=2),
            valid_until=now - timedelta(minutes=1),
        ),
        run_evidence=RunEvidenceSummary(
            run_id="run-1",
            session_id="session-1",
            evidence_summary_id="evidence-1",
            source_event_ids=("event-1",),
            trace_id="trace-expired",
        ),
        approval=ApprovalSummary(
            approval_id="approval-1",
            status="approved",
            audit_id="audit-1",
            expires_at=now - timedelta(minutes=1),
        ),
        runtime_policy=RuntimePolicySummary(
            policy_ref="policy-1",
            fallback_action="warn",
            runtime_risk_level="low",
            enforcement_mode="warn",
        ),
        links=(
            CrossSystemLink(
                rel="return_to_store",
                target_system="agent_store",
                href="/official-apps/framework.ai-autosdlc",
                trace_id="trace-expired",
            ),
        ),
    )


def test_agentops_summary_api_returns_contract_envelope() -> None:
    status, body = AgentOpsSummaryAPI().get_agentops_summary(
        "framework.ai-autosdlc",
        version="1.0.0",
        trace_id="trace-1",
    )

    assert status == 200
    assert body["schema_version"]
    assert body["trace_id"] == "trace-1"
    assert body["error_code"] == "OK"
    assert body["quality_evidence"]
    assert body["approval"]
    assert body["runtime_policy"]
    assert body["links"]


def test_agentops_summary_api_covers_approval_expired_and_stale_quality() -> None:
    client = AgentOpsSummaryClient(
        {("framework.ai-autosdlc", "1.0.0"): _expired_summary()}
    )

    _, body = AgentOpsSummaryAPI(client).get_agentops_summary(
        "framework.ai-autosdlc",
        version="1.0.0",
        trace_id="trace-expired",
    )

    assert body["error_code"] == "APPROVAL_EXPIRED"
    assert body["approval"]["status"] == "expired"
    assert body["quality_evidence"]["summary_validity_state"] == "expired"


def test_agentops_summary_api_covers_permission_redaction() -> None:
    _, body = AgentOpsSummaryAPI().get_agentops_summary(
        "framework.ai-autosdlc",
        version="1.0.0",
        raw_evidence_allowed=False,
        trace_id="trace-1",
    )

    assert body["permission_state"] == "redacted"
    assert body["redaction_reason"] == "raw_evidence_access_denied"
    assert body["request_access_url"] == "/evidence-vault/request-access"
