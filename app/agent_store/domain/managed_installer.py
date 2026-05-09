from __future__ import annotations

from dataclasses import dataclass
from typing import Mapping

from agent_store import SCHEMA_VERSION

from .actions import ActionDescriptor
from .status_registry import SEVERITIES


MANAGED_INSTALLER_PREVIEW_SCHEMA_VERSION = "managed_installer_preview.v1"
DOWNLOAD_STATES = frozenset({"available", "missing", "failed"})
SMOKE_TEST_STATES = frozenset({"not_run", "passed", "failed"})


def _string(value: object) -> str:
    return value.strip() if isinstance(value, str) else ""


def _mapping(value: object) -> Mapping[str, object]:
    return value if isinstance(value, Mapping) else {}


@dataclass(frozen=True)
class ManagedInstallerIssue:
    issue_id: str
    field_path: str
    severity: str
    reason: str
    impact: str
    fix_action_id: str
    message_key: str

    def __post_init__(self) -> None:
        if not self.issue_id:
            raise ValueError("issue_id is required")
        if not self.field_path:
            raise ValueError("field_path is required")
        if self.severity not in SEVERITIES:
            raise ValueError(f"unsupported severity: {self.severity}")
        if not self.fix_action_id:
            raise ValueError("fix_action_id is required")

    def to_dict(self) -> dict[str, object]:
        return {
            "issue_id": self.issue_id,
            "field_path": self.field_path,
            "severity": self.severity,
            "reason": self.reason,
            "impact": self.impact,
            "fix_action_id": self.fix_action_id,
            "message_key": self.message_key,
        }


@dataclass(frozen=True)
class ManagedInstallerStep:
    step_id: str
    label: str
    step_state: str
    owner_system: str
    diagnostic_ref: str = ""
    next_action: ActionDescriptor | None = None

    def to_dict(self) -> dict[str, object]:
        data: dict[str, object] = {
            "step_id": self.step_id,
            "label": self.label,
            "step_state": self.step_state,
            "owner_system": self.owner_system,
            "diagnostic_ref": self.diagnostic_ref,
        }
        if self.next_action is not None:
            data["next_action"] = self.next_action.to_dict()
        return data


@dataclass(frozen=True)
class ManagedInstallerPreview:
    trace_id: str
    audit_id: str
    agent_id: str
    agent_version: str
    installer_state: str
    package: dict[str, object]
    policy_gate: dict[str, object]
    runtime_gate: dict[str, object]
    isolation: dict[str, object]
    smoke_test: dict[str, object]
    steps: tuple[ManagedInstallerStep, ...]
    issues: tuple[ManagedInstallerIssue, ...]
    diagnostics: dict[str, object]
    source_of_truth: dict[str, str]

    def to_response(self) -> dict[str, object]:
        return {
            "schema_version": SCHEMA_VERSION,
            "trace_id": self.trace_id,
            "error_code": "OK",
            "audit_id": self.audit_id,
            "managed_installer_preview": self.to_dict(),
        }

    def to_dict(self) -> dict[str, object]:
        return {
            "contract_schema_version": MANAGED_INSTALLER_PREVIEW_SCHEMA_VERSION,
            "agent_id": self.agent_id,
            "agent_version": self.agent_version,
            "installer_state": self.installer_state,
            "execution_mode": "preview_only",
            "real_install_started": False,
            "package": self.package,
            "policy_gate": self.policy_gate,
            "runtime_gate": self.runtime_gate,
            "isolation": self.isolation,
            "smoke_test": self.smoke_test,
            "steps": [step.to_dict() for step in self.steps],
            "issues": [issue.to_dict() for issue in self.issues],
            "diagnostics": self.diagnostics,
            "source_of_truth": self.source_of_truth,
            "next_action": self.next_action.to_dict(),
        }

    @property
    def next_action(self) -> ActionDescriptor:
        if self.installer_state in {"ready_to_install_preview", "preview_passed"}:
            return ActionDescriptor(
                action_id="prepare_managed_install",
                target_system="agent_store",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                message_key="managedInstaller.actions.prepareManagedInstall",
            )
        if self.installer_state == "download_blocked":
            return ActionDescriptor(
                action_id="refresh_package_download",
                target_system="agent_store",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                message_key="managedInstaller.actions.refreshPackageDownload",
            )
        if self.installer_state == "signature_blocked":
            return ActionDescriptor(
                action_id="regenerate_package_signature",
                target_system="agent_store",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                message_key="managedInstaller.actions.regeneratePackageSignature",
            )
        if self.installer_state == "policy_blocked":
            return ActionDescriptor(
                action_id="view_agentops_approval",
                target_system="agentops",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                message_key="managedInstaller.actions.viewAgentOpsApproval",
            )
        if self.installer_state == "runtime_handoff_blocked":
            return ActionDescriptor(
                action_id="resolve_runtime_gate",
                target_system="agent_runtime",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                message_key="managedInstaller.actions.resolveRuntimeGate",
            )
        return ActionDescriptor(
            action_id="copy_installer_diagnostic",
            target_system="agent_store",
            enabled=True,
            requires_permission=False,
            audit_required=True,
            message_key="managedInstaller.actions.copyDiagnostic",
        )


