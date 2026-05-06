from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable, Mapping

import yaml


RESPONSE_ENVELOPE_FIELDS = frozenset({"schema_version", "trace_id", "error_code"})


class ContractValidationError(ValueError):
    """Raised when a checked OpenAPI contract violates phase 1 gates."""


@dataclass(frozen=True)
class ResponseEnvelopeCheck:
    contract_path: Path
    operation_id: str
    status_code: str
    schema_name: str
    required_fields: frozenset[str]


def default_contracts_dir() -> Path:
    repo_root = Path(__file__).resolve().parents[3]
    return repo_root / "specs" / "001-agent-store-phase1-trusted-min-loop" / "contracts"


def iter_contract_files(root: Path | None = None) -> Iterable[Path]:
    contracts_root = root or default_contracts_dir()
    return sorted(contracts_root.glob("*.openapi.yaml"))


def load_openapi_contract(path: Path) -> Mapping[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        document = yaml.safe_load(handle)
    if not isinstance(document, Mapping):
        raise ContractValidationError(f"{path} did not parse to a mapping")
    if not str(document.get("openapi", "")).startswith("3."):
        raise ContractValidationError(f"{path} is not an OpenAPI 3 contract")
    return document


def resolve_local_ref(document: Mapping[str, Any], ref: str) -> tuple[str, Mapping[str, Any]]:
    if not ref.startswith("#/"):
        raise ContractValidationError(f"only local OpenAPI refs are supported: {ref}")

    current: Any = document
    for segment in ref.removeprefix("#/").split("/"):
        if not isinstance(current, Mapping) or segment not in current:
            raise ContractValidationError(f"unresolvable OpenAPI ref: {ref}")
        current = current[segment]

    if not isinstance(current, Mapping):
        raise ContractValidationError(f"OpenAPI ref does not resolve to a schema: {ref}")
    return ref.rsplit("/", maxsplit=1)[-1], current


def resolve_schema(document: Mapping[str, Any], schema: Mapping[str, Any]) -> tuple[str, Mapping[str, Any]]:
    ref = schema.get("$ref")
    if isinstance(ref, str):
        return resolve_local_ref(document, ref)
    return "<inline>", schema


def response_json_schema(response: Mapping[str, Any]) -> Mapping[str, Any] | None:
    content = response.get("content")
    if not isinstance(content, Mapping):
        return None
    media_type = content.get("application/json")
    if not isinstance(media_type, Mapping):
        return None
    schema = media_type.get("schema")
    if not isinstance(schema, Mapping):
        return None
    return schema


def iter_response_schemas(path: Path) -> Iterable[ResponseEnvelopeCheck]:
    document = load_openapi_contract(path)
    paths = document.get("paths", {})
    if not isinstance(paths, Mapping):
        raise ContractValidationError(f"{path} has no paths mapping")

    for _route, route_item in paths.items():
        if not isinstance(route_item, Mapping):
            continue
        for method, operation in route_item.items():
            if method.lower() not in {"get", "post", "put", "patch", "delete"}:
                continue
            if not isinstance(operation, Mapping):
                continue
            operation_id = str(operation.get("operationId", f"{method} <unknown>"))
            responses = operation.get("responses", {})
            if not isinstance(responses, Mapping):
                raise ContractValidationError(f"{path}:{operation_id} has no responses mapping")
            for status_code, response in responses.items():
                if not isinstance(response, Mapping):
                    continue
                schema = response_json_schema(response)
                if schema is None:
                    continue
                schema_name, resolved = resolve_schema(document, schema)
                required = resolved.get("required", [])
                if not isinstance(required, list):
                    raise ContractValidationError(
                        f"{path}:{operation_id}:{status_code} required must be a list"
                    )
                yield ResponseEnvelopeCheck(
                    contract_path=path,
                    operation_id=operation_id,
                    status_code=str(status_code),
                    schema_name=schema_name,
                    required_fields=frozenset(str(field) for field in required),
                )


def validate_response_envelopes(path: Path) -> list[str]:
    failures: list[str] = []
    checked_any = False
    for check in iter_response_schemas(path):
        checked_any = True
        missing = RESPONSE_ENVELOPE_FIELDS - check.required_fields
        if missing:
            fields = ", ".join(sorted(missing))
            failures.append(
                f"{check.contract_path.name}:{check.operation_id}:{check.status_code}:"
                f"{check.schema_name} missing {fields}"
            )

    if not checked_any:
        failures.append(f"{path.name}: no JSON response schemas found")
    return failures


def validate_contract_file(path: Path) -> None:
    failures = validate_response_envelopes(path)
    if failures:
        raise ContractValidationError("; ".join(failures))


def validate_all_contracts(root: Path | None = None) -> None:
    files = list(iter_contract_files(root))
    if not files:
        raise ContractValidationError("no OpenAPI contract files found")
    failures: list[str] = []
    for path in files:
        failures.extend(validate_response_envelopes(path))
    if failures:
        raise ContractValidationError("; ".join(failures))
