from datetime import timedelta

from agent_store.domain.agentops_summary import (
    ApprovalSummary,
    CredentialBootstrapSummary,
    L5GateSummary,
    QualityEvidenceSummary,
    RunEvidenceSummary,
    RuntimePolicySummary,
)
from agent_store.domain.models import utc_now


def test_agentops_summary_models_match_contract_fields() -> None:
    now = utc_now()
    quality = QualityEvidenceSummary(
        evidence_level="L5-capable",
        confidence=0.9,
        missing_evidence=("violation_scan",),
        score_template_id="agentops-owned",
        calculated_at=now,
        valid_until=now + timedelta(hours=1),
    )
    approval = ApprovalSummary(
        approval_id="approval-1",
        status="approved",
        audit_id="audit-1",
    )
    runtime_policy = RuntimePolicySummary(
        policy_ref="policy-1",
        fallback_action="warn",
        runtime_risk_level="medium",
        enforcement_mode="warn",
    )
    credential = CredentialBootstrapSummary(
        bootstrap_status="signature_verified",
        credential_status="active",
        reporter_status="sent",
        enterprise_state="active",
    )

    assert quality.to_dict()["score_template_id"] == "agentops-owned"
    assert approval.to_dict()["audit_id"] == "audit-1"
    assert runtime_policy.to_dict()["fallback_action"] == "warn"
    assert credential.to_dict()["enterprise_state"] == "active"


def test_quality_summary_marks_valid_until_expired() -> None:
    now = utc_now()
    quality = QualityEvidenceSummary(
        evidence_level="L4",
        confidence=0.5,
        missing_evidence=(),
        score_template_id="agentops-owned",
        calculated_at=now - timedelta(hours=2),
        valid_until=now - timedelta(minutes=1),
    )

    assert quality.is_expired(now)
    assert quality.to_dict(now=now)["summary_validity_state"] == "expired"


def test_l5_gate_requires_violation_scan_before_actual_l5_display() -> None:
    assert not L5GateSummary(
        l5_gate_result="passed",
        violation_scan_completed=False,
    ).actual_l5_display_allowed
    assert L5GateSummary(
        l5_gate_result="passed",
        violation_scan_completed=True,
    ).actual_l5_display_allowed


def test_run_evidence_summary_preserves_explicit_zero_source_event_count() -> None:
    summary = RunEvidenceSummary(
        run_id="run-1",
        session_id="session-1",
        evidence_summary_id="evidence-1",
        source_event_ids=("event-1",),
        trace_id="trace-1",
        source_event_count=0,
    )

    assert summary.to_dict()["source_event_count"] == 0


def test_credential_response_echo_keeps_store_in_activation_state() -> None:
    summary = CredentialBootstrapSummary.from_agentops_credential_response(
        {
            "credential_id": "cred-1",
            "token_id": "token-1",
            "device_key_id": "device-key-1",
            "status": "active",
            "bootstrap_status": "credential_issued",
            "installation_id": "inst-1",
            "device_id": "dev-1",
            "expires_at": "2026-05-07T13:00:00+00:00",
            "next_action": "send_signature_test_event",
        }
    )

    payload = summary.to_dict()
    assert payload["credential_status"] == "active"
    assert payload["bootstrap_status"] == "credential_issued"
    assert payload["enterprise_state"] == "activating"
    assert payload["reporter_status"] == "pending_signature_test"
    assert payload["next_action"] == "send_signature_test_event"
