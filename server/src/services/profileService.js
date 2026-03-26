"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveProfileImage = saveProfileImage;
exports.getProfileByUsername = getProfileByUsername;
exports.saveProfileBuffer = saveProfileBuffer;
const path_1 = __importDefault(require("path"));
const db_1 = require("../db");
const storage_1 = require("./storage");
async function saveProfileImage(username, profileImagePath) {
    const db = await (0, db_1.getDb)();
    await db.run('INSERT OR REPLACE INTO users (username, profile_image) VALUES (?, ?)', [username, profileImagePath]);
    return { username, profile_image: profileImagePath };
}
async function getProfileByUsername(username) {
    const db = await (0, db_1.getDb)();
    return db.get('SELECT * FROM users WHERE username = ?', [username]);
}
async function saveProfileBuffer(username, buffer, originalName) {
    const fileName = (0, storage_1.makeUploadFilename)('profile', originalName);
    const profilePath = await (0, storage_1.saveBufferToDirectory)(storage_1.uploadDirectories.profiles, buffer, fileName);
    return saveProfileImage(username, path_1.default.relative(process.cwd(), profilePath).replace(/\\/g, '/'));
}
//# sourceMappingURL=profileService.js.map