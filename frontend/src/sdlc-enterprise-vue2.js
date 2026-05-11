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
    continue_listing_review: "继续上架审核",
    confirm_listing_fields: "确认上架字段",
    prepare_draft_review_submission: "准备草案提交",
    resolve_runtime_gate: "处理 Runtime Gate",
    return_to_field_confirmation: "返回字段确认",
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
    detail_preview: "详情预览",
    selected: "已选择",
    confirmed: "已确认",
    needs_owner_input: "需 Owner 确认",
    validation_failed: "校验失败",
    passed: "已通过",
    not_submitted_until_027: "026 不提交审核",
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
      "runtimeAvailability",
      "healthSummaryFreshness",
      "installationDistribution",
      "feedbackOwnerResponseLoop",
      "lifecycleGovernance",
      "qualityEvidenceAccess",
      "storeOpsDeepLink",
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
      '    <sdlc-recommendation-decision class="workspace-section--wide" :decision="recommendationDecision" @invoke-action="$emit(\'invoke-action\', $event)"></sdlc-recommendation-decision>',
      '    <sdlc-listing-wizard :wizard="listingWizard" @invoke-action="$emit(\'invoke-action\', $event)"></sdlc-listing-wizard>',
      '    <sdlc-runtime-availability :summary="runtimeAvailability" @invoke-action="$emit(\'invoke-action\', $event)"></sdlc-runtime-availability>',
      '    <sdlc-health-summary-freshness :summary="healthSummaryFreshness" @invoke-action="$emit(\'invoke-action\', $event)"></sdlc-health-summary-freshness>',
      '    <sdlc-installation-distribution :summary="installationDistribution" @invoke-action="$emit(\'invoke-action\', $event)"></sdlc-installation-distribution>',
      '    <sdlc-feedback-owner-response-loop :loop="feedbackOwnerResponseLoop" @invoke-action="$emit(\'invoke-action\', $event)"></sdlc-feedback-owner-response-loop>',
      '    <sdlc-lifecycle-governance :summary="lifecycleGovernance" @invoke-action="$emit(\'invoke-action\', $event)"></sdlc-lifecycle-governance>',
      '    <sdlc-quality-evidence-access :summary="qualityEvidenceAccess" @invoke-action="$emit(\'invoke-action\', $event)"></sdlc-quality-evidence-access>',
      '    <sdlc-store-ops-deep-link :link="storeOpsDeepLink" @invoke-action="$emit(\'invoke-action\', $event)"></sdlc-store-ops-deep-link>',
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
