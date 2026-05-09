from __future__ import annotations

from collections.abc import Mapping

from agent_store import SCHEMA_VERSION
from agent_store.domain.actions import ActionDescriptor
from agent_store.domain.package_validation import build_package_validation_report


LISTING_WIZARD_SCHEMA_VERSION = "listing_wizard_shell.v1"


def _string(value: object) -> str:
    return value.strip() if isinstance(value, str) else ""


def _source_id(source: Mapping[str, object]) -> str:
    return _string(source.get("source_id")) or "manual_manifest_upload"


def _source_type(source: Mapping[str, object]) -> str:
    return _string(source.get("source_type")) or "manifest_upload"


def build_listing_wizard_shell(
    *,
    source: Mapping[str, object],
    package_manifest: Mapping[str, object],
    runtime_availability: Mapping[str, object],
    health_summary_freshness: Mapping[str, object],
    trace_id: str,
    audit_id: str,
) -> dict[str, object]:
    validation = build_package_validation_report(
        package_manifest,
        trace_id=trace_id,
        audit_id=audit_id,
    ).to_dict()
    runtime_state = _string(runtime_availability.get("availability_state"))
    validation_status = _string(validation.get("validation_status"))
    wizard_state = _wizard_state(validation_status, runtime_state)
    next_action = _next_action(wizard_state)
    field_confirmation = _field_confirmation(package_manifest, validation)

    return {
        "schema_version": SCHEMA_VERSION,
        "trace_id": trace_id,
        "error_code": "OK",
        "audit_id": audit_id,
        "listing_wizard": {
            "contract_schema_version": LISTING_WIZARD_SCHEMA_VERSION,
            "wizard_state": wizard_state,
            "source_step": {
                "step_id": "source_selection",
                "step_state": "selected",
                "source_id": _source_id(source),
                "source_type": _source_type(source),
                "source_ref": _string(source.get("source_ref")),
                "next_action": ActionDescriptor(
                    action_id="confirm_listing_fields",
                    target_system="agent_store",
                    enabled=True,
                    requires_permission=True,
                    audit_required=True,
                ).to_dict(),
            },
            "field_confirmation": field_confirmation,
            "validation_report": _validation_report(validation),
            "detail_preview": _detail_preview(
                package_manifest,
                runtime_availability,
                health_summary_freshness,
            ),
            "steps": _steps(
                wizard_state, field_confirmation, validation, runtime_state
            ),
            "source_of_truth": {
                "package_manifest": "agent_store_upload_candidate",
                "field_confirmation": "owner_confirmed_before_review",
                "package_validation": "agent_store_package_validation",
                "runtime_availability": "agent_runtime_echo_or_probe",
                "health_summary": "agentops",
                "draft_review": "not_submitted_until_027",
            },
            "next_action": next_action.to_dict(),
        },
    }


def _wizard_state(validation_status: str, runtime_state: str) -> str:
    if validation_status == "validation_failed":
        return "needs_field_confirmation"
    if validation_status == "fixable":
        return "validation_fix_required"
    if runtime_state != "runtime_ready":
        return "runtime_gate_blocked"
    return "preview_ready"


def _next_action(wizard_state: str) -> ActionDescriptor:
    if wizard_state == "preview_ready":
        return ActionDescriptor(
            action_id="prepare_draft_review_submission",
            target_system="agent_store",
            enabled=True,
            requires_permission=True,
            audit_required=True,
            message_key="listingWizard.actions.prepareDraftReview",
        )
    if wizard_state == "runtime_gate_blocked":
        return ActionDescriptor(
            action_id="resolve_runtime_gate",
            target_system="agent_runtime",
            enabled=True,
            requires_permission=True,
            audit_required=True,
            message_key="listingWizard.actions.resolveRuntimeGate",
        )
    return ActionDescriptor(
        action_id="return_to_field_confirmation",
        target_system="agent_store",
        enabled=True,
        requires_permission=True,
        audit_required=True,
        message_key="listingWizard.actions.returnToFields",
    )


def _field_confirmation(
    package_manifest: Mapping[str, object],
    validation: Mapping[str, object],
) -> dict[str, object]:
    issues = validation.get("issues")
    issue_paths = (
        {
            _string(issue.get("field_path"))
            for issue in issues
            if isinstance(issue, Mapping)
        }
        if isinstance(issues, list)
        else set()
    )
    required_fields = (
        "agent_id",
        "display_name",
        "owner_team",
        "owner_user",
        "version",
        "entrypoint",
    )
    fields = [
        {
            "field_path": field,
            "value": _string(package_manifest.get(field)),
            "confirmation_state": (
                "needs_owner_input" if field in issue_paths else "confirmed"
            ),
            "source": "package_manifest_candidate",
        }
        for field in required_fields
    ]
    return {
        "step_id": "field_confirmation",
        "step_state": (
            "needs_owner_input"
            if any(field["confirmation_state"] != "confirmed" for field in fields)
            else "confirmed"
        ),
        "fields": fields,
    }


def _validation_report(validation: Mapping[str, object]) -> dict[str, object]:
    issues = validation.get("issues")
    fix_prompts = validation.get("fix_prompts")
    return {
        "step_id": "validation_report",
        "step_state": _string(validation.get("validation_status")),
        "package_id": _string(validation.get("package_id")),
        "draft_status": _string(validation.get("draft_status")),
        "issue_count": len(issues) if isinstance(issues, list) else 0,
        "fix_prompt_count": len(fix_prompts) if isinstance(fix_prompts, list) else 0,
        "issues": issues if isinstance(issues, list) else [],
        "next_action": validation.get("next_action") or {},
    }


def _detail_preview(
    package_manifest: Mapping[str, object],
    runtime_availability: Mapping[str, object],
    health_summary_freshness: Mapping[str, object],
) -> dict[str, object]:
    return {
        "step_id": "detail_preview",
        "step_state": "ready",
        "agent_id": _string(package_manifest.get("agent_id")),
        "display_name": _string(package_manifest.get("display_name")),
        "summary": _string(package_manifest.get("summary")),
        "owner_team": _string(package_manifest.get("owner_team")),
        "version": _string(package_manifest.get("version")),
        "runtime_availability_state": _string(
            runtime_availability.get("availability_state")
        ),
        "runtime_display_name_zh": _string(runtime_availability.get("display_name_zh")),
        "health_freshness_state": _string(
            health_summary_freshness.get("freshness_state")
        ),
        "health_recommendation_basis_allowed": bool(
            health_summary_freshness.get("recommendation_basis_allowed")
        ),
    }


def _steps(
    wizard_state: str,
    field_confirmation: Mapping[str, object],
    validation: Mapping[str, object],
    runtime_state: str,
) -> list[dict[str, object]]:
    return [
        {
            "step_id": "source_selection",
            "label": "来源选择",
            "step_state": "completed",
            "owner_system": "agent_store",
        },
        {
            "step_id": "field_confirmation",
            "label": "字段确认",
            "step_state": _string(field_confirmation.get("step_state")),
            "owner_system": "agent_store",
        },
        {
            "step_id": "validation_report",
            "label": "校验报告",
            "step_state": _string(validation.get("validation_status")),
            "owner_system": "agent_store",
        },
        {
            "step_id": "runtime_gate",
            "label": "Runtime Gate",
            "step_state": runtime_state,
            "owner_system": "agent_runtime",
        },
        {
            "step_id": "detail_preview",
            "label": "详情预览",
            "step_state": "ready" if wizard_state == "preview_ready" else "blocked",
            "owner_system": "agent_store",
        },
    ]
