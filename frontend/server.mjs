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

function handleRequest(req, res) {
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
