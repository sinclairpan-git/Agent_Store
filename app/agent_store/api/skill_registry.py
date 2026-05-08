from __future__ import annotations

import json
from copy import deepcopy
from collections.abc import Mapping
from uuid import uuid4

from agent_store.domain.errors import ErrorResponse
from agent_store.domain.skill_registry import (
    SkillRegistryDecision,
    SkillRegistryRecord,
    build_skill_publish_decision,
    build_skill_transition_decision,
)


def new_trace_id() -> str:
    return f"trace-{uuid4().hex}"


def _identity(payload: Mapping[str, object]) -> str:
    idempotent_payload = {
        key: value
        for key, value in payload.items()
        if key not in {"trace_id", "audit_id"}
    }
    return json.dumps(
        idempotent_payload,
        sort_keys=True,
        separators=(",", ":"),
        default=str,
    )


def _response_copy(response: Mapping[str, object]) -> dict[str, object]:
    return deepcopy(dict(response))


class SkillRegistryRepository:
    def __init__(self) -> None:
        self._records: dict[tuple[str, str], SkillRegistryRecord] = {}

    def publish(self, record: SkillRegistryRecord) -> None:
        self._records[(record.skill_id, record.skill_version)] = record

    def get(self, skill_id: str, skill_version: str) -> SkillRegistryRecord | None:
        return self._records.get((skill_id, skill_version))

    def save(self, record: SkillRegistryRecord) -> None:
        self._records[(record.skill_id, record.skill_version)] = record


class SkillRegistryAPI:
    def __init__(self, repository: SkillRegistryRepository | None = None) -> None:
        self.repository = repository or SkillRegistryRepository()
        self._idempotency: dict[str, tuple[str, int, dict[str, object]]] = {}

    def publish_skill(
        self,
        payload: object,
        *,
        headers: Mapping[str, str],
    ) -> tuple[int, dict[str, object]]:
        payload_map = _payload_mapping(payload)
        trace_id = _trace_id(payload_map)
        if payload_map is None:
            return _validation_error(
                trace_id,
                recommended_action_id="send_object_request_body",
                details={"reason": "request body must be an object"},
            )

        idempotency_key = _header_value(headers, "Idempotency-Key")
        if not idempotency_key:
            return _idempotency_required(trace_id)
        request_identity = _identity(payload_map)
        cached = self._cached_response(idempotency_key, request_identity, trace_id)
        if cached is not None:
            return cached

        audit_id = str(payload_map.get("audit_id") or f"audit-{uuid4().hex[:12]}")
        decision = build_skill_publish_decision(
            payload_map,
            trace_id=trace_id,
            audit_id=audit_id,
        )
        if decision.issues:
            return self._store_and_return(
                idempotency_key,
                request_identity,
                400,
                _decision_error(trace_id, audit_id, decision),
            )

        assert decision.skill is not None
        existing = self.repository.get(
            decision.skill.skill_id, decision.skill.skill_version
        )
        if existing is not None:
            return self._store_and_return(
                idempotency_key,
                request_identity,
                409,
                ErrorResponse(
                    error_code="SKILL_VERSION_ALREADY_PUBLISHED",
                    message_key="errors.skillVersionAlreadyPublished",
                    severity="blocked",
                    retryable=False,
                    recommended_action_id="publish_new_skill_version",
                    trace_id=trace_id,
                    audit_id=audit_id,
                    details={"registry_key": existing.registry_key},
                ).to_dict(),
            )

        self.repository.publish(decision.skill)
        return self._store_and_return(
            idempotency_key,
            request_identity,
            201,
            decision.to_response(),
        )

    def update_skill_status(
        self,
        skill_id: str,
        skill_version: str,
        payload: object,
        *,
        headers: Mapping[str, str],
    ) -> tuple[int, dict[str, object]]:
        payload_map = _payload_mapping(payload)
        trace_id = _trace_id(payload_map)
        if payload_map is None:
            return _validation_error(
                trace_id,
                recommended_action_id="send_object_request_body",
                details={"reason": "request body must be an object"},
            )

        idempotency_key = _header_value(headers, "Idempotency-Key")
        if not idempotency_key:
            return _idempotency_required(trace_id)
        request_identity = _identity(
            {
                **payload_map,
                "skill_id": skill_id,
                "skill_version": skill_version,
            }
        )
        cached = self._cached_response(idempotency_key, request_identity, trace_id)
        if cached is not None:
            return cached

        audit_id = str(payload_map.get("audit_id") or f"audit-{uuid4().hex[:12]}")
        existing = self.repository.get(skill_id, skill_version)
        if existing is None:
            return self._store_and_return(
                idempotency_key,
                request_identity,
                404,
                ErrorResponse(
                    error_code="SKILL_NOT_FOUND",
                    message_key="errors.skillNotFound",
                    severity="error",
                    retryable=False,
                    recommended_action_id="check_skill_registry_key",
                    trace_id=trace_id,
                    audit_id=audit_id,
                    details={"registry_key": f"{skill_id}@{skill_version}"},
                ).to_dict(),
            )

        decision = build_skill_transition_decision(
            existing,
            payload_map,
            trace_id=trace_id,
            audit_id=audit_id,
        )
        if decision.issues:
            return self._store_and_return(
                idempotency_key,
                request_identity,
                400,
                _decision_error(trace_id, audit_id, decision),
            )

        assert decision.skill is not None
        self.repository.save(decision.skill)
        return self._store_and_return(
            idempotency_key,
            request_identity,
            200,
            decision.to_response(),
        )

    def _cached_response(
        self,
        idempotency_key: str,
        request_identity: str,
        trace_id: str,
    ) -> tuple[int, dict[str, object]] | None:
        if idempotency_key not in self._idempotency:
            return None
        stored_identity, stored_status, stored_response = self._idempotency[
            idempotency_key
        ]
        if stored_identity != request_identity:
            return 409, ErrorResponse(
                error_code="IDEMPOTENCY_KEY_CONFLICT",
                message_key="errors.idempotencyKeyConflict",
                severity="blocked",
                retryable=False,
                recommended_action_id="use_unique_idempotency_key",
                trace_id=trace_id,
            ).to_dict()
        return stored_status, _response_copy(stored_response)

    def _store_and_return(
        self,
        idempotency_key: str,
        request_identity: str,
        status_code: int,
        response: Mapping[str, object],
    ) -> tuple[int, dict[str, object]]:
        self._idempotency[idempotency_key] = (
            request_identity,
            status_code,
            _response_copy(response),
        )
        return status_code, _response_copy(response)


