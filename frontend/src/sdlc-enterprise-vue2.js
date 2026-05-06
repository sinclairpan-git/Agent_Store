(function registerSdlcEnterpriseVue2(Vue) {
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
      '<section class="workspace-section">',
      '  <h2>{{ title }}</h2>',
      '  <slot></slot>',
      '</section>'
    ].join("")
  });

  Vue.component("sdlc-shell", {
    props: ["view", "agentops", "bootstrap", "trustedLoop", "stateDecision"],
    template: [
      '<main class="workspace">',
      '  <header class="topbar">',
      '    <div>',
      '      <div class="product-mark">Agent Store</div>',
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
      '        <sdlc-metric-row label="包可信" :value="view.package_trust_summary.trust_state" tone="success"></sdlc-metric-row>',
      '        <sdlc-metric-row label="签名" :value="view.package_trust_summary.signature_state" tone="success"></sdlc-metric-row>',
      '        <sdlc-metric-row label="Hash" :value="view.package_trust_summary.hash_match_state" tone="success"></sdlc-metric-row>',
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
      '    <sdlc-section title="AgentOps 摘要">',
      '      <dl class="facts">',
      '        <sdlc-metric-row label="证据等级" :value="agentops.quality_evidence.evidence_level" tone="info"></sdlc-metric-row>',
      '        <sdlc-metric-row label="有效性" :value="agentops.quality_evidence.summary_validity_state" tone="warning"></sdlc-metric-row>',
      '        <sdlc-metric-row label="审批" :value="agentops.approval.status" tone="success"></sdlc-metric-row>',
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
      '        <sdlc-metric-row label="状态裁决" :value="stateDecision.state" :tone="stateDecision.state === \'degraded\' ? \'danger\' : \'success\'"></sdlc-metric-row>',
      '      </dl>',
      '      <ol class="ref-list"><li v-for="ref in trustedLoop.checked_refs" :key="ref">{{ ref }}</li></ol>',
      '    </sdlc-section>',
      '    <sdlc-section title="角色与可访问性">',
      '      <ul class="tag-list"><li v-for="section in view.role_visible_sections" :key="section">{{ section }}</li></ul>',
      '      <p class="summary">{{ view.accessibility_contract.status_live_update.message_key }}</p>',
      '    </sdlc-section>',
      '  </div>',
      '</main>'
    ].join("")
  });
})(window.Vue);
