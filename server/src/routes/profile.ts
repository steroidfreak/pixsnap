import express from 'express';
import multer from 'multer';
import path from 'path';
import { getDb } from '../db';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profiles/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { username } = req.body;
    const profile_image = req.file?.path;

    if (!username || !profile_image) {
      return res.status(400).json({ error: 'Username and image are required' });
    }

    const db = await getDb();
    await db.run(
      'INSERT OR REPLACE INTO users (username, profile_image) VALUES (?, ?)',
      [username, profile_image]
    );

    res.json({ message: 'Profile updated successfully', profile_image });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const db = await getDb();
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
