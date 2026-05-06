from __future__ import annotations

from dataclasses import dataclass


INTEGRATION_MODES = frozenset({"standalone", "enterprise_managed", "custom_sink"})
ENTERPRISE_STATES = frozenset(
    {
        "not_detected",
        "detected_optional",
        "required_unactivated",
        "activating",
        "active",
        "degraded",
        "disabled",
    }
)
CUSTOM_SINK_STATES = frozenset(
    {"custom_unconfigured", "custom_incomplete", "custom_connected", "custom_degraded"}
)


class StandaloneOvercoupledError(ValueError):
    """Raised when standalone usage is made dependent on enterprise facts."""


@dataclass(frozen=True)
class EnterpriseContext:
    integration_mode: str
    enterprise_state: str
    source: str
    can_ignore: bool
    affected_actions: tuple[str, ...]
    requires_enterprise: bool
    required_by: str | None = None
    issuer: str | None = None
    policy_owner: str | None = None
    policy_version: str | None = None
    custom_sink_support_status: str | None = None
    installation_id: str | None = None

    def __post_init__(self) -> None:
        if self.integration_mode not in INTEGRATION_MODES:
            raise ValueError(f"unsupported integration_mode: {self.integration_mode}")
        if self.enterprise_state not in ENTERPRISE_STATES:
            raise ValueError(f"unsupported enterprise_state: {self.enterprise_state}")
        if not self.source:
            raise ValueError("source is required")
        if (
            self.custom_sink_support_status is not None
            and self.custom_sink_support_status not in CUSTOM_SINK_STATES
        ):
            raise ValueError(
                f"unsupported custom_sink_support_status: {self.custom_sink_support_status}"
            )
        if self.integration_mode == "standalone":
            if self.requires_enterprise or self.installation_id:
                raise StandaloneOvercoupledError(
                    "standalone context must not require enterprise installation facts"
                )

    @classmethod
    def standalone(cls) -> "EnterpriseContext":
        return cls(
            integration_mode="standalone",
            enterprise_state="not_detected",
            source="local_cli",
            can_ignore=True,
            affected_actions=(),
            requires_enterprise=False,
        )

    def to_dict(self) -> dict[str, object]:
        data: dict[str, object] = {
            "integration_mode": self.integration_mode,
            "enterprise_state": self.enterprise_state,
            "source": self.source,
            "can_ignore": self.can_ignore,
            "affected_actions": list(self.affected_actions),
            "requires_enterprise": self.requires_enterprise,
        }
        optional = {
            "required_by": self.required_by,
            "issuer": self.issuer,
            "policy_owner": self.policy_owner,
            "policy_version": self.policy_version,
            "custom_sink_support_status": self.custom_sink_support_status,
            "installation_id": self.installation_id,
        }
        data.update({key: value for key, value in optional.items() if value is not None})
        return data
