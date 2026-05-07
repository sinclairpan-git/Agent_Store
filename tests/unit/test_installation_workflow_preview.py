from __future__ import annotations

from agent_store.domain.enterprise_context import EnterpriseContext
from agent_store.domain.models import Agent, AgentVersion, OsCompatibility
from agent_store.domain.package_trust import PackageTrustSummary
from agent_store.ui.catalog_workbench import CatalogAgentSource
from agent_store.ui.installation_workflow import build_installation_workflow_preview


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


def test_installable_agent_workflow_has_install_steps_and_command() -> None:
    response = build_installation_workflow_preview(
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
        trace_id="trace-workflow",
    )

    workflow = response["workflow"]
    assert workflow["workflow_state"] == "ready_to_install"
    assert workflow["primary_action"]["action_id"] == "start_install"
    assert (
        workflow["command_preview"]
        == "agent-store install developer.release-notes@1.0.0"
    )
    assert [step["step_id"] for step in workflow["steps"]] == [
        "verify_package",
        "create_installation",
        "issue_assertion",
        "sync_agentops",
    ]


def test_activation_required_agent_workflow_has_enterprise_steps() -> None:
    response = build_installation_workflow_preview(
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
        trace_id="trace-workflow",
    )

    workflow = response["workflow"]
    assert workflow["workflow_state"] == "activation_required"
    assert workflow["primary_action"]["action_id"] == "start_enterprise_activation"
    assert " --enterprise" in workflow["command_preview"]
    assert workflow["steps"][2]["owner_system"] == "agentops"


def test_blocked_agent_workflow_exposes_recovery_action() -> None:
    response = build_installation_workflow_preview(
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
        trace_id="trace-workflow",
    )

    workflow = response["workflow"]
    assert workflow["workflow_state"] == "blocked"
    assert workflow["primary_action"]["action_id"] == "view_blocking_policy"
    assert workflow["recovery_action"]["action_id"] == "request_catalog_review"
    assert workflow["steps"][0]["state"] == "blocked"


def test_standalone_only_agent_workflow_stays_out_of_blocked_recovery() -> None:
    response = build_installation_workflow_preview(
        source=_source(
            "framework.local-sdlc",
            "Local SDLC",
            agent_type="framework_capability",
            category="SDLC Framework",
            trust_state="trusted",
            enterprise_state="not_detected",
            installability="standalone_only",
            evidence_level="L4-local",
        ),
        trace_id="trace-workflow",
    )

    workflow = response["workflow"]
    assert workflow["workflow_state"] == "standalone_only"
    assert workflow["primary_action"]["action_id"] == "open_standalone_readme"
    assert "recovery_action" not in workflow
    assert workflow["command_preview"].endswith(" --standalone")
    assert [step["step_id"] for step in workflow["steps"]] == [
        "verify_standalone_boundary",
        "open_standalone_path",
        "keep_enterprise_optional",
    ]
