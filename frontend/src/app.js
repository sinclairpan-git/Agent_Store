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

function hasCreatedInstallation(handoff) {
  return Boolean(
    handoff
      && (
        handoff.handoff_state === "installation_created"
        || (
          handoff.installation_id
          && handoff.installation_id.indexOf("inst-") === 0
        )
      )
  );
}

function buildRequestIdentity(agentId, actionId) {
  var safeAgentId = safeId(agentId);
  var safeActionId = safeId(actionId);
  return {
    request_id: "req-" + safeAgentId + "-" + safeActionId,
    audit_id: "audit-" + safeAgentId + "-" + safeActionId
  };
}

function actionMessage(action) {
  var actionId = action.action_id;
  if (actionId === "start_install") {
    return "已提交安装申请预览。当前阶段不会在本机执行安装命令，下一步请在安装申请中创建安装记录。";
  }
  if (actionId === "start_enterprise_activation" || actionId === "request_enterprise_activation") {
    return "已进入企业激活预览。请先确认策略要求，再按页面命令完成凭证和签名测试。";
  }
  if (actionId === "open_standalone_readme") {
    return "已切到本地使用路径。此路径不要求 installation_id、device_id 或 AgentOps credential。";
  }
  if (actionId === "send_signature_test_event") {
    return "签名测试已进入待执行状态。Agent Store 只展示下一步，不本地判定测试结果。";
  }
  if (actionId === "copy_diagnostic_ref") {
    return "诊断编号已准备好，可用于和 Owner 或 AgentOps 对齐当前激活状态。";
  }
  if (actionId === "install_runtime") {
    return "Runtime 安装动作已进入预览；Agent Store 只展示下一步，不执行 Agent 或 Runtime。";
  }
  if (actionId === "upgrade_runtime") {
    return "Runtime 升级动作已记录。是否满足能力要求仍需后端 Runtime echo/probe 回显。";
  }
  if (actionId === "view_missing_runtime_capabilities") {
    return "已定位缺失 Runtime 能力；需要 Runtime Owner 补齐或选择兼容版本。";
  }
  if (actionId === "continue_listing_review") {
    return "Runtime 可用性摘要满足当前 Manifest，可继续上架或安装审核。";
  }
  if (actionId === "request_agentops_health_summary") {
    return "已记录 HealthSummary 申请；健康事实必须由 AgentOps 回显，前端不本地推导。";
  }
  if (actionId === "refresh_agentops_health_summary") {
    return "已记录 HealthSummary 刷新动作；过期摘要只能显示待刷新。";
  }
  if (actionId === "view_agentops_health_detail") {
    return "已切到 AgentOps 健康详情路径；Agent Store 只展示摘要和跳转。";
  }
  if (actionId === "continue_health_review") {
    return "HealthSummary 新鲜度可展示，但不会作为推荐或 Actual L5 的依据。";
  }
  if (actionId === "refresh_agentops_quality_summary") {
    return "已记录 AgentOps 质量摘要刷新动作；Store 前端不计算质量分，只展示后端投影。";
  }
  if (actionId === "request_score_template_refresh") {
    return "已记录 score_template_id 刷新动作；模板废弃时质量摘要只能按降级状态展示。";
  }
  if (actionId === "request_raw_evidence_access") {
    return "Evidence Vault 原文访问申请已进入预览；Store 不展示 raw Trace 或 raw Evidence URL。";
  }
  if (actionId === "continue_quality_evidence_review") {
    return "质量证据摘要可继续复核；推荐依据只采用后端允许字段，Store 前端不本地推导质量。";
  }
  if (actionId === "request_owner_distribution_permission") {
    return "安装分布权限申请已进入预览；Store 不向无权限 viewer 暴露聚合计数或安装明细。";
  }
  if (actionId === "refresh_installation_inventory") {
    return "已请求刷新 Store installation inventory；无库存时不会把状态误判为 0 安装。";
  }
  if (actionId === "prepare_owner_notification") {
    return "Owner 通知准备已进入预览；Agent Store 只展示影响范围，不发送真实通知。";
  }
  if (actionId === "continue_owner_distribution_review") {
    return "安装分布可继续复核；当前面板只展示聚合计数，不展示 user、device_id 或 installation_id 明细。";
  }
  if (actionId === "triage_feedback") {
    return "反馈分诊已进入预览；Agent Store 只推进可审计 lifecycle projection，不创建开放评论线程。";
  }
  if (actionId === "request_owner_response") {
    return "已请求 Owner 回复；只有 Owner 角色可以推进 owner_reply、plan、fix、reject 或 release。";
  }
  if (actionId === "plan_or_reject_feedback") {
    return "Owner 回复已记录；下一步只能进入计划或拒绝，不能跳过反馈生命周期。";
  }
  if (actionId === "mark_feedback_fixed") {
    return "修复状态已进入预览；发布前仍必须绑定 release_ref。";
  }
  if (actionId === "attach_release") {
    return "发布关联已进入预览；缺 release_ref 时不能展示为 released。";
  }
  if (actionId === "view_feedback_decision") {
    return "反馈决策可查看；这是 Store-owned 产品闭环，不是 AgentOps PolicyDecision。";
  }
  if (actionId === "view_release_notes") {
    return "已切到发布说明路径；Store 不在本阶段生成 release notes 或修改 AgentVersion。";
  }
  if (actionId === "return_to_feedback_queue") {
    return "已返回反馈队列；缺少反馈闭环摘要时只展示保守降级路径。";
  }
  if (actionId === "fix_lifecycle_transition") {
    return "生命周期迁移存在阻断项；需要补齐角色、替代版本、回退版本、影响范围或安全证据。";
  }
  if (actionId === "notify_security_revocation") {
    return "安全撤销通知已进入预览；security_revoked 是终态，Store 不执行 Runtime 操作或降级该状态。";
  }
  if (actionId === "notify_disabled_version") {
    return "停用版本通知已进入预览；Store 只展示影响范围，不修改 AgentVersion 存储。";
  }
  if (actionId === "notify_available_replacement") {
    return "可替代版本通知已进入预览；Store 只展示 replacement/rollback 映射，不执行升级或回退。";
  }
  if (actionId === "notify_lifecycle_change") {
    return "生命周期变更通知已进入预览；Store 不签发 CapabilityGrant，也不覆盖 AgentOps PolicyDecision。";
  }
  if (actionId === "confirm_listing_fields") {
    return "字段确认已进入预览；Owner 确认前不会把候选字段写成治理事实。";
  }
  if (actionId === "prepare_draft_review_submission") {
    return "上架向导已准备好草案提交材料；进入 pending_review 留给后续提交阶段。";
  }
  if (actionId === "resolve_runtime_gate") {
    return "Runtime Gate 仍阻断上架预览，需要先处理 Runtime 版本或能力问题。";
  }
  if (actionId === "return_to_field_confirmation") {
    return "已返回字段确认；TODO、unknown 或缺 Owner 不能进入草案审核。";
  }
  if (actionId === "enqueue_notification_route") {
    return "通知路由已进入投影队列预览；Agent Store 只记录 not_sent 路由摘要，不发送真实消息。";
  }
  if (actionId === "review_notification_route") {
    return "已进入通知路由复核；降级 channel 需要 Owner 确认后才能交给外部发送系统。";
  }
  if (actionId === "fix_notification_routing_context") {
    return "已定位通知路由上下文缺口；需补齐可信受众、事件身份或审计字段后再路由。";
  }
  if (actionId === "request_visibility_access") {
    return "可见性申请已进入预览；Agent Store 不直接授予访问，只记录可审计请求。";
  }
  if (actionId === "request_install_permission") {
    return "安装权限申请已进入预览；权限裁决仍来自 IAM 或 AgentOps policy echo。";
  }
  if (actionId === "request_evidence_access") {
    return "Evidence Vault 访问申请已进入预览；Store 不展示 raw Trace 或 raw Evidence。";
  }
  if (actionId === "submit_agentops_approval") {
    return "AgentOps 审批提交已进入预览；receipt 不等于批准，Store 不签发 CapabilityGrant。";
  }
  if (actionId === "view_policy_reason") {
    return "已切到 Policy 阻断原因；Store 只展示 AgentOps policy echo，不覆盖策略裁决。";
  }
  if (actionId === "refresh_identity") {
    return "已请求刷新身份上下文；缺可信 auth context 时不会展示具体权限恢复动作。";
  }
  return "操作已记录为可审计的预览动作。真实状态必须来自 Agent Store、Ai_AutoSDLC CLI 或 AgentOps 回显。";
}

