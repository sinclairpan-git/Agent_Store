import pytest

from agent_store import SCHEMA_VERSION
from agent_store.domain.actions import ActionDescriptor
from agent_store.domain.errors import ErrorResponse
from agent_store.domain.permissions import (
    AuthContext,
    PermissionDecision,
    UntrustedIdentityError,
)


def test_action_descriptor_contains_target_permission_and_audit_fields() -> None:
    action = ActionDescriptor(
        action_id="request_approval_refresh",
        target_system="agentops",
        requires_permission=True,
        audit_required=True,
        href="/agentops/approvals/approval-1",
        message_key="actions.requestApprovalRefresh",
    )

    assert action.to_dict() == {
        "action_id": "request_approval_refresh",
        "target_system": "agentops",
        "enabled": True,
        "requires_permission": True,
        "audit_required": True,
        "href": "/agentops/approvals/approval-1",
        "message_key": "actions.requestApprovalRefresh",
    }


def test_error_response_exposes_governed_error_fields() -> None:
    response = ErrorResponse(
        error_code="PACKAGE_HASH_MISMATCH",
        message_key="errors.packageHashMismatch",
        severity="blocked",
        retryable=False,
        recommended_action_id="regenerate_activation_command",
        support_ref="diag-123",
        audit_id="audit-123",
        trace_id="trace-123",
    )

    assert response.to_dict() == {
        "schema_version": SCHEMA_VERSION,
        "trace_id": "trace-123",
        "error_code": "PACKAGE_HASH_MISMATCH",
        "message_key": "errors.packageHashMismatch",
        "severity": "blocked",
        "retryable": False,
        "recommended_action_id": "regenerate_activation_command",
        "support_ref": "diag-123",
        "audit_id": "audit-123",
    }


def test_permission_decision_uses_auth_context_instead_of_client_user_id() -> None:
    auth_context = AuthContext(
        auth_context_id="auth-123",
        subject_user_id="iam-user-1",
        tenant_id="tenant-1",
        identity_confidence=0.99,
    )

    decision = PermissionDecision.from_auth_context(
        auth_context=auth_context,
        decision="allow",
        permission_decision_id="perm-123",
        audit_id="audit-123",
        trace_id="trace-123",
        client_payload={"user_id": "spoofed-user"},
    )

    assert decision.subject_user_id == "iam-user-1"
    assert decision.ignored_client_user_id == "spoofed-user"


def test_permission_decision_rejects_missing_trusted_auth_context() -> None:
    with pytest.raises(UntrustedIdentityError):
        PermissionDecision.from_auth_context(
            auth_context=None,
            decision="allow",
            permission_decision_id="perm-123",
            audit_id="audit-123",
            trace_id="trace-123",
            client_payload={"user_id": "spoofed-user"},
        )
