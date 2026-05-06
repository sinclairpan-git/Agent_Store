window.AgentStoreMock = {
  officialView: {
    display_name: "Ai_AutoSDLC",
    summary: "官方 SDLC Framework Capability，支持本地 standalone 使用与企业证据闭环接入。",
    use_cases: ["governed delivery", "trusted evidence loop", "manual activation preview"],
    capability_type: "SDLC Framework",
    actual_l5_display_allowed: false,
    l5_display_state: "l5_capable_pending_verification",
    primary_action: {
      action_id: "open_standalone_readme",
      target_system: "ai_autosdlc_cli",
      enabled: true,
      href: "#standalone"
    },
    enterprise_activation_action: {
      action_id: "start_enterprise_activation",
      target_system: "agent_store",
      enabled: true,
      href: "#activation"
    },
    maintenance: {
      owner_team: "SDLC Platform",
      owner_user: "owner@example.com",
      version: "1.0.0",
      release_status: "manual_installable-preview"
    },
    package_trust_summary: {
      package_id: "framework.ai-autosdlc@1.0.0",
      trust_state: "trusted",
      signature_state: "verified",
      hash_match_state: "matched",
      issuer_display: "Agent Store"
    },
    enterprise_context: {
      integration_mode: "enterprise_managed",
      enterprise_state: "required_unactivated",
      required_by: "security-baseline",
      source: "tenant_policy",
      policy_owner: "Security",
      policy_version: "2026.05",
      can_ignore: false,
      affected_actions: ["actual_l5_display", "enterprise_activation"],
      requires_enterprise: true
    },
    role_visible_sections: [
      "summary",
      "use_cases",
      "current_user_installability",
      "package_trust_summary",
      "enterprise_context",
      "traceability"
    ],
    accessibility_contract: {
      status_live_update: {
        enabled: true,
        message_key: "officialApp.status.updated"
      }
    }
  },
  bootstrap: {
    installation_id: "inst-1",
    bootstrap_status: "assertion_issued",
    current_step: "issue_credential",
    step_status: "running",
    next_poll_after: 5,
    retryable: true,
    diagnostic_ref: "diag-trace-1",
    primary_action: {
      action_id: "poll_bootstrap_status",
      target_system: "agent_store",
      enabled: true
    }
  },
  agentops: {
    trace_id: "trace-1",
    quality_evidence: {
      evidence_level: "L5-capable",
      summary_validity_state: "fresh",
      confidence: 0.82,
      missing_evidence: [],
      score_template_id: "agentops-owned"
    },
    approval: {
      approval_id: "approval-1",
      status: "approved",
      audit_id: "audit-1"
    },
    runtime_policy: {
      policy_ref: "policy-1",
      fallback_action: "warn",
      runtime_risk_level: "low",
      enforcement_mode: "warn"
    },
    links: [
      {
        rel: "evidence_summary",
        target_system: "agentops",
        href: "#agentops-evidence",
        trace_id: "trace-1"
      },
      {
        rel: "evidence_request_access",
        target_system: "evidence_vault",
        href: "#request-access",
        trace_id: "trace-1",
        audit_id: "audit-1",
        permission_state: "denied",
        redaction_reason: "raw_evidence_access_denied"
      }
    ]
  },
  trustedLoop: {
    trusted_loop_verified: true,
    actual_l5_display_allowed: false,
    checked_refs: ["inst-1", "sha256:first", "run-1", "session-1", "evidence-1", "event-1"]
  },
  stateDecision: {
    state: "degraded",
    degraded_reason: "state_source_conflict:agent_store=active,agentops=degraded"
  }
};
