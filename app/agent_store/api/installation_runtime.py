from __future__ import annotations

import json
from copy import deepcopy
from collections.abc import Mapping
from uuid import uuid4

from agent_store.domain.bootstrap_service import BootstrapService
from agent_store.domain.errors import ErrorResponse
from agent_store.domain.installation_runtime import (
    build_installation_runtime_handoff,
)
from agent_store.domain.permissions import AuthContext


def new_trace_id() -> str:
    return f"trace-{uuid4().hex}"


def _response_copy(response: Mapping[str, object]) -> dict[str, object]:
    return deepcopy(dict(response))


def _identity(installation_id: str, payload: Mapping[str, object]) -> str:
    idempotent_payload = {
        key: value
        for key, value in payload.items()
        if key not in {"trace_id", "audit_id"}
    }
    return json.dumps(
        {
            "installation_id": installation_id,
            "payload": idempotent_payload,
        },
        sort_keys=True,
        separators=(",", ":"),
        default=str,
    )


class InstallationRuntimeHandoffAPI:
    def __init__(self, *, bootstrap_service: BootstrapService | None = None) -> None:
        self.bootstrap_service = bootstrap_service or BootstrapService()
        self._idempotency: dict[
            tuple[str, str, str | None, str | None, str | None, str | None],
            tuple[str, dict[str, object]],
        ] = {}

    def create_runtime_handoff(
        self,
        installation_id: str,
        payload: object,
        *,
        headers: Mapping[str, str],
        auth_context: AuthContext,
    ) -> tuple[int, dict[str, object]]:
        if not isinstance(payload, Mapping):
            trace_id = new_trace_id()
            return 400, self._validation_error(
                trace_id,
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

        record = self.bootstrap_service.get_record(installation_id)
        if record is None:
            return 404, ErrorResponse(
                error_code="INSTALLATION_NOT_FOUND",
                message_key="errors.installationNotFound",
                severity="error",
                retryable=False,
                recommended_action_id="select_existing_installation",
                trace_id=trace_id,
                details={"installation_id": installation_id},
            ).to_dict()
        if record.installation.auth_context != auth_context:
            return 403, ErrorResponse(
                error_code="PERMISSION_DENIED",
                message_key="errors.permissionDenied",
                severity="blocked",
                retryable=False,
                recommended_action_id="request_access",
                trace_id=trace_id,
                details={
                    "installation_id": installation_id,
                    "auth_context_id": auth_context.auth_context_id,
                },
            ).to_dict()

        request_identity = _identity(installation_id, payload)
        scoped_key = self._scoped_idempotency_key(
            idempotency_key,
            auth_context,
        )
        if scoped_key in self._idempotency:
            stored_identity, stored_response = self._idempotency[scoped_key]
            if stored_identity != request_identity:
                return 409, ErrorResponse(
                    error_code="IDEMPOTENCY_KEY_CONFLICT",
                    message_key="errors.idempotencyKeyConflict",
                    severity="blocked",
                    retryable=False,
                    recommended_action_id="use_unique_idempotency_key",
                    trace_id=trace_id,
                    details={"idempotency_key": idempotency_key},
                ).to_dict()
            return 200, _response_copy(stored_response)

        runtime_echo = payload.get("runtime_echo")
        if runtime_echo is not None and not isinstance(runtime_echo, Mapping):
            return 400, self._validation_error(
                trace_id,
                recommended_action_id="attach_runtime_echo",
                details={"reason": "runtime_echo must be an object when present"},
            )

        audit_id = _string(payload.get("audit_id")) or (
            record.installation.permission_decision.audit_id
        )
        response = build_installation_runtime_handoff(
            record,
            runtime_echo=runtime_echo,
            trace_id=trace_id,
            audit_id=audit_id,
        ).to_response()
        self._idempotency[scoped_key] = (
            request_identity,
            _response_copy(response),
        )
        return 200, _response_copy(response)

    @staticmethod
    def _scoped_idempotency_key(
        idempotency_key: str,
        auth_context: AuthContext,
    ) -> tuple[str, str, str | None, str | None, str | None, str | None]:
        return (
            idempotency_key,
            auth_context.subject_user_id,
            auth_context.tenant_id,
            auth_context.org_id,
            auth_context.project_id,
            auth_context.repo_ref,
        )

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
