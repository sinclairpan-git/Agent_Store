from __future__ import annotations

import json
from copy import deepcopy
from collections.abc import Mapping
from uuid import uuid4

from agent_store.domain.errors import ErrorResponse
from agent_store.domain.package_validation import build_package_validation_report


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


class PackageValidationAPI:
    def __init__(self) -> None:
        self._idempotency: dict[str, tuple[str, dict[str, object]]] = {}

    def validate_package(
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

        manifest = payload.get("package_manifest")
        if not isinstance(manifest, Mapping):
            return 400, ErrorResponse(
                error_code="VALIDATION_ERROR",
                message_key="errors.validationError",
                severity="error",
                retryable=True,
                recommended_action_id="attach_package_manifest",
                trace_id=trace_id,
                details={"reason": "package_manifest must be an object"},
            ).to_dict()

        audit_id = str(payload.get("audit_id") or f"audit-{uuid4().hex[:12]}")
        response = build_package_validation_report(
            manifest,
            trace_id=trace_id,
            audit_id=audit_id,
        ).to_response()
        self._idempotency[idempotency_key] = (
            request_identity,
            _response_copy(response),
        )
        return 200, _response_copy(response)


def _trace_id(payload: Mapping[str, object]) -> str:
    value = payload.get("trace_id")
    if isinstance(value, str) and value.strip():
        return value.strip()
    return new_trace_id()


def _header_value(headers: Mapping[str, str], name: str) -> str | None:
    normalized = name.lower()
    for key, value in headers.items():
        if key.lower() == normalized:
            stripped = value.strip()
            return stripped if stripped else None
    return None
