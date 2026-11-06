// Local server: serves the website files and the /api/products API
require("dotenv").config();
const http = require("http");
const fs = require("fs");
const path = require("path");
const productsApi = require("./api/products");

const PORT = 3000;
const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml" };

http.createServer((req, res) => {
  if (req.url.startsWith("/api/products")) return productsApi(req, res);

  const file = req.url === "/" ? "index.html" : req.url.split("?")[0].slice(1);
  const filePath = path.join(__dirname, path.normalize(file));
  if (!filePath.startsWith(__dirname)) { res.writeHead(403); return res.end("Forbidden"); }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); return res.end("Not found"); }
    res.writeHead(200, { "Content-Type": types[path.extname(filePath)] || "text/plain" });
    res.end(data);
  });
}).listen(PORT, () => console.log(`E-MART running at http://localhost:${PORT}`));
