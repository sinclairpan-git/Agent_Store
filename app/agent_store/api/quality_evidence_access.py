from __future__ import annotations

import json
from collections.abc import Mapping, Sequence
from copy import deepcopy
from uuid import uuid4

from agent_store.domain.errors import ErrorResponse
from agent_store.domain.quality_evidence_access import (
    DEFAULT_ACCEPTED_SCORE_TEMPLATE_IDS,
    build_quality_evidence_access_summary,
)


def new_trace_id() -> str:
    return f"trace-{uuid4().hex}"


def _identity(payload: Mapping[str, object]) -> str:
    idempotent_payload = {
        key: _canonical_identity_value(key, value)
        for key, value in payload.items()
        if key not in {"trace_id", "audit_id"}
    }
    if "accepted_score_template_ids" not in idempotent_payload:
        idempotent_payload["accepted_score_template_ids"] = _canonical_identity_value(
            "accepted_score_template_ids",
            DEFAULT_ACCEPTED_SCORE_TEMPLATE_IDS,
        )
    return json.dumps(
        idempotent_payload,
        sort_keys=True,
        separators=(",", ":"),
        default=str,
    )


def _canonical_identity_value(key: str, value: object) -> object:
    if key == "accepted_score_template_ids" and _string_sequence(value):
        return sorted({_string(item) for item in value if _string(item)})
    return value


def _response_copy(response: Mapping[str, object]) -> dict[str, object]:
    return deepcopy(dict(response))


class QualityEvidenceAccessAPI:
    def __init__(self) -> None:
        self._idempotency: dict[str, tuple[str, dict[str, object]]] = {}

    def summarize_access(
        self,
        payload: object,
        *,
        headers: Mapping[str, str],
    ) -> tuple[int, dict[str, object]]:
        if not isinstance(payload, Mapping):
            return 400, self._validation_error(
                new_trace_id(),
                recommended_action_id="send_object_request_body",
                details={"reason": "request body must be an object"},
            )

        trace_id = _trace_id(payload)
        idempotency_key = _header_value(headers, "Idempotency-Key")
        if not idempotency_key:
            return 400, self._validation_error(
                trace_id,
                message_key="errors.idempotencyKeyRequired",
                recommended_action_id="retry_with_idempotency_key",
            )

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

        agentops_summary = payload.get("agentops_summary")
        if agentops_summary is not None and not isinstance(agentops_summary, Mapping):
            return 400, self._validation_error(
                trace_id,
                recommended_action_id="attach_agentops_summary",
                details={"reason": "agentops_summary must be an object when present"},
            )
        viewer_context = payload.get("viewer_context")
        if viewer_context is not None and not isinstance(viewer_context, Mapping):
            return 400, self._validation_error(
                trace_id,
                recommended_action_id="attach_viewer_context",
                details={"reason": "viewer_context must be an object when present"},
            )
        accepted_templates = payload.get("accepted_score_template_ids")
        if accepted_templates is not None and not _string_sequence(accepted_templates):
            return 400, self._validation_error(
                trace_id,
                recommended_action_id="attach_score_template_ids",
                details={
                    "reason": "accepted_score_template_ids must be an array of strings when present",
                },
            )

        audit_id = _string(payload.get("audit_id")) or f"audit-{uuid4().hex[:12]}"
        response = build_quality_evidence_access_summary(
            agentops_summary=agentops_summary
            if isinstance(agentops_summary, Mapping)
            else None,
            viewer_context=viewer_context
            if isinstance(viewer_context, Mapping)
            else None,
            trace_id=trace_id,
            audit_id=audit_id,
            accepted_score_template_ids=accepted_templates
            if isinstance(accepted_templates, Sequence)
            else DEFAULT_ACCEPTED_SCORE_TEMPLATE_IDS,
        ).to_response()
        self._idempotency[idempotency_key] = (
            request_identity,
            _response_copy(response),
        )
        return 200, _response_copy(response)

    @staticmethod
    def _validation_error(
        trace_id: str,
        *,
        message_key: str = "errors.validationError",
        recommended_action_id: str = "fix_request",
        details: dict[str, object] | None = None,
    ) -> dict[str, object]:
        return ErrorResponse(
            error_code="VALIDATION_ERROR",
            message_key=message_key,
            severity="error",
            retryable=True,
            recommended_action_id=recommended_action_id,
            trace_id=trace_id,
            details=details or {},
        ).to_dict()


def _string_sequence(value: object) -> bool:
    return (
        isinstance(value, Sequence)
        and not isinstance(value, (str, bytes))
        and all(isinstance(item, str) for item in value)
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
