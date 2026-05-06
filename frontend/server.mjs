import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const root = path.dirname(url.fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4173);
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

function resolveRequestPath(requestUrl) {
  const parsed = new URL(requestUrl, `http://127.0.0.1:${port}`);
  const pathname = decodeURIComponent(parsed.pathname);
  if (pathname === "/") {
    return path.join(root, "index.html");
  }
  return path.join(root, pathname);
}

const server = http.createServer((req, res) => {
  const filePath = resolveRequestPath(req.url || "/");
  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("forbidden");
    return;
  }
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
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Agent Store frontend: http://127.0.0.1:${port}`);
});
