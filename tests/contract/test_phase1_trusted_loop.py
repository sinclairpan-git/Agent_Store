import hashlib
import hmac
from datetime import timedelta

import pytest

from agent_store.api.agent_registry import AgentRegistryAPI, response_envelope_ok
from agent_store.api.agentops_summary import AgentOpsSummaryAPI
from agent_store.api.bootstrap_status import BootstrapStatusAPI
from agent_store.api.installation_bootstrap import InstallationBootstrapAPI
from agent_store.domain.assertions import (
    AssertionValidationError,
    InstallationAssertionService,
)
from agent_store.domain.bootstrap_service import BootstrapService
from agent_store.domain.enterprise_context import EnterpriseContext
from agent_store.domain.models import Agent, AgentVersion, utc_now
from agent_store.domain.permissions import (
    AuthContext,
    PermissionDecision,
    UntrustedIdentityError,
)
from agent_store.domain.state_source_guard import StateObservation, resolve_state
from agent_store.domain.status_registry import get_status
from agent_store.integrations.agentops_client import AgentOpsSummaryClient
from agent_store.integrations.trusted_evidence_loop import TrustedEvidenceLoopVerifier
from agent_store.ui.official_app_view import (
    build_official_app_view,
    validate_standalone_boundary,
)


ASSERTION_SECRET = b"phase1-assertion-secret"
REPORTER_SECRET = b"phase1-reporter-secret"


def _agent_payload(**overrides: object) -> dict[str, object]:
    payload: dict[str, object] = {
        "agent_id": "framework.ai-autosdlc",
        "display_name": "Ai_AutoSDLC",
        "type": "framework_capability",
        "category": "sdlc_framework",
        "owner_team": "SDLC Platform",
        "owner_user": "owner@example.com",
        "version": "1.0.0",
        "artifact_hash": "sha256:first",
        "signature": "sig-1",
        "issuer": "Agent Store",
        "release_status": "manual_installable-preview",
        "trace_id": "trace-phase1",
    }
    payload.update(overrides)
    return payload


def _agent() -> Agent:
    return Agent(
        agent_id="framework.ai-autosdlc",
        display_name="Ai_AutoSDLC",
        type="framework_capability",
        category="sdlc_framework",
        owner_team="SDLC Platform",
        owner_user="owner@example.com",
        status="manual_installable-preview",
        official_flag=True,
        summary="AI-SDLC framework capability",
        use_cases=("sdlc_governance",),
    )


def _version() -> AgentVersion:
    return AgentVersion(
        agent_id="framework.ai-autosdlc",
        version="1.0.0",
        artifact_hash="sha256:first",
        signature="sig-1",
        issuer="Agent Store",
        release_status="manual_installable-preview",
        package_signature="pkg-sig-1",
        package_id="framework.ai-autosdlc@1.0.0",
        key_id="key-1",
        source_repo="sinclairpan-git/Ai_AutoSDLC",
        source_commit="commit-1",
        sbom_ref="sbom-1",
        scan_report_ref="scan-1",
        compatibility_status="install_verified",
    )


def _auth() -> AuthContext:
    return AuthContext(
        auth_context_id="auth-1",
        subject_user_id="user-1",
        identity_confidence=0.99,
        tenant_id="tenant-1",
        org_id="org-1",
    )


def _decision(auth: AuthContext) -> PermissionDecision:
    return PermissionDecision.from_auth_context(
        auth_context=auth,
        decision="allow",
        permission_decision_id="perm-1",
        audit_id="audit-1",
        trace_id="trace-phase1",
        client_payload={"user_id": "spoofed-user"},
    )


def _bootstrap_api() -> tuple[InstallationBootstrapAPI, BootstrapService]:
    bootstrap = BootstrapService()
    bootstrap.register_version(_version())
    return (
        InstallationBootstrapAPI(
            bootstrap_service=bootstrap,
            assertion_signing_secret=ASSERTION_SECRET,
        ),
        bootstrap,
    )


