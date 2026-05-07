from __future__ import annotations

from agent_store.domain.enterprise_context import EnterpriseContext
from agent_store.domain.models import Agent, AgentVersion, OsCompatibility
from agent_store.domain.package_trust import PackageTrustSummary
from agent_store.ui.catalog_workbench import CatalogAgentSource
from agent_store.ui.installation_request import build_installation_request


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
        enterprise_context=(
            EnterpriseContext.standalone()
            if installability == "standalone_only"
            else EnterpriseContext(
                integration_mode="enterprise_managed",
                enterprise_state=enterprise_state,
                source="tenant_policy",
                can_ignore=False,
                affected_actions=("install",),
                requires_enterprise=True,
            )
        ),
        evidence_level=evidence_level,
        installability=installability,
    )


def test_installable_request_enters_bootstrap_queue() -> None:
    response = build_installation_request(
        source=_source(
            "developer.release-notes",
            "Release Notes Writer",
            agent_type="skill",
            category="Developer Tool",
            trust_state="warning",
            enterprise_state="detected_optional",
            installability="installable",
            evidence_level="L2-static",
        ),
        trace_id="trace-request",
        requested_by="operator@example.com",
    )

    request = response["request"]
    assert request["request_state"] == "accepted"
    assert request["queue"] == "installation_bootstrap"
    assert request["next_action"]["action_id"] == "create_installation"
    assert request["audit_id"] == "audit-developer-release-notes-start-install"


def test_activation_required_request_enters_enterprise_queue() -> None:
    response = build_installation_request(
        source=_source(
            "framework.ai-autosdlc",
            "Ai_AutoSDLC",
            agent_type="framework_capability",
            category="SDLC Framework",
            trust_state="trusted",
            enterprise_state="required_unactivated",
            installability="activation_required",
            evidence_level="L5-capable",
        ),
        trace_id="trace-request",
        requested_by="operator@example.com",
    )

    request = response["request"]
    assert request["request_state"] == "pending_enterprise_activation"
    assert request["queue"] == "enterprise_activation"
    assert request["owner_system"] == "agentops"
    assert request["next_action"]["action_id"] == "issue_reporter_credential"


def test_blocked_request_defaults_to_catalog_review() -> None:
    response = build_installation_request(
        source=_source(
            "security.policy-guard",
            "Policy Guard",
            agent_type="agent",
            category="Runtime Policy",
            trust_state="blocked",
            enterprise_state="disabled",
            installability="blocked",
            evidence_level="pending",
        ),
        trace_id="trace-request",
        requested_by="operator@example.com",
    )

    request = response["request"]
    assert request["requested_action_id"] == "request_catalog_review"
    assert request["request_state"] == "pending_catalog_review"
    assert request["queue"] == "catalog_review"
    assert request["blockers"] == ["blocked", "disabled", "blocked"]


def test_request_command_shell_quotes_agent_coordinate() -> None:
    response = build_installation_request(
        source=_source(
            "developer.release-notes;touch unsafe",
            "Release Notes Writer",
            agent_type="skill",
            category="Developer Tool",
            trust_state="warning",
            enterprise_state="detected_optional",
            installability="installable",
            evidence_level="L2-static",
        ),
        trace_id="trace-request",
        requested_by="operator@example.com",
    )

    assert (
        response["request"]["command_preview"]
        == "agent-store install 'developer.release-notes;touch unsafe@1.0.0'"
    )
