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


def _runtime(state: str = "runtime_ready") -> dict[str, object]:
    return {
        "availability_state": state,
        "display_name_zh": "可运行",
    }


def _health() -> dict[str, object]:
    return {
        "freshness_state": "health_fresh",
        "display_name_zh": "健康摘要新鲜",
        "recommendation_basis_allowed": False,
    }


def _wizard(
    manifest: dict[str, object] | None = None,
    runtime: dict[str, object] | None = None,
) -> dict[str, object]:
    return build_listing_wizard_shell(
        source={
            "source_id": "repo-release-reviewer",
            "source_type": "git_repository",
            "source_ref": "git@example.com:agent/release-reviewer.git",
        },
        package_manifest=manifest or _manifest(),
        runtime_availability=runtime or _runtime(),
        health_summary_freshness=_health(),
        trace_id="trace-026",
        audit_id="audit-026",
    )["listing_wizard"]


def test_listing_wizard_connects_source_fields_validation_and_preview() -> None:
    wizard = _wizard()

    assert wizard["contract_schema_version"] == "listing_wizard_shell.v1"
    assert wizard["wizard_state"] == "preview_ready"
    assert wizard["source_step"]["source_type"] == "git_repository"
    assert wizard["field_confirmation"]["step_state"] == "confirmed"
    assert wizard["validation_report"]["step_state"] == "passed"
    assert wizard["detail_preview"]["display_name"] == "Guided Uploader"
    assert wizard["detail_preview"]["runtime_availability_state"] == "runtime_ready"
    assert wizard["source_of_truth"]["draft_review"] == "not_submitted_until_027"
    assert wizard["next_action"]["action_id"] == "prepare_draft_review_submission"


def test_listing_wizard_returns_to_field_confirmation_when_required_fields_fail() -> (
    None
):
    manifest = _manifest()
    manifest["owner_user"] = ""

    wizard = _wizard(manifest=manifest)
    owner_field = [
        field
        for field in wizard["field_confirmation"]["fields"]
        if field["field_path"] == "owner_user"
    ][0]

    assert wizard["wizard_state"] == "needs_field_confirmation"
    assert wizard["validation_report"]["step_state"] == "validation_failed"
    assert owner_field["confirmation_state"] == "needs_owner_input"
    assert wizard["next_action"]["action_id"] == "return_to_field_confirmation"


def test_listing_wizard_blocks_preview_when_runtime_gate_is_not_ready() -> None:
    wizard = _wizard(runtime=_runtime("runtime_capability_missing"))
    runtime_step = [
        step for step in wizard["steps"] if step["step_id"] == "runtime_gate"
    ][0]

    assert wizard["wizard_state"] == "runtime_gate_blocked"
    assert runtime_step["step_state"] == "runtime_capability_missing"
    assert wizard["next_action"]["target_system"] == "agent_runtime"
    assert wizard["detail_preview"]["health_recommendation_basis_allowed"] is False
