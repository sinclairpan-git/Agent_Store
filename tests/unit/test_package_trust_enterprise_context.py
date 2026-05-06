import pytest

from agent_store.domain.enterprise_context import (
    EnterpriseContext,
    StandaloneOvercoupledError,
)
from agent_store.domain.models import AgentVersion
from agent_store.domain.package_trust import PackageTrustSummary


def test_package_trust_summary_supports_phase1_trust_fields() -> None:
    summary = PackageTrustSummary(
        package_id="framework.ai-autosdlc@1.0.0",
        trust_state="trusted",
        signature_state="verified",
        hash_match_state="matched",
        issuer_display="Agent Store",
        diagnostic_ref="diag-123",
    )

    assert summary.to_dict()["trust_state"] == "trusted"
    assert summary.to_dict()["signature_state"] == "verified"
    assert summary.to_dict()["hash_match_state"] == "matched"
    assert summary.to_dict()["issuer_display"] == "Agent Store"
    assert summary.to_dict()["diagnostic_ref"] == "diag-123"


def test_package_trust_summary_can_be_derived_from_agent_version() -> None:
    version = AgentVersion(
        agent_id="framework.ai-autosdlc",
        version="1.0.0",
        artifact_hash="sha256:first",
        signature="sig-1",
        issuer="Agent Store",
        key_id="key-1",
    )

    summary = PackageTrustSummary.from_version(version)

    assert summary.package_id == "framework.ai-autosdlc@1.0.0"
    assert summary.key_id == "key-1"
    assert summary.hash_match_state == "matched"


def test_enterprise_context_supports_policy_and_affected_actions() -> None:
    context = EnterpriseContext(
        integration_mode="enterprise_managed",
        enterprise_state="required_unactivated",
        source="tenant_policy",
        required_by="security-baseline",
        issuer="IAM",
        policy_owner="Security",
        policy_version="2026.05",
        can_ignore=False,
        affected_actions=("actual_l5_display", "enterprise_activation"),
        requires_enterprise=True,
        installation_id="inst-1",
    )

    data = context.to_dict()
    assert data["required_by"] == "security-baseline"
    assert data["policy_owner"] == "Security"
    assert data["can_ignore"] is False
    assert data["affected_actions"] == ["actual_l5_display", "enterprise_activation"]
    assert data["requires_enterprise"] is True


def test_standalone_context_does_not_require_installation_id() -> None:
    context = EnterpriseContext.standalone()

    assert context.requires_enterprise is False
    assert "installation_id" not in context.to_dict()


def test_standalone_context_rejects_enterprise_coupling() -> None:
    with pytest.raises(StandaloneOvercoupledError):
        EnterpriseContext(
            integration_mode="standalone",
            enterprise_state="not_detected",
            source="local_cli",
            can_ignore=True,
            affected_actions=(),
            requires_enterprise=True,
        )
