new window.Vue({
  el: "#app",
  data: function data() {
    return {
      catalog: window.AgentStoreMock.agentCatalog,
      selectedAgentId: "framework.ai-autosdlc",
      searchQuery: "",
      typeFilter: "all",
      trustFilter: "all",
      installabilityFilter: "all",
      view: window.AgentStoreMock.officialView,
      bootstrap: window.AgentStoreMock.bootstrap,
      agentops: window.AgentStoreMock.agentops,
      trustedLoop: window.AgentStoreMock.trustedLoop,
      stateDecision: window.AgentStoreMock.stateDecision
    };
  },
  computed: {
    filteredCatalog: function filteredCatalog() {
      return this.catalog.filter(function matches(agent) {
        var query = this.searchQuery.trim().toLowerCase();
        var text = [
          agent.agent_id,
          agent.display_name,
          agent.summary,
          agent.owner_team,
          agent.capability_type
        ].join(" ").toLowerCase();
        if (query && text.indexOf(query) === -1) {
          return false;
        }
        if (this.typeFilter !== "all" && agent.agent_type !== this.typeFilter) {
          return false;
        }
        if (this.trustFilter !== "all" && agent.trust_state !== this.trustFilter) {
          return false;
        }
        if (
          this.installabilityFilter !== "all"
          && agent.installability !== this.installabilityFilter
        ) {
          return false;
        }
        return true;
      }, this);
    },
    selectedAgent: function selectedAgent() {
      return this.catalog.find(function findAgent(agent) {
        return agent.agent_id === this.selectedAgentId;
      }, this) || this.catalog[0];
    },
    selectedView: function selectedView() {
      var agent = this.selectedAgent;
      var isOfficialSdlc = agent.agent_id === "framework.ai-autosdlc";
      if (isOfficialSdlc) {
        return this.view;
      }
      return Object.assign({}, this.view, {
        display_name: agent.display_name,
        summary: agent.summary,
        use_cases: agent.use_cases,
        capability_type: agent.capability_type,
        actual_l5_display_allowed: false,
        l5_display_state: agent.evidence_level === "pending"
          ? "evidence_pending"
          : "l5_capable_pending_verification",
        primary_action: agent.primary_action,
        enterprise_activation_action: {
          action_id: "request_enterprise_activation",
          target_system: "agent_store",
          enabled: agent.installability === "activation_required",
          href: "#activation-" + agent.agent_id
        },
        maintenance: {
          owner_team: agent.owner_team,
          owner_user: agent.owner_user,
          version: agent.version,
          release_status: agent.release_status
        },
        package_trust_summary: {
          package_id: agent.agent_id + "@" + agent.version,
          trust_state: agent.trust_state,
          signature_state: agent.trust_state === "trusted" ? "verified" : "missing",
          hash_match_state: agent.trust_state === "trusted" ? "matched" : "unknown",
          issuer_display: "Agent Store"
        },
        enterprise_context: {
          integration_mode: "enterprise_managed",
          enterprise_state: agent.enterprise_state,
          source: "catalog_summary",
          can_ignore: agent.installability !== "blocked",
          affected_actions: ["install", "activation"],
          requires_enterprise: agent.installability !== "standalone_only"
        }
      });
    },
    selectedBootstrap: function selectedBootstrap() {
      if (this.selectedAgent.agent_id === "framework.ai-autosdlc") {
        return this.bootstrap;
      }
      return {
        installation_id: "not-started",
        bootstrap_status: "not_started",
        current_step: "select_install_path",
        step_status: this.selectedAgent.installability,
        next_poll_after: 0,
        retryable: this.selectedAgent.installability !== "blocked",
        diagnostic_ref: "catalog-" + this.selectedAgent.agent_id,
        primary_action: this.selectedAgent.primary_action
      };
    },
    selectedAgentops: function selectedAgentops() {
      if (this.selectedAgent.agent_id === "framework.ai-autosdlc") {
        return this.agentops;
      }
      return {
        trace_id: "trace-" + this.selectedAgent.agent_id,
        quality_evidence: {
          evidence_level: this.selectedAgent.evidence_level,
          summary_validity_state: this.selectedAgent.evidence_level === "pending" ? "missing" : "fresh",
          confidence: this.selectedAgent.trust_state === "trusted" ? 0.82 : 0.35,
          missing_evidence: this.selectedAgent.trust_state === "trusted" ? [] : ["signature", "run_summary"],
          score_template_id: "agentops-owned"
        },
        approval: {
          approval_id: "approval-" + this.selectedAgent.agent_id,
          status: this.selectedAgent.trust_state === "blocked" ? "blocked" : "pending",
          audit_id: "audit-" + this.selectedAgent.agent_id
        },
        runtime_policy: {
          policy_ref: "policy-" + this.selectedAgent.agent_id,
          fallback_action: "request_review",
          runtime_risk_level: this.selectedAgent.trust_state === "blocked" ? "high" : "medium",
          enforcement_mode: this.selectedAgent.trust_state === "trusted" ? "warn" : "block"
        },
        links: [
          {
            rel: "request_review",
            target_system: "agentops",
            href: "#review-" + this.selectedAgent.agent_id,
            trace_id: "trace-" + this.selectedAgent.agent_id
          }
        ]
      };
    },
    selectedTrustedLoop: function selectedTrustedLoop() {
      if (this.selectedAgent.agent_id === "framework.ai-autosdlc") {
        return this.trustedLoop;
      }
      return {
        trusted_loop_verified: this.selectedAgent.trust_state === "trusted",
        actual_l5_display_allowed: false,
        checked_refs: [
          this.selectedAgent.agent_id,
          this.selectedAgent.version,
          this.selectedAgent.trust_state,
          this.selectedAgent.enterprise_state
        ]
      };
    },
    selectedStateDecision: function selectedStateDecision() {
      if (this.selectedAgent.agent_id === "framework.ai-autosdlc") {
        return this.stateDecision;
      }
      return {
        state: this.selectedAgent.installability === "blocked" ? "blocked" : "degraded",
        degraded_reason: "catalog_summary_requires_runtime_verification"
      };
    },
    selectedInstallWorkflow: function selectedInstallWorkflow() {
      var agent = this.selectedAgent;
      if (agent.installability === "installable") {
        return {
          workflow_state: "ready_to_install",
          audit_id: "audit-" + agent.agent_id,
          command_preview: "agent-store install " + agent.agent_id + "@" + agent.version,
          primary_action: agent.primary_action,
          steps: [
            {
              step_id: "verify_package",
              label: "校验包签名与 hash",
              state: "ready",
              owner_system: "agent_store"
            },
            {
              step_id: "create_installation",
              label: "创建 installation 与 device binding",
              state: "ready",
              owner_system: "agent_store"
            },
            {
              step_id: "issue_assertion",
              label: "签发安装断言",
              state: "pending",
              owner_system: "agent_store"
            },
            {
              step_id: "sync_agentops",
              label: "等待 AgentOps 证据同步",
              state: "pending",
              owner_system: "agentops"
            }
          ]
        };
      }
      if (agent.installability === "activation_required") {
        return {
          workflow_state: "activation_required",
          audit_id: "audit-" + agent.agent_id,
          command_preview: "agent-store activate " + agent.agent_id + "@" + agent.version + " --enterprise",
          primary_action: agent.primary_action,
          steps: [
            {
              step_id: "confirm_enterprise_policy",
              label: "确认企业策略要求",
              state: "ready",
              owner_system: "agent_store"
            },
            {
              step_id: "start_activation",
              label: "生成企业激活命令",
              state: "ready",
              owner_system: "agent_store"
            },
            {
              step_id: "issue_reporter_credential",
              label: "签发 Reporter credential",
              state: "pending",
              owner_system: "agentops"
            },
            {
              step_id: "verify_signature_test",
              label: "完成签名测试事件",
              state: "pending",
              owner_system: "agentops"
            }
          ]
        };
      }
      return {
        workflow_state: "blocked",
        audit_id: "audit-" + agent.agent_id,
        command_preview: "",
        primary_action: {
          action_id: "view_blocking_policy",
          target_system: "agent_store",
          enabled: true,
          href: "#blocked-" + agent.agent_id
        },
        recovery_action: {
          action_id: "request_catalog_review",
          target_system: "agent_store",
          enabled: true,
          href: "#request-review-" + agent.agent_id
        },
        steps: [
          {
            step_id: "blocked_by_policy",
            label: "策略或可信状态阻断",
            state: "blocked",
            owner_system: "agent_store"
          },
          {
            step_id: "request_review",
            label: "申请 Owner / Security 复核",
            state: "ready",
            owner_system: "agent_store"
          }
        ]
      };
    }
  },
  methods: {
    selectAgent: function selectAgent(agent) {
      this.selectedAgentId = agent.agent_id;
    },
    updateSearch: function updateSearch(value) {
      this.searchQuery = value;
    },
    setTypeFilter: function setTypeFilter(value) {
      this.typeFilter = value;
    },
    setTrustFilter: function setTrustFilter(value) {
      this.trustFilter = value;
    },
    setInstallabilityFilter: function setInstallabilityFilter(value) {
      this.installabilityFilter = value;
    }
  }
});
