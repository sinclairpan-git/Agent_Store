from __future__ import annotations

from collections.abc import Mapping
from uuid import uuid4

from agent_store import SCHEMA_VERSION
from agent_store.domain.errors import ErrorResponse
from agent_store.domain.models import Agent, AgentVersion, OsCompatibility
from agent_store.domain.package_trust import PackageTrustSummary
from agent_store.domain.repositories import (
    AgentRegistryError,
    InMemoryAgentRegistryRepository,
)


def new_trace_id() -> str:
    return f"trace-{uuid4().hex}"


def required_string(payload: Mapping[str, object], field: str) -> str:
    value = payload[field]
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{field} must be a non-empty string")
    return value


class AgentRegistryAPI:
    def __init__(self, repository: InMemoryAgentRegistryRepository | None = None) -> None:
        self.repository = repository or InMemoryAgentRegistryRepository()

    def create_agent_draft(
        self,
        payload: Mapping[str, object],
        *,
        headers: Mapping[str, str],
    ) -> tuple[int, dict[str, object]]:
        trace_id = str(payload.get("trace_id") or new_trace_id())
        idempotency_key = headers.get("Idempotency-Key")
        if not idempotency_key:
            return 400, ErrorResponse(
                error_code="VALIDATION_ERROR",
                message_key="errors.idempotencyKeyRequired",
                severity="error",
                retryable=True,
                recommended_action_id="retry_with_idempotency_key",
                trace_id=trace_id,
            ).to_dict()

        try:
            agent = self._agent_from_payload(payload)
            version = self._version_from_payload(payload)
            record = self.repository.create_draft(
                agent=agent,
                version=version,
                trace_id=trace_id,
                idempotency_key=idempotency_key,
            )
        except AgentRegistryError as exc:
            return exc.status_code, exc.response.to_dict()
        except (KeyError, TypeError, ValueError) as exc:
            return 400, ErrorResponse(
                error_code="VALIDATION_ERROR",
                message_key="errors.validationError",
                severity="error",
                retryable=True,
                recommended_action_id="fix_request",
                trace_id=trace_id,
                details={"reason": str(exc)},
            ).to_dict()

        response = record.to_response()
        trust = payload.get("package_trust_summary")
        if isinstance(trust, Mapping):
            response["agent"]["package_trust_summary"] = dict(trust)  # type: ignore[index]
        else:
            response["agent"]["package_trust_summary"] = PackageTrustSummary.from_version(
                record.version
            ).to_dict()
        return 201, response

    def get_agent_detail(self, agent_id: str) -> tuple[int, dict[str, object]]:
        try:
            record = self.repository.get_agent_detail(agent_id)
        except AgentRegistryError as exc:
            body = exc.response.to_dict()
            body["trace_id"] = new_trace_id()
            return exc.status_code, body

        response = record.to_response()
        response["agent"]["package_trust_summary"] = PackageTrustSummary.from_version(
            record.version
        ).to_dict()
        return 200, response

    @staticmethod
    def _agent_from_payload(payload: Mapping[str, object]) -> Agent:
        supported_os_raw = payload.get("supported_os")
        supported_os: tuple[OsCompatibility, ...] = ()
        if isinstance(supported_os_raw, list):
            supported_os = tuple(
                OsCompatibility(
                    os=required_string(item, "os"),
                    compatibility_status=required_string(item, "compatibility_status"),
                    min_version=item.get("min_version"),
                )
                for item in supported_os_raw
                if isinstance(item, Mapping)
            )
        return Agent(
            agent_id=required_string(payload, "agent_id"),
            display_name=required_string(payload, "display_name"),
            type=required_string(payload, "type"),
            category=str(payload.get("category") or "sdlc_framework"),
            owner_team=str(payload.get("owner_team") or ""),
            owner_user=str(payload.get("owner_user") or ""),
            status=str(payload.get("release_status") or "official_draft"),
            official_flag=bool(payload.get("official_flag", True)),
            summary=str(payload.get("summary") or ""),
            use_cases=tuple(str(item) for item in payload.get("use_cases", ()) or ()),
            supported_os=supported_os,
        )

    @staticmethod
    def _version_from_payload(payload: Mapping[str, object]) -> AgentVersion:
        return AgentVersion(
            agent_id=required_string(payload, "agent_id"),
            version=required_string(payload, "version"),
            artifact_hash=required_string(payload, "artifact_hash"),
            signature=required_string(payload, "signature"),
            issuer=required_string(payload, "issuer"),
            release_status=str(payload.get("release_status") or "official_draft"),
            package_signature=(
                required_string(payload, "package_signature")
                if payload.get("package_signature")
                else None
            ),
            package_id=required_string(payload, "package_id")
            if payload.get("package_id")
            else None,
            key_id=required_string(payload, "key_id") if payload.get("key_id") else None,
        )


def response_envelope_ok(body: Mapping[str, object]) -> bool:
    return all(body.get(field) for field in ("schema_version", "trace_id")) and (
        body.get("error_code") is not None
    ) and body.get("schema_version") == SCHEMA_VERSION
