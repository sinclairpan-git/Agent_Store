from agent_store.domain.models import Agent, AgentVersion
from agent_store.ui.official_app_view import build_official_app_view


def test_official_app_view_exposes_accessibility_action_contract() -> None:
    response = build_official_app_view(
        agent=Agent(
            agent_id="framework.ai-autosdlc",
            display_name="Ai_AutoSDLC",
            type="framework_capability",
            category="sdlc_framework",
            owner_team="SDLC Platform",
            owner_user="owner@example.com",
            official_flag=True,
        ),
        version=AgentVersion(
            agent_id="framework.ai-autosdlc",
            version="1.0.0",
            artifact_hash="sha256:first",
            signature="sig-1",
            issuer="Agent Store",
        ),
        trace_id="trace-123",
    )

    view = response["view"]
    accessibility = view["accessibility_contract"]
    reachable = accessibility["keyboard_reachable_action_ids"]

    assert view["primary_action"]["action_id"] in reachable
    assert view["primary_action"]["message_key"]
    assert (
        accessibility["focus_return_action_id"] == view["primary_action"]["action_id"]
    )
    assert accessibility["copy_feedback"]["action_id"] == "copy_diagnostic_ref"
    assert accessibility["copy_feedback"]["message_key"]
    assert accessibility["status_live_update"]["enabled"] is True
    assert accessibility["status_live_update"]["message_key"]
