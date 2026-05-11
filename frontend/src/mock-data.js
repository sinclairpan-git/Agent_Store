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
  installationDistribution: {
    "framework.ai-autosdlc": {
      contract_schema_version: "installation_distribution_summary.v1",
      agent_id: "framework.ai-autosdlc",
      requested_version: "1.0.0",
      distribution_state: "distribution_ready",
      permission_state: "allowed",
      total_installations: 18,
      active_installations: 14,
      revoked_installations: 1,
      failed_installations: 3,
      status_counts: {
        activation_required: 6,
        reporter_pending: 8,
        failed: 3,
        revoked: 1
      },
      os_counts: {
        darwin: 9,
        linux: 6,
        windows: 3
      },
      version_counts: {
        "1.0.0": 18
      },
      enterprise_state_counts: {
        active: 12,
        pending: 4,
        suspended: 2
      },
      notification: {
        notification_required: true,
        affected_installation_count: 4,
        reason_code: "attention_required",
        target_version: "1.0.0"
      },
      privacy: {
        individual_users_exposed: false,
        device_ids_exposed: false,
        installation_ids_exposed: false,
        minimum_role: "owner",
        aggregation_only: true
      },
      issues: [
        {
          issue_id: "INDIVIDUAL_IDENTIFIERS_STRIPPED",
          field_path: "installation_facts[0]",
          severity: "warning",
          fix_action_id: "strip_individual_installation_identifiers"
        }
      ],
      source_of_truth: {
        installation_inventory: "agent_store",
        device_binding: "agent_store",
        permission: "agent_store_viewer_context",
        quality: "agentops_not_computed_here",
        projection: "agent_store"
      },
      next_action: {
        action_id: "prepare_owner_notification",
        target_system: "agent_store",
        enabled: true,
        requires_permission: true,
        audit_required: true
      }
    },
    "agentops.evidence-reporter": {
      contract_schema_version: "installation_distribution_summary.v1",
      agent_id: "agentops.evidence-reporter",
      requested_version: "0.4.0",
      distribution_state: "permission_required",
      permission_state: "permission_required",
      total_installations: 0,
      active_installations: 0,
      revoked_installations: 0,
      failed_installations: 0,
      status_counts: {},
      os_counts: {},
      version_counts: {},
      enterprise_state_counts: {},
      notification: {
        notification_required: false,
        affected_installation_count: 0,
        reason_code: "none",
        target_version: "0.4.0"
      },
      privacy: {
        individual_users_exposed: false,
        device_ids_exposed: false,
        installation_ids_exposed: false,
        minimum_role: "owner",
        aggregation_only: true
      },
      issues: [
        {
          issue_id: "OWNER_DISTRIBUTION_PERMISSION_REQUIRED",
          field_path: "viewer_context",
          severity: "blocked",
          fix_action_id: "request_owner_distribution_permission"
        }
      ],
      source_of_truth: {
        installation_inventory: "agent_store",
        device_binding: "agent_store",
        permission: "agent_store_viewer_context",
        quality: "agentops_not_computed_here",
        projection: "agent_store"
      },
      next_action: {
        action_id: "request_owner_distribution_permission",
        target_system: "agent_store",
        enabled: true,
        requires_permission: true,
        audit_required: true
      }
    },
    "security.policy-guard": {
      contract_schema_version: "installation_distribution_summary.v1",
      agent_id: "security.policy-guard",
      requested_version: "0.2.1",
      distribution_state: "distribution_unavailable",
      permission_state: "allowed",
      total_installations: 0,
      active_installations: 0,
      revoked_installations: 0,
      failed_installations: 0,
      status_counts: {},
      os_counts: {},
      version_counts: {},
      enterprise_state_counts: {},
      notification: {
        notification_required: false,
        affected_installation_count: 0,
        reason_code: "none",
        target_version: "0.2.1"
      },
      privacy: {
        individual_users_exposed: false,
        device_ids_exposed: false,
        installation_ids_exposed: false,
        minimum_role: "owner",
        aggregation_only: true
      },
      issues: [
        {
          issue_id: "INSTALLATION_INVENTORY_REQUIRED",
          field_path: "installation_facts",
          severity: "blocked",
          fix_action_id: "refresh_installation_inventory"
        }
      ],
      source_of_truth: {
        installation_inventory: "agent_store",
        device_binding: "agent_store",
        permission: "agent_store_viewer_context",
        quality: "agentops_not_computed_here",
        projection: "agent_store"
      },
      next_action: {
        action_id: "refresh_installation_inventory",
        target_system: "agent_store",
        enabled: true,
        requires_permission: true,
        audit_required: true
      }
    },
    "developer.release-notes": {
      contract_schema_version: "installation_distribution_summary.v1",
      agent_id: "developer.release-notes",
      requested_version: "0.1.2",
      distribution_state: "empty_distribution",
      permission_state: "allowed",
      total_installations: 0,
      active_installations: 0,
      revoked_installations: 0,
      failed_installations: 0,
      status_counts: {},
      os_counts: {},
      version_counts: {},
      enterprise_state_counts: {},
      notification: {
        notification_required: false,
        affected_installation_count: 0,
        reason_code: "none",
        target_version: "0.1.2"
      },
      privacy: {
        individual_users_exposed: false,
        device_ids_exposed: false,
        installation_ids_exposed: false,
        minimum_role: "owner",
        aggregation_only: true
      },
      issues: [
        {
          issue_id: "VERSION_INSTALLATION_SCOPE_EMPTY",
          field_path: "requested_version",
          severity: "warning",
          fix_action_id: "select_version_with_installations"
        }
      ],
      source_of_truth: {
        installation_inventory: "agent_store",
        device_binding: "agent_store",
        permission: "agent_store_viewer_context",
        quality: "agentops_not_computed_here",
        projection: "agent_store"
      },
      next_action: {
        action_id: "continue_owner_distribution_review",
        target_system: "agent_store",
        enabled: true,
        requires_permission: true,
        audit_required: true
      }
    }
  },
  feedbackOwnerResponseLoops: {
    "framework.ai-autosdlc": {
      contract_schema_version: "feedback_owner_response_loop.v1",
      feedback_id: "fb-framework-runtime-copy",
      agent_id: "framework.ai-autosdlc",
      agent_version: "1.0.0",
      feedback_state: "owner_replied",
      previous_state: "triaged",
      transition_action: "owner_reply",
      feedback: {
        feedback_id: "fb-framework-runtime-copy",
        agent_id: "framework.ai-autosdlc",
        agent_version: "1.0.0",
        feedback_state: "triaged",
        title: "Runtime gate copy is unclear",
        feedback_type: "usability",
        severity: "warning",
        submitted_by: "requester@example.com"
      },
      owner_response: {
        owner_response_required: true,
        actor_id: "owner-sdlc-platform",
        actor_role: "owner",
        message: "We will clarify the Runtime capability wording before the next patch.",
        commitment: "next_patch"
      },
      release_linkage: {
        release_required: false,
        release_ref: "",
        release_version: "",
        released_at: ""
      },
      timeline: [
        {
          event_id: "feedback-event-framework-submit",
          transition_action: "submit",
          result_state: "submitted",
          actor_id: "requester@example.com",
          actor_role: "requester",
          message: "Runtime gate copy is unclear.",
          occurred_at: "2026-05-09T10:00:00Z",
          audit_id: "audit-feedback-framework-submit",
          trace_id: "trace-feedback-framework-submit"
        },
        {
          event_id: "feedback-event-framework-owner-reply",
          transition_action: "owner_reply",
          result_state: "owner_replied",
          actor_id: "owner-sdlc-platform",
          actor_role: "owner",
          message: "We will clarify the Runtime capability wording before the next patch.",
          occurred_at: "2026-05-09T12:00:00Z",
          audit_id: "audit-feedback-framework-reply",
          trace_id: "trace-feedback-framework-reply"
        }
      ],
      issues: [],
      source_of_truth: {
        feedback: "agent_store_feedback",
        owner_response: "agent_store_owner_response",
        release_linkage: "agent_store_release_linkage",
        notifications: "agent_store_notification_queue"
      },
      next_action: {
        action_id: "plan_or_reject_feedback",
        target_system: "agent_store",
        enabled: true,
        requires_permission: true,
        audit_required: true
      }
    },
    "agentops.evidence-reporter": {
      contract_schema_version: "feedback_owner_response_loop.v1",
      feedback_id: "fb-agentops-evidence-export",
      agent_id: "agentops.evidence-reporter",
      agent_version: "0.4.0",
      feedback_state: "triaged",
      previous_state: "submitted",
      transition_action: "triage",
      feedback: {
        feedback_id: "fb-agentops-evidence-export",
        agent_id: "agentops.evidence-reporter",
        agent_version: "0.4.0",
        feedback_state: "submitted",
        title: "Evidence export needs Owner response",
        feedback_type: "feature_request",
        severity: "info",
        submitted_by: "analyst@example.com"
      },
      owner_response: {
        owner_response_required: false,
        actor_id: "triage-agent-store",
        actor_role: "triage",
        message: "Routed to Owner for response.",
        commitment: ""
      },
      release_linkage: {
        release_required: false,
        release_ref: "",
        release_version: "",
        released_at: ""
      },
      timeline: [
        {
          event_id: "feedback-event-agentops-triage",
          transition_action: "triage",
          result_state: "triaged",
          actor_id: "triage-agent-store",
          actor_role: "triage",
          message: "Routed to Owner for response.",
          occurred_at: "2026-05-09T11:00:00Z",
          audit_id: "audit-feedback-agentops-triage",
          trace_id: "trace-feedback-agentops-triage"
        }
      ],
      issues: [],
      source_of_truth: {
        feedback: "agent_store_feedback",
        owner_response: "agent_store_owner_response",
        release_linkage: "agent_store_release_linkage",
        notifications: "agent_store_notification_queue"
      },
      next_action: {
        action_id: "request_owner_response",
        target_system: "agent_store",
        enabled: true,
        requires_permission: true,
        audit_required: true
      }
    },
    "security.policy-guard": {
      contract_schema_version: "feedback_owner_response_loop.v1",
      feedback_id: "fb-security-policy-release",
      agent_id: "security.policy-guard",
      agent_version: "0.2.1",
      feedback_state: "released",
      previous_state: "fixed",
      transition_action: "release",
      feedback: {
        feedback_id: "fb-security-policy-release",
        agent_id: "security.policy-guard",
        agent_version: "0.2.1",
        feedback_state: "fixed",
        title: "Policy reason should link replacement Agent",
        feedback_type: "bug",
        severity: "warning",
        submitted_by: "security-reviewer@example.com"
      },
      owner_response: {
        owner_response_required: true,
        actor_id: "owner-security",
        actor_role: "owner",
        message: "Fixed by linking replacement Agent and policy reason.",
        commitment: "released"
      },
      release_linkage: {
        release_required: true,
        release_ref: "release://security.policy-guard/0.2.2",
        release_version: "0.2.2",
        released_at: "2026-05-09T13:00:00Z"
      },
      timeline: [
        {
          event_id: "feedback-event-security-fixed",
          transition_action: "fix",
          result_state: "fixed",
          actor_id: "owner-security",
          actor_role: "owner",
          message: "Replacement Agent link fixed.",
          occurred_at: "2026-05-09T12:30:00Z",
          audit_id: "audit-feedback-security-fixed",
          trace_id: "trace-feedback-security-fixed"
        },
        {
          event_id: "feedback-event-security-release",
          transition_action: "release",
          result_state: "released",
          actor_id: "owner-security",
          actor_role: "owner",
          message: "Released with replacement link.",
          occurred_at: "2026-05-09T13:00:00Z",
          audit_id: "audit-feedback-security-release",
          trace_id: "trace-feedback-security-release"
        }
      ],
      issues: [],
      source_of_truth: {
        feedback: "agent_store_feedback",
        owner_response: "agent_store_owner_response",
        release_linkage: "agent_store_release_linkage",
        notifications: "agent_store_notification_queue"
      },
      next_action: {
        action_id: "view_release_notes",
        target_system: "agent_store",
        enabled: true,
        requires_permission: false,
        audit_required: true
      }
    },
    "developer.release-notes": {
      contract_schema_version: "feedback_owner_response_loop.v1",
      feedback_id: "fb-release-notes-owner",
      agent_id: "developer.release-notes",
      agent_version: "0.1.2",
      feedback_state: "triaged",
      previous_state: "triaged",
      transition_action: "owner_reply",
      feedback: {
        feedback_id: "fb-release-notes-owner",
        agent_id: "developer.release-notes",
        agent_version: "0.1.2",
        feedback_state: "triaged",
        title: "Non-owner tried to close feedback",
        feedback_type: "bug",
        severity: "warning",
        submitted_by: "writer@example.com"
      },
      owner_response: {
        owner_response_required: true,
        actor_id: "triage-agent-store",
        actor_role: "triage",
        message: "Attempted owner reply was blocked because actor_role is not owner.",
        commitment: ""
      },
      release_linkage: {
        release_required: false,
        release_ref: "",
        release_version: "",
        released_at: ""
      },
      timeline: [
        {
          event_id: "feedback-event-release-notes-blocked",
          transition_action: "owner_reply",
          result_state: "triaged",
          actor_id: "triage-agent-store",
          actor_role: "triage",
          message: "Attempted owner reply was blocked.",
          occurred_at: "2026-05-09T12:10:00Z",
          audit_id: "audit-feedback-release-notes-blocked",
          trace_id: "trace-feedback-release-notes-blocked"
        }
      ],
      issues: [
        {
          issue_id: "OWNER_RESPONSE_REQUIRED",
          field_path: "transition.actor_role",
          severity: "blocked",
          fix_action_id: "request_owner_response"
        }
      ],
      source_of_truth: {
        feedback: "agent_store_feedback",
        owner_response: "agent_store_owner_response",
        release_linkage: "agent_store_release_linkage",
        notifications: "agent_store_notification_queue"
      },
      next_action: {
        action_id: "request_owner_response",
        target_system: "agent_store",
        enabled: false,
        requires_permission: true,
        audit_required: true
      }
    }
  },
  lifecycleGovernance: {
    "framework.ai-autosdlc": {
      contract_schema_version: "lifecycle_governance_baseline.v1",
      agent_id: "framework.ai-autosdlc",
      current_version: "1.0.0",
      lifecycle_state: "upgrade_available",
      previous_state: "active",
      transition_action: "upgrade",
      actor: {
        actor_id: "owner-sdlc-platform",
        actor_role: "owner",
        reason: "Runtime capability copy and owner summary panels are available in the next version.",
        evidence_ref: ""
      },
      version_scope: {
        agent_id: "framework.ai-autosdlc",
        version: "1.0.0",
        artifact_hash: "sha256:autosdlc-100",
        release_status: "stable",
        lifecycle_state: "active"
      },
      replacement: {
        required: true,
        replacement_version: "1.1.0",
        replacement_reason: "Owner summary frontend consumers are included in the new release."
      },
      rollback: {
        required: false,
        rollback_version: "",
        rollback_reason: ""
      },
      impact_scope: {
        impact_required: false,
        affected_installation_count: 18,
        affected_user_count: 12,
        replacement_available: true,
        notification_required: true
      },
      issues: [],
      source_of_truth: {
        agent_version: "agent_store_agent_version",
        lifecycle_decision: "agent_store_lifecycle_governance",
        replacement: "agent_store_replacement_mapping",
        impact_scope: "agent_store_installation_inventory",
        agentops_notification: "agent_store_notification_queue"
      },
      next_action: {
        action_id: "notify_available_replacement",
        target_system: "agent_store",
        enabled: true,
        requires_permission: true,
        audit_required: true
      }
    },
    "agentops.evidence-reporter": {
      contract_schema_version: "lifecycle_governance_baseline.v1",
      agent_id: "agentops.evidence-reporter",
      current_version: "0.4.0",
      lifecycle_state: "rollback_available",
      previous_state: "active",
      transition_action: "rollback",
      actor: {
        actor_id: "owner-agentops",
        actor_role: "owner",
        reason: "Evidence export regression requires rollback path for existing installations.",
        evidence_ref: ""
      },
      version_scope: {
        agent_id: "agentops.evidence-reporter",
        version: "0.4.0",
        artifact_hash: "sha256:evidence-reporter-040",
        release_status: "stable",
        lifecycle_state: "active"
      },
      replacement: {
        required: false,
        replacement_version: "",
        replacement_reason: ""
      },
      rollback: {
        required: true,
        rollback_version: "0.3.8",
        rollback_reason: "Stable evidence export behavior for owner workflows."
      },
      impact_scope: {
        impact_required: false,
        affected_installation_count: 7,
        affected_user_count: 5,
        replacement_available: true,
        notification_required: true
      },
      issues: [],
      source_of_truth: {
        agent_version: "agent_store_agent_version",
        lifecycle_decision: "agent_store_lifecycle_governance",
        replacement: "agent_store_replacement_mapping",
        impact_scope: "agent_store_installation_inventory",
        agentops_notification: "agent_store_notification_queue"
      },
      next_action: {
        action_id: "notify_available_replacement",
        target_system: "agent_store",
        enabled: true,
        requires_permission: true,
        audit_required: true
      }
    },
    "security.policy-guard": {
      contract_schema_version: "lifecycle_governance_baseline.v1",
      agent_id: "security.policy-guard",
      current_version: "0.2.1",
      lifecycle_state: "security_revoked",
      previous_state: "active",
      transition_action: "security_revoke",
      actor: {
        actor_id: "security-iam",
        actor_role: "security",
        reason: "Policy bypass incident requires terminal security revocation.",
        evidence_ref: "incident://sec-2026-05-policy-guard"
      },
      version_scope: {
        agent_id: "security.policy-guard",
        version: "0.2.1",
        artifact_hash: "sha256:policy-guard-021",
        release_status: "stable",
        lifecycle_state: "active"
      },
      replacement: {
        required: false,
        replacement_version: "",
        replacement_reason: ""
      },
      rollback: {
        required: false,
        rollback_version: "",
        rollback_reason: ""
      },
      impact_scope: {
        impact_required: true,
        affected_installation_count: 3,
        affected_user_count: 3,
        replacement_available: false,
        notification_required: true
      },
      issues: [],
      source_of_truth: {
        agent_version: "agent_store_agent_version",
        lifecycle_decision: "agent_store_lifecycle_governance",
        replacement: "agent_store_replacement_mapping",
        impact_scope: "agent_store_installation_inventory",
        agentops_notification: "agent_store_notification_queue"
      },
      next_action: {
        action_id: "notify_security_revocation",
        target_system: "agentops",
        enabled: true,
        requires_permission: true,
        audit_required: true
      }
    },
    "developer.release-notes": {
      contract_schema_version: "lifecycle_governance_baseline.v1",
      agent_id: "developer.release-notes",
      current_version: "0.1.2",
      lifecycle_state: "security_revoked",
      previous_state: "security_revoked",
      transition_action: "deprecate",
      actor: {
        actor_id: "owner-devtools",
        actor_role: "owner",
        reason: "Owner attempted to downgrade a security revoked version to deprecated.",
        evidence_ref: ""
      },
      version_scope: {
        agent_id: "developer.release-notes",
        version: "0.1.2",
        artifact_hash: "sha256:release-notes-012",
        release_status: "stable",
        lifecycle_state: "security_revoked"
      },
      replacement: {
        required: true,
        replacement_version: "0.1.3",
        replacement_reason: "Blocked downgrade must go through security review first."
      },
      rollback: {
        required: false,
        rollback_version: "",
        rollback_reason: ""
      },
      impact_scope: {
        impact_required: false,
        affected_installation_count: 0,
        affected_user_count: 0,
        replacement_available: true,
        notification_required: true
      },
      issues: [
        {
          issue_id: "SECURITY_REVOKED_TERMINAL",
          field_path: "current_version.lifecycle_state",
          severity: "blocked",
          fix_action_id: "open_security_review"
        }
      ],
      source_of_truth: {
        agent_version: "agent_store_agent_version",
        lifecycle_decision: "agent_store_lifecycle_governance",
        replacement: "agent_store_replacement_mapping",
        impact_scope: "agent_store_installation_inventory",
        agentops_notification: "agent_store_notification_queue"
      },
      next_action: {
        action_id: "fix_lifecycle_transition",
        target_system: "agent_store",
        enabled: true,
        requires_permission: true,
        audit_required: true
      }
    }
  },
  qualityEvidenceAccess: {
    "framework.ai-autosdlc": {
      audit_id: "audit-quality-framework.ai-autosdlc",
      contract_schema_version: "quality_evidence_access_summary.v1",
      agent_id: "framework.ai-autosdlc",
      agent_version: "1.0.0",
      summary_state: "summary_expired",
      permission_state: "allowed",
      display: {
        evidence_level: "L5-capable",
        confidence: 0.91,
        identity_confidence: 0.97,
        missing_evidence: [],
        score_template_id: "agentops-owned",
        calculated_at: "2026-05-09T07:30:00Z",
        valid_until: "2026-05-09T08:00:00Z",
        summary_validity_state: "expired",
        display_label: "待刷新",
        redacted: false
      },
      run_binding: {
        run_id: "run-quality-framework",
        session_id: "session-quality-framework",
        evidence_summary_id: "evidence-quality-framework",
        source_event_count: 12
      },
      access: {
        can_view_quality_summary: true,
        can_view_raw_evidence: false,
        evidence_vault_request_required: true,
        request_access_url: "/evidence-vault/access-requests",
        raw_trace_url: "",
        raw_evidence_url: ""
      },
      raw_trace_exposed: false,
      raw_evidence_exposed: false,
      recommendation_basis_allowed: false,
      issues: [
        {
          issue_id: "QUALITY_SUMMARY_EXPIRED",
          field_path: "quality_evidence.valid_until",
          severity: "warning",
          fix_action_id: "refresh_agentops_quality_summary"
        }
      ],
      source_of_truth: {
        quality_summary: "agentops",
        run_evidence: "agentops",
        raw_evidence: "evidence_vault",
        raw_trace: "evidence_vault",
        permission: "agent_store_viewer_context",
        projection: "agent_store"
      },
      next_action: {
        action_id: "refresh_agentops_quality_summary",
        target_system: "agentops",
        enabled: true,
        requires_permission: true,
        audit_required: true
      }
    },
    "agentops.evidence-reporter": {
      audit_id: "audit-quality-agentops.evidence-reporter",
      contract_schema_version: "quality_evidence_access_summary.v1",
      agent_id: "agentops.evidence-reporter",
      agent_version: "0.4.0",
      summary_state: "summary_ready",
      permission_state: "allowed",
      display: {
        evidence_level: "L4",
        confidence: 0.84,
        identity_confidence: 0.9,
        missing_evidence: [],
        score_template_id: "agentops-owned",
        calculated_at: "2026-05-09T08:04:00Z",
        valid_until: "2026-05-09T09:04:00Z",
        summary_validity_state: "fresh",
        display_label: "可展示",
        redacted: false
      },
      run_binding: {
        run_id: "run-quality-agentops",
        session_id: "session-quality-agentops",
        evidence_summary_id: "evidence-quality-agentops",
        source_event_count: 9
      },
      access: {
        can_view_quality_summary: true,
        can_view_raw_evidence: true,
        evidence_vault_request_required: false,
        request_access_url: "",
        raw_trace_url: "",
        raw_evidence_url: ""
      },
      raw_trace_exposed: false,
      raw_evidence_exposed: false,
      recommendation_basis_allowed: true,
      issues: [
        {
          issue_id: "RAW_EVIDENCE_LINK_STRIPPED",
          field_path: "agentops_summary.raw_links",
          severity: "warning",
          fix_action_id: "strip_raw_evidence_links"
        }
      ],
      source_of_truth: {
        quality_summary: "agentops",
        run_evidence: "agentops",
        raw_evidence: "evidence_vault",
        raw_trace: "evidence_vault",
        permission: "agent_store_viewer_context",
        projection: "agent_store"
      },
      next_action: {
        action_id: "continue_quality_evidence_review",
        target_system: "agent_store",
        enabled: true,
        requires_permission: true,
        audit_required: true
      }
    },
    "security.policy-guard": {
      audit_id: "audit-quality-security.policy-guard",
      contract_schema_version: "quality_evidence_access_summary.v1",
      agent_id: "security.policy-guard",
      agent_version: "0.2.1",
      summary_state: "summary_redacted",
      permission_state: "summary_redacted",
      display: {
        evidence_level: "redacted",
        confidence: null,
        identity_confidence: null,
        missing_evidence: [],
        score_template_id: "",
        calculated_at: "",
        valid_until: "",
        summary_validity_state: "degraded",
        display_label: "待刷新",
        redacted: true
      },
      run_binding: {
        run_id: "run-quality-security",
        session_id: "session-quality-security",
        evidence_summary_id: "evidence-quality-security",
        source_event_count: 5
      },
      access: {
        can_view_quality_summary: false,
        can_view_raw_evidence: false,
        evidence_vault_request_required: true,
        request_access_url: "/evidence-vault/requests/security-policy-guard",
        raw_trace_url: "",
        raw_evidence_url: ""
      },
      raw_trace_exposed: false,
      raw_evidence_exposed: false,
      recommendation_basis_allowed: false,
      issues: [
        {
          issue_id: "QUALITY_SUMMARY_REDACTED",
          field_path: "viewer_context",
          severity: "warning",
          fix_action_id: "request_evidence_access"
        }
      ],
      source_of_truth: {
        quality_summary: "agentops",
        run_evidence: "agentops",
        raw_evidence: "evidence_vault",
        raw_trace: "evidence_vault",
        permission: "agent_store_viewer_context",
        projection: "agent_store"
      },
      next_action: {
        action_id: "request_evidence_access",
        target_system: "evidence_vault",
        enabled: true,
        requires_permission: true,
        audit_required: true,
        href: "/evidence-vault/requests/security-policy-guard"
      }
    },
    "developer.release-notes": {
      audit_id: "audit-quality-developer.release-notes",
      contract_schema_version: "quality_evidence_access_summary.v1",
      agent_id: "developer.release-notes",
      agent_version: "0.1.2",
      summary_state: "template_deprecated",
      permission_state: "allowed",
      display: {
        evidence_level: "L2-static",
        confidence: 0.64,
        identity_confidence: 0.72,
        missing_evidence: ["signed_run_evidence"],
        score_template_id: "agentops-legacy",
        calculated_at: "2026-05-09T08:01:00Z",
        valid_until: "2026-05-09T09:01:00Z",
        summary_validity_state: "fresh",
        display_label: "可展示",
        redacted: false
      },
      run_binding: {
        run_id: "run-quality-release-notes",
        session_id: "session-quality-release-notes",
        evidence_summary_id: "evidence-quality-release-notes",
        source_event_count: 3
      },
      access: {
        can_view_quality_summary: true,
        can_view_raw_evidence: false,
        evidence_vault_request_required: true,
        request_access_url: "/evidence-vault/access-requests",
        raw_trace_url: "",
        raw_evidence_url: ""
      },
      raw_trace_exposed: false,
      raw_evidence_exposed: false,
      recommendation_basis_allowed: false,
      issues: [
        {
          issue_id: "SCORE_TEMPLATE_DEPRECATED",
          field_path: "quality_evidence.score_template_id",
          severity: "warning",
          fix_action_id: "request_score_template_refresh"
        }
      ],
      source_of_truth: {
        quality_summary: "agentops",
        run_evidence: "agentops",
        raw_evidence: "evidence_vault",
        raw_trace: "evidence_vault",
        permission: "agent_store_viewer_context",
        projection: "agent_store"
      },
      next_action: {
        action_id: "request_score_template_refresh",
        target_system: "agentops",
        enabled: true,
        requires_permission: true,
        audit_required: true
      }
    }
  },
  storeOpsDeepLinks: {
    "framework.ai-autosdlc": {
      contract_schema_version: "store_ops_deep_link.v1",
      agent_id: "framework.ai-autosdlc",
      agent_version: "1.0.0",
      health_summary_id: "health-framework-1",
      run_id: "run-quality-framework",
      session_id: "session-quality-framework",
      evidence_summary_id: "evidence-quality-framework",
      link_state: "deep_link_ready",
      permission_state: "allowed",
      target: {
        system: "agentops",
        route: "run_detail",
        href: "/agentops/runs/run-quality-framework",
        params: {
          run_id: "run-quality-framework",
          session_id: "session-quality-framework",
          return_path: "/agent-store/agents/framework-ai-autosdlc"
        },
        raw_trace_url: "",
        raw_evidence_url: ""
      },
      return_path: "/agent-store/agents/framework-ai-autosdlc",
      raw_trace_exposed: false,
      raw_evidence_exposed: false,
      issues: [],
      source_of_truth: {
        health_summary: "agentops",
        run_detail: "agentops",
        permission: "agent_store_viewer_context",
        raw_trace: "evidence_vault",
        projection: "agent_store"
      },
      next_action: {
        action_id: "open_agentops_run_detail",
        target_system: "agentops",
        enabled: true,
        requires_permission: true,
        audit_required: true,
        href: "/agentops/runs/run-quality-framework"
      }
    },
    "agentops.evidence-reporter": {
      contract_schema_version: "store_ops_deep_link.v1",
      agent_id: "agentops.evidence-reporter",
      agent_version: "0.4.0",
      health_summary_id: "health-agentops-1",
      run_id: "run-quality-agentops",
      session_id: "session-quality-agentops",
      evidence_summary_id: "evidence-quality-agentops",
      link_state: "link_sanitized",
      permission_state: "allowed",
      target: {
        system: "agentops",
        route: "run_detail",
        href: "/agentops/runs/run-quality-agentops",
        params: {
          run_id: "run-quality-agentops",
          session_id: "session-quality-agentops",
          return_path: "/agent-store/agents/agentops-evidence-reporter"
        },
        raw_trace_url: "",
        raw_evidence_url: ""
      },
      return_path: "/agent-store/agents/agentops-evidence-reporter",
      raw_trace_exposed: false,
      raw_evidence_exposed: false,
      issues: [
        {
          issue_id: "RAW_TRACE_LINK_STRIPPED",
          field_path: "agentops_raw_links",
          severity: "warning",
          fix_action_id: "strip_raw_trace_links"
        }
      ],
      source_of_truth: {
        health_summary: "agentops",
        run_detail: "agentops",
        permission: "agent_store_viewer_context",
        raw_trace: "evidence_vault",
        projection: "agent_store"
      },
      next_action: {
        action_id: "open_sanitized_agentops_run_detail",
        target_system: "agentops",
        enabled: true,
        requires_permission: true,
        audit_required: true,
        href: "/agentops/runs/run-quality-agentops"
      }
    },
    "security.policy-guard": {
      contract_schema_version: "store_ops_deep_link.v1",
      agent_id: "security.policy-guard",
      agent_version: "0.2.1",
      health_summary_id: "health-security-1",
      run_id: "run-quality-security",
      session_id: "session-quality-security",
      evidence_summary_id: "evidence-quality-security",
      link_state: "permission_required",
      permission_state: "evidence_vault_required",
      target: {
        system: "agentops",
        route: "run_detail",
        href: "",
        params: {
          run_id: "run-quality-security",
          session_id: "session-quality-security",
          return_path: "/agent-store/agents/security-policy-guard"
        },
        raw_trace_url: "",
        raw_evidence_url: ""
      },
      return_path: "/agent-store/agents/security-policy-guard",
      raw_trace_exposed: false,
      raw_evidence_exposed: false,
      issues: [],
      source_of_truth: {
        health_summary: "agentops",
        run_detail: "agentops",
        permission: "agent_store_viewer_context",
        raw_trace: "evidence_vault",
        projection: "agent_store"
      },
      next_action: {
        action_id: "request_evidence_access",
        target_system: "evidence_vault",
        enabled: true,
        requires_permission: true,
        audit_required: true,
        href: "/evidence-vault/access-requests"
      }
    },
    "developer.release-notes": {
      contract_schema_version: "store_ops_deep_link.v1",
      agent_id: "developer.release-notes",
      agent_version: "0.1.2",
      health_summary_id: "health-release-notes-1",
      run_id: "",
      session_id: "",
      evidence_summary_id: "evidence-quality-release-notes",
      link_state: "link_unavailable",
      permission_state: "unavailable",
      target: {
        system: "agentops",
        route: "run_detail",
        href: "",
        params: {
          run_id: "",
          session_id: "",
          return_path: "/agent-store/agents/developer-release-notes"
        },
        raw_trace_url: "",
        raw_evidence_url: ""
      },
      return_path: "/agent-store/agents/developer-release-notes",
      raw_trace_exposed: false,
      raw_evidence_exposed: false,
      issues: [
        {
          issue_id: "RUN_ID_REQUIRED",
          field_path: "agentops_health_summary.run_id",
          severity: "blocked",
          fix_action_id: "request_agentops_summary_with_run_binding"
        },
        {
          issue_id: "SESSION_ID_REQUIRED",
          field_path: "agentops_health_summary.session_id",
          severity: "blocked",
          fix_action_id: "request_agentops_summary_with_run_binding"
        }
      ],
      source_of_truth: {
        health_summary: "agentops",
        run_detail: "agentops",
        permission: "agent_store_viewer_context",
        raw_trace: "evidence_vault",
        projection: "agent_store"
      },
      next_action: {
        action_id: "request_agentops_summary_with_run_binding",
        target_system: "agentops",
        enabled: true,
        requires_permission: true,
        audit_required: true
      }
    }
  },
  managedInstallerPreviews: {
    "framework.ai-autosdlc": {
      contract_schema_version: "managed_installer_preview.v1",
      agent_id: "framework.ai-autosdlc",
      agent_version: "1.0.0",
      installer_state: "ready_to_install_preview",
      execution_mode: "preview_only",
      real_install_started: false,
      package: {
        package_id: "pkg-framework-ai-autosdlc",
        artifact_hash: "sha256:ai-autosdlc-1.0.0",
        artifact_url: "/packages/framework-ai-autosdlc-1.0.0.tgz",
        download_state: "available",
        signature_state: "verified",
        hash_match_state: "matched"
      },
      policy_gate: {
        echo_state: "policy_allowed",
        store_may_continue: true,
        store_override_allowed: false,
        capability_grant_issued: false
      },
      runtime_gate: {
        handoff_state: "runtime_handoff_ready",
        runtime_consumption_allowed: true,
        installation_id: "inst-framework-001",
        device_id: "device-owner-macos"
      },
      isolation: {
        isolation_profile: "basic_sandbox",
        network_mode: "policy_bound",
        filesystem_mode: "scoped_write"
      },
      smoke_test: {
        smoke_test_state: "not_run",
        smoke_test_ref: "smoke://framework.ai-autosdlc/1.0.0"
      },
      steps: [
        {
          step_id: "download_artifact",
          label: "下载安装包",
          step_state: "completed",
          owner_system: "agent_store",
          diagnostic_ref: ""
        },
        {
          step_id: "verify_signature",
          label: "校验签名与 hash",
          step_state: "completed",
          owner_system: "agent_store",
          diagnostic_ref: ""
        },
        {
          step_id: "create_isolated_install",
          label: "创建隔离安装",
          step_state: "ready",
          owner_system: "agent_runtime",
          diagnostic_ref: ""
        },
        {
          step_id: "smoke_test",
          label: "运行 smoke test",
          step_state: "pending",
          owner_system: "agent_runtime",
          diagnostic_ref: ""
        },
        {
          step_id: "failure_diagnostics",
          label: "生成失败诊断",
          step_state: "not_required",
          owner_system: "agent_store",
          diagnostic_ref: "diag-ready-to-install-preview"
        }
      ],
      issues: [],
      diagnostics: {
        diagnostic_ref: "diag-ready-to-install-preview",
        failure_stage: "",
        reason_code: "",
        copyable: false
      },
      source_of_truth: {
        package: "agent_store_package_trust",
        policy_approval: "agentops_via_policy_approval_echo",
        runtime_handoff: "agent_store_installation_runtime_handoff",
        installer_execution: "not_started_preview_only",
        diagnostics: "agent_store_preview"
      },
      next_action: {
        action_id: "prepare_managed_install",
        target_system: "agent_store",
        enabled: true,
        requires_permission: true,
        audit_required: true
      }
    },
    "agentops.evidence-reporter": {
      contract_schema_version: "managed_installer_preview.v1",
      agent_id: "agentops.evidence-reporter",
      agent_version: "0.4.0",
      installer_state: "policy_blocked",
      execution_mode: "preview_only",
      real_install_started: false,
      package: {
        package_id: "pkg-agentops-evidence-reporter",
        artifact_hash: "sha256:evidence-reporter-0.4.0",
        artifact_url: "/packages/agentops-evidence-reporter-0.4.0.tgz",
        download_state: "available",
        signature_state: "verified",
        hash_match_state: "matched"
      },
      policy_gate: {
        echo_state: "approval_pending",
        store_may_continue: false,
        store_override_allowed: false,
        capability_grant_issued: false
      },
      runtime_gate: {
        handoff_state: "runtime_handoff_ready",
        runtime_consumption_allowed: true,
        installation_id: "inst-evidence-001",
        device_id: "device-owner-linux"
      },
      isolation: {
        isolation_profile: "basic_sandbox",
        network_mode: "policy_bound",
        filesystem_mode: "scoped_write"
      },
      smoke_test: {
        smoke_test_state: "not_run",
        smoke_test_ref: "smoke://agentops.evidence-reporter/0.4.0"
      },
      steps: [
        {
          step_id: "download_artifact",
          label: "下载安装包",
          step_state: "completed",
          owner_system: "agent_store",
          diagnostic_ref: ""
        },
        {
          step_id: "verify_signature",
          label: "校验签名与 hash",
          step_state: "completed",
          owner_system: "agent_store",
          diagnostic_ref: ""
        },
        {
          step_id: "create_isolated_install",
          label: "创建隔离安装",
          step_state: "blocked",
          owner_system: "agent_runtime",
          diagnostic_ref: "diag-policy-blocked"
        },
        {
          step_id: "smoke_test",
          label: "运行 smoke test",
          step_state: "blocked",
          owner_system: "agent_runtime",
          diagnostic_ref: "diag-policy-blocked"
        },
        {
          step_id: "failure_diagnostics",
          label: "生成失败诊断",
          step_state: "ready",
          owner_system: "agent_store",
          diagnostic_ref: "diag-policy-blocked"
        }
      ],
      issues: [
        {
          issue_id: "POLICY_APPROVAL_NOT_ALLOWED",
          field_path: "policy_approval_echo.echo_state",
          severity: "blocked",
          reason: "AgentOps approval is still pending.",
          impact: "Managed installer must wait for AgentOps authority.",
          fix_action_id: "view_agentops_approval",
          message_key: "managedInstaller.policyApprovalNotAllowed"
        }
      ],
      diagnostics: {
        diagnostic_ref: "diag-policy-blocked",
        failure_stage: "policy_approval_echo.echo_state",
        reason_code: "POLICY_APPROVAL_NOT_ALLOWED",
        copyable: true
      },
      source_of_truth: {
        package: "agent_store_package_trust",
        policy_approval: "agentops_via_policy_approval_echo",
        runtime_handoff: "agent_store_installation_runtime_handoff",
        installer_execution: "not_started_preview_only",
        diagnostics: "agent_store_preview"
      },
      next_action: {
        action_id: "view_agentops_approval",
        target_system: "agentops",
        enabled: true,
        requires_permission: true,
        audit_required: true,
        href: "/agentops/approvals/approval-evidence-reporter"
      }
    },
    "security.policy-guard": {
      contract_schema_version: "managed_installer_preview.v1",
      agent_id: "security.policy-guard",
      agent_version: "0.2.1",
      installer_state: "signature_blocked",
      execution_mode: "preview_only",
      real_install_started: false,
      package: {
        package_id: "pkg-security-policy-guard",
        artifact_hash: "sha256:security-policy-guard-0.2.1",
        artifact_url: "/packages/security-policy-guard-0.2.1.tgz",
        download_state: "available",
        signature_state: "mismatch",
        hash_match_state: "mismatch"
      },
      policy_gate: {
        echo_state: "policy_denied",
        store_may_continue: false,
        store_override_allowed: false,
        capability_grant_issued: false
      },
      runtime_gate: {
        handoff_state: "runtime_handoff_ready",
        runtime_consumption_allowed: true,
        installation_id: "inst-security-001",
        device_id: "device-security-windows"
      },
      isolation: {
        isolation_profile: "basic_sandbox",
        network_mode: "policy_bound",
        filesystem_mode: "scoped_write"
      },
      smoke_test: {
        smoke_test_state: "not_run",
        smoke_test_ref: "smoke://security.policy-guard/0.2.1"
      },
      steps: [
        {
          step_id: "download_artifact",
          label: "下载安装包",
          step_state: "completed",
          owner_system: "agent_store",
          diagnostic_ref: ""
        },
        {
          step_id: "verify_signature",
          label: "校验签名与 hash",
          step_state: "blocked",
          owner_system: "agent_store",
          diagnostic_ref: "diag-signature-blocked"
        },
        {
          step_id: "create_isolated_install",
          label: "创建隔离安装",
          step_state: "blocked",
          owner_system: "agent_runtime",
          diagnostic_ref: "diag-signature-blocked"
        },
        {
          step_id: "smoke_test",
          label: "运行 smoke test",
          step_state: "blocked",
          owner_system: "agent_runtime",
          diagnostic_ref: "diag-signature-blocked"
        },
        {
          step_id: "failure_diagnostics",
          label: "生成失败诊断",
          step_state: "ready",
          owner_system: "agent_store",
          diagnostic_ref: "diag-signature-blocked"
        }
      ],
      issues: [
        {
          issue_id: "SIGNATURE_OR_HASH_UNTRUSTED",
          field_path: "package.signature_state",
          severity: "blocked",
          reason: "Package signature or hash does not match.",
          impact: "Managed installer must not install an unverifiable package.",
          fix_action_id: "regenerate_package_signature",
          message_key: "managedInstaller.signatureOrHashUntrusted"
        }
      ],
      diagnostics: {
        diagnostic_ref: "diag-signature-blocked",
        failure_stage: "package.signature_state",
        reason_code: "SIGNATURE_OR_HASH_UNTRUSTED",
        copyable: true
      },
      source_of_truth: {
        package: "agent_store_package_trust",
        policy_approval: "agentops_via_policy_approval_echo",
        runtime_handoff: "agent_store_installation_runtime_handoff",
        installer_execution: "not_started_preview_only",
        diagnostics: "agent_store_preview"
      },
      next_action: {
        action_id: "regenerate_package_signature",
        target_system: "agent_store",
        enabled: true,
        requires_permission: true,
        audit_required: true
      }
    },
    "developer.release-notes": {
      contract_schema_version: "managed_installer_preview.v1",
      agent_id: "developer.release-notes",
      agent_version: "0.1.2",
      installer_state: "smoke_test_failed",
      execution_mode: "preview_only",
      real_install_started: false,
      package: {
        package_id: "pkg-developer-release-notes",
        artifact_hash: "sha256:developer-release-notes-0.1.2",
        artifact_url: "/packages/developer-release-notes-0.1.2.tgz",
        download_state: "available",
        signature_state: "verified",
        hash_match_state: "matched"
      },
      policy_gate: {
        echo_state: "policy_allowed",
        store_may_continue: true,
        store_override_allowed: false,
        capability_grant_issued: false
      },
      runtime_gate: {
        handoff_state: "runtime_handoff_ready",
        runtime_consumption_allowed: true,
        installation_id: "inst-release-notes-001",
        device_id: "device-dev-macos"
      },
      isolation: {
        isolation_profile: "basic_sandbox",
        network_mode: "policy_bound",
        filesystem_mode: "scoped_write"
      },
      smoke_test: {
        smoke_test_state: "failed",
        smoke_test_ref: "smoke://developer.release-notes/0.1.2"
      },
      steps: [
        {
          step_id: "download_artifact",
          label: "下载安装包",
          step_state: "completed",
          owner_system: "agent_store",
          diagnostic_ref: ""
        },
        {
          step_id: "verify_signature",
          label: "校验签名与 hash",
          step_state: "completed",
          owner_system: "agent_store",
          diagnostic_ref: ""
        },
        {
          step_id: "create_isolated_install",
          label: "创建隔离安装",
          step_state: "ready",
          owner_system: "agent_runtime",
          diagnostic_ref: ""
        },
        {
          step_id: "smoke_test",
          label: "运行 smoke test",
          step_state: "failed",
          owner_system: "agent_runtime",
          diagnostic_ref: "diag-smoke-failed"
        },
        {
          step_id: "failure_diagnostics",
          label: "生成失败诊断",
          step_state: "ready",
          owner_system: "agent_store",
          diagnostic_ref: "diag-smoke-failed"
        }
      ],
      issues: [
        {
          issue_id: "SMOKE_TEST_FAILED",
          field_path: "installer_probe.smoke_test_state",
          severity: "blocked",
          reason: "Installer smoke test failed in preview diagnostics.",
          impact: "Managed installer cannot be marked ready until diagnostics are resolved.",
          fix_action_id: "copy_installer_diagnostic",
          message_key: "managedInstaller.smokeTestFailed"
        }
      ],
      diagnostics: {
        diagnostic_ref: "diag-smoke-failed",
        failure_stage: "installer_probe.smoke_test_state",
        reason_code: "SMOKE_TEST_FAILED",
        copyable: true
      },
      source_of_truth: {
        package: "agent_store_package_trust",
        policy_approval: "agentops_via_policy_approval_echo",
        runtime_handoff: "agent_store_installation_runtime_handoff",
        installer_execution: "not_started_preview_only",
        diagnostics: "agent_store_preview"
      },
      next_action: {
        action_id: "copy_installer_diagnostic",
        target_system: "agent_store",
        enabled: true,
        requires_permission: false,
        audit_required: true
      }
    }
  },
  policyApprovalEchoes: {
    "framework.ai-autosdlc": {
      contract_schema_version: "policy_approval_echo.v1",
      agent_id: "framework.ai-autosdlc",
      agent_version: "1.0.0",
      echo_state: "policy_allowed",
      policy_decision: {
        policy_decision_id: "policy-decision-framework",
        decision: "allow",
        policy_ref: "policy/high-risk-agent-install",
        reason_code: "agentops_approval_approved",
        evaluated_at: "2026-05-11T07:31:00Z",
        valid_until: "2026-05-11T08:31:00Z",
        agentops_trace_id: "trace-policy-framework",
        agentops_audit_id: "agentops-audit-policy-framework"
      },
      approval_summary: {
        approval_id: "approval-framework",
        status: "approved",
        decision: "approved",
        expires_at: "2026-05-11T08:31:00Z",
        request_access_url: "/agentops/approvals/approval-framework",
        agentops_audit_id: "agentops-audit-approval-framework"
      },
      store_projection: {
        projection_mode: "agentops_echo_only",
        store_decision_authority: "none",
        agentops_decision: "allow",
        store_override_allowed: false,
        capability_grant_issued: false,
        store_may_continue: true,
        store_block_reason: ""
      },
      issues: [],
      source_of_truth: {
        policy_decision: "agentops",
        approval: "agentops",
        capability_grant: "agentops_not_issued_by_store",
        store_projection: "agent_store_echo_only"
      },
      next_action: {
        action_id: "continue_store_flow",
        target_system: "agent_store",
        enabled: true,
        requires_permission: true,
        audit_required: true
      }
    },
    "agentops.evidence-reporter": {
      contract_schema_version: "policy_approval_echo.v1",
      agent_id: "agentops.evidence-reporter",
      agent_version: "0.4.0",
      echo_state: "approval_pending",
      policy_decision: {
        policy_decision_id: "policy-decision-evidence-reporter",
        decision: "approval_required",
        policy_ref: "policy/evidence-export-upgrade",
        reason_code: "approval_required_for_evidence_export",
        evaluated_at: "2026-05-11T07:32:00Z",
        valid_until: "2026-05-11T08:32:00Z",
        agentops_trace_id: "trace-policy-evidence-reporter",
        agentops_audit_id: "agentops-audit-policy-evidence"
      },
      approval_summary: {
        approval_id: "approval-evidence-reporter",
        status: "pending",
        decision: "pending",
        expires_at: "2026-05-11T08:32:00Z",
        request_access_url: "/agentops/approvals/approval-evidence-reporter",
        agentops_audit_id: "agentops-audit-approval-evidence"
      },
      store_projection: {
        projection_mode: "agentops_echo_only",
        store_decision_authority: "none",
        agentops_decision: "approval_required",
        store_override_allowed: false,
        capability_grant_issued: false,
        store_may_continue: false,
        store_block_reason: "approval_pending"
      },
      issues: [],
      source_of_truth: {
        policy_decision: "agentops",
        approval: "agentops",
        capability_grant: "agentops_not_issued_by_store",
        store_projection: "agent_store_echo_only"
      },
      next_action: {
        action_id: "view_agentops_approval",
        target_system: "agentops",
        enabled: true,
        requires_permission: true,
        audit_required: true,
        href: "/agentops/approvals/approval-evidence-reporter"
      }
    },
    "security.policy-guard": {
      contract_schema_version: "policy_approval_echo.v1",
      agent_id: "security.policy-guard",
      agent_version: "0.2.1",
      echo_state: "policy_denied",
      policy_decision: {
        policy_decision_id: "policy-decision-security",
        decision: "deny",
        policy_ref: "policy/security-revoked-agent",
        reason_code: "security_revoked_terminal",
        evaluated_at: "2026-05-11T07:33:00Z",
        valid_until: "2026-05-11T08:33:00Z",
        agentops_trace_id: "trace-policy-security",
        agentops_audit_id: "agentops-audit-policy-security"
      },
      approval_summary: {
        approval_id: "approval-security",
        status: "rejected",
        decision: "rejected",
        expires_at: "2026-05-11T08:33:00Z",
        request_access_url: "/agentops/approvals/approval-security",
        agentops_audit_id: "agentops-audit-approval-security"
      },
      store_projection: {
        projection_mode: "agentops_echo_only",
        store_decision_authority: "none",
        agentops_decision: "deny",
        store_override_allowed: false,
        capability_grant_issued: false,
        store_may_continue: false,
        store_block_reason: "policy_denied"
      },
      issues: [],
      source_of_truth: {
        policy_decision: "agentops",
        approval: "agentops",
        capability_grant: "agentops_not_issued_by_store",
        store_projection: "agent_store_echo_only"
      },
      next_action: {
        action_id: "view_blocking_policy",
        target_system: "agentops",
        enabled: true,
        requires_permission: true,
        audit_required: true,
        href: "/agentops/policies/policy/security-revoked-agent"
      }
    },
    "developer.release-notes": {
      contract_schema_version: "policy_approval_echo.v1",
      agent_id: "developer.release-notes",
      agent_version: "0.1.2",
      echo_state: "approval_expired",
      policy_decision: {
        policy_decision_id: "policy-decision-release-notes",
        decision: "allow",
        policy_ref: "policy/publish-agent",
        reason_code: "approval_echo_expired",
        evaluated_at: "2026-05-11T06:15:00Z",
        valid_until: "2026-05-11T07:15:00Z",
        agentops_trace_id: "trace-policy-release-notes",
        agentops_audit_id: "agentops-audit-policy-release-notes"
      },
      approval_summary: {
        approval_id: "approval-release-notes",
        status: "expired",
        decision: "approved",
        expires_at: "2026-05-11T07:15:00Z",
        request_access_url: "/agentops/approvals/approval-release-notes",
        agentops_audit_id: "agentops-audit-approval-release-notes"
      },
      store_projection: {
        projection_mode: "agentops_echo_only",
        store_decision_authority: "none",
        agentops_decision: "allow",
        store_override_allowed: false,
        capability_grant_issued: false,
        store_may_continue: false,
        store_block_reason: "approval_expired"
      },
      issues: [
        {
          issue_id: "AGENTOPS_APPROVAL_EXPIRED",
          field_path: "agentops_policy_echo.approval.expires_at",
          severity: "warning",
          fix_action_id: "request_approval_refresh"
        }
      ],
      source_of_truth: {
        policy_decision: "agentops",
        approval: "agentops",
        capability_grant: "agentops_not_issued_by_store",
        store_projection: "agent_store_echo_only"
      },
      next_action: {
        action_id: "request_approval_refresh",
        target_system: "agentops",
        enabled: true,
        requires_permission: true,
        audit_required: true,
        href: "/agentops/approvals/approval-release-notes"
      }
    }
  },
  policyApprovalRequests: {
    "framework.ai-autosdlc": {
      contract_schema_version: "policy_approval_request.v1",
      agent_id: "framework.ai-autosdlc",
      agent_version: "1.0.0",
      requested_action: "install_agent",
      request_state: "approval_request_ready",
      requester: {
        actor_id: "owner-sdlc-platform",
        actor_role: "owner",
        tenant_id: "tenant-enterprise"
      },
      policy_context: {
        policy_ref: "policy/high-risk-agent-install",
        risk_level: "high",
        runtime_contract_version: "agent_runtime.v1",
        permission_intents: ["install_agent", "read_quality_summary"],
        data_scopes: ["repo_metadata", "ci_evidence_summary"]
      },
      justification: "Install requires AgentOps approval because the agent can read CI evidence summaries.",
      agentops_request: {
        target_system: "agentops",
        request_contract: "policy_approval_request.v1",
        agent_id: "framework.ai-autosdlc",
        agent_version: "1.0.0",
        requested_action: "install_agent",
        requester: {
          actor_id: "owner-sdlc-platform",
          actor_role: "owner",
          tenant_id: "tenant-enterprise"
        },
        policy_context: {
          policy_ref: "policy/high-risk-agent-install",
          risk_level: "high",
          runtime_contract_version: "agent_runtime.v1",
          permission_intents: ["install_agent", "read_quality_summary"],
          data_scopes: ["repo_metadata", "ci_evidence_summary"]
        },
        justification: "Install requires AgentOps approval because the agent can read CI evidence summaries.",
        store_audit_id: "audit-policy-request-framework",
        dispatch_allowed: true
      },
      store_projection: {
        store_decision_authority: "none",
        store_override_allowed: false,
        capability_grant_issued: false,
        agentops_approval_required: true,
        dispatch_allowed: true
      },
      issues: [],
      source_of_truth: {
        approval_request: "agent_store",
        policy_decision: "agentops",
        approval: "agentops",
        capability_grant: "agentops_not_issued_by_store",
        request_audit: "agent_store"
      },
      next_action: {
        action_id: "submit_agentops_approval_request",
        target_system: "agentops",
        enabled: true,
        requires_permission: true,
        audit_required: true
      }
    },
    "agentops.evidence-reporter": {
      contract_schema_version: "policy_approval_request.v1",
      agent_id: "agentops.evidence-reporter",
      agent_version: "0.4.0",
      requested_action: "upgrade_agent",
      request_state: "approval_request_ready",
      requester: {
        actor_id: "security-agentops",
        actor_role: "security",
        tenant_id: "tenant-enterprise"
      },
      policy_context: {
        policy_ref: "policy/evidence-export-upgrade",
        risk_level: "medium",
        runtime_contract_version: "agent_runtime.v1",
        permission_intents: ["upgrade_agent", "read_evidence_summary"],
        data_scopes: ["evidence_summary"]
      },
      justification: "Upgrade approval tracks evidence export behavior after rollback notice.",
      agentops_request: {
        target_system: "agentops",
        request_contract: "policy_approval_request.v1",
        agent_id: "agentops.evidence-reporter",
        agent_version: "0.4.0",
        requested_action: "upgrade_agent",
        requester: {
          actor_id: "security-agentops",
          actor_role: "security",
          tenant_id: "tenant-enterprise"
        },
        policy_context: {
          policy_ref: "policy/evidence-export-upgrade",
          risk_level: "medium",
          runtime_contract_version: "agent_runtime.v1",
          permission_intents: ["upgrade_agent", "read_evidence_summary"],
          data_scopes: ["evidence_summary"]
        },
        justification: "Upgrade approval tracks evidence export behavior after rollback notice.",
        store_audit_id: "audit-policy-request-evidence-reporter",
        dispatch_allowed: true
      },
      store_projection: {
        store_decision_authority: "none",
        store_override_allowed: false,
        capability_grant_issued: false,
        agentops_approval_required: true,
        dispatch_allowed: true
      },
      issues: [],
      source_of_truth: {
        approval_request: "agent_store",
        policy_decision: "agentops",
        approval: "agentops",
        capability_grant: "agentops_not_issued_by_store",
        request_audit: "agent_store"
      },
      next_action: {
        action_id: "submit_agentops_approval_request",
        target_system: "agentops",
        enabled: true,
        requires_permission: true,
        audit_required: true
      }
    },
    "security.policy-guard": {
      contract_schema_version: "policy_approval_request.v1",
      agent_id: "security.policy-guard",
      agent_version: "0.2.1",
      requested_action: "enable_agent",
      request_state: "approval_request_blocked",
      requester: {
        actor_id: "owner-security",
        actor_role: "owner",
        tenant_id: "tenant-enterprise"
      },
      policy_context: {
        policy_ref: "policy/security-revoked-agent",
        risk_level: "critical",
        runtime_contract_version: "agent_runtime.v1",
        permission_intents: ["enable_agent"],
        data_scopes: ["policy_decision"]
      },
      justification: "Owner attempted to re-enable a security revoked agent.",
      agentops_request: {
        target_system: "agentops",
        request_contract: "policy_approval_request.v1",
        agent_id: "security.policy-guard",
        agent_version: "0.2.1",
        requested_action: "enable_agent",
        requester: {
          actor_id: "owner-security",
          actor_role: "owner",
          tenant_id: "tenant-enterprise"
        },
        policy_context: {
          policy_ref: "policy/security-revoked-agent",
          risk_level: "critical",
          runtime_contract_version: "agent_runtime.v1",
          permission_intents: ["enable_agent"],
          data_scopes: ["policy_decision"]
        },
        justification: "Owner attempted to re-enable a security revoked agent.",
        store_audit_id: "audit-policy-request-security",
        dispatch_allowed: false
      },
      store_projection: {
        store_decision_authority: "none",
        store_override_allowed: false,
        capability_grant_issued: false,
        agentops_approval_required: true,
        dispatch_allowed: false
      },
      issues: [
        {
          issue_id: "REQUESTER_ROLE_UNAUTHORIZED",
          field_path: "requester.actor_role",
          severity: "blocked",
          fix_action_id: "assign_authorized_requester"
        },
        {
          issue_id: "REQUESTED_ACTION_UNSUPPORTED",
          field_path: "requested_action",
          severity: "blocked",
          fix_action_id: "complete_policy_context"
        }
      ],
      source_of_truth: {
        approval_request: "agent_store",
        policy_decision: "agentops",
        approval: "agentops",
        capability_grant: "agentops_not_issued_by_store",
        request_audit: "agent_store"
      },
      next_action: {
        action_id: "assign_authorized_requester",
        target_system: "agent_store",
        enabled: true,
        requires_permission: true,
        audit_required: true
      }
    },
    "developer.release-notes": {
      contract_schema_version: "policy_approval_request.v1",
      agent_id: "developer.release-notes",
      agent_version: "0.1.2",
      requested_action: "publish_agent",
      request_state: "policy_context_incomplete",
      requester: {
        actor_id: "owner-devtools",
        actor_role: "owner",
        tenant_id: "tenant-devtools"
      },
      policy_context: {
        policy_ref: "policy/publish-agent",
        risk_level: "low",
        runtime_contract_version: "agent_runtime.v1",
        permission_intents: ["publish_agent"],
        data_scopes: ["release_notes"]
      },
      justification: "",
      agentops_request: {
        target_system: "agentops",
        request_contract: "policy_approval_request.v1",
        agent_id: "developer.release-notes",
        agent_version: "0.1.2",
        requested_action: "publish_agent",
        requester: {
          actor_id: "owner-devtools",
          actor_role: "owner",
          tenant_id: "tenant-devtools"
        },
        policy_context: {
          policy_ref: "policy/publish-agent",
          risk_level: "low",
          runtime_contract_version: "agent_runtime.v1",
          permission_intents: ["publish_agent"],
          data_scopes: ["release_notes"]
        },
        justification: "",
        store_audit_id: "audit-policy-request-release-notes",
        dispatch_allowed: false
      },
      store_projection: {
        store_decision_authority: "none",
        store_override_allowed: false,
        capability_grant_issued: false,
        agentops_approval_required: true,
        dispatch_allowed: false
      },
      issues: [
        {
          issue_id: "POLICY_CONTEXT_INCOMPLETE",
          field_path: "policy_context.permission_intents",
          severity: "blocked",
          fix_action_id: "complete_policy_context"
        },
        {
          issue_id: "JUSTIFICATION_REQUIRED",
          field_path: "justification",
          severity: "blocked",
          fix_action_id: "add_approval_justification"
        }
      ],
      source_of_truth: {
        approval_request: "agent_store",
        policy_decision: "agentops",
        approval: "agentops",
        capability_grant: "agentops_not_issued_by_store",
        request_audit: "agent_store"
      },
      next_action: {
        action_id: "complete_policy_context",
        target_system: "agent_store",
        enabled: true,
        requires_permission: true,
        audit_required: true
      }
    }
  },
  policyApprovalReceipts: {
    "framework.ai-autosdlc": {
      contract_schema_version: "policy_approval_receipt.v1",
      agent_id: "framework.ai-autosdlc",
      agent_version: "1.0.0",
      requested_action: "install_agent",
      receipt_state: "approval_receipt_accepted",
      approval_request_ref: {
        request_contract: "policy_approval_request.v1",
        agent_id: "framework.ai-autosdlc",
        agent_version: "1.0.0",
        requested_action: "install_agent",
        store_audit_id: "audit-policy-request-framework"
      },
      agentops_receipt: {
        receipt_contract: "policy_approval_receipt.v1",
        approval_request_id: "agentops-request-framework",
        approval_id: "approval-framework",
        receipt_status: "accepted",
        agent_id: "framework.ai-autosdlc",
        agent_version: "1.0.0",
        requested_action: "install_agent",
        request_access_url: "/agentops/approvals/approval-framework",
        agentops_audit_id: "agentops-audit-approval-framework",
        received_at: "2026-05-11T07:28:00Z",
        rejection_reason: ""
      },
      store_projection: {
        projection_mode: "agentops_receipt_only",
        store_decision_authority: "none",
        store_override_allowed: false,
        capability_grant_issued: false,
        approval_decision_final: false,
        approval_flow_linked: true
      },
      issues: [],
      source_of_truth: {
        approval_request: "agent_store",
        approval_receipt: "agentops",
        policy_decision: "agentops_not_decided_by_receipt",
        approval: "agentops",
        capability_grant: "agentops_not_issued_by_store",
        store_projection: "agent_store_receipt_only"
      },
      next_action: {
        action_id: "view_agentops_approval",
        target_system: "agentops",
        enabled: true,
        requires_permission: true,
        audit_required: true,
        href: "/agentops/approvals/approval-framework"
      }
    },
    "agentops.evidence-reporter": {
      contract_schema_version: "policy_approval_receipt.v1",
      agent_id: "agentops.evidence-reporter",
      agent_version: "0.4.0",
      requested_action: "upgrade_agent",
      receipt_state: "approval_receipt_pending",
      approval_request_ref: {
        request_contract: "policy_approval_request.v1",
        agent_id: "agentops.evidence-reporter",
        agent_version: "0.4.0",
        requested_action: "upgrade_agent",
        store_audit_id: "audit-policy-request-evidence-reporter"
      },
      agentops_receipt: {
        receipt_contract: "policy_approval_receipt.v1",
        approval_request_id: "agentops-request-evidence-reporter",
        approval_id: "approval-evidence-reporter",
        receipt_status: "pending",
        agent_id: "agentops.evidence-reporter",
        agent_version: "0.4.0",
        requested_action: "upgrade_agent",
        request_access_url: "/agentops/approvals/approval-evidence-reporter",
        agentops_audit_id: "agentops-audit-approval-evidence",
        received_at: "2026-05-11T07:29:00Z",
        rejection_reason: ""
      },
      store_projection: {
        projection_mode: "agentops_receipt_only",
        store_decision_authority: "none",
        store_override_allowed: false,
        capability_grant_issued: false,
        approval_decision_final: false,
        approval_flow_linked: true
      },
      issues: [],
      source_of_truth: {
        approval_request: "agent_store",
        approval_receipt: "agentops",
        policy_decision: "agentops_not_decided_by_receipt",
        approval: "agentops",
        capability_grant: "agentops_not_issued_by_store",
        store_projection: "agent_store_receipt_only"
      },
      next_action: {
        action_id: "poll_agentops_approval_receipt",
        target_system: "agentops",
        enabled: true,
        requires_permission: true,
        audit_required: true,
        href: "/agentops/approvals/approval-evidence-reporter"
      }
    },
    "security.policy-guard": {
      contract_schema_version: "policy_approval_receipt.v1",
      agent_id: "security.policy-guard",
      agent_version: "0.2.1",
      requested_action: "enable_agent",
      receipt_state: "approval_receipt_rejected",
      approval_request_ref: {
        request_contract: "policy_approval_request.v1",
        agent_id: "security.policy-guard",
        agent_version: "0.2.1",
        requested_action: "enable_agent",
        store_audit_id: "audit-policy-request-security"
      },
      agentops_receipt: {
        receipt_contract: "policy_approval_receipt.v1",
        approval_request_id: "agentops-request-security",
        approval_id: "approval-security",
        receipt_status: "rejected",
        agent_id: "security.policy-guard",
        agent_version: "0.2.1",
        requested_action: "enable_agent",
        request_access_url: "/agentops/approvals/approval-security",
        agentops_audit_id: "agentops-audit-approval-security",
        received_at: "2026-05-11T07:30:00Z",
        rejection_reason: "security_revoked cannot be enabled by owner request"
      },
      store_projection: {
        projection_mode: "agentops_receipt_only",
        store_decision_authority: "none",
        store_override_allowed: false,
        capability_grant_issued: false,
        approval_decision_final: false,
        approval_flow_linked: false
      },
      issues: [],
      source_of_truth: {
        approval_request: "agent_store",
        approval_receipt: "agentops",
        policy_decision: "agentops_not_decided_by_receipt",
        approval: "agentops",
        capability_grant: "agentops_not_issued_by_store",
        store_projection: "agent_store_receipt_only"
      },
      next_action: {
        action_id: "fix_agentops_approval_request",
        target_system: "agent_store",
        enabled: true,
        requires_permission: true,
        audit_required: true
      }
    },
    "developer.release-notes": {
      contract_schema_version: "policy_approval_receipt.v1",
      agent_id: "developer.release-notes",
      agent_version: "0.1.2",
      requested_action: "publish_agent",
      receipt_state: "approval_receipt_unavailable",
      approval_request_ref: {
        request_contract: "policy_approval_request.v1",
        agent_id: "developer.release-notes",
        agent_version: "0.1.2",
        requested_action: "publish_agent",
        store_audit_id: "audit-policy-request-release-notes"
      },
      agentops_receipt: {
        receipt_contract: "policy_approval_receipt.v1",
        approval_request_id: "",
        approval_id: "",
        receipt_status: "pending",
        agent_id: "developer.release-notes",
        agent_version: "0.1.2",
        requested_action: "publish_agent",
        request_access_url: "",
        agentops_audit_id: "",
        received_at: "",
        rejection_reason: ""
      },
      store_projection: {
        projection_mode: "agentops_receipt_only",
        store_decision_authority: "none",
        store_override_allowed: false,
        capability_grant_issued: false,
        approval_decision_final: false,
        approval_flow_linked: false
      },
      issues: [
        {
          issue_id: "AGENTOPS_RECEIPT_INCOMPLETE",
          field_path: "agentops_receipt",
          severity: "blocked",
          fix_action_id: "refresh_agentops_approval_receipt"
        }
      ],
      source_of_truth: {
        approval_request: "agent_store",
        approval_receipt: "agentops",
        policy_decision: "agentops_not_decided_by_receipt",
        approval: "agentops",
        capability_grant: "agentops_not_issued_by_store",
        store_projection: "agent_store_receipt_only"
      },
      next_action: {
        action_id: "refresh_agentops_approval_receipt",
        target_system: "agentops",
        enabled: true,
        requires_permission: true,
        audit_required: true
      }
    }
  },
  notificationRouting: {
    "framework.ai-autosdlc": {
      audit_id: "audit-routing-framework.ai-autosdlc",
      contract_schema_version: "notification_routing_summary.v1",
      agent_id: "framework.ai-autosdlc",
      agent_version: "1.0.0",
      event_type: "approval_required",
      event_id: "event-approval-framework-1",
      routing_state: "routing_ready",
      reason: "审批需要通知 Owner 与 AgentOps，但 Store 只展示 not_sent 路由投影。",
      delivery_status: "not_sent",
      trusted_audience: {
        audience_state: "trusted",
        source: "trusted_iam_or_owner_directory",
        recipients: ["owner:SDLC Platform", "team:AgentOps"]
      },
      channels: [
        {
          channel_id: "notification_center",
          target_system: "agent_store",
          delivery_status: "not_sent",
          sla_minutes: 15
        },
        {
          channel_id: "task_center",
          target_system: "agent_store",
          delivery_status: "not_sent",
          sla_minutes: 30
        }
      ],
      issues: [],
      source_of_truth: {
        event: "agent_store_event",
        audience: "trusted_iam_or_owner_directory",
        notification_delivery: "notification_center_not_sent_by_store",
        health_summary: "agentops_not_overridden",
        summary_projection: "agent_store"
      },
      next_action: {
        action_id: "enqueue_notification_route",
        target_system: "agent_store",
        enabled: true,
        requires_permission: true,
        audit_required: true
      }
    },
    "agentops.evidence-reporter": {
      audit_id: "audit-routing-agentops.evidence-reporter",
      contract_schema_version: "notification_routing_summary.v1",
      agent_id: "agentops.evidence-reporter",
      agent_version: "0.4.0",
      event_type: "feedback_owner_replied",
      event_id: "event-feedback-agentops-1",
      routing_state: "routing_degraded",
      reason: "Owner 回复可进入通知中心，但企微触达仍缺少企业发送器确认。",
      delivery_status: "not_sent",
      trusted_audience: {
        audience_state: "trusted",
        source: "trusted_iam_or_owner_directory",
        recipients: ["owner:AgentOps"]
      },
      channels: [
        {
          channel_id: "notification_center",
          target_system: "agent_store",
          delivery_status: "not_sent",
          sla_minutes: 10
        },
        {
          channel_id: "wecom",
          target_system: "enterprise_messaging",
          delivery_status: "not_sent",
          sla_minutes: 30
        }
      ],
      issues: [
        {
          issue_id: "ENTERPRISE_SENDER_NOT_CONFIGURED",
          field_path: "channels.wecom",
          severity: "warning",
          fix_action_id: "review_notification_route"
        }
      ],
      source_of_truth: {
        event: "agent_store_event",
        audience: "trusted_iam_or_owner_directory",
        notification_delivery: "notification_center_not_sent_by_store",
        health_summary: "agentops_not_overridden",
        summary_projection: "agent_store"
      },
      next_action: {
        action_id: "review_notification_route",
        target_system: "agent_store",
        enabled: true,
        requires_permission: true,
        audit_required: true
      }
    },
    "security.policy-guard": {
      audit_id: "audit-routing-security.policy-guard",
      contract_schema_version: "notification_routing_summary.v1",
      agent_id: "security.policy-guard",
      agent_version: "0.2.1",
      event_type: "security_revoked",
      event_id: "event-security-revoked-1",
      routing_state: "routing_blocked",
      reason: "安全撤销必须包含 risk_list，且缺少可信受众前不得展示为已通知。",
      delivery_status: "not_sent",
      trusted_audience: {
        audience_state: "missing",
        source: "trusted_iam_or_owner_directory",
        recipients: []
      },
      channels: [
        {
          channel_id: "risk_list",
          target_system: "security",
          delivery_status: "not_sent",
          sla_minutes: 5
        },
        {
          channel_id: "notification_center",
          target_system: "agent_store",
          delivery_status: "not_sent",
          sla_minutes: 10
        }
      ],
      issues: [
        {
          issue_id: "TRUSTED_AUDIENCE_REQUIRED",
          field_path: "trusted_audience.recipients",
          severity: "blocked",
          fix_action_id: "fix_notification_routing_context"
        },
        {
          issue_id: "RISK_LIST_CHANNEL_FORCED",
          field_path: "channels.risk_list",
          severity: "warning",
          fix_action_id: "review_notification_route"
        }
      ],
      source_of_truth: {
        event: "agent_store_event",
        audience: "trusted_iam_or_owner_directory",
        notification_delivery: "notification_center_not_sent_by_store",
        health_summary: "agentops_not_overridden",
        summary_projection: "agent_store"
      },
      next_action: {
        action_id: "fix_notification_routing_context",
        target_system: "agent_store",
        enabled: true,
        requires_permission: true,
        audit_required: true
      }
    }
  },
  permissionDenialActions: {
    "framework.ai-autosdlc": {
      contract_schema_version: "permission_denial_action_summary.v1",
      agent_id: "framework.ai-autosdlc",
      agent_version: "1.0.0",
      denial_scenario: "high_risk_approval_required",
      denial_state: "agentops_approval_required",
      permission_state: "approval_required",
      page: {
        title: "此安装需要审批",
        plain_language_explanation: "该 Agent 会访问高风险资源，需先提交 AgentOps 审批。",
        message_key: "permissionDenial.pages.agentops_approval_required",
        severity: "blocked",
        return_path: "/agents/framework.ai-autosdlc",
        visible_roles: ["requester", "owner", "security_iam"],
        notification_rule: "notify_agentops_approval_center",
        audit_required: true,
        agent_display_name: "Ai_AutoSDLC"
      },
      permission: {
        permission_decision_id: "perm-framework-approval",
        decision: "approval_required",
        denied_scope: "agent.install",
        resource_scope: "repo:governed",
        request_id: "req-framework-approval",
        policy_ref: "policy/high-risk-agent",
        auth_context_id: "auth-framework",
        subject_user_id: "user-current",
        request_access_url: "/agentops/approvals",
        raw_trace_url: "",
        raw_evidence_url: ""
      },
      raw_trace_exposed: false,
      raw_evidence_exposed: false,
      store_grant_issued: false,
      store_policy_override_allowed: false,
      primary_action: {
        action_id: "submit_agentops_approval",
        target_system: "agentops",
        enabled: true,
        requires_permission: true,
        audit_required: true,
        href: "#agentops-approval"
      },
      secondary_action: {
        action_id: "view_access_scope",
        target_system: "agent_store",
        enabled: true,
        requires_permission: false,
        audit_required: true,
        href: "#access-scope"
      },
      issues: [],
      scenario_examples: [
        {
          denial_scenario: "unsupported",
          denial_state: "denial_unavailable",
          permission_state: "permission_unknown",
          title: "权限状态待刷新",
          primary_action_id: "refresh_identity",
          secondary_action_id: "return_to_catalog",
          notification_rule: "audit_only"
        },
        {
          denial_scenario: "not_visible",
          denial_state: "visibility_denied",
          permission_state: "visibility_denied",
          title: "当前无权查看此 Agent",
          primary_action_id: "return_to_catalog",
          secondary_action_id: "request_visibility_access",
          notification_rule: "audit_only"
        },
        {
          denial_scenario: "visible_not_installable",
          denial_state: "install_permission_required",
          permission_state: "install_denied",
          title: "可查看，但暂不能安装",
          primary_action_id: "request_install_permission",
          secondary_action_id: "contact_agent_owner",
          notification_rule: "notify_owner_on_request"
        },
        {
          denial_scenario: "raw_evidence_denied",
          denial_state: "raw_evidence_access_required",
          permission_state: "evidence_vault_required",
          title: "仅可查看脱敏摘要",
          primary_action_id: "request_evidence_access",
          secondary_action_id: "return_to_evidence_summary",
          notification_rule: "notify_evidence_vault_on_request"
        },
        {
          denial_scenario: "high_risk_approval_required",
          denial_state: "agentops_approval_required",
          permission_state: "approval_required",
          title: "此安装需要审批",
          primary_action_id: "submit_agentops_approval",
          secondary_action_id: "view_access_scope",
          notification_rule: "notify_agentops_approval_center"
        },
        {
          denial_scenario: "policy_blocked",
          denial_state: "agentops_policy_blocked",
          permission_state: "policy_denied",
          title: "当前策略阻断运行",
          primary_action_id: "view_policy_reason",
          secondary_action_id: "view_replacement_agent",
          notification_rule: "notify_security_iam_and_owner"
        }
      ],
      source_of_truth: {
        identity: "trusted_iam_auth_context",
        permission_decision: "iam_or_agentops_policy_echo",
        policy: "agentops",
        raw_evidence: "evidence_vault",
        projection: "agent_store"
      },
      next_action: {
        action_id: "submit_agentops_approval",
        target_system: "agentops",
        enabled: true,
        requires_permission: true,
        audit_required: true,
        href: "#agentops-approval"
      }
    },
    "agentops.evidence-reporter": {
      contract_schema_version: "permission_denial_action_summary.v1",
      agent_id: "agentops.evidence-reporter",
      agent_version: "0.4.0",
      denial_scenario: "raw_evidence_denied",
      denial_state: "raw_evidence_access_required",
      permission_state: "evidence_vault_required",
      page: {
        title: "仅可查看脱敏摘要",
        plain_language_explanation: "证据原文需走 Evidence Vault 审批，Store 不展示 raw Trace 或 raw Evidence。",
        message_key: "permissionDenial.pages.raw_evidence_access_required",
        severity: "blocked",
        return_path: "/agents/agentops.evidence-reporter",
        visible_roles: ["requester", "owner", "agentops_admin"],
        notification_rule: "notify_evidence_vault_on_request",
        audit_required: true,
        agent_display_name: "Evidence Reporter"
      },
      permission: {
        permission_decision_id: "perm-agentops-evidence",
        decision: "deny",
        denied_scope: "evidence.raw",
        resource_scope: "agentops:trace",
        request_id: "req-agentops-evidence",
        policy_ref: "policy/evidence-vault",
        auth_context_id: "auth-agentops",
        subject_user_id: "user-current",
        request_access_url: "/evidence-vault/access-requests",
        raw_trace_url: "",
        raw_evidence_url: ""
      },
      raw_trace_exposed: false,
      raw_evidence_exposed: false,
      store_grant_issued: false,
      store_policy_override_allowed: false,
      primary_action: {
        action_id: "request_evidence_access",
        target_system: "evidence_vault",
        enabled: true,
        requires_permission: true,
        audit_required: true,
        href: "#evidence-access"
      },
      secondary_action: {
        action_id: "return_to_evidence_summary",
        target_system: "agent_store",
        enabled: true,
        requires_permission: false,
        audit_required: false,
        href: "#evidence-summary"
      },
      issues: [
        {
          issue_id: "RAW_PERMISSION_LINK_STRIPPED",
          field_path: "denial_context.raw_links",
          severity: "info",
          fix_action_id: "request_evidence_access"
        }
      ],
      scenario_examples: [],
      source_of_truth: {
        identity: "trusted_iam_auth_context",
        permission_decision: "iam_or_agentops_policy_echo",
        policy: "agentops",
        raw_evidence: "evidence_vault",
        projection: "agent_store"
      },
      next_action: {
        action_id: "request_evidence_access",
        target_system: "evidence_vault",
        enabled: true,
        requires_permission: true,
        audit_required: true,
        href: "#evidence-access"
      }
    },
    "security.policy-guard": {
      contract_schema_version: "permission_denial_action_summary.v1",
      agent_id: "security.policy-guard",
      agent_version: "0.2.1",
      denial_scenario: "policy_blocked",
      denial_state: "agentops_policy_blocked",
      permission_state: "policy_denied",
      page: {
        title: "当前策略阻断运行",
        plain_language_explanation: "AgentOps Policy Service 返回 block，Store 只能展示原因和替代动作。",
        message_key: "permissionDenial.pages.agentops_policy_blocked",
        severity: "blocked",
        return_path: "/agents/security.policy-guard",
        visible_roles: ["requester", "owner", "security_iam"],
        notification_rule: "notify_security_iam_and_owner",
        audit_required: true,
        agent_display_name: "Policy Guard"
      },
      permission: {
        permission_decision_id: "perm-security-policy",
        decision: "deny",
        denied_scope: "agent.run",
        resource_scope: "runtime:policy",
        request_id: "req-security-policy",
        policy_ref: "policy/risk-block",
        auth_context_id: "auth-security",
        subject_user_id: "user-current",
        request_access_url: "/agentops/policy/policy-risk-block",
        raw_trace_url: "",
        raw_evidence_url: ""
      },
      raw_trace_exposed: false,
      raw_evidence_exposed: false,
      store_grant_issued: false,
      store_policy_override_allowed: false,
      primary_action: {
        action_id: "view_policy_reason",
        target_system: "agentops",
        enabled: true,
        requires_permission: true,
        audit_required: true,
        href: "#policy-reason"
      },
      secondary_action: {
        action_id: "view_replacement_agent",
        target_system: "agent_store",
        enabled: true,
        requires_permission: false,
        audit_required: true,
        href: "#replacement-agent"
      },
      issues: [],
      scenario_examples: [],
      source_of_truth: {
        identity: "trusted_iam_auth_context",
        permission_decision: "iam_or_agentops_policy_echo",
        policy: "agentops",
        raw_evidence: "evidence_vault",
        projection: "agent_store"
      },
      next_action: {
        action_id: "view_policy_reason",
        target_system: "agentops",
        enabled: true,
        requires_permission: true,
        audit_required: true,
        href: "#policy-reason"
      }
    }
  },
  listingWizard: {
    "framework.ai-autosdlc": {
      contract_schema_version: "listing_wizard_shell.v1",
      wizard_state: "runtime_gate_blocked",
      source_step: {
        step_id: "source_selection",
        step_state: "selected",
        source_id: "official-framework-registry",
        source_type: "registry_import",
        source_ref: "agent-store://official/framework.ai-autosdlc",
        next_action: {
          action_id: "confirm_listing_fields",
          target_system: "agent_store",
          enabled: true,
          requires_permission: true,
          audit_required: true
        }
      },
      field_confirmation: {
        step_id: "field_confirmation",
        step_state: "confirmed",
        fields: [
          {
            field_path: "agent_id",
            value: "framework.ai-autosdlc",
            confirmation_state: "confirmed",
            source: "package_manifest_candidate"
          },
          {
            field_path: "owner_team",
            value: "SDLC Platform",
            confirmation_state: "confirmed",
            source: "package_manifest_candidate"
          },
          {
            field_path: "runtime_contract_version",
            value: "runtime-contract.v2",
            confirmation_state: "confirmed",
            source: "agent_manifest_runtime_contract.v1"
          }
        ]
      },
      validation_report: {
        step_id: "validation_report",
        step_state: "passed",
        package_id: "framework.ai-autosdlc@1.0.0",
        draft_status: "pending_review",
        issue_count: 0,
        fix_prompt_count: 0,
        issues: [],
        next_action: {
          action_id: "continue_listing_review",
          target_system: "agent_store",
          enabled: true,
          audit_required: true
        }
      },
      detail_preview: {
        step_id: "detail_preview",
        step_state: "blocked",
        agent_id: "framework.ai-autosdlc",
        display_name: "Ai_AutoSDLC",
        summary: "官方 SDLC Framework Capability，等待 Runtime 能力补齐后可继续上架预览。",
        owner_team: "SDLC Platform",
        version: "1.0.0",
        runtime_availability_state: "runtime_capability_missing",
        runtime_display_name_zh: "缺 Runtime 能力",
        health_freshness_state: "health_refresh_required",
        health_recommendation_basis_allowed: false
      },
      steps: [
        {
          step_id: "source_selection",
          label: "来源选择",
          step_state: "completed",
          owner_system: "agent_store"
        },
        {
          step_id: "field_confirmation",
          label: "字段确认",
          step_state: "confirmed",
          owner_system: "agent_store"
        },
        {
          step_id: "validation_report",
          label: "校验报告",
          step_state: "passed",
          owner_system: "agent_store"
        },
        {
          step_id: "runtime_gate",
          label: "Runtime Gate",
          step_state: "runtime_capability_missing",
          owner_system: "agent_runtime"
        },
        {
          step_id: "detail_preview",
          label: "详情预览",
          step_state: "blocked",
          owner_system: "agent_store"
        }
      ],
      source_of_truth: {
        package_manifest: "agent_store_upload_candidate",
        field_confirmation: "owner_confirmed_before_review",
        package_validation: "agent_store_package_validation",
        runtime_availability: "agent_runtime_echo_or_probe",
        health_summary: "agentops",
        draft_review: "not_submitted_until_027"
      },
      next_action: {
        action_id: "resolve_runtime_gate",
        target_system: "agent_runtime",
        enabled: true,
        requires_permission: true,
        audit_required: true
      }
    },
    "agentops.evidence-reporter": {
      contract_schema_version: "listing_wizard_shell.v1",
      wizard_state: "preview_ready",
      source_step: {
        step_id: "source_selection",
        step_state: "selected",
        source_id: "agentops-reporter-package",
        source_type: "package_upload",
        source_ref: "agentops/evidence-reporter-0.4.0.tgz",
        next_action: {
          action_id: "confirm_listing_fields",
          target_system: "agent_store",
          enabled: true,
          requires_permission: true,
          audit_required: true
        }
      },
      field_confirmation: {
        step_id: "field_confirmation",
        step_state: "confirmed",
        fields: [
          {
            field_path: "agent_id",
            value: "agentops.evidence-reporter",
            confirmation_state: "confirmed",
            source: "package_manifest_candidate"
          },
          {
            field_path: "owner_team",
            value: "AgentOps",
            confirmation_state: "confirmed",
            source: "package_manifest_candidate"
          },
          {
            field_path: "skills[0].risk_level",
            value: "medium",
            confirmation_state: "confirmed",
            source: "package_validation_report.v1"
          }
        ]
      },
      validation_report: {
        step_id: "validation_report",
        step_state: "passed",
        package_id: "agentops.evidence-reporter@0.4.0",
        draft_status: "pending_review",
        issue_count: 0,
        fix_prompt_count: 0,
        issues: [],
        next_action: {
          action_id: "continue_listing_review",
          target_system: "agent_store",
          enabled: true,
          audit_required: true
        }
      },
      detail_preview: {
        step_id: "detail_preview",
        step_state: "ready",
        agent_id: "agentops.evidence-reporter",
        display_name: "Evidence Reporter",
        summary: "负责把运行证据、签名事件和诊断摘要回传到 AgentOps。",
        owner_team: "AgentOps",
        version: "0.4.0",
        runtime_availability_state: "runtime_ready",
        runtime_display_name_zh: "可运行",
        health_freshness_state: "health_fresh",
        health_recommendation_basis_allowed: false
      },
      steps: [
        {
          step_id: "source_selection",
          label: "来源选择",
          step_state: "completed",
          owner_system: "agent_store"
        },
        {
          step_id: "field_confirmation",
          label: "字段确认",
          step_state: "confirmed",
          owner_system: "agent_store"
        },
        {
          step_id: "validation_report",
          label: "校验报告",
          step_state: "passed",
          owner_system: "agent_store"
        },
        {
          step_id: "runtime_gate",
          label: "Runtime Gate",
          step_state: "runtime_ready",
          owner_system: "agent_runtime"
        },
        {
          step_id: "detail_preview",
          label: "详情预览",
          step_state: "ready",
          owner_system: "agent_store"
        }
      ],
      source_of_truth: {
        package_manifest: "agent_store_upload_candidate",
        field_confirmation: "owner_confirmed_before_review",
        package_validation: "agent_store_package_validation",
        runtime_availability: "agent_runtime_echo_or_probe",
        health_summary: "agentops",
        draft_review: "not_submitted_until_027"
      },
      next_action: {
        action_id: "prepare_draft_review_submission",
        target_system: "agent_store",
        enabled: true,
        requires_permission: true,
        audit_required: true
      }
    }
  },
  draftReviewSubmissions: {
    "framework.ai-autosdlc": {
      contract_schema_version: "draft_review_submission.v1",
      submission_id: "draft-review-framework-ai-autosdlc",
      package_id: "framework.ai-autosdlc@1.0.0",
      agent_id: "framework.ai-autosdlc",
      submission_state: "runtime_gate_blocked",
      draft_status: "draft_review_blocked",
      review_queue_entry: {
        queue_state: "not_enqueued",
        review_status: "not_submitted"
      },
      owner_confirmation: {
        confirmed: true,
        confirmed_by: "owner@sdlc-platform.example",
        confirmed_at: "2026-05-11T09:30:00Z",
        confirmation_basis: "owner_reviewed_listing_wizard"
      },
      validation_summary: {
        validation_status: "passed",
        draft_status_before_submission: "pending_review",
        issue_count: 0,
        fix_prompt_count: 0
      },
      runtime_gate: {
        runtime_availability_state: "runtime_capability_missing",
        runtime_display_name_zh: "缺 Runtime 能力"
      },
      issues: [
        {
          issue_id: "RUNTIME_GATE_NOT_READY",
          field_path: "detail_preview.runtime_availability_state",
          severity: "blocked",
          reason: "Runtime availability must be ready before review submission.",
          impact: "Prevents review from approving packages that Runtime cannot consume.",
          fix_action_id: "resolve_runtime_gate",
          message_key: "draftReview.runtimeGateNotReady"
        }
      ],
      source_of_truth: {
        package_manifest: "agent_store_upload_candidate",
        package_validation: "agent_store_package_validation",
        owner_confirmation: "agent_store_owner_explicit_confirmation",
        runtime_availability: "agent_runtime_echo_or_probe",
        draft_review_queue: "agent_store",
        policy_decision: "agentops_not_evaluated_until_review"
      },
      next_action: {
        action_id: "resolve_runtime_gate",
        target_system: "agent_runtime",
        enabled: true,
        requires_permission: true,
        audit_required: true
      }
    },
    "agentops.evidence-reporter": {
      contract_schema_version: "draft_review_submission.v1",
      submission_id: "draft-review-agentops-evidence-reporter",
      package_id: "agentops.evidence-reporter@0.4.0",
      agent_id: "agentops.evidence-reporter",
      submission_state: "pending_review",
      draft_status: "pending_review",
      review_queue_entry: {
        queue_state: "enqueued",
        review_status: "pending_review",
        review_queue_id: "review-agentops.evidence-reporter@0.4.0"
      },
      owner_confirmation: {
        confirmed: true,
        confirmed_by: "owner@agentops.example",
        confirmed_at: "2026-05-11T09:31:00Z",
        confirmation_basis: "owner_reviewed_listing_wizard"
      },
      validation_summary: {
        validation_status: "passed",
        draft_status_before_submission: "pending_review",
        issue_count: 0,
        fix_prompt_count: 0
      },
      runtime_gate: {
        runtime_availability_state: "runtime_ready",
        runtime_display_name_zh: "可运行"
      },
      issues: [],
      source_of_truth: {
        package_manifest: "agent_store_upload_candidate",
        package_validation: "agent_store_package_validation",
        owner_confirmation: "agent_store_owner_explicit_confirmation",
        runtime_availability: "agent_runtime_echo_or_probe",
        draft_review_queue: "agent_store",
        policy_decision: "agentops_not_evaluated_until_review"
      },
      next_action: {
        action_id: "track_review_queue",
        target_system: "agent_store",
        enabled: true,
        requires_permission: true,
        audit_required: true
      }
    },
    "security.policy-guard": {
      contract_schema_version: "draft_review_submission.v1",
      submission_id: "draft-review-security-policy-guard",
      package_id: "security.policy-guard@0.2.1",
      agent_id: "security.policy-guard",
      submission_state: "validation_blocked",
      draft_status: "draft_review_blocked",
      review_queue_entry: {
        queue_state: "not_enqueued",
        review_status: "not_submitted"
      },
      owner_confirmation: {
        confirmed: true,
        confirmed_by: "owner@security.example",
        confirmed_at: "2026-05-11T09:32:00Z",
        confirmation_basis: "owner_reviewed_listing_wizard"
      },
      validation_summary: {
        validation_status: "validation_failed",
        draft_status_before_submission: "validation_failed",
        issue_count: 2,
        fix_prompt_count: 1
      },
      runtime_gate: {
        runtime_availability_state: "runtime_ready",
        runtime_display_name_zh: "可运行"
      },
      issues: [
        {
          issue_id: "PACKAGE_VALIDATION_NOT_PASSED",
          field_path: "validation_report.step_state",
          severity: "blocked",
          reason: "Package validation must pass before a draft can enter review.",
          impact: "Prevents incomplete or unsafe package metadata from becoming review facts.",
          fix_action_id: "return_to_validation_report",
          message_key: "draftReview.packageValidationNotPassed"
        },
        {
          issue_id: "PLACEHOLDER_VALUE_BLOCKED",
          field_path: "detail_preview.summary",
          severity: "blocked",
          reason: "Unknown, TODO, TBD, or N/A values cannot enter formal review.",
          impact: "Prevents placeholder metadata from becoming governance review facts.",
          fix_action_id: "replace_summary_placeholder",
          message_key: "draftReview.placeholderValue"
        }
      ],
      source_of_truth: {
        package_manifest: "agent_store_upload_candidate",
        package_validation: "agent_store_package_validation",
        owner_confirmation: "agent_store_owner_explicit_confirmation",
        runtime_availability: "agent_runtime_echo_or_probe",
        draft_review_queue: "agent_store",
        policy_decision: "agentops_not_evaluated_until_review"
      },
      next_action: {
        action_id: "return_to_validation_report",
        target_system: "agent_store",
        enabled: true,
        requires_permission: true,
        audit_required: true
      }
    },
    "developer.release-notes": {
      contract_schema_version: "draft_review_submission.v1",
      submission_id: "draft-review-developer-release-notes",
      package_id: "developer.release-notes@0.1.2",
      agent_id: "developer.release-notes",
      submission_state: "owner_confirmation_required",
      draft_status: "draft_review_blocked",
      review_queue_entry: {
        queue_state: "not_enqueued",
        review_status: "not_submitted"
      },
      owner_confirmation: {
        confirmed: false,
        confirmed_by: "",
        confirmed_at: "",
        confirmation_basis: "owner_confirmed_before_review"
      },
      validation_summary: {
        validation_status: "passed",
        draft_status_before_submission: "pending_review",
        issue_count: 0,
        fix_prompt_count: 0
      },
      runtime_gate: {
        runtime_availability_state: "runtime_ready",
        runtime_display_name_zh: "可运行"
      },
      issues: [
        {
          issue_id: "OWNER_CONFIRMATION_REQUIRED",
          field_path: "owner_confirmation",
          severity: "blocked",
          reason: "Owner must explicitly confirm the listing fields before review.",
          impact: "Prevents candidate or AI-derived fields from becoming review facts without owner accountability.",
          fix_action_id: "confirm_owner_submission",
          message_key: "draftReview.ownerConfirmationRequired"
        }
      ],
      source_of_truth: {
        package_manifest: "agent_store_upload_candidate",
        package_validation: "agent_store_package_validation",
        owner_confirmation: "agent_store_owner_explicit_confirmation",
        runtime_availability: "agent_runtime_echo_or_probe",
        draft_review_queue: "agent_store",
        policy_decision: "agentops_not_evaluated_until_review"
      },
      next_action: {
        action_id: "confirm_owner_submission",
        target_system: "agent_store",
        enabled: true,
        requires_permission: true,
        audit_required: true
      }
    }
  },
  contractRegistryTraceability: {
    contract_schema_version: "contract_registry_traceability.v1",
    registry_status: "complete",
    coverage_summary: {
      total_contracts: 25,
      contracts_with_cct: 18,
      contracts_with_contract_tests: 25,
      complete_traceability: 25,
      unmapped_contracts: 0
    },
    focus_contract_by_agent: {
      "framework.ai-autosdlc": "agent_manifest_runtime_contract.v1",
      "agentops.evidence-reporter": "quality_evidence_access_summary.v1",
      "security.policy-guard": "permission_denial_action_summary.v1",
      "developer.release-notes": "feedback_owner_response_loop.v1"
    },
    contracts: [
      {
        contract_id: "agent_manifest_runtime_contract.v1",
        contract_file: "agent-manifest-runtime.openapi.yaml",
        primary_schema: "AgentManifestRuntimeContract",
        owner: "Agent Store",
        producer: "Agent Store",
        consumers: ["Agent Runtime", "AgentOps", "Agent Store UI"],
        cct_ids: ["CCT-008"],
        contract_test_files: ["tests/contract/test_agent_manifest_runtime_contract_api.py"],
        appendix_anchor: "AgentManifest Runtime Contract V1"
      },
      {
        contract_id: "agent_registry_draft.v1",
        contract_file: "agent-registry.openapi.yaml",
        primary_schema: "AgentDraftResponse",
        owner: "Agent Store",
        producer: "Agent Store",
        consumers: ["AgentOps", "Agent Store UI"],
        cct_ids: [],
        contract_test_files: ["tests/contract/test_agent_registry_api.py"],
        appendix_anchor: "Agent Registry Draft"
      },
      {
        contract_id: "agentops_summary.v1",
        contract_file: "agentops-summary.openapi.yaml",
        primary_schema: "AgentOpsSummaryResponse",
        owner: "AgentOps",
        producer: "AgentOps",
        consumers: ["Agent Store", "Agent Store UI"],
        cct_ids: [],
        contract_test_files: ["tests/contract/test_agentops_summary_api.py"],
        appendix_anchor: "AgentOps Summary Echo"
      },
      {
        contract_id: "quality_evidence_access_summary.v1",
        contract_file: "quality-evidence-access-summary.openapi.yaml",
        primary_schema: "QualityEvidenceAccessSummary",
        owner: "AgentOps",
        producer: "AgentOps",
        consumers: ["Agent Store", "Agent Store UI", "Evidence Vault"],
        cct_ids: ["CCT-022"],
        contract_test_files: ["tests/contract/test_quality_evidence_access_api.py"],
        appendix_anchor: "Quality Evidence Access Summary V1"
      },
      {
        contract_id: "permission_denial_action_summary.v1",
        contract_file: "permission-denial-action-summary.openapi.yaml",
        primary_schema: "PermissionDenialActionSummary",
        owner: "Agent Store",
        producer: "Agent Store",
        consumers: ["Agent Store UI", "AgentOps", "Evidence Vault"],
        cct_ids: ["CCT-023"],
        contract_test_files: ["tests/contract/test_permission_denial_api.py"],
        appendix_anchor: "Permission Denial Action Summary V1"
      },
      {
        contract_id: "notification_routing_summary.v1",
        contract_file: "notification-routing-summary.openapi.yaml",
        primary_schema: "NotificationRoutingSummary",
        owner: "Agent Store",
        producer: "Agent Store",
        consumers: ["Agent Store UI", "AgentOps", "Notification Center", "Risk Center"],
        cct_ids: ["CCT-024"],
        contract_test_files: ["tests/contract/test_notification_routing_api.py"],
        appendix_anchor: "Notification Routing Summary V1"
      },
      {
        contract_id: "contract_registry_traceability.v1",
        contract_file: "contract-registry-traceability.openapi.yaml",
        primary_schema: "ContractRegistryTraceability",
        owner: "Agent Store",
        producer: "Agent Store",
        consumers: ["AgentOps", "Agent Runtime", "Ai_AutoSDLC", "Agent Store UI"],
        cct_ids: ["CCT-017"],
        contract_test_files: ["tests/contract/test_contract_registry_traceability_api.py"],
        appendix_anchor: "Contract Registry Traceability V1"
      },
      {
        contract_id: "draft_review_submission.v1",
        contract_file: "draft-review-submission.openapi.yaml",
        primary_schema: "DraftReviewSubmission",
        owner: "Agent Store",
        producer: "Agent Store",
        consumers: ["AgentOps", "Agent Store UI"],
        cct_ids: ["CCT-012"],
        contract_test_files: ["tests/contract/test_draft_review_submission_api.py"],
        appendix_anchor: "Draft Review Submission V1"
      },
      {
        contract_id: "feedback_owner_response_loop.v1",
        contract_file: "feedback-owner-response-loop.openapi.yaml",
        primary_schema: "FeedbackOwnerResponseLoop",
        owner: "Agent Store",
        producer: "Agent Store",
        consumers: ["Agent Store UI"],
        cct_ids: ["CCT-015"],
        contract_test_files: ["tests/contract/test_feedback_owner_response_loop_api.py"],
        appendix_anchor: "Feedback Owner Response Loop V1"
      },
      {
        contract_id: "health_summary_freshness.v1",
        contract_file: "health-summary-freshness.openapi.yaml",
        primary_schema: "HealthSummaryFreshness",
        owner: "AgentOps",
        producer: "AgentOps",
        consumers: ["Agent Store", "Agent Store UI"],
        cct_ids: ["CCT-010"],
        contract_test_files: ["tests/contract/test_health_summary_freshness_api.py"],
        appendix_anchor: "HealthSummary Freshness V1"
      },
      {
        contract_id: "store_ops_deep_link.v1",
        contract_file: "store-ops-deep-link.openapi.yaml",
        primary_schema: "StoreOpsDeepLink",
        owner: "AgentOps",
        producer: "AgentOps",
        consumers: ["Agent Store", "Agent Store UI", "Evidence Vault"],
        cct_ids: ["CCT-020"],
        contract_test_files: ["tests/contract/test_store_ops_deep_link_api.py"],
        appendix_anchor: "Store Ops Deep Link V1"
      },
      {
        contract_id: "installation_bootstrap.v1",
        contract_file: "installation-bootstrap.openapi.yaml",
        primary_schema: "InstallationResponse",
        owner: "Agent Store",
        producer: "Agent Store",
        consumers: ["AgentOps", "Ai_AutoSDLC", "Agent Store UI"],
        cct_ids: [],
        contract_test_files: ["tests/contract/test_installation_bootstrap_api.py"],
        appendix_anchor: "Installation Bootstrap"
      },
      {
        contract_id: "installation_distribution_summary.v1",
        contract_file: "installation-distribution-summary.openapi.yaml",
        primary_schema: "InstallationDistributionSummary",
        owner: "Agent Store",
        producer: "Agent Store",
        consumers: ["Agent Store UI", "AgentOps"],
        cct_ids: ["CCT-021"],
        contract_test_files: ["tests/contract/test_installation_distribution_api.py"],
        appendix_anchor: "Installation Distribution Summary V1"
      },
      {
        contract_id: "installation_runtime_handoff.v1",
        contract_file: "installation-runtime-handoff.openapi.yaml",
        primary_schema: "InstallationRuntimeHandoff",
        owner: "Agent Store",
        producer: "Agent Store",
        consumers: ["Agent Runtime", "AgentOps"],
        cct_ids: ["CCT-011"],
        contract_test_files: ["tests/contract/test_installation_runtime_handoff_api.py"],
        appendix_anchor: "Installation Runtime Handoff V1"
      },
      {
        contract_id: "lifecycle_governance_baseline.v1",
        contract_file: "lifecycle-governance-baseline.openapi.yaml",
        primary_schema: "LifecycleGovernance",
        owner: "Agent Store",
        producer: "Agent Store",
        consumers: ["AgentOps", "Agent Store UI"],
        cct_ids: ["CCT-016"],
        contract_test_files: ["tests/contract/test_lifecycle_governance_api.py"],
        appendix_anchor: "Lifecycle Governance Baseline V1"
      },
      {
        contract_id: "managed_installer_preview.v1",
        contract_file: "managed-installer-preview.openapi.yaml",
        primary_schema: "ManagedInstallerPreview",
        owner: "Agent Store",
        producer: "Agent Store",
        consumers: ["Agent Runtime", "AgentOps", "Agent Store UI"],
        cct_ids: ["CCT-014"],
        contract_test_files: ["tests/contract/test_managed_installer_preview_api.py"],
        appendix_anchor: "Managed Installer Preview V1"
      },
      {
        contract_id: "package_validation_report.v1",
        contract_file: "package-validation.openapi.yaml",
        primary_schema: "PackageValidationReport",
        owner: "Agent Store",
        producer: "Agent Store",
        consumers: ["AgentOps", "Agent Store UI"],
        cct_ids: [],
        contract_test_files: ["tests/contract/test_package_validation_api.py"],
        appendix_anchor: "Package Validation Report"
      },
      {
        contract_id: "policy_approval_echo.v1",
        contract_file: "policy-approval-echo.openapi.yaml",
        primary_schema: "PolicyApprovalEcho",
        owner: "AgentOps",
        producer: "AgentOps",
        consumers: ["Agent Store", "Agent Store UI"],
        cct_ids: ["CCT-013"],
        contract_test_files: ["tests/contract/test_policy_approval_echo_api.py"],
        appendix_anchor: "Policy Approval Echo V1"
      },
      {
        contract_id: "policy_approval_request.v1",
        contract_file: "policy-approval-request.openapi.yaml",
        primary_schema: "PolicyApprovalRequest",
        owner: "Agent Store",
        producer: "Agent Store",
        consumers: ["AgentOps", "Agent Store UI"],
        cct_ids: ["CCT-018"],
        contract_test_files: ["tests/contract/test_policy_approval_request_api.py"],
        appendix_anchor: "Policy Approval Request V1"
      },
      {
        contract_id: "policy_approval_receipt.v1",
        contract_file: "policy-approval-receipt.openapi.yaml",
        primary_schema: "PolicyApprovalReceipt",
        owner: "AgentOps",
        producer: "AgentOps",
        consumers: ["Agent Store", "Agent Store UI"],
        cct_ids: ["CCT-019"],
        contract_test_files: ["tests/contract/test_policy_approval_receipt_api.py"],
        appendix_anchor: "Policy Approval Receipt V1"
      },
      {
        contract_id: "recommendation_state.v1",
        contract_file: "recommendation-state.openapi.yaml",
        primary_schema: "RecommendationStateResponse",
        owner: "Agent Store",
        producer: "Agent Store",
        consumers: ["Agent Store UI"],
        cct_ids: [],
        contract_test_files: ["tests/contract/test_recommendation_state_api.py"],
        appendix_anchor: "Recommendation State"
      },
      {
        contract_id: "runtime_availability_summary.v1",
        contract_file: "runtime-availability.openapi.yaml",
        primary_schema: "RuntimeAvailabilitySummary",
        owner: "Agent Runtime",
        producer: "Agent Runtime",
        consumers: ["Agent Store", "Agent Store UI"],
        cct_ids: ["CCT-009"],
        contract_test_files: ["tests/contract/test_runtime_availability_api.py"],
        appendix_anchor: "Runtime Availability Summary V1"
      },
      {
        contract_id: "skill_registry_notification.v1",
        contract_file: "skill-registry-notification.openapi.yaml",
        primary_schema: "SkillRegistryNotification",
        owner: "Agent Store",
        producer: "Agent Store",
        consumers: ["AgentOps"],
        cct_ids: ["CCT-007"],
        contract_test_files: ["tests/contract/test_skill_registry_api.py"],
        appendix_anchor: "Skill Registry Notification V1"
      },
      {
        contract_id: "skill_registry.v1",
        contract_file: "skill-registry.openapi.yaml",
        primary_schema: "SkillRegistryTransition",
        owner: "Agent Store",
        producer: "Agent Store",
        consumers: ["AgentOps", "Agent Store UI"],
        cct_ids: [],
        contract_test_files: ["tests/contract/test_skill_registry_api.py"],
        appendix_anchor: "Skill Registry Lifecycle"
      },
      {
        contract_id: "trusted_evidence_loop.v1",
        contract_file: "trusted-evidence-loop.openapi.yaml",
        primary_schema: "TrustedEvidenceLoopResponse",
        owner: "AgentOps",
        producer: "AgentOps",
        consumers: ["Agent Store", "Agent Store UI"],
        cct_ids: [],
        contract_test_files: ["tests/contract/test_trusted_evidence_loop.py"],
        appendix_anchor: "Trusted Evidence Loop"
      }
    ],
    source_of_truth: {
      contract_files: "specs/001-agent-store-phase1-trusted-min-loop/contracts",
      appendix: "docs/cross-project-contract-appendix.md",
      contract_tests: "tests/contract",
      registry_projection: "agent_store"
    },
    next_action: {
      action_id: "continue_contract_change_review",
      target_system: "agent_store",
      enabled: true,
      requires_permission: true,
      audit_required: true,
      message_key: "contractRegistry.actions.continueContractChangeReview"
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
