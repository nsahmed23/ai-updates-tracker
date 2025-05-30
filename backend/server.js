import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { initializeDatabase, getUpdates, getStats } from './scripts/utils/database.js';
import { triggerFetch } from './scripts/fetchUpdates.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://localhost:3000',
    'https://nsahmed23.github.io',
    'https://backend-bice-two-51.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Initialize database
await initializeDatabase();

// API Routes
app.get('/api/updates', async (req, res) => {
  try {
    const { company, dateRange, search } = req.query;
    const updates = await getUpdates({ company, dateRange, search });
    res.json({ updates });
  } catch (error) {
    console.error('Error fetching updates:', error);
    res.status(500).json({ error: 'Failed to fetch updates' });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const stats = await getStats();
    res.json({ stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.post('/api/fetch-updates', async (req, res) => {
  try {
    const result = await triggerFetch();
    res.json(result);
  } catch (error) {
    console.error('Error triggering fetch:', error);
    res.status(500).json({ error: 'Failed to trigger fetch' });
  }
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Schedule updates every 2 hours
cron.schedule('0 */2 * * *', async () => {
  console.log('Running scheduled update...');
  try {
    const result = await triggerFetch();
    console.log('Scheduled update complete:', result);
  } catch (error) {
    console.error('Scheduled update error:', error);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 