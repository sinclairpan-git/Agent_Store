function shellQuoteToken(value) {
  var token = String(value);
  if (/^[A-Za-z0-9_@%+=:,./-]+$/.test(token)) {
    return token;
  }
  return "'" + token.replace(/'/g, "'\"'\"'") + "'";
}

function safeId(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "agent";
}

function buildRequestIdentity(agentId, actionId) {
  var safeAgentId = safeId(agentId);
  var safeActionId = safeId(actionId);
  return {
    request_id: "req-" + safeAgentId + "-" + safeActionId,
    audit_id: "audit-" + safeAgentId + "-" + safeActionId
  };
}

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
      return this.filteredCatalog.find(function findAgent(agent) {
        return agent.agent_id === this.selectedAgentId;
      }, this) || this.filteredCatalog[0] || null;
    },
    activeSelectedAgentId: function activeSelectedAgentId() {
      return this.selectedAgent ? this.selectedAgent.agent_id : null;
    },
    selectedView: function selectedView() {
      var agent = this.selectedAgent;
      if (!agent) {
        return Object.assign({}, this.view, {
          display_name: "未选择 Agent",
          summary: "当前筛选条件下没有可选 Agent。",
          use_cases: [],
          capability_type: "empty",
          actual_l5_display_allowed: false,
          l5_display_state: "not_applicable",
          primary_action: {
            action_id: "adjust_catalog_filters",
            target_system: "agent_store",
            enabled: false,
            href: "#"
          },
          enterprise_activation_action: {
            action_id: "request_enterprise_activation",
            target_system: "agent_store",
            enabled: false,
            href: "#"
          },
          maintenance: {
            owner_team: "-",
            owner_user: "-",
            version: "-",
            release_status: "not_applicable"
          },
          package_trust_summary: {
            package_id: "-",
            trust_state: "unknown",
            signature_state: "unknown",
            hash_match_state: "unknown",
            issuer_display: "Agent Store"
          },
          enterprise_context: {
            integration_mode: "standalone",
            enterprise_state: "not_detected",
            source: "catalog_filter",
            can_ignore: true,
            affected_actions: [],
            requires_enterprise: false
          },
          role_visible_sections: [],
          accessibility_contract: this.view.accessibility_contract
        });
      }
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
      if (!this.selectedAgent) {
        return {
          installation_id: "not-applicable",
          bootstrap_status: "not_applicable",
          current_step: "adjust_catalog_filters",
          step_status: "empty",
          next_poll_after: 0,
          retryable: false,
          diagnostic_ref: "catalog-empty-filter",
          primary_action: this.selectedView.primary_action
        };
      }
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
      if (!this.selectedAgent) {
        return {
          trace_id: "trace-catalog-empty-filter",
          quality_evidence: {
            evidence_level: "not_applicable",
            summary_validity_state: "not_applicable",
            confidence: 0,
            missing_evidence: [],
            score_template_id: "agentops-empty-filter"
          },
          approval: {
            approval_id: "approval-empty-filter",
            status: "not_applicable",
            audit_id: "audit-empty-filter"
          },
          runtime_policy: {
            policy_ref: "policy-empty-filter",
            fallback_action: "adjust_filters",
            runtime_risk_level: "none",
            enforcement_mode: "none"
          },
          links: []
        };
      }
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
      if (!this.selectedAgent) {
        return {
          trusted_loop_verified: false,
          actual_l5_display_allowed: false,
          checked_refs: ["catalog-empty-filter"]
        };
      }
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
      if (!this.selectedAgent) {
        return {
          state: "empty",
          degraded_reason: "catalog_filters_returned_no_agents"
        };
      }
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
      var coordinate;
      if (!agent) {
        return {
          workflow_state: "empty",
          audit_id: "audit-empty-filter",
          command_preview: "",
          primary_action: this.selectedView.primary_action,
          steps: [
            {
              step_id: "adjust_catalog_filters",
              label: "调整筛选条件后选择 Agent",
              state: "ready",
              owner_system: "agent_store"
            }
          ]
        };
      }
      coordinate = shellQuoteToken(agent.agent_id + "@" + agent.version);
      if (agent.installability === "installable") {
        return {
          workflow_state: "ready_to_install",
          audit_id: "audit-" + agent.agent_id,
          command_preview: "agent-store install " + coordinate,
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
          command_preview: "agent-store activate " + coordinate + " --enterprise",
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
      if (agent.installability === "standalone_only") {
        return {
          workflow_state: "standalone_only",
          audit_id: "audit-" + agent.agent_id,
          command_preview: "agent-store open " + coordinate + " --standalone",
          primary_action: {
            action_id: "open_standalone_readme",
            target_system: "agent_store",
            enabled: true,
            href: "#standalone-" + agent.agent_id
          },
          steps: [
            {
              step_id: "verify_standalone_boundary",
              label: "确认 standalone 边界不依赖 enterprise installation",
              state: "ready",
              owner_system: "agent_store"
            },
            {
              step_id: "open_standalone_path",
              label: "打开 standalone 使用说明",
              state: "ready",
              owner_system: "agent_store"
            },
            {
              step_id: "keep_enterprise_optional",
              label: "企业接入保持可选，不阻断 standalone 使用",
              state: "pending",
              owner_system: "agent_store"
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
    },
    selectedInstallationRequest: function selectedInstallationRequest() {
      var agent = this.selectedAgent;
      var coordinate;
      var requestIdentity;
      if (!agent) {
        return {
          request_id: "req-empty-filter",
          agent_coordinate: "not-applicable",
          requested_action_id: "adjust_catalog_filters",
          request_state: "empty",
          queue: "catalog_filter",
          owner_system: "agent_store",
          audit_id: "audit-empty-filter",
          requested_by: "current-user",
          next_action: this.selectedView.primary_action,
          blockers: ["catalog_filters_returned_no_agents"]
        };
      }
      coordinate = agent.agent_id + "@" + agent.version;
      if (agent.installability === "installable") {
        requestIdentity = buildRequestIdentity(agent.agent_id, "start_install");
        return {
          request_id: requestIdentity.request_id,
          agent_coordinate: coordinate,
          requested_action_id: "start_install",
          request_state: "accepted",
          queue: "installation_bootstrap",
          owner_system: "agent_store",
          audit_id: requestIdentity.audit_id,
          requested_by: "current-user",
          command_preview: "agent-store install " + shellQuoteToken(coordinate),
          next_action: {
            action_id: "create_installation",
            target_system: "agent_store",
            enabled: true,
            href: "#create-installation-" + agent.agent_id
          },
          blockers: []
        };
      }
      if (agent.installability === "activation_required") {
        requestIdentity = buildRequestIdentity(agent.agent_id, "start_enterprise_activation");
        return {
          request_id: requestIdentity.request_id,
          agent_coordinate: coordinate,
          requested_action_id: "start_enterprise_activation",
          request_state: "pending_enterprise_activation",
          queue: "enterprise_activation",
          owner_system: "agentops",
          audit_id: requestIdentity.audit_id,
          requested_by: "current-user",
          command_preview: "agent-store activate " + shellQuoteToken(coordinate) + " --enterprise",
          next_action: {
            action_id: "issue_reporter_credential",
            target_system: "agentops",
            enabled: true,
            href: "#agentops-activation-" + agent.agent_id
          },
          blockers: []
        };
      }
      if (agent.installability === "standalone_only") {
        requestIdentity = buildRequestIdentity(agent.agent_id, "open_standalone_readme");
        return {
          request_id: requestIdentity.request_id,
          agent_coordinate: coordinate,
          requested_action_id: "open_standalone_readme",
          request_state: "standalone_ready",
          queue: "standalone_access",
          owner_system: "agent_store",
          audit_id: requestIdentity.audit_id,
          requested_by: "current-user",
          command_preview: "agent-store open " + shellQuoteToken(coordinate) + " --standalone",
          next_action: {
            action_id: "open_standalone_readme",
            target_system: "agent_store",
            enabled: true,
            href: "#standalone-" + agent.agent_id
          },
          blockers: []
        };
      }
      requestIdentity = buildRequestIdentity(agent.agent_id, "request_catalog_review");
      return {
        request_id: requestIdentity.request_id,
        agent_coordinate: coordinate,
        requested_action_id: "request_catalog_review",
        request_state: "pending_catalog_review",
        queue: "catalog_review",
        owner_system: "security",
        audit_id: requestIdentity.audit_id,
        requested_by: "current-user",
        next_action: {
          action_id: "review_catalog_blocker",
          target_system: "agent_store",
          enabled: true,
          href: "#review-catalog-blocker-" + agent.agent_id
        },
        blockers: [
          agent.trust_state,
          agent.enterprise_state,
          agent.installability
        ]
      };
    },
    selectedBootstrapHandoff: function selectedBootstrapHandoff() {
      var agent = this.selectedAgent;
      var request = this.selectedInstallationRequest;
      if (!agent) {
        return {
          handoff_state: "empty",
          request_id: request.request_id,
          audit_id: request.audit_id,
          idempotency_key: "not-applicable",
          device_os: "not-applicable",
          installation_id: "not-applicable",
          next_action: this.selectedView.primary_action
        };
      }
      if (request.request_state === "accepted") {
        return {
          handoff_state: "ready_to_create",
          request_id: request.request_id,
          audit_id: request.audit_id,
          idempotency_key: request.request_id,
          device_os: "macOS",
          device_public_key_thumbprint: "thumb-" + safeId(agent.agent_id),
          installation_id: "pending-bootstrap-create",
          next_action: {
            action_id: "create_installation_from_request",
            target_system: "agent_store",
            enabled: true,
            href: "#handoff-" + request.request_id
          }
        };
      }
      return {
        handoff_state: "waiting_for_" + request.queue,
        request_id: request.request_id,
        audit_id: request.audit_id,
        idempotency_key: "blocked-until-" + safeId(request.request_state),
        device_os: "not-started",
        installation_id: "not-created",
        next_action: request.next_action
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
