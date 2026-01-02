const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 8080;

// Paths
const APP_ROOT = path.resolve(__dirname);
const PUBLIC_DIR = path.join(APP_ROOT, "public");
const DIST_DIR = path.join(APP_ROOT, "dist");

// 1) Health check
app.get("/__health", (req, res) => res.status(200).send("OK"));

// 2) Root SEO files (must work at /robots.txt, /ads.txt, /sitemap.xml)
const seoFiles = {
  "/robots.txt": "text/plain; charset=utf-8",
  "/ads.txt": "text/plain; charset=utf-8",
  "/sitemap.xml": "application/xml; charset=utf-8",
};

Object.entries(seoFiles).forEach(([route, contentType]) => {
  app.get(route, (req, res) => {
    const fileName = route.slice(1);
    const filePath = path.join(PUBLIC_DIR, fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).send("Not Found");
    }

    res.setHeader("Content-Type", contentType);
    // avoid caching old SEO files
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    return res.sendFile(filePath);
  });
});

// 3) Static hosting for /public/*
app.use("/public", express.static(PUBLIC_DIR));

// Optional: allow assets in /public to be reachable at root if needed
// If this causes conflicts for you later, remove this line.
app.use(express.static(PUBLIC_DIR));

// 4) Serve the built SPA (Vite) from /dist
// This is the key fix for the white page.
if (fs.existsSync(DIST_DIR)) {
  // long cache for hashed assets in /dist/assets
  app.use(
    express.static(DIST_DIR, {
      etag: true,
      maxAge: "1y",
      setHeaders: (res, filePath) => {
        // never cache index.html
        if (filePath.endsWith("index.html")) {
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        }
      },
    })
  );
}

// 5) SPA fallback
// Prefer dist/index.html. If dist is missing, fall back to repo root index.html.
app.get("*", (req, res) => {
  const distIndex = path.join(DIST_DIR, "index.html");
  const rootIndex = path.join(APP_ROOT, "index.html");

  if (fs.existsSync(distIndex)) {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    return res.sendFile(distIndex);
  }

  if (fs.existsSync(rootIndex)) {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    return res.sendFile(rootIndex);
  }

  return res.status(404).send("Application Not Found");
});

app.listen(port, "0.0.0.0", () => {
  console.log(`>>> SERVER LISTENING ON 0.0.0.0:${port}`);
  console.log(`>>> APP_ROOT: ${APP_ROOT}`);
  console.log(`>>> PUBLIC_DIR: ${PUBLIC_DIR}`);
  console.log(`>>> DIST_DIR: ${DIST_DIR}`);
  console.log(`>>> DIST_EXISTS: ${fs.existsSync(DIST_DIR)}`);
});
