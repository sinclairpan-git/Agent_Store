import pytest

from agent_store.domain.status_registry import (
    StatusPresentation,
    all_statuses,
    assert_statuses_registered,
    get_status,
)


REQUIRED_STATUSES = {
    "AGENT_OWNER_REQUIRED",
    "PACKAGE_HASH_MISMATCH",
    "INSTALLATION_ASSERTION_EXPIRED",
    "STANDALONE_OVERCOUPLED",
    "APPROVAL_EXPIRED",
}


def test_critical_statuses_are_registered() -> None:
    assert_statuses_registered(REQUIRED_STATUSES)
    assert {status.machine_value for status in all_statuses()} >= REQUIRED_STATUSES


@pytest.mark.parametrize("machine_value", sorted(REQUIRED_STATUSES))
def test_status_presentations_have_required_display_fields(machine_value: str) -> None:
    status = get_status(machine_value)

    assert isinstance(status, StatusPresentation)
    assert status.display_name
    assert status.plain_language_explanation
    assert status.primary_action.action_id
    assert status.secondary_action is None or status.secondary_action.action_id
    assert status.owner_system
