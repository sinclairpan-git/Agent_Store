from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

from agent_store import SCHEMA_VERSION

from .actions import ActionDescriptor


CONTRACT_REGISTRY_TRACEABILITY_SCHEMA_VERSION = "contract_registry_traceability.v1"


@dataclass(frozen=True)
class ContractTraceabilityEntry:
    contract_id: str
    contract_file: str
    primary_schema: str
    owner: str
    producer: str
    consumers: tuple[str, ...]
    cct_ids: tuple[str, ...]
    contract_test_files: tuple[str, ...]
    appendix_anchor: str

    def __post_init__(self) -> None:
        if not self.contract_id:
            raise ValueError("contract_id is required")
        if not self.contract_file.endswith(".openapi.yaml"):
            raise ValueError("contract_file must be an OpenAPI yaml file")
        if not self.owner:
            raise ValueError("owner is required")
        if not self.producer:
            raise ValueError("producer is required")
        if not self.consumers:
            raise ValueError("at least one consumer is required")
        if not self.contract_test_files:
            raise ValueError("at least one contract test file is required")

    def to_dict(self) -> dict[str, object]:
        return {
            "contract_id": self.contract_id,
            "contract_file": self.contract_file,
            "primary_schema": self.primary_schema,
            "owner": self.owner,
            "producer": self.producer,
            "consumers": list(self.consumers),
            "cct_ids": list(self.cct_ids),
            "contract_test_files": list(self.contract_test_files),
            "appendix_anchor": self.appendix_anchor,
        }


@dataclass(frozen=True)
class ContractRegistryTraceability:
    trace_id: str
    audit_id: str
    entries: tuple[ContractTraceabilityEntry, ...]

    def to_response(self) -> dict[str, object]:
        return {
            "schema_version": SCHEMA_VERSION,
            "trace_id": self.trace_id,
            "error_code": "OK",
            "audit_id": self.audit_id,
            "contract_traceability": self.to_dict(),
        }

    def to_dict(self) -> dict[str, object]:
        return {
            "contract_schema_version": CONTRACT_REGISTRY_TRACEABILITY_SCHEMA_VERSION,
            "registry_status": self.registry_status,
            "contracts": [entry.to_dict() for entry in self.entries],
            "coverage_summary": self.coverage_summary,
            "source_of_truth": {
                "contract_files": "specs/001-agent-store-phase1-trusted-min-loop/contracts",
                "appendix": "docs/cross-project-contract-appendix.md",
                "contract_tests": "tests/contract",
                "registry_projection": "agent_store",
            },
            "next_action": self.next_action.to_dict(),
        }

    @property
    def registry_status(self) -> str:
        return (
            "complete"
            if self.coverage_summary["unmapped_contracts"] == 0
            else "incomplete"
        )

    @property
    def coverage_summary(self) -> dict[str, int]:
        total = len(self.entries)
        with_cct = sum(1 for entry in self.entries if entry.cct_ids)
        with_tests = sum(1 for entry in self.entries if entry.contract_test_files)
        complete = sum(
            1
            for entry in self.entries
            if entry.owner
            and entry.producer
            and entry.consumers
            and entry.contract_test_files
        )
        return {
            "total_contracts": total,
            "contracts_with_cct": with_cct,
            "contracts_with_contract_tests": with_tests,
            "complete_traceability": complete,
            "unmapped_contracts": total - complete,
        }

    @property
    def next_action(self) -> ActionDescriptor:
        if self.registry_status == "complete":
            return ActionDescriptor(
                action_id="continue_contract_change_review",
                target_system="agent_store",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                message_key="contractRegistry.actions.continueContractChangeReview",
            )
        return ActionDescriptor(
            action_id="complete_contract_traceability",
            target_system="agent_store",
            enabled=True,
            requires_permission=True,
            audit_required=True,
            message_key="contractRegistry.actions.completeTraceability",
        )


def build_contract_registry_traceability(
    *,
    trace_id: str,
    audit_id: str,
) -> ContractRegistryTraceability:
    return ContractRegistryTraceability(
        trace_id=trace_id,
        audit_id=audit_id,
        entries=tuple(_traceability_entries()),
    )


