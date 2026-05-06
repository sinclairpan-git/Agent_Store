from __future__ import annotations

from agent_store import SCHEMA_VERSION
from agent_store.domain.actions import ActionDescriptor
from agent_store.domain.bootstrap_service import BootstrapService
from agent_store.domain.bootstrap_status import BootstrapStatus, status_for_installation


class BootstrapStatusAPI:
    def __init__(self, bootstrap_service: BootstrapService) -> None:
        self.bootstrap_service = bootstrap_service

    def get_bootstrap_status(
        self,
        installation_id: str,
        *,
        last_error_code: str | None = None,
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
            body = status_for_installation(
                record.installation,
                last_error_code=last_error_code,
            ).to_dict()
        return 200, {
            "schema_version": SCHEMA_VERSION,
            "trace_id": record.installation.trace_id if record else "trace-not-found",
            "error_code": "OK",
            "status": body,
        }
