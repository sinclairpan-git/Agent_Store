from datetime import timedelta

from agent_store.domain.agentops_summary import (
    AgentOpsSummaryBundle,
    ApprovalSummary,
    CrossSystemLink,
    QualityEvidenceSummary,
    RunEvidenceSummary,
    RuntimePolicySummary,
)
from agent_store.api.skill_registry import SkillRegistryAPI
from agent_store.domain.models import utc_now
from agent_store.integrations.agentops_client import (
    AgentOpsCredentialIssueClient,
    AgentOpsSkillRegistryNoticeClient,
    AgentOpsSummaryClient,
    AgentOpsUnavailableError,
)


def _handoff() -> dict[str, object]:
    return {
        "schema_version": "agentops_credential_handoff.v1",
        "bootstrap_id": "boot-inst-1",
        "installation_assertion": {
            "assertion_version": "signed_installation_assertion.v1",
            "assertion_hash": "sha256:assertion",
        },
        "device_proof": {
            "proof_version": "device_proof.v1",
            "assertion_hash": "sha256:assertion",
        },
    }


def _credential_response(
    *,
    bootstrap_status: str = "credential_issued",
) -> dict[str, object]:
    return {
        "credential_id": "cred-1",
        "token_id": "token-1",
        "device_key_id": "device-key-1",
        "status": "active",
        "bootstrap_status": bootstrap_status,
        "installation_id": "inst-1",
        "device_id": "dev-1",
        "expires_at": "2026-05-07T13:00:00+00:00",
        "next_action": "send_signature_test_event",
    }


def _summary() -> AgentOpsSummaryBundle:
    now = utc_now()
    return AgentOpsSummaryBundle(
        trace_id="trace-1",
        quality_evidence=QualityEvidenceSummary(
            evidence_level="L5-capable",
            confidence=0.88,
            missing_evidence=(),
            score_template_id="agentops-owned",
            calculated_at=now,
            valid_until=now + timedelta(hours=1),
        ),
        run_evidence=RunEvidenceSummary(
            run_id="run-1",
            session_id="session-1",
            evidence_summary_id="evidence-1",
            source_event_ids=("event-1",),
            trace_id="trace-1",
        ),
        approval=ApprovalSummary(
            approval_id="approval-1",
            status="approved",
            audit_id="audit-1",
        ),
        runtime_policy=RuntimePolicySummary(
            policy_ref="policy-1",
            fallback_action="warn",
            runtime_risk_level="low",
            enforcement_mode="warn",
        ),
        links=(
            CrossSystemLink(
                rel="evidence_summary",
                target_system="agentops",
                href="/agentops/evidence/evidence-1",
                trace_id="trace-1",
            ),
        ),
    )


def _skill_publish_payload(
    *,
    trace_id: str = "trace-skill",
    audit_id: str = "audit-skill",
    skill_id: str = "skill.review",
    skill_version: str = "1.0.0",
) -> dict[str, object]:
    return {
        "trace_id": trace_id,
        "audit_id": audit_id,
        "approval_status": "approved",
        "package_validation": {"validation_status": "passed"},
        "skill": {
            "skill_id": skill_id,
            "skill_version": skill_version,
            "schema_ref": "schemas/skill.review.json",
            "risk_level": "medium",
            "package_id": "pkg-review",
            "agent_id": "agent-review",
            "owner_team": "platform",
            "owner_user": "owner@example.com",
        },
    }


def test_agentops_unavailable_returns_pending_sync_degraded_summary() -> None:
    client = AgentOpsSummaryClient()
    client.unavailable = True

    response = client.get_summary(
        "framework.ai-autosdlc",
        "1.0.0",
        trace_id="trace-1",
    ).to_response()

    assert response["quality_evidence"]["summary_validity_state"] == "expired"
    assert (
        response["runtime_policy"]["degraded_reason"]
        == "enterprise_evidence_pending_sync"
    )
    assert response["credential_bootstrap"]["enterprise_state"] == "degraded"