def _payload_mapping(payload: object) -> Mapping[str, object] | None:
    return payload if isinstance(payload, Mapping) else None


def _trace_id(payload: Mapping[str, object] | None) -> str:
    if payload is None:
        return new_trace_id()
    value = payload.get("trace_id")
    if isinstance(value, str) and value.strip():
        return value.strip()
    return new_trace_id()


def _header_value(headers: Mapping[str, str], name: str) -> str | None:
    normalized = name.lower()
    for key, value in headers.items():
        if key.lower() == normalized:
            stripped = value.strip()
            return stripped if stripped else None
    return None


def _idempotency_required(trace_id: str) -> tuple[int, dict[str, object]]:
    return 400, ErrorResponse(
        error_code="VALIDATION_ERROR",
        message_key="errors.idempotencyKeyRequired",
        severity="error",
        retryable=True,
        recommended_action_id="retry_with_idempotency_key",
        trace_id=trace_id,
    ).to_dict()


def _validation_error(
    trace_id: str,
    *,
    recommended_action_id: str,
    details: dict[str, object],
) -> tuple[int, dict[str, object]]:
    return 400, ErrorResponse(
        error_code="VALIDATION_ERROR",
        message_key="errors.validationError",
        severity="error",
        retryable=True,
        recommended_action_id=recommended_action_id,
        trace_id=trace_id,
        details=details,
    ).to_dict()


def _decision_error(
    trace_id: str,
    audit_id: str,
    decision: SkillRegistryDecision,
) -> dict[str, object]:
    return ErrorResponse(
        error_code="VALIDATION_ERROR",
        message_key="errors.skillRegistryValidationFailed",
        severity="blocked",
        retryable=True,
        recommended_action_id=str(decision.next_action["action_id"]),
        trace_id=trace_id,
        audit_id=audit_id,
        details={
            "registry_status": decision.registry_status,
            "issues": [issue.to_dict() for issue in decision.issues],
        },
    ).to_dict()
