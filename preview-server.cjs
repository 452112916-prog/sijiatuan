const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "dist");
const port = Number(process.env.PORT || 4322);
const host = process.env.HOST || "127.0.0.1";

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function sendFile(res, file) {
  fs.readFile(file, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    res.writeHead(200, {
      "Content-Type": types[path.extname(file).toLowerCase()] || "application/octet-stream",
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const cleanUrl = decodeURIComponent(req.url.split("?")[0]);
  const trimmedUrl = cleanUrl.replace(/^\/+/, "");
  const urlPath = trimmedUrl.endsWith("/") || trimmedUrl === "" ? `${trimmedUrl}index.html` : trimmedUrl;
  let file = path.resolve(root, urlPath);

  if (!file.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.stat(file, (error, stats) => {
    if (!error && stats.isDirectory()) {
      file = path.join(file, "index.html");
    }

    fs.stat(file, (fileError, fileStats) => {
      if (!fileError && fileStats.isFile()) {
        sendFile(res, file);
        return;
      }

      sendFile(res, path.join(root, "404.html"));
    });
  });
});

server.listen(port, host, () => {
  console.log(`Preview running at http://${host}:${port}/`);
});
