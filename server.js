const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 8080;

// The root of the application is where server.js lives
const APP_ROOT = path.resolve(__dirname);
// The public directory where SEO files are now located
const PUBLIC_DIR = path.join(APP_ROOT, 'public');

console.log('==================================================');
console.log('>>> THE MEETING BURNER - SERVER STARTUP');
console.log('>>> PORT:', port);
console.log('>>> PUBLIC DIR:', PUBLIC_DIR);
console.log('==================================================');

// 1. Health Check for Cloud Run
app.get('/healthz', (req, res) => res.status(200).send('OK'));

// 2. Explicit SEO File Routes (Looking in /public)
const seoFiles = {
  '/robots.txt': 'text/plain',
  '/ads.txt': 'text/plain',
  '/sitemap.xml': 'application/xml'
};

Object.entries(seoFiles).forEach(([route, mimeType]) => {
  app.get(route, (req, res) => {
    const fileName = route.substring(1);
    const filePath = path.join(PUBLIC_DIR, fileName);

    if (fs.existsSync(filePath)) {
      console.log(`[SEO] Serving ${route} from public/ folder`);
      res.setHeader('Content-Type', mimeType);
      return res.sendFile(filePath);
    } else {
      console.error(`[SEO ERROR] ${route} not found in public/ at ${filePath}`);
      res.status(404).send('Not Found');
    }
  });
});

// 3. Static Assets
// First, check public folder for assets
app.use(express.static(PUBLIC_DIR));
// Then check the root (for index.html, index.tsx, etc.)
app.use(express.static(APP_ROOT));

// 4. SPA Catch-all
app.get('*', (req, res) => {
  const indexPath = path.join(APP_ROOT, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Application Not Found');
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`>>> SERVER LISTENING ON 0.0.0.0:${port}`);
});