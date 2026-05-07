from __future__ import annotations

from agent_store.api.agent_registry import response_envelope_ok
from agent_store.api.installation_handoff import InstallationRequestHandoffAPI
from agent_store.domain.enterprise_context import EnterpriseContext
from agent_store.domain.models import Agent, AgentVersion, OsCompatibility
from agent_store.domain.package_trust import PackageTrustSummary
from agent_store.domain.permissions import AuthContext, PermissionDecision
from agent_store.ui.catalog_workbench import CatalogAgentSource


def _auth() -> AuthContext:
    return AuthContext(
        auth_context_id="auth-1",
        subject_user_id="operator@example.com",
        identity_confidence=0.99,
        tenant_id="tenant-1",
    )


def _decision(auth: AuthContext, audit_id: str) -> PermissionDecision:
    return PermissionDecision.from_auth_context(
        auth_context=auth,
        decision="allow",
        permission_decision_id="perm-1",
        audit_id=audit_id,
        trace_id="trace-request",
    )


def _source(
    agent_id: str,
    display_name: str,
    *,
    agent_type: str,
    trust_state: str,
    enterprise_state: str,
    installability: str,
    artifact_hash: str,
) -> CatalogAgentSource:
    agent = Agent(
        agent_id=agent_id,
        display_name=display_name,
        type=agent_type,
        category="Developer Tool",
        owner_team="Platform",
        owner_user="owner@example.com",
        official_flag=True,
        summary=f"{display_name} catalog summary",
        use_cases=("governed delivery",),
        supported_os=(
            OsCompatibility(os="macOS", compatibility_status="install_verified"),
        ),
    )
    version = AgentVersion(
        agent_id=agent_id,
        version="1.0.0",
        artifact_hash=artifact_hash,
        signature="sig",
        issuer="Agent Store",
        release_status="manual_installable-preview",
    )
    return CatalogAgentSource(
        agent=agent,
        version=version,
        package_trust_summary=PackageTrustSummary(
            package_id=f"{agent_id}@1.0.0",
            trust_state=trust_state,
            signature_state="verified" if trust_state == "trusted" else "missing",
            hash_match_state="matched" if trust_state == "trusted" else "unknown",
            issuer_display="Agent Store",
        ),
        enterprise_context=EnterpriseContext(
            integration_mode="enterprise_managed",
            enterprise_state=enterprise_state,
            source="tenant_policy",
            can_ignore=False,
            affected_actions=("install",),
            requires_enterprise=True,
        ),
        evidence_level="L2-static",
        installability=installability,
    )


def _api() -> InstallationRequestHandoffAPI:
    return InstallationRequestHandoffAPI(
        sources=(
            _source(
                "developer.release-notes",
                "Release Notes Writer",
                agent_type="skill",
                trust_state="warning",
                enterprise_state="detected_optional",
                installability="installable",
                artifact_hash="sha256:release-notes",
            ),
            _source(
                "framework.ai-autosdlc",
                "Ai_AutoSDLC",
                agent_type="framework_capability",
                trust_state="trusted",
                enterprise_state="required_unactivated",
                installability="activation_required",
                artifact_hash="sha256:ai-sdlc",
            ),
            _source(
                "security.policy-guard",
                "Policy Guard",
                agent_type="agent",
                trust_state="blocked",
                enterprise_state="disabled",
                installability="blocked",
                artifact_hash="sha256:policy-guard",
            ),
        )
    )


def _payload(**overrides: object) -> dict[str, object]:
    payload: dict[str, object] = {
        "trace_id": "trace-request",
        "requested_by": "operator@example.com",
        "action_id": "start_install",
        "request_id": "req-developer-release-notes-start-install",
        "device_os": "macOS",
        "device_public_key_thumbprint": "thumb-1",
    }
    payload.update(overrides)
    return payload


