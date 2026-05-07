from __future__ import annotations

from collections.abc import Iterable, Mapping
from uuid import uuid4

from agent_store.domain.errors import ErrorResponse
from agent_store.ui.catalog_workbench import CatalogAgentSource
from agent_store.ui.installation_request import (
    allowed_request_actions,
    build_installation_request,
)


def new_trace_id() -> str:
    return f"trace-{uuid4().hex}"


class InstallationRequestAPI:
    def __init__(self, sources: Iterable[CatalogAgentSource]) -> None:
        self.sources = {source.agent.agent_id: source for source in sources}

    def submit_request(
        self, agent_id: str, payload: Mapping[str, object] | None = None
    ) -> tuple[int, dict[str, object]]:
        payload = payload or {}
        trace_id = str(payload.get("trace_id") or new_trace_id())
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

        requested_by_value = payload.get("requested_by", "current-user")
        action_id = payload.get("action_id")
        if action_id is not None and not isinstance(action_id, str):
            return 400, self._validation_error(
                trace_id=trace_id,
                message_key="errors.invalidRequestAction",
                details={"field": "action_id"},
            )
        if not isinstance(requested_by_value, str) or not requested_by_value.strip():
            return 400, self._validation_error(
                trace_id=trace_id,
                message_key="errors.invalidRequestedBy",
                details={"field": "requested_by"},
            )
        requested_by = requested_by_value.strip()

        allowed_actions = allowed_request_actions(source)
        if action_id is not None and action_id not in allowed_actions:
            return 409, ErrorResponse(
                error_code="ACTION_NOT_ALLOWED",
                message_key="errors.actionNotAllowedForInstallability",
                severity="error",
                retryable=True,
                recommended_action_id=allowed_actions[0],
                trace_id=trace_id,
                details={
                    "installability": source.installability,
                    "allowed_actions": list(allowed_actions),
                },
            ).to_dict()

        body = build_installation_request(
            source=source,
            trace_id=trace_id,
            requested_by=requested_by,
            action_id=action_id,
        )
        status = 201 if body["request"]["request_state"] == "accepted" else 202
        if body["request"]["request_state"] == "standalone_ready":
            status = 200
        return status, body

    @staticmethod
    def _validation_error(
        *, trace_id: str, message_key: str, details: dict[str, object]
    ) -> dict[str, object]:
        return ErrorResponse(
            error_code="VALIDATION_ERROR",
            message_key=message_key,
            severity="error",
            retryable=False,
            recommended_action_id="fix_installation_request",
            trace_id=trace_id,
            details=details,
        ).to_dict()
