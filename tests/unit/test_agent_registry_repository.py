import pytest

from agent_store.domain.models import Agent, AgentVersion
from agent_store.domain.repositories import (
    AgentRegistryError,
    InMemoryAgentRegistryRepository,
)


def _agent(owner_team: str = "SDLC Platform", owner_user: str = "owner@example.com") -> Agent:
    return Agent(
        agent_id="framework.ai-autosdlc",
        display_name="Ai_AutoSDLC",
        type="framework_capability",
        category="sdlc_framework",
        owner_team=owner_team,
        owner_user=owner_user,
        official_flag=True,
    )


def _version(artifact_hash: str = "sha256:first") -> AgentVersion:
    return AgentVersion(
        agent_id="framework.ai-autosdlc",
        version="1.0.0",
        artifact_hash=artifact_hash,
        signature="sig-1",
        issuer="Agent Store",
        release_status="manual_installable-preview",
    )


def test_create_draft_returns_registry_facts_and_trace_id() -> None:
    repo = InMemoryAgentRegistryRepository()

    record = repo.create_draft(
        agent=_agent(),
        version=_version(),
        trace_id="trace-123",
        idempotency_key="idem-1",
    )

    body = record.to_response()
    assert body["schema_version"]
    assert body["trace_id"] == "trace-123"
    assert body["error_code"] == "OK"
    assert body["agent"]["agent_id"] == "framework.ai-autosdlc"
    assert body["agent"]["version"] == "1.0.0"
    assert body["agent"]["artifact_hash"] == "sha256:first"


def test_create_draft_missing_owner_returns_stable_error() -> None:
    repo = InMemoryAgentRegistryRepository()

    with pytest.raises(AgentRegistryError) as exc_info:
        repo.create_draft(
            agent=_agent(owner_team=""),
            version=_version(),
            trace_id="trace-123",
        )

    assert exc_info.value.response.error_code == "AGENT_OWNER_REQUIRED"
    assert exc_info.value.response.recommended_action_id == "add_owner"


def test_create_draft_same_version_different_hash_returns_stable_error() -> None:
    repo = InMemoryAgentRegistryRepository()
    repo.create_draft(agent=_agent(), version=_version(), trace_id="trace-1")

    with pytest.raises(AgentRegistryError) as exc_info:
        repo.create_draft(
            agent=_agent(),
            version=_version("sha256:second"),
            trace_id="trace-2",
        )

    assert exc_info.value.status_code == 409
    assert exc_info.value.response.error_code == "VERSION_ALREADY_EXISTS"


def test_create_draft_idempotency_key_returns_same_record() -> None:
    repo = InMemoryAgentRegistryRepository()

    first = repo.create_draft(
        agent=_agent(),
        version=_version(),
        trace_id="trace-1",
        idempotency_key="idem-1",
    )
    second = repo.create_draft(
        agent=_agent(),
        version=_version("sha256:second"),
        trace_id="trace-2",
        idempotency_key="idem-1",
    )

    assert second is first
    assert second.trace_id == "trace-1"
