import express from 'express';
import multer from 'multer';
import { getProfileByUsername, saveProfileImage } from '../services/profileService';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/profiles/');
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { username } = req.body;
    const profileImage = req.file?.path;

    if (!username || !profileImage) {
      return res.status(400).json({ error: 'Username and image are required' });
    }

    await saveProfileImage(username, profileImage);

    res.json({ message: 'Profile updated successfully', profile_image: profileImage });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await getProfileByUsername(username);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
