import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import uploadRoutes from './routes/upload.js';
import snagRoutes from './routes/snags.js';
import clickupRoutes from './routes/clickup.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function createServer() {
  const app = express();

  // Allow requests from Vercel frontend and localhost for development
  const allowedOrigins = [
    'http://localhost:5173',
    'https://frontend-phi-eight-30.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean);
  
  app.use(cors({ 
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        callback(null, true);
        return;
      }
      // Allow localhost for development
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        callback(null, true);
        return;
      }
      // Allow all Vercel preview URLs
      if (origin.includes('.vercel.app')) {
        callback(null, true);
        return;
      }
      // Allow explicitly configured origins
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  }));
  app.use(express.json());
  app.use('/uploads', express.static(join(__dirname, '../uploads')));

  app.use('/api/upload', uploadRoutes);
  app.use('/api/snags', snagRoutes);
  app.use('/api/clickup', clickupRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'File too large' : err.message });
  }
  if (err) return res.status(500).json({ error: err.message || 'Internal error' });
  next();
});

return app;
}
