const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 8080;

// The root of the application
const APP_ROOT = path.resolve(__dirname);

console.log('==================================================');
console.log('>>> THE MEETING BURNER - SERVER STARTUP');
console.log('>>> PORT:', port);
console.log('>>> ROOT PATH:', APP_ROOT);
console.log('==================================================');

// 1. Health Check for Cloud Run
app.get('/healthz', (req, res) => res.status(200).send('OK'));

// 2. Explicit SEO File Routes from Root
const seoFiles = {
  '/robots.txt': 'text/plain',
  '/ads.txt': 'text/plain',
  '/sitemap.xml': 'application/xml'
};

Object.entries(seoFiles).forEach(([route, mimeType]) => {
  app.get(route, (req, res) => {
    const fileName = route.substring(1); // remove leading slash
    const filePath = path.join(APP_ROOT, fileName);

    if (fs.existsSync(filePath)) {
      console.log(`[SEO] Serving ${route} from root`);
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.sendFile(filePath);
    } else {
      console.error(`[SEO ERROR] ${route} not found at ${filePath}`);
      res.status(404).send('Not Found');
    }
  });
});

// 3. Static Assets (Serving from Root)
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