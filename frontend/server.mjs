import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

export const root = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)));
const port = Number(process.env.PORT || 4173);
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};
const recommendationStatesPath = path.join(root, "api", "recommendation-states.json");

function isInsideRoot(filePath) {
  const relativePath = path.relative(root, filePath);
  return relativePath === "" || (!relativePath.startsWith("..") && !path.isAbsolute(relativePath));
}

export function resolveRequestPath(requestUrl) {
  let pathname;
  try {
    const parsed = new URL(requestUrl, `http://127.0.0.1:${port}`);
    pathname = decodeURIComponent(parsed.pathname);
  } catch {
    return { status: 400, message: "bad request" };
  }

  const requestPath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.resolve(root, `.${requestPath}`);
  if (!isInsideRoot(filePath)) {
    return { status: 403, message: "forbidden" };
  }

  return { status: 200, filePath };
}

function responseJson(res, status, body) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body, null, 2));
}

export function resolveRecommendationStateRequest(requestUrl) {
  let pathname;
  try {
    const parsed = new URL(requestUrl, `http://127.0.0.1:${port}`);
    pathname = decodeURIComponent(parsed.pathname);
  } catch {
    return { status: 400, body: { error_code: "BAD_REQUEST", message: "bad request" } };
  }

  const match = pathname.match(/^\/api\/v1\/agents\/([^/]+)\/recommendation-state$/);
  if (!match) {
    return null;
  }

  const agentId = match[1];
  let states;
  try {
    states = JSON.parse(fs.readFileSync(recommendationStatesPath, "utf8"));
  } catch {
    return {
      status: 503,
      body: {
        schema_version: "agent-store.phase1.v1",
        error_code: "RECOMMENDATION_STATE_SOURCE_UNAVAILABLE",
        recommended_action_id: "retry_recommendation_state_fetch"
      }
    };
  }

  if (!states[agentId]) {
    return {
      status: 404,
      body: {
        schema_version: "agent-store.phase1.v1",
        error_code: "AGENT_NOT_FOUND",
        recommended_action_id: "adjust_catalog_filters",
        details: { agent_id: agentId }
      }
    };
  }

  return { status: 200, body: states[agentId] };
}

function handleRequest(req, res) {
  const recommendationState = resolveRecommendationStateRequest(req.url || "/");
  if (recommendationState) {
    responseJson(res, recommendationState.status, recommendationState.body);
    return;
  }

  const resolved = resolveRequestPath(req.url || "/");
  if (resolved.status !== 200) {
    res.writeHead(resolved.status);
    res.end(resolved.message);
    return;
  }

  const { filePath } = resolved;
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("not found");
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { "content-type": contentTypes[ext] || "text/plain" });
    res.end(data);
  });
}

const server = http.createServer(handleRequest);

if (process.argv[1] === url.fileURLToPath(import.meta.url)) {
  server.listen(port, "127.0.0.1", () => {
    console.log(`Agent Store frontend: http://127.0.0.1:${port}`);
  });
}
