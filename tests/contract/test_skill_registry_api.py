from agent_store.api.agent_registry import response_envelope_ok
from agent_store.api.skill_registry import SkillRegistryAPI


def _payload() -> dict[str, object]:
    return {
        "trace_id": "trace-019",
        "audit_id": "audit-019",
        "approval_status": "approved",
        "package_validation": {"validation_status": "passed"},
        "skill": {
            "skill_id": "repo.detect",
            "skill_version": "1.0.0",
            "schema_ref": "schemas/repo.detect.v1.json",
            "risk_level": "medium",
            "package_id": "pkg-guided-uploader-001",
            "agent_id": "agent.guided-uploader",
            "owner_team": "Agent Platform",
            "owner_user": "owner@example.com",
        },
    }


def test_publish_skill_returns_registry_record_and_agentops_notice() -> None:
    api = SkillRegistryAPI()

    status, body = api.publish_skill(
        _payload(),
        headers={"Idempotency-Key": "skill-019"},
    )
    registry = body["skill_registry"]

    assert status == 201
    assert response_envelope_ok(body)
    assert registry["registry_status"] == "published"
    assert registry["skill"]["registry_key"] == "repo.detect@1.0.0"
    assert registry["event"]["event_type"] == "skill_published"
    assert registry["next_action"]["action_id"] == "notify_agentops_consumers"
    assert registry["agentops_consumption"]["consumer"] == "agentops"


def test_publish_skill_reuses_idempotent_response() -> None:
    api = SkillRegistryAPI()

    status, body = api.publish_skill(
        _payload(),
        headers={"Idempotency-Key": "skill-019"},
    )
    retry_status, retry_body = api.publish_skill(
        _payload(),
        headers={"idempotency-key": "skill-019"},
    )

    assert status == 201
    assert retry_status == 201
    assert retry_body == body
    assert retry_body is not body


def test_publish_skill_rejects_idempotency_conflict() -> None:
    api = SkillRegistryAPI()
    api.publish_skill(_payload(), headers={"Idempotency-Key": "skill-019"})
    changed = _payload()
    changed["skill"]["skill_version"] = "1.1.0"

    status, body = api.publish_skill(
        changed,
        headers={"Idempotency-Key": "skill-019"},
    )

    assert status == 409
    assert response_envelope_ok(body)
    assert body["error_code"] == "IDEMPOTENCY_KEY_CONFLICT"


def test_publish_skill_blocks_unapproved_candidate() -> None:
    api = SkillRegistryAPI()
    payload = _payload()
    payload["approval_status"] = "pending_review"

    status, body = api.publish_skill(
        payload,
        headers={"Idempotency-Key": "skill-019"},
    )
    issue_ids = {issue["issue_id"] for issue in body["details"]["issues"]}

    assert status == 400
    assert response_envelope_ok(body)
    assert body["error_code"] == "VALIDATION_ERROR"
    assert "SKILL_APPROVAL_REQUIRED" in issue_ids


def test_publish_skill_rejects_non_object_request_body() -> None:
    api = SkillRegistryAPI()

    status, body = api.publish_skill(
        [],
        headers={"Idempotency-Key": "skill-019"},
    )

    assert status == 400
    assert response_envelope_ok(body)
    assert body["details"]["reason"] == "request body must be an object"


def test_publish_skill_rejects_blank_idempotency_key() -> None:
    api = SkillRegistryAPI()

    status, body = api.publish_skill(
        _payload(),
        headers={"Idempotency-Key": "   "},
    )

    assert status == 400
    assert response_envelope_ok(body)
    assert body["message_key"] == "errors.idempotencyKeyRequired"


def test_publish_skill_rejects_duplicate_version_with_new_idempotency_key() -> None:
    api = SkillRegistryAPI()
    api.publish_skill(_payload(), headers={"Idempotency-Key": "skill-019"})

    status, body = api.publish_skill(
        _payload(),
        headers={"Idempotency-Key": "skill-019-duplicate"},
    )

    assert status == 409
    assert response_envelope_ok(body)
    assert body["error_code"] == "SKILL_VERSION_ALREADY_PUBLISHED"


def test_deprecate_skill_updates_registry_and_emits_notice() -> None:
    api = SkillRegistryAPI()
    api.publish_skill(_payload(), headers={"Idempotency-Key": "skill-019-publish"})

    status, body = api.update_skill_status(
        "repo.detect",
        "1.0.0",
        {"transition_action": "deprecate", "reason": "Superseded by v1.1.0"},
        headers={"Idempotency-Key": "skill-019-deprecate"},
    )
    registry = body["skill_registry"]

    assert status == 200
    assert response_envelope_ok(body)
    assert registry["registry_status"] == "deprecated"
    assert registry["skill"]["status"] == "deprecated"
    assert registry["event"]["event_type"] == "skill_deprecated"
    assert registry["agentops_consumption"]["sync_status"] == "notice_required"


