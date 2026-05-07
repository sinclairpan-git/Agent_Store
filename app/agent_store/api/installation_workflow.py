from __future__ import annotations

from collections.abc import Iterable, Mapping
from uuid import uuid4

from agent_store.domain.errors import ErrorResponse
from agent_store.ui.catalog_workbench import CatalogAgentSource
from agent_store.ui.installation_workflow import build_installation_workflow_preview


def new_trace_id() -> str:
    return f"trace-{uuid4().hex}"


class InstallationWorkflowAPI:
    def __init__(self, sources: Iterable[CatalogAgentSource]) -> None:
        self.sources = {source.agent.agent_id: source for source in sources}

    def get_workflow_preview(
        self, agent_id: str, query: Mapping[str, object] | None = None
    ) -> tuple[int, dict[str, object]]:
        query = query or {}
        trace_id = str(query.get("trace_id") or new_trace_id())
        source = self.sources.get(agent_id)
        if source is None:
            return 404, ErrorResponse(
                error_code="AGENT_NOT_FOUND",
                message_key="errors.agentNotFound",
                severity="error",
                retryable=False,
                recommended_action_id="return_to_store",
                trace_id=trace_id,
            ).to_dict()
        return 200, build_installation_workflow_preview(
            source=source,
            trace_id=trace_id,
        )
