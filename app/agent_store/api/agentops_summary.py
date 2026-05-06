from __future__ import annotations

from uuid import uuid4

from agent_store.integrations.agentops_client import AgentOpsSummaryClient


def new_trace_id() -> str:
    return f"trace-{uuid4().hex}"


class AgentOpsSummaryAPI:
    def __init__(self, client: AgentOpsSummaryClient | None = None) -> None:
        self.client = client or AgentOpsSummaryClient()

    def get_agentops_summary(
        self,
        agent_id: str,
        *,
        version: str,
        raw_evidence_allowed: bool = True,
        trace_id: str | None = None,
    ) -> tuple[int, dict[str, object]]:
        summary = self.client.get_summary(
            agent_id,
            version,
            trace_id=trace_id or new_trace_id(),
            raw_evidence_allowed=raw_evidence_allowed,
        )
        return 200, summary.to_response()
