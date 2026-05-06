from __future__ import annotations

import hashlib
import hmac
from collections.abc import Mapping

from agent_store import SCHEMA_VERSION
from agent_store.domain.errors import ErrorResponse


class TrustedEvidenceLoopVerifier:
    def __init__(self, *, trusted_reporter_keys: Mapping[str, bytes]) -> None:
        if not trusted_reporter_keys:
            raise ValueError("trusted reporter keys are required")
        self._trusted_reporter_keys = dict(trusted_reporter_keys)

    def assert_loop(
        self, payload: Mapping[str, object]
    ) -> tuple[int, dict[str, object]]:
        trace_id = str(payload.get("trace_id") or "trace-missing")
        run_id = str(payload.get("run_id") or "")
        session_id = str(payload.get("session_id") or "")
        if not run_id:
            return self._failure("RUN_ID_REQUIRED", "errors.runIdRequired", trace_id)
        if not session_id:
            return self._failure(
                "SESSION_ID_REQUIRED", "errors.sessionIdRequired", trace_id
            )

        reporter_event = payload.get("reporter_event")
        if not isinstance(reporter_event, Mapping):
            return self._failure(
                "REPORTER_SIGNATURE_INVALID",
                "errors.reporterSignatureInvalid",
                trace_id,
            )

        required_payload_refs = (
            "installation_id",
            "device_id",
            "agent_id",
            "agent_version",
            "artifact_hash",
            "trace_id",
            "evidence_summary_id",
        )
        for field in required_payload_refs:
            if not self._has_required_string(payload, field):
                return self._failure(
                    "EVIDENCE_TRACE_MISMATCH",
                    "errors.evidenceTraceMismatch",
                    trace_id,
                )

        required_reporter_refs = (
            "event_id",
            "event_type",
            "idempotency_key",
            "key_id",
            "signed_at",
        )
        for field in required_reporter_refs:
            if not self._has_required_string(reporter_event, field):
                return self._failure(
                    "EVIDENCE_TRACE_MISMATCH",
                    "errors.evidenceTraceMismatch",
                    trace_id,
                )
        if not isinstance(reporter_event.get("sequence_no"), int):
            return self._failure(
                "EVIDENCE_TRACE_MISMATCH",
                "errors.evidenceTraceMismatch",
                trace_id,
            )

        checked_refs = self._checked_refs(payload, reporter_event, run_id, session_id)
        event_hash = str(reporter_event.get("event_hash") or "")
        if not event_hash:
            return self._failure(
                "REPORTER_SIGNATURE_INVALID",
                "errors.reporterSignatureInvalid",
                trace_id,
            )
        expected_event_hash = self._event_hash(checked_refs)
        if not hmac.compare_digest(event_hash, expected_event_hash):
            return self._failure(
                "EVIDENCE_TRACE_MISMATCH",
                "errors.evidenceTraceMismatch",
                trace_id,
            )
        signature = str(reporter_event.get("signature") or "")
        key_id = str(reporter_event.get("key_id") or "")
        if not self._verify_reporter_signature(
            key_id=key_id,
            event_hash=event_hash,
            signature=signature,
        ):
            return self._failure(
                "REPORTER_SIGNATURE_INVALID",
                "errors.reporterSignatureInvalid",
                trace_id,
            )

        if payload.get("l5_gate_result") != "passed":
            return self._failure(
                "L5_GATE_INCOMPLETE", "errors.l5GateIncomplete", trace_id
            )
        if payload.get("violation_scan_completed") is not True:
            return self._failure(
                "VIOLATION_SCAN_INCOMPLETE",
                "errors.violationScanIncomplete",
                trace_id,
            )

        return 200, {
            "schema_version": SCHEMA_VERSION,
            "trace_id": trace_id,
            "error_code": "OK",
            "result": {
                "trusted_loop_verified": True,
                "actual_l5_display_allowed": True,
                "checked_refs": checked_refs,
            },
        }

    @staticmethod
    def _has_required_string(source: Mapping[str, object], field: str) -> bool:
        value = source.get(field)
        return isinstance(value, str) and bool(value.strip())

    @staticmethod
    def _checked_refs(
        payload: Mapping[str, object],
        reporter_event: Mapping[str, object],
        run_id: str,
        session_id: str,
    ) -> list[str]:
        return [
            str(payload["installation_id"]),
            str(payload["device_id"]),
            str(payload["agent_id"]),
            str(payload["agent_version"]),
            str(payload["artifact_hash"]),
            str(payload["trace_id"]),
            run_id,
            session_id,
            str(payload["evidence_summary_id"]),
            str(reporter_event["event_id"]),
        ]

    @staticmethod
    def _event_hash(checked_refs: list[str]) -> str:
        return hashlib.sha256("\n".join(checked_refs).encode("utf-8")).hexdigest()

    def _verify_reporter_signature(
        self,
        *,
        key_id: str,
        event_hash: str,
        signature: str,
    ) -> bool:
        key = self._trusted_reporter_keys.get(key_id)
        if key is None or not signature:
            return False
        expected = hmac.new(key, event_hash.encode("utf-8"), hashlib.sha256).hexdigest()
        return hmac.compare_digest(expected, signature)

    @staticmethod
    def _failure(
        error_code: str, message_key: str, trace_id: str
    ) -> tuple[int, dict[str, object]]:
        return 409, ErrorResponse(
            error_code=error_code,
            message_key=message_key,
            severity="blocked",
            retryable=False,
            recommended_action_id="refresh_trusted_evidence",
            trace_id=trace_id,
        ).to_dict()
