from __future__ import annotations

import json
from copy import deepcopy
from collections.abc import Mapping
from uuid import uuid4

from agent_store.domain.errors import ErrorResponse
from agent_store.domain.managed_installer import build_managed_installer_preview


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


class ManagedInstallerPreviewAPI:
    def __init__(self) -> None:
        self._idempotency: dict[str, tuple[str, dict[str, object]]] = {}

    def preview_managed_installer(
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

        agent_id = _string(payload.get("agent_id"))
        agent_version = _string(payload.get("agent_version"))
        if not agent_id or not agent_version:
            return 400, self._validation_error(
                trace_id,
                recommended_action_id="attach_agent_identity",
                details={"reason": "agent_id and agent_version are required"},
            )

        package = payload.get("package")
        policy_approval_echo = payload.get("policy_approval_echo")
        installation_runtime_handoff = payload.get("installation_runtime_handoff")
        if not isinstance(package, Mapping):
            return 400, self._validation_error(
                trace_id,
                recommended_action_id="attach_package",
                details={"reason": "package must be an object"},
            )
        if not isinstance(policy_approval_echo, Mapping):
            return 400, self._validation_error(
                trace_id,
                recommended_action_id="attach_policy_approval_echo",
                details={"reason": "policy_approval_echo must be an object"},
            )
        if not isinstance(installation_runtime_handoff, Mapping):
            return 400, self._validation_error(
                trace_id,
                recommended_action_id="attach_runtime_handoff",
                details={"reason": "installation_runtime_handoff must be an object"},
            )

        installer_probe = payload.get("installer_probe")
        if installer_probe is not None and not isinstance(installer_probe, Mapping):
            return 400, self._validation_error(
                trace_id,
                recommended_action_id="attach_installer_probe",
                details={"reason": "installer_probe must be an object when present"},
            )

        audit_id = _string(payload.get("audit_id")) or f"audit-{uuid4().hex[:12]}"
        response = build_managed_installer_preview(
            agent_id=agent_id,
            agent_version=agent_version,
            package=package,
            policy_approval_echo=policy_approval_echo,
            installation_runtime_handoff=installation_runtime_handoff,
            installer_probe=installer_probe,
            trace_id=trace_id,
            audit_id=audit_id,
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
