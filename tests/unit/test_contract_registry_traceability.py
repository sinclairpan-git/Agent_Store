from agent_store.domain.contract_registry import (
    CONTRACT_REGISTRY_TRACEABILITY_SCHEMA_VERSION,
    build_contract_registry_traceability,
)


def test_contract_registry_traceability_is_complete() -> None:
    registry = build_contract_registry_traceability(
        trace_id="trace-contract-registry",
        audit_id="audit-contract-registry",
    )

    response = registry.to_response()
    traceability = response["contract_traceability"]

    assert response["schema_version"] == "agent-store.phase1.v1"
    assert response["error_code"] == "OK"
    assert (
        traceability["contract_schema_version"]
        == CONTRACT_REGISTRY_TRACEABILITY_SCHEMA_VERSION
    )
    assert traceability["registry_status"] == "complete"
    assert traceability["coverage_summary"] == {
        "total_contracts": 20,
        "contracts_with_cct": 13,
        "contracts_with_contract_tests": 20,
        "complete_traceability": 20,
        "unmapped_contracts": 0,
    }
    assert traceability["next_action"]["action_id"] == (
        "continue_contract_change_review"
    )


def test_contract_registry_entry_documents_producer_consumer_owner_and_tests() -> None:
    registry = build_contract_registry_traceability(
        trace_id="trace-contract-registry",
        audit_id="audit-contract-registry",
    )
    entries = {
        entry["contract_id"]: entry
        for entry in registry.to_response()["contract_traceability"]["contracts"]
    }

    lifecycle = entries["lifecycle_governance_baseline.v1"]
    assert lifecycle["owner"] == "Agent Store"
    assert lifecycle["producer"] == "Agent Store"
    assert "AgentOps" in lifecycle["consumers"]
    assert lifecycle["cct_ids"] == ["CCT-016"]
    assert (
        "tests/contract/test_lifecycle_governance_api.py"
        in lifecycle["contract_test_files"]
    )

    registry_entry = entries["contract_registry_traceability.v1"]
    assert registry_entry["contract_file"] == (
        "contract-registry-traceability.openapi.yaml"
    )
    assert registry_entry["cct_ids"] == ["CCT-017"]
    assert "Agent Runtime" in registry_entry["consumers"]
