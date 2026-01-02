import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

// Root directory is /app in the production container
const ROOT_DIR = process.cwd();
const BUILD_PATH = path.join(ROOT_DIR, 'build', 'client');
const PUBLIC_PATH = path.join(ROOT_DIR, 'public');

console.log('--- MEETING BURNER PRODUCTION SERVER ---');
console.log('Serving from:', ROOT_DIR);

/**
 * Robustly find SEO files in the public directory
 */
const getSEOFilePath = (filename) => {
  const p = path.join(PUBLIC_PATH, filename);
  if (fs.existsSync(p)) {
    console.log(`[SEO] Found ${filename} at: ${p}`);
    return p;
  }
  return null;
};

// 1. Health Check
app.get('/healthz', (req, res) => res.status(200).send('OK'));

// 2. SEO Routes (Priority)
const seoFiles = ['ads.txt', 'robots.txt', 'sitemap.xml'];
seoFiles.forEach(file => {
  app.get(`/${file}`, (req, res) => {
    const filePath = getSEOFilePath(file);
    if (filePath) {
      const mimeType = file.endsWith('.xml') ? 'application/xml' : 'text/plain';
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.sendFile(filePath);
    }
    console.warn(`[SEO] Missing file: ${file}`);
    res.status(404).send(`${file} not found`);
  });
});

// 3. Static Assets (JS/CSS)
app.use(express.static(BUILD_PATH, {
  maxAge: '1y',
  immutable: true
}));

// 4. Static Public Assets (Images/Icons)
app.use(express.static(PUBLIC_PATH, {
  maxAge: '1h'
}));

// 5. SPA Catch-all
app.get('*', (req, res) => {
  const indexPath = path.join(BUILD_PATH, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    console.error('[FATAL] index.html missing at:', indexPath);
    res.status(404).send('Application build not found.');
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port ${port}`);
});