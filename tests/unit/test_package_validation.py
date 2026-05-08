from agent_store.domain.package_validation import build_package_validation_report


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


def test_package_validation_report_passes_complete_manifest() -> None:
    report = build_package_validation_report(
        _manifest(),
        trace_id="trace-018",
        audit_id="audit-018",
    )

    body = report.to_response()

    assert body["schema_version"] == "agent-store.phase1.v1"
    assert body["error_code"] == "OK"
    assert body["package_validation"]["validation_status"] == "passed"
    assert body["package_validation"]["draft_status"] == "pending_review"
    assert body["package_validation"]["issues"] == []
    assert body["package_validation"]["next_action"]["action_id"] == "submit_for_review"


def test_package_validation_blocks_placeholder_and_missing_owner() -> None:
    manifest = _manifest()
    manifest["display_name"] = "TODO"
    manifest["owner_user"] = ""

    report = build_package_validation_report(
        manifest,
        trace_id="trace-018",
        audit_id="audit-018",
    )
    issues = {
        issue["issue_id"]
        for issue in report.to_response()["package_validation"]["issues"]
    }

    assert report.validation_status == "validation_failed"
    assert "OWNER_USER_REQUIRED" in issues
    assert "PLACEHOLDER_VALUE_BLOCKED" in issues
    assert (
        report.to_response()["package_validation"]["next_action"]["action_id"]
        == "return_to_draft"
    )


def test_package_validation_placeholder_detection_uses_tokens() -> None:
    manifest = _manifest()
    manifest["summary"] = "A methodology assistant for release reviews."

    report = build_package_validation_report(
        manifest,
        trace_id="trace-018",
        audit_id="audit-018",
    )

    assert report.validation_status == "passed"
    assert not any(
        issue.issue_id == "PLACEHOLDER_VALUE_BLOCKED" for issue in report.issues
    )


def test_package_validation_blocks_placeholder_word_token() -> None:
    manifest = _manifest()
    manifest["summary"] = "TODO: describe package before review."

    report = build_package_validation_report(
        manifest,
        trace_id="trace-018",
        audit_id="audit-018",
    )

    assert report.validation_status == "validation_failed"
    assert any(issue.issue_id == "PLACEHOLDER_VALUE_BLOCKED" for issue in report.issues)


def test_package_validation_blocks_embedded_na_placeholder_token() -> None:
    manifest = _manifest()
    manifest["summary"] = "Summary pending, n/a for now."

    report = build_package_validation_report(
        manifest,
        trace_id="trace-018",
        audit_id="audit-018",
    )

    assert report.validation_status == "validation_failed"
    assert any(issue.issue_id == "PLACEHOLDER_VALUE_BLOCKED" for issue in report.issues)


def test_package_validation_fix_prompt_ids_include_field_path() -> None:
    manifest = _manifest()
    manifest["display_name"] = "TODO"
    manifest["summary"] = "TODO: describe package before review."

    report = build_package_validation_report(
        manifest,
        trace_id="trace-018",
        audit_id="audit-018",
    )
    placeholder_prompts = [
        prompt
        for prompt in report.fix_prompts
        if prompt.source_issue_id == "PLACEHOLDER_VALUE_BLOCKED"
    ]
    prompt_ids = {prompt.prompt_id for prompt in placeholder_prompts}

    assert len(placeholder_prompts) == 2
    assert len(prompt_ids) == 2
    assert "fix-placeholder_value_blocked-display-name" in prompt_ids
    assert "fix-placeholder_value_blocked-summary" in prompt_ids


def test_package_validation_requires_high_risk_skill_justification() -> None:
    manifest = _manifest()
    manifest["skills"] = [
        {
            "skill_id": "iam.write",
            "skill_version": "1.0.0",
            "schema_ref": "schemas/iam.write.v1.json",
            "risk_level": "high",
        }
    ]

    report = build_package_validation_report(
        manifest,
        trace_id="trace-018",
        audit_id="audit-018",
    )
    issues = [
        issue.to_dict()
        for issue in report.issues
        if issue.issue_id == "SKILL_RISK_REQUIRED"
    ]

    assert issues
    assert issues[0]["severity"] == "blocked"
    assert issues[0]["field_path"] == "skills[0].risk_justification"


def test_package_validation_reports_incomplete_skill_candidate_fields() -> None:
    manifest = _manifest()
    manifest["skills"] = [{"skill_id": "repo.detect"}]

    report = build_package_validation_report(
        manifest,
        trace_id="trace-018",
        audit_id="audit-018",
    )
    issue_ids = {issue.issue_id for issue in report.issues}

    assert report.validation_status == "fixable"
    assert {
        "SKILL_VERSION_REQUIRED",
        "SKILL_SCHEMA_REQUIRED",
        "SKILL_RISK_LEVEL_REQUIRED",
    }.issubset(issue_ids)


def test_package_validation_keeps_warning_only_reports_review_ready() -> None:
    manifest = _manifest()
    manifest["manifest_lock"] = ""
    manifest["sbom_ref"] = ""
    manifest["scan_report_ref"] = ""

    report = build_package_validation_report(
        manifest,
        trace_id="trace-018",
        audit_id="audit-018",
    )
    body = report.to_response()["package_validation"]

    assert report.validation_status == "passed"
    assert body["draft_status"] == "pending_review"
    assert body["next_action"]["action_id"] == "submit_for_review"
    assert {issue.severity for issue in report.issues} == {"warning"}


def test_package_validation_preserves_original_skill_indexes_in_field_paths() -> None:
    manifest = _manifest()
    manifest["skills"] = [
        "not-a-skill-object",
        {"skill_id": "repo.detect"},
    ]

    report = build_package_validation_report(
        manifest,
        trace_id="trace-018",
        audit_id="audit-018",
    )
    field_paths = {issue.field_path for issue in report.issues}

    assert "skills[1].skill_version" in field_paths
    assert "skills[1].schema_ref" in field_paths
    assert "skills[1].risk_level" in field_paths
    assert "skills[0].skill_version" not in field_paths


def test_package_validation_marks_ai_generated_fields_as_candidate_until_sourced() -> (
    None
):
    manifest = _manifest()
    manifest["ai_generated_fields"] = ["summary"]

    report = build_package_validation_report(
        manifest,
        trace_id="trace-018",
        audit_id="audit-018",
    )

    assert report.validation_status == "validation_failed"
    assert "candidate_only" in report.source_of_truth["ai_generated_fields"]
    assert any(issue.issue_id == "AI_FIELD_SOURCE_REQUIRED" for issue in report.issues)


def test_package_validation_keeps_incomplete_manifest_in_report_shape() -> None:
    report = build_package_validation_report(
        {},
        trace_id="trace-018",
        audit_id="audit-018",
    )
    body = report.to_response()

    assert body["package_validation"]["package_id"] == "candidate-package"
    assert report.validation_status == "validation_failed"
    assert any(issue.issue_id == "AGENT_ID_REQUIRED" for issue in report.issues)
