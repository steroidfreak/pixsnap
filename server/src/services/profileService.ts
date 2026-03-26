import path from 'path';
import { getDb } from '../db';
import {
  makeUploadFilename,
  saveBufferToDirectory,
  uploadDirectories,
} from './storage';

export async function saveProfileImage(username: string, profileImagePath: string) {
  const db = await getDb();
  await db.run(
    'INSERT OR REPLACE INTO users (username, profile_image) VALUES (?, ?)',
    [username, profileImagePath],
  );

  return { username, profile_image: profileImagePath };
}

export async function getProfileByUsername(username: string) {
  const db = await getDb();
  return db.get('SELECT * FROM users WHERE username = ?', [username]);
}

export async function saveProfileBuffer(
  username: string,
  buffer: Buffer,
  originalName: string,
) {
  const fileName = makeUploadFilename('profile', originalName);
  const profilePath = await saveBufferToDirectory(uploadDirectories.profiles, buffer, fileName);
  return saveProfileImage(username, path.relative(process.cwd(), profilePath).replace(/\\/g, '/'));
}
