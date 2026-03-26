"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./db");
const profile_1 = __importDefault(require("./routes/profile"));
const tryon_1 = __importDefault(require("./routes/tryon"));
const messaging_1 = __importDefault(require("./routes/messaging"));
const storage_1 = require("./services/storage");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '20mb' }));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
(0, storage_1.ensureUploadDirectories)();
(0, db_1.getDb)().then(() => console.log('Database initialized'));
app.use('/api/profile', profile_1.default);
app.use('/api/tryon', tryon_1.default);
app.use('/api/messaging', messaging_1.default);
app.get('/', (_req, res) => {
    res.send('PixSnap API is running');
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map