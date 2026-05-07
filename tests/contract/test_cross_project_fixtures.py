import json
from pathlib import Path

from agent_store.domain.agentops_summary import CredentialBootstrapSummary


FIXTURES_DIR = Path("contracts/cross-project/fixtures")


def _load_fixture(name: str) -> dict[str, object]:
    return json.loads((FIXTURES_DIR / name).read_text(encoding="utf-8"))


def test_cct_001_agent_store_assertion_fixture_uses_agentops_field_names() -> None:
    assertion = _load_fixture("signed_installation_assertion.v1.json")

    assert assertion["assertion_version"] == "signed_installation_assertion.v1"
    assert assertion["issuer"] == "agent-store"
    assert assertion["algorithm"] == "HS256"
    assert assertion["canonicalization"] == "json-c14n-v1"
    assert assertion["user_id"] == "user-1"
    assert "alg" not in assertion
    assert "subject_user_id" not in assertion


def test_device_proof_fixture_is_ai_autosdlc_owned_not_store_produced() -> None:
    readme = (FIXTURES_DIR / "README.md").read_text(encoding="utf-8")
    device_proof = _load_fixture("device_proof.v1.json")

    assert device_proof["proof_version"] == "device_proof.v1"
    assert device_proof["algorithm"] == "Ed25519"
    assert "Ai_AutoSDLC is the producer" in readme
    assert "Agent Store must not generate, sign, or fill missing device proof" in readme


def test_agentops_handoff_fixture_binds_store_assertion_and_device_proof() -> None:
    handoff = _load_fixture("agentops_credential_handoff.v1.json")
    assertion = handoff["installation_assertion"]
    device_proof = handoff["device_proof"]
    assert isinstance(assertion, dict)
    assert isinstance(device_proof, dict)

    assert handoff["schema_version"] == "agentops_credential_handoff.v1"
    assert assertion["assertion_version"] == "signed_installation_assertion.v1"
    assert device_proof["proof_version"] == "device_proof.v1"
    assert assertion["installation_id"] == device_proof["installation_id"]
    assert assertion["device_id"] == device_proof["device_id"]
    assert assertion["assertion_hash"] == device_proof["assertion_hash"]


def test_cct_003_store_consumes_agentops_credential_echo_without_inferring_active() -> None:
    response = _load_fixture("credential_issue_response.v1.json")
    summary = CredentialBootstrapSummary.from_agentops_credential_response(response)
    payload = summary.to_dict()

    assert payload["bootstrap_status"] == "credential_issued"
    assert payload["credential_status"] == "active"
    assert payload["next_action"] == "send_signature_test_event"
    assert payload["enterprise_state"] == "activating"
    assert payload["reporter_status"] == "pending_signature_test"
    assert payload["credential_id"] == "cred-fixture"


def test_agentops_016_consumer_acceptance_is_frozen_in_appendix() -> None:
    appendix = Path("docs/cross-project-contract-appendix.md").read_text(
        encoding="utf-8",
    )

    required_terms = [
        "016-cross-project-credential-handoff-consumer",
        "schema_version` is `agentops_credential_handoff.v1",
        "installation_assertion.assertion_version` is `signed_installation_assertion.v1",
        "installation_assertion.issuer` is `agent-store",
        "installation_assertion.audience` is `agentops",
        "installation_assertion.canonicalization` is `json-c14n-v1",
        "device_proof.proof_version` is `device_proof.v1",
        "device_proof.assertion_hash` equals `installation_assertion.assertion_hash",
        "Device proof `algorithm` is independent from the assertion `algorithm`",
        "bootstrap_status`, `next_action`,",
        "Agent Store must not infer `active`",
        "upgrade dry-run or local adapter state to `verified_loaded`",
    ]

    for term in required_terms:
        assert term in appendix
