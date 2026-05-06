from datetime import timedelta

from agent_store.api.installation_bootstrap import InstallationBootstrapAPI
from agent_store.domain.assertions import InstallationAssertionService
from agent_store.domain.bootstrap_service import BootstrapService
from agent_store.domain.models import AgentVersion, utc_now
from agent_store.domain.permissions import AuthContext, PermissionDecision

TEST_ASSERTION_SECRET = b"test-assertion-secret"


def _auth() -> AuthContext:
    return AuthContext(
        auth_context_id="auth-1",
        subject_user_id="user-1",
        identity_confidence=0.99,
    )


def _decision(auth: AuthContext) -> PermissionDecision:
    return PermissionDecision.from_auth_context(
        auth_context=auth,
        decision="allow",
        permission_decision_id="perm-1",
        audit_id="audit-1",
        trace_id="trace-1",
    )


def _api(assertion_service: InstallationAssertionService | None = None) -> InstallationBootstrapAPI:
    bootstrap = BootstrapService()
    bootstrap.register_version(
        AgentVersion(
            agent_id="framework.ai-autosdlc",
            version="1.0.0",
            artifact_hash="sha256:first",
            signature="sig-1",
            issuer="Agent Store",
        )
    )
    return InstallationBootstrapAPI(
        bootstrap_service=bootstrap,
        assertion_service=assertion_service,
        assertion_signing_secret=None if assertion_service else TEST_ASSERTION_SECRET,
    )


def _payload(artifact_hash: str = "sha256:first") -> dict[str, object]:
    return {
        "agent_id": "framework.ai-autosdlc",
        "agent_version": "1.0.0",
        "device_os": "macOS",
        "artifact_hash": artifact_hash,
        "device_public_key_thumbprint": "thumb-1",
    }


def test_create_installation_api_matches_contract_envelope() -> None:
    api = _api()
    auth = _auth()

    status, body = api.create_installation(
        _payload(),
        headers={"Idempotency-Key": "idem-1"},
        auth_context=auth,
        permission_decision=_decision(auth),
    )

    assert status == 201
    assert body["schema_version"]
    assert body["trace_id"]
    assert body["error_code"] == "OK"
    assert body["installation"]["installation_id"]
    assert body["auth_context"]["subject_user_id"] == "user-1"


def test_create_installation_api_returns_hash_mismatch_error() -> None:
    api = _api()
    auth = _auth()

    status, body = api.create_installation(
        _payload("sha256:wrong"),
        headers={"Idempotency-Key": "idem-1"},
        auth_context=auth,
        permission_decision=_decision(auth),
    )

    assert status == 409
    assert body["schema_version"]
    assert body["trace_id"]
    assert body["error_code"] == "PACKAGE_HASH_MISMATCH"


def test_create_installation_api_rejects_unknown_agent_version() -> None:
    api = _api()
    auth = _auth()
    payload = _payload()
    payload["agent_version"] = "9.9.9"

    status, body = api.create_installation(
        payload,
        headers={"Idempotency-Key": "idem-1"},
        auth_context=auth,
        permission_decision=_decision(auth),
    )

    assert status == 404
    assert body["schema_version"]
    assert body["trace_id"]
    assert body["error_code"] == "PACKAGE_HASH_MISMATCH"
    assert body["message_key"] == "errors.agentVersionUnknown"


def test_create_installation_api_rejects_null_required_input() -> None:
    api = _api()
    auth = _auth()
    payload = _payload()
    payload["device_public_key_thumbprint"] = None

    status, body = api.create_installation(
        payload,
        headers={"Idempotency-Key": "idem-1"},
        auth_context=auth,
        permission_decision=_decision(auth),
    )

    assert status == 400
    assert body["schema_version"]
    assert body["trace_id"]
    assert body["error_code"] == "VALIDATION_ERROR"
    assert "device_public_key_thumbprint" in body["details"]["reason"]


