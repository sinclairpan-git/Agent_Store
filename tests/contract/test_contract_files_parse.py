from pathlib import Path

import pytest

from agent_store.contracts.loader import (
    ContractValidationError,
    default_contracts_dir,
    iter_contract_files,
    validate_all_contracts,
    validate_contract_file,
)


def test_all_openapi_contracts_parse_and_have_response_envelopes() -> None:
    contract_files = list(iter_contract_files(default_contracts_dir()))

    assert {path.name for path in contract_files} == {
        "agent-registry.openapi.yaml",
        "agentops-summary.openapi.yaml",
        "installation-bootstrap.openapi.yaml",
        "trusted-evidence-loop.openapi.yaml",
    }
    validate_all_contracts(default_contracts_dir())


def test_contract_validation_rejects_response_without_trace_fields(tmp_path: Path) -> None:
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
