from agent_store.api.agent_registry import response_envelope_ok
from agent_store.api.draft_review import DraftReviewSubmissionAPI
from agent_store.ui.listing_wizard import build_listing_wizard_shell


def _manifest() -> dict[str, object]:
    return {
        "agent_id": "agent.guided-uploader",
        "display_name": "Guided Uploader",
        "summary": "Creates release drafts from a repository handoff.",
        "owner_team": "Agent Platform",
        "owner_user": "owner@example.com",
        "version": "0.1.0",
        "entrypoint": "python -m guided_uploader",
        "package_id": "pkg-guided-uploader-001",
        "manifest_lock": "manifest.lock",
        "sbom_ref": "sbom://guided-uploader/0.1.0",
        "scan_report_ref": "scan://guided-uploader/0.1.0",
        "skills": [
            {
                "skill_id": "repo.detect",
                "skill_version": "1.0.0",
                "schema_ref": "schemas/repo.detect.v1.json",
                "risk_level": "medium",
            }
        ],
    }


def _wizard() -> dict[str, object]:
    return build_listing_wizard_shell(
        source={
            "source_id": "repo-release-reviewer",
            "source_type": "git_repository",
            "source_ref": "git@example.com:agent/release-reviewer.git",
        },
        package_manifest=_manifest(),
        runtime_availability={
            "availability_state": "runtime_ready",
            "display_name_zh": "可运行",
        },
        health_summary_freshness={
            "freshness_state": "health_fresh",
            "display_name_zh": "健康摘要新鲜",
            "recommendation_basis_allowed": False,
        },
        trace_id="trace-027",
        audit_id="audit-027",
    )["listing_wizard"]


def _payload() -> dict[str, object]:
    return {
        "trace_id": "trace-027",
        "audit_id": "audit-027",
        "listing_wizard": _wizard(),
        "owner_confirmation": {
            "confirmed": True,
            "confirmed_by": "owner@example.com",
            "confirmed_at": "2026-05-09T09:00:00Z",
            "confirmation_basis": "owner_reviewed_listing_wizard",
        },
    }


def test_submit_draft_review_enqueues_pending_review() -> None:
    status, body = DraftReviewSubmissionAPI().submit_draft_review(
        _payload(),
        headers={"Idempotency-Key": "draft-review-027"},
    )
    submission = body["draft_review_submission"]

    assert status == 200
    assert response_envelope_ok(body)
    assert submission["contract_schema_version"] == "draft_review_submission.v1"
    assert submission["submission_state"] == "pending_review"
    assert submission["draft_status"] == "pending_review"
    assert submission["review_queue_entry"]["queue_state"] == "enqueued"


def test_submit_draft_review_reuses_idempotent_result_with_defensive_copy() -> None:
    api = DraftReviewSubmissionAPI()

    _, first = api.submit_draft_review(
        _payload(),
        headers={"Idempotency-Key": "draft-review-027"},
    )
    first["draft_review_submission"]["submission_state"] = "mutated"
    status, second = api.submit_draft_review(
        _payload(),
        headers={"Idempotency-Key": "draft-review-027"},
    )

    assert status == 200
    assert second["draft_review_submission"]["submission_state"] == "pending_review"


def test_submit_draft_review_idempotency_ignores_observability_fields() -> None:
    api = DraftReviewSubmissionAPI()

    _, first = api.submit_draft_review(
        _payload(),
        headers={"Idempotency-Key": "draft-review-027"},
    )
    retry = _payload()
    retry["trace_id"] = "trace-retry"
    retry["audit_id"] = "audit-retry"
    status, second = api.submit_draft_review(
        retry,
        headers={"Idempotency-Key": "draft-review-027"},
    )

    assert status == 200
    assert second == first


def test_submit_draft_review_rejects_idempotency_conflict() -> None:
    api = DraftReviewSubmissionAPI()
    api.submit_draft_review(
        _payload(),
        headers={"Idempotency-Key": "draft-review-027"},
    )
    changed = _payload()
    changed["owner_confirmation"]["confirmed_by"] = "other@example.com"

    status, body = api.submit_draft_review(
        changed,
        headers={"Idempotency-Key": "draft-review-027"},
    )

    assert status == 409
    assert response_envelope_ok(body)
    assert body["error_code"] == "IDEMPOTENCY_KEY_CONFLICT"


def test_submit_draft_review_coerces_invalid_validation_counts() -> None:
    payload = _payload()
    payload["listing_wizard"]["validation_report"]["issue_count"] = "not-a-number"
    payload["listing_wizard"]["validation_report"]["fix_prompt_count"] = True

    status, body = DraftReviewSubmissionAPI().submit_draft_review(
        payload,
        headers={"Idempotency-Key": "draft-review-invalid-counts"},
    )
    summary = body["draft_review_submission"]["validation_summary"]

    assert status == 200
    assert response_envelope_ok(body)
    assert summary["issue_count"] == 0
    assert summary["fix_prompt_count"] == 0


def test_submit_draft_review_requires_listing_wizard_object() -> None:
    payload = _payload()
    payload["listing_wizard"] = None

    status, body = DraftReviewSubmissionAPI().submit_draft_review(
        payload,
        headers={"Idempotency-Key": "draft-review-027"},
    )

    assert status == 400
    assert response_envelope_ok(body)
    assert body["error_code"] == "VALIDATION_ERROR"
    assert body["details"]["reason"] == "listing_wizard must be an object"


def test_submit_draft_review_requires_owner_confirmation_object() -> None:
    payload = _payload()
    payload["owner_confirmation"] = None

    status, body = DraftReviewSubmissionAPI().submit_draft_review(
        payload,
        headers={"Idempotency-Key": "draft-review-027"},
    )

    assert status == 400
    assert response_envelope_ok(body)
    assert body["error_code"] == "VALIDATION_ERROR"
    assert body["details"]["reason"] == "owner_confirmation must be an object"
