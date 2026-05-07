from __future__ import annotations

from agent_store.api.agent_catalog import AgentCatalogAPI
from agent_store.api.agent_registry import response_envelope_ok
from agent_store.domain.enterprise_context import EnterpriseContext
from agent_store.domain.models import Agent, AgentVersion, OsCompatibility
from agent_store.domain.package_trust import PackageTrustSummary
from agent_store.ui.catalog_workbench import CatalogAgentSource


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


def _api() -> AgentCatalogAPI:
    return AgentCatalogAPI(
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
                "developer.release-notes",
                "Release Notes Writer",
                agent_type="skill",
                category="Developer Tool",
                trust_state="warning",
                enterprise_state="detected_optional",
                installability="installable",
                evidence_level="L2-static",
            ),
        )
    )


def test_agent_catalog_api_lists_filterable_cards() -> None:
    status, body = _api().list_agents(
        {
            "search": "release",
            "agent_type": "skill",
            "installability": "installable",
            "trace_id": "trace-catalog",
        }
    )

    assert status == 200
    assert response_envelope_ok(body)
    catalog = body["catalog"]
    assert catalog["filtered_count"] == 1
    assert catalog["cards"][0]["agent_id"] == "developer.release-notes"
    assert catalog["facets"]["agent_type"] == {"framework_capability": 1, "skill": 1}


def test_agent_catalog_api_rejects_unsupported_filters() -> None:
    status, body = _api().list_agents(
        {"trust_state": "pending_review", "trace_id": "trace-catalog"}
    )

    assert status == 400
    assert response_envelope_ok(body)
    assert body["error_code"] == "VALIDATION_ERROR"
    assert body["recommended_action_id"] == "fix_catalog_filters"