def test_credential_issue_client_consumes_registered_agentops_echo() -> None:
    client = AgentOpsCredentialIssueClient(
        {"boot-inst-1": _credential_response(bootstrap_status="signature_verified")}
    )

    summary = client.issue_credentials(
        _handoff(),
        headers={"Idempotency-Key": "idem-1"},
    )

    payload = summary.to_dict()
    assert payload["bootstrap_status"] == "signature_verified"
    assert payload["enterprise_state"] == "active"
    assert payload["credential_id"] == "cred-1"


def test_credential_issue_client_requires_ai_autosdlc_device_proof() -> None:
    client = AgentOpsCredentialIssueClient({"boot-inst-1": _credential_response()})
    handoff = _handoff()
    handoff["device_proof"] = None

    try:
        client.issue_credentials(handoff, headers={"Idempotency-Key": "idem-1"})
    except ValueError as exc:
        assert "device_proof must be provided by Ai_AutoSDLC" in str(exc)
    else:
        raise AssertionError("missing device_proof should fail")


def test_credential_issue_client_requires_non_empty_assertion_hash_binding() -> None:
    client = AgentOpsCredentialIssueClient({"boot-inst-1": _credential_response()})
    handoff = _handoff()
    assert isinstance(handoff["installation_assertion"], dict)
    assert isinstance(handoff["device_proof"], dict)
    handoff["installation_assertion"].pop("assertion_hash")
    handoff["device_proof"].pop("assertion_hash")

    try:
        client.issue_credentials(handoff, headers={"Idempotency-Key": "idem-1"})
    except ValueError as exc:
        assert "installation_assertion.assertion_hash is required" in str(exc)
    else:
        raise AssertionError("missing assertion hashes should fail")


def test_credential_issue_client_does_not_fabricate_missing_agentops_response() -> None:
    client = AgentOpsCredentialIssueClient()

    try:
        client.issue_credentials(_handoff(), headers={"Idempotency-Key": "idem-1"})
    except AgentOpsUnavailableError as exc:
        assert "not registered" in str(exc)
    else:
        raise AssertionError("missing AgentOps response should fail")


def test_raw_evidence_denied_returns_redacted_summary_and_access_link() -> None:
    client = AgentOpsSummaryClient({("framework.ai-autosdlc", "1.0.0"): _summary()})

    response = client.get_summary(
        "framework.ai-autosdlc",
        "1.0.0",
        trace_id="trace-1",
        raw_evidence_allowed=False,
    ).to_response()

    assert response["permission_state"] == "redacted"
    assert response["quality_evidence"]["redacted"] is True
    assert response["request_access_url"] == "/evidence-vault/request-access"
    assert response["links"][0]["target_system"] == "evidence_vault"


def test_store_client_does_not_calculate_quality_score() -> None:
    client = AgentOpsSummaryClient({("framework.ai-autosdlc", "1.0.0"): _summary()})

    response = client.get_summary(
        "framework.ai-autosdlc",
        "1.0.0",
        trace_id="trace-1",
    ).to_response()

    assert "quality_score" not in response["quality_evidence"]
    assert response["quality_evidence"]["confidence"] == 0.88


