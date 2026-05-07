from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

from agent_store import SCHEMA_VERSION
from agent_store.domain.actions import ActionDescriptor
from agent_store.domain.enterprise_context import EnterpriseContext
from agent_store.domain.models import Agent, AgentVersion
from agent_store.domain.package_trust import PackageTrustSummary


@dataclass(frozen=True)
class CatalogAgentSource:
    agent: Agent
    version: AgentVersion
    package_trust_summary: PackageTrustSummary
    enterprise_context: EnterpriseContext
    evidence_level: str
    installability: str


@dataclass(frozen=True)
class CatalogFilter:
    search: str | None = None
    agent_type: str | None = None
    trust_state: str | None = None
    installability: str | None = None


def _primary_action(source: CatalogAgentSource) -> ActionDescriptor:
    if source.installability == "installable":
        return ActionDescriptor(
            action_id="start_install",
            target_system="agent_store",
            enabled=True,
            requires_permission=True,
            audit_required=True,
            href=f"#install-{source.agent.agent_id}",
            message_key="catalog.actions.startInstall",
        )
    if source.installability == "activation_required":
        return ActionDescriptor(
            action_id="start_enterprise_activation",
            target_system="agent_store",
            enabled=True,
            requires_permission=True,
            audit_required=True,
            href=f"#activate-{source.agent.agent_id}",
            message_key="catalog.actions.startActivation",
        )
    return ActionDescriptor(
        action_id="open_detail",
        target_system="agent_store",
        enabled=True,
        requires_permission=False,
        audit_required=False,
        href=f"#detail-{source.agent.agent_id}",
        message_key="catalog.actions.openDetail",
    )


def build_catalog_card(source: CatalogAgentSource) -> dict[str, object]:
    return {
        "agent_id": source.agent.agent_id,
        "display_name": source.agent.display_name,
        "summary": source.agent.summary,
        "capability_type": source.agent.category,
        "agent_type": source.agent.type,
        "version": source.version.version,
        "owner_team": source.agent.owner_team,
        "release_status": source.version.release_status,
        "trust_state": source.package_trust_summary.trust_state,
        "signature_state": source.package_trust_summary.signature_state,
        "enterprise_state": source.enterprise_context.enterprise_state,
        "evidence_level": source.evidence_level,
        "installability": source.installability,
        "supported_os": [item.to_dict() for item in source.agent.supported_os],
        "use_cases": list(source.agent.use_cases),
        "primary_action": _primary_action(source).to_dict(),
    }


def _matches(card: dict[str, object], filters: CatalogFilter) -> bool:
    if filters.agent_type and card["agent_type"] != filters.agent_type:
        return False
    if filters.trust_state and card["trust_state"] != filters.trust_state:
        return False
    if filters.installability and card["installability"] != filters.installability:
        return False
    if filters.search:
        haystack = " ".join(
            str(card.get(key, ""))
            for key in ("agent_id", "display_name", "summary", "owner_team")
        ).lower()
        return filters.search.lower() in haystack
    return True


def _facet_counts(cards: Iterable[dict[str, object]], field: str) -> dict[str, int]:
    counts: dict[str, int] = {}
    for card in cards:
        value = str(card[field])
        counts[value] = counts.get(value, 0) + 1
    return dict(sorted(counts.items()))


def build_catalog_workbench(
    *,
    sources: Iterable[CatalogAgentSource],
    trace_id: str,
    filters: CatalogFilter | None = None,
    selected_agent_id: str | None = None,
) -> dict[str, object]:
    all_cards = [build_catalog_card(source) for source in sources]
    active_filters = filters or CatalogFilter()
    cards = [card for card in all_cards if _matches(card, active_filters)]
    cards.sort(key=lambda item: (str(item["display_name"]).lower(), item["agent_id"]))

    selected = None
    if selected_agent_id:
        selected = next(
            (card for card in all_cards if card["agent_id"] == selected_agent_id), None
        )
    if selected is None and cards:
        selected = cards[0]

    return {
        "schema_version": SCHEMA_VERSION,
        "trace_id": trace_id,
        "error_code": "OK",
        "catalog": {
            "cards": cards,
            "total_count": len(all_cards),
            "filtered_count": len(cards),
            "selected_agent_id": selected["agent_id"] if selected else None,
            "selected_agent": selected,
            "facets": {
                "agent_type": _facet_counts(all_cards, "agent_type"),
                "trust_state": _facet_counts(all_cards, "trust_state"),
                "installability": _facet_counts(all_cards, "installability"),
            },
            "active_filters": {
                "search": active_filters.search or "",
                "agent_type": active_filters.agent_type or "all",
                "trust_state": active_filters.trust_state or "all",
                "installability": active_filters.installability or "all",
            },
        },
    }
