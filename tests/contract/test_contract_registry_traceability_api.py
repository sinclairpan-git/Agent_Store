from agent_store.api.contract_registry import ContractRegistryTraceabilityAPI
from agent_store.contracts.loader import default_contracts_dir, iter_contract_files


def test_contract_registry_api_returns_traceability_envelope() -> None:
    status, body = ContractRegistryTraceabilityAPI().list_contract_traceability(
        trace_id="trace-registry-api",
        audit_id="audit-registry-api",
    )

    assert status == 200
    assert body["schema_version"] == "agent-store.phase1.v1"
    assert body["trace_id"] == "trace-registry-api"
    assert body["error_code"] == "OK"
    assert body["audit_id"] == "audit-registry-api"

    traceability = body["contract_traceability"]
    assert traceability["contract_schema_version"] == (
        "contract_registry_traceability.v1"
    )
    assert traceability["registry_status"] == "complete"
    assert traceability["coverage_summary"]["unmapped_contracts"] == 0


def test_contract_registry_api_covers_every_openapi_contract_file() -> None:
    status, body = ContractRegistryTraceabilityAPI().list_contract_traceability()

    assert status == 200
    contract_files = {
        path.name for path in iter_contract_files(default_contracts_dir())
    }
    registered_files = {
        entry["contract_file"] for entry in body["contract_traceability"]["contracts"]
    }

    assert registered_files == contract_files


def test_contract_registry_api_documents_required_traceability_axes() -> None:
    status, body = ContractRegistryTraceabilityAPI().list_contract_traceability()

    assert status == 200
    for entry in body["contract_traceability"]["contracts"]:
        assert entry["contract_id"]
        assert entry["contract_file"].endswith(".openapi.yaml")
        assert entry["primary_schema"]
        assert entry["owner"]
        assert entry["producer"]
        assert entry["consumers"]
        assert entry["contract_test_files"]
        assert entry["appendix_anchor"]
