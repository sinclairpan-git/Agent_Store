from agent_store.api.permission_denial import PermissionDenialAPI


def _payload(**overrides: object) -> dict[str, object]:
    payload: dict[str, object] = {
        "trace_id": "trace-038",
        "audit_id": "audit-038",
        "denial_context": {
            "denial_scenario": "raw_evidence_denied",
            "agent_id": "framework.ai-autosdlc",
            "agent_version": "1.0.0",
            "denied_scope": "agentops.evidence.raw",
            "request_access_url": "/evidence-vault/access-requests",
            "raw_trace_url": "https://agentops/raw-trace",
        },
        "viewer_context": {
            "auth_context_id": "auth-038",
            "subject_user_id": "user-038",
            "identity_source": "sso_token",
            "return_path": "/agents/framework.ai-autosdlc",
        },
        "permission_decision": {
            "permission_decision_id": "perm-038",
            "decision": "deny",
            "denied_scope": "agentops.evidence.raw",
        },
    }
    payload.update(overrides)
    return payload


def test_permission_denial_api_returns_store_safe_summary() -> None:
    status, body = PermissionDenialAPI().summarize_denial(
        _payload(),
        headers={"Idempotency-Key": "perm-denial-1"},
    )

    assert status == 200
    assert body["schema_version"]
    assert body["trace_id"] == "trace-038"
    assert body["error_code"] == "OK"
    summary = body["permission_denial_action_summary"]
    assert summary["contract_schema_version"] == "permission_denial_action_summary.v1"
    assert summary["denial_state"] == "raw_evidence_access_required"
    assert summary["primary_action"]["target_system"] == "evidence_vault"
    assert summary["permission"]["raw_trace_url"] == ""
    assert summary["permission"]["raw_evidence_url"] == ""
    assert summary["store_grant_issued"] is False
    assert summary["store_policy_override_allowed"] is False


def test_permission_denial_api_requires_idempotency_key() -> None:
    status, body = PermissionDenialAPI().summarize_denial(_payload(), headers={})

    assert status == 400
    assert body["error_code"] == "VALIDATION_ERROR"
    assert body["recommended_action_id"] == "retry_with_idempotency_key"


def test_permission_denial_api_replays_same_idempotency_key() -> None:
    api = PermissionDenialAPI()
    first_status, first_body = api.summarize_denial(
        _payload(trace_id="trace-a"),
        headers={"Idempotency-Key": "perm-denial-2"},
    )
    second_status, second_body = api.summarize_denial(
        _payload(trace_id="trace-b"),
        headers={"Idempotency-Key": "perm-denial-2"},
    )

    assert first_status == 200
    assert second_status == 200
    assert second_body == first_body


def test_permission_denial_api_rejects_idempotency_conflict() -> None:
    api = PermissionDenialAPI()
    api.summarize_denial(
        _payload(),
        headers={"Idempotency-Key": "perm-denial-3"},
    )

    status, body = api.summarize_denial(
        _payload(
            denial_context={
                "denial_scenario": "not_visible",
                "agent_id": "framework.ai-autosdlc",
            }
        ),
        headers={"Idempotency-Key": "perm-denial-3"},
    )

    assert status == 409
    assert body["error_code"] == "IDEMPOTENCY_KEY_CONFLICT"


def test_permission_denial_api_validates_nested_objects() -> None:
    status, body = PermissionDenialAPI().summarize_denial(
        _payload(viewer_context="spoofed"),
        headers={"Idempotency-Key": "perm-denial-4"},
    )

    assert status == 400
    assert body["error_code"] == "VALIDATION_ERROR"
    assert body["recommended_action_id"] == "attach_viewer_context"
