(function registerSdlcEnterpriseVue2(Vue) {
  var ENTERPRISE_VUE2_PROVIDER = {
    name: "sdlc-enterprise-vue2",
    packageName: "@sxf/er-components",
    installedVersion: "1.27.5",
    sourcePath: "vendor/enterprise-vue2/sxf-er-components-1.27.5.tgz",
    themePackageName: "@sxf/sf-theme",
    themeInstalledVersion: "0.2.5",
    themeSourcePath: "vendor/enterprise-vue2/sxf-sf-theme-0.2.5.tgz",
    frameworkBaseline: "Ai_AutoSDLC/specs/016-frontend-enterprise-vue2-provider-baseline/spec.md",
    allowFullVueUse: false,
    allowedCapabilities: [
      "UiButton",
      "UiCard",
      "UiTag",
      "UiTabs",
      "UiDrawer",
      "UiMenu",
      "UiToolbar",
      "UiPagination",
      "UiGrid"
    ]
  };

  window.SDLC_ENTERPRISE_VUE2_PROVIDER = ENTERPRISE_VUE2_PROVIDER;

  var DISPLAY_LABELS = {
    trusted: "可信",
    warning: "需关注",
    blocked: "已阻断",
    installable: "可安装",
    activation_required: "需企业激活",
    standalone_only: "仅本地使用",
    required_unactivated: "企业未激活",
    detected_optional: "企业接入可选",
    disabled: "已停用",
    active: "已激活",
    pending: "待补充",
    accepted: "已受理",
    pending_enterprise_activation: "等待企业激活",
    waiting_for_enterprise_activation: "等待企业激活",
    waiting_for_installation_bootstrap: "等待安装记录",
    waiting_for_standalone_access: "等待本地路径",
    waiting_for_catalog_review: "等待目录复核",
    pending_catalog_review: "等待目录复核",
    standalone_ready: "可本地使用",
    ready_to_install: "可开始安装",
    ready: "就绪",
    ready_to_create: "可创建安装记录",
    installation_created: "安装记录已创建",
    ready_to_issue: "可签发安装断言",
    issued: "已签发",
    credential_issued: "凭证已签发",
    pending_signature_test: "等待签名测试",
    running: "进行中",
    completed: "已完成",
    fresh: "新鲜",
    approved: "已批准",
    warn: "提示",
    allowed: "已允许",
    degraded: "降级",
    unavailable: "暂无事实源",
    materialized: "已物化，待验证加载",
    verified_loaded: "已验证加载",
    degraded_reason: "降级原因",
    stale: "待刷新",
    missing: "缺失",
    matched: "匹配",
    verified: "已验证",
    unknown: "未知",
    "L5-capable": "具备 L5 条件",
    "L3-summary": "L3 摘要",
    "L2-static": "L2 静态",
    l5_capable_pending_verification: "具备 L5 条件，待验证",
    evidence_pending: "证据待补齐",
    l5_unavailable_without_agentops_summary: "缺少 AgentOps 摘要，不能展示 L5",
    agentops_summary_pending_signature_test: "等待 AgentOps 签名测试回显",
    credential_issued_but_signature_test_pending: "凭证已签发，签名测试未完成",
    non_official_catalog_item_has_no_agentops_summary: "非官方条目缺少 AgentOps 摘要",
    agent_store: "Agent Store",
    agent_runtime: "Agent Runtime",
    agentops: "AgentOps",
    ai_autosdlc: "Ai_AutoSDLC",
    ai_autosdlc_cli: "Ai_AutoSDLC CLI",
    evidence_vault: "Evidence Vault",
    enterprise_activation: "企业激活",
    installation_bootstrap: "安装启动",
    standalone_access: "本地访问",
    catalog_review: "目录复核",
    start_enterprise_activation: "开始企业激活",
    open_standalone_readme: "查看本地使用说明",
    request_enterprise_activation: "申请企业激活",
    start_install: "提交安装申请",
    create_installation: "创建安装记录",
    create_installation_from_request: "创建安装记录",
    issue_installation_assertion: "签发安装断言",
    issue_reporter_credential: "签发 Reporter 凭证",
    send_signature_test_event: "发送签名测试",
    poll_bootstrap_status: "刷新激活状态",
    copy_diagnostic_ref: "复制诊断编号",
    request_catalog_review: "申请目录复核",
    request_agentops_summary: "申请 AgentOps 摘要",
    install_runtime: "安装 Runtime",
    upgrade_runtime: "升级 Runtime",
    view_missing_runtime_capabilities: "查看缺失能力",
    check_runtime_capabilities: "检查 Runtime 能力",
    continue_manifest_review: "继续 Manifest 复核",
    upgrade_runtime_or_select_compatible_version: "升级 Runtime 或换兼容版本",
    continue_listing_review: "继续上架审核",
    confirm_listing_fields: "确认上架字段",
    prepare_draft_review_submission: "准备草案提交",
    track_review_queue: "跟踪审核队列",
    confirm_owner_submission: "Owner 确认提交",
    notify_agentops_consumers: "通知 AgentOps 消费方",
    notify_agentops_deprecation: "通知 AgentOps 废弃",
    notify_agentops_security_revocation: "通知 AgentOps 安全撤销",
    return_to_validation: "返回包校验",
    continue_contract_change_review: "继续合同变更复核",
    complete_contract_traceability: "补齐合同追踪",
    resolve_runtime_gate: "处理 Runtime Gate",
    return_to_field_confirmation: "返回字段确认",
    return_to_validation_report: "返回校验报告",
    complete_agent_manifest: "补齐 Manifest",
    review_catalog_blocker: "查看阻断原因",
    view_policy: "查看策略说明",
    view_blocking_policy: "查看阻断策略",
    adjust_catalog_filters: "调整筛选条件",
    recommended: "优先推荐",
    eligible: "可评估",
    eligible_pending_verification: "待验证候选",
    needs_activation: "需激活",
    insufficient_evidence: "证据不足",
    empty: "暂无结果",
    yes: "可忽略",
    no: "不可忽略",
    catalog_curated_preview: "目录策展预览",
    agentops_echo_and_catalog: "AgentOps 回显 + 目录",
    catalog_filter: "目录筛选",
    catalog: "目录",
    package_trust: "包可信",
    enterprise_context: "企业策略",
    quality_evidence: "质量证据",
    l5_gate: "L5 门禁",
    agent_store_catalog: "Agent Store 目录",
    agent_store_package_trust: "Agent Store 包可信",
    agent_store_enterprise_context: "Agent Store 企业策略",
    agentops_summary: "AgentOps 摘要",
    agentops_summary_missing: "AgentOps 摘要缺失",
    agentops_summary_pending_signature_test: "AgentOps 等待签名测试",
    frontend_fallback_no_recommendation_envelope: "前端降级展示",
    recommendation_state_api: "Recommendation State API",
    recommendation_state_envelope_missing: "缺少推荐状态 envelope",
    signed_test_event_verified: "签名测试待验证",
    security_review: "安全复核",
    trusted_evidence_incomplete: "可信证据不完整",
    package_trust_not_verified: "包可信未验证",
    enterprise_activation_required: "需要企业激活",
    governance_blocked: "治理阻断",
    agentops_l5_gate_not_passed: "AgentOps L5 门禁未通过",
    actual_l5_blocked_until_agentops_verification: "等待 AgentOps 验证实际 L5",
    installability_blocked: "安装状态阻断",
    l5_unavailable_without_agentops_summary: "缺少 AgentOps 摘要，不能展示 L5",
    fresh_agentops_quality_summary: "新鲜 AgentOps 质量摘要",
    agentops_l5_gate: "AgentOps L5 门禁",
    runtime_missing: "缺 Runtime",
    runtime_upgrade_required: "需升级 Runtime",
    runtime_capability_missing: "缺 Runtime 能力",
    runtime_compatible: "Runtime 兼容",
    runtime_unknown: "Runtime 未探测",
    runtime_ready: "可运行",
    manifest_incomplete: "Manifest 待补齐",
    health_unavailable: "摘要不可用",
    health_invalid: "摘要无效",
    health_refresh_required: "待刷新",
    health_attention_required: "健康需关注",
    health_fresh: "健康摘要新鲜",
    healthy: "健康",
    unhealthy: "不健康",
    runtime_availability: "Runtime 可用性",
    runtime_availability_summary: "Runtime 可用性摘要",
    health_summary: "HealthSummary",
    health_summary_freshness: "HealthSummary 新鲜度",
    listing_wizard_shell: "上架向导",
    preview_ready: "预览就绪",
    needs_field_confirmation: "需确认字段",
    validation_fix_required: "需修复校验",
    runtime_gate_blocked: "Runtime Gate 阻断",
    source_selection: "来源选择",
    field_confirmation: "字段确认",
    validation_report: "校验报告",
    package_validation_report: "Package Validation Report",
    "package_validation_report.v1": "Package Validation Report v1",
    detail_preview: "详情预览",
    selected: "已选择",
    confirmed: "已确认",
    needs_owner_input: "需 Owner 确认",
    validation_failed: "校验失败",
    passed: "已通过",
    not_submitted_until_027: "026 不提交审核",
    draft_review_submission: "草案提交审核",
    "draft_review_submission.v1": "草案提交审核 v1",
    validation_blocked: "校验阻断",
    owner_confirmation_required: "需 Owner 确认",
    draft_review_blocked: "草案提交阻断",
    enqueued: "已入队",
    not_enqueued: "未入队",
    not_submitted: "未提交",
    owner_reviewed_listing_wizard: "Owner 已复核上架向导",
    owner_confirmed_before_review: "Owner 审核前确认",
    agent_store_upload_candidate: "Agent Store 上传候选",
    agent_store_package_validation: "Agent Store 包校验",
    candidate_only_until_user_confirmed: "用户确认前仅候选",
    agent_store_skill_registry_pending: "Skill Registry 待发布",
    frontend_fallback_no_package_validation_report: "前端降级包校验",
    submit_for_review: "提交审核",
    apply_fix_prompt: "应用修复提示",
    return_to_draft: "返回草案",
    agent_store_owner_explicit_confirmation: "Owner 显式确认",
    agentops_not_evaluated_until_review: "审核前 AgentOps 未评估",
    frontend_fallback_no_draft_review_submission: "前端降级草案提交",
    PACKAGE_VALIDATION_NOT_PASSED: "包校验未通过",
    PACKAGE_VALIDATION_REPORT_MISSING: "缺 Package Validation Report",
    PLACEHOLDER_VALUE_BLOCKED: "占位值阻断",
    AI_FIELD_SOURCE_REQUIRED: "AI 字段缺来源",
    SCAN_REPORT_REF_MISSING: "缺扫描报告",
    SKILL_SCHEMA_REQUIRED: "缺 Skill Schema",
    RUNTIME_GATE_NOT_READY: "Runtime Gate 未就绪",
    OWNER_CONFIRMATION_REQUIRED: "需要 Owner 确认",
    DRAFT_REVIEW_SUBMISSION_MISSING: "缺草案提交 envelope",
    listing_workbench: "上架工作台",
    "listing_workbench.v1": "上架工作台 v1",
    listing_workbench_unavailable: "上架工作台不可用",
    draft_active: "草案进行中",
    fix_required: "需修复",
    pending_approval: "待审批",
    published_active: "已发布",
    pending_owner_review: "等待 Owner 审核",
    draft_blocked: "草案阻断",
    blocked_until_validation: "校验前阻断",
    blocked_until_security_review: "安全复核前阻断",
    due_today: "今日到期",
    no_pending_review: "无待审",
    not_approval: "回执不是批准",
    open_listing_workbench: "打开上架工作台",
    fix_listing_validation: "修复上架校验",
    return_to_listing_draft: "返回上架草案",
    continue_listing_workbench_review: "继续上架复核",
    refresh_listing_workbench: "刷新上架工作台",
    frontend_fallback_no_listing_workbench: "前端降级上架工作台",
    skill_registry: "Skill Registry",
    "skill_registry.v1": "Skill Registry v1",
    "skill_registry_notification.v1": "Skill Registry 通知 v1",
    "skill_registry_notification_ack.v1": "Skill Registry 通知回执 v1",
    published: "已发布",
    deprecated: "已废弃",
    security_revoked: "安全撤销",
    registration_blocked: "注册阻断",
    transition_blocked: "状态转换阻断",
    skill_published: "Skill 已发布",
    skill_deprecated: "Skill 已废弃",
    skill_security_revoked: "Skill 安全撤销",
    ready_for_consumption: "可通知 AgentOps",
    notice_required: "需要通知",
    not_ready: "未就绪",
    current_record_retained: "保留当前记录",
    accepted: "已接收",
    not_sent: "未发送",
    agentops_consumes_agent_store_registry: "AgentOps 消费 Store Registry",
    frontend_fallback_no_skill_registry_lifecycle: "前端降级 Skill Registry",
    SKILL_REGISTRY_ENVELOPE_MISSING: "缺 Skill Registry envelope",
    SKILL_APPROVAL_REQUIRED: "需要 Owner 审批",
    SKILL_RISK_REQUIRED: "需要风险说明",
    SECURITY_EVIDENCE_REQUIRED: "需要安全证据",
    SKILL_SECURITY_REVOKED_TERMINAL: "安全撤销为终态",
    contract_registry_traceability: "合同注册追踪",
    "contract_registry_traceability.v1": "合同注册追踪 v1",
    complete: "追踪完整",
    incomplete: "追踪缺口",
    frontend_fallback_no_contract_registry_traceability: "前端降级合同追踪",
    agent_manifest_runtime_contract: "AgentManifest Runtime 合同",
    "agent_manifest_runtime_contract.v1": "AgentManifest Runtime 合同 v1",
    "agent_manifest.v1": "AgentManifest v1",
    agent_store: "Agent Store",
    agent_store_manifest_projection: "Agent Store Manifest 投影",
    frontend_fallback_no_agent_manifest_runtime_contract: "前端降级 Manifest 合同",
    RUNTIME_CAPABILITY_MISSING: "缺 Runtime 能力",
    OBSERVABILITY_CONTRACT_TRACE_SPANS_REQUIRED: "缺 observability trace_spans",
    AGENT_MANIFEST_RUNTIME_CONTRACT_MISSING: "缺 AgentManifest Runtime 合同",
    AgentOps: "AgentOps",
    "Agent Runtime": "Agent Runtime",
    "Agent Store UI": "Agent Store UI",
    "Ai_AutoSDLC": "Ai_AutoSDLC",
    "Evidence Vault": "Evidence Vault",
    "Notification Center": "通知中心",
    "Risk Center": "风险列表",
    agent_runtime_echo_or_probe: "Agent Runtime Echo/Probe",
    summary_projection: "摘要投影",
    agent_store_runtime_availability_projection: "Agent Store 可用性投影",
    recommendation_state_excludes_health_summary: "推荐决策不使用 HealthSummary",
    request_agentops_health_summary: "申请 HealthSummary",
    refresh_agentops_health_summary: "刷新 HealthSummary",
    view_agentops_health_detail: "查看健康详情",
    continue_health_review: "继续健康摘要复核",
    installation_distribution_summary: "安装分布摘要",
    "installation_distribution_summary.v1": "安装分布摘要 v1",
    distribution_ready: "分布可展示",
    distribution_unavailable: "分布不可用",
    empty_distribution: "空版本范围",
    permission_required: "需要权限",
    activation_required: "需企业激活",
    reporter_pending: "Reporter 待验证",
    failed: "失败",
    revoked: "已撤销",
    darwin: "macOS",
    linux: "Linux",
    windows: "Windows",
    suspended: "已暂停",
    attention_required: "需关注",
    none: "无",
    request_owner_distribution_permission: "申请安装分布权限",
    refresh_installation_inventory: "刷新安装库存",
    prepare_owner_notification: "准备 Owner 通知",
    continue_owner_distribution_review: "继续分布复核",
    strip_individual_installation_identifiers: "剥离个人安装标识",
    select_agent_with_installations: "选择有安装记录的 Agent",
    select_version_with_installations: "选择有安装记录的版本",
    installation_inventory: "安装库存",
    device_binding: "设备绑定",
    agentops_not_computed_here: "质量不在 Store 计算",
    frontend_fallback_no_installation_distribution_summary: "前端降级安装分布",
    OWNER_DISTRIBUTION_PERMISSION_REQUIRED: "需要 Owner 分布权限",
    INSTALLATION_INVENTORY_REQUIRED: "需要安装库存",
    INDIVIDUAL_IDENTIFIERS_STRIPPED: "个人标识已剥离",
    AGENT_INSTALLATION_SCOPE_EMPTY: "Agent 安装范围为空",
    VERSION_INSTALLATION_SCOPE_EMPTY: "版本安装范围为空",
    INSTALLATION_DISTRIBUTION_SUMMARY_MISSING: "缺安装分布摘要",
    feedback_owner_response_loop: "反馈闭环",
    "feedback_owner_response_loop.v1": "反馈闭环 v1",
    submitted: "已提交",
    triaged: "已分诊",
    owner_replied: "Owner 已回复",
    planned: "已计划",
    fixed: "已修复",
    released: "已发布",
    submit: "提交",
    triage: "分诊",
    owner_reply: "Owner 回复",
    plan: "计划",
    fix: "修复",
    reject: "拒绝",
    release: "发布",
    bug: "缺陷",
    usability: "易用性",
    feature_request: "功能请求",
    general: "通用",
    requester: "请求者",
    owner: "Owner",
    triage_feedback: "分诊反馈",
    request_owner_response: "请求 Owner 回复",
    plan_or_reject_feedback: "计划或拒绝反馈",
    mark_feedback_fixed: "标记已修复",
    attach_release: "关联发布",
    view_feedback_decision: "查看反馈决策",
    view_release_notes: "查看发布说明",
    return_to_feedback_queue: "返回反馈队列",
    choose_allowed_transition: "选择允许的状态迁移",
    attach_release_link: "补充发布链接",
    agent_store_feedback: "Agent Store 反馈",
    agent_store_owner_response: "Agent Store Owner 回复",
    agent_store_release_linkage: "Agent Store 发布关联",
    agent_store_notification_queue: "Agent Store 通知队列",
    INVALID_TRANSITION_ACTION: "不支持的迁移动作",
    INVALID_FEEDBACK_TRANSITION: "不允许的反馈迁移",
    FEEDBACK_IDENTITY_REQUIRED: "缺反馈身份",
    ACTOR_REQUIRED: "缺 actor",
    TRANSITION_MESSAGE_REQUIRED: "缺迁移说明",
    OWNER_RESPONSE_REQUIRED: "需要 Owner 角色",
    RELEASE_LINK_REQUIRED: "需要发布链接",
    FEEDBACK_LOOP_SUMMARY_MISSING: "缺反馈闭环摘要",
    lifecycle_governance_baseline: "生命周期治理基线",
    "lifecycle_governance_baseline.v1": "生命周期治理基线 v1",
    upgrade_available: "可升级",
    rollback_available: "可回退",
    deprecated: "已废弃",
    security_revoked: "安全撤销",
    upgrade: "升级",
    rollback: "回退",
    deprecate: "废弃",
    disable: "停用",
    security_revoke: "安全撤销",
    security: "安全",
    stable: "稳定",
    fix_lifecycle_transition: "修复生命周期迁移",
    notify_security_revocation: "通知安全撤销",
    notify_disabled_version: "通知版本停用",
    notify_available_replacement: "通知替代版本",
    notify_lifecycle_change: "通知生命周期变更",
    open_security_review: "打开安全复核",
    request_owner_approval: "请求 Owner 批准",
    request_security_review: "请求安全复核",
    attach_security_evidence: "补充安全证据",
    attach_replacement_version: "补充替代版本",
    attach_rollback_version: "补充回退版本",
    attach_impact_scope: "补充影响范围",
    agent_store_agent_version: "Agent Store AgentVersion",
    agent_store_lifecycle_governance: "Agent Store 生命周期治理",
    agent_store_replacement_mapping: "Agent Store 替代版本映射",
    agent_store_installation_inventory: "Agent Store 安装库存",
    LIFECYCLE_ACTION_UNSUPPORTED: "不支持的生命周期动作",
    AGENT_VERSION_IDENTITY_REQUIRED: "缺 AgentVersion 身份",
    LIFECYCLE_REASON_REQUIRED: "缺生命周期原因",
    OWNER_APPROVAL_REQUIRED: "需要 Owner 批准",
    SECURITY_ACTOR_REQUIRED: "需要安全角色",
    SECURITY_EVIDENCE_REQUIRED: "需要安全证据",
    REPLACEMENT_VERSION_REQUIRED: "需要替代版本",
    ROLLBACK_VERSION_REQUIRED: "需要回退版本",
    IMPACT_SCOPE_REQUIRED: "需要影响范围",
    SECURITY_REVOKED_TERMINAL: "安全撤销是终态",
    LIFECYCLE_GOVERNANCE_SUMMARY_MISSING: "缺生命周期治理摘要",
    quality_evidence_access_summary: "质量证据访问摘要",
    "quality_evidence_access_summary.v1": "质量证据访问摘要 v1",
    summary_ready: "摘要可展示",
    summary_redacted: "摘要已遮蔽",
    summary_expired: "摘要已过期",
    summary_unavailable: "摘要不可用",
    template_deprecated: "模板已废弃",
    can_view_quality_summary: "可看质量摘要",
    can_view_raw_evidence: "可看证据原文",
    evidence_vault_request_required: "需 Evidence Vault 申请",
    agent_store_viewer_context: "Agent Store Viewer Context",
    quality_summary: "质量摘要",
    run_evidence: "运行证据",
    raw_trace: "Raw Trace",
    raw_evidence: "Raw Evidence",
    projection: "投影",
    request_raw_evidence_access: "申请原文证据访问",
    refresh_agentops_quality_summary: "刷新质量摘要",
    request_score_template_refresh: "刷新评分模板",
    continue_quality_evidence_review: "继续质量证据复核",
    AGENTOPS_QUALITY_SUMMARY_REQUIRED: "缺 AgentOps 质量摘要",
    QUALITY_SUMMARY_REDACTED: "质量摘要已遮蔽",
    QUALITY_SUMMARY_EXPIRED: "质量摘要已过期",
    SCORE_TEMPLATE_DEPRECATED: "评分模板已废弃",
    RAW_EVIDENCE_LINK_STRIPPED: "原文链接已剥离",
    frontend_fallback_no_quality_evidence_access_summary: "前端降级质量证据访问",
    store_ops_deep_link: "Store 到 Ops 深链",
    "store_ops_deep_link.v1": "Store 到 Ops 深链 v1",
    deep_link_ready: "深链就绪",
    link_sanitized: "链接已净化",
    link_unavailable: "链接不可用",
    run_detail: "Run Detail",
    open_agentops_run_detail: "打开 AgentOps Run Detail",
    open_sanitized_agentops_run_detail: "打开净化 Run Detail",
    request_agentops_summary_with_run_binding: "申请 Run Binding",
    strip_raw_trace_links: "剥离原文链接",
    RUN_ID_REQUIRED: "需要 run_id",
    SESSION_ID_REQUIRED: "需要 session_id",
    RAW_TRACE_LINK_STRIPPED: "Raw Trace 链接已剥离",
    policy_approval_request: "审批请求",
    "policy_approval_request.v1": "审批请求 v1",
    policy_approval_receipt: "审批回执",
    "policy_approval_receipt.v1": "审批回执 v1",
    approval_request_ready: "审批请求就绪",
    requester_required: "需要 requester",
    policy_context_incomplete: "策略上下文不完整",
    justification_required: "需要审批理由",
    approval_request_blocked: "审批请求阻断",
    approval_receipt_accepted: "回执已接收",
    approval_receipt_pending: "回执排队中",
    approval_receipt_rejected: "回执已拒绝",
    approval_receipt_unavailable: "回执不可用",
    install_agent: "安装 Agent",
    publish_agent: "发布 Agent",
    upgrade_agent: "升级 Agent",
    enable_agent: "启用 Agent",
    submit_agentops_approval_request: "提交 AgentOps 审批请求",
    complete_policy_context: "补齐策略上下文",
    add_approval_justification: "补充审批理由",
    assign_authorized_requester: "指定授权 requester",
    view_agentops_approval: "查看 AgentOps 审批",
    poll_agentops_approval_receipt: "轮询审批回执",
    fix_agentops_approval_request: "修复审批请求",
    refresh_agentops_approval_receipt: "刷新审批回执",
    agentops_not_decided_by_receipt: "回执不代表 AgentOps 决策",
    agent_store_receipt_only: "Store 仅展示回执",
    agentops_receipt_only: "AgentOps 回执投影",
    AGENT_VERSION_IDENTITY_REQUIRED: "缺 AgentVersion 身份",
    REQUESTED_ACTION_UNSUPPORTED: "不支持的审批动作",
    REQUESTER_REQUIRED: "缺 requester",
    REQUESTER_ROLE_UNAUTHORIZED: "requester 角色无权",
    POLICY_CONTEXT_INCOMPLETE: "策略上下文不完整",
    JUSTIFICATION_REQUIRED: "缺审批理由",
    APPROVAL_REQUEST_REF_INVALID: "审批请求引用无效",
    AGENTOPS_RECEIPT_CONTRACT_UNSUPPORTED: "回执合同不支持",
    AGENTOPS_RECEIPT_STATUS_UNSUPPORTED: "回执状态不支持",
    AGENTOPS_RECEIPT_INCOMPLETE: "回执不完整",
    APPROVAL_RECEIPT_REQUEST_MISMATCH: "回执与请求不匹配",
    policy_approval_echo: "Policy Approval Echo",
    "policy_approval_echo.v1": "Policy Approval Echo v1",
    policy_allowed: "策略允许",
    approval_pending: "审批待处理",
    approval_expired: "审批已过期",
    policy_denied: "策略拒绝",
    agentops_echo_unavailable: "AgentOps Echo 不可用",
    agentops_echo_only: "AgentOps Echo Only",
    agent_store_echo_only: "Store Echo Only",
    continue_store_flow: "继续 Store 流程",
    request_approval_refresh: "刷新审批回显",
    view_blocking_policy: "查看阻断策略",
    refresh_agentops_policy_echo: "刷新 Policy Echo",
    AGENTOPS_POLICY_ECHO_INCOMPLETE: "Policy Echo 不完整",
    AGENTOPS_POLICY_DECISION_UNSUPPORTED: "PolicyDecision 不支持",
    AGENTOPS_APPROVAL_STATUS_UNSUPPORTED: "Approval 状态不支持",
    AGENTOPS_APPROVAL_EXPIRES_AT_INVALID: "Approval 过期时间无效",
    AGENTOPS_APPROVAL_EXPIRED: "Approval 已过期",
    managed_installer_preview: "托管安装预览",
    "managed_installer_preview.v1": "托管安装预览 v1",
    ready_to_install_preview: "预览可安装",
    preview_passed: "预览已通过",
    download_blocked: "下载阻断",
    signature_blocked: "签名阻断",
    runtime_handoff_blocked: "Runtime Handoff 阻断",
    smoke_test_failed: "Smoke Test 失败",
    preview_only: "仅预览",
    not_started_preview_only: "仅预览未执行",
    download_artifact: "下载安装包",
    verify_signature: "校验签名",
    create_isolated_install: "创建隔离安装",
    smoke_test: "Smoke Test",
    failure_diagnostics: "失败诊断",
    not_run: "未运行",
    not_required: "不需要",
    available: "可用",
    basic_sandbox: "基础沙箱",
    policy_bound: "策略绑定网络",
    scoped_write: "受限写入",
    runtime_handoff_ready: "Runtime Handoff 就绪",
    runtime_handoff_missing: "缺 Runtime Handoff",
    installation_runtime_handoff: "Installation Runtime Handoff",
    "installation_runtime_handoff.v1": "Installation Runtime Handoff v1",
    artifact_hash_mismatch: "包哈希不一致",
    device_binding_mismatch: "设备绑定不一致",
    installation_not_ready: "安装未就绪",
    agent_runtime_echo_or_request: "Agent Runtime Echo/Request",
    frontend_fallback_no_installation_runtime_handoff: "前端降级 Runtime Handoff",
    start_runtime_activation: "开始 Runtime 激活",
    regenerate_activation_command: "重生成激活命令",
    restart_activation: "重新激活",
    review_installation_status: "复核安装状态",
    prepare_managed_install: "准备托管安装",
    refresh_package_download: "刷新包下载",
    regenerate_package_signature: "重新生成包签名",
    copy_installer_diagnostic: "复制安装诊断",
    refresh_managed_installer_preview: "刷新安装预览",
    agentops_via_policy_approval_echo: "AgentOps Policy Echo",
    agent_store_installation_runtime_handoff: "Store Runtime Handoff",
    agent_store_preview: "Agent Store 预览诊断",
    DOWNLOAD_SOURCE_UNAVAILABLE: "下载源不可用",
    SIGNATURE_OR_HASH_UNTRUSTED: "签名或 hash 不可信",
    POLICY_APPROVAL_NOT_ALLOWED: "Policy Echo 未允许",
    RUNTIME_HANDOFF_NOT_READY: "Runtime Handoff 未就绪",
    ARTIFACT_HASH_MISMATCH: "包哈希不一致",
    DEVICE_BINDING_MISMATCH: "设备绑定不一致",
    DEVICE_BINDING_NOT_ACTIVE: "设备绑定未激活",
    INSTALLATION_NOT_READY: "安装未就绪",
    INSTALLATION_RUNTIME_HANDOFF_MISSING: "缺 Installation Runtime Handoff",
    SMOKE_TEST_FAILED: "Smoke Test 失败",
    MANAGED_INSTALLER_PREVIEW_MISSING: "缺托管安装预览",
    notification_routing_summary: "通知路由摘要",
    "notification_routing_summary.v1": "通知路由摘要 v1",
    routing_ready: "路由就绪",
    routing_degraded: "路由降级",
    routing_blocked: "路由阻断",
    not_sent: "未发送",
    notification_center: "通知中心",
    task_center: "待办中心",
    wecom: "企微",
    risk_list: "风险列表",
    owner_dashboard: "Owner 看板",
    audit_log: "审计日志",
    installation_failed: "安装失败",
    approval_required: "需要审批",
    feedback_owner_replied: "Owner 已回复",
    lifecycle_replacement_available: "可替代版本",
    security_revoked: "安全撤销",
    enqueue_notification_route: "加入通知路由",
    review_notification_route: "复核通知路由",
    fix_notification_routing_context: "补齐路由上下文",
    agent_store_event: "Agent Store 事件",
    trusted_iam_or_owner_directory: "可信 IAM/Owner 目录",
    notification_center_not_sent_by_store: "Store 未发送通知",
    agentops_not_overridden: "不覆盖 AgentOps",
    enterprise_messaging: "企业消息",
    TRUSTED_AUDIENCE_REQUIRED: "需要可信受众",
    RISK_LIST_CHANNEL_FORCED: "强制风险列表",
    ENTERPRISE_SENDER_NOT_CONFIGURED: "企业发送器未配置",
    NOTIFICATION_ROUTING_SUMMARY_MISSING: "缺通知路由摘要",
    frontend_fallback_no_notification_routing_summary: "前端降级通知路由",
    permission_denial_action_summary: "权限恢复摘要",
    "permission_denial_action_summary.v1": "权限恢复摘要 v1",
    not_visible: "不可见",
    unsupported: "不支持场景",
    visible_not_installable: "可见不可安装",
    raw_evidence_denied: "证据原文无权",
    high_risk_approval_required: "高风险需审批",
    policy_blocked: "策略阻断",
    visibility_denied: "可见性被拒绝",
    install_permission_required: "需安装权限",
    raw_evidence_access_required: "需证据原文权限",
    agentops_approval_required: "需 AgentOps 审批",
    agentops_policy_blocked: "AgentOps 策略阻断",
    denial_unavailable: "权限状态待刷新",
    install_denied: "安装被拒绝",
    evidence_vault_required: "需 Evidence Vault",
    policy_denied: "策略拒绝",
    permission_unknown: "权限未知",
    trusted_iam_auth_context: "可信 IAM 身份上下文",
    iam_or_agentops_policy_echo: "IAM/AgentOps 权限回显",
    request_visibility_access: "申请可见性",
    request_install_permission: "申请安装权限",
    contact_agent_owner: "联系 Owner",
    request_evidence_access: "申请证据原文",
    return_to_evidence_summary: "返回证据摘要",
    submit_agentops_approval: "提交 AgentOps 审批",
    view_access_scope: "查看访问范围",
    view_policy_reason: "查看策略原因",
    view_replacement_agent: "查看替代 Agent",
    refresh_identity: "刷新身份",
    return_to_catalog: "返回目录",
    notify_owner_on_request: "申请时通知 Owner",
    notify_evidence_vault_on_request: "申请 Evidence Vault",
    notify_agentops_approval_center: "通知审批中心",
    notify_security_iam_and_owner: "通知安全和 Owner",
    audit_only: "仅审计",
    DENIAL_SCENARIO_UNSUPPORTED: "不支持的权限场景",
    TRUSTED_AUTH_CONTEXT_REQUIRED: "需要可信身份上下文",
    PERMISSION_DECISION_REQUIRED: "缺权限裁决",
    POLICY_REF_REQUIRED: "缺策略引用",
    RAW_PERMISSION_LINK_STRIPPED: "原文链接已剥离",
    frontend_fallback_no_permission_denial_action_summary: "前端降级权限恢复"
  };

  function displayLabel(value) {
    if (value === true) {
      return "是";
    }
    if (value === false) {
      return "否";
    }
    if (value === null || value === undefined || value === "") {
      return "暂无";
    }
    if (typeof value === "object") {
      return JSON.stringify(value);
    }
    return DISPLAY_LABELS[value] || value;
  }

  function formatSourceOfTruth(sourceOfTruth) {
    if (!sourceOfTruth || typeof sourceOfTruth !== "object") {
      return displayLabel(sourceOfTruth);
    }
    return Object.keys(sourceOfTruth).map(function mapSource(key) {
      return displayLabel(key) + ": " + displayLabel(sourceOfTruth[key]);
    }).join(" / ");
  }

  function formatTrustBlocker(blocker) {
    if (!blocker || typeof blocker !== "object") {
      return displayLabel(blocker);
    }
    return [
      displayLabel(blocker.blocker_id),
      displayLabel(blocker.source),
      displayLabel(blocker.severity)
    ].filter(Boolean).join(" / ");
  }

  Vue.component("sdlc-enterprise-provider-meta", {
    template: [
      '<div class="provider-meta" data-provider="sdlc-enterprise-vue2">',
      '  <span>{{ provider.packageName }}</span>',
      '  <span>{{ provider.installedVersion }}</span>',
      '  <span>{{ provider.themePackageName }}</span>',
      '</div>'
    ].join(""),
    data: function data() {
      return {
        provider: ENTERPRISE_VUE2_PROVIDER
      };
    }
  });

  Vue.component("sdlc-status-chip", {
    props: ["label", "tone"],
    template: '<span class="status-chip" :class="toneClass">{{ displayLabel }}</span>',
    computed: {
      toneClass: function toneClass() {
        return "status-chip--" + (this.tone || "neutral");
      },
      displayLabel: function computedDisplayLabel() {
        return displayLabel(this.label);
      }
    }
  });

  Vue.component("sdlc-action-button", {
    props: ["action", "kind"],
    template: [
      '<button class="action-button" :class="kindClass" type="button"',
      ' :disabled="disabled" :title="auditTitle"',
      ' @click="invoke">',
      '  <span class="action-button__icon" aria-hidden="true">{{ icon }}</span>',
      '  <span>{{ actionLabel }}</span>',
      '</button>'
    ].join(""),
    computed: {
      disabled: function disabled() {
        return this.action.enabled === false;
      },
      kindClass: function kindClass() {
        return "action-button--" + (this.kind || "secondary");
      },
      actionLabel: function actionLabel() {
        return displayLabel(this.action.action_id);
      },
      auditTitle: function auditTitle() {
        return displayLabel(this.action.target_system) + " / " + this.action.action_id;
      },
      icon: function icon() {
        if (this.action.target_system === "agentops") {
          return "↗";
        }
        if (this.action.target_system === "ai_autosdlc_cli") {
          return "⌘";
        }
        return "→";
      }
    },
    methods: {
      invoke: function invoke() {
        if (!this.disabled) {
          this.$emit("invoke", this.action);
        }
      }
    }
  });

  Vue.component("sdlc-action-feedback", {
    props: ["feedback"],
    template: [
      '<section class="action-feedback" :class="\'action-feedback--\' + feedback.state" aria-live="polite">',
      '  <div>',
      '    <span class="action-feedback__eyebrow">当前操作</span>',
      '    <strong>{{ title }}</strong>',
      '  </div>',
      '  <p>{{ feedback.message }}</p>',
      '  <dl v-if="feedback.audit_id" class="action-feedback__meta">',
      '    <dt>审计编号</dt><dd>{{ feedback.audit_id }}</dd>',
      '    <dt>事实边界</dt><dd>{{ feedback.boundary }}</dd>',
      '  </dl>',
      '</section>'
    ].join(""),
    computed: {
      title: function title() {
        return displayLabel(this.feedback.action_id || "adjust_catalog_filters");
      }
    }
  });

  Vue.component("sdlc-remediation-actions", {
    props: ["actions"],
    template: [
      '<div class="remediation-actions" v-if="actions && actions.length">',
      '  <div class="remediation-actions__heading">',
      '    <span>推荐动作</span>',
      '    <strong>{{ actions.length }}</strong>',
      '  </div>',
      '  <ol class="remediation-actions__list">',
      '    <li v-for="(action, actionIndex) in actions" :key="action.action_id">',
      '      <span class="remediation-actions__order">{{ actionIndex + 1 }}</span>',
      '      <span class="remediation-actions__target">{{ displayLabel(action.target_system) }}</span>',
      '      <sdlc-action-button :action="action" :kind="actionIndex === 0 ? \'primary\' : \'secondary\'" @invoke="$emit(\'invoke-action\', $event)"></sdlc-action-button>',
      '    </li>',
      '  </ol>',
      '</div>'
    ].join(""),
    methods: {
      displayLabel: displayLabel
    }
  });

  Vue.component("sdlc-metric-row", {
    props: ["label", "value", "tone"],
    template: [
      '<div class="metric-row">',
      '  <dt>{{ label }}</dt>',
      '  <dd><sdlc-status-chip :label="value" :tone="tone"></sdlc-status-chip></dd>',
      '</div>'
    ].join("")
  });

  Vue.component("sdlc-section", {
    props: ["title"],
    template: [
      '<section class="workspace-section er-card">',
      '  <h2>{{ title }}</h2>',
      '  <slot></slot>',
      '</section>'
    ].join("")
  });

  Vue.component("sdlc-agent-card", {
    props: ["agent", "active"],
    template: [
      '<article class="agent-card" :class="{ \'agent-card--active\': active }">',
      '  <button class="agent-card__button" type="button" @click="$emit(\'select\', agent)">',
      '    <span class="agent-card__type">{{ agent.capability_type }}</span>',
      '    <span class="agent-card__name">{{ agent.display_name }}</span>',
      '    <span class="agent-card__summary">{{ agent.summary }}</span>',
      '  </button>',
      '  <dl class="agent-card__facts">',
      '    <sdlc-metric-row label="版本" :value="agent.version" tone="neutral"></sdlc-metric-row>',
      '    <sdlc-metric-row label="可信" :value="agent.trust_state" :tone="trustTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="适合" :value="agent.audience" tone="info"></sdlc-metric-row>',
      '    <sdlc-metric-row label="接入" :value="setupLabel" :tone="setupTone"></sdlc-metric-row>',
      '  </dl>',
      '  <ul class="agent-card__tags"><li v-for="tag in productTags" :key="tag">{{ tag }}</li></ul>',
      '  <div class="agent-card__footer">',
      '    <span>{{ productMeta }}</span>',
      '    <span class="agent-card__intent">{{ displayLabel(agent.installability) }}</span>',
      '  </div>',
      '</article>'
    ].join(""),
    computed: {
      trustTone: function trustTone() {
        if (this.agent.trust_state === "trusted") {
          return "success";
        }
        if (this.agent.trust_state === "warning") {
          return "warning";
        }
        return "danger";
      },
      enterpriseTone: function enterpriseTone() {
        if (this.agent.enterprise_state === "active") {
          return "success";
        }
        if (this.agent.enterprise_state === "required_unactivated") {
          return "warning";
        }
        return "info";
      },
      setupLabel: function setupLabel() {
        if (this.agent.setup_minutes === null || this.agent.setup_minutes === undefined || this.agent.setup_minutes === "") {
          return "待评估";
        }
        return this.agent.setup_minutes + " 分钟";
      },
      setupTone: function setupTone() {
        if (this.agent.installability === "blocked") {
          return "danger";
        }
        if (
          this.agent.setup_minutes !== null
          && this.agent.setup_minutes !== undefined
          && this.agent.setup_minutes !== ""
          && this.agent.setup_minutes <= 8
        ) {
          return "success";
        }
        return "warning";
      },
      productTags: function productTags() {
        return Array.isArray(this.agent.product_tags) ? this.agent.product_tags : [];
      },
      productMeta: function productMeta() {
        return [
          this.agent.rating_summary || "暂无评分",
          this.agent.adoption || "暂无采用数据"
        ].join(" · ");
      }
    },
    methods: {
      displayLabel: displayLabel
    }
  });

  Vue.component("sdlc-discovery-rail", {
    props: ["collections", "stats", "highlight", "activeCollection"],
    template: [
      '<section class="discovery-rail" aria-labelledby="discovery-title">',
      '  <div class="discovery-rail__main">',
      '    <div class="product-mark">Agent Store</div>',
      '    <h1 id="discovery-title">发现适合当前交付任务的 Agent</h1>',
      '    <p>{{ highlight.verdict }}</p>',
      '    <div class="discovery-rail__highlight">',
      '      <span>当前推荐</span>',
      '      <strong>{{ highlight.title }}</strong>',
      '      <small>{{ highlight.reason }}</small>',
      '    </div>',
      '  </div>',
      '  <div class="discovery-rail__side">',
      '    <dl class="discovery-stats">',
      '      <div><dt>目录</dt><dd>{{ stats.total }}</dd></div>',
      '      <div><dt>推荐</dt><dd>{{ stats.recommended }}</dd></div>',
      '      <div><dt>可开始</dt><dd>{{ stats.ready }}</dd></div>',
      '      <div><dt>需关注</dt><dd>{{ stats.guarded }}</dd></div>',
      '    </dl>',
      '    <div class="collection-tabs" aria-label="发现集合">',
      '      <button v-for="collection in collections" :key="collection.id" type="button"',
      '        :class="{ active: collection.active }"',
      '        @click="$emit(\'set-discovery-collection\', collection.id)">',
      '        <span>{{ collection.label }}</span><strong>{{ collection.count }}</strong>',
      '      </button>',
      '    </div>',
      '  </div>',
      '</section>'
    ].join("")
  });

  Vue.component("sdlc-agent-catalog", {
    props: [
      "catalog",
      "catalogTotalCount",
      "discoveryCollections",
      "discoveryStats",
      "discoveryHighlight",
      "selectedAgentId",
      "searchQuery",
      "discoveryCollection",
      "typeFilter",
      "trustFilter",
      "installabilityFilter"
    ],
    template: [
      '<section class="catalog-band" aria-labelledby="catalog-title">',
      '  <div class="catalog-heading">',
      '    <div>',
      '      <div class="product-mark">目录</div>',
      '      <h2 id="catalog-title">Agent 应用列表</h2>',
      '    </div>',
      '    <p>{{ catalog.length }} / {{ catalogTotalCount }} 个条目，覆盖 Agent、Skill、Framework Capability 与运行时治理组件。</p>',
      '  </div>',
      '  <div class="catalog-toolbar">',
      '    <label class="catalog-search">',
      '      <span>搜索</span>',
      '      <input type="search" :value="searchQuery" placeholder="Agent 名称、Owner、能力" @input="$emit(\'update-search\', $event.target.value)">',
      '    </label>',
      '    <div class="filter-group" aria-label="类型筛选">',
      '      <button type="button" :class="{ active: typeFilter === \'all\' }" @click="$emit(\'set-type-filter\', \'all\')">全部</button>',
      '      <button type="button" :class="{ active: typeFilter === \'framework_capability\' }" @click="$emit(\'set-type-filter\', \'framework_capability\')">框架能力</button>',
      '      <button type="button" :class="{ active: typeFilter === \'agent\' }" @click="$emit(\'set-type-filter\', \'agent\')">Agent</button>',
      '      <button type="button" :class="{ active: typeFilter === \'skill\' }" @click="$emit(\'set-type-filter\', \'skill\')">技能</button>',
      '    </div>',
      '    <div class="filter-group" aria-label="可信状态筛选">',
      '      <button type="button" :class="{ active: trustFilter === \'all\' }" @click="$emit(\'set-trust-filter\', \'all\')">全部可信</button>',
      '      <button type="button" :class="{ active: trustFilter === \'trusted\' }" @click="$emit(\'set-trust-filter\', \'trusted\')">可信</button>',
      '      <button type="button" :class="{ active: trustFilter === \'warning\' }" @click="$emit(\'set-trust-filter\', \'warning\')">需关注</button>',
      '      <button type="button" :class="{ active: trustFilter === \'blocked\' }" @click="$emit(\'set-trust-filter\', \'blocked\')">已阻断</button>',
      '    </div>',
      '    <div class="filter-group" aria-label="安装状态筛选">',
      '      <button type="button" :class="{ active: installabilityFilter === \'all\' }" @click="$emit(\'set-installability-filter\', \'all\')">全部安装</button>',
      '      <button type="button" :class="{ active: installabilityFilter === \'installable\' }" @click="$emit(\'set-installability-filter\', \'installable\')">可安装</button>',
      '      <button type="button" :class="{ active: installabilityFilter === \'activation_required\' }" @click="$emit(\'set-installability-filter\', \'activation_required\')">需激活</button>',
      '      <button type="button" :class="{ active: installabilityFilter === \'standalone_only\' }" @click="$emit(\'set-installability-filter\', \'standalone_only\')">仅本地</button>',
      '      <button type="button" :class="{ active: installabilityFilter === \'blocked\' }" @click="$emit(\'set-installability-filter\', \'blocked\')">已阻断</button>',
      '    </div>',
      '  </div>',
      '  <div class="catalog-grid">',
      '    <sdlc-agent-card',
      '      v-for="agent in catalog"',
      '      :key="agent.agent_id"',
      '      :agent="agent"',
      '      :active="agent.agent_id === selectedAgentId"',
      '      @select="$emit(\'select-agent\', $event)"',
      '    ></sdlc-agent-card>',
      '  </div>',
      '  <div class="empty-state" v-if="catalog.length === 0">',
      '    <strong>没有匹配的 Agent</strong>',
      '    <span>调整搜索词或筛选条件后重试。</span>',
      '  </div>',
      '</section>'
    ].join("")
  });

  Vue.component("sdlc-install-workflow", {
    props: ["workflow"],
    template: [
      '<section class="workspace-section install-panel">',
      '  <div class="section-heading">',
      '    <h2>安装与激活流程</h2>',
      '    <sdlc-status-chip :label="workflow.workflow_state" :tone="stateTone"></sdlc-status-chip>',
      '  </div>',
      '  <div class="command-preview" v-if="workflow.command_preview">',
      '    <span>命令预览</span>',
      '    <code>{{ workflow.command_preview }}</code>',
      '  </div>',
      '  <ol class="workflow-steps">',
      '    <li v-for="step in workflow.steps" :key="step.step_id" :class="\'workflow-step--\' + step.state">',
      '      <span class="workflow-step__state">{{ displayLabel(step.state) }}</span>',
      '      <span class="workflow-step__label">{{ step.label }}</span>',
      '      <span class="workflow-step__owner">{{ displayLabel(step.owner_system) }}</span>',
      '    </li>',
      '  </ol>',
      '  <div class="install-panel__footer">',
      '    <span>audit: {{ workflow.audit_id }}</span>',
      '    <div class="install-panel__actions">',
      '      <sdlc-action-button :action="workflow.primary_action" kind="primary" @invoke="$emit(\'invoke-action\', $event)"></sdlc-action-button>',
      '      <sdlc-action-button v-if="workflow.recovery_action" :action="workflow.recovery_action" @invoke="$emit(\'invoke-action\', $event)"></sdlc-action-button>',
      '    </div>',
      '  </div>',
      '</section>'
    ].join(""),
    computed: {
      stateTone: function stateTone() {
        if (this.workflow.workflow_state === "ready_to_install") {
          return "success";
        }
        if (this.workflow.workflow_state === "activation_required") {
          return "warning";
        }
        if (this.workflow.workflow_state === "standalone_only") {
          return "info";
        }
        return "danger";
      }
    },
    methods: {
      displayLabel: displayLabel
    }
  });

  Vue.component("sdlc-install-request", {
    props: ["request"],
    template: [
      '<section class="workspace-section request-panel">',
      '  <div class="section-heading">',
      '    <h2>安装申请</h2>',
      '    <sdlc-status-chip :label="request.request_state" :tone="stateTone"></sdlc-status-chip>',
      '  </div>',
      '  <dl class="facts">',
      '    <sdlc-metric-row label="队列" :value="request.queue" tone="info"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Owner" :value="request.owner_system" tone="neutral"></sdlc-metric-row>',
      '    <sdlc-metric-row label="动作" :value="request.requested_action_id" tone="neutral"></sdlc-metric-row>',
      '    <sdlc-metric-row label="审计" :value="request.audit_id" tone="warning"></sdlc-metric-row>',
      '  </dl>',
      '  <div class="request-panel__meta">',
      '    <span>{{ request.request_id }}</span>',
      '    <span>{{ request.agent_coordinate }}</span>',
      '  </div>',
      '  <div class="command-preview" v-if="request.command_preview">',
      '    <span>提交命令</span>',
      '    <code>{{ request.command_preview }}</code>',
      '  </div>',
      '  <ul class="request-panel__blockers" v-if="request.blockers && request.blockers.length">',
      '    <li v-for="(blocker, blockerIndex) in request.blockers" :key="blocker + \'-\' + blockerIndex">{{ blocker }}</li>',
      '  </ul>',
      '  <div class="request-panel__footer">',
      '    <span>下一步</span>',
      '    <sdlc-action-button :action="request.next_action" kind="primary" @invoke="$emit(\'invoke-action\', $event)"></sdlc-action-button>',
      '  </div>',
      '</section>'
    ].join(""),
    computed: {
      stateTone: function stateTone() {
        if (this.request.request_state === "accepted" || this.request.request_state === "standalone_ready") {
          return "success";
        }
        if (
          this.request.request_state === "pending_enterprise_activation"
          || this.request.request_state === "pending_catalog_review"
        ) {
          return "warning";
        }
        return "danger";
      }
    }
  });

  Vue.component("sdlc-bootstrap-handoff", {
    props: ["handoff"],
    template: [
      '<section class="workspace-section handoff-panel">',
      '  <div class="section-heading">',
      '    <h2>Bootstrap Handoff</h2>',
      '    <sdlc-status-chip :label="handoff.handoff_state" :tone="stateTone"></sdlc-status-chip>',
      '  </div>',
      '  <dl class="facts">',
      '    <sdlc-metric-row label="请求" :value="handoff.request_id" tone="neutral"></sdlc-metric-row>',
      '    <sdlc-metric-row label="审计" :value="handoff.audit_id" tone="warning"></sdlc-metric-row>',
      '    <sdlc-metric-row label="设备" :value="handoff.device_os" tone="info"></sdlc-metric-row>',
      '    <sdlc-metric-row label="安装" :value="handoff.installation_id" :tone="installationTone"></sdlc-metric-row>',
      '  </dl>',
      '  <div class="handoff-panel__meta">',
      '    <span>{{ handoff.idempotency_key }}</span>',
      '    <span v-if="handoff.device_public_key_thumbprint">{{ handoff.device_public_key_thumbprint }}</span>',
      '  </div>',
      '  <div class="request-panel__footer">',
      '    <span>Handoff</span>',
      '    <sdlc-action-button :action="handoff.next_action" kind="primary" @invoke="$emit(\'invoke-action\', $event)"></sdlc-action-button>',
      '  </div>',
      '</section>'
    ].join(""),
    computed: {
      stateTone: function stateTone() {
        if (
          this.handoff.handoff_state === "ready_to_create"
          || this.handoff.handoff_state === "installation_created"
        ) {
          return "success";
        }
        if (this.handoff.handoff_state.indexOf("waiting_for_") === 0) {
          return "warning";
        }
        return "danger";
      },
      installationTone: function installationTone() {
        if (this.handoff.installation_id && this.handoff.installation_id.indexOf("pending") === 0) {
          return "warning";
        }
        if (this.handoff.installation_id && this.handoff.installation_id.indexOf("inst-") === 0) {
          return "success";
        }
        return "neutral";
      }
    }
  });

  Vue.component("sdlc-assertion-handoff", {
    props: ["assertion"],
    template: [
      '<section class="workspace-section assertion-panel">',
      '  <div class="section-heading">',
      '    <h2>Assertion Handoff</h2>',
      '    <sdlc-status-chip :label="assertion.assertion_state" :tone="stateTone"></sdlc-status-chip>',
      '  </div>',
      '  <dl class="facts">',
      '    <sdlc-metric-row label="安装" :value="assertion.installation_id" tone="neutral"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Audience" :value="assertion.audience" tone="info"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Replay" :value="assertion.replay_window_seconds" tone="warning"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Hash" :value="assertion.assertion_hash" :tone="hashTone"></sdlc-metric-row>',
      '  </dl>',
      '  <div class="handoff-panel__meta">',
      '    <span>{{ assertion.idempotency_key }}</span>',
      '    <span>{{ assertion.nonce }}</span>',
      '  </div>',
      '  <div class="request-panel__footer">',
      '    <span>Assertion</span>',
      '    <sdlc-action-button :action="assertion.next_action" kind="primary" @invoke="$emit(\'invoke-action\', $event)"></sdlc-action-button>',
      '  </div>',
      '</section>'
    ].join(""),
    computed: {
      stateTone: function stateTone() {
        if (
          this.assertion.assertion_state === "ready_to_issue"
          || this.assertion.assertion_state === "issued"
        ) {
          return "success";
        }
        if (this.assertion.assertion_state.indexOf("waiting_for_") === 0) {
          return "warning";
        }
        return "danger";
      },
      hashTone: function hashTone() {
        if (this.assertion.assertion_hash && this.assertion.assertion_hash.indexOf("pending") === 0) {
          return "warning";
        }
        if (this.assertion.assertion_hash && this.assertion.assertion_hash !== "not-issued") {
          return "success";
        }
        return "neutral";
      }
    }
  });

  Vue.component("sdlc-bootstrap-timeline", {
    props: ["timeline"],
    template: [
      '<ol class="bootstrap-timeline" aria-label="bootstrap timeline">',
      '  <li v-for="step in timeline" :key="step.step_id" :class="\'bootstrap-timeline__item--\' + step.status">',
      '    <span class="bootstrap-timeline__status">{{ displayLabel(step.status) }}</span>',
      '    <span class="bootstrap-timeline__label">{{ step.label }}</span>',
      '    <span class="bootstrap-timeline__owner">{{ displayLabel(step.owner_system) }}</span>',
      '  </li>',
      '</ol>'
    ].join(""),
    methods: {
      displayLabel: displayLabel
    }
  });

  Vue.component("sdlc-source-facts", {
    props: ["status"],
    template: [
      '<div class="source-facts">',
      '  <dl class="facts">',
      '    <sdlc-metric-row label="事实源" :value="status.source_of_truth" tone="info"></sdlc-metric-row>',
      '    <sdlc-metric-row label="裁决" :value="status.conflict_resolution" tone="warning"></sdlc-metric-row>',
      '    <sdlc-metric-row label="可忽略" :value="status.can_ignore ? \'yes\' : \'no\'" :tone="status.can_ignore ? \'warning\' : \'danger\'"></sdlc-metric-row>',
      '  </dl>',
      '  <ul class="tag-list source-facts__evidence"><li v-for="item in status.entry_evidence" :key="item">{{ item }}</li></ul>',
      '  <div v-if="status.source_conflicts && status.source_conflicts.length" class="source-conflicts">',
      '    <div v-for="conflict in status.source_conflicts" :key="conflict.source_of_truth + conflict.state" class="source-conflicts__row">',
      '      <span>{{ conflict.source_of_truth }}</span><strong>{{ conflict.state }}</strong>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join("")
  });

  Vue.component("sdlc-recommendation-decision", {
    props: ["decision"],
    template: [
      '<section class="workspace-section decision-panel">',
      '  <div class="section-heading">',
      '    <h2>推荐决策</h2>',
      '    <sdlc-status-chip :label="decision.recommendation_state" :tone="stateTone"></sdlc-status-chip>',
      '  </div>',
      '  <p class="decision-panel__verdict">{{ decision.verdict }}</p>',
      '  <dl class="facts">',
      '    <sdlc-metric-row label="事实源" :value="sourceTruthSummary" tone="info"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Trace" :value="decision.trace_id" tone="neutral"></sdlc-metric-row>',
      '    <sdlc-metric-row label="审计" :value="decision.audit_id" tone="warning"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Actual L5" :value="decision.actual_l5_display_allowed ? \'allowed\' : \'blocked\'" :tone="decision.actual_l5_display_allowed ? \'success\' : \'warning\'"></sdlc-metric-row>',
      '    <sdlc-metric-row v-if="decision.diagnostic_ref" label="诊断" :value="decision.diagnostic_ref" tone="neutral"></sdlc-metric-row>',
      '  </dl>',
      '  <div class="decision-grid">',
      '    <div>',
      '      <span>为什么选</span>',
      '      <ul><li v-for="item in decision.why_recommended" :key="item">{{ item }}</li></ul>',
      '    </div>',
      '    <div>',
      '      <span>需要确认</span>',
      '      <ul><li v-for="item in decision.requirements" :key="item">{{ item }}</li></ul>',
      '    </div>',
      '    <div>',
      '      <span>完成后</span>',
      '      <ul><li v-for="item in decision.outcomes" :key="item">{{ item }}</li></ul>',
      '    </div>',
      '  </div>',
      '  <ul class="request-panel__blockers" v-if="allBlockers.length">',
      '    <li v-for="item in allBlockers" :key="item">{{ displayLabel(item) }}</li>',
      '  </ul>',
      '  <div class="request-panel__footer">',
      '    <span>下一步</span>',
      '    <sdlc-action-button :action="decision.next_best_action" kind="primary" @invoke="$emit(\'invoke-action\', $event)"></sdlc-action-button>',
      '  </div>',
      '</section>'
    ].join(""),
    computed: {
      stateTone: function stateTone() {
        if (this.decision.recommendation_state === "recommended") {
          return "success";
        }
        if (
          this.decision.recommendation_state === "needs_activation"
          || this.decision.recommendation_state === "eligible_pending_verification"
        ) {
          return "warning";
        }
        if (this.decision.recommendation_state === "blocked") {
          return "danger";
        }
        return "info";
      },
      allBlockers: function allBlockers() {
        return Array.from(new Set([]
          .concat(this.decision.why_not || [])
          .concat(this.decision.missing_evidence || [])
          .concat((this.decision.trust_blockers || []).map(formatTrustBlocker))));
      },
      sourceTruthSummary: function sourceTruthSummary() {
        return formatSourceOfTruth(this.decision.source_of_truth);
      }
    },
    methods: {
      displayLabel: displayLabel
    }
  });

  Vue.component("sdlc-runtime-availability", {
    props: ["summary"],
    template: [
      '<section class="workspace-section runtime-panel">',
      '  <div class="section-heading">',
      '    <h2>Runtime 可用性</h2>',
      '    <sdlc-status-chip :label="summary.availability_state" :tone="stateTone"></sdlc-status-chip>',
      '  </div>',
      '  <p class="summary">{{ summary.reason }}</p>',
      '  <dl class="facts">',
      '    <sdlc-metric-row label="展示" :value="summary.display_name_zh" :tone="stateTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="要求版本" :value="summary.required_runtime_contract_version || \'missing\'" tone="neutral"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Runtime 版本" :value="summary.runtime_contract_version || \'missing\'" :tone="runtimeVersionTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="缺失能力" :value="missingCountLabel" :tone="missingCapabilities.length ? \'danger\' : \'success\'"></sdlc-metric-row>',
      '    <sdlc-metric-row label="事实源" :value="sourceTruthSummary" tone="info"></sdlc-metric-row>',
      '    <sdlc-metric-row label="审计" :value="summary.audit_id || \'missing\'" tone="warning"></sdlc-metric-row>',
      '  </dl>',
      '  <ul class="tag-list runtime-panel__capabilities" v-if="missingCapabilities.length">',
      '    <li v-for="capability in missingCapabilities" :key="capability">{{ capability }}</li>',
      '  </ul>',
      '  <ul class="request-panel__blockers" v-if="issues.length">',
      '    <li v-for="issue in issues" :key="issue.issue_id">{{ issue.issue_id }} / {{ issue.fix_action_id }}</li>',
      '  </ul>',
      '  <div class="request-panel__footer">',
      '    <span>{{ runtimeFactLabel }}</span>',
      '    <sdlc-action-button :action="summary.next_action" kind="primary" @invoke="$emit(\'invoke-action\', $event)"></sdlc-action-button>',
      '  </div>',
      '</section>'
    ].join(""),
    computed: {
      stateTone: function stateTone() {
        if (this.summary.availability_state === "runtime_ready") {
          return "success";
        }
        if (this.summary.availability_state === "runtime_upgrade_required") {
          return "warning";
        }
        if (this.summary.availability_state === "runtime_missing") {
          return "danger";
        }
        if (this.summary.availability_state === "runtime_capability_missing") {
          return "danger";
        }
        return "warning";
      },
      runtimeVersionTone: function runtimeVersionTone() {
        if (this.summary.availability_state === "runtime_upgrade_required") {
          return "danger";
        }
        if (this.summary.runtime_contract_version) {
          return "success";
        }
        return "warning";
      },
      missingCapabilities: function missingCapabilities() {
        return Array.isArray(this.summary.missing_runtime_capabilities)
          ? this.summary.missing_runtime_capabilities
          : [];
      },
      missingCountLabel: function missingCountLabel() {
        return this.missingCapabilities.length
          ? this.missingCapabilities.length + " 项"
          : "0 项";
      },
      issues: function issues() {
        return Array.isArray(this.summary.issues) ? this.summary.issues : [];
      },
      sourceTruthSummary: function sourceTruthSummary() {
        return formatSourceOfTruth(this.summary.source_of_truth);
      },
      runtimeFactLabel: function runtimeFactLabel() {
        var facts = this.summary.runtime_facts || {};
        return [
          facts.runtime_id || "runtime-not-detected",
          facts.availability_echo_state || "missing"
        ].join(" / ");
      }
    }
  });

  Vue.component("sdlc-health-summary-freshness", {
    props: ["summary"],
    template: [
      '<section class="workspace-section health-panel">',
      '  <div class="section-heading">',
      '    <h2>HealthSummary 新鲜度</h2>',
      '    <sdlc-status-chip :label="summary.freshness_state" :tone="stateTone"></sdlc-status-chip>',
      '  </div>',
      '  <p class="summary">{{ summary.reason }}</p>',
      '  <dl class="facts">',
      '    <sdlc-metric-row label="展示" :value="summary.display_name_zh" :tone="stateTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="健康" :value="summary.health_state || \'unknown\'" :tone="healthTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="有效期" :value="summary.valid_until || \'missing\'" :tone="validUntilTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="信号" :value="signalCountLabel" tone="info"></sdlc-metric-row>',
      '    <sdlc-metric-row label="推荐依据" :value="summary.recommendation_basis_allowed ? \'allowed\' : \'blocked\'" :tone="summary.recommendation_basis_allowed ? \'success\' : \'warning\'"></sdlc-metric-row>',
      '    <sdlc-metric-row label="事实源" :value="sourceTruthSummary" tone="info"></sdlc-metric-row>',
      '    <sdlc-metric-row label="审计" :value="summary.audit_id || \'missing\'" tone="warning"></sdlc-metric-row>',
      '  </dl>',
      '  <ul class="request-panel__blockers" v-if="issues.length">',
      '    <li v-for="issue in issues" :key="issue.issue_id">{{ issue.issue_id }} / {{ issue.fix_action_id }}</li>',
      '  </ul>',
      '  <div class="request-panel__footer">',
      '    <span>{{ healthFactLabel }}</span>',
      '    <sdlc-action-button :action="summary.next_action" kind="primary" @invoke="$emit(\'invoke-action\', $event)"></sdlc-action-button>',
      '  </div>',
      '</section>'
    ].join(""),
    computed: {
      stateTone: function stateTone() {
        if (this.summary.freshness_state === "health_fresh") {
          return "success";
        }
        if (
          this.summary.freshness_state === "health_refresh_required"
          || this.summary.freshness_state === "health_attention_required"
        ) {
          return "warning";
        }
        return "danger";
      },
      healthTone: function healthTone() {
        if (this.summary.health_state === "healthy") {
          return "success";
        }
        if (
          this.summary.health_state === "degraded"
          || this.summary.health_state === "unknown"
        ) {
          return "warning";
        }
        return "danger";
      },
      validUntilTone: function validUntilTone() {
        if (this.summary.freshness_state === "health_fresh") {
          return "success";
        }
        if (this.summary.valid_until) {
          return "warning";
        }
        return "danger";
      },
      signalCountLabel: function signalCountLabel() {
        return String(this.summary.signal_count || 0);
      },
      issues: function issues() {
        return Array.isArray(this.summary.issues) ? this.summary.issues : [];
      },
      sourceTruthSummary: function sourceTruthSummary() {
        return formatSourceOfTruth(this.summary.source_of_truth);
      },
      healthFactLabel: function healthFactLabel() {
        var facts = this.summary.health_facts || {};
        return [
          facts.evidence_summary_id || "evidence-summary-missing",
          facts.agentops_trace_id || "trace-missing"
        ].join(" / ");
      }
    }
  });

  Vue.component("sdlc-installation-distribution", {
    props: ["summary"],
    template: [
      '<section class="workspace-section installation-distribution">',
      '  <div class="section-heading">',
      '    <h2>安装分布</h2>',
      '    <sdlc-status-chip :label="summary.distribution_state" :tone="stateTone"></sdlc-status-chip>',
      '  </div>',
      '  <p class="summary">{{ distributionCopy }}</p>',
      '  <dl class="facts">',
      '    <sdlc-metric-row label="合同" :value="summary.contract_schema_version" tone="info"></sdlc-metric-row>',
      '    <sdlc-metric-row label="权限" :value="summary.permission_state" :tone="permissionTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="总安装" :value="summary.total_installations" :tone="countTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="活跃中" :value="summary.active_installations" tone="success"></sdlc-metric-row>',
      '    <sdlc-metric-row label="失败" :value="summary.failed_installations" :tone="summary.failed_installations > 0 ? \'danger\' : \'success\'"></sdlc-metric-row>',
      '    <sdlc-metric-row label="撤销" :value="summary.revoked_installations" :tone="summary.revoked_installations > 0 ? \'warning\' : \'success\'"></sdlc-metric-row>',
      '    <sdlc-metric-row label="通知影响" :value="notificationLabel" :tone="notificationTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="事实源" :value="sourceTruthSummary" tone="info"></sdlc-metric-row>',
      '  </dl>',
      '  <div class="installation-distribution__groups">',
      '    <div>',
      '      <span>状态</span>',
      '      <ul><li v-for="item in statusEntries" :key="item.key">{{ displayLabel(item.key) }} · {{ item.value }}</li></ul>',
      '    </div>',
      '    <div>',
      '      <span>OS</span>',
      '      <ul><li v-for="item in osEntries" :key="item.key">{{ displayLabel(item.key) }} · {{ item.value }}</li></ul>',
      '    </div>',
      '    <div>',
      '      <span>版本</span>',
      '      <ul><li v-for="item in versionEntries" :key="item.key">{{ item.key }} · {{ item.value }}</li></ul>',
      '    </div>',
      '    <div>',
      '      <span>企业状态</span>',
      '      <ul><li v-for="item in enterpriseEntries" :key="item.key">{{ displayLabel(item.key) }} · {{ item.value }}</li></ul>',
      '    </div>',
      '  </div>',
      '  <ul class="request-panel__blockers" v-if="issues.length">',
      '    <li v-for="issue in issues" :key="issue.issue_id">{{ displayLabel(issue.issue_id) }} / {{ displayLabel(issue.fix_action_id) }}</li>',
      '  </ul>',
      '  <div class="request-panel__footer">',
      '    <span>{{ privacyLabel }}</span>',
      '    <sdlc-action-button :action="summary.next_action" kind="primary" @invoke="$emit(\'invoke-action\', $event)"></sdlc-action-button>',
      '  </div>',
      '</section>'
    ].join(""),
    computed: {
      stateTone: function stateTone() {
        if (this.summary.distribution_state === "distribution_ready") {
          return "success";
        }
        if (this.summary.distribution_state === "empty_distribution") {
          return "warning";
        }
        return "danger";
      },
      permissionTone: function permissionTone() {
        return this.summary.permission_state === "allowed" ? "success" : "warning";
      },
      countTone: function countTone() {
        if (this.summary.distribution_state === "distribution_ready") {
          return "success";
        }
        if (this.summary.distribution_state === "empty_distribution") {
          return "warning";
        }
        return "danger";
      },
      notification: function notification() {
        return this.summary.notification || {};
      },
      notificationTone: function notificationTone() {
        return this.notification.notification_required ? "warning" : "success";
      },
      notificationLabel: function notificationLabel() {
        return [
          displayLabel(this.notification.reason_code),
          (this.notification.affected_installation_count || 0) + " affected"
        ].join(" / ");
      },
      issues: function issues() {
        return Array.isArray(this.summary.issues) ? this.summary.issues : [];
      },
      privacy: function privacy() {
        return this.summary.privacy || {};
      },
      privacyLabel: function privacyLabel() {
        return [
          "aggregation_only: " + displayLabel(this.privacy.aggregation_only),
          "individual_users_exposed: " + displayLabel(this.privacy.individual_users_exposed),
          "device_ids_exposed: " + displayLabel(this.privacy.device_ids_exposed)
        ].join(" / ");
      },
      statusEntries: function statusEntries() {
        return this.countEntries(this.summary.status_counts);
      },
      osEntries: function osEntries() {
        return this.countEntries(this.summary.os_counts);
      },
      versionEntries: function versionEntries() {
        return this.countEntries(this.summary.version_counts);
      },
      enterpriseEntries: function enterpriseEntries() {
        return this.countEntries(this.summary.enterprise_state_counts);
      },
      distributionCopy: function distributionCopy() {
        if (this.summary.permission_state === "permission_required") {
          return "Viewer 未获准查看安装分布，Store 不展示聚合计数或任何安装明细。";
        }
        if (this.summary.distribution_state === "distribution_unavailable") {
          return "Store 缺少 installation inventory，当前状态不能被解释为 0 安装。";
        }
        if (this.summary.distribution_state === "empty_distribution") {
          return "当前 Agent 或版本范围没有可匹配的安装聚合，需由 Owner 复核 scope。";
        }
        return "安装分布来自 Store-owned inventory 聚合；Store 不展示 user、device_id 或 installation_id 明细。";
      },
      sourceTruthSummary: function sourceTruthSummary() {
        return formatSourceOfTruth(this.summary.source_of_truth);
      }
    },
    methods: {
      countEntries: function countEntries(counts) {
        if (!counts || typeof counts !== "object") {
          return [];
        }
        return Object.keys(counts).map(function mapCount(key) {
          return { key: key, value: counts[key] };
        });
      },
      displayLabel: displayLabel
    }
  });

  Vue.component("sdlc-feedback-owner-response-loop", {
    props: ["loop"],
    template: [
      '<section class="workspace-section feedback-loop">',
      '  <div class="section-heading">',
      '    <h2>反馈闭环</h2>',
      '    <sdlc-status-chip :label="loop.feedback_state" :tone="stateTone"></sdlc-status-chip>',
      '  </div>',
      '  <p class="summary">{{ loopCopy }}</p>',
      '  <dl class="facts">',
      '    <sdlc-metric-row label="合同" :value="loop.contract_schema_version" tone="info"></sdlc-metric-row>',
      '    <sdlc-metric-row label="状态" :value="loop.feedback_state" :tone="stateTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="上一步" :value="loop.previous_state" tone="neutral"></sdlc-metric-row>',
      '    <sdlc-metric-row label="动作" :value="loop.transition_action" :tone="stateTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="反馈" :value="feedbackLabel" tone="warning"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Owner" :value="ownerLabel" :tone="ownerTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="发布" :value="releaseLabel" :tone="releaseTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="事实源" :value="sourceTruthSummary" tone="info"></sdlc-metric-row>',
      '  </dl>',
      '  <div class="feedback-loop__response">',
      '    <div>',
      '      <span>Owner Response</span>',
      '      <strong>{{ ownerResponse.message || "owner response missing" }}</strong>',
      '      <small>{{ displayLabel(ownerResponse.commitment) }} / {{ displayLabel(ownerResponse.actor_role) }}</small>',
      '    </div>',
      '    <div>',
      '      <span>Release Linkage</span>',
      '      <strong>{{ releaseLinkage.release_ref || "release_ref missing" }}</strong>',
      '      <small>{{ releaseLinkage.release_version || "version missing" }} / {{ releaseLinkage.released_at || "released_at missing" }}</small>',
      '    </div>',
      '  </div>',
      '  <ol class="feedback-loop__timeline" v-if="timeline.length">',
      '    <li v-for="event in timeline" :key="event.event_id">',
      '      <strong>{{ displayLabel(event.result_state) }}</strong>',
      '      <span>{{ displayLabel(event.transition_action) }} · {{ displayLabel(event.actor_role) }}</span>',
      '      <small>{{ event.audit_id }} / {{ event.trace_id }}</small>',
      '    </li>',
      '  </ol>',
      '  <ul class="request-panel__blockers" v-if="issues.length">',
      '    <li v-for="issue in issues" :key="issue.issue_id">{{ displayLabel(issue.issue_id) }} / {{ displayLabel(issue.fix_action_id) }}</li>',
      '  </ul>',
      '  <div class="request-panel__footer">',
      '    <span>{{ boundaryLabel }}</span>',
      '    <sdlc-action-button :action="loop.next_action" kind="primary" @invoke="$emit(\'invoke-action\', $event)"></sdlc-action-button>',
      '  </div>',
      '</section>'
    ].join(""),
    computed: {
      feedback: function feedback() {
        return this.loop.feedback || {};
      },
      ownerResponse: function ownerResponse() {
        return this.loop.owner_response || {};
      },
      releaseLinkage: function releaseLinkage() {
        return this.loop.release_linkage || {};
      },
      timeline: function timeline() {
        return Array.isArray(this.loop.timeline) ? this.loop.timeline : [];
      },
      issues: function issues() {
        return Array.isArray(this.loop.issues) ? this.loop.issues : [];
      },
      stateTone: function stateTone() {
        if (this.issues.length) {
          return "danger";
        }
        if (["released", "fixed"].indexOf(this.loop.feedback_state) >= 0) {
          return "success";
        }
        if (["owner_replied", "planned", "triaged"].indexOf(this.loop.feedback_state) >= 0) {
          return "warning";
        }
        return "neutral";
      },
      ownerTone: function ownerTone() {
        if (this.ownerResponse.owner_response_required && this.ownerResponse.actor_role !== "owner") {
          return "danger";
        }
        return this.ownerResponse.actor_role === "owner" ? "success" : "warning";
      },
      releaseTone: function releaseTone() {
        if (this.releaseLinkage.release_required && this.releaseLinkage.release_ref) {
          return "success";
        }
        return this.releaseLinkage.release_required ? "danger" : "neutral";
      },
      feedbackLabel: function feedbackLabel() {
        return [
          this.feedback.feedback_id || "feedback-missing",
          displayLabel(this.feedback.feedback_type),
          displayLabel(this.feedback.severity)
        ].join(" / ");
      },
      ownerLabel: function ownerLabel() {
        return [
          this.ownerResponse.actor_id || "actor-missing",
          displayLabel(this.ownerResponse.actor_role)
        ].join(" / ");
      },
      releaseLabel: function releaseLabel() {
        return [
          this.releaseLinkage.release_ref || "release_ref missing",
          this.releaseLinkage.release_version || "version missing"
        ].join(" / ");
      },
      loopCopy: function loopCopy() {
        if (this.issues.length) {
          return "反馈生命周期存在阻断项；非 Owner 不能代替 Owner 关闭反馈，released 必须绑定 release_ref。";
        }
        if (this.loop.feedback_state === "released") {
          return "反馈已发布并绑定 release linkage；Store 只展示链接，不生成 release notes 或修改 AgentVersion。";
        }
        if (this.loop.feedback_state === "owner_replied") {
          return "Owner 回复已进入可审计 timeline；下一步只能计划或拒绝，不能跳过生命周期。";
        }
        return "反馈闭环来自 Agent Store lifecycle projection；本阶段不是评论系统、排行或商业化 marketplace。";
      },
      boundaryLabel: function boundaryLabel() {
        return "No comments / no ranking / no marketplace / no real notification send";
      },
      sourceTruthSummary: function sourceTruthSummary() {
        return formatSourceOfTruth(this.loop.source_of_truth);
      }
    },
    methods: {
      displayLabel: displayLabel
    }
  });

  Vue.component("sdlc-lifecycle-governance", {
    props: ["summary"],
    template: [
      '<section class="workspace-section lifecycle-governance">',
      '  <div class="section-heading">',
      '    <h2>生命周期治理</h2>',
      '    <sdlc-status-chip :label="summary.lifecycle_state" :tone="stateTone"></sdlc-status-chip>',
      '  </div>',
      '  <p class="summary">{{ governanceCopy }}</p>',
      '  <dl class="facts">',
      '    <sdlc-metric-row label="合同" :value="summary.contract_schema_version" tone="info"></sdlc-metric-row>',
      '    <sdlc-metric-row label="状态" :value="summary.lifecycle_state" :tone="stateTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="上一步" :value="summary.previous_state" tone="neutral"></sdlc-metric-row>',
      '    <sdlc-metric-row label="动作" :value="summary.transition_action" :tone="stateTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Actor" :value="actorLabel" :tone="actorTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="版本" :value="versionLabel" tone="warning"></sdlc-metric-row>',
      '    <sdlc-metric-row label="影响范围" :value="impactLabel" :tone="impactTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="事实源" :value="sourceTruthSummary" tone="info"></sdlc-metric-row>',
      '  </dl>',
      '  <div class="lifecycle-governance__mapping">',
      '    <div>',
      '      <span>Replacement</span>',
      '      <strong>{{ replacement.replacement_version || "replacement missing" }}</strong>',
      '      <small>{{ displayLabel(replacement.required) }} / {{ replacement.replacement_reason || "reason missing" }}</small>',
      '    </div>',
      '    <div>',
      '      <span>Rollback</span>',
      '      <strong>{{ rollback.rollback_version || "rollback missing" }}</strong>',
      '      <small>{{ displayLabel(rollback.required) }} / {{ rollback.rollback_reason || "reason missing" }}</small>',
      '    </div>',
      '    <div>',
      '      <span>Impact</span>',
      '      <strong>{{ impact.affected_installation_count || 0 }} installations</strong>',
      '      <small>{{ impact.affected_user_count || 0 }} users / replacement_available: {{ displayLabel(impact.replacement_available) }}</small>',
      '    </div>',
      '  </div>',
      '  <ul class="request-panel__blockers" v-if="issues.length">',
      '    <li v-for="issue in issues" :key="issue.issue_id">{{ displayLabel(issue.issue_id) }} / {{ displayLabel(issue.fix_action_id) }}</li>',
      '  </ul>',
      '  <div class="request-panel__footer">',
      '    <span>{{ boundaryLabel }}</span>',
      '    <sdlc-action-button :action="summary.next_action" kind="primary" @invoke="$emit(\'invoke-action\', $event)"></sdlc-action-button>',
      '  </div>',
      '</section>'
    ].join(""),
    computed: {
      actor: function actor() {
        return this.summary.actor || {};
      },
      versionScope: function versionScope() {
        return this.summary.version_scope || {};
      },
      replacement: function replacement() {
        return this.summary.replacement || {};
      },
      rollback: function rollback() {
        return this.summary.rollback || {};
      },
      impact: function impact() {
        return this.summary.impact_scope || {};
      },
      issues: function issues() {
        return Array.isArray(this.summary.issues) ? this.summary.issues : [];
      },
      stateTone: function stateTone() {
        if (this.issues.length || this.summary.lifecycle_state === "security_revoked") {
          return "danger";
        }
        if (this.summary.lifecycle_state === "disabled" || this.summary.lifecycle_state === "deprecated") {
          return "warning";
        }
        if (this.summary.lifecycle_state === "upgrade_available" || this.summary.lifecycle_state === "rollback_available") {
          return "info";
        }
        return "success";
      },
      actorTone: function actorTone() {
        if (this.summary.transition_action === "security_revoke") {
          return this.actor.actor_role === "security" ? "success" : "danger";
        }
        if (["upgrade", "rollback", "deprecate", "disable"].indexOf(this.summary.transition_action) >= 0) {
          return this.actor.actor_role === "owner" ? "success" : "danger";
        }
        return "warning";
      },
      impactTone: function impactTone() {
        if (this.impact.impact_required && this.impact.affected_installation_count === undefined) {
          return "danger";
        }
        return this.impact.notification_required ? "warning" : "neutral";
      },
      actorLabel: function actorLabel() {
        return [
          this.actor.actor_id || "actor-missing",
          displayLabel(this.actor.actor_role)
        ].join(" / ");
      },
      versionLabel: function versionLabel() {
        return [
          this.versionScope.agent_id || this.summary.agent_id,
          this.versionScope.version || this.summary.current_version,
          displayLabel(this.versionScope.release_status)
        ].join(" / ");
      },
      impactLabel: function impactLabel() {
        return [
          (this.impact.affected_installation_count || 0) + " installs",
          (this.impact.affected_user_count || 0) + " users"
        ].join(" / ");
      },
      governanceCopy: function governanceCopy() {
        if (this.issues.length) {
          return "生命周期治理存在阻断项；security_revoked 是终态，不能被普通 Owner 降级为较弱状态。";
        }
        if (this.summary.lifecycle_state === "security_revoked") {
          return "安全撤销是终态；Store 只展示安全证据和影响范围，不执行 Runtime 操作。";
        }
        if (this.summary.lifecycle_state === "upgrade_available" || this.summary.lifecycle_state === "rollback_available") {
          return "替代版本或回退版本已可通知；Store 展示映射，不执行真实升级或回退。";
        }
        return "生命周期治理来自 Agent Store projection；本阶段不修改 AgentVersion、不签发 Grant、不覆盖 AgentOps PolicyDecision。";
      },
      boundaryLabel: function boundaryLabel() {
        return "No AgentVersion mutation / no Runtime execution / no CapabilityGrant / no AgentOps policy override";
      },
      sourceTruthSummary: function sourceTruthSummary() {
        return formatSourceOfTruth(this.summary.source_of_truth);
      }
    },
    methods: {
      displayLabel: displayLabel
    }
  });

  Vue.component("sdlc-quality-evidence-access", {
    props: ["summary"],
    template: [
      '<section class="workspace-section quality-evidence">',
      '  <div class="section-heading">',
      '    <h2>质量证据访问</h2>',
      '    <sdlc-status-chip :label="summary.summary_state" :tone="stateTone"></sdlc-status-chip>',
      '  </div>',
      '  <p class="summary">{{ displayCopy }}</p>',
      '  <dl class="facts">',
      '    <sdlc-metric-row label="合同" :value="summary.contract_schema_version" tone="info"></sdlc-metric-row>',
      '    <sdlc-metric-row label="展示" :value="display.display_label || summary.summary_state" :tone="stateTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="权限" :value="summary.permission_state" :tone="permissionTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="证据等级" :value="display.evidence_level || \'unavailable\'" :tone="display.redacted ? \'warning\' : stateTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="有效期" :value="display.valid_until || \'missing\'" :tone="validUntilTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="推荐依据" :value="summary.recommendation_basis_allowed ? \'allowed\' : \'blocked\'" :tone="summary.recommendation_basis_allowed ? \'success\' : \'warning\'"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Raw Trace" :value="summary.raw_trace_exposed ? \'exposed\' : \'stripped\'" :tone="summary.raw_trace_exposed ? \'danger\' : \'success\'"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Raw Evidence" :value="summary.raw_evidence_exposed ? \'exposed\' : \'stripped\'" :tone="summary.raw_evidence_exposed ? \'danger\' : \'success\'"></sdlc-metric-row>',
      '    <sdlc-metric-row label="事实源" :value="sourceTruthSummary" tone="info"></sdlc-metric-row>',
      '    <sdlc-metric-row label="审计" :value="summary.audit_id || \'missing\'" tone="warning"></sdlc-metric-row>',
      '  </dl>',
      '  <div class="quality-evidence__signals">',
      '    <div>',
      '      <span>AgentOps</span>',
      '      <strong>{{ confidenceLabel }}</strong>',
      '      <small>{{ display.score_template_id || "score_template_id missing" }}</small>',
      '    </div>',
      '    <div>',
      '      <span>Run Binding</span>',
      '      <strong>{{ runBinding.evidence_summary_id || "evidence-summary-missing" }}</strong>',
      '      <small>{{ runBinding.run_id || "run-missing" }} / {{ runBinding.source_event_count || 0 }} events</small>',
      '    </div>',
      '    <div>',
      '      <span>Evidence Vault</span>',
      '      <strong>{{ accessLabel }}</strong>',
      '      <small>raw_trace_url: {{ access.raw_trace_url === "" ? "stripped" : access.raw_trace_url }} / raw_evidence_url: {{ access.raw_evidence_url === "" ? "stripped" : access.raw_evidence_url }}</small>',
      '    </div>',
      '  </div>',
      '  <ul class="tag-list quality-evidence__missing" v-if="missingEvidence.length">',
      '    <li v-for="item in missingEvidence" :key="item">{{ item }}</li>',
      '  </ul>',
      '  <ul class="request-panel__blockers" v-if="issues.length">',
      '    <li v-for="issue in issues" :key="issue.issue_id">{{ displayLabel(issue.issue_id) }} / {{ displayLabel(issue.fix_action_id) }}</li>',
      '  </ul>',
      '  <div class="request-panel__footer">',
      '    <span>{{ rawBoundary }}</span>',
      '    <sdlc-action-button :action="summary.next_action" kind="primary" @invoke="$emit(\'invoke-action\', $event)"></sdlc-action-button>',
      '  </div>',
      '</section>'
    ].join(""),
    computed: {
      display: function display() {
        return this.summary.display || {};
      },
      runBinding: function runBinding() {
        return this.summary.run_binding || {};
      },
      access: function access() {
        return this.summary.access || {};
      },
      stateTone: function stateTone() {
        if (this.summary.summary_state === "summary_ready") {
          return "success";
        }
        if (
          this.summary.summary_state === "summary_expired"
          || this.summary.summary_state === "template_deprecated"
          || this.summary.summary_state === "summary_redacted"
        ) {
          return "warning";
        }
        return "danger";
      },
      permissionTone: function permissionTone() {
        return this.summary.permission_state === "allowed" ? "success" : "warning";
      },
      validUntilTone: function validUntilTone() {
        if (this.summary.summary_state === "summary_ready") {
          return "success";
        }
        if (this.display.valid_until) {
          return "warning";
        }
        return "danger";
      },
      missingEvidence: function missingEvidence() {
        return Array.isArray(this.display.missing_evidence)
          ? this.display.missing_evidence
          : [];
      },
      issues: function issues() {
        return Array.isArray(this.summary.issues) ? this.summary.issues : [];
      },
      confidenceLabel: function confidenceLabel() {
        if (this.display.confidence === null || this.display.confidence === undefined) {
          return "redacted";
        }
        return Math.round(this.display.confidence * 100) + "% confidence";
      },
      accessLabel: function accessLabel() {
        if (this.access.can_view_raw_evidence) {
          return "raw evidence permitted";
        }
        return this.access.evidence_vault_request_required
          ? "request required"
          : "summary only";
      },
      rawBoundary: function rawBoundary() {
        return "Store 不展示 raw Trace 或 raw Evidence URL";
      },
      displayCopy: function displayCopy() {
        if (this.summary.summary_state === "summary_redacted") {
          return "Viewer 未获准查看质量证据细节，Store 只展示遮蔽摘要并路由到 Evidence Vault。";
        }
        if (this.summary.summary_state === "summary_expired") {
          return "AgentOps 质量摘要已过 valid_until，Store 只能展示待刷新状态。";
        }
        if (this.summary.summary_state === "template_deprecated") {
          return "score_template_id 已废弃，Store 可展示降级上下文但不能把它当作当前质量依据。";
        }
        if (this.summary.summary_state === "summary_ready") {
          return "AgentOps 质量摘要可展示；Store 仍不暴露 raw Trace/raw Evidence，也不本地计算质量。";
        }
        return "缺少 AgentOps 质量摘要，Store 只展示刷新路径和保守降级状态。";
      },
      sourceTruthSummary: function sourceTruthSummary() {
        return formatSourceOfTruth(this.summary.source_of_truth);
      }
    },
    methods: {
      displayLabel: displayLabel
    }
  });

  Vue.component("sdlc-store-ops-deep-link", {
    props: ["link"],
    template: [
      '<section class="workspace-section store-ops-deep-link">',
      '  <div class="section-heading">',
      '    <h2>Store -> Ops 深链</h2>',
      '    <sdlc-status-chip :label="link.link_state" :tone="stateTone"></sdlc-status-chip>',
      '  </div>',
      '  <p class="summary">{{ linkCopy }}</p>',
      '  <dl class="facts">',
      '    <sdlc-metric-row label="合同" :value="link.contract_schema_version" tone="info"></sdlc-metric-row>',
      '    <sdlc-metric-row label="状态" :value="link.link_state" :tone="stateTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="权限" :value="link.permission_state" :tone="permissionTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Run" :value="runLabel" :tone="bindingTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Health" :value="link.health_summary_id || \'missing\'" tone="warning"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Evidence" :value="link.evidence_summary_id || \'missing\'" tone="neutral"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Raw Trace" :value="link.raw_trace_exposed ? \'exposed\' : \'stripped\'" :tone="link.raw_trace_exposed ? \'danger\' : \'success\'"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Raw Evidence" :value="link.raw_evidence_exposed ? \'exposed\' : \'stripped\'" :tone="link.raw_evidence_exposed ? \'danger\' : \'success\'"></sdlc-metric-row>',
      '    <sdlc-metric-row label="事实源" :value="sourceTruthSummary" tone="info"></sdlc-metric-row>',
      '  </dl>',
      '  <div class="store-ops-deep-link__target">',
      '    <div>',
      '      <span>Target</span>',
      '      <strong>{{ target.href || "href disabled" }}</strong>',
      '      <small>{{ displayLabel(target.system) }} / {{ displayLabel(target.route) }}</small>',
      '    </div>',
      '    <div>',
      '      <span>Binding</span>',
      '      <strong>{{ targetParams.run_id || "run missing" }}</strong>',
      '      <small>{{ targetParams.session_id || "session missing" }} / {{ targetParams.return_path || link.return_path }}</small>',
      '    </div>',
      '    <div>',
      '      <span>Sanitization</span>',
      '      <strong>raw_trace_url: {{ target.raw_trace_url === "" ? "stripped" : target.raw_trace_url }}</strong>',
      '      <small>raw_evidence_url: {{ target.raw_evidence_url === "" ? "stripped" : target.raw_evidence_url }}</small>',
      '    </div>',
      '  </div>',
      '  <ul class="request-panel__blockers" v-if="issues.length">',
      '    <li v-for="issue in issues" :key="issue.issue_id">{{ displayLabel(issue.issue_id) }} / {{ displayLabel(issue.fix_action_id) }}</li>',
      '  </ul>',
      '  <div class="request-panel__footer">',
      '    <span>{{ boundaryLabel }}</span>',
      '    <sdlc-action-button :action="link.next_action" kind="primary" @invoke="$emit(\'invoke-action\', $event)"></sdlc-action-button>',
      '  </div>',
      '</section>'
    ].join(""),
    computed: {
      target: function target() {
        return this.link.target || {};
      },
      targetParams: function targetParams() {
        return this.target.params || {};
      },
      issues: function issues() {
        return Array.isArray(this.link.issues) ? this.link.issues : [];
      },
      stateTone: function stateTone() {
        if (this.link.link_state === "deep_link_ready") {
          return "success";
        }
        if (this.link.link_state === "link_sanitized" || this.link.link_state === "permission_required") {
          return "warning";
        }
        return "danger";
      },
      permissionTone: function permissionTone() {
        return this.link.permission_state === "allowed" ? "success" : "warning";
      },
      bindingTone: function bindingTone() {
        return this.link.run_id && this.link.session_id ? "success" : "danger";
      },
      runLabel: function runLabel() {
        return [
          this.link.run_id || "run missing",
          this.link.session_id || "session missing"
        ].join(" / ");
      },
      linkCopy: function linkCopy() {
        if (this.link.link_state === "deep_link_ready") {
          return "Run/session binding 完整且 viewer 有权查看；Store 只展示 sanitized AgentOps Run Detail 跳转。";
        }
        if (this.link.link_state === "link_sanitized") {
          return "上游提供了 raw Trace 或 Evidence URL，Store 已剥离原文链接，仅保留 Run Detail 跳转。";
        }
        if (this.link.link_state === "permission_required") {
          return "Viewer 无权查看 AgentOps Run Detail，下一步必须进入 Evidence Vault 访问申请。";
        }
        return "缺少 AgentOps run_id 或 session_id，Store 不生成可点击 Run Detail 跳转。";
      },
      boundaryLabel: function boundaryLabel() {
        return "Store 只展示 sanitized AgentOps Run Detail，不展示 raw Trace/raw Evidence URL";
      },
      sourceTruthSummary: function sourceTruthSummary() {
        return formatSourceOfTruth(this.link.source_of_truth);
      }
    },
    methods: {
      displayLabel: displayLabel
    }
  });

  Vue.component("sdlc-policy-approval-flow", {
    props: ["request", "receipt"],
    template: [
      '<section class="workspace-section policy-approval-flow">',
      '  <div class="section-heading">',
      '    <h2>Policy Approval</h2>',
      '    <sdlc-status-chip :label="request.request_state" :tone="requestTone"></sdlc-status-chip>',
      '  </div>',
      '  <p class="summary">{{ flowCopy }}</p>',
      '  <dl class="facts">',
      '    <sdlc-metric-row label="请求合同" :value="request.contract_schema_version" tone="info"></sdlc-metric-row>',
      '    <sdlc-metric-row label="请求状态" :value="request.request_state" :tone="requestTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="请求动作" :value="request.requested_action" :tone="requestTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Requester" :value="requesterLabel" :tone="requesterTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="分发" :value="dispatchLabel" :tone="dispatchTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="回执合同" :value="receipt.contract_schema_version" tone="info"></sdlc-metric-row>',
      '    <sdlc-metric-row label="回执状态" :value="receipt.receipt_state" :tone="receiptTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Grant" :value="grantLabel" :tone="grantTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="事实源" :value="sourceTruthSummary" tone="info"></sdlc-metric-row>',
      '  </dl>',
      '  <div class="policy-approval-flow__grid">',
      '    <div>',
      '      <span>Policy Context</span>',
      '      <strong>{{ policyContext.policy_ref || "policy_ref missing" }}</strong>',
      '      <small>{{ displayLabel(policyContext.risk_level) }} / {{ policyContext.runtime_contract_version || "runtime contract missing" }}</small>',
      '    </div>',
      '    <div>',
      '      <span>AgentOps Request</span>',
      '      <strong>{{ agentopsRequest.store_audit_id || "audit missing" }}</strong>',
      '      <small>dispatch_allowed: {{ displayLabel(agentopsRequest.dispatch_allowed) }}</small>',
      '    </div>',
      '    <div>',
      '      <span>AgentOps Receipt</span>',
      '      <strong>{{ agentopsReceipt.approval_id || "approval missing" }}</strong>',
      '      <small>{{ displayLabel(agentopsReceipt.receipt_status) }} / {{ agentopsReceipt.received_at || "received_at missing" }}</small>',
      '    </div>',
      '    <div>',
      '      <span>Request Ref</span>',
      '      <strong>{{ approvalRequestRef.store_audit_id || "store audit missing" }}</strong>',
      '      <small>{{ approvalRequestRef.request_contract || "request contract missing" }} / {{ displayLabel(approvalRequestRef.requested_action) }}</small>',
      '    </div>',
      '    <div>',
      '      <span>Receipt Boundary</span>',
      '      <strong>approval_decision_final: {{ displayLabel(receiptProjection.approval_decision_final) }}</strong>',
      '      <small>capability_grant_issued: {{ displayLabel(receiptProjection.capability_grant_issued) }}</small>',
      '    </div>',
      '  </div>',
      '  <ul class="tag-list policy-approval-flow__scopes" v-if="contextScopes.length">',
      '    <li v-for="item in contextScopes" :key="item">{{ item }}</li>',
      '  </ul>',
      '  <ul class="request-panel__blockers" v-if="issues.length">',
      '    <li v-for="issue in issues" :key="issue.issue_id">{{ displayLabel(issue.issue_id) }} / {{ displayLabel(issue.fix_action_id) }}</li>',
      '  </ul>',
      '  <div class="request-panel__footer">',
      '    <span>{{ boundaryLabel }}</span>',
      '    <div class="policy-approval-flow__actions">',
      '      <sdlc-action-button :action="request.next_action" @invoke="$emit(\'invoke-action\', $event)"></sdlc-action-button>',
      '      <sdlc-action-button :action="receipt.next_action" kind="primary" @invoke="$emit(\'invoke-action\', $event)"></sdlc-action-button>',
      '    </div>',
      '  </div>',
      '</section>'
    ].join(""),
    computed: {
      requester: function requester() {
        return this.request.requester || {};
      },
      policyContext: function policyContext() {
        return this.request.policy_context || {};
      },
      agentopsRequest: function agentopsRequest() {
        return this.request.agentops_request || {};
      },
      requestProjection: function requestProjection() {
        return this.request.store_projection || {};
      },
      agentopsReceipt: function agentopsReceipt() {
        return this.receipt.agentops_receipt || {};
      },
      approvalRequestRef: function approvalRequestRef() {
        return this.receipt.approval_request_ref || {};
      },
      receiptProjection: function receiptProjection() {
        return this.receipt.store_projection || {};
      },
      requestIssues: function requestIssues() {
        return Array.isArray(this.request.issues) ? this.request.issues : [];
      },
      receiptIssues: function receiptIssues() {
        return Array.isArray(this.receipt.issues) ? this.receipt.issues : [];
      },
      issues: function issues() {
        return this.requestIssues.concat(this.receiptIssues);
      },
      contextScopes: function contextScopes() {
        return []
          .concat(Array.isArray(this.policyContext.permission_intents) ? this.policyContext.permission_intents : [])
          .concat(Array.isArray(this.policyContext.data_scopes) ? this.policyContext.data_scopes : []);
      },
      requestTone: function requestTone() {
        if (this.request.request_state === "approval_request_ready") {
          return "success";
        }
        if (this.request.request_state === "approval_request_blocked") {
          return "danger";
        }
        return "warning";
      },
      receiptTone: function receiptTone() {
        if (this.receipt.receipt_state === "approval_receipt_accepted") {
          return "success";
        }
        if (this.receipt.receipt_state === "approval_receipt_pending") {
          return "warning";
        }
        return "danger";
      },
      requesterTone: function requesterTone() {
        return ["owner", "security", "agentops_admin"].indexOf(this.requester.actor_role) >= 0
          ? "success"
          : "danger";
      },
      dispatchTone: function dispatchTone() {
        return this.requestProjection.dispatch_allowed && this.agentopsRequest.dispatch_allowed
          ? "success"
          : "warning";
      },
      grantTone: function grantTone() {
        return this.receiptProjection.capability_grant_issued ? "danger" : "success";
      },
      requesterLabel: function requesterLabel() {
        return [
          this.requester.actor_id || "actor missing",
          displayLabel(this.requester.actor_role),
          this.requester.tenant_id || "tenant missing"
        ].join(" / ");
      },
      dispatchLabel: function dispatchLabel() {
        return [
          "request: " + displayLabel(this.requestProjection.dispatch_allowed),
          "agentops: " + displayLabel(this.agentopsRequest.dispatch_allowed)
        ].join(" / ");
      },
      grantLabel: function grantLabel() {
        return [
          "decision_final: " + displayLabel(this.receiptProjection.approval_decision_final),
          "grant: " + displayLabel(this.receiptProjection.capability_grant_issued)
        ].join(" / ");
      },
      flowCopy: function flowCopy() {
        if (this.request.request_state !== "approval_request_ready") {
          return "审批请求缺少授权 requester、策略上下文或 justification；Store 不会分发到 AgentOps。";
        }
        if (this.receipt.receipt_state === "approval_receipt_accepted") {
          return "AgentOps 已接收审批请求 envelope；这只是回执，不是最终批准，也不会签发 CapabilityGrant。";
        }
        if (this.receipt.receipt_state === "approval_receipt_pending") {
          return "审批请求已进入 AgentOps 队列，pending receipt 仍不代表 PolicyDecision。";
        }
        if (this.receipt.receipt_state === "approval_receipt_rejected") {
          return "AgentOps 拒绝了请求 envelope；需要修复 request binding 或审批上下文后重试。";
        }
        return "审批回执不可用，Store 只展示 request/receipt 投影边界，不推导审批结果。";
      },
      boundaryLabel: function boundaryLabel() {
        return "Store decision authority: none / no override / no CapabilityGrant / receipt is not approval";
      },
      sourceTruthSummary: function sourceTruthSummary() {
        return formatSourceOfTruth(this.receipt.source_of_truth || this.request.source_of_truth);
      }
    },
    methods: {
      displayLabel: displayLabel
    }
  });

  Vue.component("sdlc-policy-approval-echo", {
    props: ["echo"],
    template: [
      '<section class="workspace-section policy-approval-echo">',
      '  <div class="section-heading">',
      '    <h2>Policy Echo</h2>',
      '    <sdlc-status-chip :label="echo.echo_state" :tone="stateTone"></sdlc-status-chip>',
      '  </div>',
      '  <p class="summary">{{ echoCopy }}</p>',
      '  <dl class="facts">',
      '    <sdlc-metric-row label="合同" :value="echo.contract_schema_version" tone="info"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Echo" :value="echo.echo_state" :tone="stateTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Decision" :value="policyDecision.decision || \'missing\'" :tone="decisionTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Policy" :value="policyDecision.policy_ref || \'missing\'" tone="warning"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Approval" :value="approvalLabel" :tone="approvalTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="可继续" :value="projection.store_may_continue ? \'allowed\' : \'blocked\'" :tone="projection.store_may_continue ? \'success\' : \'warning\'"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Override" :value="projection.store_override_allowed ? \'allowed\' : \'blocked\'" :tone="projection.store_override_allowed ? \'danger\' : \'success\'"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Grant" :value="projection.capability_grant_issued ? \'issued\' : \'not issued\'" :tone="projection.capability_grant_issued ? \'danger\' : \'success\'"></sdlc-metric-row>',
      '    <sdlc-metric-row label="事实源" :value="sourceTruthSummary" tone="info"></sdlc-metric-row>',
      '  </dl>',
      '  <div class="policy-approval-echo__grid">',
      '    <div>',
      '      <span>PolicyDecision</span>',
      '      <strong>{{ policyDecision.policy_decision_id || "decision id missing" }}</strong>',
      '      <small>{{ policyDecision.reason_code || "reason missing" }} / {{ policyDecision.valid_until || "valid_until missing" }}</small>',
      '    </div>',
      '    <div>',
      '      <span>Approval</span>',
      '      <strong>{{ approvalSummary.approval_id || "approval missing" }}</strong>',
      '      <small>{{ displayLabel(approvalSummary.status) }} / {{ approvalSummary.expires_at || "expires_at missing" }}</small>',
      '    </div>',
      '    <div>',
      '      <span>Store Projection</span>',
      '      <strong>{{ displayLabel(projection.projection_mode) }}</strong>',
      '      <small>authority: {{ displayLabel(projection.store_decision_authority) }} / block: {{ projection.store_block_reason || "none" }}</small>',
      '    </div>',
      '    <div>',
      '      <span>AgentOps Audit</span>',
      '      <strong>{{ policyDecision.agentops_trace_id || "trace missing" }}</strong>',
      '      <small>{{ policyDecision.agentops_audit_id || approvalSummary.agentops_audit_id || "audit missing" }}</small>',
      '    </div>',
      '  </div>',
      '  <ul class="request-panel__blockers" v-if="issues.length">',
      '    <li v-for="issue in issues" :key="issue.issue_id">{{ displayLabel(issue.issue_id) }} / {{ displayLabel(issue.fix_action_id) }}</li>',
      '  </ul>',
      '  <div class="request-panel__footer">',
      '    <span>{{ boundaryLabel }}</span>',
      '    <sdlc-action-button :action="echo.next_action" kind="primary" @invoke="$emit(\'invoke-action\', $event)"></sdlc-action-button>',
      '  </div>',
      '</section>'
    ].join(""),
    computed: {
      policyDecision: function policyDecision() {
        return this.echo.policy_decision || {};
      },
      approvalSummary: function approvalSummary() {
        return this.echo.approval_summary || {};
      },
      projection: function projection() {
        return this.echo.store_projection || {};
      },
      issues: function issues() {
        return Array.isArray(this.echo.issues) ? this.echo.issues : [];
      },
      stateTone: function stateTone() {
        if (this.echo.echo_state === "policy_allowed") {
          return "success";
        }
        if (this.echo.echo_state === "approval_pending" || this.echo.echo_state === "approval_expired") {
          return "warning";
        }
        return "danger";
      },
      decisionTone: function decisionTone() {
        if (this.policyDecision.decision === "allow") {
          return "success";
        }
        if (this.policyDecision.decision === "approval_required") {
          return "warning";
        }
        return this.policyDecision.decision === "deny" ? "danger" : "neutral";
      },
      approvalTone: function approvalTone() {
        if (this.approvalSummary.status === "approved" || this.approvalSummary.status === "not_required") {
          return "success";
        }
        if (this.approvalSummary.status === "pending" || this.approvalSummary.status === "expired") {
          return "warning";
        }
        return "danger";
      },
      approvalLabel: function approvalLabel() {
        return [
          this.approvalSummary.approval_id || "approval missing",
          displayLabel(this.approvalSummary.status)
        ].join(" / ");
      },
      echoCopy: function echoCopy() {
        if (this.echo.echo_state === "policy_allowed") {
          return "AgentOps policy echo 允许继续 Store 流程；Store 仍只是 echo-only projection，不签发 CapabilityGrant。";
        }
        if (this.echo.echo_state === "approval_pending") {
          return "AgentOps 要求审批且 approval 仍 pending；Store 只提供跳转，不把 pending 解释为允许。";
        }
        if (this.echo.echo_state === "approval_expired") {
          return "AgentOps approval echo 已过期；Store 必须请求刷新，不能继续安装或发布动作。";
        }
        if (this.echo.echo_state === "policy_denied") {
          return "AgentOps policy denied；Store 展示阻断原因和跳转，不覆盖 AgentOps 裁决。";
        }
        return "AgentOps policy echo 缺失或不支持；Store 不本地推导 policy allowed。";
      },
      boundaryLabel: function boundaryLabel() {
        return "AgentOps policy/approval source-of-truth / Store echo-only / no override / no CapabilityGrant";
      },
      sourceTruthSummary: function sourceTruthSummary() {
        return formatSourceOfTruth(this.echo.source_of_truth);
      }
    },
    methods: {
      displayLabel: displayLabel
    }
  });

  Vue.component("sdlc-managed-installer-preview", {
    props: ["preview"],
    template: [
      '<section class="workspace-section managed-installer-preview">',
      '  <div class="section-heading">',
      '    <h2>托管安装预览</h2>',
      '    <sdlc-status-chip :label="preview.installer_state" :tone="stateTone"></sdlc-status-chip>',
      '  </div>',
      '  <p class="summary">{{ previewCopy }}</p>',
      '  <dl class="facts">',
      '    <sdlc-metric-row label="合同" :value="preview.contract_schema_version" tone="info"></sdlc-metric-row>',
      '    <sdlc-metric-row label="执行" :value="preview.execution_mode" tone="info"></sdlc-metric-row>',
      '    <sdlc-metric-row label="真实安装" :value="preview.real_install_started ? \'started\' : \'not_started_preview_only\'" :tone="preview.real_install_started ? \'danger\' : \'success\'"></sdlc-metric-row>',
      '    <sdlc-metric-row label="包下载" :value="packageInfo.download_state" :tone="packageInfo.download_state === \'available\' ? \'success\' : \'warning\'"></sdlc-metric-row>',
      '    <sdlc-metric-row label="签名" :value="signatureLabel" :tone="signatureTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Policy" :value="policyLabel" :tone="policyTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Runtime" :value="runtimeLabel" :tone="runtimeTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="诊断" :value="diagnostics.diagnostic_ref || \'none\'" :tone="diagnostics.copyable ? \'warning\' : \'neutral\'"></sdlc-metric-row>',
      '  </dl>',
      '  <ol class="managed-installer-preview__steps" aria-label="managed installer preview steps">',
      '    <li v-for="step in steps" :key="step.step_id" :class="\'managed-installer-preview__step managed-installer-preview__step--\' + step.step_state">',
      '      <span>{{ displayLabel(step.step_id) }}</span>',
      '      <strong>{{ displayLabel(step.step_state) }}</strong>',
      '      <small>{{ displayLabel(step.owner_system) }} · {{ step.diagnostic_ref || "no diagnostic" }}</small>',
      '    </li>',
      '  </ol>',
      '  <div class="managed-installer-preview__gates">',
      '    <div>',
      '      <span>Isolation</span>',
      '      <strong>{{ displayLabel(isolation.isolation_profile) }}</strong>',
      '      <small>{{ displayLabel(isolation.network_mode) }} / {{ displayLabel(isolation.filesystem_mode) }}</small>',
      '    </div>',
      '    <div>',
      '      <span>Smoke</span>',
      '      <strong>{{ displayLabel(smokeTest.smoke_test_state) }}</strong>',
      '      <small>{{ smokeTest.smoke_test_ref || "smoke ref missing" }}</small>',
      '    </div>',
      '    <div>',
      '      <span>Source</span>',
      '      <strong>{{ sourceTruthSummary }}</strong>',
      '      <small>no real download / no install / no CapabilityGrant</small>',
      '    </div>',
      '  </div>',
      '  <ul class="request-panel__blockers" v-if="issues.length">',
      '    <li v-for="issue in issues" :key="issue.issue_id">{{ displayLabel(issue.issue_id) }} / {{ displayLabel(issue.fix_action_id) }}</li>',
      '  </ul>',
      '  <div class="request-panel__footer">',
      '    <span>{{ boundaryLabel }}</span>',
      '    <sdlc-action-button :action="preview.next_action" kind="primary" @invoke="$emit(\'invoke-action\', $event)"></sdlc-action-button>',
      '  </div>',
      '</section>'
    ].join(""),
    computed: {
      packageInfo: function packageInfo() {
        return this.preview.package || {};
      },
      policyGate: function policyGate() {
        return this.preview.policy_gate || {};
      },
      runtimeGate: function runtimeGate() {
        return this.preview.runtime_gate || {};
      },
      isolation: function isolation() {
        return this.preview.isolation || {};
      },
      smokeTest: function smokeTest() {
        return this.preview.smoke_test || {};
      },
      diagnostics: function diagnostics() {
        return this.preview.diagnostics || {};
      },
      steps: function steps() {
        return Array.isArray(this.preview.steps) ? this.preview.steps : [];
      },
      issues: function issues() {
        return Array.isArray(this.preview.issues) ? this.preview.issues : [];
      },
      stateTone: function stateTone() {
        if (this.preview.installer_state === "ready_to_install_preview" || this.preview.installer_state === "preview_passed") {
          return "success";
        }
        if (this.preview.installer_state === "smoke_test_failed") {
          return "danger";
        }
        return "warning";
      },
      signatureTone: function signatureTone() {
        return this.packageInfo.signature_state === "verified" && this.packageInfo.hash_match_state === "matched" ? "success" : "warning";
      },
      signatureLabel: function signatureLabel() {
        return [this.packageInfo.signature_state || "missing", this.packageInfo.hash_match_state || "missing"].join(" / ");
      },
      policyTone: function policyTone() {
        return this.policyGate.store_may_continue && !this.policyGate.capability_grant_issued ? "success" : "warning";
      },
      policyLabel: function policyLabel() {
        return [
          this.policyGate.echo_state || "agentops_echo_unavailable",
          this.policyGate.store_may_continue ? "allowed" : "blocked"
        ].join(" / ");
      },
      runtimeTone: function runtimeTone() {
        return this.runtimeGate.runtime_consumption_allowed ? "success" : "warning";
      },
      runtimeLabel: function runtimeLabel() {
        return [
          this.runtimeGate.handoff_state || "runtime_handoff_missing",
          this.runtimeGate.runtime_consumption_allowed ? "allowed" : "blocked"
        ].join(" / ");
      },
      previewCopy: function previewCopy() {
        if (this.preview.installer_state === "preview_passed") {
          return "托管安装预览已通过 smoke test 回显；这仍然是 preview-only，不代表 Store 已执行真实安装。";
        }
        if (this.preview.installer_state === "ready_to_install_preview") {
          return "下载、签名、Policy Echo 和 Runtime Handoff 已允许进入托管安装预览；Store 只展示下一步，不启动真实安装。";
        }
        if (this.preview.installer_state === "policy_blocked") {
          return "AgentOps Policy Echo 未允许继续；Store 不覆盖策略裁决，也不签发 CapabilityGrant。";
        }
        if (this.preview.installer_state === "runtime_handoff_blocked") {
          return "Runtime Handoff 尚不可消费；安装预览停在隔离安装前，等待 Runtime 事实源修复。";
        }
        if (this.preview.installer_state === "smoke_test_failed") {
          return "Smoke test 预览失败；用户可以复制诊断引用，但 Store 不会重试或执行真实安装。";
        }
        return "托管安装预览被下载、签名或缺失事实源阻断；Store 仅展示可审计的 preview-only 状态机。";
      },
      boundaryLabel: function boundaryLabel() {
        return "preview-only / real_install_started=false / no package execution / no CapabilityGrant";
      },
      sourceTruthSummary: function sourceTruthSummary() {
        return formatSourceOfTruth(this.preview.source_of_truth);
      }
    },
    methods: {
      displayLabel: displayLabel
    }
  });

  Vue.component("sdlc-notification-routing", {
    props: ["summary"],
    template: [
      '<section class="workspace-section notification-routing">',
      '  <div class="section-heading">',
      '    <h2>通知路由</h2>',
      '    <sdlc-status-chip :label="summary.routing_state" :tone="stateTone"></sdlc-status-chip>',
      '  </div>',
      '  <p class="summary">{{ summary.reason }}</p>',
      '  <dl class="facts">',
      '    <sdlc-metric-row label="合同" :value="summary.contract_schema_version" tone="info"></sdlc-metric-row>',
      '    <sdlc-metric-row label="事件" :value="summary.event_type" :tone="stateTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="状态" :value="summary.delivery_status" tone="warning"></sdlc-metric-row>',
      '    <sdlc-metric-row label="受众" :value="audienceLabel" :tone="audienceTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="事实源" :value="sourceTruthSummary" tone="info"></sdlc-metric-row>',
      '    <sdlc-metric-row label="审计" :value="summary.audit_id || \'missing\'" tone="warning"></sdlc-metric-row>',
      '  </dl>',
      '  <ul class="notification-routing__channels" v-if="channels.length">',
      '    <li v-for="route in channels" :key="route.channel_id">',
      '      <strong>{{ displayLabel(route.channel_id) }}</strong>',
      '      <span>{{ displayLabel(route.delivery_status) }} · {{ displayLabel(route.target_system) }}</span>',
      '      <small>SLA {{ route.sla_minutes }}m</small>',
      '    </li>',
      '  </ul>',
      '  <ul class="request-panel__blockers" v-if="issues.length">',
      '    <li v-for="issue in issues" :key="issue.issue_id">{{ displayLabel(issue.issue_id) }} / {{ displayLabel(issue.fix_action_id) }}</li>',
      '  </ul>',
      '  <div class="request-panel__footer">',
      '    <span>{{ eventLabel }}</span>',
      '    <sdlc-action-button :action="summary.next_action" kind="primary" @invoke="$emit(\'invoke-action\', $event)"></sdlc-action-button>',
      '  </div>',
      '</section>'
    ].join(""),
    computed: {
      stateTone: function stateTone() {
        if (this.summary.routing_state === "routing_ready") {
          return "success";
        }
        if (this.summary.routing_state === "routing_degraded") {
          return "warning";
        }
        return "danger";
      },
      channels: function channels() {
        return Array.isArray(this.summary.channels) ? this.summary.channels : [];
      },
      issues: function issues() {
        return Array.isArray(this.summary.issues) ? this.summary.issues : [];
      },
      trustedAudience: function trustedAudience() {
        return this.summary.trusted_audience || {};
      },
      audienceTone: function audienceTone() {
        return this.trustedAudience.audience_state === "trusted" ? "success" : "danger";
      },
      audienceLabel: function audienceLabel() {
        var recipients = Array.isArray(this.trustedAudience.recipients)
          ? this.trustedAudience.recipients.length
          : 0;
        return displayLabel(this.trustedAudience.audience_state) + " / " + recipients + " recipients";
      },
      eventLabel: function eventLabel() {
        return [
          displayLabel(this.summary.event_type),
          this.summary.event_id || "event-missing"
        ].join(" / ");
      },
      sourceTruthSummary: function sourceTruthSummary() {
        return formatSourceOfTruth(this.summary.source_of_truth);
      }
    },
    methods: {
      displayLabel: displayLabel
    }
  });

  Vue.component("sdlc-permission-denial-action", {
    props: ["summary"],
    template: [
      '<section class="workspace-section workspace-section--wide permission-denial">',
      '  <div class="section-heading">',
      '    <h2>权限恢复</h2>',
      '    <sdlc-status-chip :label="summary.denial_state" :tone="stateTone"></sdlc-status-chip>',
      '  </div>',
      '  <p class="summary">{{ page.title }}：{{ page.plain_language_explanation }}</p>',
      '  <dl class="facts">',
      '    <sdlc-metric-row label="合同" :value="summary.contract_schema_version" tone="info"></sdlc-metric-row>',
      '    <sdlc-metric-row label="场景" :value="summary.denial_scenario" :tone="stateTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="权限" :value="summary.permission_state" :tone="stateTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="通知" :value="page.notification_rule" tone="warning"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Raw Trace" :value="summary.raw_trace_exposed ? \'exposed\' : \'stripped\'" :tone="summary.raw_trace_exposed ? \'danger\' : \'success\'"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Store Grant" :value="summary.store_grant_issued ? \'issued\' : \'not_issued\'" :tone="summary.store_grant_issued ? \'danger\' : \'success\'"></sdlc-metric-row>',
      '    <sdlc-metric-row label="事实源" :value="sourceTruthSummary" tone="info"></sdlc-metric-row>',
      '    <sdlc-metric-row label="审计" :value="page.audit_required ? \'required\' : \'optional\'" tone="warning"></sdlc-metric-row>',
      '  </dl>',
      '  <div class="permission-denial__actions">',
      '    <sdlc-action-button :action="summary.primary_action" kind="primary" @invoke="$emit(\'invoke-action\', $event)"></sdlc-action-button>',
      '    <sdlc-action-button :action="summary.secondary_action" @invoke="$emit(\'invoke-action\', $event)"></sdlc-action-button>',
      '  </div>',
      '  <ul class="permission-denial__scenarios" v-if="scenarioExamples.length">',
      '    <li v-for="example in scenarioExamples" :key="example.denial_scenario">',
      '      <strong>{{ displayLabel(example.denial_scenario) }}</strong>',
      '      <span>{{ displayLabel(example.denial_state) }} · {{ displayLabel(example.permission_state) }}</span>',
      '      <small>{{ displayLabel(example.primary_action_id) }} / {{ displayLabel(example.notification_rule) }}</small>',
      '    </li>',
      '  </ul>',
      '  <ul class="request-panel__blockers" v-if="issues.length">',
      '    <li v-for="issue in issues" :key="issue.issue_id">{{ displayLabel(issue.issue_id) }} / {{ displayLabel(issue.fix_action_id) }}</li>',
      '  </ul>',
      '  <div class="request-panel__footer">',
      '    <span>{{ permissionLabel }}</span>',
      '    <sdlc-action-button :action="summary.next_action" kind="primary" @invoke="$emit(\'invoke-action\', $event)"></sdlc-action-button>',
      '  </div>',
      '</section>'
    ].join(""),
    computed: {
      page: function page() {
        return this.summary.page || {};
      },
      stateTone: function stateTone() {
        if (this.summary.denial_state === "denial_unavailable") {
          return "warning";
        }
        return "danger";
      },
      issues: function issues() {
        return Array.isArray(this.summary.issues) ? this.summary.issues : [];
      },
      scenarioExamples: function scenarioExamples() {
        return Array.isArray(this.summary.scenario_examples)
          ? this.summary.scenario_examples
          : [];
      },
      permissionLabel: function permissionLabel() {
        var permission = this.summary.permission || {};
        return [
          permission.permission_decision_id || "permission-missing",
          permission.denied_scope || "scope-missing"
        ].join(" / ");
      },
      sourceTruthSummary: function sourceTruthSummary() {
        return formatSourceOfTruth(this.summary.source_of_truth);
      }
    },
    methods: {
      displayLabel: displayLabel
    }
  });

  Vue.component("sdlc-listing-wizard", {
    props: ["wizard"],
    template: [
      '<section class="workspace-section workspace-section--wide listing-wizard">',
      '  <div class="section-heading">',
      '    <h2>上架向导</h2>',
      '    <sdlc-status-chip :label="wizard.wizard_state" :tone="stateTone"></sdlc-status-chip>',
      '  </div>',
      '  <ol class="wizard-steps" aria-label="listing wizard steps">',
      '    <li v-for="step in steps" :key="step.step_id" :class="\'wizard-step--\' + step.step_state">',
      '      <span>{{ step.label }}</span>',
      '      <strong>{{ displayLabel(step.step_state) }}</strong>',
      '      <small>{{ displayLabel(step.owner_system) }}</small>',
      '    </li>',
      '  </ol>',
      '  <div class="wizard-grid">',
      '    <div class="wizard-pane">',
      '      <span>来源选择</span>',
      '      <strong>{{ wizard.source_step.source_type }}</strong>',
      '      <code>{{ wizard.source_step.source_ref || wizard.source_step.source_id }}</code>',
      '    </div>',
      '    <div class="wizard-pane">',
      '      <span>字段确认</span>',
      '      <strong>{{ displayLabel(wizard.field_confirmation.step_state) }}</strong>',
      '      <ul><li v-for="field in visibleFields" :key="field.field_path">{{ field.field_path }} · {{ displayLabel(field.confirmation_state) }}</li></ul>',
      '    </div>',
      '    <div class="wizard-pane">',
      '      <span>校验报告</span>',
      '      <strong>{{ displayLabel(wizard.validation_report.step_state) }}</strong>',
      '      <dl class="compact-facts">',
      '        <dt>Package</dt><dd>{{ wizard.validation_report.package_id }}</dd>',
      '        <dt>Issues</dt><dd>{{ wizard.validation_report.issue_count }}</dd>',
      '        <dt>Fix Prompts</dt><dd>{{ wizard.validation_report.fix_prompt_count }}</dd>',
      '      </dl>',
      '    </div>',
      '    <div class="wizard-pane">',
      '      <span>详情预览</span>',
      '      <strong>{{ wizard.detail_preview.display_name }}</strong>',
      '      <p>{{ wizard.detail_preview.summary }}</p>',
      '      <dl class="compact-facts">',
      '        <dt>Runtime</dt><dd>{{ displayLabel(wizard.detail_preview.runtime_availability_state) }}</dd>',
      '        <dt>Health</dt><dd>{{ displayLabel(wizard.detail_preview.health_freshness_state) }}</dd>',
      '      </dl>',
      '    </div>',
      '  </div>',
      '  <ul class="request-panel__blockers" v-if="issues.length">',
      '    <li v-for="issue in issues" :key="issue.issue_id">{{ issue.issue_id }} / {{ issue.fix_action_id }}</li>',
      '  </ul>',
      '  <div class="request-panel__footer">',
      '    <span>{{ sourceTruthSummary }}</span>',
      '    <sdlc-action-button :action="wizard.next_action" kind="primary" @invoke="$emit(\'invoke-action\', $event)"></sdlc-action-button>',
      '  </div>',
      '</section>'
    ].join(""),
    computed: {
      stateTone: function stateTone() {
        if (this.wizard.wizard_state === "preview_ready") {
          return "success";
        }
        if (this.wizard.wizard_state === "runtime_gate_blocked") {
          return "danger";
        }
        if (this.wizard.wizard_state === "empty") {
          return "neutral";
        }
        return "warning";
      },
      steps: function steps() {
        return Array.isArray(this.wizard.steps) ? this.wizard.steps : [];
      },
      visibleFields: function visibleFields() {
        var confirmation = this.wizard.field_confirmation || {};
        return Array.isArray(confirmation.fields) ? confirmation.fields.slice(0, 4) : [];
      },
      issues: function issues() {
        var report = this.wizard.validation_report || {};
        return Array.isArray(report.issues) ? report.issues : [];
      },
      sourceTruthSummary: function sourceTruthSummary() {
        return formatSourceOfTruth(this.wizard.source_of_truth);
      }
    },
    methods: {
      displayLabel: displayLabel
    }
  });

  Vue.component("sdlc-package-validation-report", {
    props: ["report"],
    template: [
      '<section class="workspace-section package-validation-report">',
      '  <div class="section-heading">',
      '    <h2>Package Validation</h2>',
      '    <sdlc-status-chip :label="report.validation_status" :tone="statusTone"></sdlc-status-chip>',
      '  </div>',
      '  <p class="summary">{{ reportCopy }}</p>',
      '  <dl class="facts">',
      '    <sdlc-metric-row label="合同" :value="report.contract_schema_version" tone="info"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Package" :value="report.package_id" tone="neutral"></sdlc-metric-row>',
      '    <sdlc-metric-row label="草案" :value="report.draft_status" :tone="statusTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Issues" :value="issues.length" :tone="issuesTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Fix Prompts" :value="fixPrompts.length" :tone="fixPrompts.length ? \'warning\' : \'neutral\'"></sdlc-metric-row>',
      '    <sdlc-metric-row label="AI 字段" :value="evidence.ai_generated_field_count || 0" tone="warning"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Owner 确认" :value="evidence.owner_confirmed_field_count || 0" tone="success"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Evidence" :value="evidenceLabel" :tone="evidenceTone"></sdlc-metric-row>',
      '  </dl>',
      '  <div class="package-validation-report__grid">',
      '    <div>',
      '      <span>Validation Status</span>',
      '      <strong>{{ report.validation_status }}</strong>',
      '      <small>{{ report.draft_status }} / {{ report.agent_id || "agent missing" }}</small>',
      '    </div>',
      '    <div>',
      '      <span>Evidence Gaps</span>',
      '      <strong>{{ evidenceLabel }}</strong>',
      '      <small>manifest_lock / sbom_ref / scan_report_ref</small>',
      '    </div>',
      '    <div>',
      '      <span>Fix Prompt Safety</span>',
      '      <strong>{{ safePromptCount }} safe / {{ unsafePromptCount }} owner-required</strong>',
      '      <small>{{ firstPromptLabel }}</small>',
      '    </div>',
      '    <div>',
      '      <span>Source of Truth</span>',
      '      <strong>{{ displayLabel(sourceOfTruth.validation_report) }}</strong>',
      '      <small>{{ displayLabel(sourceOfTruth.package_manifest) }} / {{ displayLabel(sourceOfTruth.ai_generated_fields) }}</small>',
      '    </div>',
      '  </div>',
      '  <ul class="request-panel__blockers" v-if="issues.length">',
      '    <li v-for="issue in issues" :key="issue.issue_id">{{ displayLabel(issue.issue_id) }} / {{ issue.field_path }} / {{ displayLabel(issue.fix_action_id) }}</li>',
      '  </ul>',
      '  <div class="request-panel__footer">',
      '    <span>{{ boundaryLabel }}</span>',
      '    <sdlc-action-button :action="report.next_action" kind="primary" @invoke="$emit(\'invoke-action\', $event)"></sdlc-action-button>',
      '  </div>',
      '</section>'
    ].join(""),
    computed: {
      issues: function issues() {
        return Array.isArray(this.report.issues) ? this.report.issues : [];
      },
      fixPrompts: function fixPrompts() {
        return Array.isArray(this.report.fix_prompts) ? this.report.fix_prompts : [];
      },
      evidence: function evidence() {
        return this.report.evidence_summary || {};
      },
      sourceOfTruth: function sourceOfTruth() {
        return this.report.source_of_truth || {};
      },
      statusTone: function statusTone() {
        if (this.report.validation_status === "passed") {
          return "success";
        }
        if (this.report.validation_status === "fixable") {
          return "warning";
        }
        return "danger";
      },
      issuesTone: function issuesTone() {
        return this.issues.some(function hasBlocked(issue) {
          return issue.severity === "blocked";
        }) ? "danger" : (this.issues.length ? "warning" : "success");
      },
      evidenceLabel: function evidenceLabel() {
        var missing = [];
        if (!this.evidence.manifest_lock) {
          missing.push("manifest_lock");
        }
        if (!this.evidence.sbom_ref) {
          missing.push("sbom_ref");
        }
        if (!this.evidence.scan_report_ref) {
          missing.push("scan_report_ref");
        }
        return missing.length ? missing.join(", ") : "complete";
      },
      evidenceTone: function evidenceTone() {
        return this.evidenceLabel === "complete" ? "success" : "warning";
      },
      safePromptCount: function safePromptCount() {
        return this.fixPrompts.filter(function isSafe(prompt) {
          return prompt.safe_to_apply_in_store;
        }).length;
      },
      unsafePromptCount: function unsafePromptCount() {
        return this.fixPrompts.length - this.safePromptCount;
      },
      firstPromptLabel: function firstPromptLabel() {
        return this.fixPrompts.length ? this.fixPrompts[0].target_field : "no fix prompt";
      },
      reportCopy: function reportCopy() {
        if (this.report.validation_status === "passed" && !this.issues.length) {
          return "Package Validation 已通过；这只是 Store 包候选校验，不代表真实 SBOM、静态扫描或 Skill 发布已经完成。";
        }
        if (this.report.validation_status === "passed") {
          return "Package Validation 仅有 warning evidence gaps；审核可继续，但缺口必须保持可见。";
        }
        if (this.report.validation_status === "fixable") {
          return "Package Validation 存在可修复错误；安全修复提示仍必须保留来源和审计。";
        }
        return "Package Validation 存在阻断项；Owner 或来源证据补齐前不能进入正式审核。";
      },
      boundaryLabel: function boundaryLabel() {
        return "package candidate only / no real SBOM claim / no static scan claim / no Skill publish / no owner bypass";
      }
    },
    methods: {
      displayLabel: displayLabel
    }
  });

  Vue.component("sdlc-owner-governance-workbench", {
    props: ["workbench"],
    template: [
      '<section class="workspace-section workspace-section--wide owner-governance-workbench">',
      '  <div class="section-heading">',
      '    <h2>Owner 治理工作台</h2>',
      '    <sdlc-status-chip :label="workbench.queue_state" :tone="queueTone"></sdlc-status-chip>',
      '  </div>',
      '  <p class="summary">{{ workbenchCopy }}</p>',
      '  <dl class="facts owner-governance-workbench__facts">',
      '    <sdlc-metric-row label="合同" :value="workbench.contract_schema_version" tone="info"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Owner" :value="workbench.owner_team" tone="neutral"></sdlc-metric-row>',
      '    <sdlc-metric-row label="待办" :value="totalPending" :tone="pendingTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="阻断" :value="risk.blocked_count || 0" :tone="blockedTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="最高风险" :value="risk.highest_risk" :tone="blockedTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="SLA" :value="risk.sla_state" :tone="slaTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Audit" :value="audit.audit_id || \'unavailable\'" tone="neutral"></sdlc-metric-row>',
      '    <sdlc-metric-row label="事实源" :value="sourceTruthSummary" tone="info"></sdlc-metric-row>',
      '  </dl>',
      '  <div class="owner-governance-workbench__grid">',
      '    <div v-for="count in pendingCountRows" :key="count.key">',
      '      <span>{{ count.label }}</span>',
      '      <strong>{{ count.value }}</strong>',
      '      <small>{{ count.source }}</small>',
      '    </div>',
      '  </div>',
      '  <ol class="owner-governance-workbench__focus" v-if="focusItems.length">',
      '    <li v-for="item in focusItems" :key="item.item_id">',
      '      <strong>{{ displayLabel(item.item_state) }}</strong>',
      '      <span>{{ item.summary }}</span>',
      '      <small>{{ item.source_contract }} / {{ displayLabel(item.next_action_id) }}</small>',
      '    </li>',
      '  </ol>',
      '  <div class="request-panel__footer">',
      '    <span>{{ boundaryLabel }}</span>',
      '    <sdlc-action-button :action="workbench.next_action" kind="primary" @invoke="$emit(\'invoke-action\', $event)"></sdlc-action-button>',
      '  </div>',
      '</section>'
    ].join(""),
    computed: {
      pendingCounts: function pendingCounts() {
        return this.workbench.pending_counts || {};
      },
      risk: function risk() {
        return this.workbench.risk_summary || {};
      },
      audit: function audit() {
        return this.workbench.audit_fields || {};
      },
      focusItems: function focusItems() {
        return Array.isArray(this.workbench.focus_items) ? this.workbench.focus_items : [];
      },
      sourceOfTruth: function sourceOfTruth() {
        return this.workbench.source_of_truth || {};
      },
      totalPending: function totalPending() {
        return Object.keys(this.pendingCounts).reduce(function sum(total, key) {
          return total + (Number(this.pendingCounts[key]) || 0);
        }.bind(this), 0);
      },
      pendingCountRows: function pendingCountRows() {
        var sources = {
          draft_review: "draft_review_submission.v1",
          policy_approval: "policy_approval_request.v1",
          feedback: "feedback_owner_response_loop.v1",
          lifecycle: "lifecycle_governance_baseline.v1",
          installation_distribution: "installation_distribution_summary.v1",
          package_validation: "package_validation_report.v1",
          quality_evidence: "quality_evidence_access_summary.v1"
        };
        return Object.keys(sources).map(function mapCount(key) {
          return {
            key: key,
            label: displayLabel(key),
            value: Number(this.pendingCounts[key]) || 0,
            source: sources[key]
          };
        }, this);
      },
      queueTone: function queueTone() {
        if (this.workbench.queue_state === "healthy") {
          return "success";
        }
        if (this.workbench.queue_state === "blocked") {
          return "danger";
        }
        return "warning";
      },
      pendingTone: function pendingTone() {
        return this.totalPending ? "warning" : "success";
      },
      blockedTone: function blockedTone() {
        return (Number(this.risk.blocked_count) || 0) ? "danger" : "success";
      },
      slaTone: function slaTone() {
        return this.risk.sla_state === "within_sla" || this.risk.sla_state === "no_pending_owner_action"
          ? "success"
          : "warning";
      },
      sourceTruthSummary: function sourceTruthSummary() {
        return [
          this.sourceOfTruth.owner_queue,
          this.sourceOfTruth.approval,
          this.sourceOfTruth.feedback,
          this.sourceOfTruth.lifecycle,
          this.sourceOfTruth.quality
        ].filter(Boolean).join(" / ");
      },
      workbenchCopy: function workbenchCopy() {
        if (this.workbench.queue_state === "healthy") {
          return "Owner 工作台当前没有阻断待办；这只是聚合摘要，最终状态仍以单项事实源和审计字段为准。";
        }
        if (this.workbench.queue_state === "blocked") {
          return "Owner 工作台发现阻断项；需要回到对应事实源修复，不能在工作台直接批准、发布或禁用。";
        }
        return "Owner 工作台聚合待处理事项，帮助 Owner 扫描下一步，但不产生审批结果或生命周期变更。";
      },
      boundaryLabel: function boundaryLabel() {
        return "owner_governance_workbench.v1 / aggregate only / no real approval / no notification sending / no AgentVersion mutation / no AgentOps override";
      }
    },
    methods: {
      displayLabel: displayLabel
    }
  });

  Vue.component("sdlc-installation-records-workbench", {
    props: ["records"],
    template: [
      '<section class="workspace-section workspace-section--wide installation-records-workbench">',
      '  <div class="section-heading">',
      '    <h2>安装与运行记录</h2>',
      '    <sdlc-status-chip :label="records.installation_state" :tone="installationTone"></sdlc-status-chip>',
      '  </div>',
      '  <p class="summary">{{ recordsCopy }}</p>',
      '  <dl class="facts installation-records-workbench__facts">',
      '    <sdlc-metric-row label="合同" :value="records.contract_schema_version" tone="info"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Installation" :value="records.installation_id || \'unavailable\'" :tone="installationTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Device" :value="records.device_binding_state" :tone="deviceTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Runtime" :value="records.runtime_state" :tone="runtimeTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="版本" :value="versionLabel" :tone="upgradeTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="健康" :value="healthLabel" :tone="healthTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="吊销" :value="revocation.notice_state" :tone="revocationTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Audit" :value="audit.audit_id || \'unavailable\'" tone="neutral"></sdlc-metric-row>',
      '  </dl>',
      '  <div class="installation-records-workbench__grid">',
      '    <div>',
      '      <span>Device Binding</span>',
      '      <strong>{{ records.device_binding_state }}</strong>',
      '      <small>{{ records.device_label || "device hidden" }}</small>',
      '    </div>',
      '    <div>',
      '      <span>Version Cue</span>',
      '      <strong>{{ versionCue.upgrade_state }}</strong>',
      '      <small>{{ versionLabel }}</small>',
      '    </div>',
      '    <div>',
      '      <span>Health Cue</span>',
      '      <strong>{{ healthCue.freshness_state }}</strong>',
      '      <small>{{ healthCue.basis_guard }}</small>',
      '    </div>',
      '    <div>',
      '      <span>Revocation Notice</span>',
      '      <strong>{{ revocation.notice_state }}</strong>',
      '      <small>{{ revocation.replacement_agent_id || revocation.reason || "none" }}</small>',
      '    </div>',
      '  </div>',
      '  <div class="installation-records-workbench__source">',
      '    <strong>{{ sourceTruthSummary }}</strong>',
      '    <span>{{ boundaryLabel }}</span>',
      '  </div>',
      '  <div class="request-panel__footer">',
      '    <span>{{ audit.trace_id || "trace unavailable" }}</span>',
      '    <sdlc-action-button :action="records.next_action" kind="primary" @invoke="$emit(\'invoke-action\', $event)"></sdlc-action-button>',
      '  </div>',
      '</section>'
    ].join(""),
    computed: {
      versionCue: function versionCue() {
        return this.records.version_cue || {};
      },
      healthCue: function healthCue() {
        return this.records.health_cue || {};
      },
      revocation: function revocation() {
        return this.records.revocation_notice || {};
      },
      sourceOfTruth: function sourceOfTruth() {
        return this.records.source_of_truth || {};
      },
      audit: function audit() {
        return this.records.audit_fields || {};
      },
      installationTone: function installationTone() {
        if (this.records.installation_state === "installed") {
          return "success";
        }
        if (this.records.installation_state === "revoked" || this.records.installation_state === "records_unavailable") {
          return "danger";
        }
        return "warning";
      },
      deviceTone: function deviceTone() {
        if (this.records.device_binding_state === "active") {
          return "success";
        }
        if (this.records.device_binding_state === "revoked") {
          return "danger";
        }
        return "warning";
      },
      runtimeTone: function runtimeTone() {
        if (this.records.runtime_state === "runtime_ready") {
          return "success";
        }
        if (this.records.runtime_state === "runtime_blocked_by_lifecycle") {
          return "danger";
        }
        return "warning";
      },
      upgradeTone: function upgradeTone() {
        if (this.versionCue.upgrade_state === "current") {
          return "success";
        }
        if (this.versionCue.upgrade_state === "blocked") {
          return "danger";
        }
        return this.versionCue.upgrade_state === "upgrade_available" ? "warning" : "neutral";
      },
      healthTone: function healthTone() {
        if (this.healthCue.summary_state === "healthy") {
          return "success";
        }
        if (this.healthCue.summary_state === "blocked_by_revocation") {
          return "danger";
        }
        return "warning";
      },
      revocationTone: function revocationTone() {
        return this.revocation.notice_state === "none" ? "success" : "danger";
      },
      versionLabel: function versionLabel() {
        return [
          this.versionCue.installed_version || "not installed",
          this.versionCue.latest_version || "latest unknown"
        ].join(" -> ");
      },
      healthLabel: function healthLabel() {
        return [
          this.healthCue.freshness_state || "unknown",
          this.healthCue.summary_state || "unknown"
        ].join(" / ");
      },
      sourceTruthSummary: function sourceTruthSummary() {
        return [
          this.sourceOfTruth.installation,
          this.sourceOfTruth.device_binding,
          this.sourceOfTruth.runtime,
          this.sourceOfTruth.health,
          this.sourceOfTruth.lifecycle,
          this.sourceOfTruth.notification
        ].filter(Boolean).join(" / ");
      },
      recordsCopy: function recordsCopy() {
        if (this.records.installation_state === "installed" && this.versionCue.upgrade_state === "upgrade_available") {
          return "当前安装可用但存在升级候选；工作台只展示候选，不下载包、不执行升级、不修改 AgentVersion。";
        }
        if (this.records.installation_state === "installed") {
          return "当前安装记录可用；健康摘要来自 AgentOps 回显，不能作为推荐依据或实际 L5 判定。";
        }
        if (this.records.installation_state === "revoked") {
          return "当前安装已吊销或被生命周期阻断；工作台不能把 revoked 降级为可运行、可升级或可忽略。";
        }
        if (this.records.installation_state === "records_unavailable") {
          return "安装记录 envelope 缺失；前端必须保守降级，不能推断 installed、runtime_ready 或 upgrade_available。";
        }
        return "当前安装需要继续激活或绑定设备；工作台只展示下一步，不执行真实安装或 Runtime 启动。";
      },
      boundaryLabel: function boundaryLabel() {
        return "installation_records_workbench.v1 / aggregate only / no real install / no Runtime launch / no raw Trace / no policy bypass / health_summary_not_recommendation_basis";
      }
    }
  });

  Vue.component("sdlc-system-settings-workbench", {
    props: ["settings"],
    template: [
      '<section class="workspace-section workspace-section--wide system-settings-workbench">',
      '  <div class="section-heading">',
      '    <h2>系统设置</h2>',
      '    <sdlc-status-chip :label="settings.settings_state" :tone="settingsTone"></sdlc-status-chip>',
      '  </div>',
      '  <p class="summary">{{ settingsCopy }}</p>',
      '  <dl class="facts system-settings-workbench__facts">',
      '    <sdlc-metric-row label="合同" :value="settings.contract_schema_version" tone="info"></sdlc-metric-row>',
      '    <sdlc-metric-row label="分类" :value="taxonomy.category_state" :tone="taxonomyTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="标签" :value="taxonomy.tags_state" :tone="taxonomyTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="推荐位" :value="recommendation.slot_state" :tone="recommendationTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="镜像源" :value="mirror.mirror_state" :tone="mirrorTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="安装器" :value="installer.config_state" :tone="installerTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="AgentOps" :value="endpoint.endpoint_state" :tone="endpointTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Audit" :value="audit.audit_id || \'unavailable\'" tone="neutral"></sdlc-metric-row>',
      '  </dl>',
      '  <div class="system-settings-workbench__grid">',
      '    <div>',
      '      <span>Taxonomy</span>',
      '      <strong>{{ taxonomy.category_count || 0 }} categories / {{ taxonomy.tag_count || 0 }} tags</strong>',
      '      <small>{{ blockedTermsLabel }}</small>',
      '    </div>',
      '    <div>',
      '      <span>Recommendation Slot</span>',
      '      <strong>{{ recommendation.collection || "unassigned" }}</strong>',
      '      <small>{{ recommendation.rank_source }} / override={{ recommendation.override_allowed }}</small>',
      '    </div>',
      '    <div>',
      '      <span>Mirror Source</span>',
      '      <strong>{{ mirror.active_mirror || "unavailable" }}</strong>',
      '      <small>{{ mirror.signature_policy }} / fallback {{ mirror.fallback_mirror || "none" }}</small>',
      '    </div>',
      '    <div>',
      '      <span>Installer Config</span>',
      '      <strong>{{ installer.managed_installer_enabled ? "enabled" : "disabled" }}</strong>',
      '      <small>{{ installer.isolation_policy }} / smoke={{ installer.smoke_test_required }}</small>',
      '    </div>',
      '    <div>',
      '      <span>AgentOps Endpoint</span>',
      '      <strong>{{ endpoint.endpoint_ref_redacted || "redacted" }}</strong>',
      '      <small>{{ endpoint.credential_state }} / secret_exposed={{ endpoint.secret_exposed }}</small>',
      '    </div>',
      '  </div>',
      '  <div class="system-settings-workbench__source">',
      '    <strong>{{ sourceTruthSummary }}</strong>',
      '    <span>{{ boundaryLabel }}</span>',
      '  </div>',
      '  <div class="request-panel__footer">',
      '    <span>{{ audit.trace_id || "trace unavailable" }}</span>',
      '    <sdlc-action-button :action="settings.next_action" kind="primary" @invoke="$emit(\'invoke-action\', $event)"></sdlc-action-button>',
      '  </div>',
      '</section>'
    ].join(""),
    computed: {
      taxonomy: function taxonomy() {
        return this.settings.taxonomy_summary || {};
      },
      recommendation: function recommendation() {
        return this.settings.recommendation_slot || {};
      },
      mirror: function mirror() {
        return this.settings.mirror_source || {};
      },
      installer: function installer() {
        return this.settings.installer_config || {};
      },
      endpoint: function endpoint() {
        return this.settings.agentops_endpoint || {};
      },
      sourceOfTruth: function sourceOfTruth() {
        return this.settings.source_of_truth || {};
      },
      audit: function audit() {
        return this.settings.audit_fields || {};
      },
      settingsTone: function settingsTone() {
        if (this.settings.settings_state === "ready") {
          return "success";
        }
        if (this.settings.settings_state === "blocked" || this.settings.settings_state === "settings_unavailable") {
          return "danger";
        }
        return "warning";
      },
      taxonomyTone: function taxonomyTone() {
        return this.taxonomy.category_state === "blocked_term_review" ? "danger" : (this.taxonomy.tags_state === "complete" ? "success" : "warning");
      },
      recommendationTone: function recommendationTone() {
        if (this.recommendation.slot_state === "ready") {
          return "success";
        }
        return this.recommendation.slot_state === "blocked" ? "danger" : "warning";
      },
      mirrorTone: function mirrorTone() {
        if (this.mirror.mirror_state === "ready") {
          return "success";
        }
        return this.mirror.mirror_state === "signature_policy_blocked" ? "danger" : "warning";
      },
      installerTone: function installerTone() {
        if (this.installer.config_state === "preview_ready") {
          return "success";
        }
        return this.installer.config_state === "blocked_by_policy" ? "danger" : "warning";
      },
      endpointTone: function endpointTone() {
        if (this.endpoint.endpoint_state === "healthy") {
          return "success";
        }
        return this.endpoint.endpoint_state === "policy_blocked" ? "danger" : "warning";
      },
      blockedTermsLabel: function blockedTermsLabel() {
        var terms = Array.isArray(this.taxonomy.blocked_terms) ? this.taxonomy.blocked_terms : [];
        return terms.length ? terms.join(", ") : "no blocked terms";
      },
      sourceTruthSummary: function sourceTruthSummary() {
        return [
          this.sourceOfTruth.taxonomy,
          this.sourceOfTruth.recommendation,
          this.sourceOfTruth.mirror,
          this.sourceOfTruth.installer,
          this.sourceOfTruth.endpoint,
          this.sourceOfTruth.credential
        ].filter(Boolean).join(" / ");
      },
      settingsCopy: function settingsCopy() {
        if (this.settings.settings_state === "ready") {
          return "系统设置摘要可查看；这不是配置写入入口，推荐、镜像、安装器和 endpoint 仍以事实源为准。";
        }
        if (this.settings.settings_state === "blocked") {
          return "系统设置存在阻断项；需要管理员在真实控制面修复，工作台不直接写配置或改 endpoint。";
        }
        if (this.settings.settings_state === "settings_unavailable") {
          return "系统设置 envelope 缺失；前端必须保守降级，不能展示为 settings ready。";
        }
        return "系统设置需要复核；工作台只展示摘要，不暴露 secret、不覆盖推荐、不启动安装器。";
      },
      boundaryLabel: function boundaryLabel() {
        return "system_settings_workbench.v1 / aggregate only / no settings mutation / no credential exposure / no recommendation override / no installer execution / no endpoint rewrite";
      }
    }
  });

  Vue.component("sdlc-admin-risk-workbench", {
    props: ["risk"],
    template: [
      '<section class="workspace-section workspace-section--wide admin-risk-workbench">',
      '  <div class="section-heading">',
      '    <h2>管理员风险</h2>',
      '    <sdlc-status-chip :label="risk.risk_state" :tone="riskTone"></sdlc-status-chip>',
      '  </div>',
      '  <p class="summary">{{ riskCopy }}</p>',
      '  <dl class="facts admin-risk-workbench__facts">',
      '    <sdlc-metric-row label="合同" :value="risk.contract_schema_version" tone="info"></sdlc-metric-row>',
      '    <sdlc-metric-row label="风险等级" :value="risk.risk_level" :tone="riskTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Runtime 风险" :value="risk.runtime_risk_level" :tone="runtimeTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="证据缺口" :value="evidenceGaps.length" :tone="gapTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Policy" :value="policy.policy_state" :tone="policyTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Permission" :value="permission.permission_state" :tone="permissionTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="安全动作" :value="securityActions.length" :tone="actionTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Audit" :value="audit.audit_id || \'unavailable\'" tone="neutral"></sdlc-metric-row>',
      '  </dl>',
      '  <div class="admin-risk-workbench__grid">',
      '    <div>',
      '      <span>Policy Signal</span>',
      '      <strong>{{ policy.policy_state }}</strong>',
      '      <small>{{ policy.policy_ref || "policy ref unavailable" }} / approval={{ policy.approval_status }}</small>',
      '    </div>',
      '    <div>',
      '      <span>Permission Signal</span>',
      '      <strong>{{ permission.permission_state }}</strong>',
      '      <small>{{ permission.denied_scope || "summary only" }} / grant={{ permission.capability_grant_issued }}</small>',
      '    </div>',
      '    <div>',
      '      <span>Security Actions</span>',
      '      <strong>{{ firstActionLabel }}</strong>',
      '      <small>{{ actionModeLabel }}</small>',
      '    </div>',
      '    <div>',
      '      <span>Source of Truth</span>',
      '      <strong>{{ displayLabel(sourceOfTruth.risk) }}</strong>',
      '      <small>{{ displayLabel(sourceOfTruth.policy) }} / {{ displayLabel(sourceOfTruth.evidence) }}</small>',
      '    </div>',
      '  </div>',
      '  <ul class="admin-risk-workbench__gaps" v-if="evidenceGaps.length">',
      '    <li v-for="gap in evidenceGaps" :key="gap.gap_id">',
      '      <strong>{{ displayLabel(gap.severity) }}</strong>',
      '      <span>{{ gap.summary }}</span>',
      '      <small>{{ gap.source_contract }} / {{ gap.gap_id }}</small>',
      '    </li>',
      '  </ul>',
      '  <div class="admin-risk-workbench__source">',
      '    <strong>{{ sourceTruthSummary }}</strong>',
      '    <span>{{ boundaryLabel }}</span>',
      '  </div>',
      '  <div class="request-panel__footer">',
      '    <span>{{ audit.trace_id || "trace unavailable" }}</span>',
      '    <sdlc-action-button :action="risk.next_action" kind="primary" @invoke="$emit(\'invoke-action\', $event)"></sdlc-action-button>',
      '  </div>',
      '</section>'
    ].join(""),
    computed: {
      evidenceGaps: function evidenceGaps() {
        return Array.isArray(this.risk.evidence_gaps) ? this.risk.evidence_gaps : [];
      },
      policy: function policy() {
        return this.risk.policy_signal || {};
      },
      permission: function permission() {
        return this.risk.permission_signal || {};
      },
      securityActions: function securityActions() {
        return Array.isArray(this.risk.security_actions) ? this.risk.security_actions : [];
      },
      sourceOfTruth: function sourceOfTruth() {
        return this.risk.source_of_truth || {};
      },
      audit: function audit() {
        return this.risk.audit_fields || {};
      },
      riskTone: function riskTone() {
        if (this.risk.risk_state === "low_risk") {
          return "success";
        }
        if (this.risk.risk_state === "security_revoked" || this.risk.risk_state === "risk_unknown") {
          return "danger";
        }
        return "warning";
      },
      runtimeTone: function runtimeTone() {
        if (this.risk.runtime_risk_level === "normal") {
          return "success";
        }
        return this.risk.runtime_risk_level === "blocked" ? "danger" : "warning";
      },
      gapTone: function gapTone() {
        return this.evidenceGaps.some(function blocked(gap) {
          return gap.severity === "blocked";
        }) ? "danger" : (this.evidenceGaps.length ? "warning" : "success");
      },
      policyTone: function policyTone() {
        if (this.policy.policy_state === "allowed") {
          return "success";
        }
        if (this.policy.policy_state === "policy_denied") {
          return "danger";
        }
        return "warning";
      },
      permissionTone: function permissionTone() {
        if (this.permission.permission_state === "allowed_summary_only") {
          return "success";
        }
        if (this.permission.permission_state === "blocked") {
          return "danger";
        }
        return "warning";
      },
      actionTone: function actionTone() {
        return this.securityActions.some(function required(action) {
          return action.action_state === "required";
        }) ? "danger" : (this.securityActions.length ? "warning" : "neutral");
      },
      firstActionLabel: function firstActionLabel() {
        return this.securityActions.length ? displayLabel(this.securityActions[0].action_id) : "no action";
      },
      actionModeLabel: function actionModeLabel() {
        return this.securityActions.length ? this.securityActions[0].execution_mode : "preview_only";
      },
      sourceTruthSummary: function sourceTruthSummary() {
        return [
          this.sourceOfTruth.risk,
          this.sourceOfTruth.policy,
          this.sourceOfTruth.permission,
          this.sourceOfTruth.evidence,
          this.sourceOfTruth.lifecycle,
          this.sourceOfTruth.notification
        ].filter(Boolean).join(" / ");
      },
      riskCopy: function riskCopy() {
        if (this.risk.risk_state === "low_risk") {
          return "管理员风险摘要为低风险；这仍只是只读投影，不代表前端拥有处置权或 Grant 签发权。";
        }
        if (this.risk.risk_state === "security_revoked") {
          return "当前风险已进入安全吊销状态；工作台不能执行禁用、下架、吊销传播或降级该状态。";
        }
        if (this.risk.risk_state === "risk_unknown") {
          return "管理员风险 envelope 缺失；前端必须保守降级，不能推断为低风险或安全可通过。";
        }
        return "管理员风险需要复核；Store 只展示摘要和跳转，不展示 raw Trace、raw Evidence 或用户设备明细。";
      },
      boundaryLabel: function boundaryLabel() {
        return "admin_risk_workbench.v1 / aggregate only / no disable execution / no lifecycle mutation / no AgentOps policy override / no CapabilityGrant / no raw Trace / no raw Evidence / no user-device details";
      }
    },
    methods: {
      displayLabel: displayLabel
    }
  });

  Vue.component("sdlc-version-history-workbench", {
    props: ["history"],
    template: [
      '<section class="workspace-section workspace-section--wide version-history-workbench">',
      '  <div class="section-heading">',
      '    <h2>版本历史</h2>',
      '    <sdlc-status-chip :label="history.version_state" :tone="versionTone"></sdlc-status-chip>',
      '  </div>',
      '  <p class="summary">{{ historyCopy }}</p>',
      '  <dl class="facts version-history-workbench__facts">',
      '    <sdlc-metric-row label="合同" :value="history.contract_schema_version" tone="info"></sdlc-metric-row>',
      '    <sdlc-metric-row label="当前版本" :value="history.current_version || \'unknown\'" :tone="versionTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="最新版本" :value="history.latest_version || \'unknown\'" :tone="latestTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="发布状态" :value="history.release_status" :tone="releaseTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="升级" :value="upgrade.upgrade_state" :tone="upgradeTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="回退" :value="rollback.rollback_state" :tone="rollbackTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="替代版本" :value="replacement.replacement_state" :tone="replacementTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="影响安装" :value="affected.affected_install_count || 0" :tone="affectedTone"></sdlc-metric-row>',
      '  </dl>',
      '  <div class="version-history-workbench__grid">',
      '    <div>',
      '      <span>Artifact Trust</span>',
      '      <strong>{{ trust.signature_state }}</strong>',
      '      <small>{{ trust.artifact_hash || "hash unavailable" }} / {{ trust.package_validation_state }}</small>',
      '    </div>',
      '    <div>',
      '      <span>Upgrade Cue</span>',
      '      <strong>{{ upgrade.candidate_version || upgrade.upgrade_state }}</strong>',
      '      <small>{{ upgrade.action_mode }}</small>',
      '    </div>',
      '    <div>',
      '      <span>Rollback Cue</span>',
      '      <strong>{{ rollback.rollback_version || rollback.rollback_state }}</strong>',
      '      <small>{{ rollback.action_mode }}</small>',
      '    </div>',
      '    <div>',
      '      <span>Replacement Mapping</span>',
      '      <strong>{{ replacement.replacement_agent_id || replacement.replacement_state }}</strong>',
      '      <small>{{ replacement.mapping_source }} / explicit={{ replacement.explicit_mapping_only }}</small>',
      '    </div>',
      '    <div>',
      '      <span>Affected Scope</span>',
      '      <strong>{{ affected.affected_install_count || 0 }} installs</strong>',
      '      <small>{{ affected.notification_state }} / devices_exposed={{ affected.affected_device_details_exposed }}</small>',
      '    </div>',
      '  </div>',
      '  <div class="version-history-workbench__source">',
      '    <strong>{{ sourceTruthSummary }}</strong>',
      '    <span>{{ boundaryLabel }}</span>',
      '  </div>',
      '  <div class="request-panel__footer">',
      '    <span>{{ audit.trace_id || "trace unavailable" }}</span>',
      '    <sdlc-action-button :action="history.next_action" kind="primary" @invoke="$emit(\'invoke-action\', $event)"></sdlc-action-button>',
      '  </div>',
      '</section>'
    ].join(""),
    computed: {
      trust: function trust() {
        return this.history.artifact_trust || {};
      },
      upgrade: function upgrade() {
        return this.history.upgrade_cue || {};
      },
      rollback: function rollback() {
        return this.history.rollback_cue || {};
      },
      replacement: function replacement() {
        return this.history.replacement_cue || {};
      },
      affected: function affected() {
        return this.history.affected_scope || {};
      },
      sourceOfTruth: function sourceOfTruth() {
        return this.history.source_of_truth || {};
      },
      audit: function audit() {
        return this.history.audit_fields || {};
      },
      versionTone: function versionTone() {
        if (this.history.version_state === "current_stable") {
          return "success";
        }
        if (this.history.version_state === "security_revoked" || this.history.version_state === "version_history_unavailable") {
          return "danger";
        }
        return "warning";
      },
      latestTone: function latestTone() {
        return this.history.latest_version === this.history.current_version ? "success" : "warning";
      },
      releaseTone: function releaseTone() {
        if (this.history.release_status === "published" || this.history.release_status === "manual_installable-preview") {
          return "success";
        }
        return this.history.release_status === "security_revoked" ? "danger" : "warning";
      },
      upgradeTone: function upgradeTone() {
        if (this.upgrade.upgrade_state === "upgrade_available") {
          return "warning";
        }
        if (this.upgrade.upgrade_state === "blocked_by_security_revocation") {
          return "danger";
        }
        return "neutral";
      },
      rollbackTone: function rollbackTone() {
        if (this.rollback.rollback_state === "rollback_available") {
          return "warning";
        }
        if (this.rollback.rollback_state === "not_allowed") {
          return "danger";
        }
        return "neutral";
      },
      replacementTone: function replacementTone() {
        if (this.replacement.replacement_state === "replacement_available" || this.replacement.replacement_state === "deprecated_replacement") {
          return "warning";
        }
        return this.replacement.replacement_state === "unknown" ? "danger" : "neutral";
      },
      affectedTone: function affectedTone() {
        return Number(this.affected.affected_install_count || 0) > 0 ? "warning" : "neutral";
      },
      sourceTruthSummary: function sourceTruthSummary() {
        return [
          this.sourceOfTruth.agent_version,
          this.sourceOfTruth.package_trust,
          this.sourceOfTruth.lifecycle,
          this.sourceOfTruth.installation,
          this.sourceOfTruth.notification
        ].filter(Boolean).join(" / ");
      },
      historyCopy: function historyCopy() {
        if (this.history.version_state === "current_stable") {
          return "版本历史显示当前版本稳定；工作台只读展示 AgentVersion 事实，没有前端变更权。";
        }
        if (this.history.version_state === "upgrade_available") {
          return "存在升级候选；工作台只展示候选版本和影响范围，不自动升级、不执行安装器。";
        }
        if (this.history.version_state === "rollback_available") {
          return "存在回退候选；工作台只展示显式回退映射，不执行回退或修改安装记录。";
        }
        if (this.history.version_state === "security_revoked") {
          return "当前版本已安全吊销；工作台不能把 revoked 降级为可升级、可回退或可运行。";
        }
        if (this.history.version_state === "version_history_unavailable") {
          return "版本历史 envelope 缺失；前端必须保守降级，不能推断可升级或可运行。";
        }
        return "版本历史需要复核；替代版本必须来自显式映射，不能由前端本地推荐。";
      },
      boundaryLabel: function boundaryLabel() {
        return "version_history_workbench.v1 / aggregate only / no auto upgrade / no rollback execution / no AgentVersion mutation / no replacement algorithm / no installer execution / no raw Evidence";
      }
    }
  });

  Vue.component("sdlc-draft-review-submission", {
    props: ["submission"],
    template: [
      '<section class="workspace-section draft-review-submission">',
      '  <div class="section-heading">',
      '    <h2>草案提交审核</h2>',
      '    <sdlc-status-chip :label="submission.submission_state" :tone="stateTone"></sdlc-status-chip>',
      '  </div>',
      '  <p class="summary">{{ submissionCopy }}</p>',
      '  <dl class="facts">',
      '    <sdlc-metric-row label="合同" :value="submission.contract_schema_version" tone="info"></sdlc-metric-row>',
      '    <sdlc-metric-row label="草案" :value="submission.draft_status" :tone="stateTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="队列" :value="queueLabel" :tone="queueTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Owner" :value="ownerLabel" :tone="ownerTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Validation" :value="validationLabel" :tone="validationTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Runtime" :value="runtimeLabel" :tone="runtimeTone"></sdlc-metric-row>',
      '  </dl>',
      '  <div class="draft-review-submission__grid">',
      '    <div>',
      '      <span>Submission</span>',
      '      <strong>{{ submission.submission_id || "submission missing" }}</strong>',
      '      <small>{{ submission.package_id || "package missing" }}</small>',
      '    </div>',
      '    <div>',
      '      <span>Review Queue</span>',
      '      <strong>{{ reviewQueue.review_queue_id || displayLabel(reviewQueue.queue_state) }}</strong>',
      '      <small>{{ displayLabel(reviewQueue.review_status) }}</small>',
      '    </div>',
      '    <div>',
      '      <span>Owner Confirmation</span>',
      '      <strong>{{ ownerConfirmation.confirmed_by || "owner missing" }}</strong>',
      '      <small>{{ ownerConfirmation.confirmed_at || "confirmed_at missing" }} / {{ displayLabel(ownerConfirmation.confirmation_basis) }}</small>',
      '    </div>',
      '    <div>',
      '      <span>Source</span>',
      '      <strong>{{ sourceTruthSummary }}</strong>',
      '      <small>pending_review only after owner + validation + runtime gates</small>',
      '    </div>',
      '  </div>',
      '  <ul class="request-panel__blockers" v-if="issues.length">',
      '    <li v-for="issue in issues" :key="issue.issue_id">{{ displayLabel(issue.issue_id) }} / {{ displayLabel(issue.fix_action_id) }}</li>',
      '  </ul>',
      '  <div class="request-panel__footer">',
      '    <span>{{ boundaryLabel }}</span>',
      '    <sdlc-action-button :action="submission.next_action" kind="primary" @invoke="$emit(\'invoke-action\', $event)"></sdlc-action-button>',
      '  </div>',
      '</section>'
    ].join(""),
    computed: {
      reviewQueue: function reviewQueue() {
        return this.submission.review_queue_entry || {};
      },
      ownerConfirmation: function ownerConfirmation() {
        return this.submission.owner_confirmation || {};
      },
      validationSummary: function validationSummary() {
        return this.submission.validation_summary || {};
      },
      runtimeGate: function runtimeGate() {
        return this.submission.runtime_gate || {};
      },
      issues: function issues() {
        return Array.isArray(this.submission.issues) ? this.submission.issues : [];
      },
      stateTone: function stateTone() {
        if (this.submission.submission_state === "pending_review") {
          return "success";
        }
        if (this.submission.submission_state === "owner_confirmation_required" || this.submission.submission_state === "runtime_gate_blocked") {
          return "warning";
        }
        return "danger";
      },
      queueTone: function queueTone() {
        return this.reviewQueue.queue_state === "enqueued" ? "success" : "warning";
      },
      queueLabel: function queueLabel() {
        return [
          this.reviewQueue.queue_state || "not_enqueued",
          this.reviewQueue.review_status || "not_submitted"
        ].join(" / ");
      },
      ownerTone: function ownerTone() {
        return this.ownerConfirmation.confirmed ? "success" : "warning";
      },
      ownerLabel: function ownerLabel() {
        return this.ownerConfirmation.confirmed ? "confirmed" : "owner_confirmation_required";
      },
      validationTone: function validationTone() {
        return this.validationSummary.validation_status === "passed" ? "success" : "danger";
      },
      validationLabel: function validationLabel() {
        return [
          this.validationSummary.validation_status || "missing",
          this.validationSummary.draft_status_before_submission || "missing"
        ].join(" / ");
      },
      runtimeTone: function runtimeTone() {
        return this.runtimeGate.runtime_availability_state === "runtime_ready" ? "success" : "warning";
      },
      runtimeLabel: function runtimeLabel() {
        return [
          this.runtimeGate.runtime_availability_state || "manifest_incomplete",
          this.runtimeGate.runtime_display_name_zh || "runtime missing"
        ].join(" / ");
      },
      submissionCopy: function submissionCopy() {
        if (this.submission.submission_state === "pending_review") {
          return "Owner 已显式确认，Package Validation 与 Runtime Gate 均通过；草案正式进入 Agent Store review queue。";
        }
        if (this.submission.submission_state === "owner_confirmation_required") {
          return "提交审核前仍需要 Owner 明确确认字段；Store 不把 Package Validation 的建议状态当作正式入队。";
        }
        if (this.submission.submission_state === "runtime_gate_blocked") {
          return "Runtime Gate 未 ready，草案不得进入 pending_review；下一步交给 Agent Runtime 事实源修复。";
        }
        return "草案提交审核被校验或占位值阻断；Store 不创建 AgentVersion、不发布 Agent、不触发 AgentOps PolicyDecision。";
      },
      boundaryLabel: function boundaryLabel() {
        return "no AgentVersion creation / no publish / no PolicyDecision / no CapabilityGrant";
      },
      sourceTruthSummary: function sourceTruthSummary() {
        return formatSourceOfTruth(this.submission.source_of_truth);
      }
    },
    methods: {
      displayLabel: displayLabel
    }
  });

  Vue.component("sdlc-contract-registry-traceability", {
    props: ["traceability"],
    template: [
      '<section class="workspace-section workspace-section--wide contract-registry-traceability">',
      '  <div class="section-heading">',
      '    <h2>合同注册追踪</h2>',
      '    <sdlc-status-chip :label="traceability.registry_status" :tone="stateTone"></sdlc-status-chip>',
      '  </div>',
      '  <p class="summary">{{ registryCopy }}</p>',
      '  <dl class="facts">',
      '    <sdlc-metric-row label="合同" :value="traceability.contract_schema_version" tone="info"></sdlc-metric-row>',
      '    <sdlc-metric-row label="OpenAPI" :value="coverage.total_contracts" :tone="stateTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="CCT" :value="coverage.contracts_with_cct" tone="warning"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Contract Tests" :value="coverage.contracts_with_contract_tests" :tone="stateTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="完整追踪" :value="coverage.complete_traceability" :tone="stateTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="未映射" :value="coverage.unmapped_contracts" :tone="unmappedTone"></sdlc-metric-row>',
      '  </dl>',
      '  <div class="contract-registry-traceability__focus">',
      '    <div>',
      '      <span>Focus Contract</span>',
      '      <strong>{{ focusContract.contract_id }}</strong>',
      '      <small>{{ focusContract.contract_file }} / {{ focusContract.primary_schema }}</small>',
      '    </div>',
      '    <div>',
      '      <span>Owner / Producer</span>',
      '      <strong>{{ focusContract.owner }} / {{ focusContract.producer }}</strong>',
      '      <small>{{ focusContract.appendix_anchor }}</small>',
      '    </div>',
      '    <div>',
      '      <span>Consumers</span>',
      '      <strong>{{ displayList(focusContract.consumers) }}</strong>',
      '      <small>{{ cctLabel }}</small>',
      '    </div>',
      '    <div>',
      '      <span>Contract Test</span>',
      '      <strong>{{ contractTestLabel }}</strong>',
      '      <small>{{ sourceTruthSummary }}</small>',
      '    </div>',
      '  </div>',
      '  <ul class="contract-registry-traceability__contracts">',
      '    <li v-for="contract in visibleContracts" :key="contract.contract_id">',
      '      <strong>{{ contract.contract_id }}</strong>',
      '      <span>{{ contract.owner }} -> {{ displayList(contract.consumers) }}</span>',
      '      <small>{{ displayList(contract.cct_ids) || "no CCT" }} / {{ contract.contract_file }}</small>',
      '    </li>',
      '  </ul>',
      '  <div class="request-panel__footer">',
      '    <span>{{ boundaryLabel }}</span>',
      '    <sdlc-action-button :action="traceability.next_action" kind="primary" @invoke="$emit(\'invoke-action\', $event)"></sdlc-action-button>',
      '  </div>',
      '</section>'
    ].join(""),
    computed: {
      coverage: function coverage() {
        return this.traceability.coverage_summary || {};
      },
      contracts: function contracts() {
        return Array.isArray(this.traceability.contracts) ? this.traceability.contracts : [];
      },
      focusContract: function focusContract() {
        return this.traceability.focus_contract || {};
      },
      visibleContracts: function visibleContracts() {
        var focusId = this.focusContract.contract_id;
        var focusContract = this.focusContract;
        var visible = this.contracts.filter(function filterFocus(contract) {
          return contract.contract_id !== focusId;
        }).slice(0, 5);
        if (focusId) {
          visible.unshift(focusContract);
        }
        return visible;
      },
      stateTone: function stateTone() {
        return this.traceability.registry_status === "complete" ? "success" : "danger";
      },
      unmappedTone: function unmappedTone() {
        return this.coverage.unmapped_contracts === 0 ? "success" : "danger";
      },
      cctLabel: function cctLabel() {
        return this.displayList(this.focusContract.cct_ids) || "CCT missing";
      },
      contractTestLabel: function contractTestLabel() {
        var tests = Array.isArray(this.focusContract.contract_test_files) ? this.focusContract.contract_test_files : [];
        return tests[0] || "contract test missing";
      },
      registryCopy: function registryCopy() {
        if (this.traceability.registry_status === "complete") {
          return "OpenAPI 合同、Owner、Producer、Consumer、appendix anchor 与 contract tests 已形成只读追踪矩阵。";
        }
        return "合同注册追踪存在缺口；Store UI 只展示缺口，不本地扫描 PR、不补写外部 Contract Registry。";
      },
      boundaryLabel: function boundaryLabel() {
        return "read-only projection / no external registry service / no PR scan / no CI status mutation";
      },
      sourceTruthSummary: function sourceTruthSummary() {
        return formatSourceOfTruth(this.traceability.source_of_truth);
      }
    },
    methods: {
      displayList: function displayList(values) {
        return Array.isArray(values) ? values.join(", ") : "";
      }
    }
  });

  Vue.component("sdlc-skill-registry-lifecycle", {
    props: ["lifecycle"],
    template: [
      '<section class="workspace-section skill-registry-lifecycle">',
      '  <div class="section-heading">',
      '    <h2>Skill Registry</h2>',
      '    <sdlc-status-chip :label="lifecycle.registry_status" :tone="stateTone"></sdlc-status-chip>',
      '  </div>',
      '  <p class="summary">{{ lifecycleCopy }}</p>',
      '  <dl class="facts">',
      '    <sdlc-metric-row label="合同" :value="lifecycle.contract_schema_version" tone="info"></sdlc-metric-row>',
      '    <sdlc-metric-row label="通知" :value="lifecycle.notification_contract_schema_version" tone="warning"></sdlc-metric-row>',
      '    <sdlc-metric-row label="回执" :value="lifecycle.ack_schema_version" tone="warning"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Skill" :value="skill.registry_key || skill.skill_id || \'missing\'" :tone="stateTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="风险" :value="skill.risk_level || \'missing\'" :tone="riskTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="事件" :value="eventLabel" :tone="eventTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="AgentOps" :value="consumptionLabel" :tone="consumptionTone"></sdlc-metric-row>',
      '  </dl>',
      '  <div class="skill-registry-lifecycle__grid">',
      '    <div>',
      '      <span>Registry Record</span>',
      '      <strong>{{ skill.skill_id || "skill missing" }}</strong>',
      '      <small>{{ skill.skill_version || "version missing" }} / {{ skill.schema_ref || "schema missing" }}</small>',
      '    </div>',
      '    <div>',
      '      <span>Owner</span>',
      '      <strong>{{ skill.owner_team || "owner missing" }}</strong>',
      '      <small>{{ skill.owner_user || "owner_user missing" }}</small>',
      '    </div>',
      '    <div>',
      '      <span>Lifecycle Event</span>',
      '      <strong>{{ eventLabel }}</strong>',
      '      <small>{{ event.evidence_ref || event.reason || "event pending" }}</small>',
      '    </div>',
      '    <div>',
      '      <span>AgentOps Receipt</span>',
      '      <strong>{{ notification.delivery_state || "not_sent" }}</strong>',
      '      <small>{{ notification.agentops_ack_id || "ack not issued" }}</small>',
      '    </div>',
      '  </div>',
      '  <ul class="request-panel__blockers" v-if="issues.length">',
      '    <li v-for="issue in issues" :key="issue.issue_id">{{ displayLabel(issue.issue_id) }} / {{ displayLabel(issue.fix_action_id) }}</li>',
      '  </ul>',
      '  <div class="request-panel__footer">',
      '    <span>{{ boundaryLabel }}</span>',
      '    <sdlc-action-button :action="lifecycle.next_action" kind="primary" @invoke="$emit(\'invoke-action\', $event)"></sdlc-action-button>',
      '  </div>',
      '</section>'
    ].join(""),
    computed: {
      skill: function skill() {
        return this.lifecycle.skill || {};
      },
      event: function event() {
        return this.lifecycle.event || {};
      },
      notification: function notification() {
        return this.lifecycle.agentops_notification || {};
      },
      consumption: function consumption() {
        return this.lifecycle.agentops_consumption || {};
      },
      issues: function issues() {
        return Array.isArray(this.lifecycle.issues) ? this.lifecycle.issues : [];
      },
      stateTone: function stateTone() {
        if (this.lifecycle.registry_status === "published") {
          return "success";
        }
        if (this.lifecycle.registry_status === "deprecated") {
          return "warning";
        }
        if (this.lifecycle.registry_status === "security_revoked") {
          return "danger";
        }
        return "danger";
      },
      riskTone: function riskTone() {
        return this.skill.risk_level === "high" || this.skill.risk_level === "critical" ? "warning" : "info";
      },
      eventTone: function eventTone() {
        return this.event.event_type ? this.stateTone : "warning";
      },
      consumptionTone: function consumptionTone() {
        return this.consumption.notify_required ? "warning" : "neutral";
      },
      eventLabel: function eventLabel() {
        return this.event.event_type || "event_pending";
      },
      consumptionLabel: function consumptionLabel() {
        return [
          this.consumption.sync_status || "not_ready",
          this.consumption.notify_required ? "notify_required" : "notify_not_required"
        ].join(" / ");
      },
      lifecycleCopy: function lifecycleCopy() {
        if (this.lifecycle.registry_status === "published") {
          return "Skill 已由 Agent Store 发布为 registry fact；AgentOps 只消费通知与回执，不改写 Skill 记录。";
        }
        if (this.lifecycle.registry_status === "security_revoked") {
          return "Skill 已安全撤销，终态必须随 evidence ref 通知 AgentOps，不能降级回普通废弃。";
        }
        if (this.lifecycle.registry_status === "deprecated") {
          return "Skill 已废弃；Store 保留 registry fact，AgentOps ack 只证明通知已接收。";
        }
        return "Skill Registry 注册被阻断；必须回到 Owner approval 或 Package Validation，不能绕过发布门禁。";
      },
      boundaryLabel: function boundaryLabel() {
        return "Store owns Skill Registry / AgentOps ack is receipt-only / no webhook / no DB / no publish bypass";
      }
    },
    methods: {
      displayLabel: displayLabel
    }
  });

  Vue.component("sdlc-agent-manifest-runtime", {
    props: ["contract"],
    template: [
      '<section class="workspace-section agent-manifest-runtime">',
      '  <div class="section-heading">',
      '    <h2>AgentManifest Runtime</h2>',
      '    <sdlc-status-chip :label="contract.runtime_compatibility" :tone="compatibilityTone"></sdlc-status-chip>',
      '  </div>',
      '  <p class="summary">{{ manifestCopy }}</p>',
      '  <dl class="facts">',
      '    <sdlc-metric-row label="合同" :value="contract.contract_schema_version" tone="info"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Manifest" :value="summary.manifest_schema_version || \'missing\'" :tone="manifestTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Runtime" :value="summary.runtime_contract_version || \'missing\'" :tone="compatibilityTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Agent" :value="contract.agent_id || \'missing\'" tone="neutral"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Artifact" :value="contract.artifact_hash || \'missing\'" :tone="contract.artifact_hash ? \'success\' : \'warning\'"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Skills" :value="summary.skill_count" tone="neutral"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Required Caps" :value="requiredCapabilities.length" tone="info"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Missing Caps" :value="missingCapabilities.length" :tone="missingCapabilitiesTone"></sdlc-metric-row>',
      '  </dl>',
      '  <div class="agent-manifest-runtime__grid">',
      '    <div>',
      '      <span>Manifest Required Fields</span>',
      '      <strong>{{ contract.manifest_status }}</strong>',
      '      <small>{{ manifestFieldSummary }}</small>',
      '    </div>',
      '    <div>',
      '      <span>Runtime Capability Echo</span>',
      '      <strong>{{ runtimeCapabilitySummary }}</strong>',
      '      <small>{{ runtimeCapabilities.join(", ") || "probe missing" }}</small>',
      '    </div>',
      '    <div>',
      '      <span>Missing Runtime Capabilities</span>',
      '      <strong>{{ missingCapabilities.join(", ") || "none" }}</strong>',
      '      <small>{{ requiredCapabilities.join(", ") || "no requirements" }}</small>',
      '    </div>',
      '    <div>',
      '      <span>Source of Truth</span>',
      '      <strong>{{ displayLabel(sourceOfTruth.agent_manifest) }}</strong>',
      '      <small>{{ displayLabel(sourceOfTruth.runtime_availability) }} / {{ displayLabel(sourceOfTruth.policy_decision) }}</small>',
      '    </div>',
      '  </div>',
      '  <ul class="request-panel__blockers" v-if="issues.length">',
      '    <li v-for="issue in issues" :key="issue.issue_id">{{ displayLabel(issue.issue_id) }} / {{ issue.field_path }} / {{ displayLabel(issue.fix_action_id) }}</li>',
      '  </ul>',
      '  <div class="request-panel__footer">',
      '    <span>{{ boundaryLabel }}</span>',
      '    <sdlc-action-button :action="contract.next_action" kind="primary" @invoke="$emit(\'invoke-action\', $event)"></sdlc-action-button>',
      '  </div>',
      '</section>'
    ].join(""),
    computed: {
      summary: function summary() {
        return this.contract.manifest_summary || {};
      },
      sourceOfTruth: function sourceOfTruth() {
        return this.contract.source_of_truth || {};
      },
      issues: function issues() {
        return Array.isArray(this.contract.issues) ? this.contract.issues : [];
      },
      requiredCapabilities: function requiredCapabilities() {
        return Array.isArray(this.contract.required_runtime_capabilities)
          ? this.contract.required_runtime_capabilities
          : [];
      },
      runtimeCapabilities: function runtimeCapabilities() {
        return Array.isArray(this.contract.runtime_capabilities) ? this.contract.runtime_capabilities : [];
      },
      missingCapabilities: function missingCapabilities() {
        return Array.isArray(this.contract.missing_runtime_capabilities)
          ? this.contract.missing_runtime_capabilities
          : [];
      },
      missingCapabilitiesTone: function missingCapabilitiesTone() {
        if (this.missingCapabilities.length) {
          return "danger";
        }
        if (this.contract.runtime_compatibility === "runtime_unknown") {
          return "warning";
        }
        return "success";
      },
      compatibilityTone: function compatibilityTone() {
        if (this.contract.runtime_compatibility === "runtime_compatible") {
          return "success";
        }
        if (this.contract.runtime_compatibility === "runtime_unknown") {
          return "warning";
        }
        return "danger";
      },
      manifestTone: function manifestTone() {
        return this.contract.manifest_status === "complete" ? "success" : "danger";
      },
      manifestFieldSummary: function manifestFieldSummary() {
        return [
          "permissions " + (this.summary.permission_intent_count || 0),
          "data " + (this.summary.data_scope_count || 0),
          "secrets " + (this.summary.secret_ref_count || 0),
          "network " + (this.summary.network_allowlist_count || 0),
          "guardrails " + (this.summary.guardrail_ref_count || 0)
        ].join(" / ");
      },
      runtimeCapabilitySummary: function runtimeCapabilitySummary() {
        return this.runtimeCapabilities.length + " echo / " + this.requiredCapabilities.length + " required";
      },
      manifestCopy: function manifestCopy() {
        if (this.contract.manifest_status !== "complete") {
          return "AgentManifest Runtime 合同未完整，必须补齐必填字段后才能进入 Runtime availability 判断。";
        }
        if (this.contract.runtime_compatibility === "runtime_capability_missing") {
          return "AgentManifest 完整，但 Runtime echo 缺少必需能力；Store 只能展示阻断和下一步。";
        }
        if (this.contract.runtime_compatibility === "runtime_unknown") {
          return "AgentManifest 完整，但还没有 Runtime echo/probe；Store 不本地推导兼容性。";
        }
        return "AgentManifest 完整且 Runtime capability echo 满足要求，可继续 Manifest 复核。";
      },
      boundaryLabel: function boundaryLabel() {
        return "Store owns AgentManifest / Runtime echo is read-only / no Runtime execution / no Grant / no quality inference";
      }
    },
    methods: {
      displayLabel: displayLabel
    }
  });

  Vue.component("sdlc-installation-runtime-handoff", {
    props: ["handoff"],
    template: [
      '<section class="workspace-section installation-runtime-handoff">',
      '  <div class="section-heading">',
      '    <h2>Installation Runtime Handoff</h2>',
      '    <sdlc-status-chip :label="handoff.handoff_state" :tone="stateTone"></sdlc-status-chip>',
      '  </div>',
      '  <p class="summary">{{ handoff.reason }}</p>',
      '  <dl class="facts">',
      '    <sdlc-metric-row label="合同" :value="handoff.contract_schema_version" tone="info"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Handoff" :value="handoff.handoff_id || \'missing\'" :tone="stateTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="安装" :value="installation.installation_id || \'missing\'" tone="neutral"></sdlc-metric-row>',
      '    <sdlc-metric-row label="设备" :value="deviceBinding.device_id || \'missing\'" tone="neutral"></sdlc-metric-row>',
      '    <sdlc-metric-row label="包 Hash" :value="installation.artifact_hash || \'missing\'" :tone="hashTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Runtime Echo" :value="runtimeEcho.runtime_id || \'missing\'" :tone="runtimeEchoTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Runtime 可消费" :value="handoff.runtime_consumption_allowed ? \'allowed\' : \'blocked\'" :tone="handoff.runtime_consumption_allowed ? \'success\' : \'danger\'"></sdlc-metric-row>',
      '    <sdlc-metric-row label="状态" :value="handoff.display_name_zh || handoff.reason_code" :tone="stateTone"></sdlc-metric-row>',
      '  </dl>',
      '  <div class="installation-runtime-handoff__grid">',
      '    <div>',
      '      <span>Installation Fact</span>',
      '      <strong>{{ installation.installation_id || "missing" }}</strong>',
      '      <small>{{ installation.status || "missing" }} / {{ installation.enterprise_state || "missing" }}</small>',
      '    </div>',
      '    <div>',
      '      <span>Device Binding</span>',
      '      <strong>{{ deviceBinding.device_id || "missing" }}</strong>',
      '      <small>{{ deviceBinding.status || "missing" }} / {{ deviceBinding.device_public_key_thumbprint || "thumbprint missing" }}</small>',
      '    </div>',
      '    <div>',
      '      <span>Runtime Echo</span>',
      '      <strong>{{ runtimeEcho.installation_id || "echo missing" }}</strong>',
      '      <small>{{ runtimeEcho.device_id || "device echo missing" }} / {{ runtimeEcho.artifact_hash || "hash echo missing" }}</small>',
      '    </div>',
      '    <div>',
      '      <span>Source of Truth</span>',
      '      <strong>{{ displayLabel(sourceOfTruth.installation) }} / {{ displayLabel(sourceOfTruth.device_binding) }}</strong>',
      '      <small>{{ displayLabel(sourceOfTruth.runtime_consumption) }} / {{ displayLabel(sourceOfTruth.policy_decision) }}</small>',
      '    </div>',
      '  </div>',
      '  <ul class="request-panel__blockers" v-if="issues.length">',
      '    <li v-for="issue in issues" :key="issue.issue_id">{{ displayLabel(issue.issue_id) }} / {{ issue.field_path }} / {{ displayLabel(issue.fix_action_id) }}</li>',
      '  </ul>',
      '  <div class="request-panel__footer">',
      '    <span>{{ boundaryLabel }}</span>',
      '    <sdlc-action-button :action="handoff.next_action" kind="primary" @invoke="$emit(\'invoke-action\', $event)"></sdlc-action-button>',
      '  </div>',
      '</section>'
    ].join(""),
    computed: {
      installation: function installation() {
        return this.handoff.installation || {};
      },
      deviceBinding: function deviceBinding() {
        return this.handoff.device_binding || {};
      },
      runtimeEcho: function runtimeEcho() {
        return this.handoff.runtime_echo || {};
      },
      sourceOfTruth: function sourceOfTruth() {
        return this.handoff.source_of_truth || {};
      },
      issues: function issues() {
        return Array.isArray(this.handoff.issues) ? this.handoff.issues : [];
      },
      stateTone: function stateTone() {
        if (this.handoff.handoff_state === "runtime_handoff_ready") {
          return "success";
        }
        if (this.handoff.handoff_state === "installation_not_ready") {
          return "warning";
        }
        return "danger";
      },
      hashTone: function hashTone() {
        if (this.handoff.handoff_state === "artifact_hash_mismatch") {
          return "danger";
        }
        return this.installation.artifact_hash ? "success" : "warning";
      },
      runtimeEchoTone: function runtimeEchoTone() {
        if (!this.runtimeEcho.runtime_id) {
          return "warning";
        }
        return this.handoff.runtime_consumption_allowed ? "success" : "danger";
      },
      boundaryLabel: function boundaryLabel() {
        return "Store owns Installation and DeviceBinding / Runtime echo is read-only / no Runtime process / no CapabilityGrant / no PolicyDecision";
      }
    },
    methods: {
      displayLabel: displayLabel
    }
  });

  Vue.component("sdlc-listing-workbench", {
    props: ["workbench"],
    template: [
      '<section class="workspace-section workspace-section--wide listing-workbench">',
      '  <div class="section-heading">',
      '    <div><span class="eyebrow">上架工作台</span><h2>草案、审核与发布摘要</h2></div>',
      '    <sdlc-status-chip :label="workbench.listing_state" :tone="listingTone"></sdlc-status-chip>',
      '  </div>',
      '  <p class="summary">{{ workbenchCopy }}</p>',
      '  <dl class="facts listing-workbench__facts">',
      '    <sdlc-metric-row label="合同" :value="workbench.contract_schema_version" tone="info"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Owner" :value="workbench.owner_team" tone="neutral"></sdlc-metric-row>',
      '    <sdlc-metric-row label="审核队列" :value="reviewQueue.queue_state" :tone="reviewTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="回执" :value="reviewQueue.receipt_state" tone="warning"></sdlc-metric-row>',
      '  </dl>',
      '  <div class="listing-workbench__grid">',
      '    <div><span>草案</span><strong>{{ draftSummary.active_drafts }} / {{ draftSummary.fix_required }} 修复</strong><small>{{ draftSummary.ready_to_submit }} ready_to_submit</small></div>',
      '    <div><span>审核</span><strong>{{ reviewQueue.pending_review_count }} pending</strong><small>{{ reviewQueue.blocked_review_count }} blocked / {{ displayLabel(reviewQueue.sla_state) }}</small></div>',
      '    <div><span>发布</span><strong>{{ publishedVersions.latest_version || "unavailable" }}</strong><small>{{ displayLabel(publishedVersions.release_status) }} / registry write {{ displayLabel(publishedVersions.registry_write_allowed) }}</small></div>',
      '    <div><span>质量反馈</span><strong>{{ displayLabel(qualityFeedback.quality_summary_state) }}</strong><small>{{ qualityFeedback.open_feedback_count }} open / raw {{ displayLabel(qualityFeedback.raw_evidence_exposed) }}</small></div>',
      '    <div><span>安装趋势</span><strong>{{ installTrend.total_installations }} installs</strong><small>{{ installTrend.failed_installations }} failed / devices {{ displayLabel(installTrend.device_details_exposed) }}</small></div>',
      '  </div>',
      '  <ol class="listing-workbench__issues" v-if="userIssues.length">',
      '    <li v-for="issue in userIssues" :key="issue.issue_id">',
      '      <strong>{{ displayLabel(issue.issue_state) }}</strong>',
      '      <span>{{ issue.issue_id }}</span>',
      '      <small>{{ issue.source_contract }} / {{ issue.summary }}</small>',
      '    </li>',
      '  </ol>',
      '  <div class="listing-workbench__source">',
      '    <strong>事实源</strong>',
      '    <span>{{ sourceFacts }}</span>',
      '    <strong>审计</strong>',
      '    <span>{{ audit.audit_id || "unavailable" }} / {{ audit.trace_id || "unavailable" }}</span>',
      '    <strong>边界</strong>',
      '    <span>{{ boundaryText }}</span>',
      '  </div>',
      '  <sdlc-action-button :action="workbench.next_action" kind="primary" @invoke="$emit(\'invoke-action\', $event)"></sdlc-action-button>',
      '</section>'
    ].join(""),
    computed: {
      draftSummary: function draftSummary() {
        return this.workbench.draft_summary || {};
      },
      reviewQueue: function reviewQueue() {
        return this.workbench.review_queue || {};
      },
      publishedVersions: function publishedVersions() {
        return this.workbench.published_versions || {};
      },
      qualityFeedback: function qualityFeedback() {
        return this.workbench.quality_feedback || {};
      },
      installTrend: function installTrend() {
        return this.workbench.install_trend || {};
      },
      userIssues: function userIssues() {
        return Array.isArray(this.workbench.user_issues) ? this.workbench.user_issues : [];
      },
      audit: function audit() {
        return this.workbench.audit_fields || {};
      },
      sourceFacts: function sourceFacts() {
        return formatSourceOfTruth(this.workbench.source_of_truth);
      },
      boundaryText: function boundaryText() {
        return Array.isArray(this.workbench.boundary_flags)
          ? this.workbench.boundary_flags.join(" / ")
          : "";
      },
      listingTone: function listingTone() {
        if (this.workbench.listing_state === "published_active") {
          return "success";
        }
        if (
          this.workbench.listing_state === "fix_required"
          || this.workbench.listing_state === "listing_workbench_unavailable"
        ) {
          return "danger";
        }
        return "warning";
      },
      reviewTone: function reviewTone() {
        if (this.reviewQueue.queue_state === "pending_owner_review") {
          return "warning";
        }
        if (this.reviewQueue.queue_state === "empty") {
          return "success";
        }
        return "danger";
      },
      workbenchCopy: function workbenchCopy() {
        if (this.workbench.listing_state === "published_active") {
          return "listing_workbench.v1 / aggregate only / published summary / no publish execution / no registry mutation / no notification sending";
        }
        if (this.workbench.listing_state === "fix_required") {
          return "listing_workbench.v1 / validation blockers visible / no local approval / no package validation write / no raw Evidence";
        }
        if (this.workbench.listing_state === "listing_workbench_unavailable") {
          return "listing_workbench.v1 / fallback unavailable / cannot infer draft, review, published, or healthy state";
        }
        return "listing_workbench.v1 / aggregate only / no publish execution / no local approval / no registry mutation / no package validation write / no notification sending / no raw Evidence";
      }
    },
    methods: {
      displayLabel: displayLabel
    }
  });

  Vue.component("sdlc-shell", {
    props: [
      "catalog",
      "catalogTotalCount",
      "discoveryCollections",
      "discoveryStats",
      "discoveryHighlight",
      "selectedAgentId",
      "searchQuery",
      "discoveryCollection",
      "typeFilter",
      "trustFilter",
      "installabilityFilter",
      "view",
      "agentops",
      "bootstrap",
      "trustedLoop",
      "stateDecision",
      "installWorkflow",
      "installRequest",
      "recommendationDecision",
      "listingWizard",
      "packageValidationReport",
      "draftReviewSubmission",
      "skillRegistryLifecycle",
      "contractRegistryTraceability",
      "agentManifestRuntimeContract",
      "installationRuntimeHandoff",
      "runtimeAvailability",
      "healthSummaryFreshness",
      "ownerGovernanceWorkbench",
      "installationRecordsWorkbench",
      "systemSettingsWorkbench",
      "adminRiskWorkbench",
      "versionHistoryWorkbench",
      "listingWorkbench",
      "installationDistribution",
      "feedbackOwnerResponseLoop",
      "lifecycleGovernance",
      "qualityEvidenceAccess",
      "storeOpsDeepLink",
      "policyApprovalEcho",
      "managedInstallerPreview",
      "policyApprovalRequest",
      "policyApprovalReceipt",
      "notificationRouting",
      "permissionDenialAction",
      "installHandoff",
      "assertionHandoff",
      "actionFeedback"
    ],
    template: [
      '<main class="workspace">',
      '  <sdlc-enterprise-provider-meta></sdlc-enterprise-provider-meta>',
      '  <sdlc-discovery-rail',
      '    :collections="discoveryCollections"',
      '    :stats="discoveryStats"',
      '    :highlight="discoveryHighlight"',
      '    :active-collection="discoveryCollection"',
      '    @set-discovery-collection="$emit(\'set-discovery-collection\', $event)"',
      '  ></sdlc-discovery-rail>',
      '  <sdlc-agent-catalog',
      '    :catalog="catalog"',
      '    :catalog-total-count="catalogTotalCount"',
      '    :selected-agent-id="selectedAgentId"',
      '    :search-query="searchQuery"',
      '    :type-filter="typeFilter"',
      '    :trust-filter="trustFilter"',
      '    :installability-filter="installabilityFilter"',
      '    @select-agent="$emit(\'select-agent\', $event)"',
      '    @update-search="$emit(\'update-search\', $event)"',
      '    @set-type-filter="$emit(\'set-type-filter\', $event)"',
      '    @set-trust-filter="$emit(\'set-trust-filter\', $event)"',
      '    @set-installability-filter="$emit(\'set-installability-filter\', $event)"',
      '  ></sdlc-agent-catalog>',
      '  <header class="topbar">',
      '    <div>',
      '      <div class="product-mark">Agent 详情</div>',
      '      <h1>{{ view.display_name }}</h1>',
      '    </div>',
      '    <nav class="topbar__actions" aria-label="primary actions">',
      '      <sdlc-action-button :action="view.primary_action" kind="primary" @invoke="$emit(\'invoke-action\', $event)"></sdlc-action-button>',
      '      <sdlc-action-button :action="view.enterprise_activation_action" @invoke="$emit(\'invoke-action\', $event)"></sdlc-action-button>',
      '    </nav>',
      '  </header>',
      '  <sdlc-action-feedback :feedback="actionFeedback"></sdlc-action-feedback>',
      '  <div class="workspace-grid">',
      '    <sdlc-owner-governance-workbench :workbench="ownerGovernanceWorkbench" @invoke-action="$emit(\'invoke-action\', $event)"></sdlc-owner-governance-workbench>',
      '    <sdlc-installation-records-workbench :records="installationRecordsWorkbench" @invoke-action="$emit(\'invoke-action\', $event)"></sdlc-installation-records-workbench>',
      '    <sdlc-system-settings-workbench :settings="systemSettingsWorkbench" @invoke-action="$emit(\'invoke-action\', $event)"></sdlc-system-settings-workbench>',
      '    <sdlc-admin-risk-workbench :risk="adminRiskWorkbench" @invoke-action="$emit(\'invoke-action\', $event)"></sdlc-admin-risk-workbench>',
      '    <sdlc-version-history-workbench :history="versionHistoryWorkbench" @invoke-action="$emit(\'invoke-action\', $event)"></sdlc-version-history-workbench>',
      '    <sdlc-listing-workbench :workbench="listingWorkbench" @invoke-action="$emit(\'invoke-action\', $event)"></sdlc-listing-workbench>',
      '    <sdlc-recommendation-decision class="workspace-section--wide" :decision="recommendationDecision" @invoke-action="$emit(\'invoke-action\', $event)"></sdlc-recommendation-decision>',
      '    <sdlc-listing-wizard :wizard="listingWizard" @invoke-action="$emit(\'invoke-action\', $event)"></sdlc-listing-wizard>',
      '    <sdlc-package-validation-report :report="packageValidationReport" @invoke-action="$emit(\'invoke-action\', $event)"></sdlc-package-validation-report>',
      '    <sdlc-draft-review-submission :submission="draftReviewSubmission" @invoke-action="$emit(\'invoke-action\', $event)"></sdlc-draft-review-submission>',
      '    <sdlc-skill-registry-lifecycle :lifecycle="skillRegistryLifecycle" @invoke-action="$emit(\'invoke-action\', $event)"></sdlc-skill-registry-lifecycle>',
      '    <sdlc-contract-registry-traceability :traceability="contractRegistryTraceability" @invoke-action="$emit(\'invoke-action\', $event)"></sdlc-contract-registry-traceability>',
      '    <sdlc-agent-manifest-runtime :contract="agentManifestRuntimeContract" @invoke-action="$emit(\'invoke-action\', $event)"></sdlc-agent-manifest-runtime>',
      '    <sdlc-installation-runtime-handoff :handoff="installationRuntimeHandoff" @invoke-action="$emit(\'invoke-action\', $event)"></sdlc-installation-runtime-handoff>',
      '    <sdlc-runtime-availability :summary="runtimeAvailability" @invoke-action="$emit(\'invoke-action\', $event)"></sdlc-runtime-availability>',
      '    <sdlc-health-summary-freshness :summary="healthSummaryFreshness" @invoke-action="$emit(\'invoke-action\', $event)"></sdlc-health-summary-freshness>',
      '    <sdlc-installation-distribution :summary="installationDistribution" @invoke-action="$emit(\'invoke-action\', $event)"></sdlc-installation-distribution>',
      '    <sdlc-feedback-owner-response-loop :loop="feedbackOwnerResponseLoop" @invoke-action="$emit(\'invoke-action\', $event)"></sdlc-feedback-owner-response-loop>',
      '    <sdlc-lifecycle-governance :summary="lifecycleGovernance" @invoke-action="$emit(\'invoke-action\', $event)"></sdlc-lifecycle-governance>',
      '    <sdlc-quality-evidence-access :summary="qualityEvidenceAccess" @invoke-action="$emit(\'invoke-action\', $event)"></sdlc-quality-evidence-access>',
      '    <sdlc-store-ops-deep-link :link="storeOpsDeepLink" @invoke-action="$emit(\'invoke-action\', $event)"></sdlc-store-ops-deep-link>',
      '    <sdlc-policy-approval-echo :echo="policyApprovalEcho" @invoke-action="$emit(\'invoke-action\', $event)"></sdlc-policy-approval-echo>',
      '    <sdlc-managed-installer-preview :preview="managedInstallerPreview" @invoke-action="$emit(\'invoke-action\', $event)"></sdlc-managed-installer-preview>',
      '    <sdlc-policy-approval-flow :request="policyApprovalRequest" :receipt="policyApprovalReceipt" @invoke-action="$emit(\'invoke-action\', $event)"></sdlc-policy-approval-flow>',
      '    <sdlc-notification-routing :summary="notificationRouting" @invoke-action="$emit(\'invoke-action\', $event)"></sdlc-notification-routing>',
      '    <sdlc-permission-denial-action :summary="permissionDenialAction" @invoke-action="$emit(\'invoke-action\', $event)"></sdlc-permission-denial-action>',
      '    <sdlc-section title="应用事实">',
      '      <dl class="facts">',
      '        <sdlc-metric-row label="类型" :value="view.capability_type" tone="info"></sdlc-metric-row>',
      '        <sdlc-metric-row label="阶段" :value="view.maintenance.release_status" tone="warning"></sdlc-metric-row>',
      '        <sdlc-metric-row label="Owner" :value="view.maintenance.owner_team" tone="neutral"></sdlc-metric-row>',
      '        <sdlc-metric-row label="版本" :value="view.maintenance.version" tone="neutral"></sdlc-metric-row>',
      '      </dl>',
      '      <p class="summary">{{ view.summary }}</p>',
      '      <ul class="tag-list"><li v-for="item in view.use_cases" :key="item">{{ item }}</li></ul>',
      '    </sdlc-section>',
      '    <sdlc-section title="可信状态">',
      '      <dl class="facts">',
      '        <sdlc-metric-row label="L5 展示" :value="view.l5_display_state" :tone="view.actual_l5_display_allowed ? \'success\' : \'warning\'"></sdlc-metric-row>',
      '        <sdlc-metric-row label="包可信" :value="view.package_trust_summary.trust_state" :tone="packageTrustTone"></sdlc-metric-row>',
      '        <sdlc-metric-row label="签名" :value="view.package_trust_summary.signature_state" :tone="signatureTone"></sdlc-metric-row>',
      '        <sdlc-metric-row label="Hash" :value="view.package_trust_summary.hash_match_state" :tone="hashTone"></sdlc-metric-row>',
      '      </dl>',
      '      <p class="summary">未完成签名测试、违约扫描或 AgentOps 摘要同步时，只能展示待验证状态，不能展示实际 L5。</p>',
      '    </sdlc-section>',
      '    <sdlc-section title="治理加载">',
      '      <dl class="facts">',
      '        <sdlc-metric-row label="Adapter" :value="view.governance_load.adapter_state" :tone="governanceTone"></sdlc-metric-row>',
      '        <sdlc-metric-row label="验证方式" :value="view.governance_load.load_verification_method" tone="info"></sdlc-metric-row>',
      '        <sdlc-metric-row label="证据 Hash" :value="view.governance_load.evidence_hash || \'unavailable\'" tone="neutral"></sdlc-metric-row>',
      '        <sdlc-metric-row label="降级原因" :value="view.governance_load.degraded_reason || view.governance_load.unsupported_reason || \'unknown\'" tone="warning"></sdlc-metric-row>',
      '      </dl>',
      '    </sdlc-section>',
      '    <sdlc-section title="企业激活">',
      '      <dl class="facts">',
      '        <sdlc-metric-row label="步骤" :value="bootstrap.current_step" tone="info"></sdlc-metric-row>',
      '        <sdlc-metric-row label="状态" :value="bootstrap.step_status" tone="warning"></sdlc-metric-row>',
      '        <sdlc-metric-row label="诊断" :value="bootstrap.diagnostic_ref" tone="neutral"></sdlc-metric-row>',
      '      </dl>',
      '      <sdlc-bootstrap-timeline v-if="bootstrap.timeline" :timeline="bootstrap.timeline"></sdlc-bootstrap-timeline>',
      '      <sdlc-source-facts :status="bootstrap"></sdlc-source-facts>',
      '      <sdlc-remediation-actions :actions="bootstrap.recommended_actions" @invoke-action="$emit(\'invoke-action\', $event)"></sdlc-remediation-actions>',
      '      <sdlc-action-button :action="bootstrap.primary_action" kind="primary" @invoke="$emit(\'invoke-action\', $event)"></sdlc-action-button>',
      '    </sdlc-section>',
      '    <sdlc-install-workflow :workflow="installWorkflow" @invoke-action="$emit(\'invoke-action\', $event)"></sdlc-install-workflow>',
      '    <sdlc-install-request :request="installRequest" @invoke-action="$emit(\'invoke-action\', $event)"></sdlc-install-request>',
      '    <sdlc-bootstrap-handoff :handoff="installHandoff" @invoke-action="$emit(\'invoke-action\', $event)"></sdlc-bootstrap-handoff>',
      '    <sdlc-assertion-handoff :assertion="assertionHandoff" @invoke-action="$emit(\'invoke-action\', $event)"></sdlc-assertion-handoff>',
      '    <sdlc-section title="AgentOps 摘要">',
      '      <dl class="facts">',
      '        <sdlc-metric-row label="证据等级" :value="agentops.quality_evidence.evidence_level" tone="info"></sdlc-metric-row>',
      '        <sdlc-metric-row label="有效性" :value="agentops.quality_evidence.summary_validity_state" tone="warning"></sdlc-metric-row>',
      '        <sdlc-metric-row label="审批" :value="agentops.approval.status" :tone="approvalTone"></sdlc-metric-row>',
      '        <sdlc-metric-row label="策略" :value="agentops.runtime_policy.enforcement_mode" tone="neutral"></sdlc-metric-row>',
      '        <sdlc-metric-row v-if="agentops.credential_bootstrap" label="凭证" :value="agentops.credential_bootstrap.credential_status" tone="info"></sdlc-metric-row>',
      '        <sdlc-metric-row v-if="agentops.credential_bootstrap" label="Reporter" :value="agentops.credential_bootstrap.reporter_status" tone="warning"></sdlc-metric-row>',
      '      </dl>',
      '      <p class="summary" v-if="agentops.credential_bootstrap">凭证已签发不等于完成激活；Reporter 签名测试通过后，才能由 AgentOps 回显实际可信状态。</p>',
      '      <div class="link-row" v-for="link in agentops.links" :key="link.rel">',
      '        <span>{{ link.rel }}</span><a :href="link.href">{{ link.target_system }}</a>',
      '      </div>',
      '    </sdlc-section>',
      '    <sdlc-section title="证据闭环">',
      '      <dl class="facts">',
      '        <sdlc-metric-row label="Trusted Loop" :value="trustedLoop.trusted_loop_verified ? \'verified\' : \'blocked\'" :tone="trustedLoop.trusted_loop_verified ? \'success\' : \'danger\'"></sdlc-metric-row>',
      '        <sdlc-metric-row label="Actual L5" :value="trustedLoop.actual_l5_display_allowed ? \'allowed\' : \'blocked\'" :tone="trustedLoop.actual_l5_display_allowed ? \'success\' : \'warning\'"></sdlc-metric-row>',
      '        <sdlc-metric-row label="状态裁决" :value="stateDecision.state" :tone="stateDecisionTone"></sdlc-metric-row>',
      '      </dl>',
      '      <ol class="ref-list"><li v-for="ref in trustedLoop.checked_refs" :key="ref">{{ ref }}</li></ol>',
      '    </sdlc-section>',
      '    <sdlc-section title="角色与可访问性">',
      '      <ul class="tag-list"><li v-for="section in view.role_visible_sections" :key="section">{{ section }}</li></ul>',
      '      <p class="summary">{{ view.accessibility_contract.status_live_update.message_key }}</p>',
      '    </sdlc-section>',
      '  </div>',
      '</main>'
    ].join(""),
    computed: {
      packageTrustTone: function packageTrustTone() {
        if (this.view.package_trust_summary.trust_state === "trusted") {
          return "success";
        }
        if (this.view.package_trust_summary.trust_state === "warning") {
          return "warning";
        }
        return "danger";
      },
      signatureTone: function signatureTone() {
        if (this.view.package_trust_summary.signature_state === "verified") {
          return "success";
        }
        if (this.view.package_trust_summary.signature_state === "unknown") {
          return "warning";
        }
        return "danger";
      },
      hashTone: function hashTone() {
        if (this.view.package_trust_summary.hash_match_state === "matched") {
          return "success";
        }
        if (this.view.package_trust_summary.hash_match_state === "unknown") {
          return "warning";
        }
        return "danger";
      },
      approvalTone: function approvalTone() {
        if (this.agentops.approval.status === "approved") {
          return "success";
        }
        if (this.agentops.approval.status === "pending") {
          return "warning";
        }
        return "danger";
      },
      governanceTone: function governanceTone() {
        if (this.view.governance_load.adapter_state === "verified_loaded") {
          return "success";
        }
        if (this.view.governance_load.adapter_state === "materialized") {
          return "warning";
        }
        return "danger";
      },
      stateDecisionTone: function stateDecisionTone() {
        if (["blocked", "degraded", "empty"].indexOf(this.stateDecision.state) >= 0) {
          return "danger";
        }
        if (this.stateDecision.state === "ready") {
          return "success";
        }
        return "warning";
      }
    }
  });
})(window.Vue);