def test_publish_and_transition_idempotency_keys_are_scoped_by_operation() -> None:
    api = SkillRegistryAPI()
    shared_key = "skill-019-shared-client-key"

    publish_status, publish_body = api.publish_skill(
        _payload(),
        headers={"Idempotency-Key": shared_key},
    )
    transition_status, transition_body = api.update_skill_status(
        "repo.detect",
        "1.0.0",
        {"transition_action": "deprecate", "reason": "Superseded by v1.1.0"},
        headers={"Idempotency-Key": shared_key},
    )

    assert publish_status == 201
    assert publish_body["skill_registry"]["registry_status"] == "published"
    assert transition_status == 200
    assert transition_body["skill_registry"]["registry_status"] == "deprecated"


def test_transition_returns_not_found_for_unknown_skill_version() -> None:
    api = SkillRegistryAPI()

    status, body = api.update_skill_status(
        "repo.detect",
        "9.9.9",
        {"transition_action": "deprecate", "reason": "Missing"},
        headers={"Idempotency-Key": "skill-019-missing"},
    )

    assert status == 404
    assert response_envelope_ok(body)
    assert body["error_code"] == "SKILL_NOT_FOUND"


def test_transition_not_found_does_not_poison_idempotent_retry() -> None:
    api = SkillRegistryAPI()
    transition = {
        "transition_action": "deprecate",
        "reason": "Superseded by v1.1.0",
    }

    missing_status, missing_body = api.update_skill_status(
        "repo.detect",
        "1.0.0",
        transition,
        headers={"Idempotency-Key": "skill-019-eventual-transition"},
    )
    api.publish_skill(_payload(), headers={"Idempotency-Key": "skill-019-publish"})
    retry_status, retry_body = api.update_skill_status(
        "repo.detect",
        "1.0.0",
        transition,
        headers={"Idempotency-Key": "skill-019-eventual-transition"},
    )

    assert missing_status == 404
    assert missing_body["error_code"] == "SKILL_NOT_FOUND"
    assert retry_status == 200
    assert retry_body["skill_registry"]["registry_status"] == "deprecated"


def test_security_revocation_requires_evidence_ref() -> None:
    api = SkillRegistryAPI()
    api.publish_skill(_payload(), headers={"Idempotency-Key": "skill-019-publish"})

    status, body = api.update_skill_status(
        "repo.detect",
        "1.0.0",
        {"transition_action": "security_revoke", "reason": "Unsafe schema"},
        headers={"Idempotency-Key": "skill-019-revoke"},
    )
    issue_ids = {issue["issue_id"] for issue in body["details"]["issues"]}

    assert status == 400
    assert response_envelope_ok(body)
    assert "SECURITY_EVIDENCE_REQUIRED" in issue_ids


def test_security_revocation_emits_agentops_notice() -> None:
    api = SkillRegistryAPI()
    api.publish_skill(_payload(), headers={"Idempotency-Key": "skill-019-publish"})

    status, body = api.update_skill_status(
        "repo.detect",
        "1.0.0",
        {
            "transition_action": "security_revoke",
            "reason": "Unsafe schema",
            "security_evidence_ref": "incident://SEC-019",
        },
        headers={"Idempotency-Key": "skill-019-revoke"},
    )
    registry = body["skill_registry"]

    assert status == 200
    assert response_envelope_ok(body)
    assert registry["registry_status"] == "security_revoked"
    assert registry["event"]["event_type"] == "skill_security_revoked"
    assert registry["event"]["evidence_ref"] == "incident://SEC-019"
    assert registry["next_action"]["action_id"] == "notify_agentops_security_revocation"


def test_security_revocation_accepts_contract_evidence_ref() -> None:
    api = SkillRegistryAPI()
    api.publish_skill(_payload(), headers={"Idempotency-Key": "skill-019-publish"})

    status, body = api.update_skill_status(
        "repo.detect",
        "1.0.0",
        {
            "transition_action": "security_revoke",
            "reason": "Unsafe schema",
            "evidence_ref": "incident://SEC-019-contract",
        },
        headers={"Idempotency-Key": "skill-019-revoke-contract"},
    )
    registry = body["skill_registry"]

    assert status == 200
    assert response_envelope_ok(body)
    assert registry["registry_status"] == "security_revoked"
    assert registry["event"]["event_type"] == "skill_security_revoked"
    assert registry["event"]["evidence_ref"] == "incident://SEC-019-contract"