def _traceability_entries() -> Iterable[ContractTraceabilityEntry]:
    data = (
        (
            "agent_manifest_runtime_contract.v1",
            "agent-manifest-runtime.openapi.yaml",
            "AgentManifestRuntimeContract",
            "Agent Store",
            "Agent Store",
            ("Agent Runtime", "AgentOps", "Agent Store UI"),
            ("CCT-008",),
            (
                "tests/contract/test_agent_manifest_runtime_contract_api.py",
                "tests/contract/test_contract_files_parse.py",
            ),
            "AgentManifest Runtime Contract V1",
        ),
        (
            "agent_registry_draft.v1",
            "agent-registry.openapi.yaml",
            "AgentDraftResponse",
            "Agent Store",
            "Agent Store",
            ("AgentOps", "Agent Store UI"),
            (),
            (
                "tests/contract/test_agent_registry_api.py",
                "tests/contract/test_contract_files_parse.py",
            ),
            "Agent Registry Draft",
        ),
        (
            "agentops_summary.v1",
            "agentops-summary.openapi.yaml",
            "AgentOpsSummaryResponse",
            "AgentOps",
            "AgentOps",
            ("Agent Store", "Agent Store UI"),
            (),
            (
                "tests/contract/test_agentops_summary_api.py",
                "tests/contract/test_contract_files_parse.py",
            ),
            "AgentOps Summary Echo",
        ),
        (
            "contract_registry_traceability.v1",
            "contract-registry-traceability.openapi.yaml",
            "ContractRegistryTraceability",
            "Agent Store",
            "Agent Store",
            ("AgentOps", "Agent Runtime", "Ai_AutoSDLC", "Agent Store UI"),
            ("CCT-017",),
            (
                "tests/contract/test_contract_registry_traceability_api.py",
                "tests/contract/test_contract_files_parse.py",
            ),
            "Contract Registry Traceability V1",
        ),
        (
            "draft_review_submission.v1",
            "draft-review-submission.openapi.yaml",
            "DraftReviewSubmission",
            "Agent Store",
            "Agent Store",
            ("AgentOps", "Agent Store UI"),
            ("CCT-012",),
            (
                "tests/contract/test_draft_review_submission_api.py",
                "tests/contract/test_contract_files_parse.py",
            ),
            "Draft Review Submission V1",
        ),
        (
            "feedback_owner_response_loop.v1",
            "feedback-owner-response-loop.openapi.yaml",
            "FeedbackOwnerResponseLoop",
            "Agent Store",
            "Agent Store",
            ("Agent Store UI",),
            ("CCT-015",),
            (
                "tests/contract/test_feedback_owner_response_loop_api.py",
                "tests/contract/test_contract_files_parse.py",
            ),
            "Feedback Owner Response Loop V1",
        ),
        (
            "health_summary_freshness.v1",
            "health-summary-freshness.openapi.yaml",
            "HealthSummaryFreshness",
            "AgentOps",
            "AgentOps",
            ("Agent Store", "Agent Store UI"),
            ("CCT-010",),
            (
                "tests/contract/test_health_summary_freshness_api.py",
                "tests/contract/test_contract_files_parse.py",
            ),
            "HealthSummary Freshness V1",
        ),
        (
            "installation_bootstrap.v1",
            "installation-bootstrap.openapi.yaml",
            "InstallationResponse",
            "Agent Store",
            "Agent Store",
            ("AgentOps", "Ai_AutoSDLC", "Agent Store UI"),
            (),
            (
                "tests/contract/test_installation_bootstrap_api.py",
                "tests/contract/test_contract_files_parse.py",
            ),
            "Installation Bootstrap",
        ),
        (
            "installation_runtime_handoff.v1",
            "installation-runtime-handoff.openapi.yaml",
            "InstallationRuntimeHandoff",
            "Agent Store",
            "Agent Store",
            ("Agent Runtime", "AgentOps"),
            ("CCT-011",),
            (
                "tests/contract/test_installation_runtime_handoff_api.py",
                "tests/contract/test_contract_files_parse.py",
            ),
            "Installation Runtime Handoff V1",
        ),
        (
            "lifecycle_governance_baseline.v1",
            "lifecycle-governance-baseline.openapi.yaml",
            "LifecycleGovernance",
            "Agent Store",
            "Agent Store",
            ("AgentOps", "Agent Store UI"),
            ("CCT-016",),
            (
                "tests/contract/test_lifecycle_governance_api.py",
                "tests/contract/test_contract_files_parse.py",
            ),
            "Lifecycle Governance Baseline V1",
        ),
        (
            "managed_installer_preview.v1",
            "managed-installer-preview.openapi.yaml",
            "ManagedInstallerPreview",
            "Agent Store",
            "Agent Store",
            ("Agent Runtime", "AgentOps", "Agent Store UI"),
            ("CCT-014",),
            (
                "tests/contract/test_managed_installer_preview_api.py",
                "tests/contract/test_contract_files_parse.py",
            ),
            "Managed Installer Preview V1",
        ),
        (
            "package_validation_report.v1",
            "package-validation.openapi.yaml",
            "PackageValidationReport",
            "Agent Store",
            "Agent Store",
            ("AgentOps", "Agent Store UI"),
            (),
            (
                "tests/contract/test_package_validation_api.py",
                "tests/contract/test_contract_files_parse.py",
            ),
            "Package Validation Report",
        ),
        (
            "policy_approval_echo.v1",
            "policy-approval-echo.openapi.yaml",
            "PolicyApprovalEcho",
            "AgentOps",
            "AgentOps",
            ("Agent Store", "Agent Store UI"),
            ("CCT-013",),
            (
                "tests/contract/test_policy_approval_echo_api.py",
                "tests/contract/test_contract_files_parse.py",
            ),
            "Policy Approval Echo V1",
        ),
        (
            "policy_approval_request.v1",
            "policy-approval-request.openapi.yaml",
            "PolicyApprovalRequest",
            "Agent Store",
            "Agent Store",
            ("AgentOps", "Agent Store UI"),
            ("CCT-018",),
            (
                "tests/contract/test_policy_approval_request_api.py",
                "tests/contract/test_contract_files_parse.py",
            ),
            "Policy Approval Request V1",
        ),
        (
            "recommendation_state.v1",
            "recommendation-state.openapi.yaml",
            "RecommendationStateResponse",
            "Agent Store",
            "Agent Store",
            ("Agent Store UI",),
            (),
            (
                "tests/contract/test_recommendation_state_api.py",
                "tests/contract/test_contract_files_parse.py",
            ),
            "Recommendation State",
        ),
        (
            "runtime_availability_summary.v1",
            "runtime-availability.openapi.yaml",
            "RuntimeAvailabilitySummary",
            "Agent Runtime",
            "Agent Runtime",
            ("Agent Store", "Agent Store UI"),
            ("CCT-009",),
            (
                "tests/contract/test_runtime_availability_api.py",
                "tests/contract/test_contract_files_parse.py",
            ),
            "Runtime Availability Summary V1",
        ),
        (
            "skill_registry_notification.v1",
            "skill-registry-notification.openapi.yaml",
            "SkillRegistryNotification",
            "Agent Store",
            "Agent Store",
            ("AgentOps",),
            ("CCT-007",),
            (
                "tests/contract/test_skill_registry_api.py",
                "tests/contract/test_contract_files_parse.py",
            ),
            "Skill Registry Notification V1",
        ),
        (
            "skill_registry.v1",
            "skill-registry.openapi.yaml",
            "SkillRegistryTransition",
            "Agent Store",
            "Agent Store",
            ("AgentOps", "Agent Store UI"),
            (),
            (
                "tests/contract/test_skill_registry_api.py",
                "tests/contract/test_contract_files_parse.py",
            ),
            "Skill Registry Lifecycle",
        ),
        (
            "trusted_evidence_loop.v1",
            "trusted-evidence-loop.openapi.yaml",
            "TrustedEvidenceLoopResponse",
            "AgentOps",
            "AgentOps",
            ("Agent Store", "Agent Store UI"),
            (),
            (
                "tests/contract/test_trusted_evidence_loop.py",
                "tests/contract/test_contract_files_parse.py",
            ),
            "Trusted Evidence Loop",
        ),
    )
    for row in data:
        yield ContractTraceabilityEntry(*row)
