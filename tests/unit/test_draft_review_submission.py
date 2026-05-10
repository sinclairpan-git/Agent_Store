from agent_store.domain.draft_review import build_draft_review_submission
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


def _wizard(
    manifest: dict[str, object] | None = None,
    runtime_state: str = "runtime_ready",
) -> dict[str, object]:
    return build_listing_wizard_shell(
        source={
            "source_id": "repo-release-reviewer",
            "source_type": "git_repository",
            "source_ref": "git@example.com:agent/release-reviewer.git",
        },
        package_manifest=manifest or _manifest(),
        runtime_availability={
            "availability_state": runtime_state,
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


def _owner_confirmation(confirmed: bool = True) -> dict[str, object]:
    return {
        "confirmed": confirmed,
        "confirmed_by": "owner@example.com",
        "confirmed_at": "2026-05-09T09:00:00Z",
        "confirmation_basis": "owner_reviewed_listing_wizard",
    }


def _submission(
    wizard: dict[str, object] | None = None,
    owner_confirmation: dict[str, object] | None = None,
) -> dict[str, object]:
    return build_draft_review_submission(
        listing_wizard=wizard or _wizard(),
        owner_confirmation=owner_confirmation or _owner_confirmation(),
        trace_id="trace-027",
        audit_id="audit-027",
    ).to_response()["draft_review_submission"]


def test_draft_review_submission_enters_pending_review_after_all_gates_pass() -> None:
    submission = _submission()

    assert submission["contract_schema_version"] == "draft_review_submission.v1"
    assert submission["submission_state"] == "pending_review"
    assert submission["draft_status"] == "pending_review"
    assert submission["review_queue_entry"]["review_status"] == "pending_review"
    assert submission["issues"] == []
    assert submission["next_action"]["action_id"] == "track_review_queue"
    assert submission["source_of_truth"]["draft_review_queue"] == "agent_store"


def test_draft_review_submission_requires_explicit_owner_confirmation() -> None:
    submission = _submission(owner_confirmation=_owner_confirmation(False))

    assert submission["submission_state"] == "owner_confirmation_required"
    assert submission["draft_status"] == "draft_review_blocked"
    assert submission["review_queue_entry"]["queue_state"] == "not_enqueued"
    assert submission["issues"][0]["issue_id"] == "OWNER_CONFIRMATION_REQUIRED"
    assert submission["next_action"]["action_id"] == "confirm_owner_submission"


def test_draft_review_submission_blocks_failed_package_validation() -> None:
    manifest = _manifest()
    manifest["owner_user"] = ""
    submission = _submission(wizard=_wizard(manifest=manifest))

    assert submission["submission_state"] == "validation_blocked"
    assert submission["draft_status"] == "draft_review_blocked"
    assert {issue["issue_id"] for issue in submission["issues"]} >= {
        "PACKAGE_VALIDATION_NOT_PASSED",
        "OWNER_CONFIRMATION_REQUIRED",
    }
    assert submission["next_action"]["action_id"] == "return_to_validation_report"


def test_draft_review_submission_blocks_runtime_gate_before_review_queue() -> None:
    submission = _submission(wizard=_wizard(runtime_state="runtime_capability_missing"))

    assert submission["submission_state"] == "runtime_gate_blocked"
    assert submission["runtime_gate"]["runtime_availability_state"] == (
        "runtime_capability_missing"
    )
    assert submission["review_queue_entry"]["queue_state"] == "not_enqueued"
    assert submission["issues"][0]["issue_id"] == "RUNTIME_GATE_NOT_READY"
    assert submission["next_action"]["target_system"] == "agent_runtime"


def test_draft_review_submission_rechecks_placeholder_values() -> None:
    wizard = _wizard()
    wizard["detail_preview"]["summary"] = "TODO: write this later"

    submission = _submission(wizard=wizard)

    assert submission["submission_state"] == "validation_blocked"
    assert any(
        issue["issue_id"] == "PLACEHOLDER_VALUE_BLOCKED"
        for issue in submission["issues"]
    )
    assert submission["review_queue_entry"]["review_status"] == "not_submitted"