function arrayOrEmpty(value) {
  return Array.isArray(value) ? value : [];
}

function recommendationEnvelopeFor(envelopes, agentId) {
  if (!envelopes || !agentId) {
    return null;
  }
  return envelopes[agentId] || null;
}

function recommendationStateApiUrl(agentId) {
  return "/api/v1/agents/" + encodeURIComponent(agentId)
    + "/recommendation-state?trace_id=trace-ui-" + safeId(agentId);
}

function fallbackRecommendationState(agent) {
  if (agent.installability === "blocked" || agent.trust_state === "blocked") {
    return "blocked";
  }
  if (agent.installability === "activation_required") {
    return "needs_activation";
  }
  return "eligible_pending_verification";
}

function normalizeRecommendationDecision(envelope, agent, request, bootstrap) {
  var decision = envelope && envelope.error_code === "OK" ? envelope.recommendation : null;
  var fallbackState = fallbackRecommendationState(agent);
  if (!decision) {
    return {
      agent_id: agent.agent_id,
      agent_version: agent.version,
      recommendation_state: fallbackState,
      verdict: "缺少后端 recommendation_state envelope，前端只保留目录候选展示。",
      source_of_truth: {
        catalog: "agent_store_catalog",
        recommendation: "frontend_fallback_no_recommendation_envelope"
      },
      trace_id: "trace-missing-recommendation-" + safeId(agent.agent_id),
      audit_id: request.audit_id,
      why_recommended: arrayOrEmpty(agent.discovery_reasons),
      why_not: ["recommendation_state_envelope_missing"],
      missing_evidence: ["recommendation_state_api"],
      trust_blockers: [
        {
          blocker_id: "recommendation_state_envelope_missing",
          source: "agent_store",
          severity: fallbackState === "blocked" ? "blocked" : "warning",
          can_ignore: false
        }
      ],
      actual_l5_display_allowed: false,
      requirements: arrayOrEmpty(agent.prerequisites),
      outcomes: arrayOrEmpty(agent.expected_outcomes),
      next_best_action: request.next_action,
      diagnostic_ref: bootstrap.diagnostic_ref
    };
  }
  return Object.assign({}, decision, {
    requirements: arrayOrEmpty(agent.prerequisites),
    outcomes: arrayOrEmpty(agent.expected_outcomes),
    next_best_action: decision.next_best_action || request.next_action,
    diagnostic_ref: bootstrap.diagnostic_ref
  });
}

