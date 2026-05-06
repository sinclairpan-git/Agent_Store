from __future__ import annotations

from collections.abc import Mapping

from agent_store import SCHEMA_VERSION
from agent_store.domain.errors import ErrorResponse


class TrustedEvidenceLoopVerifier:
    def assert_loop(self, payload: Mapping[str, object]) -> tuple[int, dict[str, object]]:
        trace_id = str(payload.get("trace_id") or "trace-missing")
        run_id = str(payload.get("run_id") or "")
        session_id = str(payload.get("session_id") or "")
        if not run_id:
            return self._failure("RUN_ID_REQUIRED", "errors.runIdRequired", trace_id)
        if not session_id:
            return self._failure("SESSION_ID_REQUIRED", "errors.sessionIdRequired", trace_id)

        reporter_event = payload.get("reporter_event")
        if not isinstance(reporter_event, Mapping):
            return self._failure(
                "REPORTER_SIGNATURE_INVALID",
                "errors.reporterSignatureInvalid",
                trace_id,
            )
        event_hash = str(reporter_event.get("event_hash") or "")
        signature = str(reporter_event.get("signature") or "")
        if not event_hash or signature != f"sig:{event_hash}":
            return self._failure(
                "REPORTER_SIGNATURE_INVALID",
                "errors.reporterSignatureInvalid",
                trace_id,
            )

        if payload.get("l5_gate_result") != "passed":
            return self._failure("L5_GATE_INCOMPLETE", "errors.l5GateIncomplete", trace_id)
        if payload.get("violation_scan_completed") is not True:
            return self._failure(
                "VIOLATION_SCAN_INCOMPLETE",
                "errors.violationScanIncomplete",
                trace_id,
            )

        required_refs = (
            ("installation_id", payload),
            ("artifact_hash", payload),
            ("evidence_summary_id", payload),
            ("event_id", reporter_event),
        )
        for field, source in required_refs:
            if not source.get(field):
                return self._failure(
                    "EVIDENCE_TRACE_MISMATCH",
                    "errors.evidenceTraceMismatch",
                    trace_id,
                )

        checked_refs = [
            str(payload["installation_id"]),
            str(payload["artifact_hash"]),
            run_id,
            session_id,
            str(payload["evidence_summary_id"]),
            str(reporter_event["event_id"]),
        ]
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
    def _failure(error_code: str, message_key: str, trace_id: str) -> tuple[int, dict[str, object]]:
        return 409, ErrorResponse(
            error_code=error_code,
            message_key=message_key,
            severity="blocked",
            retryable=False,
            recommended_action_id="refresh_trusted_evidence",
            trace_id=trace_id,
        ).to_dict()
