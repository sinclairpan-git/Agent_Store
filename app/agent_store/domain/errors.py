from __future__ import annotations

from dataclasses import dataclass, field

from agent_store import SCHEMA_VERSION
from .status_registry import SEVERITIES


@dataclass(frozen=True)
class ErrorResponse:
    error_code: str
    message_key: str
    severity: str
    retryable: bool
    recommended_action_id: str
    trace_id: str
    support_ref: str | None = None
    audit_id: str | None = None
    details: dict[str, object] = field(default_factory=dict)
    schema_version: str = SCHEMA_VERSION

    def __post_init__(self) -> None:
        if not self.error_code:
            raise ValueError("error_code is required")
        if not self.message_key:
            raise ValueError("message_key is required")
        if self.severity not in SEVERITIES:
            raise ValueError(f"unsupported severity: {self.severity}")
        if not self.recommended_action_id:
            raise ValueError("recommended_action_id is required")
        if not self.trace_id:
            raise ValueError("trace_id is required")

    def to_dict(self) -> dict[str, object]:
        data: dict[str, object] = {
            "schema_version": self.schema_version,
            "trace_id": self.trace_id,
            "error_code": self.error_code,
            "message_key": self.message_key,
            "severity": self.severity,
            "retryable": self.retryable,
            "recommended_action_id": self.recommended_action_id,
        }
        if self.support_ref is not None:
            data["support_ref"] = self.support_ref
        if self.audit_id is not None:
            data["audit_id"] = self.audit_id
        if self.details:
            data["details"] = self.details
        return data
