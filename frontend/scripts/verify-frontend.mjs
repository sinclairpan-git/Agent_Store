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
  "sdlc-quality-evidence-access",
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
    && app.includes("selectedQualityEvidenceAccess")
    && app.includes("qualityEvidenceAccess")
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
    && app.includes("Store 前端不计算质量分")
    && app.includes("质量证据摘要可继续复核")
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
    && indexHtml.includes(":quality-evidence-access=\"selectedQualityEvidenceAccess\"")
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
