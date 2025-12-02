import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import childrenRoutes from './routes/children.js';
import booksRoutes from './routes/books.js';
import activitiesRoutes from './routes/activities.js';
import tripsRoutes from './routes/trips.js';
import mediaRoutes from './routes/media.js';
import { testConnection } from './db.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// simple health
app.get('/api/health', async (req, res) => {
  try {
    const t = await testConnection();
    return res.json({ ok: true, now: t });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// mount routes
app.use('/api', authRoutes);
app.use('/api', childrenRoutes);
app.use('/api', booksRoutes);
app.use('/api', activitiesRoutes);
app.use('/api', tripsRoutes);
app.use('/api', mediaRoutes);

// start
const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('Backend listening on', PORT));
