from __future__ import annotations

from collections.abc import Mapping
from uuid import uuid4

from agent_store import SCHEMA_VERSION
from agent_store.domain.assertions import (
    AssertionValidationError,
    InstallationAssertionService,
)
from agent_store.domain.bootstrap_service import BootstrapError, BootstrapService
from agent_store.domain.errors import ErrorResponse
from agent_store.domain.permissions import AuthContext, PermissionDecision


def new_trace_id() -> str:
    return f"trace-{uuid4().hex}"


class InstallationBootstrapAPI:
    def __init__(
        self,
        *,
        bootstrap_service: BootstrapService | None = None,
        assertion_service: InstallationAssertionService | None = None,
    ) -> None:
        self.bootstrap_service = bootstrap_service or BootstrapService()
        self.assertion_service = assertion_service or InstallationAssertionService()
        self._assertion_idempotency: dict[str, dict[str, object]] = {}

    def create_installation(
        self,
        payload: Mapping[str, object],
        *,
        headers: Mapping[str, str],
        auth_context: AuthContext,
        permission_decision: PermissionDecision,
    ) -> tuple[int, dict[str, object]]:
        trace_id = str(payload.get("trace_id") or new_trace_id())
        idempotency_key = headers.get("Idempotency-Key")
        if not idempotency_key:
            return 400, self._validation_error("errors.idempotencyKeyRequired", trace_id)

        try:
            record = self.bootstrap_service.create_installation(
                agent_id=str(payload["agent_id"]),
                agent_version=str(payload["agent_version"]),
                artifact_hash=str(payload["artifact_hash"]),
                device_os=str(payload["device_os"]),
                device_public_key_thumbprint=str(payload["device_public_key_thumbprint"]),
                auth_context=auth_context,
                permission_decision=permission_decision,
                trace_id=trace_id,
                idempotency_key=idempotency_key,
            )
        except BootstrapError as exc:
            return exc.status_code, exc.response.to_dict()
        except (KeyError, TypeError, ValueError) as exc:
            return 400, self._validation_error("errors.validationError", trace_id, str(exc))
        return 201, record.to_response()

    def issue_installation_assertion(
        self,
        installation_id: str,
        payload: Mapping[str, object],
        *,
        headers: Mapping[str, str],
    ) -> tuple[int, dict[str, object]]:
        trace_id = str(payload.get("trace_id") or new_trace_id())
        idempotency_key = headers.get("Idempotency-Key")
        if not idempotency_key:
            return 400, self._validation_error("errors.idempotencyKeyRequired", trace_id)
        if idempotency_key in self._assertion_idempotency:
            return 200, self._assertion_idempotency[idempotency_key]

        record = self.bootstrap_service.get_record(installation_id)
        if record is None:
            return 404, self._validation_error("errors.installationNotFound", trace_id)
        try:
            assertion = self.assertion_service.issue(
                record.installation,
                device_public_key_thumbprint=str(payload["device_public_key_thumbprint"]),
                nonce=str(payload["nonce"]),
                audience=str(payload["audience"]),
            )
            self.assertion_service.validate(
                assertion,
                expected_audience=str(payload["audience"]),
                expected_device_public_key_thumbprint=str(
                    payload["device_public_key_thumbprint"]
                ),
                trace_id=trace_id,
                mark_nonce_seen=False,
            )
        except AssertionValidationError as exc:
            return 409, exc.response.to_dict()
        except (KeyError, TypeError, ValueError) as exc:
            return 400, self._validation_error("errors.validationError", trace_id, str(exc))

        response = {
            "schema_version": SCHEMA_VERSION,
            "trace_id": trace_id,
            "error_code": "OK",
            "assertion": assertion.to_dict(),
        }
        self._assertion_idempotency[idempotency_key] = response
        return 200, response

    @staticmethod
    def _validation_error(
        message_key: str,
        trace_id: str,
        reason: str | None = None,
    ) -> dict[str, object]:
        return ErrorResponse(
            error_code="VALIDATION_ERROR",
            message_key=message_key,
            severity="error",
            retryable=True,
            recommended_action_id="fix_request",
            trace_id=trace_id,
            details={"reason": reason} if reason else {},
        ).to_dict()