def test_create_installation_api_rejects_denied_permission_decision() -> None:
    api = _api()
    auth = _auth()
    denied_decision = PermissionDecision.from_auth_context(
        auth_context=auth,
        decision="deny",
        permission_decision_id="perm-deny",
        audit_id="audit-1",
        trace_id="trace-1",
        denied_scope="agent.install",
    )

    status, body = api.create_installation(
        _payload(),
        headers={"Idempotency-Key": "idem-1"},
        auth_context=auth,
        permission_decision=denied_decision,
    )

    assert status == 403
    assert body["schema_version"]
    assert body["trace_id"]
    assert body["error_code"] == "PERMISSION_DENIED"


def test_issue_assertion_api_matches_contract_and_is_idempotent() -> None:
    api = _api()
    auth = _auth()
    _, installation_body = api.create_installation(
        _payload(),
        headers={"Idempotency-Key": "install-1"},
        auth_context=auth,
        permission_decision=_decision(auth),
    )
    installation_id = installation_body["installation"]["installation_id"]

    status, body = api.issue_installation_assertion(
        installation_id,
        {"device_public_key_thumbprint": "thumb-1", "nonce": "nonce-1", "audience": "agentops"},
        headers={"Idempotency-Key": "assert-1"},
        auth_context=auth,
    )
    retry_status, retry_body = api.issue_installation_assertion(
        installation_id,
        {"device_public_key_thumbprint": "thumb-1", "nonce": "nonce-1", "audience": "agentops"},
        headers={"Idempotency-Key": "assert-1"},
        auth_context=auth,
    )

    assert status == 200
    assert retry_status == 200
    assert body == retry_body
    assert body["schema_version"]
    assert body["error_code"] == "OK"
    assert body["assertion"]["installation_id"] == installation_id
    assert body["assertion"]["signature"]


def test_issue_assertion_api_rejects_device_thumbprint_mismatch() -> None:
    api = _api()
    auth = _auth()
    _, installation_body = api.create_installation(
        _payload(),
        headers={"Idempotency-Key": "install-1"},
        auth_context=auth,
        permission_decision=_decision(auth),
    )

    status, body = api.issue_installation_assertion(
        installation_body["installation"]["installation_id"],
        {"device_public_key_thumbprint": "thumb-2", "nonce": "nonce-1", "audience": "agentops"},
        headers={"Idempotency-Key": "assert-1"},
        auth_context=auth,
    )

    assert status == 409
    assert body["error_code"] == "DEVICE_KEY_MISMATCH"


def test_issue_assertion_api_rejects_mismatched_auth_context() -> None:
    api = _api()
    auth = _auth()
    _, installation_body = api.create_installation(
        _payload(),
        headers={"Idempotency-Key": "install-1"},
        auth_context=auth,
        permission_decision=_decision(auth),
    )
    other_auth = AuthContext(
        auth_context_id="auth-2",
        subject_user_id="user-2",
        identity_confidence=0.99,
    )

    status, body = api.issue_installation_assertion(
        installation_body["installation"]["installation_id"],
        {"device_public_key_thumbprint": "thumb-1", "nonce": "nonce-1", "audience": "agentops"},
        headers={"Idempotency-Key": "assert-1"},
        auth_context=other_auth,
    )

    assert status == 403
    assert body["error_code"] == "PERMISSION_DENIED"


def test_issue_assertion_api_rejects_null_required_input() -> None:
    api = _api()
    auth = _auth()
    _, installation_body = api.create_installation(
        _payload(),
        headers={"Idempotency-Key": "install-1"},
        auth_context=auth,
        permission_decision=_decision(auth),
    )

    status, body = api.issue_installation_assertion(
        installation_body["installation"]["installation_id"],
        {"device_public_key_thumbprint": "thumb-1", "nonce": None, "audience": "agentops"},
        headers={"Idempotency-Key": "assert-1"},
        auth_context=auth,
    )

    assert status == 400
    assert body["error_code"] == "VALIDATION_ERROR"
    assert "nonce" in body["details"]["reason"]


