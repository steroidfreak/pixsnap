import fs from 'fs';
import path from 'path';

const uploadsRoot = path.join(__dirname, '../../uploads');

export const uploadDirectories = {
  root: uploadsRoot,
  profiles: path.join(uploadsRoot, 'profiles'),
  results: path.join(uploadsRoot, 'results'),
  temp: path.join(uploadsRoot, 'temp'),
  inbound: path.join(uploadsRoot, 'inbound'),
};

export function ensureUploadDirectories() {
  Object.values(uploadDirectories).forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

export function makeUploadFilename(prefix: string, originalName = 'image') {
  const safeOriginalName = path.basename(originalName).replace(/[^\w.-]/g, '_');
  return `${prefix}-${Date.now()}-${safeOriginalName}`;
}

export async function saveBufferToDirectory(
  directory: string,
  buffer: Buffer,
  fileName: string,
) {
  ensureUploadDirectories();
  const absolutePath = path.join(directory, fileName);
  await fs.promises.writeFile(absolutePath, buffer);
  return absolutePath;
}

export function guessExtension(contentType?: string | null) {
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
