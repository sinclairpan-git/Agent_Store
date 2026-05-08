window.AgentStoreMock = {
  agentCatalog: [
    {
      agent_id: "framework.ai-autosdlc",
      display_name: "Ai_AutoSDLC",
      summary: "官方 SDLC Framework Capability，支持本地 standalone 使用与企业证据闭环接入。",
      capability_type: "SDLC Framework",
      agent_type: "framework_capability",
      version: "1.0.0",
      owner_team: "SDLC Platform",
      release_status: "manual_installable-preview",
      trust_state: "trusted",
      enterprise_state: "required_unactivated",
      evidence_level: "L5-capable",
      installability: "activation_required",
      use_cases: ["governed delivery", "trusted evidence loop", "manual activation preview"],
      primary_action: {
        action_id: "start_enterprise_activation",
        target_system: "agent_store",
        enabled: true,
        href: "#activation-framework.ai-autosdlc"
      }
    },
    {
      agent_id: "agentops.evidence-reporter",
      display_name: "Evidence Reporter",
      summary: "负责把运行证据、签名事件和诊断摘要回传到 AgentOps。",
      capability_type: "Evidence Connector",
      agent_type: "agent",
      version: "0.4.0",
      owner_team: "AgentOps",
      release_status: "draft",
      trust_state: "warning",
      enterprise_state: "active",
      evidence_level: "L3-summary",
      installability: "installable",
      use_cases: ["evidence upload", "signature test", "diagnostic sync"],
      primary_action: {
        action_id: "start_install",
        target_system: "agentops",
        enabled: true,
        href: "#install-agentops.evidence-reporter"
      }
    },
    {
      agent_id: "security.policy-guard",
      display_name: "Policy Guard",
      summary: "在安装、激活和运行时回显策略阻断原因与恢复动作。",
      capability_type: "Runtime Policy",
      agent_type: "agent",
      version: "0.2.1",
      owner_team: "Security",
      release_status: "design",
      trust_state: "blocked",
      enterprise_state: "disabled",
      evidence_level: "pending",
      installability: "blocked",
      use_cases: ["runtime policy", "denied reason", "recovery action"],
      primary_action: {
        action_id: "view_policy",
        target_system: "agent_store",
        enabled: false,
        href: "#"
      }
    },
    {
      agent_id: "developer.release-notes",
      display_name: "Release Notes Writer",
      summary: "根据治理证据、变更记录和检查结果生成可审计发布说明。",
      capability_type: "Developer Tool",
      agent_type: "skill",
      version: "0.1.2",
      owner_team: "Developer Experience",
      release_status: "draft",
      trust_state: "warning",
      enterprise_state: "detected_optional",
      evidence_level: "L2-static",
      installability: "installable",
      use_cases: ["release note", "change summary", "check evidence"],
      primary_action: {
        action_id: "start_install",
        target_system: "agent_store",
        enabled: true,
        href: "#install-developer.release-notes"
      }
    }
  ],
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
    governance_load: {
      adapter_state: "materialized",
      load_verification_method: "agentops_summary_pending_signature_test",
      verified_at: "",
      evidence_hash: "",
      degraded_reason: "credential_issued_but_signature_test_pending",
      unsupported_reason: ""
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
    bootstrap_status: "credential_issued",
    current_step: "send_signature_test_event",
    step_status: "running",
    next_poll_after: 5,
    retryable: true,
    diagnostic_ref: "diag-trace-1",
    source_of_truth: "agentops",
    entry_evidence: [
      "agentops_credential_echo",
      "installation_id_match",
      "device_id_match"
    ],
    conflict_resolution: "agentops_bootstrap_echo_after_identity_match",
    can_ignore: false,
    affected_actions: ["send_signature_test_event"],
    source_conflicts: [],
    primary_action: {
      action_id: "send_signature_test_event",
      target_system: "ai_autosdlc_cli",
      enabled: true
    },
    recommended_actions: [
      {
        action_id: "send_signature_test_event",
        target_system: "ai_autosdlc_cli",
        enabled: true,
        audit_required: true,
        href: "#signature-test"
      },
      {
        action_id: "poll_bootstrap_status",
        target_system: "agent_store",
        enabled: true,
        audit_required: false,
        href: "#bootstrap-status"
      },
      {
        action_id: "copy_diagnostic_ref",
        target_system: "agent_store",
        enabled: true,
        audit_required: false,
        href: "#diag-trace-1"
      }
    ],
    timeline: [
      {
        step_id: "create_installation",
        label: "Create installation and device binding",
        owner_system: "agent_store",
        status: "completed",
        source: "agent_store",
        action_id: "create_installation"
      },
      {
        step_id: "issue_assertion",
        label: "Issue signed_installation_assertion.v1",
        owner_system: "agent_store",
        status: "completed",
        source: "agent_store",
        action_id: "issue_installation_assertion"
      },
      {
        step_id: "collect_device_proof",
        label: "Collect device_proof.v1 from Ai_AutoSDLC",
        owner_system: "ai_autosdlc",
        status: "completed",
        source: "ai_autosdlc",
        action_id: "collect_device_proof"
      },
      {
        step_id: "issue_credential",
        label: "Issue AgentOps credential echo",
        owner_system: "agentops",
        status: "completed",
        source: "agentops",
        action_id: "issue_credentials"
      },
      {
        step_id: "verify_signature_test",
        label: "Verify signed test event",
        owner_system: "agentops",
        status: "pending",
        source: "pending",
        action_id: "send_signature_test_event"
      }
    ]
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
    credential_bootstrap: {
      bootstrap_status: "credential_issued",
      credential_status: "active",
      reporter_status: "pending_signature_test",
      enterprise_state: "activating",
      next_action: "send_signature_test_event",
      credential_id: "cred-fixture",
      token_id: "token-fixture",
      device_key_id: "device-key-fixture",
      installation_id: "inst-1",
      device_id: "dev-1"
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
    trusted_loop_verified: false,
    actual_l5_display_allowed: false,
    checked_refs: [
      "inst-1",
      "sha256:first",
      "credential_issued",
      "pending_signature_test",
      "actual_l5_blocked_until_agentops_verification"
    ]
  },
  stateDecision: {
    state: "degraded",
    degraded_reason: "state_source_conflict:agent_store=active,agentops=degraded"
  }
};
