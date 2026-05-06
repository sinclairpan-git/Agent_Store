import hashlib
import hmac

from agent_store.integrations.trusted_evidence_loop import TrustedEvidenceLoopVerifier

REPORTER_SECRET = b"test-reporter-secret"
TRUSTED_REPORTER_KEYS = {"key-1": REPORTER_SECRET}


def _signature(event_hash: str, secret: bytes = REPORTER_SECRET) -> str:
    return hmac.new(secret, event_hash.encode("utf-8"), hashlib.sha256).hexdigest()


def _event_hash(payload: dict[str, object]) -> str:
    reporter_event = payload["reporter_event"]
    checked_refs = [
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
    return hashlib.sha256("\n".join(checked_refs).encode("utf-8")).hexdigest()


def _sign_payload(payload: dict[str, object]) -> dict[str, object]:
    event_hash = _event_hash(payload)
    payload["reporter_event"]["event_hash"] = event_hash
    payload["reporter_event"]["signature"] = _signature(event_hash)
    return payload


def _verifier() -> TrustedEvidenceLoopVerifier:
    return TrustedEvidenceLoopVerifier(trusted_reporter_keys=TRUSTED_REPORTER_KEYS)


def _payload() -> dict[str, object]:
    payload = {
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
            "event_hash": "",
            "signature": "",
            "key_id": "key-1",
            "signed_at": "2026-05-06T00:00:00Z",
        },
        "evidence_summary_id": "evidence-1",
        "l5_gate_result": "passed",
        "violation_scan_completed": True,
    }
    return _sign_payload(payload)


def test_trusted_evidence_loop_accepts_shared_trace_run_session_chain() -> None:
    status, body = _verifier().assert_loop(_payload())

    assert status == 200
    assert body["error_code"] == "OK"
    assert body["result"]["trusted_loop_verified"] is True
    assert body["result"]["actual_l5_display_allowed"] is True
    assert "run-1" in body["result"]["checked_refs"]


def test_trusted_evidence_loop_rejects_missing_run_id() -> None:
    payload = _payload()
    payload["run_id"] = ""

    status, body = _verifier().assert_loop(payload)

    assert status == 409
    assert body["error_code"] == "RUN_ID_REQUIRED"


def test_trusted_evidence_loop_rejects_missing_session_id() -> None:
    payload = _payload()
    payload["session_id"] = ""

    status, body = _verifier().assert_loop(payload)

    assert status == 409
    assert body["error_code"] == "SESSION_ID_REQUIRED"


def test_trusted_evidence_loop_rejects_bad_reporter_signature() -> None:
    payload = _payload()
    payload["reporter_event"]["signature"] = "bad"

    status, body = _verifier().assert_loop(payload)

    assert status == 409
    assert body["error_code"] == "REPORTER_SIGNATURE_INVALID"


def test_trusted_evidence_loop_rejects_empty_reporter_hash() -> None:
    payload = _payload()
    payload["reporter_event"]["event_hash"] = ""
    payload["reporter_event"]["signature"] = "sig:"

    status, body = _verifier().assert_loop(payload)

    assert status == 409
    assert body["error_code"] == "REPORTER_SIGNATURE_INVALID"


def test_trusted_evidence_loop_rejects_replayed_signature_for_different_chain() -> None:
    payload = _payload()
    payload["session_id"] = "session-replayed"

    status, body = _verifier().assert_loop(payload)

    assert status == 409
    assert body["error_code"] == "EVIDENCE_TRACE_MISMATCH"


def test_trusted_evidence_loop_rejects_replayed_signature_for_different_trace_id() -> None:
    payload = _payload()
    payload["trace_id"] = "trace-replayed"

    status, body = _verifier().assert_loop(payload)

    assert status == 409
    assert body["error_code"] == "EVIDENCE_TRACE_MISMATCH"


def test_trusted_evidence_loop_rejects_incomplete_l5_gate_and_scan() -> None:
    payload = _payload()
    payload["l5_gate_result"] = "pending"

    status, body = _verifier().assert_loop(payload)

    assert status == 409
    assert body["error_code"] == "L5_GATE_INCOMPLETE"

    payload = _payload()
    payload["violation_scan_completed"] = False
    status, body = _verifier().assert_loop(payload)
    assert status == 409
    assert body["error_code"] == "VIOLATION_SCAN_INCOMPLETE"


def test_trusted_evidence_loop_rejects_missing_reference_fields() -> None:
    payload = _payload()
    del payload["artifact_hash"]

    status, body = _verifier().assert_loop(payload)

    assert status == 409
    assert body["error_code"] == "EVIDENCE_TRACE_MISMATCH"

    payload = _payload()
    del payload["device_id"]
    status, body = _verifier().assert_loop(payload)

    assert status == 409
    assert body["error_code"] == "EVIDENCE_TRACE_MISMATCH"

    payload = _payload()
    del payload["agent_id"]
    status, body = _verifier().assert_loop(payload)

    assert status == 409
    assert body["error_code"] == "EVIDENCE_TRACE_MISMATCH"

    payload = _payload()
    del payload["trace_id"]
    status, body = _verifier().assert_loop(payload)

    assert status == 409
    assert body["error_code"] == "EVIDENCE_TRACE_MISMATCH"

    payload = _payload()
    del payload["reporter_event"]["event_id"]
    status, body = _verifier().assert_loop(payload)

    assert status == 409
    assert body["error_code"] == "EVIDENCE_TRACE_MISMATCH"

    payload = _payload()
    del payload["reporter_event"]["key_id"]
    status, body = _verifier().assert_loop(payload)

    assert status == 409
    assert body["error_code"] == "EVIDENCE_TRACE_MISMATCH"

    payload = _payload()
    payload["reporter_event"]["sequence_no"] = None
    status, body = _verifier().assert_loop(payload)

    assert status == 409
    assert body["error_code"] == "EVIDENCE_TRACE_MISMATCH"


def test_trusted_evidence_loop_rejects_unregistered_reporter_key() -> None:
    payload = _payload()
    payload["reporter_event"]["key_id"] = "unknown-key"

    status, body = _verifier().assert_loop(payload)

    assert status == 409
    assert body["error_code"] == "REPORTER_SIGNATURE_INVALID"


def test_trusted_evidence_loop_requires_trusted_reporter_keys() -> None:
    try:
        TrustedEvidenceLoopVerifier(trusted_reporter_keys={})
    except ValueError as exc:
        assert "trusted reporter keys" in str(exc)
    else:
        raise AssertionError("empty trusted reporter keys should be rejected")
