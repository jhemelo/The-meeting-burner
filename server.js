import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

// In a Remix SPA, Vite merges public/ content into build/client/
const BUILD_PATH = path.join(__dirname, 'build', 'client');

console.log('--- MEETING BURNER PROD SERVER ---');
console.log('Target Port:', port);
console.log('Static Root:', BUILD_PATH);

// 1. Health check for Cloud Run infrastructure
app.get('/healthz', (req, res) => res.status(200).send('OK'));

// 2. Serve Static Assets (This makes ads.txt, robots.txt, etc. available at /)
app.use(express.static(BUILD_PATH, {
  maxAge: '1h',
  setHeaders: (res, filePath) => {
    // Ensure HTML is not cached so users always get the latest SPA bundle
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// 3. SPA Catch-all Routing
// Since this is an SPA, all non-file requests must serve index.html
app.get('*', (req, res) => {
  const indexPath = path.join(BUILD_PATH, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Build artifacts not found. Deployment error.');
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`>>> Meeting Burner live at http://0.0.0.0:${port}`);
});
