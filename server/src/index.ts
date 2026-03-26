import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { getDb } from './db';
import profileRouter from './routes/profile';
import tryonRouter from './routes/tryon';
import messagingRouter from './routes/messaging';
import { ensureUploadDirectories } from './services/storage';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

ensureUploadDirectories();

getDb().then(() => console.log('Database initialized'));

app.use('/api/profile', profileRouter);
app.use('/api/tryon', tryonRouter);
app.use('/api/messaging', messagingRouter);

app.get('/', (_req, res) => {
  res.send('PixSnap API is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
