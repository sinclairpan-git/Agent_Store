from __future__ import annotations

from uuid import uuid4

from agent_store.domain.contract_registry import (
    build_contract_registry_traceability,
)


def new_trace_id() -> str:
    return f"trace-{uuid4().hex}"


class ContractRegistryTraceabilityAPI:
    def list_contract_traceability(
        self,
        *,
        trace_id: str | None = None,
        audit_id: str | None = None,
    ) -> tuple[int, dict[str, object]]:
        response = build_contract_registry_traceability(
            trace_id=_value_or_generated(trace_id, new_trace_id()),
            audit_id=_value_or_generated(audit_id, f"audit-{uuid4().hex[:12]}"),
        ).to_response()
        return 200, response


def _value_or_generated(value: str | None, generated: str) -> str:
    if isinstance(value, str) and value.strip():
        return value.strip()
    return generated
