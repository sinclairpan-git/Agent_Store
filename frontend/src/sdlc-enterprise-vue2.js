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
    catalog_filter: "目录筛选"
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
    return DISPLAY_LABELS[value] || value;
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
      '    <sdlc-metric-row label="事实源" :value="decision.source_of_truth" tone="info"></sdlc-metric-row>',
      '    <sdlc-metric-row label="Trace" :value="decision.trace_id" tone="neutral"></sdlc-metric-row>',
      '    <sdlc-metric-row label="审计" :value="decision.audit_id" tone="warning"></sdlc-metric-row>',
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
          .concat(this.decision.trust_blockers || [])));
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
