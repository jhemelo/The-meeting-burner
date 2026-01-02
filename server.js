const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 8080;

// Use absolute paths to prevent environment inconsistencies in containers
const APP_ROOT = path.resolve(__dirname);
const PUBLIC_DIR = path.join(APP_ROOT, 'public');

console.log('==================================================');
console.log('>>> THE MEETING BURNER - SERVER STARTUP');
console.log('>>> PORT:', port);
console.log('>>> APP_ROOT:', APP_ROOT);
console.log('==================================================');

// 1. Health Checks (Cloud Run standard)
app.get('/healthz', (req, res) => res.status(200).send('OK'));

// 2. SEO File Handler
// This explicitly maps requests like /ads.txt to the actual files
const seoFiles = {
  '/robots.txt': 'text/plain',
  '/ads.txt': 'text/plain',
  '/sitemap.xml': 'application/xml'
};

Object.entries(seoFiles).forEach(([route, mimeType]) => {
  app.get(route, (req, res) => {
    const fileName = route.substring(1); // Remove leading slash
    
    // Check root first, then public
    let filePath = path.join(APP_ROOT, fileName);
    if (!fs.existsSync(filePath)) {
      filePath = path.join(PUBLIC_DIR, fileName);
    }

    if (fs.existsSync(filePath)) {
      console.log(`[SEO] Serving ${route} from ${filePath}`);
      res.setHeader('Content-Type', mimeType);
      return res.sendFile(filePath);
    } else {
      console.error(`[SEO ERROR] ${route} not found in root or public.`);
      res.status(404).send('File Not Found');
    }
  });
});

// 3. Static Assets
// Serve files in /public/ via the /public/ path
app.use('/public', express.static(PUBLIC_DIR));
// Serve everything else from root (index.html, index.tsx, etc.)
app.use(express.static(APP_ROOT));

// 4. SPA Catch-all
// Ensures that refreshing on sub-pages doesn't break
app.get('*', (req, res) => {
  const indexPath = path.join(APP_ROOT, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Application not found');
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`>>> SERVER RUNNING ON PORT ${port}`);
});
