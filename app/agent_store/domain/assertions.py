from __future__ import annotations

import hashlib
import hmac
from dataclasses import dataclass, replace
from datetime import datetime, timedelta

from .errors import ErrorResponse
from .installation import Installation
from .models import utc_now


class AssertionValidationError(Exception):
    def __init__(self, response: ErrorResponse) -> None:
        super().__init__(response.error_code)
        self.response = response


@dataclass(frozen=True)
class SignedInstallationAssertion:
    assertion_version: str
    installation_id: str
    device_id: str
    artifact_hash: str
    issuer: str
    issued_at: datetime
    expires_at: datetime
    key_id: str
    alg: str
    canonicalization: str
    audience: str
    subject_user_id: str
    nonce: str
    replay_window_seconds: int
    device_public_key_thumbprint: str
    assertion_hash: str
    revocation_status: str
    signature: str

    def to_dict(self) -> dict[str, object]:
        return {
            "assertion_version": self.assertion_version,
            "installation_id": self.installation_id,
            "device_id": self.device_id,
            "artifact_hash": self.artifact_hash,
            "issuer": self.issuer,
            "issued_at": self.issued_at.isoformat(),
            "expires_at": self.expires_at.isoformat(),
            "key_id": self.key_id,
            "alg": self.alg,
            "canonicalization": self.canonicalization,
            "audience": self.audience,
            "subject_user_id": self.subject_user_id,
            "nonce": self.nonce,
            "replay_window_seconds": self.replay_window_seconds,
            "device_public_key_thumbprint": self.device_public_key_thumbprint,
            "assertion_hash": self.assertion_hash,
            "revocation_status": self.revocation_status,
            "signature": self.signature,
        }

    def with_updates(self, **changes: object) -> "SignedInstallationAssertion":
        return replace(self, **changes)


class InstallationAssertionService:
    def __init__(
        self,
        *,
        issuer: str = "Agent Store",
        key_id: str = "agent-store-phase1-key",
        secret: bytes = b"agent-store-phase1-secret",
    ) -> None:
        self.issuer = issuer
        self.key_id = key_id
        self._secret = secret
        self._issued_by_installation: dict[str, SignedInstallationAssertion] = {}
        self._seen_nonces: set[str] = set()

    def issue(
        self,
        installation: Installation,
        *,
        device_public_key_thumbprint: str,
        nonce: str,
        audience: str,
        now: datetime | None = None,
    ) -> SignedInstallationAssertion:
        issued_at = now or utc_now()
        expires_at = issued_at + timedelta(minutes=15)
        canonical_payload = self._canonical_payload(
            assertion_version="1",
            installation_id=installation.installation_id,
            device_id=installation.device_id,
            artifact_hash=installation.artifact_hash,
            issuer=self.issuer,
            issued_at=issued_at.isoformat(),
            expires_at=expires_at.isoformat(),
            key_id=self.key_id,
            alg="HS256",
            canonicalization="json-c14n-v1",
            audience=audience,
            subject_user_id=installation.user,
            nonce=nonce,
            replay_window_seconds="300",
            device_public_key_thumbprint=device_public_key_thumbprint,
            revocation_status="not_revoked",
        )
        assertion_hash = hashlib.sha256(canonical_payload.encode("utf-8")).hexdigest()
        signature = hmac.new(
            self._secret, assertion_hash.encode("utf-8"), hashlib.sha256
        ).hexdigest()
        assertion = SignedInstallationAssertion(
            assertion_version="1",
            installation_id=installation.installation_id,
            device_id=installation.device_id,
            artifact_hash=installation.artifact_hash,
            issuer=self.issuer,
            issued_at=issued_at,
            expires_at=expires_at,
            key_id=self.key_id,
            alg="HS256",
            canonicalization="json-c14n-v1",
            audience=audience,
            subject_user_id=installation.user,
            nonce=nonce,
            replay_window_seconds=300,
            device_public_key_thumbprint=device_public_key_thumbprint,
            assertion_hash=assertion_hash,
            revocation_status="not_revoked",
            signature=signature,
        )
        self._issued_by_installation[installation.installation_id] = assertion
        return assertion

    def validate(
        self,
        assertion: SignedInstallationAssertion,
        *,
        expected_audience: str,
        expected_device_public_key_thumbprint: str,
        trace_id: str,
        now: datetime | None = None,
        mark_nonce_seen: bool = True,
    ) -> None:
        current_time = now or utc_now()
        if assertion.expires_at <= current_time:
            raise AssertionValidationError(
                self._error(
                    "INSTALLATION_ASSERTION_EXPIRED",
                    "errors.installationAssertionExpired",
                    "regenerate_activation_command",
                    trace_id,
                )
            )
        if assertion.revocation_status == "revoked":
            raise AssertionValidationError(
                self._error(
                    "ASSERTION_REVOKED",
                    "errors.assertionRevoked",
                    "regenerate_activation_command",
                    trace_id,
                )
            )
        if assertion.audience != expected_audience:
            raise AssertionValidationError(
                self._error(
                    "AUDIENCE_MISMATCH",
                    "errors.audienceMismatch",
                    "regenerate_activation_command",
                    trace_id,
                )
            )
        if assertion.device_public_key_thumbprint != expected_device_public_key_thumbprint:
            raise AssertionValidationError(
                self._error(
                    "DEVICE_KEY_MISMATCH",
                    "errors.deviceKeyMismatch",
                    "regenerate_activation_command",
                    trace_id,
                )
            )
        if assertion.nonce in self._seen_nonces:
            raise AssertionValidationError(
                self._error(
                    "ASSERTION_REPLAY_DETECTED",
                    "errors.assertionReplayDetected",
                    "restart_activation",
                    trace_id,
                )
            )
        if mark_nonce_seen:
            self._seen_nonces.add(assertion.nonce)

    @staticmethod
    def _canonical_payload(**fields: str) -> str:
        return "\n".join(f"{key}={fields[key]}" for key in sorted(fields))

    @staticmethod
    def _error(
        error_code: str,
        message_key: str,
        recommended_action_id: str,
        trace_id: str,
    ) -> ErrorResponse:
        return ErrorResponse(
            error_code=error_code,
            message_key=message_key,
            severity="blocked",
            retryable=False,
            recommended_action_id=recommended_action_id,
            trace_id=trace_id,
        )
