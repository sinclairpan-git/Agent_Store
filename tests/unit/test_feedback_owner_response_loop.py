from agent_store.domain.feedback_loop import build_feedback_owner_response_loop


def _feedback(state: str = "submitted") -> dict[str, object]:
    return {
        "feedback_id": "fb-030",
        "agent_id": "agent.guided-uploader",
        "agent_version": "0.1.0",
        "feedback_state": state,
        "title": "Installer smoke test is confusing",
        "feedback_type": "bug",
        "severity": "warning",
        "submitted_by": "user@example.com",
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
        "message": "We reviewed this and will update the installer copy.",
        "occurred_at": "2026-05-09T12:00:00Z",
        "commitment": "next_patch",
    }
    transition.update(overrides)
    return transition


def _loop(
    feedback: dict[str, object], transition: dict[str, object]
) -> dict[str, object]:
    return build_feedback_owner_response_loop(
        feedback=feedback,
        transition=transition,
        trace_id="trace-030",
        audit_id="audit-030",
    ).to_response()["feedback_owner_response_loop"]


def test_feedback_loop_triages_submitted_feedback() -> None:
    loop = _loop(_feedback("submitted"), _transition("triage", role="triage"))

    assert loop["contract_schema_version"] == "feedback_owner_response_loop.v1"
    assert loop["previous_state"] == "submitted"
    assert loop["feedback_state"] == "triaged"
    assert loop["feedback"]["feedback_state"] == "submitted"
    assert loop["next_action"]["action_id"] == "request_owner_response"
    assert loop["issues"] == []
    assert loop["source_of_truth"]["owner_response"] == "agent_store_owner_response"


def test_feedback_loop_requires_owner_for_owner_reply() -> None:
    loop = _loop(_feedback("triaged"), _transition("owner_reply", role="triage"))

    assert loop["feedback_state"] == "triaged"
    assert loop["issues"][0]["issue_id"] == "OWNER_RESPONSE_REQUIRED"
    assert loop["next_action"]["enabled"] is False


def test_feedback_loop_progresses_owner_reply_to_planned_and_fixed() -> None:
    replied = _loop(_feedback("triaged"), _transition("owner_reply"))
    planned = _loop(_feedback("owner_replied"), _transition("plan"))
    fixed = _loop(_feedback("planned"), _transition("fix"))

    assert replied["feedback_state"] == "owner_replied"
    assert planned["feedback_state"] == "planned"
    assert fixed["feedback_state"] == "fixed"
    assert fixed["next_action"]["action_id"] == "attach_release"


def test_feedback_loop_allows_owner_rejection_after_reply() -> None:
    loop = _loop(
        _feedback("owner_replied"),
        _transition("reject", message="Not planned; expected behavior."),
    )

    assert loop["feedback_state"] == "rejected"
    assert loop["owner_response"]["message"] == "Not planned; expected behavior."
    assert loop["next_action"]["action_id"] == "view_feedback_decision"


def test_feedback_loop_requires_release_reference_before_released() -> None:
    loop = _loop(_feedback("fixed"), _transition("release"))

    assert loop["feedback_state"] == "fixed"
    assert loop["issues"][0]["issue_id"] == "RELEASE_LINK_REQUIRED"


def test_feedback_loop_releases_fixed_feedback_with_linkage() -> None:
    loop = _loop(
        _feedback("fixed"),
        _transition(
            "release",
            release_ref="release://agent.guided-uploader/0.1.1",
            release_version="0.1.1",
            released_at="2026-05-09T13:00:00Z",
        ),
    )

    assert loop["feedback_state"] == "released"
    assert loop["release_linkage"]["release_required"] is True
    assert loop["release_linkage"]["release_version"] == "0.1.1"
    assert loop["next_action"]["action_id"] == "view_release_notes"


def test_feedback_loop_blocks_invalid_lifecycle_jump() -> None:
    loop = _loop(_feedback("submitted"), _transition("release"))

    assert loop["feedback_state"] == "submitted"
    assert {issue["issue_id"] for issue in loop["issues"]} >= {
        "INVALID_FEEDBACK_TRANSITION",
        "RELEASE_LINK_REQUIRED",
    }
