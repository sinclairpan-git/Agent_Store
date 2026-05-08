from __future__ import annotations

from dataclasses import replace

from agent_store.domain.agentops_summary import L5GateSummary
from agent_store.domain.enterprise_context import EnterpriseContext
from agent_store.domain.models import Agent, AgentVersion, OsCompatibility
from agent_store.domain.package_trust import PackageTrustSummary
from agent_store.integrations.agentops_client import AgentOpsSummaryClient
from agent_store.ui.catalog_workbench import CatalogAgentSource
from agent_store.ui.recommendation_state import build_recommendation_state


def _source(
    *,
    trust_state: str = "trusted",
    enterprise_state: str = "active",
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
        use_cases=("governed delivery", "trusted evidence loop"),
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
            enterprise_state=enterprise_state,
            source="tenant_policy",
            can_ignore=False,
            affected_actions=("install",),
            requires_enterprise=True,
        ),
        evidence_level="L5-capable",
        installability=installability,
    )


def test_recommendation_state_recommends_only_with_agentops_l5_gate() -> None:
    summary = AgentOpsSummaryClient().get_summary(
        "framework.ai-autosdlc",
        "1.0.0",
        trace_id="trace-rec",
        raw_evidence_allowed=False,
    )

    response = build_recommendation_state(
        source=_source(),
        trace_id="trace-rec",
        agentops_summary=summary,
    )

    decision = response["recommendation"]
    assert response["error_code"] == "OK"
    assert decision["recommendation_state"] == "recommended"
    assert decision["actual_l5_display_allowed"] is True
    assert decision["missing_evidence"] == []
    assert decision["source_of_truth"]["quality_evidence"] == "agentops_summary"
    assert decision["next_best_action"]["action_id"] == "start_install"


def test_recommendation_state_without_agentops_summary_never_defaults_l5() -> None:
    response = build_recommendation_state(
        source=_source(installability="activation_required"),
        trace_id="trace-rec",
        agentops_summary=None,
    )

    decision = response["recommendation"]
    assert decision["recommendation_state"] == "needs_activation"
    assert decision["actual_l5_display_allowed"] is False
    assert "agentops_summary" in decision["missing_evidence"]
    assert decision["source_of_truth"]["quality_evidence"] == "agentops_summary_missing"
    assert decision["source_of_truth"]["l5_gate"] == "agentops_summary_missing"
    assert {
        "blocker_id": "l5_unavailable_without_agentops_summary",
        "source": "agentops",
        "severity": "warning",
        "can_ignore": False,
    } in decision["trust_blockers"]


def test_recommendation_state_failed_l5_gate_is_not_recommended() -> None:
    summary = AgentOpsSummaryClient().get_summary(
        "framework.ai-autosdlc",
        "1.0.0",
        trace_id="trace-rec",
        raw_evidence_allowed=False,
    )
    failed_gate_summary = replace(
        summary,
        l5_gate=L5GateSummary(
            l5_gate_result="failed",
            violation_scan_completed=True,
            missing_requirements=(),
        ),
    )

    response = build_recommendation_state(
        source=_source(),
        trace_id="trace-rec",
        agentops_summary=failed_gate_summary,
    )

    decision = response["recommendation"]
    assert decision["recommendation_state"] == "eligible_pending_verification"
    assert decision["actual_l5_display_allowed"] is False
    assert "agentops_l5_gate_not_passed" in decision["why_not"]
    assert decision["next_best_action"]["action_id"] == "request_agentops_summary"
    assert {
        "blocker_id": "agentops_l5_gate_not_passed",
        "source": "agentops",
        "severity": "warning",
        "can_ignore": False,
    } in decision["trust_blockers"]


def test_recommendation_state_standalone_next_action_is_executable() -> None:
    summary = AgentOpsSummaryClient().get_summary(
        "framework.ai-autosdlc",
        "1.0.0",
        trace_id="trace-rec",
        raw_evidence_allowed=False,
    )

    response = build_recommendation_state(
        source=_source(installability="standalone_only"),
        trace_id="trace-rec",
        agentops_summary=summary,
    )

    action = response["recommendation"]["next_best_action"]
    assert action["action_id"] == "open_standalone_readme"
    assert action["target_system"] == "ai_autosdlc_cli"
    assert action["enabled"] is True
    assert action["requires_permission"] is False
    assert action["audit_required"] is False


def test_recommendation_state_blocks_catalog_or_package_trust_denials() -> None:
    response = build_recommendation_state(
        source=_source(trust_state="blocked", installability="blocked"),
        trace_id="trace-rec",
        agentops_summary=None,
    )

    decision = response["recommendation"]
    assert decision["recommendation_state"] == "blocked"
    assert decision["next_best_action"]["action_id"] == "request_catalog_review"
    assert decision["actual_l5_display_allowed"] is False
    assert {item["blocker_id"] for item in decision["trust_blockers"]} >= {
        "installability_blocked",
        "package_trust_blocked",
        "l5_unavailable_without_agentops_summary",
    }
