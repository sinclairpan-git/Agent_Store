from __future__ import annotations

from dataclasses import dataclass


TARGET_SYSTEMS = frozenset(
    {
        "agent_store",
        "agent_runtime",
        "agentops",
        "evidence_vault",
        "ai_autosdlc_cli",
        "external",
    }
)


@dataclass(frozen=True)
class ActionDescriptor:
    action_id: str
    target_system: str
    enabled: bool = True
    requires_permission: bool = False
    audit_required: bool = False
    href: str | None = None
    message_key: str | None = None

    def __post_init__(self) -> None:
        if not self.action_id:
            raise ValueError("action_id is required")
        if self.target_system not in TARGET_SYSTEMS:
            raise ValueError(f"unsupported target_system: {self.target_system}")

    def to_dict(self) -> dict[str, object]:
        data: dict[str, object] = {
            "action_id": self.action_id,
            "target_system": self.target_system,
            "enabled": self.enabled,
            "requires_permission": self.requires_permission,
            "audit_required": self.audit_required,
        }
        if self.href is not None:
            data["href"] = self.href
        if self.message_key is not None:
            data["message_key"] = self.message_key
        return data
