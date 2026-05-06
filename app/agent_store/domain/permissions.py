from __future__ import annotations

from dataclasses import dataclass
from typing import Mapping


PERMISSION_DECISIONS = frozenset({"allow", "deny", "approval_required"})


class UntrustedIdentityError(ValueError):
    """Raised when a permission result is requested without trusted auth facts."""


@dataclass(frozen=True)
class AuthContext:
    auth_context_id: str
    subject_user_id: str
    identity_confidence: float
    tenant_id: str | None = None
    org_id: str | None = None
    project_id: str | None = None
    repo_ref: str | None = None
    identity_source: str = "sso_token"

    def __post_init__(self) -> None:
        if not self.auth_context_id:
            raise ValueError("auth_context_id is required")
        if not self.subject_user_id:
            raise ValueError("subject_user_id is required")
        if not 0 <= self.identity_confidence <= 1:
            raise ValueError("identity_confidence must be between 0 and 1")
        if self.identity_source == "client_user_id":
            raise UntrustedIdentityError(
                "client supplied user_id is not a trusted identity source"
            )


@dataclass(frozen=True)
class PermissionDecision:
    permission_decision_id: str
    auth_context: AuthContext
    decision: str
    audit_id: str
    trace_id: str
    denied_scope: str | None = None
    request_access_url: str | None = None
    ignored_client_user_id: str | None = None

    def __post_init__(self) -> None:
        if not self.permission_decision_id:
            raise ValueError("permission_decision_id is required")
        if self.decision not in PERMISSION_DECISIONS:
            raise ValueError(f"unsupported permission decision: {self.decision}")
        if not self.audit_id:
            raise ValueError("audit_id is required")
        if not self.trace_id:
            raise ValueError("trace_id is required")

    @classmethod
    def from_auth_context(
        cls,
        *,
        auth_context: AuthContext | None,
        decision: str,
        permission_decision_id: str,
        audit_id: str,
        trace_id: str,
        client_payload: Mapping[str, object] | None = None,
        denied_scope: str | None = None,
        request_access_url: str | None = None,
    ) -> "PermissionDecision":
        if auth_context is None:
            raise UntrustedIdentityError("trusted AuthContext is required")

        ignored_client_user_id = None
        if client_payload is not None and client_payload.get("user_id"):
            ignored_client_user_id = str(client_payload["user_id"])

        return cls(
            permission_decision_id=permission_decision_id,
            auth_context=auth_context,
            decision=decision,
            audit_id=audit_id,
            trace_id=trace_id,
            denied_scope=denied_scope,
            request_access_url=request_access_url,
            ignored_client_user_id=ignored_client_user_id,
        )

    @property
    def subject_user_id(self) -> str:
        return self.auth_context.subject_user_id
