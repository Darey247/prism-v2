import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import geminiRouter from './src/server/geminiApi';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '25mb' }));
app.use('/api', geminiRouter);

// Serve built frontend assets
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Prism Wallet full-stack server running on http://localhost:${PORT}`);
});
