from __future__ import annotations

import json
from collections.abc import Mapping
from copy import deepcopy
from uuid import uuid4

from agent_store.domain.errors import ErrorResponse
from agent_store.domain.store_ops_deep_link import build_store_ops_deep_link


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


class StoreOpsDeepLinkAPI:
    def __init__(self) -> None:
        self._idempotency: dict[str, tuple[str, dict[str, object]]] = {}

    def build_deep_link(
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

        health_summary = payload.get("health_summary")
        if health_summary is not None and not isinstance(health_summary, Mapping):
            return 400, ErrorResponse(
                error_code="VALIDATION_ERROR",
                message_key="errors.validationError",
                severity="error",
                retryable=True,
                recommended_action_id="attach_health_summary",
                trace_id=trace_id,
                details={"reason": "health_summary must be an object when present"},
            ).to_dict()
        viewer_context = payload.get("viewer_context")
        if viewer_context is not None and not isinstance(viewer_context, Mapping):
            return 400, ErrorResponse(
                error_code="VALIDATION_ERROR",
                message_key="errors.validationError",
                severity="error",
                retryable=True,
                recommended_action_id="attach_viewer_context",
                trace_id=trace_id,
                details={"reason": "viewer_context must be an object when present"},
            ).to_dict()

        audit_id = _string(payload.get("audit_id")) or f"audit-{uuid4().hex[:12]}"
        response = build_store_ops_deep_link(
            health_summary=health_summary,
            viewer_context=viewer_context,
            trace_id=trace_id,
            audit_id=audit_id,
        ).to_response()
        self._idempotency[idempotency_key] = (
            request_identity,
            _response_copy(response),
        )
        return 200, _response_copy(response)


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