def _event_hash(payload: dict[str, object]) -> str:
    reporter_event = payload["reporter_event"]
    refs = [
        str(payload["installation_id"]),
        str(payload["device_id"]),
        str(payload["agent_id"]),
        str(payload["agent_version"]),
        str(payload["artifact_hash"]),
        str(payload["trace_id"]),
        str(payload["run_id"]),
        str(payload["session_id"]),
        str(payload["evidence_summary_id"]),
        str(reporter_event["event_id"]),
    ]
    return hashlib.sha256("\n".join(refs).encode("utf-8")).hexdigest()


def _sign_reporter_payload(payload: dict[str, object]) -> dict[str, object]:
    event_hash = _event_hash(payload)
    payload["reporter_event"]["event_hash"] = event_hash
    payload["reporter_event"]["signature"] = hmac.new(
        REPORTER_SECRET,
        event_hash.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    return payload


def _trusted_payload(
    *,
    installation: dict[str, object],
    agentops_summary: dict[str, object],
) -> dict[str, object]:
    run_evidence = agentops_summary["run_evidence"]
    payload = {
        "installation_id": installation["installation_id"],
        "device_id": installation["device_id"],
        "agent_id": installation["agent_id"],
        "agent_version": installation["agent_version"],
        "artifact_hash": installation["artifact_hash"],
        "run_id": run_evidence["run_id"],
        "session_id": run_evidence["session_id"],
        "trace_id": agentops_summary["trace_id"],
        "reporter_event": {
            "event_id": run_evidence["source_event_ids"][0],
            "event_type": "verification_completed",
            "sequence_no": 1,
            "idempotency_key": "event-idem-1",
            "event_hash": "",
            "signature": "",
            "key_id": "reporter-key-1",
            "signed_at": "2026-05-06T00:00:00Z",
        },
        "evidence_summary_id": run_evidence["evidence_summary_id"],
        "l5_gate_result": agentops_summary["l5_gate"]["l5_gate_result"],
        "violation_scan_completed": agentops_summary["l5_gate"][
            "violation_scan_completed"
        ],
    }
    return _sign_reporter_payload(payload)


def _assert_error_contract(body: dict[str, object]) -> None:
    assert response_envelope_ok(body)
    assert body["error_code"]
    assert body["message_key"]
    assert body["severity"] in {"error", "blocked", "warning"}
    assert body["recommended_action_id"]


def test_phase1_trusted_loop_happy_path_connects_registry_bootstrap_agentops_and_view() -> (
    None
):
    registry = AgentRegistryAPI()
    status, draft = registry.create_agent_draft(
        _agent_payload(),
        headers={"Idempotency-Key": "draft-1"},
    )
    assert status == 201
    assert draft["agent"]["agent_id"] == "framework.ai-autosdlc"

    detail_status, detail = registry.get_agent_detail("framework.ai-autosdlc")
    assert detail_status == 200
    assert detail["agent"]["package_trust_summary"]["trust_state"] == "trusted"

    bootstrap_api, bootstrap = _bootstrap_api()
    auth = _auth()
    decision = _decision(auth)
    install_status, installation_body = bootstrap_api.create_installation(
        {
            "agent_id": "framework.ai-autosdlc",
            "agent_version": "1.0.0",
            "artifact_hash": "sha256:first",
            "device_os": "macOS",
            "device_public_key_thumbprint": "thumb-1",
            "trace_id": "trace-phase1",
        },
        headers={"Idempotency-Key": "install-1"},
        auth_context=auth,
        permission_decision=decision,
    )
    assert install_status == 201
    assert installation_body["permission_decision"]["audit_id"] == "audit-1"
    assert installation_body["permission_decision"]["trace_id"] == "trace-phase1"

    installation_id = installation_body["installation"]["installation_id"]
    assertion_status, assertion_body = bootstrap_api.issue_installation_assertion(
        installation_id,
        {
            "device_public_key_thumbprint": "thumb-1",
            "nonce": "nonce-1",
            "audience": "agentops",
            "trace_id": "trace-phase1",
        },
        headers={"Idempotency-Key": "assertion-1"},
        auth_context=auth,
    )
    assert assertion_status == 200
    for field in (
        "alg",
        "canonicalization",
        "nonce",
        "replay_window_seconds",
        "assertion_hash",
        "revocation_status",
    ):
        assert assertion_body["assertion"][field]

    status_status, status_body = BootstrapStatusAPI(bootstrap).get_bootstrap_status(
        installation_id,
        auth_context=auth,
    )
    assert status_status == 200
    assert status_body["status"]["next_poll_after"] == 5
    assert (
        status_body["status"]["primary_action"]["action_id"] == "poll_bootstrap_status"
    )

    _, agentops_body = AgentOpsSummaryAPI().get_agentops_summary(
        "framework.ai-autosdlc",
        version="1.0.0",
        trace_id="trace-phase1",
    )
    assert agentops_body["quality_evidence"]["evidence_level"] == "L5-capable"
    assert agentops_body["run_evidence"]["run_id"]
    assert agentops_body["governance_load"]["adapter_state"] == "materialized"

    trusted_status, trusted_body = TrustedEvidenceLoopVerifier(
        trusted_reporter_keys={"reporter-key-1": REPORTER_SECRET}
    ).assert_loop(
        _trusted_payload(
            installation=installation_body["installation"],
            agentops_summary=agentops_body,
        )
    )
    assert trusted_status == 200
    assert trusted_body["result"]["actual_l5_display_allowed"] is True

    view = build_official_app_view(
        agent=_agent(),
        version=_version(),
        trace_id="trace-phase1",
        enterprise_context=EnterpriseContext(
            integration_mode="enterprise_managed",
            enterprise_state="active",
            source="agent_store_installation",
            can_ignore=False,
            affected_actions=("show_actual_l5",),
            requires_enterprise=True,
            required_by="actual_l5_display",
            issuer="Agent Store",
            policy_owner="SDLC Platform",
            policy_version="2026.05",
            installation_id=installation_id,
        ),
        bootstrap_completed=True,
        l5_gate_passed=True,
        violation_scan_completed=True,
    )
    assert view["view"]["actual_l5_display_allowed"] is True
    assert view["view"]["enterprise_context"]["installation_id"] == installation_id


def test_phase1_contract_failure_matrix_has_stable_errors_and_actions() -> None:
    registry = AgentRegistryAPI()
    _, missing_owner = registry.create_agent_draft(
        _agent_payload(owner_team=""),
        headers={"Idempotency-Key": "draft-missing-owner"},
    )
    _assert_error_contract(missing_owner)

    bootstrap_api, bootstrap = _bootstrap_api()
    auth = _auth()
    decision = _decision(auth)
    _, hash_mismatch = bootstrap_api.create_installation(
        {
            "agent_id": "framework.ai-autosdlc",
            "agent_version": "1.0.0",
            "artifact_hash": "sha256:wrong",
            "device_os": "macOS",
            "device_public_key_thumbprint": "thumb-1",
        },
        headers={"Idempotency-Key": "install-bad-hash"},
        auth_context=auth,
        permission_decision=decision,
    )
    _assert_error_contract(hash_mismatch)

    _, installation_body = bootstrap_api.create_installation(
        {
            "agent_id": "framework.ai-autosdlc",
            "agent_version": "1.0.0",
            "artifact_hash": "sha256:first",
            "device_os": "macOS",
            "device_public_key_thumbprint": "thumb-1",
        },
        headers={"Idempotency-Key": "install-1"},
        auth_context=auth,
        permission_decision=decision,
    )
    installation_id = installation_body["installation"]["installation_id"]
    _, expired_status = BootstrapStatusAPI(bootstrap).get_bootstrap_status(
        installation_id,
        auth_context=auth,
        last_error_code="INSTALLATION_ASSERTION_EXPIRED",
    )
    assert expired_status["status"]["regenerate_command_url"].endswith("/assertion")

    service = InstallationAssertionService(secret=ASSERTION_SECRET)
    assertion = service.issue(
        bootstrap.get_record(installation_id).installation,
        device_public_key_thumbprint="thumb-1",
        nonce="nonce-1",
        audience="agentops",
        now=utc_now() - timedelta(minutes=20),
    )
    with pytest.raises(AssertionValidationError) as exc_info:
        service.validate(
            assertion,
            expected_audience="agentops",
            expected_device_public_key_thumbprint="thumb-1",
            trace_id="trace-expired",
        )
    expired_assertion = exc_info.value.response.to_dict()
    _assert_error_contract(expired_assertion)

    agentops_client = AgentOpsSummaryClient()
    agentops_client.unavailable = True
    _, degraded_agentops = AgentOpsSummaryAPI(agentops_client).get_agentops_summary(
        "framework.ai-autosdlc",
        version="1.0.0",
        trace_id="trace-unavailable",
    )
    assert degraded_agentops["quality_evidence"]["summary_validity_state"] == "expired"
    assert degraded_agentops["credential_bootstrap"]["reporter_status"] == "degraded"

    _, redacted_agentops = AgentOpsSummaryAPI().get_agentops_summary(
        "framework.ai-autosdlc",
        version="1.0.0",
        raw_evidence_allowed=False,
        trace_id="trace-redacted",
    )
    assert redacted_agentops["permission_state"] == "redacted"
    assert redacted_agentops["links"][0]["rel"] == "evidence_request_access"

    trusted_status, trusted_error = TrustedEvidenceLoopVerifier(
        trusted_reporter_keys={"reporter-key-1": REPORTER_SECRET}
    ).assert_loop(
        {
            "trace_id": "trace-missing-run",
            "run_id": "",
            "session_id": "session-1",
            "reporter_event": {},
        }
    )
    assert trusted_status == 409
    _assert_error_contract(trusted_error)

    standalone_error = validate_standalone_boundary(
        {
            "view": {
                "standalone": {"requires_installation_id": True},
                "enterprise_context": {"integration_mode": "standalone"},
            }
        },
        trace_id="trace-standalone",
    )
    assert standalone_error is not None
    _assert_error_contract(standalone_error.to_dict())

    with pytest.raises(UntrustedIdentityError):
        AuthContext(
            auth_context_id="client-auth",
            subject_user_id="spoofed-user",
            identity_confidence=0.4,
            identity_source="client_user_id",
        )

    state_decision = resolve_state(
        (
            StateObservation(
                source_of_truth="agent_store",
                state="active",
                entry_evidence=("installation_active",),
                last_verified_at="2026-05-06T00:00:00Z",
                affected_actions=("show_actual_l5",),
            ),
            StateObservation(
                source_of_truth="agentops",
                state="degraded",
                entry_evidence=("reporter_degraded",),
                last_verified_at="2026-05-06T00:00:00Z",
                affected_actions=("show_actual_l5",),
            ),
        )
    )
    assert state_decision.state == "degraded"
    assert "state_source_conflict" in state_decision.degraded_reason

    stable_error_codes = {
        missing_owner["error_code"],
        hash_mismatch["error_code"],
        expired_assertion["error_code"],
        standalone_error.error_code,
        "APPROVAL_EXPIRED",
    }
    assert stable_error_codes == {
        "AGENT_OWNER_REQUIRED",
        "PACKAGE_HASH_MISMATCH",
        "INSTALLATION_ASSERTION_EXPIRED",
        "STANDALONE_OVERCOUPLED",
        "APPROVAL_EXPIRED",
    }
    for error_code in stable_error_codes:
        assert get_status(error_code).primary_action.action_id
