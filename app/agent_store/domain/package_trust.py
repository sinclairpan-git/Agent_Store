from __future__ import annotations

from dataclasses import dataclass

from .models import AgentVersion


TRUST_STATES = frozenset({"trusted", "warning", "blocked", "unknown"})
SIGNATURE_STATES = frozenset({"verified", "expired", "mismatch", "missing"})
HASH_MATCH_STATES = frozenset({"matched", "mismatched", "unknown"})


@dataclass(frozen=True)
class PackageTrustSummary:
    package_id: str
    trust_state: str
    signature_state: str
    hash_match_state: str
    issuer_display: str
    diagnostic_ref: str | None = None
    hash_algorithm: str | None = None
    package_signature_alg: str | None = None
    key_id: str | None = None
    source_repo: str | None = None
    source_commit: str | None = None
    sbom_ref: str | None = None
    scan_report_ref: str | None = None
    compatibility_status: str | None = None

    def __post_init__(self) -> None:
        if not self.package_id:
            raise ValueError("package_id is required")
        if self.trust_state not in TRUST_STATES:
            raise ValueError(f"unsupported trust_state: {self.trust_state}")
        if self.signature_state not in SIGNATURE_STATES:
            raise ValueError(f"unsupported signature_state: {self.signature_state}")
        if self.hash_match_state not in HASH_MATCH_STATES:
            raise ValueError(f"unsupported hash_match_state: {self.hash_match_state}")
        if not self.issuer_display:
            raise ValueError("issuer_display is required")

    @classmethod
    def from_version(
        cls,
        version: AgentVersion,
        *,
        trust_state: str = "trusted",
        signature_state: str = "verified",
        hash_match_state: str = "matched",
        diagnostic_ref: str | None = None,
    ) -> "PackageTrustSummary":
        return cls(
            package_id=version.resolved_package_id,
            trust_state=trust_state,
            signature_state=signature_state,
            hash_match_state=hash_match_state,
            issuer_display=version.issuer,
            diagnostic_ref=diagnostic_ref,
            hash_algorithm=version.hash_algorithm,
            package_signature_alg=version.package_signature_alg,
            key_id=version.key_id,
            source_repo=version.source_repo,
            source_commit=version.source_commit,
            sbom_ref=version.sbom_ref,
            scan_report_ref=version.scan_report_ref,
            compatibility_status=version.compatibility_status,
        )

    def to_dict(self) -> dict[str, object]:
        data: dict[str, object] = {
            "package_id": self.package_id,
            "trust_state": self.trust_state,
            "signature_state": self.signature_state,
            "hash_match_state": self.hash_match_state,
            "issuer_display": self.issuer_display,
        }
        optional = {
            "diagnostic_ref": self.diagnostic_ref,
            "hash_algorithm": self.hash_algorithm,
            "package_signature_alg": self.package_signature_alg,
            "key_id": self.key_id,
            "source_repo": self.source_repo,
            "source_commit": self.source_commit,
            "sbom_ref": self.sbom_ref,
            "scan_report_ref": self.scan_report_ref,
            "compatibility_status": self.compatibility_status,
        }
        data.update(
            {key: value for key, value in optional.items() if value is not None}
        )
        return data
