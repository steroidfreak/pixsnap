"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const profileService_1 = require("../services/profileService");
const router = express_1.default.Router();
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, 'uploads/profiles/');
    },
    filename: (_req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = (0, multer_1.default)({ storage });
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { username } = req.body;
        const profileImage = req.file?.path;
        if (!username || !profileImage) {
            return res.status(400).json({ error: 'Username and image are required' });
        }
        await (0, profileService_1.saveProfileImage)(username, profileImage);
        res.json({ message: 'Profile updated successfully', profile_image: profileImage });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const user = await (0, profileService_1.getProfileByUsername)(username);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=profile.js.map