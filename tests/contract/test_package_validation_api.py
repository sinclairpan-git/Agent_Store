from agent_store.api.agent_registry import response_envelope_ok
from agent_store.api.package_validation import PackageValidationAPI


def _payload() -> dict[str, object]:
    return {
        "trace_id": "trace-package-018",
        "audit_id": "audit-package-018",
        "package_manifest": {
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
        },
    }


def test_validate_package_returns_review_ready_report() -> None:
    api = PackageValidationAPI()

    status, body = api.validate_package(
        _payload(),
        headers={"Idempotency-Key": "pkg-018"},
    )

    assert status == 200
    assert response_envelope_ok(body)
    assert body["package_validation"]["validation_status"] == "passed"
    assert body["package_validation"]["draft_status"] == "pending_review"
    assert body["package_validation"]["next_action"]["action_id"] == "submit_for_review"


def test_validate_package_accepts_case_insensitive_idempotency_header() -> None:
    api = PackageValidationAPI()

    status, body = api.validate_package(
        _payload(),
        headers={"idempotency-key": "pkg-018"},
    )

    assert status == 200
    assert response_envelope_ok(body)
    assert body["package_validation"]["validation_status"] == "passed"


def test_validate_package_rejects_blank_idempotency_header() -> None:
    api = PackageValidationAPI()

    status, body = api.validate_package(
        _payload(),
        headers={"Idempotency-Key": "   "},
    )

    assert status == 400
    assert response_envelope_ok(body)
    assert body["error_code"] == "VALIDATION_ERROR"
    assert body["message_key"] == "errors.idempotencyKeyRequired"


def test_validate_package_returns_field_level_fix_prompts() -> None:
    api = PackageValidationAPI()
    payload = _payload()
    payload["package_manifest"]["skills"] = [
        {"skill_id": "iam.write", "skill_version": "1.0.0", "risk_level": "high"}
    ]

    status, body = api.validate_package(
        payload,
        headers={"Idempotency-Key": "pkg-018"},
    )
    issues = body["package_validation"]["issues"]
    prompts = body["package_validation"]["fix_prompts"]

    assert status == 200
    assert body["package_validation"]["validation_status"] == "validation_failed"
    assert {issue["issue_id"] for issue in issues} >= {
        "SKILL_SCHEMA_REQUIRED",
        "SKILL_RISK_REQUIRED",
    }
    assert all(prompt["target_field"] for prompt in prompts)
    assert body["package_validation"]["source_of_truth"]["skill_registry"] == (
        "agent_store_skill_registry_pending"
    )


def test_validate_package_reuses_idempotent_result() -> None:
    api = PackageValidationAPI()

    status, body = api.validate_package(
        _payload(),
        headers={"Idempotency-Key": "pkg-018"},
    )
    retry_status, retry_body = api.validate_package(
        _payload(),
        headers={"Idempotency-Key": "pkg-018"},
    )

    assert status == 200
    assert retry_status == 200
    assert retry_body == body


def test_validate_package_returns_defensive_idempotency_copies() -> None:
    api = PackageValidationAPI()

    status, body = api.validate_package(
        _payload(),
        headers={"Idempotency-Key": "pkg-018"},
    )
    body["package_validation"]["validation_status"] = "tampered"
    retry_status, retry_body = api.validate_package(
        _payload(),
        headers={"Idempotency-Key": "pkg-018"},
    )

    assert status == 200
    assert retry_status == 200
    assert retry_body is not body
    assert retry_body["package_validation"]["validation_status"] == "passed"


def test_validate_package_idempotency_ignores_observability_fields() -> None:
    api = PackageValidationAPI()

    status, body = api.validate_package(
        _payload(),
        headers={"Idempotency-Key": "pkg-018"},
    )
    retry = _payload()
    retry["trace_id"] = "trace-package-retry"
    retry["audit_id"] = "audit-package-retry"
    retry_status, retry_body = api.validate_package(
        retry,
        headers={"Idempotency-Key": "pkg-018"},
    )

    assert status == 200
    assert retry_status == 200
    assert retry_body == body


def test_validate_package_rejects_idempotency_conflict() -> None:
    api = PackageValidationAPI()
    api.validate_package(_payload(), headers={"Idempotency-Key": "pkg-018"})
    changed = _payload()
    changed["package_manifest"]["version"] = "0.2.0"

    status, body = api.validate_package(
        changed,
        headers={"Idempotency-Key": "pkg-018"},
    )

    assert status == 409
    assert response_envelope_ok(body)
    assert body["error_code"] == "IDEMPOTENCY_KEY_CONFLICT"


def test_validate_package_requires_manifest_object() -> None:
    api = PackageValidationAPI()

    status, body = api.validate_package(
        {"package_manifest": None, "trace_id": "trace-package-018"},
        headers={"Idempotency-Key": "pkg-018"},
    )

    assert status == 400
    assert response_envelope_ok(body)
    assert body["error_code"] == "VALIDATION_ERROR"


def test_validate_package_rejects_non_object_request_body() -> None:
    api = PackageValidationAPI()

    status, body = api.validate_package(
        [],
        headers={"Idempotency-Key": "pkg-018"},
    )

    assert status == 400
    assert response_envelope_ok(body)
    assert body["error_code"] == "VALIDATION_ERROR"
    assert body["details"]["reason"] == "request body must be an object"
