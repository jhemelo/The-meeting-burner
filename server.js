const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 8080;

// Absolute paths
const APP_ROOT = path.resolve(__dirname);
const PUBLIC_DIR = path.join(APP_ROOT, "public");

// 1) Health check (simple proof the server is running)
app.get("/__health", (req, res) => res.status(200).send("OK"));

// 2) Root SEO files (these must work at /robots.txt, /ads.txt, /sitemap.xml)
const seoFiles = {
  "/robots.txt": "text/plain; charset=utf-8",
  "/ads.txt": "text/plain; charset=utf-8",
  "/sitemap.xml": "application/xml; charset=utf-8",
};

Object.entries(seoFiles).forEach(([route, contentType]) => {
  app.get(route, (req, res) => {
    const fileName = route.slice(1); // remove leading "/"
    const filePath = path.join(PUBLIC_DIR, fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).send("Not Found");
    }

    res.setHeader("Content-Type", contentType);
    return res.sendFile(filePath);
  });
});

// 3) Static hosting
// - /public/* works
app.use("/public", express.static(PUBLIC_DIR));

// - also allow serving assets from /public at root if needed (optional but helpful)
app.use(express.static(PUBLIC_DIR));

// - serve root static files (index.html, favicon, etc) if they exist in repo root
app.use(express.static(APP_ROOT));

// 4) SPA fallback (any unknown path returns index.html)
app.get("*", (req, res) => {
  const indexPath = path.join(APP_ROOT, "index.html");
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  return res.status(404).send("Application Not Found");
});

app.listen(port, "0.0.0.0", () => {
  console.log(`>>> SERVER LISTENING ON 0.0.0.0:${port}`);
  console.log(`>>> APP_ROOT: ${APP_ROOT}`);
  console.log(`>>> PUBLIC_DIR: ${PUBLIC_DIR}`);
});
