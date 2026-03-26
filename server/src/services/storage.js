"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadDirectories = void 0;
exports.ensureUploadDirectories = ensureUploadDirectories;
exports.makeUploadFilename = makeUploadFilename;
exports.saveBufferToDirectory = saveBufferToDirectory;
exports.guessExtension = guessExtension;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uploadsRoot = path_1.default.join(__dirname, '../../uploads');
exports.uploadDirectories = {
    root: uploadsRoot,
    profiles: path_1.default.join(uploadsRoot, 'profiles'),
    results: path_1.default.join(uploadsRoot, 'results'),
    temp: path_1.default.join(uploadsRoot, 'temp'),
    inbound: path_1.default.join(uploadsRoot, 'inbound'),
};
function ensureUploadDirectories() {
    Object.values(exports.uploadDirectories).forEach((dir) => {
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
    });
}
function makeUploadFilename(prefix, originalName = 'image') {
    const safeOriginalName = path_1.default.basename(originalName).replace(/[^\w.-]/g, '_');
    return `${prefix}-${Date.now()}-${safeOriginalName}`;
}
async function saveBufferToDirectory(directory, buffer, fileName) {
    ensureUploadDirectories();
    const absolutePath = path_1.default.join(directory, fileName);
    await fs_1.default.promises.writeFile(absolutePath, buffer);
    return absolutePath;
}
function guessExtension(contentType) {
    if (!contentType) {
        return '.jpg';
    }
    if (contentType.includes('png')) {
        return '.png';
    }
    if (contentType.includes('webp')) {
        return '.webp';
    }
    if (contentType.includes('gif')) {
        return '.gif';
    }
    return '.jpg';
}
//# sourceMappingURL=storage.js.map