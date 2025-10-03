import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import attendanceRoutes from './routes/attendanceRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import consoleRoutes from './routes/consoleRoutes.js';
import shiftRoutes from './routes/shifts.js';
import { consoleAuth } from './middleware/consoleAuth.js';
import { logger } from './controllers/consoleController.js';

// ---------- PATH HELPERS ----------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure ./public exists (for console.html / index.html, assets, etc.)
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// ---------- CONFIG ----------
const isProd = process.env.NODE_ENV === 'production';
const MONGODB_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  (!isProd ? 'mongodb://127.0.0.1:27017/new_ams' : null); // no localhost in prod

const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0';

// ---------- DB CONNECTION ----------
async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error(
      'No MongoDB URI provided. Set MONGODB_URI (or MONGO_URI) in environment.'
    );
  }
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');
}

// ---------- APP SETUP ----------
const app = express();

// CORS (allow Vercel frontend; add more origins as needed)
const ALLOWED_ORIGINS = [
  'https://hiki-vision-frontend.vercel.app',
];
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false, // set true only if you use cookies
  })
);

app.use(express.json());

// Serve static files from ./public (absolute path is safer)
app.use(express.static(path.join(__dirname, 'public')));

// ---------- BASIC PAGES / HEALTH ----------
app.get('/health', (_req, res) => res.status(200).send('ok'));

// Show something friendly at root so Render link isn't 404
app.get('/', (_req, res) => {
  res
    .type('text')
    .send('Hiki Vision API is running. Try /console (protected) or /api/*');
});

// ---------- CONSOLE (PROTECTED) ----------
app.get('/console', consoleAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'console.html'));
});
app.use('/api/console', consoleAuth, consoleRoutes);

// ---------- API ROUTES ----------
app.use('/api', attendanceRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/shifts', shiftRoutes);

// ---------- SERVER START ----------
async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, HOST, () => {
      logger.log(`Attendance API listening on http://${HOST}:${PORT}`);
      logger.log(`Health: http://${HOST}:${PORT}/health`);
      logger.log(`Console (Basic Auth): http://${HOST}:${PORT}/console`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

// ---------- GRACEFUL SHUTDOWN (optional) ----------
process.on('SIGTERM', async () => {
  await mongoose.connection.close();
  process.exit(0);
});
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});
