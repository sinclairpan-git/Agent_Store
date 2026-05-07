from __future__ import annotations

from agent_store import SCHEMA_VERSION
from agent_store.domain.actions import ActionDescriptor
from agent_store.domain.agentops_summary import CredentialBootstrapSummary
from agent_store.domain.bootstrap_service import BootstrapService
from agent_store.domain.bootstrap_status import BootstrapStatus, status_for_installation
from agent_store.domain.errors import ErrorResponse
from agent_store.domain.installation import Installation
from agent_store.domain.permissions import AuthContext


class BootstrapStatusAPI:
    def __init__(self, bootstrap_service: BootstrapService) -> None:
        self.bootstrap_service = bootstrap_service

    def get_bootstrap_status(
        self,
        installation_id: str,
        *,
        auth_context: AuthContext,
        last_error_code: str | None = None,
        agentops_credential: CredentialBootstrapSummary | None = None,
    ) -> tuple[int, dict[str, object]]:
        record = self.bootstrap_service.get_record(installation_id)
        if record is None:
            status = BootstrapStatus(
                installation_id=installation_id,
                bootstrap_status="failed",
                current_step="issue_assertion",
                step_status="blocked",
                last_error_code="VALIDATION_ERROR",
                retryable=False,
                primary_action=ActionDescriptor(
                    action_id="return_to_official_app",
                    target_system="agent_store",
                    enabled=True,
                    audit_required=False,
                ),
            )
            body = status.to_dict()
        else:
            if record.installation.auth_context != auth_context:
                return 403, ErrorResponse(
                    error_code="PERMISSION_DENIED",
                    message_key="errors.permissionDenied",
                    severity="blocked",
                    retryable=False,
                    recommended_action_id="request_access",
                    trace_id=record.installation.trace_id,
                    details={
                        "installation_id": installation_id,
                        "auth_context_id": auth_context.auth_context_id,
                    },
                ).to_dict()
            if agentops_credential is not None and not _credential_matches_installation(
                agentops_credential,
                record.installation,
            ):
                return 409, ErrorResponse(
                    error_code="VALIDATION_ERROR",
                    message_key="errors.agentopsCredentialMismatch",
                    severity="blocked",
                    retryable=False,
                    recommended_action_id="refresh_agentops_credential",
                    trace_id=record.installation.trace_id,
                    details={
                        "installation_id": installation_id,
                        "credential_installation_id": agentops_credential.installation_id,
                        "device_id": record.installation.device_id,
                        "credential_device_id": agentops_credential.device_id,
                    },
                ).to_dict()
            body = status_for_installation(
                record.installation,
                last_error_code=last_error_code,
                agentops_credential=agentops_credential,
            ).to_dict()
        return 200, {
            "schema_version": SCHEMA_VERSION,
            "trace_id": record.installation.trace_id if record else "trace-not-found",
            "error_code": "OK",
            "status": body,
        }


def _credential_matches_installation(
    credential: CredentialBootstrapSummary,
    installation: Installation,
) -> bool:
    return (
        credential.installation_id == installation.installation_id
        and credential.device_id == installation.device_id
    )
