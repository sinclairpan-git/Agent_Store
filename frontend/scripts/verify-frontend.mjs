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
const indexHtml = read("index.html");
const componentLibrary = read("src/sdlc-enterprise-vue2.js");
const app = read("src/app.js");
const mockData = read("src/mock-data.js");

assert(pkg.dependencies.vue === "2.7.16", "Vue2 dependency must be pinned");
assert(indexHtml.includes("node_modules/vue/dist/vue.js"), "index must load Vue2 runtime");
assert(
  indexHtml.includes("src/sdlc-enterprise-vue2.js"),
  "index must load SDLC enterprise Vue2 component adapter"
);
for (const componentName of [
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
  componentLibrary.includes("actionHref: function actionHref()")
    && componentLibrary.includes("return null;")
    && componentLibrary.includes("@keydown.enter=\"guardDisabled\""),
  "disabled action links must not expose keyboard-operable hrefs"
);

const indexPath = resolveRequestPath("/");
assert(indexPath.status === 200, "server must resolve root route");
assert(indexPath.filePath === path.join(serverRoot, "index.html"), "root route must map to index");

const traversalPath = resolveRequestPath("/..%2ffrontend-neighbor/secret.txt");
assert(traversalPath.status === 403, "server must reject directory traversal");

const malformedPath = resolveRequestPath("/%E0%A4%A");
assert(malformedPath.status === 400, "server must reject malformed percent-encoding");

console.log("frontend verification passed");
