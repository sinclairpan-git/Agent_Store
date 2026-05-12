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
  if (actionId === "check_runtime_capabilities") {
    return "已请求 Runtime capability probe；Store 只展示 Runtime 回显，不本地推导兼容性。";
  }
  if (actionId === "continue_manifest_review") {
    return "AgentManifest Runtime 合同可继续复核；Runtime 仍只消费 Store Manifest，不改写 Manifest 事实。";
  }
  if (actionId === "complete_agent_manifest") {
    return "已返回 Manifest 补齐路径；缺必填字段前不能展示为 Runtime compatible。";
  }
  if (actionId === "start_runtime_activation") {
    return "Runtime activation 已进入 handoff 预览；Store 只交接安装事实，不启动 Runtime 进程。";
  }
  if (actionId === "regenerate_activation_command") {
    return "已返回激活命令重生成路径；Runtime echo 与 Store 安装事实不一致时不能继续消费。";
  }
  if (actionId === "restart_activation") {
    return "已返回重新激活路径；device binding 不一致时 Runtime 不可消费当前 handoff。";
  }
  if (actionId === "review_installation_status") {
    return "已进入安装状态复核；安装或设备绑定未就绪前不会允许 Runtime 消费。";
  }
  if (actionId === "submit_for_review") {
    return "Package Validation 已允许提交审核；仍需后续 Owner、Runtime 和审核队列门禁确认。";
  }
  if (actionId === "apply_fix_prompt") {
    return "修复提示已进入候选编辑路径；Store 只展示提示，不自动把 AI 文案写成治理事实。";
  }
  if (actionId === "return_to_draft") {
    return "已返回草案修复路径；阻断级 Package Validation issue 解决前不能进入正式审核。";
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
  if (actionId === "open_owner_governance_workbench") {
    return "Owner 工作台已进入预览；这里聚合待办摘要，但不执行审批、不发送通知、不修改 AgentVersion。";
  }
  if (actionId === "continue_owner_governance_review") {
    return "Owner 工作台当前无阻断待办；仍以单项事实源和审计字段为准。";
  }
  if (actionId === "view_owner_runtime_gap") {
    return "已定位 Runtime 能力缺口；Owner 工作台只聚合阻断原因，不启动 Runtime 或改写 Manifest。";
  }
  if (actionId === "open_owner_approval_queue") {
    return "Owner 审批队列已进入预览；真实审批结果仍来自 AgentOps，不由 Store 本地裁决。";
  }
  if (actionId === "review_owner_quality_gap") {
    return "质量缺口已进入 Owner 复核；Store 不展示 raw Trace 或 raw Evidence，也不计算质量分。";
  }
  if (actionId === "review_owner_package_gap") {
    return "Package Validation 缺口已进入 Owner 复核；warning 可继续审核但必须保持可见。";
  }
  if (actionId === "open_owner_feedback_queue") {
    return "反馈队列已进入 Owner 复核预览；本阶段不创建真实工单或发送外部通知。";
  }
  if (actionId === "open_installation_records") {
    return "安装记录工作台已进入预览；这里只聚合安装、设备、Runtime 和健康摘要，不执行真实安装。";
  }
  if (actionId === "view_installation_health") {
    return "已打开安装健康摘要预览；健康事实来自 AgentOps 回显，不能作为推荐依据或 Actual L5 判定。";
  }
  if (actionId === "view_revocation_notice") {
    return "吊销通知已进入预览；revoked 状态不能被工作台降级为可运行或可升级。";
  }
  if (actionId === "review_upgrade_candidate") {
    return "升级候选已进入复核预览；本阶段不下载包、不执行升级、不修改 AgentVersion。";
  }
  if (actionId === "open_system_settings_workbench") {
    return "系统设置工作台已进入预览；这里只展示配置摘要，不写入设置、不暴露凭证、不改 endpoint。";
  }
  if (actionId === "review_system_settings_summary") {
    return "系统设置摘要可复核；推荐位、镜像源、安装器和 AgentOps endpoint 仍以各自事实源为准。";
  }
  if (actionId === "fix_system_settings_blockers") {
    return "系统设置阻断项已定位；需要管理员在真实控制面修复，前端工作台不直接写配置。";
  }
  if (actionId === "open_admin_risk_workbench") {
    return "管理员风险工作台已进入预览；这里只聚合风险摘要，不执行禁用、不覆盖 AgentOps policy。";
  }
  if (actionId === "review_admin_risk_summary") {
    return "风险摘要可复核；低风险不代表前端拥有处置权，仍以 AgentOps 和审计事实源为准。";
  }
  if (actionId === "review_admin_risk_gap") {
    return "风险缺口已定位；Store 不展示 raw Trace 或 raw Evidence，也不暴露用户/设备明细。";
  }
  if (actionId === "review_security_revocation") {
    return "安全吊销已进入风险中心跳转预览；工作台不执行禁用、下架或吊销传播。";
  }
  if (actionId === "prepare_security_notification") {
    return "安全通知准备已进入预览；本阶段不发送真实通知，只展示可审计摘要。";
  }
  if (actionId === "complete_admin_policy_context") {
    return "策略上下文缺口已定位；补齐上下文不等于 Store 本地允许或签发 Grant。";
  }
  if (actionId === "open_version_history") {
    return "版本历史工作台已进入预览；这里只展示版本事实，不执行升级、回退或 AgentVersion 写入。";
  }
  if (actionId === "review_version_upgrade") {
    return "升级候选已进入版本复核；本阶段不自动升级、不下载包、不执行安装器。";
  }
  if (actionId === "view_version_revocation") {
    return "版本吊销摘要已进入预览；security_revoked 不能被降级为可升级或可运行。";
  }
  if (actionId === "review_version_rollback") {
    return "回退候选已进入版本复核；本阶段不执行回退、不改安装记录、不改 AgentVersion。";
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
  if (actionId === "open_agentops_run_detail") {
    return "已进入 AgentOps Run Detail 跳转预览；Store 只传递 sanitized run/session binding，不展示 raw Trace 或 Evidence。";
  }
  if (actionId === "open_sanitized_agentops_run_detail") {
    return "已进入已净化的 AgentOps Run Detail 跳转预览；上游 raw Trace/Evidence URL 已被剥离。";
  }
  if (actionId === "request_agentops_summary_with_run_binding") {
    return "已请求 AgentOps 重新提供 run/session binding；缺少绑定时 Store 不生成 Run Detail 跳转。";
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
  if (actionId === "submit_agentops_approval_request") {
    return "AgentOps 审批请求已进入可审计提交预览；Store 只组装请求，不产生 PolicyDecision、Approval 或 CapabilityGrant。";
  }
  if (actionId === "continue_store_flow") {
    return "AgentOps policy echo 允许继续 Store 流程；Store 仍只是 echo-only projection，不签发 CapabilityGrant。";
  }
  if (actionId === "complete_policy_context") {
    return "已定位审批策略上下文缺口；需补齐 policy_ref、risk、runtime contract、permission intents 和 data scopes。";
  }
  if (actionId === "add_approval_justification") {
    return "已要求补充审批理由；缺 justification 时不会向 AgentOps 分发审批请求。";
  }
  if (actionId === "assign_authorized_requester") {
    return "已要求指定授权 requester；只有 owner、security 或 agentops_admin 可发起审批请求。";
  }
  if (actionId === "view_agentops_approval") {
    return "已进入 AgentOps approval flow 链接预览；receipt 只表示已接收，不代表最终批准。";
  }
  if (actionId === "poll_agentops_approval_receipt") {
    return "已记录轮询 AgentOps approval receipt；pending receipt 不等于 approval decision。";
  }
  if (actionId === "fix_agentops_approval_request") {
    return "AgentOps 拒绝了审批请求 envelope；需要修复 request binding 或上下文后重新提交。";
  }
  if (actionId === "refresh_agentops_approval_receipt") {
    return "已请求刷新 AgentOps approval receipt；Store 不本地推导审批结果。";
  }
  if (actionId === "request_approval_refresh") {
    return "AgentOps approval echo 已过期；需要刷新 AgentOps 回显后才能继续 Store 流程。";
  }
  if (actionId === "view_blocking_policy") {
    return "已进入 AgentOps 阻断策略查看路径；Store 只展示阻断原因，不覆盖 AgentOps 裁决。";
  }
  if (actionId === "refresh_agentops_policy_echo") {
    return "已请求刷新 AgentOps policy approval echo；缺失或未知回显不得被 Store 解释为允许。";
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
      ownerGovernanceWorkbench: window.AgentStoreMock.ownerGovernanceWorkbench,
      installationRecordsWorkbench: window.AgentStoreMock.installationRecordsWorkbench,
      systemSettingsWorkbench: window.AgentStoreMock.systemSettingsWorkbench,
      adminRiskWorkbench: window.AgentStoreMock.adminRiskWorkbench,
      versionHistoryWorkbench: window.AgentStoreMock.versionHistoryWorkbench,
      installationDistribution: window.AgentStoreMock.installationDistribution,
      feedbackOwnerResponseLoops: window.AgentStoreMock.feedbackOwnerResponseLoops,
      lifecycleGovernance: window.AgentStoreMock.lifecycleGovernance,
      qualityEvidenceAccess: window.AgentStoreMock.qualityEvidenceAccess,
      storeOpsDeepLinks: window.AgentStoreMock.storeOpsDeepLinks,
      policyApprovalEchoes: window.AgentStoreMock.policyApprovalEchoes,
      managedInstallerPreviews: window.AgentStoreMock.managedInstallerPreviews,
      installationRuntimeHandoffs: window.AgentStoreMock.installationRuntimeHandoffs,
      policyApprovalRequests: window.AgentStoreMock.policyApprovalRequests,
      policyApprovalReceipts: window.AgentStoreMock.policyApprovalReceipts,
      notificationRouting: window.AgentStoreMock.notificationRouting,
      permissionDenialActions: window.AgentStoreMock.permissionDenialActions,
      packageValidationReports: window.AgentStoreMock.packageValidationReports,
      listingWizard: window.AgentStoreMock.listingWizard,
      draftReviewSubmissions: window.AgentStoreMock.draftReviewSubmissions,
      skillRegistryLifecycle: window.AgentStoreMock.skillRegistryLifecycle,
      contractRegistryTraceability: window.AgentStoreMock.contractRegistryTraceability,
      agentManifestRuntimeContracts: window.AgentStoreMock.agentManifestRuntimeContracts,
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
    selectedAgentManifestRuntimeContract: function selectedAgentManifestRuntimeContract() {
      var agent = this.selectedAgent;
      var contracts = this.agentManifestRuntimeContracts || {};
      var contract;
      if (!agent) {
        return {
          audit_id: "audit-empty-filter",
          trace_id: "trace-empty-filter",
          contract_schema_version: "agent_manifest_runtime_contract.v1",
          agent_id: "",
          version: "",
          artifact_hash: "",
          manifest_status: "incomplete",
          runtime_compatibility: "manifest_incomplete",
          required_runtime_capabilities: [],
          runtime_capabilities: [],
          missing_runtime_capabilities: [],
          manifest_summary: {
            manifest_schema_version: "",
            runtime_contract_version: "",
            skill_count: 0,
            permission_intent_count: 0,
            data_scope_count: 0,
            secret_ref_count: 0,
            network_allowlist_count: 0,
            guardrail_ref_count: 0,
            observability_contract: "",
            rollback_policy: "",
            provenance_ref: ""
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
            agent_manifest: "catalog_filter",
            package: "catalog_filter",
            skill_registry: "catalog_filter",
            runtime_availability: "not_applicable",
            policy_decision: "not_applicable"
          },
          next_action: this.selectedView.primary_action
        };
      }
      contract = contracts[agent.agent_id];
      if (contract) {
        return contract;
      }
      return {
        audit_id: "audit-manifest-missing-" + safeId(agent.agent_id),
        trace_id: "trace-manifest-missing-" + safeId(agent.agent_id),
        contract_schema_version: "agent_manifest_runtime_contract.v1",
        agent_id: agent.agent_id,
        version: agent.version,
        artifact_hash: "",
        manifest_status: "incomplete",
        runtime_compatibility: "manifest_incomplete",
        required_runtime_capabilities: [],
        runtime_capabilities: [],
        missing_runtime_capabilities: [],
        manifest_summary: {
          manifest_schema_version: "missing",
          runtime_contract_version: "",
          skill_count: 0,
          permission_intent_count: 0,
          data_scope_count: 0,
          secret_ref_count: 0,
          network_allowlist_count: 0,
          guardrail_ref_count: 0,
          observability_contract: "missing",
          rollback_policy: "",
          provenance_ref: ""
        },
        issues: [
          {
            issue_id: "AGENT_MANIFEST_RUNTIME_CONTRACT_MISSING",
            field_path: "agent_manifest_runtime_contract",
            severity: "blocked",
            fix_action_id: "complete_agent_manifest",
            message_key: "agentManifest.runtimeContractMissing"
          }
        ],
        source_of_truth: {
          agent_manifest: "frontend_fallback_no_agent_manifest_runtime_contract",
          package: "agent_store",
          skill_registry: "agent_store",
          runtime_availability: "agent_runtime_echo_or_probe",
          policy_decision: "agentops"
        },
        next_action: {
          action_id: "complete_agent_manifest",
          target_system: "agent_store",
          enabled: true,
          requires_permission: true,
          audit_required: true
        }
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
    selectedStoreOpsDeepLink: function selectedStoreOpsDeepLink() {
      var agent = this.selectedAgent;
      var link;
      var summaries = this.storeOpsDeepLinks || {};
      if (!agent) {
        return {
          contract_schema_version: "store_ops_deep_link.v1",
          agent_id: "",
          agent_version: "",
          health_summary_id: "",
          run_id: "",
          session_id: "",
          evidence_summary_id: "",
          link_state: "link_unavailable",
          permission_state: "unavailable",
          target: {
            system: "agentops",
            route: "run_detail",
            href: "",
            params: {
              run_id: "",
              session_id: "",
              return_path: "/agent-store/agents"
            },
            raw_trace_url: "",
            raw_evidence_url: ""
          },
          return_path: "/agent-store/agents",
          raw_trace_exposed: false,
          raw_evidence_exposed: false,
          issues: [
            {
              issue_id: "CATALOG_FILTER_EMPTY",
              field_path: "catalog_filter",
              severity: "warning",
              fix_action_id: "adjust_catalog_filters"
            }
          ],
          source_of_truth: {
            health_summary: "agentops",
            run_detail: "agentops",
            permission: "agent_store_viewer_context",
            raw_trace: "evidence_vault",
            projection: "agent_store"
          },
          next_action: this.selectedView.primary_action
        };
      }
      link = summaries[agent.agent_id];
      if (link) {
        return link;
      }
      return {
        contract_schema_version: "store_ops_deep_link.v1",
        agent_id: agent.agent_id,
        agent_version: agent.version,
        health_summary_id: "",
        run_id: "",
        session_id: "",
        evidence_summary_id: "",
        link_state: "link_unavailable",
        permission_state: "unavailable",
        target: {
          system: "agentops",
          route: "run_detail",
          href: "",
          params: {
            run_id: "",
            session_id: "",
            return_path: "/agent-store/agents/" + safeId(agent.agent_id)
          },
          raw_trace_url: "",
          raw_evidence_url: ""
        },
        return_path: "/agent-store/agents/" + safeId(agent.agent_id),
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
      };
    },
    selectedPolicyApprovalEcho: function selectedPolicyApprovalEcho() {
      var agent = this.selectedAgent;
      var echo;
      var echoes = this.policyApprovalEchoes || {};
      if (!agent) {
        return {
          contract_schema_version: "policy_approval_echo.v1",
          agent_id: "",
          agent_version: "",
          echo_state: "agentops_echo_unavailable",
          policy_decision: {
            policy_decision_id: "",
            decision: "",
            policy_ref: "",
            reason_code: "catalog_filter",
            evaluated_at: "",
            valid_until: "",
            agentops_trace_id: "",
            agentops_audit_id: ""
          },
          approval_summary: {
            approval_id: "",
            status: "not_required",
            decision: "",
            expires_at: "",
            request_access_url: "",
            agentops_audit_id: ""
          },
          store_projection: {
            projection_mode: "agentops_echo_only",
            store_decision_authority: "none",
            agentops_decision: "",
            store_override_allowed: false,
            capability_grant_issued: false,
            store_may_continue: false,
            store_block_reason: "catalog_filter"
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
            policy_decision: "agentops",
            approval: "agentops",
            capability_grant: "agentops_not_issued_by_store",
            store_projection: "agent_store_echo_only"
          },
          next_action: this.selectedView.primary_action
        };
      }
      echo = echoes[agent.agent_id];
      if (echo) {
        return echo;
      }
      return {
        contract_schema_version: "policy_approval_echo.v1",
        agent_id: agent.agent_id,
        agent_version: agent.version,
        echo_state: "agentops_echo_unavailable",
        policy_decision: {
          policy_decision_id: "",
          decision: "",
          policy_ref: "",
          reason_code: "agentops_echo_missing",
          evaluated_at: "",
          valid_until: "",
          agentops_trace_id: "",
          agentops_audit_id: ""
        },
        approval_summary: {
          approval_id: "",
          status: "not_required",
          decision: "",
          expires_at: "",
          request_access_url: "",
          agentops_audit_id: ""
        },
        store_projection: {
          projection_mode: "agentops_echo_only",
          store_decision_authority: "none",
          agentops_decision: "",
          store_override_allowed: false,
          capability_grant_issued: false,
          store_may_continue: false,
          store_block_reason: "agentops_echo_unavailable"
        },
        issues: [
          {
            issue_id: "AGENTOPS_POLICY_ECHO_INCOMPLETE",
            field_path: "agentops_policy_echo.policy_decision",
            severity: "blocked",
            fix_action_id: "refresh_agentops_policy_echo"
          }
        ],
        source_of_truth: {
          policy_decision: "agentops",
          approval: "agentops",
          capability_grant: "agentops_not_issued_by_store",
          store_projection: "agent_store_echo_only"
        },
        next_action: {
          action_id: "refresh_agentops_policy_echo",
          target_system: "agentops",
          enabled: true,
          requires_permission: true,
          audit_required: true
        }
      };
    },
    selectedInstallationRuntimeHandoff: function selectedInstallationRuntimeHandoff() {
      var agent = this.selectedAgent;
      var handoffs = this.installationRuntimeHandoffs || {};
      var handoff;
      if (!agent) {
        return {
          contract_schema_version: "installation_runtime_handoff.v1",
          handoff_id: "",
          installation_id: "",
          handoff_state: "installation_not_ready",
          display_name_zh: "安装未就绪",
          reason_code: "catalog_filter_empty",
          reason: "当前没有可交接给 Runtime 的 installation 或 device binding。",
          runtime_consumption_allowed: false,
          installation: {
            installation_id: "",
            device_id: "",
            agent_id: "",
            agent_version: "",
            artifact_hash: "",
            status: "not_installed",
            enterprise_state: "detected_optional"
          },
          device_binding: {
            device_id: "",
            installation_id: "",
            user: "",
            artifact_hash: "",
            device_public_key_thumbprint: "",
            status: "revoked"
          },
          runtime_echo: {
            runtime_id: "",
            installation_id: "",
            device_id: "",
            artifact_hash: "",
            observed_at: "",
            handoff_ref: ""
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
            installation: "catalog_filter",
            device_binding: "catalog_filter",
            package: "catalog_filter",
            runtime_consumption: "not_applicable",
            policy_decision: "not_applicable"
          },
          next_action: this.selectedView.primary_action
        };
      }
      handoff = handoffs[agent.agent_id];
      if (handoff) {
        return handoff;
      }
      return {
        contract_schema_version: "installation_runtime_handoff.v1",
        handoff_id: "runtime-handoff-missing-" + safeId(agent.agent_id),
        installation_id: "",
        handoff_state: "installation_not_ready",
        display_name_zh: "安装未就绪",
        reason_code: "installation_runtime_handoff_missing",
        reason: "缺少 installation_runtime_handoff envelope，前端只能展示 Runtime 不可消费的保守状态。",
        runtime_consumption_allowed: false,
        installation: {
          installation_id: "",
          device_id: "",
          agent_id: agent.agent_id,
          agent_version: agent.version,
          artifact_hash: agent.artifact_hash || "",
          status: "not_installed",
          enterprise_state: agent.enterprise_state || "detected_optional"
        },
        device_binding: {
          device_id: "",
          installation_id: "",
          user: "",
          artifact_hash: "",
          device_public_key_thumbprint: "",
          status: "revoked"
        },
        runtime_echo: {
          runtime_id: "",
          installation_id: "",
          device_id: "",
          artifact_hash: "",
          observed_at: "",
          handoff_ref: ""
        },
        issues: [
          {
            issue_id: "INSTALLATION_RUNTIME_HANDOFF_MISSING",
            field_path: "installation_runtime_handoff",
            severity: "blocked",
            fix_action_id: "review_installation_status",
            message_key: "installationRuntime.handoffMissing"
          }
        ],
        source_of_truth: {
          installation: "frontend_fallback_no_installation_runtime_handoff",
          device_binding: "frontend_fallback_no_installation_runtime_handoff",
          package: "agent_store",
          runtime_consumption: "agent_runtime_echo_or_request",
          policy_decision: "agentops"
        },
        next_action: {
          action_id: "review_installation_status",
          target_system: "agent_store",
          enabled: true,
          requires_permission: true,
          audit_required: true
        }
      };
    },
    selectedManagedInstallerPreview: function selectedManagedInstallerPreview() {
      var agent = this.selectedAgent;
      var previews = this.managedInstallerPreviews || {};
      var preview;
      if (!agent) {
        return {
          contract_schema_version: "managed_installer_preview.v1",
          agent_id: "",
          agent_version: "",
          installer_state: "download_blocked",
          execution_mode: "preview_only",
          real_install_started: false,
          package: {
            package_id: "",
            artifact_hash: "",
            artifact_url: "",
            download_state: "missing",
            signature_state: "",
            hash_match_state: ""
          },
          policy_gate: {
            echo_state: "agentops_echo_unavailable",
            store_may_continue: false,
            store_override_allowed: false,
            capability_grant_issued: false
          },
          runtime_gate: {
            handoff_state: "",
            runtime_consumption_allowed: false,
            installation_id: "",
            device_id: ""
          },
          isolation: {
            isolation_profile: "basic_sandbox",
            network_mode: "policy_bound",
            filesystem_mode: "scoped_write"
          },
          smoke_test: {
            smoke_test_state: "not_run",
            smoke_test_ref: ""
          },
          steps: [],
          issues: [
            {
              issue_id: "CATALOG_FILTER_EMPTY",
              field_path: "catalog_filter",
              severity: "warning",
              fix_action_id: "adjust_catalog_filters"
            }
          ],
          diagnostics: {
            diagnostic_ref: "diag-managed-installer-filter-empty",
            failure_stage: "catalog_filter",
            reason_code: "CATALOG_FILTER_EMPTY",
            copyable: true
          },
          source_of_truth: {
            package: "agent_store_package_trust",
            policy_approval: "agentops_via_policy_approval_echo",
            runtime_handoff: "agent_store_installation_runtime_handoff",
            installer_execution: "not_started_preview_only",
            diagnostics: "agent_store_preview"
          },
          next_action: this.selectedView.primary_action
        };
      }
      preview = previews[agent.agent_id];
      if (preview) {
        return preview;
      }
      return {
        contract_schema_version: "managed_installer_preview.v1",
        agent_id: agent.agent_id,
        agent_version: agent.version,
        installer_state: "runtime_handoff_blocked",
        execution_mode: "preview_only",
        real_install_started: false,
        package: {
          package_id: "pkg-" + safeId(agent.agent_id),
          artifact_hash: agent.artifact_hash || "",
          artifact_url: "",
          download_state: "missing",
          signature_state: "unknown",
          hash_match_state: "unknown"
        },
        policy_gate: {
          echo_state: this.selectedPolicyApprovalEcho.echo_state,
          store_may_continue: false,
          store_override_allowed: false,
          capability_grant_issued: false
        },
        runtime_gate: {
          handoff_state: "runtime_handoff_missing",
          runtime_consumption_allowed: false,
          installation_id: "",
          device_id: ""
        },
        isolation: {
          isolation_profile: "basic_sandbox",
          network_mode: "policy_bound",
          filesystem_mode: "scoped_write"
        },
        smoke_test: {
          smoke_test_state: "not_run",
          smoke_test_ref: ""
        },
        steps: [
          {
            step_id: "download_artifact",
            label: "下载安装包",
            step_state: "blocked",
            owner_system: "agent_store",
            diagnostic_ref: "diag-managed-installer-missing-" + safeId(agent.agent_id)
          },
          {
            step_id: "verify_signature",
            label: "校验签名与 hash",
            step_state: "blocked",
            owner_system: "agent_store",
            diagnostic_ref: "diag-managed-installer-missing-" + safeId(agent.agent_id)
          },
          {
            step_id: "create_isolated_install",
            label: "创建隔离安装",
            step_state: "blocked",
            owner_system: "agent_runtime",
            diagnostic_ref: "diag-managed-installer-missing-" + safeId(agent.agent_id)
          },
          {
            step_id: "smoke_test",
            label: "运行 smoke test",
            step_state: "blocked",
            owner_system: "agent_runtime",
            diagnostic_ref: "diag-managed-installer-missing-" + safeId(agent.agent_id)
          },
          {
            step_id: "failure_diagnostics",
            label: "生成失败诊断",
            step_state: "ready",
            owner_system: "agent_store",
            diagnostic_ref: "diag-managed-installer-missing-" + safeId(agent.agent_id)
          }
        ],
        issues: [
          {
            issue_id: "MANAGED_INSTALLER_PREVIEW_MISSING",
            field_path: "managed_installer_preview",
            severity: "blocked",
            fix_action_id: "refresh_managed_installer_preview"
          }
        ],
        diagnostics: {
          diagnostic_ref: "diag-managed-installer-missing-" + safeId(agent.agent_id),
          failure_stage: "managed_installer_preview",
          reason_code: "MANAGED_INSTALLER_PREVIEW_MISSING",
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
          action_id: "refresh_managed_installer_preview",
          target_system: "agent_store",
          enabled: true,
          requires_permission: true,
          audit_required: true
        }
      };
    },
    selectedPolicyApprovalRequest: function selectedPolicyApprovalRequest() {
      var agent = this.selectedAgent;
      var request;
      var requests = this.policyApprovalRequests || {};
      if (!agent) {
        return {
          contract_schema_version: "policy_approval_request.v1",
          agent_id: "",
          agent_version: "",
          requested_action: "install_agent",
          request_state: "approval_request_blocked",
          requester: {
            actor_id: "",
            actor_role: "",
            tenant_id: ""
          },
          policy_context: {
            policy_ref: "",
            risk_level: "",
            runtime_contract_version: "",
            permission_intents: [],
            data_scopes: []
          },
          justification: "",
          agentops_request: {
            target_system: "agentops",
            request_contract: "policy_approval_request.v1",
            agent_id: "",
            agent_version: "",
            requested_action: "install_agent",
            requester: {},
            policy_context: {},
            justification: "",
            store_audit_id: "",
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
              issue_id: "CATALOG_FILTER_EMPTY",
              field_path: "catalog_filter",
              severity: "warning",
              fix_action_id: "adjust_catalog_filters"
            }
          ],
          source_of_truth: {
            approval_request: "agent_store",
            policy_decision: "agentops",
            approval: "agentops",
            capability_grant: "agentops_not_issued_by_store",
            request_audit: "agent_store"
          },
          next_action: this.selectedView.primary_action
        };
      }
      request = requests[agent.agent_id];
      if (request) {
        return request;
      }
      return {
        contract_schema_version: "policy_approval_request.v1",
        agent_id: agent.agent_id,
        agent_version: agent.version,
        requested_action: "install_agent",
        request_state: "policy_context_incomplete",
        requester: {
          actor_id: agent.owner_user || "",
          actor_role: "owner",
          tenant_id: "tenant-default"
        },
        policy_context: {
          policy_ref: "",
          risk_level: "unknown",
          runtime_contract_version: "",
          permission_intents: [],
          data_scopes: []
        },
        justification: "",
        agentops_request: {
          target_system: "agentops",
          request_contract: "policy_approval_request.v1",
          agent_id: agent.agent_id,
          agent_version: agent.version,
          requested_action: "install_agent",
          requester: {},
          policy_context: {},
          justification: "",
          store_audit_id: "audit-policy-approval-missing-" + safeId(agent.agent_id),
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
            field_path: "policy_context",
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
      };
    },
    selectedPolicyApprovalReceipt: function selectedPolicyApprovalReceipt() {
      var agent = this.selectedAgent;
      var receipt;
      var receipts = this.policyApprovalReceipts || {};
      if (!agent) {
        return {
          contract_schema_version: "policy_approval_receipt.v1",
          agent_id: "",
          agent_version: "",
          requested_action: "install_agent",
          receipt_state: "approval_receipt_unavailable",
          approval_request_ref: {
            request_contract: "policy_approval_request.v1",
            agent_id: "",
            agent_version: "",
            requested_action: "install_agent",
            store_audit_id: ""
          },
          agentops_receipt: {
            receipt_contract: "policy_approval_receipt.v1",
            approval_request_id: "",
            approval_id: "",
            receipt_status: "pending",
            agent_id: "",
            agent_version: "",
            requested_action: "install_agent",
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
              issue_id: "CATALOG_FILTER_EMPTY",
              field_path: "catalog_filter",
              severity: "warning",
              fix_action_id: "adjust_catalog_filters"
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
          next_action: this.selectedView.primary_action
        };
      }
      receipt = receipts[agent.agent_id];
      if (receipt) {
        return receipt;
      }
      return {
        contract_schema_version: "policy_approval_receipt.v1",
        agent_id: agent.agent_id,
        agent_version: agent.version,
        requested_action: "install_agent",
        receipt_state: "approval_receipt_unavailable",
        approval_request_ref: {
          request_contract: "policy_approval_request.v1",
          agent_id: agent.agent_id,
          agent_version: agent.version,
          requested_action: "install_agent",
          store_audit_id: "audit-policy-approval-missing-" + safeId(agent.agent_id)
        },
        agentops_receipt: {
          receipt_contract: "policy_approval_receipt.v1",
          approval_request_id: "",
          approval_id: "",
          receipt_status: "pending",
          agent_id: agent.agent_id,
          agent_version: agent.version,
          requested_action: "install_agent",
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
    selectedVersionHistoryWorkbench: function selectedVersionHistoryWorkbench() {
      var agent = this.selectedAgent;
      var histories = this.versionHistoryWorkbench || {};
      var history;
      if (!agent) {
        return {
          contract_schema_version: "version_history_workbench.v1",
          agent_id: "",
          version_state: "version_history_unavailable",
          current_version: "",
          latest_version: "",
          release_status: "unknown",
          artifact_trust: {
            artifact_hash: "",
            signature_state: "unknown",
            issuer: "",
            package_validation_state: "unknown"
          },
          upgrade_cue: {
            upgrade_state: "not_applicable",
            candidate_version: "",
            action_mode: "disabled"
          },
          rollback_cue: {
            rollback_state: "not_applicable",
            rollback_version: "",
            action_mode: "disabled"
          },
          replacement_cue: {
            replacement_state: "not_applicable",
            replacement_agent_id: "",
            mapping_source: "not_applicable",
            explicit_mapping_only: true
          },
          affected_scope: {
            affected_install_count: 0,
            affected_user_count_redacted: true,
            affected_device_details_exposed: false,
            notification_state: "not_applicable"
          },
          source_of_truth: {
            agent_version: "catalog_filter",
            package_trust: "not_applicable",
            lifecycle: "not_applicable",
            installation: "not_applicable",
            notification: "not_applicable"
          },
          audit_fields: {
            audit_id: "",
            trace_id: "",
            generated_at: ""
          },
          boundary_flags: [
            "no auto upgrade",
            "no rollback execution",
            "no AgentVersion mutation",
            "no replacement algorithm",
            "no raw Evidence"
          ],
          next_action: this.selectedView.primary_action
        };
      }
      history = histories[agent.agent_id];
      if (history) {
        return history;
      }
      return {
        contract_schema_version: "version_history_workbench.v1",
        agent_id: agent.agent_id,
        version_state: "version_history_unavailable",
        current_version: agent.version,
        latest_version: "",
        release_status: agent.release_status || "unknown",
        artifact_trust: {
          artifact_hash: "",
          signature_state: "unknown",
          issuer: "",
          package_validation_state: "unknown"
        },
        upgrade_cue: {
          upgrade_state: "unknown",
          candidate_version: "",
          action_mode: "disabled"
        },
        rollback_cue: {
          rollback_state: "unknown",
          rollback_version: "",
          action_mode: "disabled"
        },
        replacement_cue: {
          replacement_state: "unknown",
          replacement_agent_id: "",
          mapping_source: "frontend_fallback_no_version_history_workbench",
          explicit_mapping_only: true
        },
        affected_scope: {
          affected_install_count: 0,
          affected_user_count_redacted: true,
          affected_device_details_exposed: false,
          notification_state: "unknown"
        },
        source_of_truth: {
          agent_version: "frontend_fallback_no_version_history_workbench",
          package_trust: "agent_store_package_trust",
          lifecycle: "lifecycle_governance_baseline.v1",
          installation: "installation_records_workbench.v1",
          notification: "notification_routing_summary.v1"
        },
        audit_fields: {
          audit_id: "audit-version-history-missing-" + safeId(agent.agent_id),
          trace_id: "trace-version-history-missing-" + safeId(agent.agent_id),
          generated_at: ""
        },
        boundary_flags: [
          "no auto upgrade",
          "no rollback execution",
          "no AgentVersion mutation",
          "no replacement algorithm",
          "no raw Evidence"
        ],
        next_action: {
          action_id: "refresh_version_history",
          target_system: "agent_store",
          enabled: true,
          requires_permission: false,
          audit_required: true
        }
      };
    },
    selectedAdminRiskWorkbench: function selectedAdminRiskWorkbench() {
      var agent = this.selectedAgent;
      var risks = this.adminRiskWorkbench || {};
      var workbench;
      if (!agent) {
        return {
          contract_schema_version: "admin_risk_workbench.v1",
          agent_id: "",
          risk_state: "risk_unknown",
          risk_level: "unknown",
          runtime_risk_level: "unknown",
          evidence_gaps: [],
          policy_signal: {
            policy_state: "not_applicable",
            policy_ref: "",
            approval_status: "not_applicable",
            policy_override_allowed: false
          },
          permission_signal: {
            permission_state: "not_applicable",
            denied_scope: "",
            capability_grant_issued: false,
            user_device_details_exposed: false
          },
          security_actions: [],
          source_of_truth: {
            risk: "catalog_filter",
            policy: "not_applicable",
            permission: "not_applicable",
            evidence: "not_applicable",
            lifecycle: "not_applicable",
            notification: "not_applicable"
          },
          audit_fields: {
            audit_id: "",
            trace_id: "",
            generated_at: ""
          },
          boundary_flags: [
            "no disable execution",
            "no lifecycle mutation",
            "no AgentOps policy override",
            "no CapabilityGrant",
            "no raw Evidence"
          ],
          next_action: this.selectedView.primary_action
        };
      }
      workbench = risks[agent.agent_id];
      if (workbench) {
        return workbench;
      }
      return {
        contract_schema_version: "admin_risk_workbench.v1",
        agent_id: agent.agent_id,
        risk_state: "risk_unknown",
        risk_level: "unknown",
        runtime_risk_level: "unknown",
        evidence_gaps: [
          {
            gap_id: "ADMIN_RISK_WORKBENCH_MISSING",
            source_contract: "admin_risk_workbench.v1",
            severity: "blocked",
            summary: "Admin risk envelope is missing; frontend cannot infer low risk or safety pass."
          }
        ],
        policy_signal: {
          policy_state: "unknown",
          policy_ref: "",
          approval_status: "unknown",
          policy_override_allowed: false
        },
        permission_signal: {
          permission_state: "unknown",
          denied_scope: "",
          capability_grant_issued: false,
          user_device_details_exposed: false
        },
        security_actions: [
          {
            action_id: "refresh_admin_risk_summary",
            action_state: "required",
            target_system: "agent_store",
            requires_security_role: true,
            execution_mode: "preview_only"
          }
        ],
        source_of_truth: {
          risk: "frontend_fallback_no_admin_risk_workbench",
          policy: "agentops_policy_echo",
          permission: "permission_denial_action_summary.v1",
          evidence: "quality_evidence_access_summary.v1",
          lifecycle: "lifecycle_governance_baseline.v1",
          notification: "notification_routing_summary.v1"
        },
        audit_fields: {
          audit_id: "audit-admin-risk-missing-" + safeId(agent.agent_id),
          trace_id: "trace-admin-risk-missing-" + safeId(agent.agent_id),
          generated_at: ""
        },
        boundary_flags: [
          "no disable execution",
          "no lifecycle mutation",
          "no AgentOps policy override",
          "no CapabilityGrant",
          "no raw Evidence"
        ],
        next_action: {
          action_id: "refresh_admin_risk_summary",
          target_system: "agent_store",
          enabled: true,
          requires_permission: true,
          audit_required: true
        }
      };
    },
    selectedSystemSettingsWorkbench: function selectedSystemSettingsWorkbench() {
      var agent = this.selectedAgent;
      var settings = this.systemSettingsWorkbench || {};
      var workbench;
      if (!agent) {
        return {
          contract_schema_version: "system_settings_workbench.v1",
          agent_id: "",
          settings_state: "settings_unavailable",
          taxonomy_summary: {
            category_state: "not_applicable",
            tags_state: "not_applicable",
            category_count: 0,
            tag_count: 0,
            blocked_terms: []
          },
          recommendation_slot: {
            slot_state: "not_applicable",
            collection: "",
            rank_source: "not_applicable",
            override_allowed: false
          },
          mirror_source: {
            mirror_state: "not_applicable",
            active_mirror: "",
            signature_policy: "",
            fallback_mirror: ""
          },
          installer_config: {
            config_state: "not_applicable",
            managed_installer_enabled: false,
            isolation_policy: "",
            smoke_test_required: false
          },
          agentops_endpoint: {
            endpoint_state: "not_applicable",
            endpoint_ref_redacted: "",
            credential_state: "not_applicable",
            secret_exposed: false
          },
          source_of_truth: {
            taxonomy: "catalog_filter",
            recommendation: "not_applicable",
            mirror: "not_applicable",
            installer: "not_applicable",
            endpoint: "not_applicable",
            credential: "not_applicable"
          },
          audit_fields: {
            audit_id: "",
            trace_id: "",
            generated_at: ""
          },
          boundary_flags: [
            "no settings mutation",
            "no credential exposure",
            "no recommendation override",
            "no installer execution",
            "no endpoint rewrite"
          ],
          next_action: this.selectedView.primary_action
        };
      }
      workbench = settings[agent.agent_id];
      if (workbench) {
        return workbench;
      }
      return {
        contract_schema_version: "system_settings_workbench.v1",
        agent_id: agent.agent_id,
        settings_state: "settings_unavailable",
        taxonomy_summary: {
          category_state: "unknown",
          tags_state: "unknown",
          category_count: 0,
          tag_count: 0,
          blocked_terms: []
        },
        recommendation_slot: {
          slot_state: "unknown",
          collection: "",
          rank_source: "frontend_fallback_no_system_settings_workbench",
          override_allowed: false
        },
        mirror_source: {
          mirror_state: "unknown",
          active_mirror: "",
          signature_policy: "unknown",
          fallback_mirror: ""
        },
        installer_config: {
          config_state: "unknown",
          managed_installer_enabled: false,
          isolation_policy: "unknown",
          smoke_test_required: false
        },
        agentops_endpoint: {
          endpoint_state: "unknown",
          endpoint_ref_redacted: "",
          credential_state: "unknown",
          secret_exposed: false
        },
        source_of_truth: {
          taxonomy: "frontend_fallback_no_system_settings_workbench",
          recommendation: "agent_store_curated_projection",
          mirror: "agent_store_mirror_registry",
          installer: "managed_installer_preview.v1",
          endpoint: "agentops_endpoint_registry",
          credential: "agentops_credential_echo"
        },
        audit_fields: {
          audit_id: "audit-system-settings-missing-" + safeId(agent.agent_id),
          trace_id: "trace-system-settings-missing-" + safeId(agent.agent_id),
          generated_at: ""
        },
        boundary_flags: [
          "no settings mutation",
          "no credential exposure",
          "no recommendation override",
          "no installer execution",
          "no endpoint rewrite"
        ],
        next_action: {
          action_id: "refresh_system_settings_summary",
          target_system: "agent_store",
          enabled: true,
          requires_permission: true,
          audit_required: true
        }
      };
    },
    selectedInstallationRecordsWorkbench: function selectedInstallationRecordsWorkbench() {
      var agent = this.selectedAgent;
      var records = this.installationRecordsWorkbench || {};
      var workbench;
      if (!agent) {
        return {
          contract_schema_version: "installation_records_workbench.v1",
          agent_id: "",
          version: "",
          installation_state: "records_unavailable",
          installation_id: "",
          device_binding_state: "not_applicable",
          device_label: "",
          runtime_state: "runtime_unknown",
          version_cue: {
            installed_version: "",
            latest_version: "",
            upgrade_state: "not_applicable",
            candidate_version: ""
          },
          health_cue: {
            freshness_state: "not_applicable",
            summary_state: "not_applicable",
            valid_until: "",
            recommendation_basis_allowed: false,
            basis_guard: "health_summary_not_recommendation_basis"
          },
          revocation_notice: {
            notice_state: "none",
            reason: "",
            effective_at: "",
            replacement_agent_id: ""
          },
          source_of_truth: {
            installation: "catalog_filter",
            device_binding: "not_applicable",
            runtime: "not_applicable",
            health: "not_applicable",
            lifecycle: "not_applicable",
            notification: "not_applicable"
          },
          audit_fields: {
            audit_id: "",
            trace_id: "",
            generated_at: ""
          },
          boundary_flags: [
            "no real install",
            "no Runtime launch",
            "no raw Trace",
            "no policy bypass"
          ],
          next_action: this.selectedView.primary_action
        };
      }
      workbench = records[agent.agent_id];
      if (workbench) {
        return workbench;
      }
      return {
        contract_schema_version: "installation_records_workbench.v1",
        agent_id: agent.agent_id,
        version: agent.version,
        installation_state: "records_unavailable",
        installation_id: "",
        device_binding_state: "unknown",
        device_label: "",
        runtime_state: "runtime_unknown",
        version_cue: {
          installed_version: "",
          latest_version: agent.version,
          upgrade_state: "unknown",
          candidate_version: ""
        },
        health_cue: {
          freshness_state: "health_summary_unavailable",
          summary_state: "unknown",
          valid_until: "",
          recommendation_basis_allowed: false,
          basis_guard: "health_summary_not_recommendation_basis"
        },
        revocation_notice: {
          notice_state: "unknown",
          reason: "Installation records envelope is missing; the frontend must not infer installed, runnable, or upgrade-ready state.",
          effective_at: "",
          replacement_agent_id: ""
        },
        source_of_truth: {
          installation: "frontend_fallback_no_installation_records_workbench",
          device_binding: "installation_runtime_handoff.v1",
          runtime: "runtime_availability_summary.v1",
          health: "health_summary_freshness.v1",
          lifecycle: "lifecycle_governance_baseline.v1",
          notification: "notification_routing_summary.v1"
        },
        audit_fields: {
          audit_id: "audit-install-records-missing-" + safeId(agent.agent_id),
          trace_id: "trace-install-records-missing-" + safeId(agent.agent_id),
          generated_at: ""
        },
        boundary_flags: [
          "no real install",
          "no Runtime launch",
          "no raw Trace",
          "no policy bypass"
        ],
        next_action: {
          action_id: "refresh_installation_records",
          target_system: "agent_store",
          enabled: true,
          requires_permission: false,
          audit_required: true
        }
      };
    },
    selectedOwnerGovernanceWorkbench: function selectedOwnerGovernanceWorkbench() {
      var agent = this.selectedAgent;
      var workbenches = this.ownerGovernanceWorkbench || {};
      var workbench;
      if (!agent) {
        return {
          contract_schema_version: "owner_governance_workbench.v1",
          agent_id: "",
          version: "",
          owner_team: "unassigned",
          queue_state: "attention_required",
          pending_counts: {
            draft_review: 0,
            policy_approval: 0,
            feedback: 0,
            lifecycle: 0,
            installation_distribution: 0,
            package_validation: 0,
            quality_evidence: 0
          },
          risk_summary: {
            highest_risk: "catalog_filter_empty",
            blocked_count: 0,
            attention_count: 1,
            sla_state: "not_applicable"
          },
          focus_items: [],
          source_of_truth: {
            owner_queue: "catalog_filter",
            approval: "not_applicable",
            feedback: "not_applicable",
            lifecycle: "not_applicable",
            quality: "not_applicable",
            raw_evidence: "not_applicable"
          },
          audit_fields: {
            audit_id: "",
            trace_id: "",
            generated_at: ""
          },
          boundary_flags: [
            "no real approval",
            "no notification sending",
            "no AgentVersion mutation",
            "no AgentOps override"
          ],
          next_action: this.selectedView.primary_action
        };
      }
      workbench = workbenches[agent.agent_id];
      if (workbench) {
        return workbench;
      }
      return {
        contract_schema_version: "owner_governance_workbench.v1",
        agent_id: agent.agent_id,
        version: agent.version,
        owner_team: agent.owner_team,
        queue_state: "attention_required",
        pending_counts: {
          draft_review: 0,
          policy_approval: 0,
          feedback: 0,
          lifecycle: 0,
          installation_distribution: 0,
          package_validation: 0,
          quality_evidence: 0
        },
        risk_summary: {
          highest_risk: "owner_workbench_envelope_missing",
          blocked_count: 1,
          attention_count: 1,
          sla_state: "source_missing"
        },
        focus_items: [
          {
            item_id: "OWNER_GOVERNANCE_WORKBENCH_MISSING",
            source_contract: "owner_governance_workbench.v1",
            item_state: "blocked",
            summary: "Owner 工作台 envelope 缺失，不能把未知队列展示为健康。",
            next_action_id: "refresh_owner_governance_workbench"
          }
        ],
        source_of_truth: {
          owner_queue: "frontend_fallback_no_owner_governance_workbench",
          approval: "agentops_approval_echo",
          feedback: "agent_store_feedback_loop",
          lifecycle: "agent_store_lifecycle_governance",
          quality: "agentops_summary_echo",
          raw_evidence: "evidence_vault"
        },
        audit_fields: {
          audit_id: "audit-owner-workbench-missing-" + safeId(agent.agent_id),
          trace_id: "trace-owner-workbench-missing-" + safeId(agent.agent_id),
          generated_at: ""
        },
        boundary_flags: [
          "no real approval",
          "no notification sending",
          "no AgentVersion mutation",
          "no AgentOps override"
        ],
        next_action: {
          action_id: "refresh_owner_governance_workbench",
          target_system: "agent_store",
          enabled: true,
          requires_permission: true,
          audit_required: true
        }
      };
    },
    selectedPackageValidationReport: function selectedPackageValidationReport() {
      var agent = this.selectedAgent;
      var report;
      var reports = this.packageValidationReports || {};
      if (!agent) {
        return {
          contract_schema_version: "package_validation_report.v1",
          package_id: "not-applicable",
          agent_id: "",
          validation_status: "validation_failed",
          draft_status: "not_applicable",
          issues: [
            {
              issue_id: "CATALOG_FILTER_EMPTY",
              field_path: "catalog_filter",
              severity: "warning",
              fix_action_id: "adjust_catalog_filters"
            }
          ],
          fix_prompts: [],
          evidence_summary: {
            manifest_lock: "",
            sbom_ref: "",
            scan_report_ref: "",
            ai_generated_field_count: 0,
            owner_confirmed_field_count: 0
          },
          source_of_truth: {
            package_manifest: "catalog_filter",
            validation_report: "not_applicable",
            ai_generated_fields: "not_applicable",
            skill_registry: "not_applicable"
          },
          next_action: this.selectedView.primary_action
        };
      }
      report = reports[agent.agent_id];
      if (report) {
        return report;
      }
      return {
        contract_schema_version: "package_validation_report.v1",
        package_id: agent.agent_id + "@" + agent.version,
        agent_id: agent.agent_id,
        validation_status: "validation_failed",
        draft_status: "validation_failed",
        issues: [
          {
            issue_id: "PACKAGE_VALIDATION_REPORT_MISSING",
            field_path: "package_validation",
            severity: "blocked",
            fix_action_id: "return_to_validation_report",
            message_key: "packageValidation.reportMissing"
          }
        ],
        fix_prompts: [
          {
            prompt_id: "fix-package-validation-report-missing",
            target_field: "package_validation",
            title: "Return to validation report",
            prompt_text: "Regenerate the Package Validation report from the uploaded package candidate.",
            source_issue_id: "PACKAGE_VALIDATION_REPORT_MISSING",
            safe_to_apply_in_store: false
          }
        ],
        evidence_summary: {
          manifest_lock: "",
          sbom_ref: "",
          scan_report_ref: "",
          ai_generated_field_count: 0,
          owner_confirmed_field_count: 0
        },
        source_of_truth: {
          package_manifest: "agent_store_upload_candidate",
          validation_report: "frontend_fallback_no_package_validation_report",
          ai_generated_fields: "candidate_only_until_user_confirmed",
          skill_registry: "agent_store_skill_registry_pending"
        },
        next_action: {
          action_id: "return_to_validation_report",
          target_system: "agent_store",
          enabled: true,
          requires_permission: true,
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
    selectedDraftReviewSubmission: function selectedDraftReviewSubmission() {
      var agent = this.selectedAgent;
      var submissions = this.draftReviewSubmissions || {};
      var submission;
      var wizard = this.selectedListingWizard;
      if (!agent) {
        return {
          contract_schema_version: "draft_review_submission.v1",
          submission_id: "",
          package_id: "not-applicable",
          agent_id: "",
          submission_state: "validation_blocked",
          draft_status: "draft_review_blocked",
          review_queue_entry: {
            queue_state: "not_enqueued",
            review_status: "not_submitted"
          },
          owner_confirmation: {
            confirmed: false,
            confirmed_by: "",
            confirmed_at: "",
            confirmation_basis: "catalog_filter"
          },
          validation_summary: {
            validation_status: "empty",
            draft_status_before_submission: "not_applicable",
            issue_count: 0,
            fix_prompt_count: 0
          },
          runtime_gate: {
            runtime_availability_state: "manifest_incomplete",
            runtime_display_name_zh: "Manifest 待补齐"
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
            package_manifest: "agent_store_upload_candidate",
            package_validation: "agent_store_package_validation",
            owner_confirmation: "agent_store_owner_explicit_confirmation",
            runtime_availability: "agent_runtime_echo_or_probe",
            draft_review_queue: "agent_store",
            policy_decision: "agentops_not_evaluated_until_review"
          },
          next_action: this.selectedView.primary_action
        };
      }
      submission = submissions[agent.agent_id];
      if (submission) {
        return submission;
      }
      return {
        contract_schema_version: "draft_review_submission.v1",
        submission_id: "draft-review-missing-" + safeId(agent.agent_id),
        package_id: (wizard.validation_report && wizard.validation_report.package_id) || agent.agent_id + "@" + agent.version,
        agent_id: agent.agent_id,
        submission_state: "validation_blocked",
        draft_status: "draft_review_blocked",
        review_queue_entry: {
          queue_state: "not_enqueued",
          review_status: "not_submitted"
        },
        owner_confirmation: {
          confirmed: false,
          confirmed_by: "",
          confirmed_at: "",
          confirmation_basis: "frontend_fallback_no_draft_review_submission"
        },
        validation_summary: {
          validation_status: (wizard.validation_report && wizard.validation_report.step_state) || "missing",
          draft_status_before_submission: (wizard.validation_report && wizard.validation_report.draft_status) || "missing",
          issue_count: (wizard.validation_report && wizard.validation_report.issue_count) || 0,
          fix_prompt_count: (wizard.validation_report && wizard.validation_report.fix_prompt_count) || 0
        },
        runtime_gate: {
          runtime_availability_state: (wizard.detail_preview && wizard.detail_preview.runtime_availability_state) || "manifest_incomplete",
          runtime_display_name_zh: (wizard.detail_preview && wizard.detail_preview.runtime_display_name_zh) || "Manifest 待补齐"
        },
        issues: [
          {
            issue_id: "DRAFT_REVIEW_SUBMISSION_MISSING",
            field_path: "draft_review_submission",
            severity: "blocked",
            fix_action_id: "prepare_draft_review_submission"
          }
        ],
        source_of_truth: {
          package_manifest: "agent_store_upload_candidate",
          package_validation: "agent_store_package_validation",
          owner_confirmation: "agent_store_owner_explicit_confirmation",
          runtime_availability: "agent_runtime_echo_or_probe",
          draft_review_queue: "frontend_fallback_no_draft_review_submission",
          policy_decision: "agentops_not_evaluated_until_review"
        },
        next_action: {
          action_id: "prepare_draft_review_submission",
          target_system: "agent_store",
          enabled: true,
          requires_permission: true,
          audit_required: true
        }
      };
    },
    selectedContractRegistryTraceability: function selectedContractRegistryTraceability() {
      var agent = this.selectedAgent;
      var registry = this.contractRegistryTraceability || {};
      var contracts = Array.isArray(registry.contracts) ? registry.contracts : [];
      var focusByAgent = registry.focus_contract_by_agent || {};
      var focusContractId = agent ? focusByAgent[agent.agent_id] : "";
      var focusContract = contracts.find(function findContract(contract) {
        return contract.contract_id === focusContractId;
      });
      if (!focusContract && contracts.length) {
        focusContract = contracts.find(function findRegistry(contract) {
          return contract.contract_id === "contract_registry_traceability.v1";
        }) || contracts[0];
        focusContractId = focusContract.contract_id;
      }
      if (!contracts.length) {
        return {
          contract_schema_version: "contract_registry_traceability.v1",
          registry_status: "incomplete",
          coverage_summary: {
            total_contracts: 0,
            contracts_with_cct: 0,
            contracts_with_contract_tests: 0,
            complete_traceability: 0,
            unmapped_contracts: 0
          },
          contracts: [],
          focus_contract_id: "",
          focus_contract: {
            contract_id: "contract_registry_traceability_missing",
            contract_file: "contract-registry-traceability.openapi.yaml",
            primary_schema: "ContractRegistryTraceability",
            owner: "Agent Store",
            producer: "Agent Store",
            consumers: ["Agent Store UI"],
            cct_ids: ["CCT-017"],
            contract_test_files: ["tests/contract/test_contract_registry_traceability_api.py"],
            appendix_anchor: "Contract Registry Traceability V1"
          },
          source_of_truth: {
            contract_files: "specs/001-agent-store-phase1-trusted-min-loop/contracts",
            appendix: "docs/cross-project-contract-appendix.md",
            contract_tests: "tests/contract",
            registry_projection: "frontend_fallback_no_contract_registry_traceability"
          },
          next_action: {
            action_id: "complete_contract_traceability",
            target_system: "agent_store",
            enabled: true,
            requires_permission: true,
            audit_required: true,
            message_key: "contractRegistry.actions.completeTraceability"
          }
        };
      }
      return Object.assign({}, registry, {
        focus_contract_id: focusContractId,
        focus_contract: focusContract
      });
    },
    selectedSkillRegistryLifecycle: function selectedSkillRegistryLifecycle() {
      var agent = this.selectedAgent;
      var lifecycle = this.skillRegistryLifecycle || {};
      var decision;
      if (!agent) {
        return {
          contract_schema_version: "skill_registry.v1",
          notification_contract_schema_version: "skill_registry_notification.v1",
          ack_schema_version: "skill_registry_notification_ack.v1",
          registry_status: "registration_blocked",
          skill: null,
          issues: [
            {
              issue_id: "CATALOG_FILTER_EMPTY",
              field_path: "catalog_filter",
              severity: "warning",
              fix_action_id: "adjust_catalog_filters"
            }
          ],
          event: null,
          agentops_consumption: {
            consumer: "agentops",
            contract: "skill_registry.v1",
            sync_status: "not_ready",
            notify_required: false
          },
          agentops_notification: {
            schema_version: "skill_registry_notification_ack.v1",
            delivery_state: "not_sent",
            agentops_ack_id: "",
            delivery_attempt_id: "",
            registry_key: "",
            request_payload_hash: "",
            response_payload_hash: ""
          },
          source_of_truth: {
            skill_registry: "agent_store",
            package_validation: "agent_store_package_validation",
            agentops_consumption: "agentops_consumes_agent_store_registry"
          },
          next_action: this.selectedView.primary_action
        };
      }
      decision = lifecycle[agent.agent_id];
      if (decision) {
        return decision;
      }
      return {
        contract_schema_version: "skill_registry.v1",
        notification_contract_schema_version: "skill_registry_notification.v1",
        ack_schema_version: "skill_registry_notification_ack.v1",
        registry_status: "registration_blocked",
        skill: {
          skill_id: "skill-registry-missing-" + safeId(agent.agent_id),
          skill_version: agent.version,
          schema_ref: "missing",
          risk_level: "medium",
          package_id: agent.agent_id + "@" + agent.version,
          agent_id: agent.agent_id,
          owner_team: agent.owner_team,
          owner_user: "",
          status: "published",
          status_reason: "frontend fallback envelope missing",
          registry_key: "skill-registry-missing-" + safeId(agent.agent_id) + "@" + agent.version
        },
        issues: [
          {
            issue_id: "SKILL_REGISTRY_ENVELOPE_MISSING",
            field_path: "skill_registry",
            severity: "blocked",
            fix_action_id: "return_to_validation",
            message_key: "skillRegistry.envelopeMissing"
          }
        ],
        event: null,
        agentops_consumption: {
          consumer: "agentops",
          contract: "skill_registry.v1",
          sync_status: "not_ready",
          notify_required: false
        },
        agentops_notification: {
          schema_version: "skill_registry_notification_ack.v1",
          delivery_state: "not_sent",
          agentops_ack_id: "",
          delivery_attempt_id: "",
          registry_key: "",
          request_payload_hash: "",
          response_payload_hash: ""
        },
        source_of_truth: {
          skill_registry: "frontend_fallback_no_skill_registry_lifecycle",
          package_validation: "agent_store_package_validation",
          agentops_consumption: "agentops_consumes_agent_store_registry"
        },
        next_action: {
          action_id: "return_to_validation",
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
