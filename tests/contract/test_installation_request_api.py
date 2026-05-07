from __future__ import annotations

from agent_store.api.agent_registry import response_envelope_ok
from agent_store.api.installation_request import InstallationRequestAPI
from agent_store.domain.enterprise_context import EnterpriseContext
from agent_store.domain.models import Agent, AgentVersion, OsCompatibility
from agent_store.domain.package_trust import PackageTrustSummary
from agent_store.ui.catalog_workbench import CatalogAgentSource


def _source(
    agent_id: str,
    display_name: str,
    *,
    agent_type: str,
    category: str,
    trust_state: str,
    enterprise_state: str,
    installability: str,
    evidence_level: str,
) -> CatalogAgentSource:
    agent = Agent(
        agent_id=agent_id,
        display_name=display_name,
        type=agent_type,
        category=category,
        owner_team="Platform",
        owner_user="owner@example.com",
        official_flag=True,
        summary=f"{display_name} catalog summary",
        use_cases=("governed delivery",),
        supported_os=(
            OsCompatibility(os="macOS", compatibility_status="install_verified"),
        ),
    )
    version = AgentVersion(
        agent_id=agent_id,
        version="1.0.0",
        artifact_hash=f"sha256:{agent_id}",
        signature="sig",
        issuer="Agent Store",
        release_status="manual_installable-preview",
    )
    return CatalogAgentSource(
        agent=agent,
        version=version,
        package_trust_summary=PackageTrustSummary(
            package_id=f"{agent_id}@1.0.0",
            trust_state=trust_state,
            signature_state="verified" if trust_state == "trusted" else "missing",
            hash_match_state="matched" if trust_state == "trusted" else "unknown",
            issuer_display="Agent Store",
        ),
        enterprise_context=EnterpriseContext(
            integration_mode="enterprise_managed",
            enterprise_state=enterprise_state,
            source="tenant_policy",
            can_ignore=False,
            affected_actions=("install",),
            requires_enterprise=True,
        ),
        evidence_level=evidence_level,
        installability=installability,
    )


def _api() -> InstallationRequestAPI:
    return InstallationRequestAPI(
        sources=(
            _source(
                "developer.release-notes",
                "Release Notes Writer",
                agent_type="skill",
                category="Developer Tool",
                trust_state="warning",
                enterprise_state="detected_optional",
                installability="installable",
                evidence_level="L2-static",
            ),
            _source(
                "security.policy-guard",
                "Policy Guard",
                agent_type="agent",
                category="Runtime Policy",
                trust_state="blocked",
                enterprise_state="disabled",
                installability="blocked",
                evidence_level="pending",
            ),
        )
    )


def test_installation_request_api_submits_known_agent() -> None:
    status, body = _api().submit_request(
        "developer.release-notes",
        {
            "trace_id": "trace-request",
            "requested_by": "operator@example.com",
            "action_id": "start_install",
        },
    )

    assert status == 201
    assert response_envelope_ok(body)
    assert body["request"]["agent"]["agent_id"] == "developer.release-notes"
    assert body["request"]["request_state"] == "accepted"
    assert body["request"]["requested_by"] == "operator@example.com"


def test_installation_request_api_returns_not_found() -> None:
    status, body = _api().submit_request("missing.agent", {"trace_id": "trace-request"})

    assert status == 404
    assert response_envelope_ok(body)
    assert body["error_code"] == "AGENT_NOT_FOUND"
    assert body["recommended_action_id"] == "return_to_store"


def test_installation_request_api_rejects_direct_install_for_blocked_agent() -> None:
    status, body = _api().submit_request(
        "security.policy-guard",
        {"trace_id": "trace-request", "action_id": "start_install"},
    )

    assert status == 409
    assert response_envelope_ok(body)
    assert body["error_code"] == "ACTION_NOT_ALLOWED"
    assert body["recommended_action_id"] == "request_catalog_review"
    assert body["details"]["allowed_actions"] == ["request_catalog_review"]


def test_installation_request_api_accepts_blocked_catalog_review() -> None:
    status, body = _api().submit_request(
        "security.policy-guard",
        {"trace_id": "trace-request", "action_id": "request_catalog_review"},
    )

    assert status == 202
    assert response_envelope_ok(body)
    assert body["request"]["request_state"] == "pending_catalog_review"
    assert body["request"]["queue"] == "catalog_review"


def test_installation_request_api_rejects_malformed_requested_by() -> None:
    for requested_by in (0, [], ""):
        status, body = _api().submit_request(
            "developer.release-notes",
            {"trace_id": "trace-request", "requested_by": requested_by},
        )

        assert status == 400
        assert response_envelope_ok(body)
        assert body["message_key"] == "errors.invalidRequestedBy"
        assert body["details"]["field"] == "requested_by"
