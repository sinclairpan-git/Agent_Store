from agent_store.domain.enterprise_context import EnterpriseContext
from agent_store.domain.models import Agent, AgentVersion
from agent_store.ui.official_app_view import (
    build_official_app_view,
    validate_standalone_boundary,
)


def _agent() -> Agent:
    return Agent(
        agent_id="framework.ai-autosdlc",
        display_name="Ai_AutoSDLC",
        type="framework_capability",
        category="sdlc_framework",
        owner_team="SDLC Platform",
        owner_user="owner@example.com",
        official_flag=True,
    )


def _version() -> AgentVersion:
    return AgentVersion(
        agent_id="framework.ai-autosdlc",
        version="1.0.0",
        artifact_hash="sha256:first",
        signature="sig-1",
        issuer="Agent Store",
    )


def test_standalone_official_view_does_not_require_enterprise_installation_id() -> None:
    response = build_official_app_view(
        agent=_agent(),
        version=_version(),
        trace_id="trace-1",
        enterprise_context=EnterpriseContext.standalone(),
    )

    assert validate_standalone_boundary(response, trace_id="trace-1") is None
    assert response["view"]["standalone"]["requires_installation_id"] is False
    assert "installation_id" not in response["view"]["enterprise_context"]


def test_overcoupled_standalone_view_returns_stable_error() -> None:
    response = build_official_app_view(
        agent=_agent(),
        version=_version(),
        trace_id="trace-1",
        enterprise_context=EnterpriseContext.standalone(),
    )
    response["view"]["standalone"]["requires_installation_id"] = True

    error = validate_standalone_boundary(response, trace_id="trace-1")

    assert error is not None
    assert error.error_code == "STANDALONE_OVERCOUPLED"


def test_enterprise_managed_installation_id_is_not_standalone_overcoupled() -> None:
    response = build_official_app_view(
        agent=_agent(),
        version=_version(),
        trace_id="trace-1",
        enterprise_context=EnterpriseContext(
            integration_mode="enterprise_managed",
            enterprise_state="active",
            source="tenant_policy",
            can_ignore=False,
            affected_actions=("actual_l5_display",),
            requires_enterprise=True,
            installation_id="inst-1",
        ),
    )

    assert validate_standalone_boundary(response, trace_id="trace-1") is None
    assert response["view"]["enterprise_context"]["installation_id"] == "inst-1"
