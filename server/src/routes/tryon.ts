import express from 'express';
import fs from 'fs';
import multer from 'multer';
import { runTryOn } from '../services/tryOnService';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/temp/');
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post('/', upload.single('clothing'), async (req, res) => {
  try {
    const { username } = req.body;
    const clothingFile = req.file;

    if (!username || !clothingFile) {
      return res.status(400).json({ error: 'Username and clothing image are required' });
    }

    const clothingBuffer = await fs.promises.readFile(clothingFile.path);
    const result = await runTryOn({
      username,
      clothingBuffer,
      clothingOriginalName: clothingFile.originalname,
    });

    res.json({
      message: 'Try-on completed',
      result_image: result.resultImagePath,
      clean_clothing: result.cleanClothingPath,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
