from __future__ import annotations

from dataclasses import dataclass, field
from datetime import UTC, datetime, timedelta


AGENT_TYPES = frozenset({"agent", "skill", "framework_capability"})
AGENT_STATUSES = frozenset(
    {"draft", "official_draft", "official_readonly", "manual_installable-preview"}
)
RELEASE_STATUSES = frozenset(
    {"official_draft", "official_readonly", "manual_installable-preview"}
)
COMPATIBILITY_STATUSES = frozenset(
    {"unknown", "static_passed", "smoke_passed", "install_verified", "unsupported"}
)


class VersionArtifactConflict(ValueError):
    """Raised when an immutable agent version would be overwritten."""


def utc_now() -> datetime:
    return datetime.now(UTC)


@dataclass(frozen=True)
class OsCompatibility:
    os: str
    compatibility_status: str
    min_version: str | None = None

    def __post_init__(self) -> None:
        if self.os not in {"macOS", "Windows", "Linux"}:
            raise ValueError(f"unsupported os: {self.os}")
        if self.compatibility_status not in COMPATIBILITY_STATUSES:
            raise ValueError(
                f"unsupported compatibility_status: {self.compatibility_status}"
            )

    def to_dict(self) -> dict[str, object]:
        data: dict[str, object] = {
            "os": self.os,
            "compatibility_status": self.compatibility_status,
        }
        if self.min_version is not None:
            data["min_version"] = self.min_version
        return data


@dataclass(frozen=True)
class Agent:
    agent_id: str
    display_name: str
    type: str
    category: str
    owner_team: str
    owner_user: str
    status: str = "official_draft"
    official_flag: bool = False
    summary: str = ""
    use_cases: tuple[str, ...] = ()
    supported_os: tuple[OsCompatibility, ...] = ()
    created_at: datetime = field(default_factory=utc_now)
    updated_at: datetime = field(default_factory=utc_now)

    def __post_init__(self) -> None:
        if not self.agent_id:
            raise ValueError("agent_id is required")
        if not self.display_name:
            raise ValueError("display_name is required")
        if self.type not in AGENT_TYPES:
            raise ValueError(f"unsupported agent type: {self.type}")
        if not self.category:
            raise ValueError("category is required")
        if self.status not in AGENT_STATUSES:
            raise ValueError(f"unsupported agent status: {self.status}")

    @property
    def has_owner(self) -> bool:
        return bool(self.owner_team and self.owner_user)

    @property
    def is_framework_capability(self) -> bool:
        return self.type == "framework_capability"

    def to_dict(self) -> dict[str, object]:
        return {
            "agent_id": self.agent_id,
            "display_name": self.display_name,
            "type": self.type,
            "category": self.category,
            "owner_team": self.owner_team,
            "owner_user": self.owner_user,
            "status": self.status,
            "official_flag": self.official_flag,
            "summary": self.summary,
            "use_cases": list(self.use_cases),
            "supported_os": [item.to_dict() for item in self.supported_os],
        }


@dataclass(frozen=True)
class AgentVersion:
    agent_id: str
    version: str
    artifact_hash: str
    signature: str
    issuer: str
    release_status: str = "official_draft"
    package_signature: str | None = None
    package_id: str | None = None
    hash_algorithm: str = "sha256"
    package_signature_alg: str = "ed25519"
    key_id: str | None = None
    source_repo: str | None = None
    source_commit: str | None = None
    sbom_ref: str | None = None
    scan_report_ref: str | None = None
    compatibility_status: str = "unknown"
    issued_at: datetime = field(default_factory=utc_now)
    expires_at: datetime = field(default_factory=lambda: utc_now() + timedelta(hours=1))
    created_at: datetime = field(default_factory=utc_now)

    def __post_init__(self) -> None:
        if not self.agent_id:
            raise ValueError("agent_id is required")
        if not self.version:
            raise ValueError("version is required")
        if not self.artifact_hash:
            raise ValueError("artifact_hash is required")
        if not self.signature:
            raise ValueError("signature is required")
        if not self.issuer:
            raise ValueError("issuer is required")
        if self.release_status not in RELEASE_STATUSES:
            raise ValueError(f"unsupported release_status: {self.release_status}")
        if self.compatibility_status not in COMPATIBILITY_STATUSES:
            raise ValueError(
                f"unsupported compatibility_status: {self.compatibility_status}"
            )

    @property
    def identity_key(self) -> tuple[str, str]:
        return self.agent_id, self.version

    @property
    def resolved_package_id(self) -> str:
        return self.package_id or f"{self.agent_id}@{self.version}"

    def assert_same_artifact(self, other: "AgentVersion") -> None:
        if self.identity_key == other.identity_key and self.artifact_hash != other.artifact_hash:
            raise VersionArtifactConflict(
                f"{self.agent_id}@{self.version} already exists with a different artifact_hash"
            )

    def to_dict(self) -> dict[str, object]:
        data: dict[str, object] = {
            "agent_id": self.agent_id,
            "version": self.version,
            "artifact_hash": self.artifact_hash,
            "signature": self.signature,
            "issuer": self.issuer,
            "release_status": self.release_status,
            "package_id": self.resolved_package_id,
            "hash_algorithm": self.hash_algorithm,
            "package_signature_alg": self.package_signature_alg,
            "compatibility_status": self.compatibility_status,
        }
        optional = {
            "package_signature": self.package_signature,
            "key_id": self.key_id,
            "source_repo": self.source_repo,
            "source_commit": self.source_commit,
            "sbom_ref": self.sbom_ref,
            "scan_report_ref": self.scan_report_ref,
        }
        data.update({key: value for key, value in optional.items() if value is not None})
        return data


class AgentVersionCatalog:
    def __init__(self) -> None:
        self._versions: dict[tuple[str, str], AgentVersion] = {}

    def add(self, version: AgentVersion) -> AgentVersion:
        existing = self._versions.get(version.identity_key)
        if existing is not None:
            existing.assert_same_artifact(version)
            return existing
        self._versions[version.identity_key] = version
        return version

    def get(self, agent_id: str, version: str) -> AgentVersion | None:
        return self._versions.get((agent_id, version))
