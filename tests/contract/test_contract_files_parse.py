from pathlib import Path

import pytest

from agent_store.contracts.loader import (
    ContractValidationError,
    default_contracts_dir,
    iter_contract_files,
    load_openapi_contract,
    validate_all_contracts,
    validate_contract_file,
)


def test_all_openapi_contracts_parse_and_have_response_envelopes() -> None:
    contract_files = list(iter_contract_files(default_contracts_dir()))

    assert {path.name for path in contract_files} == {
        "agent-registry.openapi.yaml",
        "agentops-summary.openapi.yaml",
        "installation-bootstrap.openapi.yaml",
        "recommendation-state.openapi.yaml",
        "trusted-evidence-loop.openapi.yaml",
    }
    validate_all_contracts(default_contracts_dir())


def test_create_installation_contract_documents_error_responses() -> None:
    contract = load_openapi_contract(
        default_contracts_dir() / "installation-bootstrap.openapi.yaml"
    )
    operation = contract["paths"]["/api/v1/installations"]["post"]
    responses = operation["responses"]

    assert {"201", "400", "403", "404", "409"}.issubset(responses.keys())
    for status_code in ("400", "403", "404", "409"):
        schema = responses[status_code]["content"]["application/json"]["schema"]
        assert schema == {"$ref": "#/components/schemas/ErrorResponse"}


def test_create_agent_draft_contract_documents_conflict_errors() -> None:
    contract = load_openapi_contract(
        default_contracts_dir() / "agent-registry.openapi.yaml"
    )
    operation = contract["paths"]["/api/v1/agents/drafts"]["post"]
    responses = operation["responses"]
    error_codes = contract["components"]["schemas"]["ErrorResponse"]["properties"][
        "error_code"
    ]["enum"]

    assert {"201", "400", "409"}.issubset(responses.keys())
    assert responses["409"]["content"]["application/json"]["schema"] == {
        "$ref": "#/components/schemas/ErrorResponse"
    }
    assert "IDEMPOTENCY_KEY_CONFLICT" in error_codes


def test_installation_assertion_contract_documents_error_responses() -> None:
    contract = load_openapi_contract(
        default_contracts_dir() / "installation-bootstrap.openapi.yaml"
    )
    operation = contract["paths"]["/api/v1/installations/{installation_id}/assertion"][
        "post"
    ]
    responses = operation["responses"]

    assert {"200", "400", "403", "404", "409"}.issubset(responses.keys())
    for status_code in ("400", "403", "404", "409"):
        schema = responses[status_code]["content"]["application/json"]["schema"]
        assert schema == {"$ref": "#/components/schemas/ErrorResponse"}


def test_contract_validation_rejects_response_without_trace_fields(
    tmp_path: Path,
) -> None:
    contract = tmp_path / "broken.openapi.yaml"
    contract.write_text(
        """
openapi: 3.1.0
info:
  title: Broken API
  version: 0.1.0
paths:
  /broken:
    get:
      operationId: getBroken
      responses:
        "200":
          description: Broken
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/BrokenResponse"
components:
  schemas:
    BrokenResponse:
      type: object
      required: [trace_id]
      properties:
        trace_id:
          type: string
""",
        encoding="utf-8",
    )

    with pytest.raises(ContractValidationError, match="error_code"):
        validate_contract_file(contract)
