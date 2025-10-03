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
import { logger } from './controllers/consoleController.js';
import shiftRoutes from './routes/shifts.js';

// ---- PATHS ----
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure ./public exists
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// ---- CONFIG ----
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI; // <- from Render
const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0';

// ---- DB ----
async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error(
      'No MongoDB URI provided. Set MONGODB_URI (or MONGO_URI) in Render environment.'
    );
  }
  await mongoose.connect(MONGODB_URI);
  console.log('MongoDB connected');
}

// ---- APP ----
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/console', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'console.html'));
});

// ---- ROUTES ----
app.use('/', attendanceRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/console', consoleRoutes);
app.use('/api/shifts', shiftRoutes);

// ---- START ----
async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, HOST, () => {
      logger.log(`Attendance API listening on http://${HOST}:${PORT}`);
      logger.log(`Server console: http://${HOST}:${PORT}/api/console`);
    });
  } catch (err) {
    console.error('Startup error:', err);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown (optional)
process.on('SIGTERM', async () => {
  await mongoose.connection.close();
  process.exit(0);
});
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});
