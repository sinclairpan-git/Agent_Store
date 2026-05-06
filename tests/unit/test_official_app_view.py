from agent_store.domain.enterprise_context import EnterpriseContext
from agent_store.domain.models import Agent, AgentVersion, OsCompatibility
from agent_store.ui.official_app_view import build_official_app_view


def _agent() -> Agent:
    return Agent(
        agent_id="framework.ai-autosdlc",
        display_name="Ai_AutoSDLC",
        type="framework_capability",
        category="sdlc_framework",
        owner_team="SDLC Platform",
        owner_user="owner@example.com",
        status="manual_installable-preview",
        official_flag=True,
        summary="Official SDLC framework capability.",
        use_cases=("governed delivery", "evidence loop"),
        supported_os=(
            OsCompatibility(os="macOS", compatibility_status="smoke_passed"),
            OsCompatibility(os="Linux", compatibility_status="static_passed"),
        ),
    )


def _version() -> AgentVersion:
    return AgentVersion(
        agent_id="framework.ai-autosdlc",
        version="1.0.0",
        artifact_hash="sha256:first",
        signature="sig-1",
        issuer="Agent Store",
        release_status="manual_installable-preview",
    )


def test_official_view_displays_framework_and_maintenance_facts() -> None:
    response = build_official_app_view(
        agent=_agent(),
        version=_version(),
        trace_id="trace-123",
        enterprise_context=EnterpriseContext(
            integration_mode="enterprise_managed",
            enterprise_state="required_unactivated",
            source="tenant_policy",
            required_by="security-baseline",
            policy_owner="Security",
            policy_version="2026.05",
            can_ignore=False,
            affected_actions=("actual_l5_display",),
            requires_enterprise=True,
        ),
    )

    view = response["view"]
    assert response["schema_version"]
    assert response["error_code"] == "OK"
    assert view["official_flag"] is True
    assert view["framework_capability"] is True
    assert view["capability_type"] == "SDLC Framework"
    assert view["maintenance"]["owner_team"] == "SDLC Platform"
    assert view["maintenance"]["version"] == "1.0.0"
    assert view["standalone"]["requires_installation_id"] is False
    assert view["enterprise_context"]["required_by"] == "security-baseline"


def test_official_view_does_not_display_actual_l5_before_bootstrap_is_complete() -> None:
    response = build_official_app_view(
        agent=_agent(),
        version=_version(),
        trace_id="trace-123",
        bootstrap_completed=False,
        l5_gate_passed=True,
        violation_scan_completed=True,
    )

    view = response["view"]
    assert view["actual_l5_display_allowed"] is False
    assert view["l5_display_state"] == "l5_capable_pending_verification"


def test_official_view_allows_actual_l5_only_after_full_evidence_chain() -> None:
    response = build_official_app_view(
        agent=_agent(),
        version=_version(),
        trace_id="trace-123",
        bootstrap_completed=True,
        l5_gate_passed=True,
        violation_scan_completed=True,
    )

    view = response["view"]
    assert view["actual_l5_display_allowed"] is True
    assert view["l5_display_state"] == "actual_l5"


def test_standalone_branch_does_not_require_installation_id() -> None:
    response = build_official_app_view(
        agent=_agent(),
        version=_version(),
        trace_id="trace-123",
        enterprise_context=EnterpriseContext.standalone(),
    )

    view = response["view"]
    assert view["current_user_installability"] == "standalone_only"
    assert view["primary_action"]["target_system"] == "ai_autosdlc_cli"
    assert view["standalone"]["requires_installation_id"] is False
    assert "installation_id" not in view["enterprise_context"]


def test_disabled_enterprise_state_blocks_activation_action() -> None:
    response = build_official_app_view(
        agent=_agent(),
        version=_version(),
        trace_id="trace-123",
        enterprise_context=EnterpriseContext(
            integration_mode="enterprise_managed",
            enterprise_state="disabled",
            source="tenant_policy",
            can_ignore=False,
            affected_actions=("enterprise_activation",),
            requires_enterprise=True,
        ),
    )

    view = response["view"]
    assert view["current_user_installability"] == "blocked"
    assert view["enterprise_activation_action"]["enabled"] is False
    assert view["primary_action"]["enabled"] is False
