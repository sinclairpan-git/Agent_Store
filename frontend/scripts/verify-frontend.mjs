import fs from "node:fs";
import path from "node:path";
import url from "node:url";

import {
  resolveRecommendationStateRequest,
  resolveRequestPath,
  root as serverRoot
} from "../server.mjs";

const root = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const pkg = JSON.parse(read("package.json"));
const lock = JSON.parse(read("package-lock.json"));
const indexHtml = read("index.html");
const componentLibrary = read("src/sdlc-enterprise-vue2.js");
const app = read("src/app.js");
const mockData = read("src/mock-data.js");
const recommendationStates = JSON.parse(read("api/recommendation-states.json"));

assert(
  pkg.dependencies.vue === "file:../vendor/enterprise-vue2/vue-2.7.16.tgz",
  "Vue2 dependency must resolve from SDLC enterprise Vue2 vendor"
);
assert(
  pkg.dependencies["@sxf/er-components"]
    === "file:../vendor/enterprise-vue2/sxf-er-components-1.27.5.tgz",
  "SDLC enterprise Vue2 components must resolve from AgentOps vendor"
);
assert(
  pkg.dependencies["@sxf/sf-theme"]
    === "file:../vendor/enterprise-vue2/sxf-sf-theme-0.2.5.tgz",
  "SDLC enterprise Vue2 theme must resolve from AgentOps vendor"
);
assert(
  pkg.dependencies.graphql
    === "file:../vendor/enterprise-vue2/transitive/graphql-16.14.0.tgz",
  "GraphQL peer dependency must resolve from AgentOps transitive vendor"
);
for (const vendorFile of [
  "../vendor/enterprise-vue2/vue-2.7.16.tgz",
  "../vendor/enterprise-vue2/sxf-er-components-1.27.5.tgz",
  "../vendor/enterprise-vue2/sxf-sf-theme-0.2.5.tgz",
  "../vendor/enterprise-vue2/transitive/graphql-16.14.0.tgz"
]) {
  assert(fs.existsSync(path.join(root, vendorFile)), `${vendorFile} must be vendored`);
}
for (const [packagePath, packageMeta] of Object.entries(lock.packages || {})) {
  if (!packageMeta || !packageMeta.resolved) {
    continue;
  }
  assert(
    packageMeta.resolved.startsWith("file:"),
    `${packagePath} must resolve from a vendored file tarball`
  );
  if (packageMeta.resolved.startsWith("file:../vendor/enterprise-vue2/")) {
    const tarballPath = packageMeta.resolved.slice("file:".length);
    assert(
      fs.existsSync(path.join(root, tarballPath)),
      `${packagePath} vendor tarball must exist`
    );
  }
}
assert(indexHtml.includes("node_modules/vue/dist/vue.js"), "index must load Vue2 runtime");
assert(
  indexHtml.includes("node_modules/@sxf/sf-theme/dist/brand.css")
    && indexHtml.includes("node_modules/@sxf/er-components/default.css"),
  "index must load SDLC enterprise Vue2 theme and component CSS"
);
assert(
  indexHtml.includes("src/sdlc-enterprise-vue2.js"),
  "index must load SDLC enterprise Vue2 component adapter"
);
assert(
  componentLibrary.includes('packageName: "@sxf/er-components"')
    && componentLibrary.includes('installedVersion: "1.27.5"')
    && componentLibrary.includes("window.SDLC_ENTERPRISE_VUE2_PROVIDER"),
  "component adapter must expose the real SDLC enterprise Vue2 provider metadata"
);
assert(
  componentLibrary.includes(
    'frameworkBaseline: "Ai_AutoSDLC/specs/016-frontend-enterprise-vue2-provider-baseline/spec.md"'
  )
    && !componentLibrary.includes("/Users/"),
  "provider metadata must use portable baseline references"
);
for (const componentName of [
  "sdlc-agent-catalog",
  "sdlc-agent-card",
  "sdlc-install-workflow",
  "sdlc-install-request",
  "sdlc-bootstrap-timeline",
  "sdlc-source-facts",
  "sdlc-health-summary-freshness",
  "sdlc-installation-distribution",
  "sdlc-feedback-owner-response-loop",
  "sdlc-lifecycle-governance",
  "sdlc-quality-evidence-access",
  "sdlc-store-ops-deep-link",
  "sdlc-policy-approval-echo",
  "sdlc-managed-installer-preview",
  "sdlc-policy-approval-flow",
  "sdlc-notification-routing",
  "sdlc-permission-denial-action",
  "sdlc-listing-wizard",
  "sdlc-remediation-actions",
  "sdlc-shell",
  "sdlc-section",
  "sdlc-status-chip",
  "sdlc-action-button",
  "sdlc-metric-row"
]) {
  assert(
    componentLibrary.includes(`Vue.component("${componentName}"`),
    `${componentName} must be registered by SDLC enterprise Vue2 adapter`
  );
}
assert(
  mockData.includes("agentCatalog")
    && mockData.includes("framework.ai-autosdlc")
    && mockData.includes("agentops.evidence-reporter")
    && mockData.includes("security.policy-guard")
    && mockData.includes("developer.release-notes"),
  "Agent Store must expose list-card catalog data"
);
for (const requiredField of [
  "package_trust_summary",
  "enterprise_context",
  "bootstrap_status",
  "quality_evidence",
  "trusted_loop_verified",
  "state_source_conflict",
  "evidence_request_access",
  "accessibility_contract",
  "discovery_bucket",
  "audience",
  "product_tags",
  "rating_summary",
  "adoption",
  "setup_minutes",
  "recommendation_score",
  "discovery_reasons",
  "prerequisites",
  "expected_outcomes"
]) {
  assert(mockData.includes(requiredField), `${requiredField} must be represented`);
}
for (const runtimeTerm of [
  "runtimeAvailability",
  "runtime_availability_summary.v1",
  "runtime_missing",
  "runtime_upgrade_required",
  "runtime_capability_missing",
  "runtime_ready",
  "agent_runtime_echo_or_probe",
  "missing_runtime_capabilities"
]) {
  assert(mockData.includes(runtimeTerm), `${runtimeTerm} must be represented`);
}
for (const healthTerm of [
  "healthSummaryFreshness",
  "health_summary_freshness.v1",
  "health_refresh_required",
  "health_attention_required",
  "health_fresh",
  "recommendation_state_excludes_health_summary",
  "recommendation_basis_allowed",
  "refresh_agentops_health_summary"
]) {
  assert(mockData.includes(healthTerm), `${healthTerm} must be represented`);
}
for (const installationDistributionTerm of [
  "installationDistribution",
  "installation_distribution_summary.v1",
  "distribution_ready",
  "permission_required",
  "distribution_unavailable",
  "empty_distribution",
  "status_counts",
  "os_counts",
  "version_counts",
  "enterprise_state_counts",
  "notification_required",
  "affected_installation_count",
  "individual_users_exposed: false",
  "device_ids_exposed: false",
  "installation_ids_exposed: false",
  "aggregation_only: true",
  "agentops_not_computed_here",
  "request_owner_distribution_permission",
  "refresh_installation_inventory",
  "prepare_owner_notification",
  "continue_owner_distribution_review",
  "INDIVIDUAL_IDENTIFIERS_STRIPPED",
  "OWNER_DISTRIBUTION_PERMISSION_REQUIRED",
  "INSTALLATION_INVENTORY_REQUIRED",
  "VERSION_INSTALLATION_SCOPE_EMPTY"
]) {
  assert(
    mockData.includes(installationDistributionTerm),
    `${installationDistributionTerm} must be represented`
  );
}
for (const feedbackLoopTerm of [
  "feedbackOwnerResponseLoops",
  "feedback_owner_response_loop.v1",
  "submitted",
  "triaged",
  "owner_replied",
  "fixed",
  "released",
  "owner_reply",
  "release_ref",
  "release_version",
  "agent_store_feedback",
  "agent_store_owner_response",
  "agent_store_release_linkage",
  "agent_store_notification_queue",
  "request_owner_response",
  "plan_or_reject_feedback",
  "view_release_notes",
  "OWNER_RESPONSE_REQUIRED"
]) {
  assert(mockData.includes(feedbackLoopTerm), `${feedbackLoopTerm} must be represented`);
}
for (const lifecycleGovernanceTerm of [
  "lifecycleGovernance",
  "lifecycle_governance_baseline.v1",
  "upgrade_available",
  "rollback_available",
  "disabled",
  "security_revoked",
  "upgrade",
  "rollback",
  "deprecate",
  "security_revoke",
  "actor_role: \"owner\"",
  "actor_role: \"security\"",
  "replacement_version",
  "rollback_version",
  "affected_installation_count",
  "agent_store_agent_version",
  "agent_store_lifecycle_governance",
  "agent_store_replacement_mapping",
  "agent_store_installation_inventory",
  "agent_store_notification_queue",
  "notify_available_replacement",
  "notify_security_revocation",
  "fix_lifecycle_transition",
  "SECURITY_REVOKED_TERMINAL"
]) {
  assert(mockData.includes(lifecycleGovernanceTerm), `${lifecycleGovernanceTerm} must be represented`);
}
for (const qualityEvidenceTerm of [
  "qualityEvidenceAccess",
  "quality_evidence_access_summary.v1",
  "summary_ready",
  "summary_redacted",
  "summary_expired",
  "template_deprecated",
  "agentops-owned",
  "agentops-legacy",
  "raw_trace_url: \"\"",
  "raw_evidence_url: \"\"",
  "raw_trace_exposed: false",
  "raw_evidence_exposed: false",
  "recommendation_basis_allowed: false",
  "evidence_vault",
  "agent_store_viewer_context",
  "request_evidence_access",
  "refresh_agentops_quality_summary",
  "request_score_template_refresh",
  "continue_quality_evidence_review",
  "RAW_EVIDENCE_LINK_STRIPPED",
  "QUALITY_SUMMARY_REDACTED",
  "QUALITY_SUMMARY_EXPIRED",
  "SCORE_TEMPLATE_DEPRECATED"
]) {
  assert(mockData.includes(qualityEvidenceTerm), `${qualityEvidenceTerm} must be represented`);
}
for (const storeOpsDeepLinkTerm of [
  "storeOpsDeepLinks",
  "store_ops_deep_link.v1",
  "deep_link_ready",
  "link_sanitized",
  "permission_required",
  "link_unavailable",
  "open_agentops_run_detail",
  "open_sanitized_agentops_run_detail",
  "request_agentops_summary_with_run_binding",
  "run_detail",
  "health_summary_id",
  "run_id",
  "session_id",
  "evidence_summary_id",
  "agent_store_viewer_context",
  "raw_trace: \"evidence_vault\"",
  "raw_trace_url: \"\"",
  "raw_evidence_url: \"\"",
  "raw_trace_exposed: false",
  "raw_evidence_exposed: false",
  "RUN_ID_REQUIRED",
  "SESSION_ID_REQUIRED",
  "RAW_TRACE_LINK_STRIPPED"
]) {
  assert(mockData.includes(storeOpsDeepLinkTerm), `${storeOpsDeepLinkTerm} must be represented`);
}
for (const policyApprovalTerm of [
  "policyApprovalEchoes",
  "managedInstallerPreviews",
  "policyApprovalRequests",
  "policyApprovalReceipts",
  "policy_approval_echo.v1",
  "policy_allowed",
  "approval_pending",
  "approval_expired",
  "policy_denied",
  "agentops_echo_unavailable",
  "continue_store_flow",
  "request_approval_refresh",
  "view_blocking_policy",
  "refresh_agentops_policy_echo",
  "agentops_echo_only",
  "agent_store_echo_only",
  "managed_installer_preview.v1",
  "ready_to_install_preview",
  "preview_passed",
  "download_blocked",
  "signature_blocked",
  "policy_blocked",
  "runtime_handoff_blocked",
  "smoke_test_failed",
  "preview_only",
  "real_install_started: false",
  "not_started_preview_only",
  "download_artifact",
  "verify_signature",
  "create_isolated_install",
  "smoke_test",
  "failure_diagnostics",
  "prepare_managed_install",
  "copy_installer_diagnostic",
  "agentops_via_policy_approval_echo",
  "agent_store_installation_runtime_handoff",
  "MANAGED_INSTALLER_PREVIEW_MISSING",
  "policy_approval_request.v1",
  "policy_approval_receipt.v1",
  "approval_request_ready",
  "policy_context_incomplete",
  "justification_required",
  "approval_request_blocked",
  "approval_receipt_accepted",
  "approval_receipt_pending",
  "approval_receipt_rejected",
  "approval_receipt_unavailable",
  "submit_agentops_approval_request",
  "complete_policy_context",
  "add_approval_justification",
  "assign_authorized_requester",
  "view_agentops_approval",
  "poll_agentops_approval_receipt",
  "fix_agentops_approval_request",
  "refresh_agentops_approval_receipt",
  "store_decision_authority: \"none\"",
  "store_override_allowed: false",
  "capability_grant_issued: false",
  "approval_decision_final: false",
  "agentops_not_decided_by_receipt",
  "agentops_not_issued_by_store",
  "agent_store_receipt_only",
  "AGENTOPS_POLICY_ECHO_INCOMPLETE",
  "AGENTOPS_APPROVAL_EXPIRED",
  "POLICY_CONTEXT_INCOMPLETE",
  "JUSTIFICATION_REQUIRED",
  "REQUESTER_ROLE_UNAUTHORIZED",
  "AGENTOPS_RECEIPT_INCOMPLETE"
]) {
  assert(
    mockData.includes(policyApprovalTerm)
      || app.includes(policyApprovalTerm)
      || componentLibrary.includes(policyApprovalTerm),
    `${policyApprovalTerm} must be represented`
  );
}
for (const notificationRoutingTerm of [
  "notificationRouting",
  "notification_routing_summary.v1",
  "routing_ready",
  "routing_degraded",
  "routing_blocked",
  "not_sent",
  "notification_center",
  "task_center",
  "wecom",
  "risk_list",
  "trusted_iam_or_owner_directory",
  "notification_center_not_sent_by_store",
  "agentops_not_overridden",
  "TRUSTED_AUDIENCE_REQUIRED",
  "RISK_LIST_CHANNEL_FORCED",
  "enqueue_notification_route",
  "fix_notification_routing_context"
]) {
  assert(mockData.includes(notificationRoutingTerm), `${notificationRoutingTerm} must be represented`);
}
for (const permissionDenialTerm of [
  "permissionDenialActions",
  "permission_denial_action_summary.v1",
  "not_visible",
  "visible_not_installable",
  "raw_evidence_denied",
  "high_risk_approval_required",
  "policy_blocked",
  "denial_unavailable",
  "trusted_iam_auth_context",
  "iam_or_agentops_policy_echo",
  "raw_trace_url: \"\"",
  "raw_evidence_url: \"\"",
  "store_grant_issued: false",
  "store_policy_override_allowed: false",
  "request_evidence_access",
  "submit_agentops_approval",
  "view_policy_reason",
  "notify_security_iam_and_owner",
  "RAW_PERMISSION_LINK_STRIPPED"
]) {
  assert(mockData.includes(permissionDenialTerm), `${permissionDenialTerm} must be represented`);
}
for (const wizardTerm of [
  "listingWizard",
  "listing_wizard_shell.v1",
  "source_selection",
  "field_confirmation",
  "validation_report",
  "detail_preview",
  "prepare_draft_review_submission",
  "not_submitted_until_027"
]) {
  assert(mockData.includes(wizardTerm), `${wizardTerm} must be represented`);
}
assert(
  !mockData.includes("recommendationStates:")
    && recommendationStates["framework.ai-autosdlc"]
    && recommendationStates["framework.ai-autosdlc"].schema_version === "agent-store.phase1.v1"
    && recommendationStates["framework.ai-autosdlc"].recommendation.recommendation_state
    && Object.prototype.hasOwnProperty.call(
      recommendationStates["framework.ai-autosdlc"].recommendation,
      "actual_l5_display_allowed"
    )
    && recommendationStates["framework.ai-autosdlc"].recommendation.source_of_truth
    && recommendationStates["framework.ai-autosdlc"].recommendation.next_best_action
    && Array.isArray(recommendationStates["framework.ai-autosdlc"].recommendation.trust_blockers),
  "recommendation_state envelopes must come from the API fixture, not window mock data"
);
assert(
  mockData.includes('discovery_bucket: ["recommended", "enterprise", "guarded"]')
    && mockData.includes('discovery_bucket: ["recommended", "ready", "guarded"]')
    && !mockData.includes('discovery_bucket: ["recommended", "enterprise", "governed"]')
    && !mockData.includes('discovery_bucket: ["recommended", "ready", "governed"]'),
  "governance discovery rows must use the guarded bucket id"
);
assert(app.includes("new window.Vue"), "app must instantiate Vue2");
assert(
  app.includes("selectedAgentId")
    && app.includes("selectAgent")
    && app.includes("filteredCatalog")
    && app.includes("setTrustFilter")
    && app.includes("selectedInstallWorkflow")
    && app.includes("selectedInstallationRequest")
    && app.includes("selectedRecommendationDecision")
    && app.includes("selectedRuntimeAvailability")
    && app.includes("selectedHealthSummaryFreshness")
    && app.includes("selectedInstallationDistribution")
    && app.includes("installationDistribution")
    && app.includes("selectedFeedbackOwnerResponseLoop")
    && app.includes("feedbackOwnerResponseLoops")
    && app.includes("selectedLifecycleGovernance")
    && app.includes("lifecycleGovernance")
    && app.includes("selectedQualityEvidenceAccess")
    && app.includes("qualityEvidenceAccess")
    && app.includes("selectedStoreOpsDeepLink")
    && app.includes("storeOpsDeepLinks")
    && app.includes("selectedPolicyApprovalEcho")
    && app.includes("policyApprovalEchoes")
    && app.includes("selectedManagedInstallerPreview")
    && app.includes("managedInstallerPreviews")
    && app.includes("selectedPolicyApprovalRequest")
    && app.includes("selectedPolicyApprovalReceipt")
    && app.includes("policyApprovalRequests")
    && app.includes("policyApprovalReceipts")
    && app.includes("selectedNotificationRouting")
    && app.includes("notificationRouting")
    && app.includes("selectedPermissionDenialAction")
    && app.includes("permissionDenialActions")
    && app.includes("selectedListingWizard")
    && app.includes("recommendationEnvelopeFor")
    && app.includes("recommendationStateApiUrl")
    && app.includes("normalizeRecommendationDecision")
    && app.includes("fallbackRecommendationState")
    && app.includes('agent.installability === "blocked" || agent.trust_state === "blocked"')
    && app.includes('agent.installability === "activation_required"')
    && app.includes("recommendationStates")
    && app.includes("recommendationStateRequests")
    && app.includes("loadRecommendationState")
    && app.includes("window.fetch")
    && app.includes("this.$set(this.recommendationStates")
    && app.includes("selectedBootstrapHandoff")
    && app.includes("selectedAssertionHandoff")
    && app.includes("actionFeedback")
    && app.includes("discoveryCollection")
    && app.includes("discoveryCollections")
    && app.includes("discoveryHighlight")
    && app.includes("var selected = this.selectedAgent;")
    && !app.includes("var selected = this.selectedAgent || this.catalog[0];")
    && app.includes("setDiscoveryCollection")
    && app.includes("arrayOrEmpty")
    && app.includes("this.filteredCatalog[0] || this.catalog[0] || null")
    && app.includes("nextAgent ? nextAgent.agent_id : \"\"")
    && app.includes("arrayOrEmpty(agent.discovery_bucket).indexOf(\"recommended\")")
    && app.includes("recommendationState")
    && app.includes("recommendationVerdict")
    && app.includes("trustBlockers")
    && app.includes("invokeAction")
    && app.includes("create_installation_from_request")
    && app.includes("issue_installation_assertion")
    && app.includes("device_public_key_thumbprint")
    && app.includes("pending_enterprise_activation")
    && app.includes("pending_catalog_review")
    && app.includes("standalone_only")
    && app.includes("this.filteredCatalog.find")
    && app.includes("activeSelectedAgentId")
    && app.includes("catalog_filters_returned_no_agents")
    && app.includes("shellQuoteToken")
    && app.includes("buildRequestIdentity(agent.agent_id, \"start_enterprise_activation\")")
    && app.includes("buildRequestIdentity(agent.agent_id, \"open_standalone_readme\")")
    && app.includes("buildRequestIdentity(agent.agent_id, \"request_catalog_review\")")
    && app.includes("Runtime 可用性摘要满足当前 Manifest")
    && app.includes("HealthSummary 新鲜度可展示")
    && app.includes("安装分布可继续复核")
    && app.includes("不向无权限 viewer 暴露聚合计数")
    && app.includes("只有 Owner 角色可以推进 owner_reply")
    && app.includes("不在本阶段生成 release notes")
    && app.includes("security_revoked 是终态")
    && app.includes("不执行升级或回退")
    && app.includes("不签发 CapabilityGrant")
    && app.includes("Store 前端不计算质量分")
    && app.includes("质量证据摘要可继续复核")
    && app.includes("sanitized run/session binding")
    && app.includes("缺少绑定时 Store 不生成 Run Detail 跳转")
    && app.includes("Store 只组装请求")
    && app.includes("AgentOps policy echo 允许继续 Store 流程")
    && app.includes("缺失或未知回显不得被 Store 解释为允许")
    && app.includes("receipt 只表示已接收，不代表最终批准")
    && app.includes("Store 不本地推导审批结果")
    && app.includes("Agent Store 只记录 not_sent 路由摘要")
    && app.includes("Store 不展示 raw Trace 或 raw Evidence")
    && app.includes("上架向导已准备好草案提交材料")
    && app.includes("coordinate = shellQuoteToken")
    && indexHtml.includes(":catalog=\"filteredCatalog\"")
    && indexHtml.includes(":discovery-collections=\"discoveryCollections\"")
    && indexHtml.includes(":recommendation-decision=\"selectedRecommendationDecision\"")
    && indexHtml.includes(":listing-wizard=\"selectedListingWizard\"")
    && indexHtml.includes(":runtime-availability=\"selectedRuntimeAvailability\"")
    && indexHtml.includes(":health-summary-freshness=\"selectedHealthSummaryFreshness\"")
    && indexHtml.includes(":installation-distribution=\"selectedInstallationDistribution\"")
    && indexHtml.includes(":feedback-owner-response-loop=\"selectedFeedbackOwnerResponseLoop\"")
    && indexHtml.includes(":lifecycle-governance=\"selectedLifecycleGovernance\"")
    && indexHtml.includes(":quality-evidence-access=\"selectedQualityEvidenceAccess\"")
    && indexHtml.includes(":store-ops-deep-link=\"selectedStoreOpsDeepLink\"")
    && indexHtml.includes(":policy-approval-echo=\"selectedPolicyApprovalEcho\"")
    && indexHtml.includes(":managed-installer-preview=\"selectedManagedInstallerPreview\"")
    && indexHtml.includes(":policy-approval-request=\"selectedPolicyApprovalRequest\"")
    && indexHtml.includes(":policy-approval-receipt=\"selectedPolicyApprovalReceipt\"")
    && indexHtml.includes(":notification-routing=\"selectedNotificationRouting\"")
    && indexHtml.includes(":permission-denial-action=\"selectedPermissionDenialAction\"")
    && indexHtml.includes(":selected-agent-id=\"activeSelectedAgentId\"")
    && indexHtml.includes(":action-feedback=\"actionFeedback\"")
    && indexHtml.includes("@set-discovery-collection=\"setDiscoveryCollection\"")
    && indexHtml.includes("@invoke-action=\"invokeAction\""),
  "app must render Agent list cards before the detail view"
);
assert(
  componentLibrary.includes("catalog-toolbar")
    && componentLibrary.includes("sdlc-discovery-rail")
    && componentLibrary.includes("collection-tabs")
    && componentLibrary.includes("discovery-stats")
    && componentLibrary.includes("productTags")
    && componentLibrary.includes("productMeta")
    && componentLibrary.includes("update-search")
    && componentLibrary.includes("set-installability-filter")
    && componentLibrary.includes("standalone_only")
    && componentLibrary.includes("empty-state"),
  "Agent catalog must support search, filters, and empty state"
);
assert(
  componentLibrary.includes("setupLabel")
    && componentLibrary.includes("this.agent.setup_minutes === null")
    && componentLibrary.includes("this.agent.setup_minutes === undefined")
    && componentLibrary.includes('this.agent.setup_minutes === ""')
    && !componentLibrary.includes("if (!this.agent.setup_minutes)"),
  "Agent card setup labels must treat zero-minute setup as a valid estimate"
);
assert(
  componentLibrary.includes("sdlc-recommendation-decision")
    && componentLibrary.includes("sdlc-listing-wizard")
    && componentLibrary.includes("listing-wizard")
    && componentLibrary.includes("wizard-steps")
    && componentLibrary.includes("来源选择")
    && componentLibrary.includes("字段确认")
    && componentLibrary.includes("校验报告")
    && componentLibrary.includes("详情预览")
    && componentLibrary.includes("recommendation_state")
    && componentLibrary.includes("formatSourceOfTruth")
    && componentLibrary.includes("formatTrustBlocker")
    && componentLibrary.includes("sourceTruthSummary")
    && componentLibrary.includes("why_recommended")
    && componentLibrary.includes("missing_evidence")
    && componentLibrary.includes("trust_blockers")
    && componentLibrary.includes("next_best_action")
    && componentLibrary.includes("推荐决策")
    && componentLibrary.includes("为什么选"),
  "Agent detail must expose governed recommendation decision"
);
assert(
  componentLibrary.includes("sdlc-installation-distribution")
    && componentLibrary.includes("安装分布")
    && componentLibrary.includes("installation_distribution_summary.v1")
    && componentLibrary.includes("distribution_state")
    && componentLibrary.includes("permission_state")
    && componentLibrary.includes("status_counts")
    && componentLibrary.includes("os_counts")
    && componentLibrary.includes("version_counts")
    && componentLibrary.includes("enterprise_state_counts")
    && componentLibrary.includes("notification_required")
    && componentLibrary.includes("affected_installation_count")
    && componentLibrary.includes("individual_users_exposed")
    && componentLibrary.includes("device_ids_exposed")
    && componentLibrary.includes("installation_id 明细")
    && componentLibrary.includes("request_owner_distribution_permission")
    && componentLibrary.includes("refresh_installation_inventory")
    && componentLibrary.includes("prepare_owner_notification")
    && componentLibrary.includes("continue_owner_distribution_review")
    && componentLibrary.includes("agentops_not_computed_here"),
  "Agent detail must expose installation distribution as aggregate-only owner summary"
);
assert(
  componentLibrary.includes("sdlc-feedback-owner-response-loop")
    && componentLibrary.includes("反馈闭环")
    && componentLibrary.includes("feedback_owner_response_loop.v1")
    && componentLibrary.includes("feedback_state")
    && componentLibrary.includes("previous_state")
    && componentLibrary.includes("transition_action")
    && componentLibrary.includes("owner_response")
    && componentLibrary.includes("release_linkage")
    && componentLibrary.includes("release_ref")
    && componentLibrary.includes("feedback-loop__timeline")
    && componentLibrary.includes("audit_id")
    && componentLibrary.includes("trace_id")
    && componentLibrary.includes("OWNER_RESPONSE_REQUIRED")
    && componentLibrary.includes("RELEASE_LINK_REQUIRED")
    && componentLibrary.includes("request_owner_response")
    && componentLibrary.includes("plan_or_reject_feedback")
    && componentLibrary.includes("view_release_notes")
    && componentLibrary.includes("agent_store_notification_queue")
    && componentLibrary.includes("No comments / no ranking / no marketplace / no real notification send"),
  "Agent detail must expose feedback owner response loop without comments, ranking, marketplace, or real notifications"
);
assert(
  componentLibrary.includes("sdlc-lifecycle-governance")
    && componentLibrary.includes("生命周期治理")
    && componentLibrary.includes("lifecycle_governance_baseline.v1")
    && componentLibrary.includes("lifecycle_state")
    && componentLibrary.includes("previous_state")
    && componentLibrary.includes("transition_action")
    && componentLibrary.includes("version_scope")
    && componentLibrary.includes("replacement_version")
    && componentLibrary.includes("rollback_version")
    && componentLibrary.includes("impact_scope")
    && componentLibrary.includes("affected_installation_count")
    && componentLibrary.includes("SECURITY_REVOKED_TERMINAL")
    && componentLibrary.includes("notify_security_revocation")
    && componentLibrary.includes("notify_available_replacement")
    && componentLibrary.includes("fix_lifecycle_transition")
    && componentLibrary.includes("No AgentVersion mutation / no Runtime execution / no CapabilityGrant / no AgentOps policy override"),
  "Agent detail must expose lifecycle governance without mutating versions, executing Runtime, issuing grants, or overriding AgentOps policy"
);
assert(
  componentLibrary.includes("sdlc-runtime-availability")
    && componentLibrary.includes("Runtime 可用性")
    && componentLibrary.includes("availability_state")
    && componentLibrary.includes("missing_runtime_capabilities")
    && componentLibrary.includes("runtimeVersionTone")
    && componentLibrary.includes("agent_runtime")
    && componentLibrary.includes("install_runtime")
    && componentLibrary.includes("upgrade_runtime")
    && componentLibrary.includes("view_missing_runtime_capabilities")
    && componentLibrary.includes("continue_listing_review"),
  "Agent detail must expose Runtime availability summary without executing Runtime"
);
assert(
  componentLibrary.includes("sdlc-health-summary-freshness")
    && componentLibrary.includes("HealthSummary 新鲜度")
    && componentLibrary.includes("freshness_state")
    && componentLibrary.includes("recommendation_basis_allowed")
    && componentLibrary.includes("recommendation_state_excludes_health_summary")
    && componentLibrary.includes("request_agentops_health_summary")
    && componentLibrary.includes("refresh_agentops_health_summary")
    && componentLibrary.includes("view_agentops_health_detail")
    && componentLibrary.includes("continue_health_review"),
  "Agent detail must expose HealthSummary freshness without using it as recommendation basis"
);
assert(
  componentLibrary.includes("sdlc-quality-evidence-access")
    && componentLibrary.includes("质量证据访问")
    && componentLibrary.includes("quality_evidence_access_summary.v1")
    && componentLibrary.includes("summary_state")
    && componentLibrary.includes("permission_state")
    && componentLibrary.includes("recommendation_basis_allowed")
    && componentLibrary.includes("raw_trace_exposed")
    && componentLibrary.includes("raw_evidence_exposed")
    && componentLibrary.includes("raw_trace_url")
    && componentLibrary.includes("raw_evidence_url")
    && componentLibrary.includes("sourceTruthSummary")
    && componentLibrary.includes("request_raw_evidence_access")
    && componentLibrary.includes("refresh_agentops_quality_summary")
    && componentLibrary.includes("request_score_template_refresh")
    && componentLibrary.includes("continue_quality_evidence_review")
    && componentLibrary.includes("raw evidence permitted")
    && componentLibrary.includes("Store 不展示 raw Trace 或 raw Evidence URL")
    && componentLibrary.includes("也不本地计算质量"),
  "Agent detail must expose quality evidence access without exposing raw evidence or calculating quality"
);
assert(
  componentLibrary.includes("sdlc-store-ops-deep-link")
    && componentLibrary.includes("Store -> Ops 深链")
    && componentLibrary.includes("store_ops_deep_link.v1")
    && componentLibrary.includes("link_state")
    && componentLibrary.includes("permission_state")
    && componentLibrary.includes("health_summary_id")
    && componentLibrary.includes("run_id")
    && componentLibrary.includes("session_id")
    && componentLibrary.includes("evidence_summary_id")
    && componentLibrary.includes("store-ops-deep-link__target")
    && componentLibrary.includes("open_agentops_run_detail")
    && componentLibrary.includes("open_sanitized_agentops_run_detail")
    && componentLibrary.includes("request_agentops_summary_with_run_binding")
    && componentLibrary.includes("RUN_ID_REQUIRED")
    && componentLibrary.includes("SESSION_ID_REQUIRED")
    && componentLibrary.includes("RAW_TRACE_LINK_STRIPPED")
    && componentLibrary.includes("Store 只展示 sanitized AgentOps Run Detail，不展示 raw Trace/raw Evidence URL"),
  "Agent detail must expose sanitized Store to AgentOps deep links without raw trace or evidence URLs"
);
assert(
  componentLibrary.includes("sdlc-policy-approval-echo")
    && componentLibrary.includes("Policy Echo")
    && componentLibrary.includes("policy_approval_echo.v1")
    && componentLibrary.includes("echo_state")
    && componentLibrary.includes("policy_decision")
    && componentLibrary.includes("approval_summary")
    && componentLibrary.includes("store_projection")
    && componentLibrary.includes("policy-approval-echo__grid")
    && componentLibrary.includes("policy_allowed")
    && componentLibrary.includes("approval_pending")
    && componentLibrary.includes("approval_expired")
    && componentLibrary.includes("policy_denied")
    && componentLibrary.includes("agentops_echo_unavailable")
    && componentLibrary.includes("continue_store_flow")
    && componentLibrary.includes("request_approval_refresh")
    && componentLibrary.includes("view_blocking_policy")
    && componentLibrary.includes("refresh_agentops_policy_echo")
    && componentLibrary.includes("AgentOps policy/approval source-of-truth / Store echo-only / no override / no CapabilityGrant")
    && componentLibrary.includes("Store 不本地推导 policy allowed"),
  "Agent detail must expose AgentOps policy approval echo without overriding decisions or issuing grants"
);
assert(
  componentLibrary.includes("sdlc-managed-installer-preview")
    && componentLibrary.includes("托管安装预览")
    && componentLibrary.includes("managed_installer_preview.v1")
    && componentLibrary.includes("installer_state")
    && componentLibrary.includes("execution_mode")
    && componentLibrary.includes("real_install_started")
    && componentLibrary.includes("packageInfo")
    && componentLibrary.includes("policyGate")
    && componentLibrary.includes("runtimeGate")
    && componentLibrary.includes("managed-installer-preview__steps")
    && componentLibrary.includes("managed-installer-preview__gates")
    && componentLibrary.includes("ready_to_install_preview")
    && componentLibrary.includes("preview_passed")
    && componentLibrary.includes("download_blocked")
    && componentLibrary.includes("signature_blocked")
    && componentLibrary.includes("policy_blocked")
    && componentLibrary.includes("runtime_handoff_blocked")
    && componentLibrary.includes("smoke_test_failed")
    && componentLibrary.includes("prepare_managed_install")
    && componentLibrary.includes("copy_installer_diagnostic")
    && componentLibrary.includes("preview-only / real_install_started=false / no package execution / no CapabilityGrant")
    && componentLibrary.includes("Store 仅展示可审计的 preview-only 状态机"),
  "Agent detail must expose managed installer preview without starting real installs or issuing grants"
);
assert(
  componentLibrary.includes("sdlc-policy-approval-flow")
    && componentLibrary.includes("Policy Approval")
    && componentLibrary.includes("policy_approval_request.v1")
    && componentLibrary.includes("policy_approval_receipt.v1")
    && componentLibrary.includes("request_state")
    && componentLibrary.includes("receipt_state")
    && componentLibrary.includes("requested_action")
    && componentLibrary.includes("policy_context")
    && componentLibrary.includes("agentops_request")
    && componentLibrary.includes("approval_request_ref")
    && componentLibrary.includes("agentops_receipt")
    && componentLibrary.includes("policy-approval-flow__grid")
    && componentLibrary.includes("policy-approval-flow__actions")
    && componentLibrary.includes("submit_agentops_approval_request")
    && componentLibrary.includes("view_agentops_approval")
    && componentLibrary.includes("poll_agentops_approval_receipt")
    && componentLibrary.includes("fix_agentops_approval_request")
    && componentLibrary.includes("Store decision authority: none / no override / no CapabilityGrant / receipt is not approval")
    && componentLibrary.includes("回执，不是最终批准，也不会签发 CapabilityGrant"),
  "Agent detail must expose policy approval request and receipt without deciding policy or issuing grants"
);
assert(
  componentLibrary.includes("sdlc-notification-routing")
    && componentLibrary.includes("通知路由")
    && componentLibrary.includes("routing_state")
    && componentLibrary.includes("delivery_status")
    && componentLibrary.includes("trusted_audience")
    && componentLibrary.includes("sourceTruthSummary")
    && componentLibrary.includes("notification-routing__channels")
    && componentLibrary.includes("enqueue_notification_route")
    && componentLibrary.includes("review_notification_route")
    && componentLibrary.includes("fix_notification_routing_context")
    && componentLibrary.includes("notification_center_not_sent_by_store"),
  "Agent detail must expose notification routing projection without sending notifications"
);
assert(
  componentLibrary.includes("sdlc-permission-denial-action")
    && componentLibrary.includes("权限恢复")
    && componentLibrary.includes("denial_state")
    && componentLibrary.includes("permission_state")
    && componentLibrary.includes("raw_trace_exposed")
    && componentLibrary.includes("store_grant_issued")
    && componentLibrary.includes("permission-denial__scenarios")
    && componentLibrary.includes("request_visibility_access")
    && componentLibrary.includes("request_install_permission")
    && componentLibrary.includes("request_evidence_access")
    && componentLibrary.includes("submit_agentops_approval")
    && componentLibrary.includes("view_policy_reason")
    && componentLibrary.includes("trusted_iam_auth_context"),
  "Agent detail must expose permission denial recovery actions without granting access"
);
assert(
  componentLibrary.includes("install-panel")
    && componentLibrary.includes("workflow.steps")
    && componentLibrary.includes("command_preview")
    && indexHtml.includes(":install-workflow=\"selectedInstallWorkflow\""),
  "Agent detail must expose installation workflow preview"
);
assert(
  componentLibrary.includes("DISPLAY_LABELS")
    && componentLibrary.includes("开始企业激活")
    && componentLibrary.includes("提交安装申请")
    && componentLibrary.includes("暂无事实源")
    && !componentLibrary.includes("<span>{{ action.action_id }}</span>")
    && !componentLibrary.includes(">trusted</button>")
    && !componentLibrary.includes(">installable</button>"),
  "frontend display layer must map machine states/actions to human-readable Chinese labels"
);
assert(
  app.includes("Agent Store 前端只记录预览动作")
    && app.includes("不本地判定 AgentOps 结果")
    && !app.includes('signature_state: agent.trust_state === "trusted" ? "verified"')
    && !app.includes("trusted_loop_verified: this.selectedAgent.trust_state === \"trusted\""),
  "frontend must not infer AgentOps/package trust facts from catalog fields"
);
assert(
  componentLibrary.includes("request-panel")
    && componentLibrary.includes("request.request_state")
    && componentLibrary.includes("request.next_action")
    && componentLibrary.includes("request.blockers")
    && componentLibrary.includes("blockerIndex")
    && indexHtml.includes(":install-request=\"selectedInstallationRequest\""),
  "Agent detail must expose installation request audit queue state"
);
assert(
  componentLibrary.includes("sdlc-bootstrap-handoff")
    && componentLibrary.includes("handoff.handoff_state")
    && componentLibrary.includes("installation_created")
    && componentLibrary.includes("handoff.idempotency_key")
    && componentLibrary.includes("handoff.next_action")
    && indexHtml.includes(":install-handoff=\"selectedBootstrapHandoff\""),
  "Agent detail must expose bootstrap handoff state"
);
assert(
  componentLibrary.includes("sdlc-assertion-handoff")
    && componentLibrary.includes("assertion.assertion_state")
    && componentLibrary.includes("ready_to_issue")
    && app.includes("hasCreatedInstallation(handoff)")
    && componentLibrary.includes("assertion.replay_window_seconds")
    && indexHtml.includes(":assertion-handoff=\"selectedAssertionHandoff\""),
  "Agent detail must expose installation assertion handoff state"
);
assert(
  componentLibrary.includes("sdlc-bootstrap-timeline")
    && componentLibrary.includes("bootstrap.timeline")
    && mockData.includes("verify_signature_test")
    && mockData.includes("credential_bootstrap")
    && mockData.includes("send_signature_test_event")
    && mockData.includes("source_of_truth")
    && mockData.includes("entry_evidence")
    && mockData.includes("conflict_resolution")
    && mockData.includes("recommended_actions")
    && componentLibrary.includes("sdlc-source-facts")
    && componentLibrary.includes("sdlc-remediation-actions"),
  "Agent detail must expose Agent Store/Ai_AutoSDLC/AgentOps bootstrap timeline"
);
assert(
  componentLibrary.includes("sdlc-action-feedback")
    && componentLibrary.includes("治理加载")
    && componentLibrary.includes("凭证已签发不等于完成激活")
    && mockData.includes("credential_issued_but_signature_test_pending")
    && mockData.includes("actual_l5_blocked_until_agentops_verification")
    && mockData.includes("trusted_loop_verified: false"),
  "frontend must explain action feedback, governance load, and pending L5 boundaries"
);
assert(
  componentLibrary.includes("remediation-actions__list")
    && componentLibrary.includes("bootstrap.recommended_actions")
    && mockData.includes("poll_bootstrap_status")
    && mockData.includes("copy_diagnostic_ref"),
  "Agent detail must expose executable bootstrap remediation actions"
);
assert(
  componentLibrary.includes("stateDecisionTone")
    && componentLibrary.includes("packageTrustTone")
    && componentLibrary.includes("signatureTone")
    && componentLibrary.includes("hashTone")
    && componentLibrary.includes("approvalTone")
    && componentLibrary.includes('"blocked", "degraded", "empty"'),
  "risk states must derive tones instead of rendering as fixed success"
);
assert(
  componentLibrary.includes("actionHref: function actionHref()")
    || (
      componentLibrary.includes("<button class=\"action-button\"")
      && componentLibrary.includes(":disabled=\"disabled\"")
      && componentLibrary.includes("@click=\"invoke\"")
    ),
  "disabled action controls must not expose keyboard-operable hash links"
);
assert(
  read("src/styles.css").includes(".action-feedback")
    && read("src/styles.css").includes(".quality-evidence__signals")
    && read("src/styles.css").includes(".store-ops-deep-link__target")
    && read("src/styles.css").includes(".policy-approval-echo__grid")
    && read("src/styles.css").includes(".policy-approval-flow__grid")
    && read("src/styles.css").includes(".notification-routing__channels")
    && read("src/styles.css").includes(".permission-denial__scenarios")
    && read("src/styles.css").includes(".workflow-steps li,")
    && read("src/styles.css").includes(".remediation-actions__list li")
    && read("src/styles.css").includes("grid-template-columns: 1fr;"),
  "frontend styles must include mobile overflow guards for long action labels"
);

