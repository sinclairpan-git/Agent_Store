import fs from "node:fs";
import path from "node:path";
import url from "node:url";

import { resolveRequestPath, root as serverRoot } from "../server.mjs";

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
  "accessibility_contract"
]) {
  assert(mockData.includes(requiredField), `${requiredField} must be represented`);
}
assert(app.includes("new window.Vue"), "app must instantiate Vue2");
assert(
  app.includes("selectedAgentId")
    && app.includes("selectAgent")
    && app.includes("filteredCatalog")
    && app.includes("setTrustFilter")
    && app.includes("selectedInstallWorkflow")
    && app.includes("selectedInstallationRequest")
    && app.includes("selectedBootstrapHandoff")
    && app.includes("selectedAssertionHandoff")
    && app.includes("actionFeedback")
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
    && app.includes("coordinate = shellQuoteToken")
    && indexHtml.includes(":catalog=\"filteredCatalog\"")
    && indexHtml.includes(":selected-agent-id=\"activeSelectedAgentId\"")
    && indexHtml.includes(":action-feedback=\"actionFeedback\"")
    && indexHtml.includes("@invoke-action=\"invokeAction\""),
  "app must render Agent list cards before the detail view"
);
assert(
  componentLibrary.includes("catalog-toolbar")
    && componentLibrary.includes("update-search")
    && componentLibrary.includes("set-installability-filter")
    && componentLibrary.includes("standalone_only")
    && componentLibrary.includes("empty-state"),
  "Agent catalog must support search, filters, and empty state"
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

console.log("frontend verification passed");
