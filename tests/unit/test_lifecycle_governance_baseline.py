from agent_store.domain.lifecycle_governance import (
    build_lifecycle_governance_baseline,
)


def _version(state: str = "active") -> dict[str, object]:
    return {
        "agent_id": "agent.guided-uploader",
        "version": "0.1.0",
        "artifact_hash": "sha256:guided-uploader",
        "release_status": "manual_installable-preview",
        "lifecycle_state": state,
    }


def _transition(
    action: str,
    *,
    role: str = "owner",
    **overrides: object,
) -> dict[str, object]:
    transition = {
        "transition_action": action,
        "actor_id": "owner@example.com",
        "actor_role": role,
        "reason": "Routine lifecycle governance update.",
        "replacement_version": "0.2.0",
        "affected_installation_count": 3,
        "affected_user_count": 2,
    }
    transition.update(overrides)
    return transition


def _baseline(
    version: dict[str, object] | None = None,
    transition: dict[str, object] | None = None,
) -> dict[str, object]:
    return build_lifecycle_governance_baseline(
        current_version=version or _version(),
        transition=transition or _transition("upgrade"),
        trace_id="trace-031",
        audit_id="audit-031",
    ).to_response()["lifecycle_governance"]


def test_lifecycle_governance_marks_upgrade_available_with_replacement() -> None:
    lifecycle = _baseline()

    assert lifecycle["contract_schema_version"] == "lifecycle_governance_baseline.v1"
    assert lifecycle["lifecycle_state"] == "upgrade_available"
    assert lifecycle["replacement"]["required"] is True
    assert lifecycle["replacement"]["replacement_version"] == "0.2.0"
    assert lifecycle["impact_scope"]["notification_required"] is True
    assert lifecycle["next_action"]["action_id"] == "notify_available_replacement"


def test_lifecycle_governance_requires_rollback_version() -> None:
    lifecycle = _baseline(transition=_transition("rollback", rollback_version=""))

    assert lifecycle["lifecycle_state"] == "active"
    assert lifecycle["issues"][0]["issue_id"] == "ROLLBACK_VERSION_REQUIRED"
    assert lifecycle["next_action"]["action_id"] == "fix_lifecycle_transition"


def test_lifecycle_governance_allows_rollback_with_target_version() -> None:
    lifecycle = _baseline(transition=_transition("rollback", rollback_version="0.0.9"))

    assert lifecycle["lifecycle_state"] == "rollback_available"
    assert lifecycle["rollback"]["required"] is True
    assert lifecycle["rollback"]["rollback_version"] == "0.0.9"


def test_lifecycle_governance_deprecates_with_replacement() -> None:
    lifecycle = _baseline(transition=_transition("deprecate"))

    assert lifecycle["lifecycle_state"] == "deprecated"
    assert lifecycle["replacement"]["replacement_version"] == "0.2.0"
    assert lifecycle["source_of_truth"]["replacement"] == (
        "agent_store_replacement_mapping"
    )


def test_lifecycle_governance_disables_with_impact_scope() -> None:
    lifecycle = _baseline(transition=_transition("disable", replacement_version=""))

    assert lifecycle["lifecycle_state"] == "disabled"
    assert lifecycle["impact_scope"]["impact_required"] is True
    assert lifecycle["impact_scope"]["affected_installation_count"] == 3
    assert lifecycle["next_action"]["action_id"] == "notify_disabled_version"


def test_lifecycle_governance_allows_zero_installation_impact_scope() -> None:
    lifecycle = _baseline(
        transition=_transition(
            "disable",
            replacement_version="",
            affected_installation_count=0,
        )
    )

    assert lifecycle["lifecycle_state"] == "disabled"
    assert lifecycle["issues"] == []
    assert lifecycle["impact_scope"]["affected_installation_count"] == 0
    assert lifecycle["next_action"]["action_id"] == "notify_disabled_version"


def test_lifecycle_governance_rejects_boolean_installation_impact_scope() -> None:
    lifecycle = _baseline(
        transition=_transition(
            "disable",
            replacement_version="",
            affected_installation_count=True,
        )
    )

    assert lifecycle["lifecycle_state"] == "active"
    assert lifecycle["impact_scope"]["affected_installation_count"] == 0
    assert any(
        issue["issue_id"] == "IMPACT_SCOPE_REQUIRED" for issue in lifecycle["issues"]
    )


def test_lifecycle_governance_security_revoke_requires_security_actor_and_evidence() -> (
    None
):
    lifecycle = _baseline(
        transition=_transition("security_revoke", role="owner", replacement_version="")
    )
    issue_ids = {issue["issue_id"] for issue in lifecycle["issues"]}

    assert lifecycle["lifecycle_state"] == "active"
    assert {
        "SECURITY_ACTOR_REQUIRED",
        "SECURITY_EVIDENCE_REQUIRED",
    }.issubset(issue_ids)


def test_lifecycle_governance_security_revoke_is_terminal_signal() -> None:
    lifecycle = _baseline(
        transition=_transition(
            "security_revoke",
            role="security",
            replacement_version="",
            security_evidence_ref="incident://SEC-031",
        )
    )

    assert lifecycle["lifecycle_state"] == "security_revoked"
    assert lifecycle["actor"]["evidence_ref"] == "incident://SEC-031"
    assert lifecycle["next_action"]["target_system"] == "agentops"


def test_lifecycle_governance_blocks_downgrade_from_security_revoked() -> None:
    lifecycle = _baseline(
        version=_version("security_revoked"),
        transition=_transition("deprecate"),
    )

    assert lifecycle["lifecycle_state"] == "security_revoked"
    assert any(
        issue["issue_id"] == "SECURITY_REVOKED_TERMINAL"
        for issue in lifecycle["issues"]
    )
