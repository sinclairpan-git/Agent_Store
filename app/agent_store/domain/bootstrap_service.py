from __future__ import annotations

from dataclasses import dataclass
from uuid import uuid4

from agent_store import SCHEMA_VERSION
from .errors import ErrorResponse
from .installation import DeviceBinding, Installation
from .models import AgentVersion
from .permissions import AuthContext, PermissionDecision


class BootstrapError(Exception):
    def __init__(self, response: ErrorResponse, *, status_code: int = 400) -> None:
        super().__init__(response.error_code)
        self.response = response
        self.status_code = status_code


@dataclass(frozen=True)
class BootstrapRecord:
    installation: Installation
    device_binding: DeviceBinding

    def to_response(self) -> dict[str, object]:
        return {
            "schema_version": SCHEMA_VERSION,
            "trace_id": self.installation.trace_id,
            "error_code": "OK",
            "installation": self.installation.to_dict(),
            "auth_context": {
                "auth_context_id": self.installation.auth_context.auth_context_id,
                "subject_user_id": self.installation.auth_context.subject_user_id,
                "tenant_id": self.installation.auth_context.tenant_id,
                "org_id": self.installation.auth_context.org_id,
                "project_id": self.installation.auth_context.project_id,
                "repo_ref": self.installation.auth_context.repo_ref,
                "identity_confidence": self.installation.auth_context.identity_confidence,
            },
            "permission_decision": {
                "permission_decision_id": self.installation.permission_decision.permission_decision_id,
                "decision": self.installation.permission_decision.decision,
                "denied_scope": self.installation.permission_decision.denied_scope,
                "request_access_url": self.installation.permission_decision.request_access_url,
                "audit_id": self.installation.permission_decision.audit_id,
                "trace_id": self.installation.permission_decision.trace_id,
            },
        }


@dataclass(frozen=True)
class BootstrapRequestIdentity:
    agent_id: str
    agent_version: str
    artifact_hash: str
    device_os: str
    device_public_key_thumbprint: str
    subject_user_id: str
    tenant_id: str | None
    org_id: str | None
    project_id: str | None
    repo_ref: str | None
    permission_decision: str


class BootstrapService:
    def __init__(self, versions: dict[tuple[str, str], AgentVersion] | None = None) -> None:
        self._versions = versions or {}
        self._records: dict[str, tuple[BootstrapRequestIdentity, BootstrapRecord]] = {}
        self._by_installation_id: dict[str, BootstrapRecord] = {}

    def register_version(self, version: AgentVersion) -> None:
        self._versions[version.identity_key] = version

    def create_installation(
        self,
        *,
        agent_id: str,
        agent_version: str,
        artifact_hash: str,
        device_os: str,
        device_public_key_thumbprint: str,
        auth_context: AuthContext,
        permission_decision: PermissionDecision,
        trace_id: str,
        idempotency_key: str,
    ) -> BootstrapRecord:
        request_identity = BootstrapRequestIdentity(
            agent_id=agent_id,
            agent_version=agent_version,
            artifact_hash=artifact_hash,
            device_os=device_os,
            device_public_key_thumbprint=device_public_key_thumbprint,
            subject_user_id=auth_context.subject_user_id,
            tenant_id=auth_context.tenant_id,
            org_id=auth_context.org_id,
            project_id=auth_context.project_id,
            repo_ref=auth_context.repo_ref,
            permission_decision=permission_decision.decision,
        )
        if idempotency_key in self._records:
            existing_identity, record = self._records[idempotency_key]
            if existing_identity == request_identity:
                return record
            raise BootstrapError(
                ErrorResponse(
                    error_code="VALIDATION_ERROR",
                    message_key="errors.idempotencyKeyConflict",
                    severity="error",
                    retryable=False,
                    recommended_action_id="use_new_idempotency_key",
                    trace_id=trace_id,
                    details={"idempotency_key": idempotency_key},
                ),
                status_code=409,
            )

        if permission_decision.auth_context != auth_context:
            raise BootstrapError(
                ErrorResponse(
                    error_code="PERMISSION_DENIED",
                    message_key="errors.permissionContextMismatch",
                    severity="blocked",
                    retryable=False,
                    recommended_action_id="refresh_permission_decision",
                    trace_id=trace_id,
                    details={
                        "auth_context_id": auth_context.auth_context_id,
                        "permission_auth_context_id": (
                            permission_decision.auth_context.auth_context_id
                        ),
                    },
                ),
                status_code=403,
            )

        if permission_decision.decision != "allow":
            raise BootstrapError(
                ErrorResponse(
                    error_code="PERMISSION_DENIED",
                    message_key="errors.permissionDenied",
                    severity="blocked",
                    retryable=permission_decision.decision == "approval_required",
                    recommended_action_id="request_access",
                    trace_id=trace_id,
                    details={
                        "decision": permission_decision.decision,
                        "denied_scope": permission_decision.denied_scope,
                        "request_access_url": permission_decision.request_access_url,
                    },
                ),
                status_code=403,
            )

        expected_version = self._versions.get((agent_id, agent_version))
        if expected_version is None:
            raise BootstrapError(
                ErrorResponse(
                    error_code="PACKAGE_HASH_MISMATCH",
                    message_key="errors.agentVersionUnknown",
                    severity="blocked",
                    retryable=False,
                    recommended_action_id="select_verified_agent_version",
                    trace_id=trace_id,
                    details={
                        "agent_id": agent_id,
                        "agent_version": agent_version,
                        "reason": "version_not_registered",
                    },
                ),
                status_code=404,
            )
        if expected_version.artifact_hash != artifact_hash:
            raise BootstrapError(
                ErrorResponse(
                    error_code="PACKAGE_HASH_MISMATCH",
                    message_key="errors.packageHashMismatch",
                    severity="blocked",
                    retryable=False,
                    recommended_action_id="regenerate_activation_command",
                    trace_id=trace_id,
                    details={
                        "agent_id": agent_id,
                        "agent_version": agent_version,
                        "expected_hash": expected_version.artifact_hash,
                    },
                ),
                status_code=409,
            )

        installation_id = f"inst-{uuid4().hex}"
        device_id = f"dev-{uuid4().hex}"
        installation = Installation(
            installation_id=installation_id,
            device_id=device_id,
            agent_id=agent_id,
            agent_version=agent_version,
            artifact_hash=artifact_hash,
            user=auth_context.subject_user_id,
            device_os=device_os,
            status="activation_required",
            enterprise_state="activating",
            trace_id=trace_id,
            auth_context=auth_context,
            permission_decision=permission_decision,
        )
        binding = DeviceBinding(
            device_id=device_id,
            installation_id=installation_id,
            user=auth_context.subject_user_id,
            artifact_hash=artifact_hash,
            device_public_key_thumbprint=device_public_key_thumbprint,
        )
        record = BootstrapRecord(installation=installation, device_binding=binding)
        self._records[idempotency_key] = (request_identity, record)
        self._by_installation_id[installation_id] = record
        return record

    def get_record(self, installation_id: str) -> BootstrapRecord | None:
        return self._by_installation_id.get(installation_id)