def test_handoff_creates_installation_from_accepted_request() -> None:
    auth = _auth()

    status, body = _api().create_installation_from_request(
        "developer.release-notes",
        _payload(),
        headers={"Idempotency-Key": "req-developer-release-notes-start-install"},
        auth_context=auth,
        permission_decision=_decision(
            auth,
            "audit-developer-release-notes-start-install",
        ),
    )

    assert status == 201
    assert response_envelope_ok(body)
    assert body["handoff"]["handoff_state"] == "installation_created"
    assert (
        body["handoff"]["request_id"]
        == body["request"]["request_id"]
        == "req-developer-release-notes-start-install"
    )
    assert body["installation"]["agent_id"] == "developer.release-notes"
    assert body["installation"]["artifact_hash"] == "sha256:release-notes"
    assert body["permission_decision"]["audit_id"] == body["request"]["audit_id"]
    assert body["handoff"]["next_action"]["action_id"] == "poll_bootstrap_status"


def test_handoff_is_idempotent_for_same_request_identity() -> None:
    api = _api()
    auth = _auth()
    decision = _decision(auth, "audit-developer-release-notes-start-install")

    _, first = api.create_installation_from_request(
        "developer.release-notes",
        _payload(),
        headers={"Idempotency-Key": "idem-request-1"},
        auth_context=auth,
        permission_decision=decision,
    )
    status, second = api.create_installation_from_request(
        "developer.release-notes",
        _payload(),
        headers={"Idempotency-Key": "idem-request-1"},
        auth_context=auth,
        permission_decision=decision,
    )

    assert status == 201
    assert (
        second["installation"]["installation_id"]
        == first["installation"]["installation_id"]
    )


def test_handoff_returns_request_state_for_activation_required_agent() -> None:
    auth = _auth()

    status, body = _api().create_installation_from_request(
        "framework.ai-autosdlc",
        {
            "trace_id": "trace-request",
            "requested_by": "operator@example.com",
            "action_id": "start_enterprise_activation",
            "device_os": "macOS",
            "device_public_key_thumbprint": "thumb-1",
        },
        headers={"Idempotency-Key": "idem-activation"},
        auth_context=auth,
        permission_decision=_decision(
            auth,
            "audit-framework-ai-autosdlc-start-enterprise-activation",
        ),
    )

    assert status == 202
    assert response_envelope_ok(body)
    assert body["request"]["request_state"] == "pending_enterprise_activation"
    assert "installation" not in body


def test_handoff_rejects_request_identity_mismatch() -> None:
    auth = _auth()

    status, body = _api().create_installation_from_request(
        "developer.release-notes",
        _payload(request_id="req-other-start-install"),
        headers={"Idempotency-Key": "idem-request-1"},
        auth_context=auth,
        permission_decision=_decision(
            auth,
            "audit-developer-release-notes-start-install",
        ),
    )

    assert status == 409
    assert response_envelope_ok(body)
    assert body["message_key"] == "errors.requestIdentityMismatch"


def test_handoff_rejects_nested_request_identity_mismatch() -> None:
    auth = _auth()

    status, body = _api().create_installation_from_request(
        "developer.release-notes",
        {
            "request": _payload(request_id="req-other-start-install"),
            "device_os": "macOS",
            "device_public_key_thumbprint": "thumb-1",
        },
        headers={"Idempotency-Key": "idem-request-1"},
        auth_context=auth,
        permission_decision=_decision(
            auth,
            "audit-developer-release-notes-start-install",
        ),
    )

    assert status == 409
    assert response_envelope_ok(body)
    assert body["message_key"] == "errors.requestIdentityMismatch"
    assert body["details"]["request_id"] == "req-other-start-install"


def test_handoff_rejects_permission_audit_mismatch() -> None:
    auth = _auth()

    status, body = _api().create_installation_from_request(
        "developer.release-notes",
        _payload(),
        headers={"Idempotency-Key": "idem-request-1"},
        auth_context=auth,
        permission_decision=_decision(auth, "audit-stale"),
    )

    assert status == 409
    assert response_envelope_ok(body)
    assert body["message_key"] == "errors.requestAuditMismatch"
