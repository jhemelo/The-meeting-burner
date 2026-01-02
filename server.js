import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

// In Remix SPA mode, the build output is in build/client
const BUILD_PATH = path.join(__dirname, 'build', 'client');
const SOURCE_PUBLIC_PATH = path.join(__dirname, 'public');

console.log('--- MEETING BURNER PROD SERVER STARTING ---');
console.log('Current Directory:', __dirname);
console.log('Build Path:', BUILD_PATH);
console.log('Public Path:', SOURCE_PUBLIC_PATH);

/**
 * Robustly locate a file in production
 */
const findFile = (filename) => {
  const possiblePaths = [
    path.join(BUILD_PATH, filename),
    path.join(SOURCE_PUBLIC_PATH, filename),
    path.join(__dirname, filename)
  ];
  
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      console.log(`[SEO] Located ${filename} at: ${p}`);
      return p;
    }
  }
  return null;
};

// 1. Health Check for Cloud Run
app.get('/healthz', (req, res) => res.status(200).send('OK'));

// 2. SEO Route Handlers with aggressive lookup
const seoFiles = ['ads.txt', 'robots.txt', 'sitemap.xml'];
seoFiles.forEach(file => {
  app.get(`/${file}`, (req, res) => {
    const filePath = findFile(file);
    if (filePath) {
      const mimeType = file.endsWith('.xml') ? 'application/xml' : 'text/plain';
      res.setHeader('Content-Type', mimeType);
      // Disable cache for SEO files to ensure quick updates
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.sendFile(filePath);
    }
    console.error(`[SEO] ERROR: ${file} not found in build/client, public/, or root.`);
    res.status(404).send(`${file} not found`);
  });
});

// 3. Serve Static Assets (JS, CSS, Images)
app.use(express.static(BUILD_PATH, {
  maxAge: '1h',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// 4. SPA Catch-all
app.get('*', (req, res) => {
  const indexPath = path.join(BUILD_PATH, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    console.error('[SPA] index.html missing at:', indexPath);
    res.status(404).send('Application build missing. Please check deployment logs.');
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port ${port}`);
});