from copy import deepcopy
from datetime import timedelta

from agent_store.api.agent_registry import response_envelope_ok
from agent_store.api.quality_evidence_access import QualityEvidenceAccessAPI
from agent_store.domain.models import utc_now


def _payload() -> dict[str, object]:
    now = utc_now()
    return {
        "trace_id": "trace-quality-evidence-access-037",
        "audit_id": "audit-quality-evidence-access-037",
        "agentops_summary": {
            "agent_id": "agent.release-reviewer",
            "agent_version": "0.2.0",
            "quality_evidence": {
                "evidence_level": "L5-capable",
                "confidence": 0.9,
                "identity_confidence": 0.98,
                "missing_evidence": [],
                "score_template_id": "agentops-owned",
                "calculated_at": now.isoformat(),
                "valid_until": (now + timedelta(hours=1)).isoformat(),
                "summary_validity_state": "fresh",
            },
            "run_evidence": {
                "run_id": "run-037",
                "session_id": "session-037",
                "evidence_summary_id": "evidence-037",
                "source_event_count": 3,
            },
        },
        "viewer_context": {
            "viewer_id": "owner@example.com",
            "can_view_quality_summary": True,
            "can_view_raw_evidence": False,
            "request_access_url": "/evidence-vault/access-requests",
        },
    }


def test_quality_evidence_access_api_returns_redaction_safe_summary() -> None:
    status, body = QualityEvidenceAccessAPI().summarize_access(
        _payload(),
        headers={"Idempotency-Key": "quality-evidence-access-037"},
    )
    summary = body["quality_evidence_access_summary"]

    assert status == 200
    assert response_envelope_ok(body)
    assert summary["contract_schema_version"] == "quality_evidence_access_summary.v1"
    assert summary["summary_state"] == "summary_ready"
    assert summary["raw_trace_exposed"] is False
    assert summary["raw_evidence_exposed"] is False
    assert summary["source_of_truth"]["quality_summary"] == "agentops"
    assert summary["source_of_truth"]["raw_evidence"] == "evidence_vault"
    assert summary["next_action"]["target_system"] == "evidence_vault"


def test_quality_evidence_access_api_reuses_idempotent_result() -> None:
    api = QualityEvidenceAccessAPI()
    payload = _payload()

    _, first = api.summarize_access(
        payload,
        headers={"Idempotency-Key": "quality-evidence-access-037"},
    )
    retry_status, retry = api.summarize_access(
        payload,
        headers={"idempotency-key": "quality-evidence-access-037"},
    )

    assert retry_status == 200
    assert retry == first


def test_quality_evidence_access_api_canonicalizes_template_idempotency() -> None:
    api = QualityEvidenceAccessAPI()
    first_payload = _payload()
    first_payload["accepted_score_template_ids"] = [" agentops-owned ", "legacy"]
    second_payload = deepcopy(first_payload)
    second_payload["accepted_score_template_ids"] = ["legacy", "agentops-owned"]

    _, first = api.summarize_access(
        first_payload,
        headers={"Idempotency-Key": "quality-evidence-template-order-037"},
    )
    retry_status, retry = api.summarize_access(
        second_payload,
        headers={"Idempotency-Key": "quality-evidence-template-order-037"},
    )

    assert retry_status == 200
    assert retry == first


def test_quality_evidence_access_api_canonicalizes_omitted_default_templates() -> None:
    api = QualityEvidenceAccessAPI()
    first_payload = _payload()
    second_payload = deepcopy(first_payload)
    second_payload["accepted_score_template_ids"] = ["agentops-owned"]

    _, first = api.summarize_access(
        first_payload,
        headers={"Idempotency-Key": "quality-evidence-default-template-037"},
    )
    retry_status, retry = api.summarize_access(
        second_payload,
        headers={"Idempotency-Key": "quality-evidence-default-template-037"},
    )

    assert retry_status == 200
    assert retry == first


def test_quality_evidence_access_api_rejects_idempotency_conflict() -> None:
    api = QualityEvidenceAccessAPI()
    api.summarize_access(
        _payload(),
        headers={"Idempotency-Key": "quality-evidence-access-037"},
    )
    changed = _payload()
    assert isinstance(changed["agentops_summary"], dict)
    changed["agentops_summary"]["agent_version"] = "0.3.0"

    status, body = api.summarize_access(
        changed,
        headers={"Idempotency-Key": "quality-evidence-access-037"},
    )

    assert status == 409
    assert response_envelope_ok(body)
    assert body["error_code"] == "IDEMPOTENCY_KEY_CONFLICT"


def test_quality_evidence_access_api_requires_idempotency_key() -> None:
    status, body = QualityEvidenceAccessAPI().summarize_access(_payload(), headers={})

    assert status == 400
    assert response_envelope_ok(body)
    assert body["error_code"] == "VALIDATION_ERROR"


def test_quality_evidence_access_api_rejects_non_object_viewer_context() -> None:
    payload = _payload()
    payload["viewer_context"] = []

    status, body = QualityEvidenceAccessAPI().summarize_access(
        payload,
        headers={"Idempotency-Key": "quality-evidence-access-037"},
    )

    assert status == 400
    assert response_envelope_ok(body)
    assert body["details"]["reason"] == "viewer_context must be an object when present"