def build_managed_installer_preview(
    *,
    agent_id: str,
    agent_version: str,
    package: Mapping[str, object],
    policy_approval_echo: Mapping[str, object],
    installation_runtime_handoff: Mapping[str, object],
    installer_probe: Mapping[str, object] | None = None,
    trace_id: str,
    audit_id: str,
) -> ManagedInstallerPreview:
    installer_probe = installer_probe if isinstance(installer_probe, Mapping) else {}
    issues: list[ManagedInstallerIssue] = []
    issues.extend(_download_issues(package))
    issues.extend(_signature_issues(package))
    issues.extend(_policy_issues(policy_approval_echo))
    issues.extend(_runtime_issues(installation_runtime_handoff))
    issues.extend(_smoke_test_issues(installer_probe))

    installer_state = _installer_state(tuple(issues), installer_probe)
    diagnostics = _diagnostics(installer_state, tuple(issues), installer_probe)
    steps = _steps(
        package=package,
        policy_approval_echo=policy_approval_echo,
        installation_runtime_handoff=installation_runtime_handoff,
        installer_probe=installer_probe,
        installer_state=installer_state,
        diagnostics=diagnostics,
    )

    return ManagedInstallerPreview(
        trace_id=trace_id,
        audit_id=audit_id,
        agent_id=agent_id,
        agent_version=agent_version,
        installer_state=installer_state,
        package=_package_snapshot(package),
        policy_gate=_policy_gate(policy_approval_echo),
        runtime_gate=_runtime_gate(installation_runtime_handoff),
        isolation=_isolation(installer_probe),
        smoke_test=_smoke_test(installer_probe),
        steps=steps,
        issues=tuple(issues),
        diagnostics=diagnostics,
        source_of_truth={
            "package": "agent_store_package_trust",
            "policy_approval": "agentops_via_policy_approval_echo",
            "runtime_handoff": "agent_store_installation_runtime_handoff",
            "installer_execution": "not_started_preview_only",
            "diagnostics": "agent_store_preview",
        },
    )


def _download_issues(
    package: Mapping[str, object],
) -> tuple[ManagedInstallerIssue, ...]:
    download_state = _download_state(package)
    if download_state == "available":
        return ()
    return (
        ManagedInstallerIssue(
            issue_id="DOWNLOAD_SOURCE_UNAVAILABLE",
            field_path="package.download_state",
            severity="blocked",
            reason="Package download source is missing or failed.",
            impact="Managed installer cannot download the artifact.",
            fix_action_id="refresh_package_download",
            message_key="managedInstaller.downloadSourceUnavailable",
        ),
    )


def _signature_issues(
    package: Mapping[str, object],
) -> tuple[ManagedInstallerIssue, ...]:
    signature_state = _string(package.get("signature_state"))
    hash_match_state = _string(package.get("hash_match_state"))
    if signature_state == "verified" and hash_match_state == "matched":
        return ()
    return (
        ManagedInstallerIssue(
            issue_id="SIGNATURE_OR_HASH_UNTRUSTED",
            field_path="package.signature_state",
            severity="blocked",
            reason="Package signature or artifact hash is not trusted.",
            impact="Managed installer must not install an unverifiable package.",
            fix_action_id="regenerate_package_signature",
            message_key="managedInstaller.signatureOrHashUntrusted",
        ),
    )


def _policy_issues(
    policy_approval_echo: Mapping[str, object],
) -> tuple[ManagedInstallerIssue, ...]:
    projection = _mapping(policy_approval_echo.get("store_projection"))
    if (
        _string(policy_approval_echo.get("echo_state")) == "policy_allowed"
        and projection.get("store_may_continue") is True
        and projection.get("capability_grant_issued") is False
    ):
        return ()
    return (
        ManagedInstallerIssue(
            issue_id="POLICY_APPROVAL_NOT_ALLOWED",
            field_path="policy_approval_echo.echo_state",
            severity="blocked",
            reason="AgentOps policy or approval echo does not allow Store to continue.",
            impact="Managed installer must wait for AgentOps policy and approval authority.",
            fix_action_id="view_agentops_approval",
            message_key="managedInstaller.policyApprovalNotAllowed",
        ),
    )


