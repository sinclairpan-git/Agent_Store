from agent_store.domain.enterprise_context import EnterpriseContext
from agent_store.domain.models import Agent, AgentVersion
from agent_store.ui.official_app_view import build_official_app_view


def _agent() -> Agent:
    return Agent(
        agent_id="framework.ai-autosdlc",
        display_name="Ai_AutoSDLC",
        type="framework_capability",
        category="sdlc_framework",
        owner_team="SDLC Platform",
        owner_user="owner@example.com",
        official_flag=True,
        summary="Official SDLC framework capability.",
    )


def _version() -> AgentVersion:
    return AgentVersion(
        agent_id="framework.ai-autosdlc",
        version="1.0.0",
        artifact_hash="sha256:first",
        signature="sig-1",
        issuer="Agent Store",
    )


def _enterprise_context() -> EnterpriseContext:
    return EnterpriseContext(
        integration_mode="enterprise_managed",
        enterprise_state="required_unactivated",
        source="tenant_policy",
        required_by="security-baseline",
        issuer="IAM",
        policy_owner="Security",
        policy_version="2026.05",
        can_ignore=False,
        affected_actions=("actual_l5_display", "enterprise_activation"),
        requires_enterprise=True,
    )


def test_role_view_field_density_increases_for_operational_roles() -> None:
    user_view = build_official_app_view(
        agent=_agent(),
        version=_version(),
        trace_id="trace-user",
        enterprise_context=_enterprise_context(),
        role="user",
    )["view"]
    owner_view = build_official_app_view(
        agent=_agent(),
        version=_version(),
        trace_id="trace-owner",
        enterprise_context=_enterprise_context(),
        role="owner",
    )["view"]
    admin_view = build_official_app_view(
        agent=_agent(),
        version=_version(),
        trace_id="trace-admin",
        enterprise_context=_enterprise_context(),
        role="agentops_admin",
    )["view"]
    security_view = build_official_app_view(
        agent=_agent(),
        version=_version(),
        trace_id="trace-security",
        enterprise_context=_enterprise_context(),
        role="security_iam",
    )["view"]

    assert len(user_view["role_visible_sections"]) < len(
        owner_view["role_visible_sections"]
    )
    assert len(owner_view["role_visible_sections"]) < len(
        admin_view["role_visible_sections"]
    )
    assert len(admin_view["role_visible_sections"]) < len(
        security_view["role_visible_sections"]
    )
    assert "audit_requirements" in security_view["role_visible_sections"]
