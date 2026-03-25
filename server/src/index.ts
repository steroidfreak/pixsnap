import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { getDb } from './db';
import profileRouter from './routes/profile';
import tryonRouter from './routes/tryon';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
const profilesDir = path.join(uploadsDir, 'profiles');
const resultsDir = path.join(uploadsDir, 'results');
const tempDir = path.join(uploadsDir, 'temp');

[uploadsDir, profilesDir, resultsDir, tempDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Initialize DB
getDb().then(() => console.log('Database initialized'));

app.use('/api/profile', profileRouter);
app.use('/api/tryon', tryonRouter);

app.get('/', (req, res) => {
  res.send('PixSnap API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