def _runtime_issues(
    installation_runtime_handoff: Mapping[str, object],
) -> tuple[ManagedInstallerIssue, ...]:
    if (
        _string(installation_runtime_handoff.get("handoff_state"))
        == "runtime_handoff_ready"
        and installation_runtime_handoff.get("runtime_consumption_allowed") is True
    ):
        return ()
    return (
        ManagedInstallerIssue(
            issue_id="RUNTIME_HANDOFF_NOT_READY",
            field_path="installation_runtime_handoff.handoff_state",
            severity="blocked",
            reason="Installation Runtime handoff is not consumable by Runtime.",
            impact="Managed installer cannot safely isolate and activate the package.",
            fix_action_id="resolve_runtime_gate",
            message_key="managedInstaller.runtimeHandoffNotReady",
        ),
    )


def _smoke_test_issues(
    installer_probe: Mapping[str, object],
) -> tuple[ManagedInstallerIssue, ...]:
    if _smoke_test_state(installer_probe) != "failed":
        return ()
    return (
        ManagedInstallerIssue(
            issue_id="SMOKE_TEST_FAILED",
            field_path="installer_probe.smoke_test_state",
            severity="blocked",
            reason="Installer smoke test failed in preview diagnostics.",
            impact="Managed installer cannot be marked ready until diagnostics are resolved.",
            fix_action_id="copy_installer_diagnostic",
            message_key="managedInstaller.smokeTestFailed",
        ),
    )


def _installer_state(
    issues: tuple[ManagedInstallerIssue, ...],
    installer_probe: Mapping[str, object],
) -> str:
    issue_ids = {issue.issue_id for issue in issues}
    if "DOWNLOAD_SOURCE_UNAVAILABLE" in issue_ids:
        return "download_blocked"
    if "SIGNATURE_OR_HASH_UNTRUSTED" in issue_ids:
        return "signature_blocked"
    if "POLICY_APPROVAL_NOT_ALLOWED" in issue_ids:
        return "policy_blocked"
    if "RUNTIME_HANDOFF_NOT_READY" in issue_ids:
        return "runtime_handoff_blocked"
    if "SMOKE_TEST_FAILED" in issue_ids:
        return "smoke_test_failed"
    if _smoke_test_state(installer_probe) == "passed":
        return "preview_passed"
    return "ready_to_install_preview"


def _steps(
    *,
    package: Mapping[str, object],
    policy_approval_echo: Mapping[str, object],
    installation_runtime_handoff: Mapping[str, object],
    installer_probe: Mapping[str, object],
    installer_state: str,
    diagnostics: Mapping[str, object],
) -> tuple[ManagedInstallerStep, ...]:
    download_ok = _download_state(package) == "available"
    signature_ok = (
        _string(package.get("signature_state")) == "verified"
        and _string(package.get("hash_match_state")) == "matched"
    )
    policy_ok = _string(policy_approval_echo.get("echo_state")) == "policy_allowed"
    runtime_ok = (
        _string(installation_runtime_handoff.get("handoff_state"))
        == "runtime_handoff_ready"
        and installation_runtime_handoff.get("runtime_consumption_allowed") is True
    )
    smoke_state = _smoke_test_state(installer_probe)
    diagnostic_ref = _string(diagnostics.get("diagnostic_ref"))
    return (
        ManagedInstallerStep(
            step_id="download_artifact",
            label="下载安装包",
            step_state="completed" if download_ok else "blocked",
            owner_system="agent_store",
            diagnostic_ref=diagnostic_ref if not download_ok else "",
        ),
        ManagedInstallerStep(
            step_id="verify_signature",
            label="校验签名与 hash",
            step_state=_dependent_state(download_ok, signature_ok),
            owner_system="agent_store",
            diagnostic_ref=diagnostic_ref if download_ok and not signature_ok else "",
        ),
        ManagedInstallerStep(
            step_id="create_isolated_install",
            label="创建隔离安装",
            step_state=_isolation_step_state(
                download_ok, signature_ok, policy_ok, runtime_ok
            ),
            owner_system="agent_runtime",
            diagnostic_ref=(
                diagnostic_ref
                if installer_state in {"policy_blocked", "runtime_handoff_blocked"}
                else ""
            ),
        ),
        ManagedInstallerStep(
            step_id="smoke_test",
            label="运行 smoke test",
            step_state=_smoke_step_state(
                download_ok, signature_ok, policy_ok, runtime_ok, smoke_state
            ),
            owner_system="agent_runtime",
            diagnostic_ref=diagnostic_ref if smoke_state == "failed" else "",
        ),
        ManagedInstallerStep(
            step_id="failure_diagnostics",
            label="生成失败诊断",
            step_state="ready"
            if installer_state not in {"ready_to_install_preview", "preview_passed"}
            else "not_required",
            owner_system="agent_store",
            diagnostic_ref=diagnostic_ref,
        ),
    )


