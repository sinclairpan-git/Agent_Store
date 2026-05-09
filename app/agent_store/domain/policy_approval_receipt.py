from __future__ import annotations

from dataclasses import dataclass
from typing import Mapping

from agent_store import SCHEMA_VERSION

from .actions import ActionDescriptor
from .status_registry import SEVERITIES


POLICY_APPROVAL_RECEIPT_SCHEMA_VERSION = "policy_approval_receipt.v1"
SUPPORTED_RECEIPT_STATUSES = frozenset({"accepted", "pending", "rejected"})


def _string(value: object) -> str:
    return value.strip() if isinstance(value, str) else ""


def _mapping(value: object) -> Mapping[str, object]:
    return value if isinstance(value, Mapping) else {}


@dataclass(frozen=True)
class PolicyApprovalReceiptIssue:
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
class PolicyApprovalReceipt:
    trace_id: str
    audit_id: str
    agent_id: str
    agent_version: str
    requested_action: str
    receipt_state: str
    approval_request_ref: dict[str, str]
    agentops_receipt: dict[str, object]
    store_projection: dict[str, object]
    issues: tuple[PolicyApprovalReceiptIssue, ...]
    source_of_truth: dict[str, str]

    def to_response(self) -> dict[str, object]:
        return {
            "schema_version": SCHEMA_VERSION,
            "trace_id": self.trace_id,
            "error_code": "OK",
            "audit_id": self.audit_id,
            "policy_approval_receipt": self.to_dict(),
        }

    def to_dict(self) -> dict[str, object]:
        return {
            "contract_schema_version": POLICY_APPROVAL_RECEIPT_SCHEMA_VERSION,
            "agent_id": self.agent_id,
            "agent_version": self.agent_version,
            "requested_action": self.requested_action,
            "receipt_state": self.receipt_state,
            "approval_request_ref": self.approval_request_ref,
            "agentops_receipt": self.agentops_receipt,
            "store_projection": self.store_projection,
            "issues": [issue.to_dict() for issue in self.issues],
            "source_of_truth": self.source_of_truth,
            "next_action": self.next_action.to_dict(),
        }

    @property
    def next_action(self) -> ActionDescriptor:
        if self.receipt_state == "approval_receipt_accepted":
            return ActionDescriptor(
                action_id="view_agentops_approval",
                target_system="agentops",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                href=_string(self.agentops_receipt.get("request_access_url")) or None,
                message_key="policyApprovalReceipt.actions.viewAgentOpsApproval",
            )
        if self.receipt_state == "approval_receipt_pending":
            return ActionDescriptor(
                action_id="poll_agentops_approval_receipt",
                target_system="agentops",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                message_key="policyApprovalReceipt.actions.pollReceipt",
            )
        if self.receipt_state == "approval_receipt_rejected":
            return ActionDescriptor(
                action_id="fix_agentops_approval_request",
                target_system="agent_store",
                enabled=True,
                requires_permission=True,
                audit_required=True,
                message_key="policyApprovalReceipt.actions.fixRequest",
            )
        return ActionDescriptor(
            action_id="refresh_agentops_approval_receipt",
            target_system="agentops",
            enabled=True,
            requires_permission=True,
            audit_required=True,
            message_key="policyApprovalReceipt.actions.refreshReceipt",
        )


def build_policy_approval_receipt(
    *,
    approval_request: Mapping[str, object],
    agentops_receipt: Mapping[str, object],
    trace_id: str,
    audit_id: str,
) -> PolicyApprovalReceipt:
    request_ref = _approval_request_ref(approval_request)
    receipt_snapshot = _agentops_receipt_snapshot(agentops_receipt)
    issues = tuple(
        _request_ref_issues(request_ref)
        + _receipt_issues(receipt_snapshot)
        + _binding_issues(request_ref, receipt_snapshot)
    )
    receipt_state = _receipt_state(receipt_snapshot, issues)

    return PolicyApprovalReceipt(
        trace_id=trace_id,
        audit_id=audit_id,
        agent_id=request_ref["agent_id"],
        agent_version=request_ref["agent_version"],
        requested_action=request_ref["requested_action"],
        receipt_state=receipt_state,
        approval_request_ref=request_ref,
        agentops_receipt=receipt_snapshot,
        store_projection=_store_projection(receipt_state),
        issues=issues,
        source_of_truth={
            "approval_request": "agent_store",
            "approval_receipt": "agentops",
            "policy_decision": "agentops_not_decided_by_receipt",
            "approval": "agentops",
            "capability_grant": "agentops_not_issued_by_store",
            "store_projection": "agent_store_receipt_only",
        },
    )


def _approval_request_ref(request: Mapping[str, object]) -> dict[str, str]:
    request_contract = _string(request.get("contract_schema_version")) or _string(
        request.get("request_contract")
    )
    return {
        "request_contract": request_contract,
        "agent_id": _string(request.get("agent_id")),
        "agent_version": _string(request.get("agent_version")),
        "requested_action": _string(request.get("requested_action")),
        "store_audit_id": _string(request.get("store_audit_id"))
        or _string(request.get("audit_id")),
    }


