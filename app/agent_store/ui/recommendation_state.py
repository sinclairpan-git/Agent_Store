from __future__ import annotations

from dataclasses import dataclass

from agent_store import SCHEMA_VERSION
from agent_store.domain.actions import ActionDescriptor
from agent_store.domain.agentops_summary import AgentOpsSummaryBundle
from agent_store.ui.catalog_workbench import CatalogAgentSource


@dataclass(frozen=True)
class RecommendationStateModel:
    source: CatalogAgentSource
    trace_id: str
    agentops_summary: AgentOpsSummaryBundle | None = None

    def to_response(self) -> dict[str, object]:
        return {
            "schema_version": SCHEMA_VERSION,
            "trace_id": self.trace_id,
            "error_code": "OK",
            "recommendation": self.to_dict(),
        }

    def to_dict(self) -> dict[str, object]:
        return {
            "agent_id": self.source.agent.agent_id,
            "agent_version": self.source.version.version,
            "recommendation_state": self.recommendation_state,
            "verdict": self.verdict,
            "why_recommended": self.why_recommended,
            "why_not": self.why_not,
            "missing_evidence": self.missing_evidence,
            "trust_blockers": self.trust_blockers,
            "next_best_action": self.next_best_action.to_dict(),
            "source_of_truth": self.source_of_truth,
            "actual_l5_display_allowed": self.actual_l5_display_allowed,
            "audit_id": self.audit_id,
            "trace_id": self.trace_id,
        }

    @property
    def recommendation_state(self) -> str:
        if self.is_blocked:
            return "blocked"
        if self.source.installability == "activation_required":
            return "needs_activation"
        if (
            self.missing_evidence
            or self.l5_gate_blocks_recommendation
            or self.source.package_trust_summary.trust_state != "trusted"
        ):
            return "eligible_pending_verification"
        return "recommended"

    @property
    def verdict(self) -> str:
        if self.recommendation_state == "recommended":
            return "推荐优先试用；实际 L5 由 AgentOps summary 证明。"
        if self.recommendation_state == "needs_activation":
            return "适合进入企业激活；激活完成前只展示预览下一步。"
        if self.recommendation_state == "blocked":
            return "当前存在治理阻断，需先处理目录或策略问题。"
        return "可进入评估，但缺少可信证据时不得展示实际 L5。"

    @property
    def why_recommended(self) -> list[str]:
        reasons = [
            f"catalog_capability:{self.source.agent.category}",
            f"installability:{self.source.installability}",
        ]
        reasons.extend(f"use_case:{item}" for item in self.source.agent.use_cases)
        if self.agentops_summary is not None:
            reasons.append("agentops_summary:available")
        return reasons

    @property
    def why_not(self) -> list[str]:
        risks: list[str] = []
        if self.source.installability == "activation_required":
            risks.append("enterprise_activation_required")
        if self.source.package_trust_summary.trust_state != "trusted":
            risks.append("package_trust_not_verified")
        if self.missing_evidence:
            risks.append("trusted_evidence_incomplete")
        if self.l5_gate_blocks_recommendation:
            risks.append("agentops_l5_gate_not_passed")
        if self.is_blocked:
            risks.append("governance_blocked")
        return risks

    @property
    def missing_evidence(self) -> list[str]:
        missing: list[str] = []
        if self.agentops_summary is None:
            missing.append("agentops_summary")
        else:
            quality = self.agentops_summary.quality_evidence
            missing.extend(quality.missing_evidence)
            if quality.effective_validity_state() in {"degraded", "expired"}:
                missing.append("fresh_agentops_quality_summary")
            if self.agentops_summary.l5_gate is None:
                missing.append("agentops_l5_gate")
            else:
                missing.extend(self.agentops_summary.l5_gate.missing_requirements)
        return sorted(set(missing))

    @property
    def trust_blockers(self) -> list[dict[str, object]]:
        blockers: list[dict[str, object]] = []
        if self.source.installability == "blocked":
            blockers.append(
                {
                    "blocker_id": "installability_blocked",
                    "source": "agent_store_catalog",
                    "severity": "blocked",
                    "can_ignore": False,
                }
            )
        if self.source.package_trust_summary.trust_state == "blocked":
            blockers.append(
                {
                    "blocker_id": "package_trust_blocked",
                    "source": "agent_store_package_trust",
                    "severity": "blocked",
                    "can_ignore": False,
                }
            )
        if "agentops_summary" in self.missing_evidence:
            blockers.append(
                {
                    "blocker_id": "l5_unavailable_without_agentops_summary",
                    "source": "agentops",
                    "severity": "warning",
                    "can_ignore": False,
                }
            )
        if self.l5_gate_blocks_recommendation:
            blockers.append(
                {
                    "blocker_id": "agentops_l5_gate_not_passed",
                    "source": "agentops",
                    "severity": "warning",
                    "can_ignore": False,
                }
            )
        return blockers

    @property
    def next_best_action(self) -> ActionDescriptor:
        if self.is_blocked:
            return ActionDescriptor(
                action_id="request_catalog_review",
                target_system="agent_store",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                href=f"/api/v1/agents/{self.source.agent.agent_id}/catalog-review",
                message_key="recommendation.actions.requestCatalogReview",
            )
        if self.source.installability == "activation_required":
            return ActionDescriptor(
                action_id="start_enterprise_activation",
                target_system="agent_store",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                href=f"/api/v1/agents/{self.source.agent.agent_id}/activate",
                message_key="recommendation.actions.startActivation",
            )
        if self.missing_evidence or self.l5_gate_blocks_recommendation:
            return ActionDescriptor(
                action_id="request_agentops_summary",
                target_system="agentops",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                href=f"/agentops/summaries/{self.source.agent.agent_id}",
                message_key="recommendation.actions.requestAgentOpsSummary",
            )
        return ActionDescriptor(
            action_id="start_install",
            target_system="agent_store",
            enabled=self.source.installability == "installable",
            requires_permission=True,
            audit_required=True,
            href=f"/api/v1/agents/{self.source.agent.agent_id}/install",
            message_key="recommendation.actions.startInstall",
        )

    @property
    def source_of_truth(self) -> dict[str, str]:
        return {
            "catalog": "agent_store_catalog",
            "package_trust": "agent_store_package_trust",
            "enterprise_context": "agent_store_enterprise_context",
            "quality_evidence": self.quality_source_of_truth,
            "l5_gate": self.l5_gate_source_of_truth,
        }

    @property
    def quality_source_of_truth(self) -> str:
        if self.agentops_summary is None:
            return "agentops_summary_missing"
        quality = self.agentops_summary.quality_evidence
        if quality.summary_validity_state == "degraded":
            return "agentops_summary_degraded"
        validity = quality.effective_validity_state()
        if validity in {"degraded", "expired"}:
            return f"agentops_summary_{validity}"
        return "agentops_summary"

    @property
    def l5_gate_source_of_truth(self) -> str:
        if self.agentops_summary is None or self.agentops_summary.l5_gate is None:
            return "agentops_summary_missing"
        return "agentops_summary"

    @property
    def actual_l5_display_allowed(self) -> bool:
        if self.agentops_summary is None or self.agentops_summary.l5_gate is None:
            return False
        return self.agentops_summary.l5_gate.actual_l5_display_allowed

    @property
    def l5_gate_blocks_recommendation(self) -> bool:
        return (
            self.agentops_summary is not None
            and self.agentops_summary.l5_gate is not None
            and not self.agentops_summary.l5_gate.actual_l5_display_allowed
        )

    @property
    def audit_id(self) -> str:
        if self.agentops_summary is not None:
            return self.agentops_summary.approval.audit_id
        return f"audit-{self.trace_id}"

    @property
    def is_blocked(self) -> bool:
        return (
            self.source.installability == "blocked"
            or self.source.package_trust_summary.trust_state == "blocked"
        )


def build_recommendation_state(
    *,
    source: CatalogAgentSource,
    trace_id: str,
    agentops_summary: AgentOpsSummaryBundle | None = None,
) -> dict[str, object]:
    return RecommendationStateModel(
        source=source,
        trace_id=trace_id,
        agentops_summary=agentops_summary,
    ).to_response()
