from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timedelta

from .models import utc_now
from .permissions import AuthContext, PermissionDecision


INSTALLATION_STATUSES = frozenset(
    {"not_installed", "activation_required", "reporter_pending", "failed", "revoked"}
)
ENTERPRISE_STATES = frozenset(
    {"detected_optional", "required_unactivated", "activating", "active", "degraded", "disabled"}
)
DEVICE_BINDING_STATUSES = frozenset({"active", "expired", "revoked"})
DEVICE_OS_VALUES = frozenset({"macOS", "Windows", "Linux"})


@dataclass(frozen=True)
class Installation:
    installation_id: str
    device_id: str
    agent_id: str
    agent_version: str
    artifact_hash: str
    user: str
    device_os: str
    status: str
    trace_id: str
    auth_context: AuthContext
    permission_decision: PermissionDecision
    enterprise_state: str = "activating"
    created_at: datetime = field(default_factory=utc_now)
    updated_at: datetime = field(default_factory=utc_now)

    def __post_init__(self) -> None:
        if not self.installation_id:
            raise ValueError("installation_id is required")
        if not self.device_id:
            raise ValueError("device_id is required")
        if not self.agent_id:
            raise ValueError("agent_id is required")
        if not self.agent_version:
            raise ValueError("agent_version is required")
        if not self.artifact_hash:
            raise ValueError("artifact_hash is required")
        if not self.user:
            raise ValueError("user is required")
        if self.device_os not in DEVICE_OS_VALUES:
            raise ValueError(f"unsupported device_os: {self.device_os}")
        if self.status not in INSTALLATION_STATUSES:
            raise ValueError(f"unsupported installation status: {self.status}")
        if self.enterprise_state not in ENTERPRISE_STATES:
            raise ValueError(f"unsupported enterprise_state: {self.enterprise_state}")
        if not self.trace_id:
            raise ValueError("trace_id is required")

    def to_dict(self) -> dict[str, object]:
        return {
            "installation_id": self.installation_id,
            "device_id": self.device_id,
            "agent_id": self.agent_id,
            "agent_version": self.agent_version,
            "artifact_hash": self.artifact_hash,
            "status": self.status,
            "enterprise_state": self.enterprise_state,
        }


@dataclass(frozen=True)
class DeviceBinding:
    device_id: str
    installation_id: str
    user: str
    artifact_hash: str
    device_public_key_thumbprint: str
    status: str = "active"
    bound_at: datetime = field(default_factory=utc_now)
    expires_at: datetime = field(default_factory=lambda: utc_now() + timedelta(days=30))

    def __post_init__(self) -> None:
        if not self.device_id:
            raise ValueError("device_id is required")
        if not self.installation_id:
            raise ValueError("installation_id is required")
        if not self.user:
            raise ValueError("user is required")
        if not self.artifact_hash:
            raise ValueError("artifact_hash is required")
        if not self.device_public_key_thumbprint:
            raise ValueError("device_public_key_thumbprint is required")
        if self.status not in DEVICE_BINDING_STATUSES:
            raise ValueError(f"unsupported device binding status: {self.status}")

    def to_dict(self) -> dict[str, object]:
        return {
            "device_id": self.device_id,
            "installation_id": self.installation_id,
            "user": self.user,
            "artifact_hash": self.artifact_hash,
            "device_public_key_thumbprint": self.device_public_key_thumbprint,
            "status": self.status,
        }
