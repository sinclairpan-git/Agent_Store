from __future__ import annotations

from agent_store.domain.enterprise_context import EnterpriseContext
from agent_store.domain.models import Agent, AgentVersion, OsCompatibility
from agent_store.domain.package_trust import PackageTrustSummary
from agent_store.ui.catalog_workbench import (
    CatalogAgentSource,
    CatalogFilter,
    build_catalog_workbench,
)


def _source(
    agent_id: str,
    display_name: str,
    *,
    agent_type: str,
    category: str,
    trust_state: str,
    enterprise_state: str,
    installability: str,
    evidence_level: str,
) -> CatalogAgentSource:
    agent = Agent(
        agent_id=agent_id,
        display_name=display_name,
        type=agent_type,
        category=category,
        owner_team="Platform",
        owner_user="owner@example.com",
        official_flag=True,
        summary=f"{display_name} catalog summary",
        use_cases=("governed delivery",),
        supported_os=(
            OsCompatibility(os="macOS", compatibility_status="install_verified"),
        ),
    )
    version = AgentVersion(
        agent_id=agent_id,
        version="1.0.0",
        artifact_hash=f"sha256:{agent_id}",
        signature="sig",
        issuer="Agent Store",
        release_status="manual_installable-preview",
    )
    return CatalogAgentSource(
        agent=agent,
        version=version,
        package_trust_summary=PackageTrustSummary(
            package_id=f"{agent_id}@1.0.0",
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
        evidence_level=evidence_level,
        installability=installability,
    )


def test_catalog_workbench_lists_cards_with_facets_and_selected_agent() -> None:
    response = build_catalog_workbench(
        sources=(
            _source(
                "framework.ai-autosdlc",
                "Ai_AutoSDLC",
                agent_type="framework_capability",
                category="SDLC Framework",
                trust_state="trusted",
                enterprise_state="required_unactivated",
                installability="activation_required",
                evidence_level="L5-capable",
            ),
            _source(
                "security.policy-guard",
                "Policy Guard",
                agent_type="agent",
                category="Runtime Policy",
                trust_state="warning",
                enterprise_state="active",
                installability="installable",
                evidence_level="L3-summary",
            ),
        ),
        trace_id="trace-catalog",
        selected_agent_id="framework.ai-autosdlc",
    )

    catalog = response["catalog"]
    assert response["error_code"] == "OK"
    assert catalog["total_count"] == 2
    assert catalog["selected_agent_id"] == "framework.ai-autosdlc"
    assert catalog["facets"]["trust_state"] == {"trusted": 1, "warning": 1}
    first_card = catalog["cards"][0]
    assert first_card["supported_os"][0]["compatibility_status"] == "install_verified"
    assert first_card["primary_action"]["action_id"] in {
        "start_enterprise_activation",
        "start_install",
    }


def test_catalog_workbench_filters_by_search_type_and_installability() -> None:
    response = build_catalog_workbench(
        sources=(
            _source(
                "framework.ai-autosdlc",
                "Ai_AutoSDLC",
                agent_type="framework_capability",
                category="SDLC Framework",
                trust_state="trusted",
                enterprise_state="required_unactivated",
                installability="activation_required",
                evidence_level="L5-capable",
            ),
            _source(
                "agentops.evidence-reporter",
                "Evidence Reporter",
                agent_type="agent",
                category="Evidence Connector",
                trust_state="warning",
                enterprise_state="active",
                installability="installable",
                evidence_level="L3-summary",
            ),
        ),
        trace_id="trace-catalog",
        filters=CatalogFilter(
            search="evidence",
            agent_type="agent",
            installability="installable",
        ),
    )

    catalog = response["catalog"]
    assert catalog["filtered_count"] == 1
    assert catalog["cards"][0]["agent_id"] == "agentops.evidence-reporter"
    assert catalog["active_filters"] == {
        "search": "evidence",
        "agent_type": "agent",
        "trust_state": "all",
        "installability": "installable",
    }