const indexPath = resolveRequestPath("/");
assert(indexPath.status === 200, "server must resolve root route");
assert(indexPath.filePath === path.join(serverRoot, "index.html"), "root route must map to index");

const themePath = resolveRequestPath("/node_modules/@sxf/sf-theme/dist/brand.css");
assert(themePath.status === 200, "server must resolve enterprise theme CSS");
assert(fs.existsSync(themePath.filePath), "enterprise theme CSS file must exist");

const componentsCssPath = resolveRequestPath("/node_modules/@sxf/er-components/default.css");
assert(componentsCssPath.status === 200, "server must resolve enterprise component CSS");
assert(
  fs.existsSync(componentsCssPath.filePath),
  "enterprise component CSS file must exist"
);

const traversalPath = resolveRequestPath("/..%2ffrontend-neighbor/secret.txt");
assert(traversalPath.status === 403, "server must reject directory traversal");

const malformedPath = resolveRequestPath("/%E0%A4%A");
assert(malformedPath.status === 400, "server must reject malformed percent-encoding");

const recommendationPath = resolveRecommendationStateRequest(
  "/api/v1/agents/framework.ai-autosdlc/recommendation-state?trace_id=trace-ui"
);
assert(recommendationPath.status === 200, "server must resolve recommendation state API");
assert(
  recommendationPath.body.error_code === "OK"
    && recommendationPath.body.trace_id === "trace-ui"
    && recommendationPath.body.recommendation.agent_id === "framework.ai-autosdlc",
  "recommendation state API must return a backend-shaped envelope"
);
assert(
  recommendationPath.body.recommendation.trace_id === "trace-ui",
  "recommendation state API success envelopes must propagate request trace_id"
);

const missingRecommendationPath = resolveRecommendationStateRequest(
  "/api/v1/agents/missing.agent/recommendation-state?trace_id=trace-missing"
);
assert(missingRecommendationPath.status === 404, "server must govern missing recommendation states");
assert(
  missingRecommendationPath.body.error_code === "AGENT_NOT_FOUND"
    && missingRecommendationPath.body.trace_id === "trace-missing",
  "missing recommendation state API responses must stay envelope-shaped"
);
assert(
  missingRecommendationPath.body.message_key === "errors.agentNotFound"
    && missingRecommendationPath.body.severity === "error"
    && missingRecommendationPath.body.retryable === false
    && missingRecommendationPath.body.recommended_action_id === "adjust_catalog_filters",
  "missing recommendation state API responses must include governed error fields"
);

const nonApiPath = resolveRecommendationStateRequest("/src/app.js");
assert(nonApiPath === null, "recommendation API resolver must ignore static asset paths");

console.log("frontend verification passed");
