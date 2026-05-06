from __future__ import annotations

from dataclasses import dataclass

from agent_store import SCHEMA_VERSION
from .errors import ErrorResponse
from .models import Agent, AgentVersion, AgentVersionCatalog, VersionArtifactConflict


@dataclass(frozen=True)
class AgentDraftRecord:
    agent: Agent
    version: AgentVersion
    trace_id: str

    def to_response(self) -> dict[str, object]:
        agent_payload = self.agent.to_dict()
        agent_payload.update(
            {
                "version": self.version.version,
                "artifact_hash": self.version.artifact_hash,
                "release_status": self.version.release_status,
            }
        )
        return {
            "schema_version": SCHEMA_VERSION,
            "trace_id": self.trace_id,
            "error_code": "OK",
            "agent": agent_payload,
        }


class AgentRegistryError(Exception):
    def __init__(self, response: ErrorResponse, *, status_code: int = 400) -> None:
        super().__init__(response.error_code)
        self.response = response
        self.status_code = status_code


class InMemoryAgentRegistryRepository:
    def __init__(self) -> None:
        self._agents: dict[str, Agent] = {}
        self._versions = AgentVersionCatalog()
        self._records: dict[tuple[str, str], AgentDraftRecord] = {}
        self._idempotency: dict[str, AgentDraftRecord] = {}

    def create_draft(
        self,
        *,
        agent: Agent,
        version: AgentVersion,
        trace_id: str,
        idempotency_key: str | None = None,
    ) -> AgentDraftRecord:
        if idempotency_key and idempotency_key in self._idempotency:
            return self._idempotency[idempotency_key]

        if not agent.has_owner:
            raise AgentRegistryError(
                ErrorResponse(
                    error_code="AGENT_OWNER_REQUIRED",
                    message_key="errors.agentOwnerRequired",
                    severity="blocked",
                    retryable=False,
                    recommended_action_id="add_owner",
                    trace_id=trace_id,
                ),
                status_code=400,
            )

        try:
            stored_version = self._versions.add(version)
        except VersionArtifactConflict as exc:
            raise AgentRegistryError(
                ErrorResponse(
                    error_code="VERSION_ALREADY_EXISTS",
                    message_key="errors.versionAlreadyExists",
                    severity="blocked",
                    retryable=False,
                    recommended_action_id="publish_new_version",
                    trace_id=trace_id,
                    details={"agent_id": agent.agent_id, "version": version.version},
                ),
                status_code=409,
            ) from exc

        self._agents[agent.agent_id] = agent
        record_key = stored_version.identity_key
        record = self._records.get(record_key)
        if record is None:
            record = AgentDraftRecord(agent=agent, version=stored_version, trace_id=trace_id)
            self._records[record_key] = record
        if idempotency_key:
            self._idempotency[idempotency_key] = record
        return record

    def get_agent_detail(self, agent_id: str) -> AgentDraftRecord:
        candidates = [record for record in self._records.values() if record.agent.agent_id == agent_id]
        if not candidates:
            raise AgentRegistryError(
                ErrorResponse(
                    error_code="AGENT_NOT_FOUND",
                    message_key="errors.agentNotFound",
                    severity="error",
                    retryable=False,
                    recommended_action_id="return_to_store",
                    trace_id="trace-not-found",
                ),
                status_code=404,
            )
        return sorted(candidates, key=lambda item: item.version.created_at)[-1]