def _agentops_receipt_snapshot(receipt: Mapping[str, object]) -> dict[str, object]:
    return {
        "receipt_contract": _string(receipt.get("receipt_contract")),
        "approval_request_id": _string(receipt.get("approval_request_id")),
        "approval_id": _string(receipt.get("approval_id")),
        "receipt_status": _string(receipt.get("receipt_status")),
        "agent_id": _string(receipt.get("agent_id")),
        "agent_version": _string(receipt.get("agent_version")),
        "requested_action": _string(receipt.get("requested_action")),
        "request_access_url": _string(receipt.get("request_access_url")),
        "agentops_audit_id": _string(receipt.get("agentops_audit_id")),
        "received_at": _string(receipt.get("received_at")),
        "rejection_reason": _string(receipt.get("rejection_reason")),
    }


def _request_ref_issues(
    request_ref: Mapping[str, str],
) -> list[PolicyApprovalReceiptIssue]:
    if (
        request_ref["request_contract"] != "policy_approval_request.v1"
        or not request_ref["agent_id"]
        or not request_ref["agent_version"]
        or not request_ref["requested_action"]
    ):
        return [
            PolicyApprovalReceiptIssue(
                issue_id="APPROVAL_REQUEST_REF_INVALID",
                field_path="approval_request",
                severity="blocked",
                reason="Approval receipt must bind to a valid Store approval request.",
                impact="Store cannot safely display an AgentOps receipt without the originating request.",
                fix_action_id="attach_policy_approval_request",
                message_key="policyApprovalReceipt.requestRefInvalid",
            )
        ]
    return []


def _receipt_issues(
    receipt: Mapping[str, object],
) -> list[PolicyApprovalReceiptIssue]:
    issues: list[PolicyApprovalReceiptIssue] = []
    if receipt["receipt_contract"] != POLICY_APPROVAL_RECEIPT_SCHEMA_VERSION:
        issues.append(
            PolicyApprovalReceiptIssue(
                issue_id="AGENTOPS_RECEIPT_CONTRACT_UNSUPPORTED",
                field_path="agentops_receipt.receipt_contract",
                severity="blocked",
                reason="AgentOps receipt contract is unsupported.",
                impact="Store must not reinterpret unknown AgentOps receipt payloads.",
                fix_action_id="refresh_agentops_approval_receipt",
                message_key="policyApprovalReceipt.contractUnsupported",
            )
        )
    if receipt["receipt_status"] not in SUPPORTED_RECEIPT_STATUSES:
        issues.append(
            PolicyApprovalReceiptIssue(
                issue_id="AGENTOPS_RECEIPT_STATUS_UNSUPPORTED",
                field_path="agentops_receipt.receipt_status",
                severity="blocked",
                reason="AgentOps receipt status is unsupported.",
                impact="Store cannot route approval UX from an unknown receipt state.",
                fix_action_id="refresh_agentops_approval_receipt",
                message_key="policyApprovalReceipt.statusUnsupported",
            )
        )
    required = (
        "approval_request_id",
        "approval_id",
        "agent_id",
        "agent_version",
        "requested_action",
        "agentops_audit_id",
        "received_at",
    )
    if any(not _string(receipt.get(field)) for field in required):
        issues.append(
            PolicyApprovalReceiptIssue(
                issue_id="AGENTOPS_RECEIPT_INCOMPLETE",
                field_path="agentops_receipt",
                severity="blocked",
                reason="AgentOps approval receipt is missing required receipt fields.",
                impact="Store cannot audit or link the AgentOps approval request.",
                fix_action_id="refresh_agentops_approval_receipt",
                message_key="policyApprovalReceipt.incomplete",
            )
        )
    return issues


def _binding_issues(
    request_ref: Mapping[str, str],
    receipt: Mapping[str, object],
) -> list[PolicyApprovalReceiptIssue]:
    if not request_ref["agent_id"] or not _string(receipt.get("agent_id")):
        return []
    mismatched = [
        field
        for field in ("agent_id", "agent_version", "requested_action")
        if request_ref[field] != _string(receipt.get(field))
    ]
    if not mismatched:
        return []
    return [
        PolicyApprovalReceiptIssue(
            issue_id="APPROVAL_RECEIPT_REQUEST_MISMATCH",
            field_path="agentops_receipt",
            severity="blocked",
            reason="AgentOps receipt does not match the Store approval request.",
            impact="Store must not attach an approval receipt to the wrong Agent request.",
            fix_action_id="refresh_agentops_approval_receipt",
            message_key="policyApprovalReceipt.requestMismatch",
        )
    ]


def _receipt_state(
    receipt: Mapping[str, object],
    issues: tuple[PolicyApprovalReceiptIssue, ...],
) -> str:
    if issues:
        return "approval_receipt_unavailable"
    status = _string(receipt.get("receipt_status"))
    if status == "accepted":
        return "approval_receipt_accepted"
    if status == "pending":
        return "approval_receipt_pending"
    return "approval_receipt_rejected"


def _store_projection(receipt_state: str) -> dict[str, object]:
    return {
        "projection_mode": "agentops_receipt_only",
        "store_decision_authority": "none",
        "store_override_allowed": False,
        "capability_grant_issued": False,
        "approval_decision_final": False,
        "approval_flow_linked": receipt_state
        in {"approval_receipt_accepted", "approval_receipt_pending"},
    }