def test_skill_registry_notice_accepts_published_store_fact() -> None:
    api = SkillRegistryAPI()
    status, registry_response = api.publish_skill(
        _skill_publish_payload(),
        headers={"Idempotency-Key": "publish-1"},
    )
    client = AgentOpsSkillRegistryNoticeClient()

    ack = client.notify_skill_registry(
        registry_response,
        headers={"Idempotency-Key": "notice-1"},
    )

    assert status == 201
    assert ack["error_code"] == "OK"
    assert ack["schema_version"] == "skill_registry_notification_ack.v1"
    notification = ack["agentops_notification"]
    assert notification["delivery_state"] == "accepted"
    assert notification["target_system"] == "agentops"
    assert notification["consumer"] == "agentops"
    assert notification["registry_key"] == "skill.review@1.0.0"
    assert notification["request_payload_hash"].startswith("sha256:")
    assert notification["response_payload_hash"].startswith("sha256:")
    assert notification["delivery_attempt_id"].startswith("delivery-")
    assert notification["agentops_ack_id"].startswith("agentops-ack-")
    assert notification["source_of_truth"]["skill_registry"] == "agent_store"
    notice = client.accepted_notices[0]
    assert notice["schema_version"] == "skill_registry_notification.v1"
    assert notice["target_system"] == "agentops"
    assert notice["notice_type"] == "skill_published"
    assert notice["payload_hash"] == notification["request_payload_hash"]
    assert notice["skill"]["status"] == "published"
    assert notice["skill"]["package_id"] == "pkg-review"
    assert notice["skill"]["schema_ref"] == "schemas/skill.review.json"


def test_skill_registry_notice_accepts_deprecated_store_fact() -> None:
    api = SkillRegistryAPI()
    api.publish_skill(
        _skill_publish_payload(),
        headers={"Idempotency-Key": "publish-deprecated"},
    )
    status, registry_response = api.update_skill_status(
        "skill.review",
        "1.0.0",
        {
            "trace_id": "trace-deprecated",
            "audit_id": "audit-deprecated",
            "transition_action": "deprecate",
            "reason": "Replaced by a better Skill version.",
        },
        headers={"Idempotency-Key": "transition-deprecated"},
    )
    client = AgentOpsSkillRegistryNoticeClient()

    ack = client.notify_skill_registry(
        registry_response,
        headers={"Idempotency-Key": "notice-deprecated"},
    )

    assert status == 200
    assert ack["agentops_notification"]["registry_key"] == "skill.review@1.0.0"
    notice = client.accepted_notices[0]
    assert notice["notice_type"] == "skill_deprecated"
    assert notice["skill"]["status"] == "deprecated"
    assert notice["event"]["reason"] == "Replaced by a better Skill version."


def test_skill_registry_notice_rejects_blocked_registry_decision() -> None:
    api = SkillRegistryAPI()
    _, registry_response = api.publish_skill(
        {
            "trace_id": "trace-blocked",
            "audit_id": "audit-blocked",
            "approval_status": "approved",
            "package_validation": {"validation_status": "failed"},
            "skill": {
                "skill_id": "skill.blocked",
                "skill_version": "1.0.0",
                "schema_ref": "schemas/skill.blocked.json",
                "risk_level": "low",
                "package_id": "pkg-blocked",
                "agent_id": "agent-blocked",
                "owner_team": "platform",
                "owner_user": "owner@example.com",
            },
        },
        headers={"Idempotency-Key": "publish-blocked"},
    )
    client = AgentOpsSkillRegistryNoticeClient()

    try:
        client.notify_skill_registry(
            registry_response,
            headers={"Idempotency-Key": "notice-blocked"},
        )
    except ValueError as exc:
        assert "successful Skill Registry responses" in str(exc)
    else:
        raise AssertionError("blocked registry decisions should not notify AgentOps")


def test_skill_registry_notice_preserves_security_revoke_evidence() -> None:
    api = SkillRegistryAPI()
    api.publish_skill(
        _skill_publish_payload(),
        headers={"Idempotency-Key": "publish-security"},
    )
    status, registry_response = api.update_skill_status(
        "skill.review",
        "1.0.0",
        {
            "trace_id": "trace-revoke",
            "audit_id": "audit-revoke",
            "transition_action": "security_revoke",
            "reason": "CVE exploited in production.",
            "security_evidence_ref": "evidence-vault://sec/inc-1",
        },
        headers={"Idempotency-Key": "transition-security"},
    )
    client = AgentOpsSkillRegistryNoticeClient()

    ack = client.notify_skill_registry(
        registry_response,
        headers={"Idempotency-Key": "notice-security"},
    )

    assert status == 200
    assert ack["agentops_notification"]["registry_key"] == "skill.review@1.0.0"
    notice = client.accepted_notices[0]
    assert notice["notice_type"] == "skill_security_revoked"
    assert notice["skill"]["status"] == "security_revoked"
    assert notice["event"]["evidence_ref"] == "evidence-vault://sec/inc-1"
    notification = ack["agentops_notification"]
    assert notification["delivery_state"] == "accepted"
    assert "skill" not in notification
    assert "status" not in notification


