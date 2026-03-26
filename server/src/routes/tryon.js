"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
const tryOnService_1 = require("../services/tryOnService");
const router = express_1.default.Router();
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, 'uploads/temp/');
    },
    filename: (_req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = (0, multer_1.default)({ storage });
router.post('/', upload.single('clothing'), async (req, res) => {
    try {
        const { username } = req.body;
        const clothingFile = req.file;
        if (!username || !clothingFile) {
            return res.status(400).json({ error: 'Username and clothing image are required' });
        }
        const clothingBuffer = await fs_1.default.promises.readFile(clothingFile.path);
        const result = await (0, tryOnService_1.runTryOn)({
            username,
            clothingBuffer,
            clothingOriginalName: clothingFile.originalname,
        });
        res.json({
            message: 'Try-on completed',
            result_image: result.resultImagePath,
            clean_clothing: result.cleanClothingPath,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=tryon.js.map