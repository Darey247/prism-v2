import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));

// Cloud Run health check endpoint
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// Serve built frontend assets
const distPath = path.resolve(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// Fallback SPA routing
app.get('*', (req, res) => {
  const indexHtml = path.resolve(distPath, 'index.html');
  if (fs.existsSync(indexHtml)) {
    res.sendFile(indexHtml);
  } else {
    res.status(200).send('Prism Wallet service is initializing...');
  }
});

// Listen on 0.0.0.0 for Cloud Run
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Prism Wallet server successfully listening on 0.0.0.0:${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
