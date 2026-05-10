from __future__ import annotations

import json
from collections.abc import Mapping
from copy import deepcopy
from uuid import uuid4

from agent_store.domain.errors import ErrorResponse
from agent_store.domain.notification_routing import (
    build_notification_routing_summary,
)


def new_trace_id() -> str:
    return f"trace-{uuid4().hex}"


def _identity(payload: Mapping[str, object]) -> str:
    idempotent_payload = {
        key: value
        for key, value in payload.items()
        if key not in {"trace_id", "audit_id"}
    }
    return json.dumps(
        idempotent_payload,
        sort_keys=True,
        separators=(",", ":"),
        default=str,
    )


def _response_copy(response: Mapping[str, object]) -> dict[str, object]:
    return deepcopy(dict(response))


class NotificationRoutingAPI:
    def __init__(self) -> None:
        self._idempotency: dict[str, tuple[str, dict[str, object]]] = {}

    def summarize_notification_route(
        self,
        payload: object,
        *,
        headers: Mapping[str, str],
    ) -> tuple[int, dict[str, object]]:
        if not isinstance(payload, Mapping):
            return 400, ErrorResponse(
                error_code="VALIDATION_ERROR",
                message_key="errors.validationError",
                severity="error",
                retryable=True,
                recommended_action_id="send_object_request_body",
                trace_id=new_trace_id(),
                details={"reason": "request body must be an object"},
            ).to_dict()

        trace_id = _trace_id(payload)
        idempotency_key = _header_value(headers, "Idempotency-Key")
        if not idempotency_key:
            return 400, ErrorResponse(
                error_code="VALIDATION_ERROR",
                message_key="errors.idempotencyKeyRequired",
                severity="error",
                retryable=True,
                recommended_action_id="retry_with_idempotency_key",
                trace_id=trace_id,
            ).to_dict()

        request_identity = _identity(payload)
        if idempotency_key in self._idempotency:
            stored_identity, stored_response = self._idempotency[idempotency_key]
            if stored_identity != request_identity:
                return 409, ErrorResponse(
                    error_code="IDEMPOTENCY_KEY_CONFLICT",
                    message_key="errors.idempotencyKeyConflict",
                    severity="blocked",
                    retryable=False,
                    recommended_action_id="use_unique_idempotency_key",
                    trace_id=trace_id,
                ).to_dict()
            return 200, _response_copy(stored_response)

        event_context = _optional_mapping(payload, "event_context")
        audience_context = _optional_mapping(payload, "audience_context")
        if isinstance(event_context, ErrorResponse):
            return 400, event_context.to_dict()
        if isinstance(audience_context, ErrorResponse):
            return 400, audience_context.to_dict()

        audit_id = _string(payload.get("audit_id")) or f"audit-{uuid4().hex[:12]}"
        response = build_notification_routing_summary(
            event_context=event_context,
            audience_context=audience_context,
            trace_id=trace_id,
            audit_id=audit_id,
        ).to_response()
        self._idempotency[idempotency_key] = (
            request_identity,
            _response_copy(response),
        )
        return 200, _response_copy(response)


def _optional_mapping(
    payload: Mapping[str, object],
    field: str,
) -> Mapping[str, object] | ErrorResponse | None:
    value = payload.get(field)
    if value is None or isinstance(value, Mapping):
        return value
    return ErrorResponse(
        error_code="VALIDATION_ERROR",
        message_key="errors.validationError",
        severity="error",
        retryable=True,
        recommended_action_id=f"attach_{field}",
        trace_id=_trace_id(payload),
        details={"reason": f"{field} must be an object when present"},
    )


def _trace_id(payload: Mapping[str, object]) -> str:
    return _string(payload.get("trace_id")) or new_trace_id()


def _header_value(headers: Mapping[str, str], name: str) -> str | None:
    normalized = name.lower()
    for key, value in headers.items():
        if key.lower() == normalized:
            stripped = value.strip()
            return stripped if stripped else None
    return None


def _string(value: object) -> str:
    return value.strip() if isinstance(value, str) else ""
