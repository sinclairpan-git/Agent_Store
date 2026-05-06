from agent_store.api.agentops_summary import AgentOpsSummaryAPI


def test_agentops_summary_returns_cross_system_navigation_fields_when_redacted() -> None:
    _, body = AgentOpsSummaryAPI().get_agentops_summary(
        "framework.ai-autosdlc",
        version="1.0.0",
        raw_evidence_allowed=False,
        trace_id="trace-1",
    )

    assert body["links"][0]["rel"] == "evidence_request_access"
    assert body["links"][0]["permission_state"] == "denied"
    assert body["links"][0]["redaction_reason"] == "raw_evidence_access_denied"
    assert body["links"][0]["audit_id"]
    assert body["permission_state"] == "redacted"
    assert body["request_access_url"] == "/evidence-vault/request-access"
    assert body["return_url"] == "/official-apps/framework.ai-autosdlc"
    assert body["trace_id"] == "trace-1"


def test_raw_evidence_denied_summary_does_not_expose_raw_evidence() -> None:
    _, body = AgentOpsSummaryAPI().get_agentops_summary(
        "framework.ai-autosdlc",
        version="1.0.0",
        raw_evidence_allowed=False,
        trace_id="trace-1",
    )

    assert "raw_evidence" not in body
    assert "raw_evidence" not in body["quality_evidence"]
    assert body["quality_evidence"]["redacted"] is True
