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
    && indexHtml.includes(":catalog=\"filteredCatalog\""),
  "app must render Agent list cards before the detail view"
);
assert(
  componentLibrary.includes("catalog-toolbar")
    && componentLibrary.includes("update-search")
    && componentLibrary.includes("set-installability-filter")
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
  componentLibrary.includes("actionHref: function actionHref()")
    && componentLibrary.includes("return null;")
    && componentLibrary.includes("@keydown.enter=\"guardDisabled\""),
  "disabled action links must not expose keyboard-operable hrefs"
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
