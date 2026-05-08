from __future__ import annotations

from agent_store.api.agent_registry import response_envelope_ok
from agent_store.api.recommendation_state import RecommendationStateAPI
from agent_store.domain.enterprise_context import EnterpriseContext
from agent_store.domain.models import Agent, AgentVersion, OsCompatibility
from agent_store.domain.package_trust import PackageTrustSummary
from agent_store.integrations.agentops_client import AgentOpsSummaryClient
from agent_store.ui.catalog_workbench import CatalogAgentSource


def _source(
    *,
    trust_state: str = "trusted",
    installability: str = "installable",
) -> CatalogAgentSource:
    agent = Agent(
        agent_id="framework.ai-autosdlc",
        display_name="Ai_AutoSDLC",
        type="framework_capability",
        category="SDLC Framework",
        owner_team="SDLC Platform",
        owner_user="owner@example.com",
        official_flag=True,
        summary="Official SDLC framework capability",
        use_cases=("governed delivery",),
        supported_os=(
            OsCompatibility(os="macOS", compatibility_status="install_verified"),
        ),
    )
    version = AgentVersion(
        agent_id=agent.agent_id,
        version="1.0.0",
        artifact_hash="sha256:framework",
        signature="sig",
        issuer="Agent Store",
        release_status="manual_installable-preview",
    )
    return CatalogAgentSource(
        agent=agent,
        version=version,
        package_trust_summary=PackageTrustSummary(
            package_id="framework.ai-autosdlc@1.0.0",
            trust_state=trust_state,
            signature_state="verified" if trust_state == "trusted" else "missing",
            hash_match_state="matched" if trust_state == "trusted" else "unknown",
            issuer_display="Agent Store",
        ),
        enterprise_context=EnterpriseContext(
            integration_mode="enterprise_managed",
            enterprise_state="active",
            source="tenant_policy",
            can_ignore=False,
            affected_actions=("install",),
            requires_enterprise=True,
        ),
        evidence_level="L5-capable",
        installability=installability,
    )


def test_recommendation_state_api_returns_explainable_decision() -> None:
    status, body = RecommendationStateAPI((_source(),)).get_recommendation_state(
        "framework.ai-autosdlc",
        {"trace_id": "trace-rec"},
    )

    assert status == 200
    assert response_envelope_ok(body)
    decision = body["recommendation"]
    assert decision["agent_id"] == "framework.ai-autosdlc"
    assert decision["recommendation_state"] == "recommended"
    assert decision["source_of_truth"]["catalog"] == "agent_store_catalog"
    assert decision["trace_id"] == "trace-rec"
    assert decision["audit_id"]


def test_recommendation_state_api_degrades_when_agentops_unavailable() -> None:
    client = AgentOpsSummaryClient()
    client.unavailable = True

    status, body = RecommendationStateAPI(
        (_source(),),
        agentops_client=client,
    ).get_recommendation_state("framework.ai-autosdlc", {"trace_id": "trace-rec"})

    assert status == 200
    assert response_envelope_ok(body)
    decision = body["recommendation"]
    assert decision["recommendation_state"] == "eligible_pending_verification"
    assert decision["actual_l5_display_allowed"] is False
    assert "agentops_summary" in decision["missing_evidence"]
    assert "fresh_agentops_quality_summary" in decision["missing_evidence"]
    assert (
        decision["source_of_truth"]["quality_evidence"] == "agentops_summary_degraded"
    )
    assert decision["next_best_action"]["action_id"] == "request_agentops_summary"


def test_recommendation_state_api_returns_governed_not_found_error() -> None:
    status, body = RecommendationStateAPI((_source(),)).get_recommendation_state(
        "missing.agent",
        {"trace_id": "trace-rec"},
    )

    assert status == 404
    assert response_envelope_ok(body)
    assert body["error_code"] == "AGENT_NOT_FOUND"
    assert body["recommended_action_id"] == "adjust_catalog_filters"