def test_skill_registry_notice_idempotency_uses_defensive_copies() -> None:
    api = SkillRegistryAPI()
    _, registry_response = api.publish_skill(
        _skill_publish_payload(),
        headers={"Idempotency-Key": "publish-idem"},
    )
    client = AgentOpsSkillRegistryNoticeClient()

    first = client.notify_skill_registry(
        registry_response,
        headers={"idempotency-key": " notice-idem "},
    )
    first["agentops_notification"]["delivery_state"] = "mutated"
    second = client.notify_skill_registry(
        registry_response,
        headers={"Idempotency-Key": "notice-idem"},
    )

    assert second["agentops_notification"]["delivery_state"] == "accepted"
    assert second["agentops_notification"]["request_payload_hash"].startswith("sha256:")
    assert len(client.accepted_notices) == 1


def test_skill_registry_notice_idempotency_conflict_is_rejected() -> None:
    api = SkillRegistryAPI()
    _, first_response = api.publish_skill(
        _skill_publish_payload(trace_id="trace-first", audit_id="audit-first"),
        headers={"Idempotency-Key": "publish-first"},
    )
    _, second_response = api.publish_skill(
        _skill_publish_payload(
            trace_id="trace-second",
            audit_id="audit-second",
            skill_id="skill.review.alt",
        ),
        headers={"Idempotency-Key": "publish-second"},
    )
    client = AgentOpsSkillRegistryNoticeClient()
    client.notify_skill_registry(
        first_response,
        headers={"Idempotency-Key": "notice-conflict"},
    )

    try:
        client.notify_skill_registry(
            second_response,
            headers={"Idempotency-Key": "notice-conflict"},
        )
    except ValueError as exc:
        assert "conflicts" in str(exc)
    else:
        raise AssertionError("conflicting notice payload should fail")


def test_skill_registry_notice_unavailable_does_not_cache_failure() -> None:
    api = SkillRegistryAPI()
    _, registry_response = api.publish_skill(
        _skill_publish_payload(),
        headers={"Idempotency-Key": "publish-unavailable"},
    )
    client = AgentOpsSkillRegistryNoticeClient()
    client.unavailable = True

    try:
        client.notify_skill_registry(
            registry_response,
            headers={"Idempotency-Key": "notice-unavailable"},
        )
    except AgentOpsUnavailableError as exc:
        assert "skill registry notice unavailable" in str(exc)
    else:
        raise AssertionError("AgentOps outage should raise")

    client.unavailable = False
    ack = client.notify_skill_registry(
        registry_response,
        headers={"Idempotency-Key": "notice-unavailable"},
    )
    assert ack["error_code"] == "OK"


def test_cached_summary_uses_current_request_trace() -> None:
    client = AgentOpsSummaryClient({("framework.ai-autosdlc", "1.0.0"): _summary()})

    response = client.get_summary(
        "framework.ai-autosdlc",
        "1.0.0",
        trace_id="trace-current",
    ).to_response()
    redacted = client.get_summary(
        "framework.ai-autosdlc",
        "1.0.0",
        trace_id="trace-redacted",
        raw_evidence_allowed=False,
    ).to_response()

    assert response["trace_id"] == "trace-current"
    assert response["run_evidence"]["trace_id"] == "trace-current"
    assert response["links"][0]["trace_id"] == "trace-current"
    assert redacted["trace_id"] == "trace-redacted"
    assert redacted["run_evidence"]["trace_id"] == "trace-redacted"
    assert redacted["links"][0]["trace_id"] == "trace-redacted"
