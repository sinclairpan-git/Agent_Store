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
