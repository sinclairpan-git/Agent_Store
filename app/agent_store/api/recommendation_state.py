from __future__ import annotations

from collections.abc import Iterable, Mapping
from uuid import uuid4

from agent_store.domain.errors import ErrorResponse
from agent_store.integrations.agentops_client import AgentOpsSummaryClient
from agent_store.ui.catalog_workbench import CatalogAgentSource
from agent_store.ui.recommendation_state import build_recommendation_state


def new_trace_id() -> str:
    return f"trace-{uuid4().hex}"


class RecommendationStateAPI:
    def __init__(
        self,
        sources: Iterable[CatalogAgentSource],
        *,
        agentops_client: AgentOpsSummaryClient | None = None,
    ) -> None:
        self.sources = tuple(sources)
        self.agentops_client = agentops_client or AgentOpsSummaryClient()

    def get_recommendation_state(
        self,
        agent_id: str,
        query: Mapping[str, object] | None = None,
    ) -> tuple[int, dict[str, object]]:
        query = query or {}
        trace_id = self._trace_id(query)
        source = next(
            (item for item in self.sources if item.agent.agent_id == agent_id),
            None,
        )
        if source is None:
            return 404, ErrorResponse(
                error_code="AGENT_NOT_FOUND",
                message_key="errors.agentNotFound",
                severity="error",
                retryable=False,
                recommended_action_id="adjust_catalog_filters",
                trace_id=trace_id,
                details={"agent_id": agent_id},
            ).to_dict()

        summary = self.agentops_client.get_summary(
            source.agent.agent_id,
            source.version.version,
            trace_id=trace_id,
            raw_evidence_allowed=False,
        )
        return 200, build_recommendation_state(
            source=source,
            trace_id=trace_id,
            agentops_summary=summary,
        )

    @staticmethod
    def _trace_id(query: Mapping[str, object]) -> str:
        value = query.get("trace_id")
        if value is None:
            return new_trace_id()
        if not isinstance(value, str) or not value.strip():
            return new_trace_id()
        return value.strip()
