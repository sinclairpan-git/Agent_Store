from agent_store.domain.state_source_guard import StateObservation, resolve_state
from agent_store.domain.status_registry import get_status


def test_status_registry_contains_state_source_guard_fields() -> None:
    status = get_status("PACKAGE_HASH_MISMATCH")

    assert status.source_of_truth
    assert status.entry_evidence
    assert status.conflict_resolution
    assert status.affected_actions
    assert status.return_path


def test_state_source_guard_returns_degraded_when_sources_conflict() -> None:
    decision = resolve_state(
        (
            StateObservation(
                source_of_truth="agent_store",
                state="active",
                entry_evidence=("installation_verified",),
                last_verified_at="2026-05-06T00:00:00Z",
                affected_actions=("actual_l5_display",),
            ),
            StateObservation(
                source_of_truth="agentops",
                state="degraded",
                entry_evidence=("reporter_status_degraded",),
                last_verified_at="2026-05-06T00:00:01Z",
                affected_actions=("actual_l5_display",),
            ),
        )
    )

    assert decision.state == "degraded"
    assert "agent_store=active" in decision.degraded_reason
    assert "agentops=degraded" in decision.degraded_reason
    assert "actual_l5_display" in decision.affected_actions


def test_state_source_guard_keeps_state_when_sources_agree() -> None:
    decision = resolve_state(
        (
            StateObservation(
                source_of_truth="agent_store",
                state="active",
                entry_evidence=("installation_verified",),
                last_verified_at="2026-05-06T00:00:00Z",
            ),
            StateObservation(
                source_of_truth="agentops",
                state="active",
                entry_evidence=("credential_verified",),
                last_verified_at="2026-05-06T00:00:01Z",
            ),
        )
    )

    assert decision.state == "active"
    assert decision.degraded_reason is None
    assert decision.entry_evidence == ("installation_verified", "credential_verified")
