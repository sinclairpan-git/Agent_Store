from __future__ import annotations

import json
from collections.abc import Mapping
from uuid import uuid4

from agent_store.domain.errors import ErrorResponse
from agent_store.domain.package_validation import build_package_validation_report


def new_trace_id() -> str:
    return f"trace-{uuid4().hex}"


def _identity(payload: Mapping[str, object]) -> str:
    return json.dumps(payload, sort_keys=True, separators=(",", ":"), default=str)


class PackageValidationAPI:
    def __init__(self) -> None:
        self._idempotency: dict[str, tuple[str, dict[str, object]]] = {}

    def validate_package(
        self,
        payload: Mapping[str, object],
        *,
        headers: Mapping[str, str],
    ) -> tuple[int, dict[str, object]]:
        trace_id = _trace_id(payload)
        idempotency_key = headers.get("Idempotency-Key")
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
            return 200, stored_response

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
        self._idempotency[idempotency_key] = (request_identity, response)
        return 200, response


def _trace_id(payload: Mapping[str, object]) -> str:
    value = payload.get("trace_id")
    if isinstance(value, str) and value.strip():
        return value.strip()
    return new_trace_id()