def test_issue_assertion_api_scopes_idempotency_to_request_identity() -> None:
    api = _api()
    auth = _auth()
    _, installation_body = api.create_installation(
        _payload(),
        headers={"Idempotency-Key": "install-1"},
        auth_context=auth,
        permission_decision=_decision(auth),
    )
    installation_id = installation_body["installation"]["installation_id"]
    api.issue_installation_assertion(
        installation_id,
        {"device_public_key_thumbprint": "thumb-1", "nonce": "nonce-1", "audience": "agentops"},
        headers={"Idempotency-Key": "assert-1"},
        auth_context=auth,
    )

    status, body = api.issue_installation_assertion(
        installation_id,
        {"device_public_key_thumbprint": "thumb-1", "nonce": "nonce-2", "audience": "agentops"},
        headers={"Idempotency-Key": "assert-1"},
        auth_context=auth,
    )

    assert status == 409
    assert body["error_code"] == "VALIDATION_ERROR"
    assert body["retryable"] is False
    assert body["recommended_action_id"] == "use_new_idempotency_key"


def test_issue_assertion_api_scopes_idempotency_to_installation_context() -> None:
    api = _api()
    auth = _auth()
    _, first_installation = api.create_installation(
        _payload(),
        headers={"Idempotency-Key": "install-1"},
        auth_context=auth,
        permission_decision=_decision(auth),
    )
    _, second_installation = api.create_installation(
        _payload(),
        headers={"Idempotency-Key": "install-2"},
        auth_context=auth,
        permission_decision=_decision(auth),
    )

    first_status, first_body = api.issue_installation_assertion(
        first_installation["installation"]["installation_id"],
        {"device_public_key_thumbprint": "thumb-1", "nonce": "nonce-1", "audience": "agentops"},
        headers={"Idempotency-Key": "assert-shared"},
        auth_context=auth,
    )
    second_status, second_body = api.issue_installation_assertion(
        second_installation["installation"]["installation_id"],
        {"device_public_key_thumbprint": "thumb-1", "nonce": "nonce-1", "audience": "agentops"},
        headers={"Idempotency-Key": "assert-shared"},
        auth_context=auth,
    )

    assert first_status == 200
    assert second_status == 200
    assert first_body["assertion"]["installation_id"] != second_body["assertion"]["installation_id"]


def test_issue_assertion_api_rejects_nonce_replay_with_new_idempotency_key() -> None:
    api = _api()
    auth = _auth()
    _, installation_body = api.create_installation(
        _payload(),
        headers={"Idempotency-Key": "install-1"},
        auth_context=auth,
        permission_decision=_decision(auth),
    )
    installation_id = installation_body["installation"]["installation_id"]
    api.issue_installation_assertion(
        installation_id,
        {"device_public_key_thumbprint": "thumb-1", "nonce": "nonce-1", "audience": "agentops"},
        headers={"Idempotency-Key": "assert-1"},
        auth_context=auth,
    )

    status, body = api.issue_installation_assertion(
        installation_id,
        {"device_public_key_thumbprint": "thumb-1", "nonce": "nonce-1", "audience": "agentops"},
        headers={"Idempotency-Key": "assert-2"},
        auth_context=auth,
    )

    assert status == 409
    assert body["error_code"] == "ASSERTION_REPLAY_DETECTED"


def test_issue_assertion_api_returns_expired_error() -> None:
    class ExpiredAssertionService(InstallationAssertionService):
        def issue(self, installation, **kwargs):  # type: ignore[no-untyped-def]
            return super().issue(
                installation,
                now=utc_now() - timedelta(hours=1),
                **kwargs,
            )

    api = _api(ExpiredAssertionService(secret=TEST_ASSERTION_SECRET))
    auth = _auth()
    _, installation_body = api.create_installation(
        _payload(),
        headers={"Idempotency-Key": "install-1"},
        auth_context=auth,
        permission_decision=_decision(auth),
    )

    status, body = api.issue_installation_assertion(
        installation_body["installation"]["installation_id"],
        {"device_public_key_thumbprint": "thumb-1", "nonce": "nonce-1", "audience": "agentops"},
        headers={"Idempotency-Key": "assert-1"},
        auth_context=auth,
    )

    assert status == 409
    assert body["error_code"] == "INSTALLATION_ASSERTION_EXPIRED"


def test_create_installation_api_requires_idempotency_key() -> None:
    api = _api()
    auth = _auth()

    status, body = api.create_installation(
        _payload(),
        headers={},
        auth_context=auth,
        permission_decision=_decision(auth),
    )

    assert status == 400
    assert body["error_code"] == "VALIDATION_ERROR"
