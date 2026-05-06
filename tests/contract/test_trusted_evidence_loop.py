from agent_store.integrations.trusted_evidence_loop import TrustedEvidenceLoopVerifier


def _payload() -> dict[str, object]:
    return {
        "installation_id": "inst-1",
        "device_id": "dev-1",
        "agent_id": "framework.ai-autosdlc",
        "agent_version": "1.0.0",
        "artifact_hash": "sha256:first",
        "run_id": "run-1",
        "session_id": "session-1",
        "trace_id": "trace-1",
        "reporter_event": {
            "event_id": "event-1",
            "event_type": "verification_completed",
            "sequence_no": 1,
            "idempotency_key": "event-idem-1",
            "event_hash": "hash-1",
            "signature": "sig:hash-1",
            "key_id": "key-1",
            "signed_at": "2026-05-06T00:00:00Z",
        },
        "evidence_summary_id": "evidence-1",
        "l5_gate_result": "passed",
        "violation_scan_completed": True,
    }


def test_trusted_evidence_loop_accepts_shared_trace_run_session_chain() -> None:
    status, body = TrustedEvidenceLoopVerifier().assert_loop(_payload())

    assert status == 200
    assert body["error_code"] == "OK"
    assert body["result"]["trusted_loop_verified"] is True
    assert body["result"]["actual_l5_display_allowed"] is True
    assert "run-1" in body["result"]["checked_refs"]


def test_trusted_evidence_loop_rejects_missing_run_id() -> None:
    payload = _payload()
    payload["run_id"] = ""

    status, body = TrustedEvidenceLoopVerifier().assert_loop(payload)

    assert status == 409
    assert body["error_code"] == "RUN_ID_REQUIRED"


def test_trusted_evidence_loop_rejects_missing_session_id() -> None:
    payload = _payload()
    payload["session_id"] = ""

    status, body = TrustedEvidenceLoopVerifier().assert_loop(payload)

    assert status == 409
    assert body["error_code"] == "SESSION_ID_REQUIRED"


def test_trusted_evidence_loop_rejects_bad_reporter_signature() -> None:
    payload = _payload()
    payload["reporter_event"]["signature"] = "bad"

    status, body = TrustedEvidenceLoopVerifier().assert_loop(payload)

    assert status == 409
    assert body["error_code"] == "REPORTER_SIGNATURE_INVALID"


def test_trusted_evidence_loop_rejects_empty_reporter_hash() -> None:
    payload = _payload()
    payload["reporter_event"]["event_hash"] = ""
    payload["reporter_event"]["signature"] = "sig:"

    status, body = TrustedEvidenceLoopVerifier().assert_loop(payload)

    assert status == 409
    assert body["error_code"] == "REPORTER_SIGNATURE_INVALID"


def test_trusted_evidence_loop_rejects_incomplete_l5_gate_and_scan() -> None:
    payload = _payload()
    payload["l5_gate_result"] = "pending"

    status, body = TrustedEvidenceLoopVerifier().assert_loop(payload)

    assert status == 409
    assert body["error_code"] == "L5_GATE_INCOMPLETE"

    payload = _payload()
    payload["violation_scan_completed"] = False
    status, body = TrustedEvidenceLoopVerifier().assert_loop(payload)
    assert status == 409
    assert body["error_code"] == "VIOLATION_SCAN_INCOMPLETE"


def test_trusted_evidence_loop_rejects_missing_reference_fields() -> None:
    payload = _payload()
    del payload["artifact_hash"]

    status, body = TrustedEvidenceLoopVerifier().assert_loop(payload)

    assert status == 409
    assert body["error_code"] == "EVIDENCE_TRACE_MISMATCH"

    payload = _payload()
    del payload["reporter_event"]["event_id"]
    status, body = TrustedEvidenceLoopVerifier().assert_loop(payload)

    assert status == 409
    assert body["error_code"] == "EVIDENCE_TRACE_MISMATCH"
