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
      audience: "研发团队 / 交付负责人",
      discovery_bucket: ["recommended", "enterprise", "guarded"],
      product_tags: ["官方", "治理闭环", "SDLC"],
      rating_summary: "4.9 / 5",
      adoption: "2.4k workspaces",
      setup_minutes: 12,
      recommendation_score: 98,
      discovery_reasons: [
        "官方框架能力，适合需要阶段门禁和证据闭环的团队",
        "支持 standalone 使用，企业接入后可进入 AgentOps 可信回显"
      ],
      prerequisites: [
        "需要确认企业策略",
        "真实 L5 展示等待 AgentOps 签名测试"
      ],
      expected_outcomes: [
        "生成可追溯阶段证据",
        "把安装、断言和 AgentOps 回显串成闭环"
      ],
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
      audience: "平台工程 / AgentOps 管理员",
      discovery_bucket: ["recommended", "ready", "guarded"],
      product_tags: ["证据同步", "可安装", "AgentOps"],
      rating_summary: "4.6 / 5",
      adoption: "840 installs",
      setup_minutes: 8,
      recommendation_score: 91,
      discovery_reasons: [
        "适合把本地运行证据同步到 AgentOps 的团队",
        "已具备安装路径，但仍需要后端事实源确认可信摘要"
      ],
      prerequisites: [
        "需要 AgentOps tenant",
        "需要 reporter credential"
      ],
      expected_outcomes: [
        "回传诊断摘要",
        "支撑签名测试事件"
      ],
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
      audience: "安全团队 / 策略管理员",
      discovery_bucket: ["guarded", "enterprise"],
      product_tags: ["策略", "阻断说明", "恢复动作"],
      rating_summary: "待发布",
      adoption: "design preview",
      setup_minutes: 18,
      recommendation_score: 42,
      discovery_reasons: [
        "用于解释运行时策略阻断和恢复路径",
        "当前目录状态阻断，不允许直接安装"
      ],
      prerequisites: [
        "需要 Security 复核",
        "需要补充可信证据"
      ],
      expected_outcomes: [
        "展示阻断原因",
        "引导 Owner / Security 复核"
      ],
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
      audience: "开发者 / Release Owner",
      discovery_bucket: ["ready", "local"],
      product_tags: ["发布说明", "本地增强", "低接入成本"],
      rating_summary: "4.4 / 5",
      adoption: "320 installs",
      setup_minutes: 5,
      recommendation_score: 78,
      discovery_reasons: [
        "适合需要从变更证据生成发布说明的团队",
        "企业接入可选，能先以本地工作流试用"
      ],
      prerequisites: [
        "需要可读变更记录",
        "需要人工复核输出内容"
      ],
      expected_outcomes: [
        "生成发布摘要",
        "减少手工整理检查结果"
      ],
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
  runtimeAvailability: {
    "framework.ai-autosdlc": {
      audit_id: "audit-runtime-framework.ai-autosdlc",
      contract_schema_version: "runtime_availability_summary.v1",
      agent_id: "framework.ai-autosdlc",
      agent_version: "1.0.0",
      artifact_hash: "sha256:framework",
      availability_state: "runtime_capability_missing",
      display_name_zh: "缺 Runtime 能力",
      reason: "Runtime echo 缺少 policy_check 与 outbox，不能把该版本展示为可运行。",
      required_runtime_contract_version: "runtime-contract.v2",
      runtime_contract_version: "runtime-contract.v2",
      required_runtime_capabilities: [
        "tool_call",
        "policy_check",
        "outbox",
        "basic_isolation"
      ],
      runtime_capabilities: ["tool_call", "basic_isolation"],
      missing_runtime_capabilities: ["policy_check", "outbox"],
      issues: [
        {
          issue_id: "RUNTIME_CAPABILITY_MISSING",
          field_path: "runtime_availability.capabilities",
          severity: "blocked",
          fix_action_id: "view_missing_runtime_capabilities"
        }
      ],
      source_of_truth: {
        agent_manifest: "agent_store",
        runtime_availability: "agent_runtime_echo_or_probe",
        summary_projection: "agent_store",
        policy_decision: "agentops"
      },
      runtime_facts: {
        runtime_present: true,
        runtime_id: "runtime.local",
        availability_echo_state: "available",
        probe_ref: "runtime-probe-framework",
        observed_at: "2026-05-09T08:00:00Z"
      },
      next_action: {
        action_id: "view_missing_runtime_capabilities",
        target_system: "agent_runtime",
        enabled: true,
        requires_permission: false,
        audit_required: true
      }
    },
    "agentops.evidence-reporter": {
      audit_id: "audit-runtime-agentops.evidence-reporter",
      contract_schema_version: "runtime_availability_summary.v1",
      agent_id: "agentops.evidence-reporter",
      agent_version: "0.4.0",
      artifact_hash: "sha256:evidence-reporter",
      availability_state: "runtime_ready",
      display_name_zh: "可运行",
      reason: "Runtime echo 满足 Manifest 版本与能力要求，可继续安装审核。",
      required_runtime_contract_version: "runtime-contract.v2",
      runtime_contract_version: "runtime-contract.v2",
      required_runtime_capabilities: ["tool_call", "outbox", "basic_isolation"],
      runtime_capabilities: ["tool_call", "outbox", "basic_isolation"],
      missing_runtime_capabilities: [],
      issues: [],
      source_of_truth: {
        agent_manifest: "agent_store",
        runtime_availability: "agent_runtime_echo_or_probe",
        summary_projection: "agent_store",
        policy_decision: "agentops"
      },
      runtime_facts: {
        runtime_present: true,
        runtime_id: "runtime.enterprise",
        availability_echo_state: "available",
        probe_ref: "runtime-probe-agentops",
        observed_at: "2026-05-09T08:02:00Z"
      },
      next_action: {
        action_id: "continue_listing_review",
        target_system: "agent_store",
        enabled: true,
        requires_permission: true,
        audit_required: true
      }
    },
    "security.policy-guard": {
      audit_id: "audit-runtime-security.policy-guard",
      contract_schema_version: "runtime_availability_summary.v1",
      agent_id: "security.policy-guard",
      agent_version: "0.2.1",
      artifact_hash: "sha256:policy-guard",
      availability_state: "runtime_upgrade_required",
      display_name_zh: "需升级 Runtime",
      reason: "Runtime contract 版本低于 Manifest 要求，不能展示为可运行。",
      required_runtime_contract_version: "runtime-contract.v2",
      runtime_contract_version: "runtime-contract.v1",
      required_runtime_capabilities: ["policy_check", "basic_isolation"],
      runtime_capabilities: ["policy_check", "basic_isolation"],
      missing_runtime_capabilities: [],
      issues: [
        {
          issue_id: "RUNTIME_UPGRADE_REQUIRED",
          field_path: "runtime_availability.runtime_contract_version",
          severity: "blocked",
          fix_action_id: "upgrade_runtime"
        }
      ],
      source_of_truth: {
        agent_manifest: "agent_store",
        runtime_availability: "agent_runtime_echo_or_probe",
        summary_projection: "agent_store",
        policy_decision: "agentops"
      },
      runtime_facts: {
        runtime_present: true,
        runtime_id: "runtime.security-preview",
        availability_echo_state: "available",
        probe_ref: "runtime-probe-security",
        observed_at: "2026-05-09T08:03:00Z"
      },
      next_action: {
        action_id: "upgrade_runtime",
        target_system: "agent_runtime",
        enabled: true,
        requires_permission: true,
        audit_required: true
      }
    },
    "developer.release-notes": {
      audit_id: "audit-runtime-developer.release-notes",
      contract_schema_version: "runtime_availability_summary.v1",
      agent_id: "developer.release-notes",
      agent_version: "0.1.2",
      artifact_hash: "sha256:release-notes",
      availability_state: "runtime_missing",
      display_name_zh: "缺 Runtime",
      reason: "没有 Runtime echo/probe 可证明当前环境具备可运行 Runtime。",
      required_runtime_contract_version: "runtime-contract.v1",
      runtime_contract_version: "",
      required_runtime_capabilities: ["tool_call"],
      runtime_capabilities: [],
      missing_runtime_capabilities: [],
      issues: [
        {
          issue_id: "RUNTIME_MISSING",
          field_path: "runtime_availability.runtime_present",
          severity: "blocked",
          fix_action_id: "install_runtime"
        }
      ],
      source_of_truth: {
        agent_manifest: "agent_store",
        runtime_availability: "agent_runtime_echo_or_probe",
        summary_projection: "agent_store",
        policy_decision: "agentops"
      },
      runtime_facts: {
        runtime_present: false,
        runtime_id: "",
        availability_echo_state: "missing",
        probe_ref: "",
        observed_at: ""
      },
      next_action: {
        action_id: "install_runtime",
        target_system: "agent_runtime",
        enabled: true,
        requires_permission: true,
        audit_required: true
      }
    }
  },
  healthSummaryFreshness: {
    "framework.ai-autosdlc": {
      audit_id: "audit-health-framework.ai-autosdlc",
      contract_schema_version: "health_summary_freshness.v1",
      agent_id: "framework.ai-autosdlc",
      agent_version: "1.0.0",
      health_summary_id: "health-framework-ai-autosdlc-1",
      freshness_state: "health_refresh_required",
      display_name_zh: "待刷新",
      reason: "AgentOps HealthSummary valid_until 已过期，只能展示待刷新。",
      health_state: "healthy",
      calculated_at: "2026-05-09T07:30:00Z",
      valid_until: "2026-05-09T08:00:00Z",
      observed_window_start: "2026-05-09T07:00:00Z",
      observed_window_end: "2026-05-09T07:30:00Z",
      signal_count: 12,
      recommendation_basis_allowed: false,
      issues: [
        {
          issue_id: "HEALTH_SUMMARY_EXPIRED",
          field_path: "agentops_health_summary.valid_until",
          severity: "warning",
          fix_action_id: "refresh_agentops_health_summary"
        }
      ],
      source_of_truth: {
        health_summary: "agentops",
        summary_projection: "agent_store",
        recommendation: "recommendation_state_excludes_health_summary",
        policy_decision: "agentops"
      },
      health_facts: {
        health_summary_present: true,
        agentops_trace_id: "trace-health-framework",
        evidence_summary_id: "evidence-health-framework"
      },
      next_action: {
        action_id: "refresh_agentops_health_summary",
        target_system: "agentops",
        enabled: true,
        requires_permission: true,
        audit_required: true
      }
    },
    "agentops.evidence-reporter": {
      audit_id: "audit-health-agentops.evidence-reporter",
      contract_schema_version: "health_summary_freshness.v1",
      agent_id: "agentops.evidence-reporter",
      agent_version: "0.4.0",
      health_summary_id: "health-agentops-evidence-reporter-1",
      freshness_state: "health_fresh",
      display_name_zh: "健康摘要新鲜",
      reason: "AgentOps HealthSummary 在有效期内且报告 healthy。",
      health_state: "healthy",
      calculated_at: "2026-05-09T08:04:00Z",
      valid_until: "2026-05-09T08:34:00Z",
      observed_window_start: "2026-05-09T07:34:00Z",
      observed_window_end: "2026-05-09T08:04:00Z",
      signal_count: 9,
      recommendation_basis_allowed: false,
      issues: [],
      source_of_truth: {
        health_summary: "agentops",
        summary_projection: "agent_store",
        recommendation: "recommendation_state_excludes_health_summary",
        policy_decision: "agentops"
      },
      health_facts: {
        health_summary_present: true,
        agentops_trace_id: "trace-health-agentops",
        evidence_summary_id: "evidence-health-agentops"
      },
      next_action: {
        action_id: "continue_health_review",
        target_system: "agent_store",
        enabled: true,
        requires_permission: false,
        audit_required: true
      }
    },
    "security.policy-guard": {
      audit_id: "audit-health-security.policy-guard",
      contract_schema_version: "health_summary_freshness.v1",
      agent_id: "security.policy-guard",
      agent_version: "0.2.1",
      health_summary_id: "health-security-policy-guard-1",
      freshness_state: "health_attention_required",
      display_name_zh: "健康需关注",
      reason: "AgentOps HealthSummary 仍新鲜，但报告 degraded。",
      health_state: "degraded",
      calculated_at: "2026-05-09T08:03:00Z",
      valid_until: "2026-05-09T08:33:00Z",
      observed_window_start: "2026-05-09T07:33:00Z",
      observed_window_end: "2026-05-09T08:03:00Z",
      signal_count: 5,
      recommendation_basis_allowed: false,
      issues: [
        {
          issue_id: "AGENTOPS_HEALTH_ATTENTION",
          field_path: "agentops_health_summary.health_state",
          severity: "warning",
          fix_action_id: "view_agentops_health_detail"
        }
      ],
      source_of_truth: {
        health_summary: "agentops",
        summary_projection: "agent_store",
        recommendation: "recommendation_state_excludes_health_summary",
        policy_decision: "agentops"
      },
      health_facts: {
        health_summary_present: true,
        agentops_trace_id: "trace-health-security",
        evidence_summary_id: "evidence-health-security"
      },
      next_action: {
        action_id: "view_agentops_health_detail",
        target_system: "agentops",
        enabled: true,
        requires_permission: true,
        audit_required: true
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
