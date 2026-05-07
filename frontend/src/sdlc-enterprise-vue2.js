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
    template: '<span class="status-chip" :class="toneClass">{{ label }}</span>',
    computed: {
      toneClass: function toneClass() {
        return "status-chip--" + (this.tone || "neutral");
      }
    }
  });

  Vue.component("sdlc-action-button", {
    props: ["action", "kind"],
    template: [
      '<a class="action-button" :class="kindClass" :href="actionHref"',
      ' :aria-disabled="disabled" :tabindex="disabled ? -1 : null"',
      ' @click="guardDisabled" @keydown.enter="guardDisabled">',
      '  <span class="action-button__icon" aria-hidden="true">{{ icon }}</span>',
      '  <span>{{ action.action_id }}</span>',
      '</a>'
    ].join(""),
    computed: {
      disabled: function disabled() {
        return this.action.enabled === false;
      },
      actionHref: function actionHref() {
        if (this.disabled) {
          return null;
        }
        return this.action.href || "#";
      },
      kindClass: function kindClass() {
        return "action-button--" + (this.kind || "secondary");
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
      guardDisabled: function guardDisabled(event) {
        if (this.disabled) {
          event.preventDefault();
          event.stopPropagation();
        }
      }
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
      '    <sdlc-metric-row label="企业状态" :value="agent.enterprise_state" :tone="enterpriseTone"></sdlc-metric-row>',
      '    <sdlc-metric-row label="证据" :value="agent.evidence_level" tone="info"></sdlc-metric-row>',
      '  </dl>',
      '  <div class="agent-card__footer">',
      '    <span>{{ agent.owner_team }}</span>',
      '    <sdlc-action-button :action="agent.primary_action" :kind="active ? \'primary\' : \'secondary\'"></sdlc-action-button>',
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
      }
    }
  });

  Vue.component("sdlc-agent-catalog", {
    props: [
      "catalog",
      "catalogTotalCount",
      "selectedAgentId",
      "searchQuery",
      "typeFilter",
      "trustFilter",
      "installabilityFilter"
    ],
    template: [
      '<section class="catalog-band" aria-labelledby="catalog-title">',
      '  <div class="catalog-heading">',
      '    <div>',
      '      <div class="product-mark">Agent Store</div>',
      '      <h1 id="catalog-title">Agent 应用列表</h1>',
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
      '      <button type="button" :class="{ active: typeFilter === \'framework_capability\' }" @click="$emit(\'set-type-filter\', \'framework_capability\')">Framework</button>',
      '      <button type="button" :class="{ active: typeFilter === \'agent\' }" @click="$emit(\'set-type-filter\', \'agent\')">Agent</button>',
      '      <button type="button" :class="{ active: typeFilter === \'skill\' }" @click="$emit(\'set-type-filter\', \'skill\')">Skill</button>',
      '    </div>',
      '    <div class="filter-group" aria-label="可信状态筛选">',
      '      <button type="button" :class="{ active: trustFilter === \'all\' }" @click="$emit(\'set-trust-filter\', \'all\')">可信全部</button>',
      '      <button type="button" :class="{ active: trustFilter === \'trusted\' }" @click="$emit(\'set-trust-filter\', \'trusted\')">trusted</button>',
      '      <button type="button" :class="{ active: trustFilter === \'warning\' }" @click="$emit(\'set-trust-filter\', \'warning\')">warning</button>',
      '      <button type="button" :class="{ active: trustFilter === \'blocked\' }" @click="$emit(\'set-trust-filter\', \'blocked\')">blocked</button>',
      '    </div>',
      '    <div class="filter-group" aria-label="安装状态筛选">',
      '      <button type="button" :class="{ active: installabilityFilter === \'all\' }" @click="$emit(\'set-installability-filter\', \'all\')">安装全部</button>',
      '      <button type="button" :class="{ active: installabilityFilter === \'installable\' }" @click="$emit(\'set-installability-filter\', \'installable\')">installable</button>',
      '      <button type="button" :class="{ active: installabilityFilter === \'activation_required\' }" @click="$emit(\'set-installability-filter\', \'activation_required\')">activation</button>',
      '      <button type="button" :class="{ active: installabilityFilter === \'standalone_only\' }" @click="$emit(\'set-installability-filter\', \'standalone_only\')">standalone</button>',
      '      <button type="button" :class="{ active: installabilityFilter === \'blocked\' }" @click="$emit(\'set-installability-filter\', \'blocked\')">blocked</button>',
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
      '      <span class="workflow-step__state">{{ step.state }}</span>',
      '      <span class="workflow-step__label">{{ step.label }}</span>',
      '      <span class="workflow-step__owner">{{ step.owner_system }}</span>',
      '    </li>',
      '  </ol>',
      '  <div class="install-panel__footer">',
      '    <span>audit: {{ workflow.audit_id }}</span>',
      '    <div class="install-panel__actions">',
      '      <sdlc-action-button :action="workflow.primary_action" kind="primary"></sdlc-action-button>',
      '      <sdlc-action-button v-if="workflow.recovery_action" :action="workflow.recovery_action"></sdlc-action-button>',
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
      '    <li v-for="blocker in request.blockers" :key="blocker">{{ blocker }}</li>',
      '  </ul>',
      '  <div class="request-panel__footer">',
      '    <span>下一步</span>',
      '    <sdlc-action-button :action="request.next_action" kind="primary"></sdlc-action-button>',
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

  Vue.component("sdlc-shell", {
    props: [
      "catalog",
      "catalogTotalCount",
      "selectedAgentId",
      "searchQuery",
      "typeFilter",
      "trustFilter",
      "installabilityFilter",
      "view",
      "agentops",
      "bootstrap",
      "trustedLoop",
      "stateDecision",
      "installWorkflow",
      "installRequest"
    ],
    template: [
      '<main class="workspace">',
      '  <sdlc-enterprise-provider-meta></sdlc-enterprise-provider-meta>',
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
      '      <div class="product-mark">官方详情</div>',
      '      <h1>{{ view.display_name }}</h1>',
      '    </div>',
      '    <nav class="topbar__actions" aria-label="primary actions">',
      '      <sdlc-action-button :action="view.primary_action" kind="primary"></sdlc-action-button>',
      '      <sdlc-action-button :action="view.enterprise_activation_action"></sdlc-action-button>',
      '    </nav>',
      '  </header>',
      '  <div class="workspace-grid">',
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
      '    </sdlc-section>',
      '    <sdlc-section title="企业激活">',
      '      <dl class="facts">',
      '        <sdlc-metric-row label="步骤" :value="bootstrap.current_step" tone="info"></sdlc-metric-row>',
      '        <sdlc-metric-row label="状态" :value="bootstrap.step_status" tone="warning"></sdlc-metric-row>',
      '        <sdlc-metric-row label="诊断" :value="bootstrap.diagnostic_ref" tone="neutral"></sdlc-metric-row>',
      '      </dl>',
      '      <sdlc-action-button :action="bootstrap.primary_action" kind="primary"></sdlc-action-button>',
      '    </sdlc-section>',
      '    <sdlc-install-workflow :workflow="installWorkflow"></sdlc-install-workflow>',
      '    <sdlc-install-request :request="installRequest"></sdlc-install-request>',
      '    <sdlc-section title="AgentOps 摘要">',
      '      <dl class="facts">',
      '        <sdlc-metric-row label="证据等级" :value="agentops.quality_evidence.evidence_level" tone="info"></sdlc-metric-row>',
      '        <sdlc-metric-row label="有效性" :value="agentops.quality_evidence.summary_validity_state" tone="warning"></sdlc-metric-row>',
      '        <sdlc-metric-row label="审批" :value="agentops.approval.status" :tone="approvalTone"></sdlc-metric-row>',
      '        <sdlc-metric-row label="策略" :value="agentops.runtime_policy.enforcement_mode" tone="neutral"></sdlc-metric-row>',
      '      </dl>',
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
