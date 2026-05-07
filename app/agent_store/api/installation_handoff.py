from __future__ import annotations

from collections.abc import Iterable, Mapping

from agent_store import SCHEMA_VERSION
from agent_store.api.installation_request import InstallationRequestAPI
from agent_store.domain.actions import ActionDescriptor
from agent_store.domain.bootstrap_service import BootstrapError, BootstrapService
from agent_store.domain.errors import ErrorResponse
from agent_store.domain.permissions import AuthContext, PermissionDecision
from agent_store.ui.catalog_workbench import CatalogAgentSource


def required_string(payload: Mapping[str, object], field: str) -> str:
    value = payload[field]
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{field} must be a non-empty string")
    return value.strip()


class InstallationRequestHandoffAPI:
    def __init__(
        self,
        sources: Iterable[CatalogAgentSource],
        *,
        bootstrap_service: BootstrapService | None = None,
    ) -> None:
        self.sources = {source.agent.agent_id: source for source in sources}
        self.request_api = InstallationRequestAPI(self.sources.values())
        self.bootstrap_service = bootstrap_service or BootstrapService(
            versions={
                source.version.identity_key: source.version
                for source in self.sources.values()
            }
        )

    def create_installation_from_request(
        self,
        agent_id: str,
        payload: Mapping[str, object],
        *,
        headers: Mapping[str, str],
        auth_context: AuthContext,
        permission_decision: PermissionDecision,
    ) -> tuple[int, dict[str, object]]:
        request_payload = self._request_payload(payload)
        request_status, request_body = self.request_api.submit_request(
            agent_id,
            request_payload,
        )
        if request_status != 201:
            return request_status, request_body

        request = request_body["request"]
        if (
            not isinstance(request, Mapping)
            or request.get("request_state") != "accepted"
        ):
            return 409, self._handoff_error(
                trace_id=str(request_body["trace_id"]),
                message_key="errors.requestNotAcceptedForBootstrap",
                details={
                    "request_state": request.get("request_state")
                    if isinstance(request, Mapping)
                    else "unknown"
                },
            )

        expected_request_id = str(request["request_id"])
        requested_request_id = payload.get("request_id")
        if (
            requested_request_id is not None
            and requested_request_id != expected_request_id
        ):
            return 409, self._handoff_error(
                trace_id=str(request_body["trace_id"]),
                message_key="errors.requestIdentityMismatch",
                details={
                    "expected_request_id": expected_request_id,
                    "request_id": requested_request_id,
                },
            )

        audit_id = str(request["audit_id"])
        if permission_decision.audit_id != audit_id:
            return 409, self._handoff_error(
                trace_id=str(request_body["trace_id"]),
                message_key="errors.requestAuditMismatch",
                details={
                    "request_audit_id": audit_id,
                    "permission_audit_id": permission_decision.audit_id,
                },
            )

        idempotency_key = headers.get("Idempotency-Key")
        if not idempotency_key:
            return 400, self._handoff_error(
                trace_id=str(request_body["trace_id"]),
                message_key="errors.idempotencyKeyRequired",
                details={"field": "Idempotency-Key"},
            )

        source = self.sources[agent_id]
        try:
            record = self.bootstrap_service.create_installation(
                agent_id=source.agent.agent_id,
                agent_version=source.version.version,
                artifact_hash=source.version.artifact_hash,
                device_os=required_string(payload, "device_os"),
                device_public_key_thumbprint=required_string(
                    payload,
                    "device_public_key_thumbprint",
                ),
                auth_context=auth_context,
                permission_decision=permission_decision,
                trace_id=str(request_body["trace_id"]),
                idempotency_key=idempotency_key,
            )
        except BootstrapError as exc:
            return exc.status_code, exc.response.to_dict()
        except (KeyError, TypeError, ValueError) as exc:
            return 400, self._handoff_error(
                trace_id=str(request_body["trace_id"]),
                message_key="errors.validationError",
                details={"reason": str(exc)},
            )

        installation_response = record.to_response()
        installation = installation_response["installation"]
        if not isinstance(installation, Mapping):
            return 500, self._handoff_error(
                trace_id=str(request_body["trace_id"]),
                message_key="errors.installationEnvelopeInvalid",
                details={},
            )
        return 201, {
            "schema_version": SCHEMA_VERSION,
            "trace_id": request_body["trace_id"],
            "error_code": "OK",
            "handoff": {
                "handoff_id": f"handoff-{expected_request_id}",
                "handoff_state": "installation_created",
                "request_id": expected_request_id,
                "audit_id": audit_id,
                "idempotency_key": idempotency_key,
                "queue": request["queue"],
                "installation_id": installation["installation_id"],
                "next_action": ActionDescriptor(
                    action_id="poll_bootstrap_status",
                    target_system="agent_store",
                    enabled=True,
                    requires_permission=False,
                    audit_required=False,
                    href=f"#bootstrap-status-{installation['installation_id']}",
                ).to_dict(),
            },
            "request": request,
            "installation": installation,
            "auth_context": installation_response["auth_context"],
            "permission_decision": installation_response["permission_decision"],
        }

    @staticmethod
    def _request_payload(payload: Mapping[str, object]) -> Mapping[str, object]:
        request_payload = payload.get("request")
        if isinstance(request_payload, Mapping):
            return request_payload
        return payload

    @staticmethod
    def _handoff_error(
        *,
        trace_id: str,
        message_key: str,
        details: dict[str, object],
    ) -> dict[str, object]:
        return ErrorResponse(
            error_code="HANDOFF_ERROR",
            message_key=message_key,
            severity="error",
            retryable=False,
            recommended_action_id="repair_installation_handoff",
            trace_id=trace_id or "trace-handoff-validation",
            details=details,
        ).to_dict()
