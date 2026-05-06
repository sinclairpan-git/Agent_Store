import pytest

from agent_store.domain.models import (
    Agent,
    AgentVersion,
    AgentVersionCatalog,
    OsCompatibility,
    VersionArtifactConflict,
)


def test_agent_supports_framework_capability_and_official_flag() -> None:
    agent = Agent(
        agent_id="framework.ai-autosdlc",
        display_name="Ai_AutoSDLC",
        type="framework_capability",
        category="sdlc_framework",
        owner_team="SDLC Platform",
        owner_user="owner@example.com",
        official_flag=True,
        supported_os=(
            OsCompatibility(os="macOS", compatibility_status="smoke_passed"),
        ),
    )

    assert agent.is_framework_capability
    assert agent.official_flag
    assert agent.to_dict()["supported_os"] == [
        {"os": "macOS", "compatibility_status": "smoke_passed"}
    ]


def test_agent_version_catalog_rejects_same_version_hash_overwrite() -> None:
    catalog = AgentVersionCatalog()
    catalog.add(
        AgentVersion(
            agent_id="framework.ai-autosdlc",
            version="1.0.0",
            artifact_hash="sha256:first",
            signature="sig-1",
            issuer="Agent Store",
        )
    )

    with pytest.raises(VersionArtifactConflict):
        catalog.add(
            AgentVersion(
                agent_id="framework.ai-autosdlc",
                version="1.0.0",
                artifact_hash="sha256:second",
                signature="sig-2",
                issuer="Agent Store",
            )
        )


def test_agent_version_catalog_returns_existing_for_same_hash_retry() -> None:
    catalog = AgentVersionCatalog()
    original = AgentVersion(
        agent_id="framework.ai-autosdlc",
        version="1.0.0",
        artifact_hash="sha256:first",
        signature="sig-1",
        issuer="Agent Store",
    )
    retry = AgentVersion(
        agent_id="framework.ai-autosdlc",
        version="1.0.0",
        artifact_hash="sha256:first",
        signature="sig-1b",
        issuer="Agent Store",
    )

    assert catalog.add(original) is original
    assert catalog.add(retry) is original
