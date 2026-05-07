from __future__ import annotations

from collections.abc import Iterable, Mapping
from uuid import uuid4

from agent_store.domain.errors import ErrorResponse
from agent_store.ui.catalog_workbench import (
    CatalogAgentSource,
    CatalogFilter,
    build_catalog_workbench,
)


FILTER_FIELDS = {
    "agent_type": {"agent", "skill", "framework_capability"},
    "trust_state": {"trusted", "warning", "blocked", "unknown"},
    "installability": {
        "installable",
        "activation_required",
        "blocked",
        "standalone_only",
    },
}


def new_trace_id() -> str:
    return f"trace-{uuid4().hex}"


class AgentCatalogAPI:
    def __init__(self, sources: Iterable[CatalogAgentSource]) -> None:
        self.sources = tuple(sources)

    def list_agents(
        self, query: Mapping[str, object] | None = None
    ) -> tuple[int, dict[str, object]]:
        query = query or {}
        trace_id = str(query.get("trace_id") or new_trace_id())
        try:
            filters = self._filters_from_query(query)
            selected_agent_id = self._optional_string(query.get("selected_agent_id"))
        except ValueError as exc:
            return 400, ErrorResponse(
                error_code="VALIDATION_ERROR",
                message_key="errors.validationError",
                severity="error",
                retryable=True,
                recommended_action_id="fix_catalog_filters",
                trace_id=trace_id,
                details={"reason": str(exc)},
            ).to_dict()

        return 200, build_catalog_workbench(
            sources=self.sources,
            trace_id=trace_id,
            filters=filters,
            selected_agent_id=selected_agent_id,
        )

    @classmethod
    def _filters_from_query(cls, query: Mapping[str, object]) -> CatalogFilter:
        return CatalogFilter(
            search=cls._optional_string(query.get("search")),
            agent_type=cls._enum_value(query, "agent_type"),
            trust_state=cls._enum_value(query, "trust_state"),
            installability=cls._enum_value(query, "installability"),
        )

    @staticmethod
    def _optional_string(value: object) -> str | None:
        if value is None:
            return None
        if not isinstance(value, str):
            raise ValueError("filter values must be strings")
        stripped = value.strip()
        if not stripped or stripped == "all":
            return None
        return stripped

    @classmethod
    def _enum_value(cls, query: Mapping[str, object], field: str) -> str | None:
        value = cls._optional_string(query.get(field))
        if value is None:
            return None
        if value not in FILTER_FIELDS[field]:
            raise ValueError(f"unsupported {field}: {value}")
        return value
