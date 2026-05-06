from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class StateObservation:
    source_of_truth: str
    state: str
    entry_evidence: tuple[str, ...]
    last_verified_at: str
    can_ignore: bool = False
    affected_actions: tuple[str, ...] = ()
    return_path: str = "/official-apps/framework.ai-autosdlc"


@dataclass(frozen=True)
class StateSourceDecision:
    state: str
    degraded_reason: str | None
    source_of_truth: str
    entry_evidence: tuple[str, ...]
    affected_actions: tuple[str, ...]
    return_path: str
    conflict_resolution: str = "show_degraded_when_sources_conflict"

    def to_dict(self) -> dict[str, object]:
        return {
            "state": self.state,
            "degraded_reason": self.degraded_reason,
            "source_of_truth": self.source_of_truth,
            "entry_evidence": list(self.entry_evidence),
            "affected_actions": list(self.affected_actions),
            "return_path": self.return_path,
            "conflict_resolution": self.conflict_resolution,
        }


def resolve_state(observations: tuple[StateObservation, ...]) -> StateSourceDecision:
    if not observations:
        raise ValueError("at least one state observation is required")

    states = {observation.state for observation in observations}
    evidence = tuple(
        item
        for observation in observations
        for item in observation.entry_evidence
        if item
    )
    affected_actions = tuple(
        action
        for observation in observations
        for action in observation.affected_actions
        if action
    )
    if len(states) == 1:
        first = observations[0]
        return StateSourceDecision(
            state=first.state,
            degraded_reason=None,
            source_of_truth=first.source_of_truth,
            entry_evidence=evidence,
            affected_actions=affected_actions,
            return_path=first.return_path,
        )

    return StateSourceDecision(
        state="degraded",
        degraded_reason="state_source_conflict:"
        + ",".join(f"{item.source_of_truth}={item.state}" for item in observations),
        source_of_truth="conflict_guard",
        entry_evidence=evidence,
        affected_actions=affected_actions or ("actual_l5_display",),
        return_path=observations[0].return_path,
    )