new window.Vue({
  el: "#app",
  data: function data() {
    return {
      catalog: window.AgentStoreMock.agentCatalog,
      runtimeAvailability: window.AgentStoreMock.runtimeAvailability,
      healthSummaryFreshness: window.AgentStoreMock.healthSummaryFreshness,
      installationDistribution: window.AgentStoreMock.installationDistribution,
      feedbackOwnerResponseLoops: window.AgentStoreMock.feedbackOwnerResponseLoops,
      lifecycleGovernance: window.AgentStoreMock.lifecycleGovernance,
      qualityEvidenceAccess: window.AgentStoreMock.qualityEvidenceAccess,
      notificationRouting: window.AgentStoreMock.notificationRouting,
      permissionDenialActions: window.AgentStoreMock.permissionDenialActions,
      listingWizard: window.AgentStoreMock.listingWizard,
      recommendationStates: {},
      recommendationStateRequests: {},
      selectedAgentId: "framework.ai-autosdlc",
      searchQuery: "",
      discoveryCollection: "recommended",
      typeFilter: "all",
      trustFilter: "all",
      installabilityFilter: "all",
      view: window.AgentStoreMock.officialView,
      bootstrap: window.AgentStoreMock.bootstrap,
      agentops: window.AgentStoreMock.agentops,
      trustedLoop: window.AgentStoreMock.trustedLoop,
      stateDecision: window.AgentStoreMock.stateDecision,
      actionFeedback: {
        state: "idle",
        action_id: "start_enterprise_activation",
        audit_id: "",
        boundary: "本阶段只提交可审计预览，不执行真实安装，不本地判定 AgentOps 结果。",
        message: "选择一个 Agent 后，可查看本地使用或企业激活路径。"
      }
    };
  },
  watch: {
    activeSelectedAgentId: function activeSelectedAgentId(agentId) {
      this.loadRecommendationState(agentId);
    }
  },
  mounted: function mounted() {
    this.loadRecommendationState(this.activeSelectedAgentId);
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
        if (
          this.discoveryCollection !== "all"
          && (!agent.discovery_bucket || agent.discovery_bucket.indexOf(this.discoveryCollection) < 0)
        ) {
          return false;
        }
        return true;
      }, this);
    },
    discoveryCollections: function discoveryCollections() {
      var buckets = [
        { id: "recommended", label: "推荐", tone: "success" },
        { id: "ready", label: "可开始", tone: "info" },
        { id: "local", label: "本地可用", tone: "neutral" },
        { id: "enterprise", label: "企业激活", tone: "warning" },
        { id: "guarded", label: "治理关注", tone: "danger" },
        { id: "all", label: "全部", tone: "neutral" }
      ];
      return buckets.map(function mapBucket(bucket) {
        var count = bucket.id === "all"
          ? this.catalog.length
          : this.catalog.filter(function hasBucket(agent) {
            return agent.discovery_bucket && agent.discovery_bucket.indexOf(bucket.id) >= 0;
          }).length;
        return Object.assign({}, bucket, {
          count: count,
          active: this.discoveryCollection === bucket.id
        });
      }, this);
    },
    discoveryStats: function discoveryStats() {
      return {
        total: this.catalog.length,
        recommended: this.discoveryCollections.find(function findCollection(item) {
          return item.id === "recommended";
        }).count,
        ready: this.catalog.filter(function ready(agent) {
          return agent.installability === "installable" || agent.installability === "standalone_only";
        }).length,
        guarded: this.catalog.filter(function guarded(agent) {
          return agent.trust_state === "blocked" || agent.trust_state === "warning";
        }).length
      };
    },
    discoveryHighlight: function discoveryHighlight() {
      var selected = this.selectedAgent;
      if (!selected) {
        return {
          title: "暂无可推荐 Agent",
          verdict: "调整筛选后查看目录结果",
          reason: "当前筛选没有返回可展示条目。",
          next_action: {
            action_id: "adjust_catalog_filters",
            target_system: "agent_store",
            enabled: false
          }
        };
      }
      return {
        title: selected.display_name,
        verdict: this.recommendationVerdict(selected),
        reason: arrayOrEmpty(selected.discovery_reasons)[0] || selected.summary,
        next_action: selected.primary_action
      };
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
          governance_load: {
            adapter_state: "unavailable",
            load_verification_method: "catalog_filter",
            verified_at: "",
            evidence_hash: "",
            degraded_reason: "catalog_filters_returned_no_agents",
            unsupported_reason: ""
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
        l5_display_state: "l5_unavailable_without_agentops_summary",
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
          trust_state: "unavailable",
          signature_state: "unavailable",
          hash_match_state: "unavailable",
          issuer_display: "Agent Store"
        },
        governance_load: {
          adapter_state: "unavailable",
          load_verification_method: "agentops_summary_required",
          verified_at: "",
          evidence_hash: "",
          degraded_reason: "non_official_catalog_item_has_no_agentops_summary",
          unsupported_reason: ""
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
          source_of_truth: "agent_store",
          entry_evidence: ["catalog_filters_returned_no_agents"],
          conflict_resolution: "no_bootstrap_until_agent_selected",
          can_ignore: true,
          affected_actions: ["select_agent"],
          source_conflicts: [],
          primary_action: this.selectedView.primary_action,
          recommended_actions: [this.selectedView.primary_action]
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
        source_of_truth: "agent_store",
        entry_evidence: ["catalog_selection"],
        conflict_resolution: "no_bootstrap_until_activation_started",
        can_ignore: this.selectedAgent.installability !== "activation_required",
        affected_actions: ["start_enterprise_activation"],
        source_conflicts: [],
        primary_action: this.selectedAgent.primary_action,
        recommended_actions: [
          this.selectedAgent.primary_action,
          {
            action_id: "copy_diagnostic_ref",
            target_system: "agent_store",
            enabled: true,
            href: "#diag-" + this.selectedAgent.agent_id
          }
        ]
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
          evidence_level: "unavailable",
          summary_validity_state: "unavailable",
          confidence: 0,
          missing_evidence: ["agentops_summary_unavailable"],
          score_template_id: "agentops-required"
        },
        approval: {
          approval_id: "approval-" + this.selectedAgent.agent_id,
          status: "unavailable",
          audit_id: "audit-" + this.selectedAgent.agent_id
        },
        runtime_policy: {
          policy_ref: "policy-" + this.selectedAgent.agent_id,
          fallback_action: "request_agentops_summary",
          runtime_risk_level: "unknown",
          enforcement_mode: "unavailable"
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
        trusted_loop_verified: false,
        actual_l5_display_allowed: false,
        checked_refs: [
          this.selectedAgent.agent_id,
          this.selectedAgent.version,
          "agentops_summary_required",
          "no_frontend_trust_inference"
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
    selectedRuntimeAvailability: function selectedRuntimeAvailability() {
      var agent = this.selectedAgent;
      var summary;
      var summaries = this.runtimeAvailability || {};
      if (!agent) {
        return {
          audit_id: "audit-empty-filter",
          availability_state: "manifest_incomplete",
          display_name_zh: "Manifest 待补齐",
          reason: "当前没有可评估 Agent，Runtime 可用性摘要不可用。",
          required_runtime_contract_version: "",
          runtime_contract_version: "",
          missing_runtime_capabilities: [],
          issues: [
            {
              issue_id: "CATALOG_FILTER_EMPTY",
              fix_action_id: "adjust_catalog_filters"
            }
          ],
          source_of_truth: {
            agent_manifest: "catalog_filter",
            runtime_availability: "not_applicable",
            summary_projection: "agent_store"
          },
          runtime_facts: {
            runtime_id: "",
            availability_echo_state: "missing"
          },
          next_action: this.selectedView.primary_action
        };
      }
      summary = summaries[agent.agent_id];
      if (summary) {
        return summary;
      }
      return {
        audit_id: "audit-" + agent.agent_id,
        availability_state: "runtime_missing",
        display_name_zh: "缺 Runtime",
        reason: "缺少后端 runtime_availability_summary envelope，前端只展示缺 Runtime 的保守状态。",
        required_runtime_contract_version: "",
        runtime_contract_version: "",
        missing_runtime_capabilities: [],
        issues: [
          {
            issue_id: "RUNTIME_AVAILABILITY_SUMMARY_MISSING",
            fix_action_id: "request_runtime_probe"
          }
        ],
        source_of_truth: {
          agent_manifest: "agent_store",
          runtime_availability: "agent_runtime_echo_or_probe",
          summary_projection: "frontend_fallback_no_runtime_summary"
        },
        runtime_facts: {
          runtime_id: "",
          availability_echo_state: "missing"
        },
        next_action: {
          action_id: "install_runtime",
          target_system: "agent_runtime",
          enabled: true,
          requires_permission: true,
          audit_required: true
        }
      };
    },
    selectedHealthSummaryFreshness: function selectedHealthSummaryFreshness() {
      var agent = this.selectedAgent;
      var summary;
      var summaries = this.healthSummaryFreshness || {};
      if (!agent) {
        return {
          audit_id: "audit-empty-filter",
          freshness_state: "health_unavailable",
          display_name_zh: "摘要不可用",
          reason: "当前没有可评估 Agent，HealthSummary freshness 不可用。",
          health_state: "unknown",
          calculated_at: "",
          valid_until: "",
          signal_count: 0,
          recommendation_basis_allowed: false,
          issues: [
            {
              issue_id: "CATALOG_FILTER_EMPTY",
              fix_action_id: "adjust_catalog_filters"
            }
          ],
          source_of_truth: {
            health_summary: "catalog_filter",
            summary_projection: "agent_store",
            recommendation: "recommendation_state_excludes_health_summary",
            policy_decision: "agentops"
          },
          health_facts: {
            health_summary_present: false,
            agentops_trace_id: "",
            evidence_summary_id: ""
          },
          next_action: this.selectedView.primary_action
        };
      }
      summary = summaries[agent.agent_id];
      if (summary) {
        return summary;
      }
      return {
        audit_id: "audit-" + agent.agent_id,
        freshness_state: "health_unavailable",
        display_name_zh: "摘要不可用",
        reason: "缺少后端 health_summary_freshness envelope，前端只展示申请刷新路径。",
        health_state: "unknown",
        calculated_at: "",
        valid_until: "",
        signal_count: 0,
        recommendation_basis_allowed: false,
        issues: [
          {
            issue_id: "HEALTH_SUMMARY_UNAVAILABLE",
            fix_action_id: "request_agentops_health_summary"
          }
        ],
        source_of_truth: {
          health_summary: "agentops",
          summary_projection: "frontend_fallback_no_health_summary",
          recommendation: "recommendation_state_excludes_health_summary",
          policy_decision: "agentops"
        },
        health_facts: {
          health_summary_present: false,
          agentops_trace_id: "",
          evidence_summary_id: ""
        },
        next_action: {
          action_id: "request_agentops_health_summary",
          target_system: "agentops",
          enabled: true,
          requires_permission: true,
          audit_required: true
        }
      };
    },
    selectedInstallationDistribution: function selectedInstallationDistribution() {
      var agent = this.selectedAgent;
      var summary;
      var summaries = this.installationDistribution || {};
      if (!agent) {
        return {
          contract_schema_version: "installation_distribution_summary.v1",
          agent_id: "",
          requested_version: "",
          distribution_state: "distribution_unavailable",
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
            target_version: ""
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
              issue_id: "CATALOG_FILTER_EMPTY",
              field_path: "catalog_filter",
              severity: "warning",
              fix_action_id: "adjust_catalog_filters"
            }
          ],
          source_of_truth: {
            installation_inventory: "catalog_filter",
            device_binding: "catalog_filter",
            permission: "agent_store_viewer_context",
            quality: "agentops_not_computed_here",
            projection: "agent_store"
          },
          next_action: this.selectedView.primary_action
        };
      }
      summary = summaries[agent.agent_id];
      if (summary) {
        return summary;
      }
      return {
        contract_schema_version: "installation_distribution_summary.v1",
        agent_id: agent.agent_id,
        requested_version: agent.version,
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
          target_version: agent.version
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
            issue_id: "INSTALLATION_DISTRIBUTION_SUMMARY_MISSING",
            field_path: "installation_distribution_summary",
            severity: "blocked",
            fix_action_id: "refresh_installation_inventory"
          }
        ],
        source_of_truth: {
          installation_inventory: "agent_store",
          device_binding: "agent_store",
          permission: "agent_store_viewer_context",
          quality: "agentops_not_computed_here",
          projection: "frontend_fallback_no_installation_distribution_summary"
        },
        next_action: {
          action_id: "refresh_installation_inventory",
          target_system: "agent_store",
          enabled: true,
          requires_permission: true,
          audit_required: true
        }
      };
    },
    selectedFeedbackOwnerResponseLoop: function selectedFeedbackOwnerResponseLoop() {
      var agent = this.selectedAgent;
      var loop;
      var loops = this.feedbackOwnerResponseLoops || {};
      if (!agent) {
        return {
          contract_schema_version: "feedback_owner_response_loop.v1",
          feedback_id: "",
          agent_id: "",
          agent_version: "",
          feedback_state: "submitted",
          previous_state: "new",
          transition_action: "submit",
          feedback: {
            feedback_id: "",
            agent_id: "",
            agent_version: "",
            feedback_state: "new",
            title: "当前没有可评估 Agent",
            feedback_type: "general",
            severity: "info",
            submitted_by: ""
          },
          owner_response: {
            owner_response_required: false,
            actor_id: "",
            actor_role: "",
            message: "调整筛选条件后查看反馈闭环。",
            commitment: ""
          },
          release_linkage: {
            release_required: false,
            release_ref: "",
            release_version: "",
            released_at: ""
          },
          timeline: [],
          issues: [
            {
              issue_id: "CATALOG_FILTER_EMPTY",
              field_path: "catalog_filter",
              severity: "warning",
              fix_action_id: "adjust_catalog_filters"
            }
          ],
          source_of_truth: {
            feedback: "catalog_filter",
            owner_response: "catalog_filter",
            release_linkage: "catalog_filter",
            notifications: "agent_store_notification_queue"
          },
          next_action: this.selectedView.primary_action
        };
      }
      loop = loops[agent.agent_id];
      if (loop) {
        return loop;
      }
      return {
        contract_schema_version: "feedback_owner_response_loop.v1",
        feedback_id: "feedback-missing-" + safeId(agent.agent_id),
        agent_id: agent.agent_id,
        agent_version: agent.version,
        feedback_state: "submitted",
        previous_state: "new",
        transition_action: "submit",
        feedback: {
          feedback_id: "feedback-missing-" + safeId(agent.agent_id),
          agent_id: agent.agent_id,
          agent_version: agent.version,
          feedback_state: "new",
          title: "反馈闭环待刷新",
          feedback_type: "general",
          severity: "info",
          submitted_by: "unknown"
        },
        owner_response: {
          owner_response_required: true,
          actor_id: "",
          actor_role: "",
          message: "缺少后端 feedback_owner_response_loop envelope，前端只展示反馈队列路径。",
          commitment: ""
        },
        release_linkage: {
          release_required: false,
          release_ref: "",
          release_version: "",
          released_at: ""
        },
        timeline: [],
        issues: [
          {
            issue_id: "FEEDBACK_LOOP_SUMMARY_MISSING",
            field_path: "feedback_owner_response_loop",
            severity: "warning",
            fix_action_id: "return_to_feedback_queue"
          }
        ],
        source_of_truth: {
          feedback: "agent_store_feedback",
          owner_response: "agent_store_owner_response",
          release_linkage: "agent_store_release_linkage",
          notifications: "agent_store_notification_queue"
        },
        next_action: {
          action_id: "return_to_feedback_queue",
          target_system: "agent_store",
          enabled: true,
          requires_permission: true,
          audit_required: true
        }
      };
    },
    selectedLifecycleGovernance: function selectedLifecycleGovernance() {
      var agent = this.selectedAgent;
      var governance;
      var summaries = this.lifecycleGovernance || {};
      if (!agent) {
        return {
          contract_schema_version: "lifecycle_governance_baseline.v1",
          agent_id: "",
          current_version: "",
          lifecycle_state: "active",
          previous_state: "active",
          transition_action: "upgrade",
          actor: {
            actor_id: "",
            actor_role: "",
            reason: "当前没有可评估 Agent。",
            evidence_ref: ""
          },
          version_scope: {
            agent_id: "",
            version: "",
            artifact_hash: "",
            release_status: "",
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
            impact_required: false,
            affected_installation_count: 0,
            affected_user_count: 0,
            replacement_available: false,
            notification_required: false
          },
          issues: [
            {
              issue_id: "CATALOG_FILTER_EMPTY",
              field_path: "catalog_filter",
              severity: "warning",
              fix_action_id: "adjust_catalog_filters"
            }
          ],
          source_of_truth: {
            agent_version: "catalog_filter",
            lifecycle_decision: "catalog_filter",
            replacement: "catalog_filter",
            impact_scope: "catalog_filter",
            agentops_notification: "agent_store_notification_queue"
          },
          next_action: this.selectedView.primary_action
        };
      }
      governance = summaries[agent.agent_id];
      if (governance) {
        return governance;
      }
      return {
        contract_schema_version: "lifecycle_governance_baseline.v1",
        agent_id: agent.agent_id,
        current_version: agent.version,
        lifecycle_state: "active",
        previous_state: "active",
        transition_action: "upgrade",
        actor: {
          actor_id: "",
          actor_role: "",
          reason: "缺少后端 lifecycle_governance envelope，前端只展示刷新治理投影路径。",
          evidence_ref: ""
        },
        version_scope: {
          agent_id: agent.agent_id,
          version: agent.version,
          artifact_hash: "",
          release_status: agent.release_status || "",
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
          impact_required: false,
          affected_installation_count: 0,
          affected_user_count: 0,
          replacement_available: false,
          notification_required: false
        },
        issues: [
          {
            issue_id: "LIFECYCLE_GOVERNANCE_SUMMARY_MISSING",
            field_path: "lifecycle_governance",
            severity: "warning",
            fix_action_id: "fix_lifecycle_transition"
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
      };
    },
    selectedQualityEvidenceAccess: function selectedQualityEvidenceAccess() {
      var agent = this.selectedAgent;
      var summary;
      var summaries = this.qualityEvidenceAccess || {};
      if (!agent) {
        return {
          audit_id: "audit-quality-empty-filter",
          contract_schema_version: "quality_evidence_access_summary.v1",
          agent_id: "",
          agent_version: "",
          summary_state: "summary_unavailable",
          permission_state: "unavailable",
          display: {
            evidence_level: "unavailable",
            confidence: null,
            identity_confidence: null,
            missing_evidence: ["agentops_quality_summary"],
            score_template_id: "",
            calculated_at: "",
            valid_until: "",
            summary_validity_state: "degraded",
            display_label: "待刷新",
            redacted: false
          },
          run_binding: {
            run_id: "",
            session_id: "",
            evidence_summary_id: "",
            source_event_count: 0
          },
          access: {
            can_view_quality_summary: false,
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
              issue_id: "CATALOG_FILTER_EMPTY",
              field_path: "catalog_filter",
              severity: "warning",
              fix_action_id: "adjust_catalog_filters"
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
          next_action: this.selectedView.primary_action
        };
      }
      summary = summaries[agent.agent_id];
      if (summary) {
        return summary;
      }
      return {
        audit_id: "audit-quality-missing-" + safeId(agent.agent_id),
        contract_schema_version: "quality_evidence_access_summary.v1",
        agent_id: agent.agent_id,
        agent_version: agent.version,
        summary_state: "summary_unavailable",
        permission_state: "unavailable",
        display: {
          evidence_level: "unavailable",
          confidence: null,
          identity_confidence: null,
          missing_evidence: ["agentops_quality_summary"],
          score_template_id: "",
          calculated_at: "",
          valid_until: "",
          summary_validity_state: "degraded",
          display_label: "待刷新",
          redacted: false
        },
        run_binding: {
          run_id: "",
          session_id: "",
          evidence_summary_id: "",
          source_event_count: 0
        },
        access: {
          can_view_quality_summary: false,
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
            issue_id: "AGENTOPS_QUALITY_SUMMARY_REQUIRED",
            field_path: "agentops_summary.quality_evidence",
            severity: "blocked",
            fix_action_id: "refresh_agentops_quality_summary"
          }
        ],
        source_of_truth: {
          quality_summary: "agentops",
          run_evidence: "agentops",
          raw_evidence: "evidence_vault",
          raw_trace: "evidence_vault",
          permission: "agent_store_viewer_context",
          projection: "frontend_fallback_no_quality_evidence_access_summary"
        },
        next_action: {
          action_id: "refresh_agentops_quality_summary",
          target_system: "agentops",
          enabled: true,
          requires_permission: true,
          audit_required: true
        }
      };
    },
    selectedNotificationRouting: function selectedNotificationRouting() {
      var agent = this.selectedAgent;
      var routing;
      var summaries = this.notificationRouting || {};
      if (!agent) {
        return {
          audit_id: "audit-empty-filter",
          contract_schema_version: "notification_routing_summary.v1",
          event_type: "not_applicable",
          event_id: "catalog-empty-filter",
          routing_state: "routing_blocked",
          reason: "当前没有可评估 Agent，通知路由摘要不可用。",
          delivery_status: "not_sent",
          trusted_audience: {
            audience_state: "missing",
            source: "catalog_filter",
            recipients: []
          },
          channels: [],
          issues: [
            {
              issue_id: "CATALOG_FILTER_EMPTY",
              fix_action_id: "adjust_catalog_filters"
            }
          ],
          source_of_truth: {
            event: "catalog_filter",
            notification_delivery: "not_applicable",
            summary_projection: "agent_store"
          },
          next_action: this.selectedView.primary_action
        };
      }
      routing = summaries[agent.agent_id];
      if (routing) {
        return routing;
      }
      return {
        audit_id: "audit-routing-" + agent.agent_id,
        contract_schema_version: "notification_routing_summary.v1",
        agent_id: agent.agent_id,
        agent_version: agent.version,
        event_type: "installation_failed",
        event_id: "event-routing-missing-" + safeId(agent.agent_id),
        routing_state: "routing_blocked",
        reason: "缺少后端 notification_routing_summary envelope，前端只展示未发送的阻断状态。",
        delivery_status: "not_sent",
        trusted_audience: {
          audience_state: "missing",
          source: "trusted_iam_or_owner_directory",
          recipients: []
        },
        channels: [
          {
            channel_id: "notification_center",
            target_system: "agent_store",
            delivery_status: "not_sent",
            sla_minutes: 30
          }
        ],
        issues: [
          {
            issue_id: "NOTIFICATION_ROUTING_SUMMARY_MISSING",
            field_path: "notification_routing_summary",
            severity: "blocked",
            fix_action_id: "fix_notification_routing_context"
          }
        ],
        source_of_truth: {
          event: "agent_store_event",
          audience: "trusted_iam_or_owner_directory",
          notification_delivery: "notification_center_not_sent_by_store",
          summary_projection: "frontend_fallback_no_notification_routing_summary"
        },
        next_action: {
          action_id: "fix_notification_routing_context",
          target_system: "agent_store",
          enabled: true,
          requires_permission: true,
          audit_required: true
        }
      };
    },
    selectedPermissionDenialAction: function selectedPermissionDenialAction() {
      var agent = this.selectedAgent;
      var summary;
      var summaries = this.permissionDenialActions || {};
      if (!agent) {
        return {
          contract_schema_version: "permission_denial_action_summary.v1",
          denial_scenario: "not_visible",
          denial_state: "denial_unavailable",
          permission_state: "permission_unknown",
          page: {
            title: "权限状态待刷新",
            plain_language_explanation: "当前没有可评估 Agent，权限恢复动作不可用。",
            severity: "warning",
            return_path: "/agent-store/agents",
            visible_roles: ["requester"],
            notification_rule: "audit_only",
            audit_required: true
          },
          permission: {
            permission_decision_id: "permission-empty-filter",
            decision: "deny",
            denied_scope: "catalog",
            resource_scope: "catalog_filter",
            request_id: "catalog-empty-filter",
            policy_ref: "",
            auth_context_id: "",
            subject_user_id: "",
            request_access_url: "",
            raw_trace_url: "",
            raw_evidence_url: ""
          },
          raw_trace_exposed: false,
          raw_evidence_exposed: false,
          store_grant_issued: false,
          store_policy_override_allowed: false,
          primary_action: {
            action_id: "refresh_identity",
            target_system: "agent_store",
            enabled: true,
            requires_permission: false,
            audit_required: true
          },
          secondary_action: {
            action_id: "return_to_catalog",
            target_system: "agent_store",
            enabled: true,
            requires_permission: false,
            audit_required: false,
            href: "/agent-store/agents"
          },
          issues: [
            {
              issue_id: "TRUSTED_AUTH_CONTEXT_REQUIRED",
              field_path: "viewer_context",
              severity: "warning",
              fix_action_id: "refresh_identity"
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
            action_id: "refresh_identity",
            target_system: "agent_store",
            enabled: true,
            requires_permission: false,
            audit_required: true
          }
        };
      }
      summary = summaries[agent.agent_id];
      if (summary) {
        return summary;
      }
      return {
        contract_schema_version: "permission_denial_action_summary.v1",
        agent_id: agent.agent_id,
        agent_version: agent.version,
        denial_scenario: "visible_not_installable",
        denial_state: "denial_unavailable",
        permission_state: "permission_unknown",
        page: {
          title: "权限状态待刷新",
          plain_language_explanation: "缺少后端 permission_denial_action_summary envelope，前端只展示刷新身份路径。",
          severity: "warning",
          return_path: "/agents/" + agent.agent_id,
          visible_roles: ["requester"],
          notification_rule: "audit_only",
          audit_required: true,
          agent_display_name: agent.display_name
        },
        permission: {
          permission_decision_id: "permission-missing-" + safeId(agent.agent_id),
          decision: "deny",
          denied_scope: "agent.install",
          resource_scope: "agent_store",
          request_id: "req-permission-missing-" + safeId(agent.agent_id),
          policy_ref: "",
          auth_context_id: "",
          subject_user_id: "",
          request_access_url: "",
          raw_trace_url: "",
          raw_evidence_url: ""
        },
        raw_trace_exposed: false,
        raw_evidence_exposed: false,
        store_grant_issued: false,
        store_policy_override_allowed: false,
        primary_action: {
          action_id: "refresh_identity",
          target_system: "agent_store",
          enabled: true,
          requires_permission: false,
          audit_required: true
        },
        secondary_action: {
          action_id: "return_to_catalog",
          target_system: "agent_store",
          enabled: true,
          requires_permission: false,
          audit_required: false,
          href: "/agent-store/agents"
        },
        issues: [
          {
            issue_id: "TRUSTED_AUTH_CONTEXT_REQUIRED",
            field_path: "viewer_context",
            severity: "warning",
            fix_action_id: "refresh_identity"
          }
        ],
        scenario_examples: [],
        source_of_truth: {
          identity: "trusted_iam_auth_context",
          permission_decision: "iam_or_agentops_policy_echo",
          policy: "agentops",
          raw_evidence: "evidence_vault",
          projection: "frontend_fallback_no_permission_denial_action_summary"
        },
        next_action: {
          action_id: "refresh_identity",
          target_system: "agent_store",
          enabled: true,
          requires_permission: false,
          audit_required: true
        }
      };
    },
    selectedListingWizard: function selectedListingWizard() {
      var agent = this.selectedAgent;
      var wizard;
      var wizards = this.listingWizard || {};
      if (!agent) {
        return {
          contract_schema_version: "listing_wizard_shell.v1",
          wizard_state: "empty",
          source_step: {
            step_state: "empty",
            source_id: "catalog-empty-filter",
            source_type: "not_applicable",
            source_ref: "",
            next_action: this.selectedView.primary_action
          },
          field_confirmation: {
            step_state: "empty",
            fields: []
          },
          validation_report: {
            step_state: "empty",
            package_id: "not-applicable",
            draft_status: "not_applicable",
            issue_count: 0,
            fix_prompt_count: 0,
            issues: [],
            next_action: this.selectedView.primary_action
          },
          detail_preview: {
            step_state: "blocked",
            display_name: "未选择 Agent",
            runtime_availability_state: "manifest_incomplete",
            runtime_display_name_zh: "Manifest 待补齐",
            health_freshness_state: "health_unavailable",
            health_recommendation_basis_allowed: false
          },
          steps: [
            {
              step_id: "source_selection",
              label: "来源选择",
              step_state: "empty",
              owner_system: "agent_store"
            }
          ],
          source_of_truth: {
            package_manifest: "catalog_filter",
            draft_review: "not_submitted_until_027"
          },
          next_action: this.selectedView.primary_action
        };
      }
      wizard = wizards[agent.agent_id];
      if (wizard) {
        return wizard;
      }
      return {
        contract_schema_version: "listing_wizard_shell.v1",
        wizard_state: "needs_field_confirmation",
        source_step: {
          step_state: "selected",
          source_id: "catalog-" + safeId(agent.agent_id),
          source_type: "catalog_candidate",
          source_ref: agent.agent_id + "@" + agent.version,
          next_action: {
            action_id: "confirm_listing_fields",
            target_system: "agent_store",
            enabled: true,
            requires_permission: true,
            audit_required: true
          }
        },
        field_confirmation: {
          step_state: "needs_owner_input",
          fields: [
            {
              field_path: "owner_team",
              value: agent.owner_team,
              confirmation_state: "confirmed",
              source: "catalog_candidate"
            },
            {
              field_path: "runtime_contract_version",
              value: this.selectedRuntimeAvailability.required_runtime_contract_version || "",
              confirmation_state: "needs_owner_input",
              source: "runtime_availability_summary.v1"
            }
          ]
        },
        validation_report: {
          step_state: "validation_failed",
          package_id: agent.agent_id + "@" + agent.version,
          draft_status: "validation_failed",
          issue_count: 1,
          fix_prompt_count: 1,
          issues: [
            {
              issue_id: "LISTING_WIZARD_FIXTURE_MISSING",
              field_path: "runtime_contract_version",
              severity: "blocked",
              fix_action_id: "confirm_listing_fields"
            }
          ],
          next_action: {
            action_id: "return_to_field_confirmation",
            target_system: "agent_store",
            enabled: true,
            requires_permission: true,
            audit_required: true
          }
        },
        detail_preview: {
          step_state: "blocked",
          agent_id: agent.agent_id,
          display_name: agent.display_name,
          summary: agent.summary,
          owner_team: agent.owner_team,
          version: agent.version,
          runtime_availability_state: this.selectedRuntimeAvailability.availability_state,
          runtime_display_name_zh: this.selectedRuntimeAvailability.display_name_zh,
          health_freshness_state: this.selectedHealthSummaryFreshness.freshness_state,
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
            step_state: "needs_owner_input",
            owner_system: "agent_store"
          },
          {
            step_id: "validation_report",
            label: "校验报告",
            step_state: "validation_failed",
            owner_system: "agent_store"
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
          action_id: "return_to_field_confirmation",
          target_system: "agent_store",
          enabled: true,
          requires_permission: true,
          audit_required: true
        }
      };
    },
    selectedRecommendationDecision: function selectedRecommendationDecision() {
      var agent = this.selectedAgent;
      var request = this.selectedInstallationRequest;
      var bootstrap = this.selectedBootstrap;
      var envelope;
      if (!agent) {
        return {
          recommendation_state: "empty",
          verdict: "当前没有可评估 Agent",
          source_of_truth: {
            catalog: "catalog_filter",
            recommendation: "not_applicable"
          },
          trace_id: "trace-catalog-empty-filter",
          audit_id: "audit-empty-filter",
          why_recommended: [],
          why_not: ["catalog_filters_returned_no_agents"],
          missing_evidence: [],
          trust_blockers: [],
          requirements: ["调整筛选条件"],
          outcomes: [],
          next_best_action: this.selectedView.primary_action
        };
      }
      envelope = recommendationEnvelopeFor(this.recommendationStates, agent.agent_id);
      return normalizeRecommendationDecision(envelope, agent, request, bootstrap);
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
      var bootstrap;
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
        bootstrap = this.selectedBootstrap;
        if (bootstrap.installation_id && bootstrap.installation_id.indexOf("inst-") === 0) {
          return {
            handoff_state: "installation_created",
            request_id: request.request_id,
            audit_id: request.audit_id,
            idempotency_key: request.request_id,
            device_os: "macOS",
            device_public_key_thumbprint: "thumb-" + safeId(agent.agent_id),
            installation_id: bootstrap.installation_id,
            next_action: {
              action_id: "issue_installation_assertion",
              target_system: "agent_store",
              enabled: true,
              href: "#assertion-" + request.request_id
            }
          };
        }
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
    },
    selectedAssertionHandoff: function selectedAssertionHandoff() {
      var agent = this.selectedAgent;
      var handoff = this.selectedBootstrapHandoff;
      if (!agent) {
        return {
          assertion_state: "empty",
          installation_id: "not-applicable",
          audience: "not-applicable",
          nonce: "not-applicable",
          idempotency_key: "not-applicable",
          replay_window_seconds: 0,
          assertion_hash: "not-applicable",
          next_action: this.selectedView.primary_action
        };
      }
      if (hasCreatedInstallation(handoff)) {
        return {
          assertion_state: "ready_to_issue",
          installation_id: handoff.installation_id,
          audience: "agentops",
          nonce: "nonce-" + safeId(handoff.request_id),
          idempotency_key: "assert-" + handoff.request_id,
          replay_window_seconds: 300,
          assertion_hash: "pending-assertion-hash",
          next_action: {
            action_id: "issue_installation_assertion",
            target_system: "agent_store",
            enabled: true,
            href: "#assertion-" + handoff.request_id
          }
        };
      }
      return {
        assertion_state: handoff.handoff_state.indexOf("waiting_for_") === 0
          ? handoff.handoff_state
          : "waiting_for_" + handoff.handoff_state,
        installation_id: handoff.installation_id,
        audience: "agentops",
        nonce: "not-issued",
        idempotency_key: "blocked-until-" + safeId(handoff.handoff_state),
        replay_window_seconds: 0,
        assertion_hash: "not-issued",
        next_action: handoff.next_action
      };
    }
  },
  methods: {
    selectAgent: function selectAgent(agent) {
      this.selectedAgentId = agent.agent_id;
      this.resetActionFeedback(agent);
      this.loadRecommendationState(agent.agent_id);
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
    },
    setDiscoveryCollection: function setDiscoveryCollection(value) {
      var nextAgent;
      this.discoveryCollection = value;
      if (!this.filteredCatalog.some(function includesSelected(agent) {
        return agent.agent_id === this.selectedAgentId;
      }, this)) {
        nextAgent = this.filteredCatalog[0] || this.catalog[0] || null;
        this.selectedAgentId = nextAgent ? nextAgent.agent_id : "";
      }
      this.resetActionFeedback(this.selectedAgent);
      this.loadRecommendationState(this.activeSelectedAgentId);
    },
    markRecommendationStateUnavailable: function markRecommendationStateUnavailable(agentId, errorCode) {
      this.$set(this.recommendationStateRequests, agentId, errorCode);
    },
    loadRecommendationState: function loadRecommendationState(agentId) {
      var requestState = agentId ? this.recommendationStateRequests[agentId] : "";
      if (!agentId || this.recommendationStates[agentId] || requestState === "loading") {
        return;
      }
      if (typeof window.fetch !== "function") {
        this.markRecommendationStateUnavailable(agentId, "recommendation_state_fetch_unsupported");
        return;
      }
      this.$set(this.recommendationStateRequests, agentId, "loading");
      window.fetch(recommendationStateApiUrl(agentId), {
        headers: { accept: "application/json" }
      }).then(function parseRecommendationState(response) {
        return response.json().then(function parsed(body) {
          return { ok: response.ok, body: body };
        });
      }).then(function storeRecommendationState(result) {
        var body = result.body || {};
        if (result.ok && body.error_code === "OK" && body.recommendation) {
          this.$set(this.recommendationStates, agentId, body);
          this.$set(this.recommendationStateRequests, agentId, "ready");
          return;
        }
        this.markRecommendationStateUnavailable(
          agentId,
          body.error_code || "recommendation_state_api_error"
        );
      }.bind(this)).catch(function markFetchError() {
        this.markRecommendationStateUnavailable(agentId, "recommendation_state_api_unavailable");
      }.bind(this));
    },
    recommendationState: function recommendationState(agent) {
      if (agent.installability === "blocked" || agent.trust_state === "blocked") {
        return "blocked";
      }
      if (agent.installability === "activation_required") {
        return "needs_activation";
      }
      if (agent.trust_state === "warning") {
        return "eligible_pending_verification";
      }
      return arrayOrEmpty(agent.discovery_bucket).indexOf("recommended") >= 0 ? "recommended" : "eligible";
    },
    recommendationVerdict: function recommendationVerdict(agent) {
      var state = this.recommendationState(agent);
      if (state === "recommended") {
        return "推荐优先试用，企业可信状态仍以 AgentOps 回显为准";
      }
      if (state === "needs_activation") {
        return "适合企业接入，需先完成激活与签名测试";
      }
      if (state === "eligible_pending_verification") {
        return "可提交安装申请，但可信摘要仍待后端事实源确认";
      }
      if (state === "blocked") {
        return "当前不建议安装，需要先处理治理阻断";
      }
      return "可作为候选方案评估";
    },
    recommendationRisks: function recommendationRisks(agent) {
      var risks = [];
      if (agent.agent_id !== "framework.ai-autosdlc") {
        risks.push("缺少 AgentOps 摘要时不展示实际 L5");
      }
      if (agent.installability === "activation_required") {
        risks.push("企业激活完成前只能预览下一步");
      }
      if (agent.installability === "blocked") {
        risks.push("目录状态已阻断，必须复核后才能继续");
      }
      return risks;
    },
    trustBlockers: function trustBlockers(agent) {
      var blockers = [];
      if (agent.trust_state !== "trusted") {
        blockers.push(agent.trust_state);
      }
      if (agent.installability === "activation_required") {
        blockers.push("pending_enterprise_activation");
      }
      if (agent.agent_id !== "framework.ai-autosdlc") {
        blockers.push("agentops_summary_unavailable");
      }
      return blockers;
    },
    resetActionFeedback: function resetActionFeedback(agent) {
      this.actionFeedback = {
        state: "idle",
        action_id: agent ? agent.primary_action.action_id : "adjust_catalog_filters",
        audit_id: "",
        boundary: "本阶段只提交可审计预览，不执行真实安装，不本地判定 AgentOps 结果。",
        message: agent
          ? "已选择 " + agent.display_name + "，可查看推荐决策和下一步动作。"
          : "选择一个 Agent 后，可查看本地使用或企业激活路径。"
      };
    },
    invokeAction: function invokeAction(action) {
      var agent = this.selectedAgent;
      var identity = buildRequestIdentity(
        agent ? agent.agent_id : "catalog",
        action.action_id || "unknown_action"
      );
      this.actionFeedback = {
        state: action.enabled === false ? "blocked" : "submitted",
        action_id: action.action_id,
        audit_id: identity.audit_id,
        boundary: "Agent Store 前端只记录预览动作；可信、L5、credential 与签名测试结果必须来自后端或 AgentOps 回显。",
        message: actionMessage(action)
      };
    }
  }
});