def _dependent_state(previous_ok: bool, current_ok: bool) -> str:
    if not previous_ok:
        return "blocked"
    return "completed" if current_ok else "blocked"


def _isolation_step_state(
    download_ok: bool,
    signature_ok: bool,
    policy_ok: bool,
    runtime_ok: bool,
) -> str:
    if not (download_ok and signature_ok):
        return "blocked"
    if policy_ok and runtime_ok:
        return "ready"
    return "blocked"


def _smoke_step_state(
    download_ok: bool,
    signature_ok: bool,
    policy_ok: bool,
    runtime_ok: bool,
    smoke_state: str,
) -> str:
    if not (download_ok and signature_ok and policy_ok and runtime_ok):
        return "blocked"
    if smoke_state == "passed":
        return "passed"
    if smoke_state == "failed":
        return "failed"
    return "pending"


def _package_snapshot(package: Mapping[str, object]) -> dict[str, object]:
    return {
        "package_id": _string(package.get("package_id")),
        "artifact_hash": _string(package.get("artifact_hash")),
        "artifact_url": _string(package.get("artifact_url")),
        "download_state": _download_state(package),
        "signature_state": _string(package.get("signature_state")),
        "hash_match_state": _string(package.get("hash_match_state")),
    }


def _policy_gate(policy_approval_echo: Mapping[str, object]) -> dict[str, object]:
    projection = _mapping(policy_approval_echo.get("store_projection"))
    return {
        "echo_state": _string(policy_approval_echo.get("echo_state")),
        "store_may_continue": projection.get("store_may_continue") is True,
        "store_override_allowed": projection.get("store_override_allowed") is True,
        "capability_grant_issued": projection.get("capability_grant_issued") is True,
    }


def _runtime_gate(
    installation_runtime_handoff: Mapping[str, object],
) -> dict[str, object]:
    installation = _mapping(installation_runtime_handoff.get("installation"))
    return {
        "handoff_state": _string(installation_runtime_handoff.get("handoff_state")),
        "runtime_consumption_allowed": (
            installation_runtime_handoff.get("runtime_consumption_allowed") is True
        ),
        "installation_id": _string(installation.get("installation_id")),
        "device_id": _string(installation.get("device_id")),
    }


def _isolation(installer_probe: Mapping[str, object]) -> dict[str, object]:
    return {
        "isolation_profile": _string(installer_probe.get("isolation_profile"))
        or "basic_sandbox",
        "network_mode": _string(installer_probe.get("network_mode")) or "policy_bound",
        "filesystem_mode": _string(installer_probe.get("filesystem_mode"))
        or "scoped_write",
    }


def _smoke_test(installer_probe: Mapping[str, object]) -> dict[str, object]:
    return {
        "smoke_test_state": _smoke_test_state(installer_probe),
        "smoke_test_ref": _string(installer_probe.get("smoke_test_ref")),
    }


def _diagnostics(
    installer_state: str,
    issues: tuple[ManagedInstallerIssue, ...],
    installer_probe: Mapping[str, object],
) -> dict[str, object]:
    first_issue = issues[0] if issues else None
    diagnostic_ref = _string(installer_probe.get("diagnostic_ref")) or (
        f"diag-{installer_state}"
    )
    return {
        "diagnostic_ref": diagnostic_ref,
        "failure_stage": first_issue.field_path if first_issue else "",
        "reason_code": first_issue.issue_id if first_issue else "",
        "copyable": first_issue is not None,
    }


def _download_state(package: Mapping[str, object]) -> str:
    state = _string(package.get("download_state")) or (
        "available" if _string(package.get("artifact_url")) else "missing"
    )
    return state if state in DOWNLOAD_STATES else "failed"


def _smoke_test_state(installer_probe: Mapping[str, object]) -> str:
    state = _string(installer_probe.get("smoke_test_state")) or "not_run"
    return state if state in SMOKE_TEST_STATES else "failed"
