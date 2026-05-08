from agent_store.domain.skill_registry import (
    SkillRegistryRecord,
    build_skill_publish_decision,
    build_skill_transition_decision,
)


def _skill() -> dict[str, object]:
    return {
        "skill_id": "repo.detect",
        "skill_version": "1.0.0",
        "schema_ref": "schemas/repo.detect.v1.json",
        "risk_level": "medium",
        "package_id": "pkg-guided-uploader-001",
        "agent_id": "agent.guided-uploader",
        "owner_team": "Agent Platform",
        "owner_user": "owner@example.com",
    }


def _publish_payload() -> dict[str, object]:
    return {
        "approval_status": "approved",
        "package_validation": {"validation_status": "passed"},
        "skill": _skill(),
    }


def test_skill_registry_publish_decision_creates_agentops_consumable_record() -> None:
    decision = build_skill_publish_decision(
        _publish_payload(),
        trace_id="trace-019",
        audit_id="audit-019",
    )

    assert decision.registry_status == "published"
    assert decision.skill is not None
    assert decision.skill.registry_key == "repo.detect@1.0.0"
    assert decision.next_action["action_id"] == "notify_agentops_consumers"
    assert decision.agentops_consumption["sync_status"] == "ready_for_consumption"
    assert decision.source_of_truth["skill_registry"] == "agent_store"


def test_skill_registry_publish_requires_approval_and_passed_validation() -> None:
    payload = _publish_payload()
    payload["approval_status"] = "pending_review"
    payload["package_validation"] = {"validation_status": "validation_failed"}

    decision = build_skill_publish_decision(
        payload,
        trace_id="trace-019",
        audit_id="audit-019",
    )
    issue_ids = {issue.issue_id for issue in decision.issues}

    assert decision.registry_status == "registration_blocked"
    assert "SKILL_APPROVAL_REQUIRED" in issue_ids
    assert "PACKAGE_VALIDATION_NOT_PASSED" in issue_ids
    assert decision.agentops_consumption["sync_status"] == "not_ready"


def test_skill_registry_publish_requires_high_risk_justification() -> None:
    payload = _publish_payload()
    payload["skill"]["risk_level"] = "high"

    decision = build_skill_publish_decision(
        payload,
        trace_id="trace-019",
        audit_id="audit-019",
    )

    assert decision.registry_status == "registration_blocked"
    assert any(issue.issue_id == "SKILL_RISK_REQUIRED" for issue in decision.issues)


def test_skill_registry_deprecates_published_skill_with_notice() -> None:
    record = SkillRegistryRecord(
        skill_id="repo.detect",
        skill_version="1.0.0",
        schema_ref="schemas/repo.detect.v1.json",
        risk_level="medium",
        package_id="pkg-guided-uploader-001",
        agent_id="agent.guided-uploader",
        owner_team="Agent Platform",
        owner_user="owner@example.com",
        status="published",
        status_reason="Published after approved Package Validation.",
    )

    decision = build_skill_transition_decision(
        record,
        {"transition_action": "deprecate", "reason": "Superseded by v1.1.0"},
        trace_id="trace-019",
        audit_id="audit-019",
    )

    assert decision.registry_status == "deprecated"
    assert decision.skill is not None
    assert decision.skill.status == "deprecated"
    assert decision.event is not None
    assert decision.event.event_type == "skill_deprecated"
    assert decision.next_action["action_id"] == "notify_agentops_deprecation"


def test_skill_registry_security_revoke_requires_evidence() -> None:
    record = SkillRegistryRecord(
        skill_id="repo.detect",
        skill_version="1.0.0",
        schema_ref="schemas/repo.detect.v1.json",
        risk_level="medium",
        package_id="pkg-guided-uploader-001",
        agent_id="agent.guided-uploader",
        owner_team="Agent Platform",
        owner_user="owner@example.com",
        status="published",
        status_reason="Published after approved Package Validation.",
    )

    decision = build_skill_transition_decision(
        record,
        {"transition_action": "security_revoke", "reason": "Unsafe output schema"},
        trace_id="trace-019",
        audit_id="audit-019",
    )

    assert decision.registry_status == "transition_blocked"
    assert any(
        issue.issue_id == "SECURITY_EVIDENCE_REQUIRED" for issue in decision.issues
    )


def test_skill_registry_security_revoke_accepts_contract_evidence_ref() -> None:
    record = SkillRegistryRecord(
        skill_id="repo.detect",
        skill_version="1.0.0",
        schema_ref="schemas/repo.detect.v1.json",
        risk_level="medium",
        package_id="pkg-guided-uploader-001",
        agent_id="agent.guided-uploader",
        owner_team="Agent Platform",
        owner_user="owner@example.com",
        status="published",
        status_reason="Published after approved Package Validation.",
    )

    decision = build_skill_transition_decision(
        record,
        {
            "transition_action": "security_revoke",
            "reason": "Unsafe output schema",
            "evidence_ref": "incident://SEC-019",
        },
        trace_id="trace-019",
        audit_id="audit-019",
    )

    assert decision.registry_status == "security_revoked"
    assert not decision.issues
    assert decision.event is not None
    assert decision.event.evidence_ref == "incident://SEC-019"


def test_skill_registry_security_revoked_is_terminal() -> None:
    record = SkillRegistryRecord(
        skill_id="repo.detect",
        skill_version="1.0.0",
        schema_ref="schemas/repo.detect.v1.json",
        risk_level="medium",
        package_id="pkg-guided-uploader-001",
        agent_id="agent.guided-uploader",
        owner_team="Agent Platform",
        owner_user="owner@example.com",
        status="security_revoked",
        status_reason="Unsafe schema",
    )

    decision = build_skill_transition_decision(
        record,
        {"transition_action": "deprecate", "reason": "Try weaker state"},
        trace_id="trace-019",
        audit_id="audit-019",
    )

    assert decision.registry_status == "transition_blocked"
    assert any(
        issue.issue_id == "SKILL_SECURITY_REVOKED_TERMINAL" for issue in decision.issues
    )


def test_skill_registry_security_revoke_can_reassert_terminal_status() -> None:
    record = SkillRegistryRecord(
        skill_id="repo.detect",
        skill_version="1.0.0",
        schema_ref="schemas/repo.detect.v1.json",
        risk_level="medium",
        package_id="pkg-guided-uploader-001",
        agent_id="agent.guided-uploader",
        owner_team="Agent Platform",
        owner_user="owner@example.com",
        status="security_revoked",
        status_reason="Unsafe schema",
    )

    decision = build_skill_transition_decision(
        record,
        {
            "transition_action": "security_revoke",
            "reason": "Reassert unsafe schema",
            "evidence_ref": "incident://SEC-019-retry",
        },
        trace_id="trace-019",
        audit_id="audit-019",
    )

    assert decision.registry_status == "security_revoked"
    assert not decision.issues
    assert decision.skill is not None
    assert decision.skill.status == "security_revoked"
    assert decision.event is not None
    assert decision.event.evidence_ref == "incident://SEC-019-retry"
