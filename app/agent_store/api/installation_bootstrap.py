from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass
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


def required_string(payload: Mapping[str, object], field: str) -> str:
    value = payload[field]
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{field} must be a non-empty string")
    return value


@dataclass(frozen=True)
class AssertionRequestIdentity:
    installation_id: str
    device_public_key_thumbprint: str
    nonce: str
    audience: str


class InstallationBootstrapAPI:
    def __init__(
        self,
        *,
        bootstrap_service: BootstrapService | None = None,
        assertion_service: InstallationAssertionService | None = None,
    ) -> None:
        self.bootstrap_service = bootstrap_service or BootstrapService()
        self.assertion_service = assertion_service or InstallationAssertionService()
        self._assertion_idempotency: dict[
            tuple[str, str, str, str | None, str | None, str | None, str | None],
            tuple[AssertionRequestIdentity, dict[str, object]],
        ] = {}

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
                agent_id=required_string(payload, "agent_id"),
                agent_version=required_string(payload, "agent_version"),
                artifact_hash=required_string(payload, "artifact_hash"),
                device_os=required_string(payload, "device_os"),
                device_public_key_thumbprint=required_string(
                    payload,
                    "device_public_key_thumbprint",
                ),
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
        auth_context: AuthContext,
    ) -> tuple[int, dict[str, object]]:
        trace_id = str(payload.get("trace_id") or new_trace_id())
        idempotency_key = headers.get("Idempotency-Key")
        if not idempotency_key:
            return 400, self._validation_error("errors.idempotencyKeyRequired", trace_id)

        record = self.bootstrap_service.get_record(installation_id)
        if record is None:
            return 404, self._validation_error("errors.installationNotFound", trace_id)
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
        try:
            requested_thumbprint = required_string(payload, "device_public_key_thumbprint")
            nonce = required_string(payload, "nonce")
            audience = required_string(payload, "audience")
            request_identity = AssertionRequestIdentity(
                installation_id=installation_id,
                device_public_key_thumbprint=requested_thumbprint,
                nonce=nonce,
                audience=audience,
            )
            scoped_idempotency_key = self._scoped_assertion_idempotency_key(
                idempotency_key,
                installation_id,
                auth_context,
            )
            if scoped_idempotency_key in self._assertion_idempotency:
                existing_identity, response = self._assertion_idempotency[
                    scoped_idempotency_key
                ]
                if existing_identity == request_identity:
                    return 200, response
                return 409, ErrorResponse(
                    error_code="VALIDATION_ERROR",
                    message_key="errors.idempotencyKeyConflict",
                    severity="error",
                    retryable=False,
                    recommended_action_id="use_new_idempotency_key",
                    trace_id=trace_id,
                    details={"idempotency_key": idempotency_key},
                ).to_dict()

            bound_thumbprint = record.device_binding.device_public_key_thumbprint
            if requested_thumbprint != bound_thumbprint:
                return 409, ErrorResponse(
                    error_code="DEVICE_KEY_MISMATCH",
                    message_key="errors.deviceKeyMismatch",
                    severity="blocked",
                    retryable=False,
                    recommended_action_id="restart_activation",
                    trace_id=trace_id,
                ).to_dict()

            assertion = self.assertion_service.issue(
                record.installation,
                device_public_key_thumbprint=bound_thumbprint,
                nonce=nonce,
                audience=audience,
            )
            self.assertion_service.validate(
                assertion,
                expected_audience=audience,
                expected_device_public_key_thumbprint=bound_thumbprint,
                trace_id=trace_id,
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
        self._assertion_idempotency[scoped_idempotency_key] = (request_identity, response)
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

    @staticmethod
    def _scoped_assertion_idempotency_key(
        idempotency_key: str,
        installation_id: str,
        auth_context: AuthContext,
    ) -> tuple[str, str, str, str | None, str | None, str | None, str | None]:
        return (
            idempotency_key,
            installation_id,
            auth_context.subject_user_id,
            auth_context.tenant_id,
            auth_context.org_id,
            auth_context.project_id,
            auth_context.repo_ref,
        )
