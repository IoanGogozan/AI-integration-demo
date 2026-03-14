import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const uploadsDirectory = path.resolve(currentDirectory, '../../../../uploads');

export async function ensureUploadsDirectory() {
  await fs.mkdir(uploadsDirectory, {
    recursive: true
  });
}

export async function saveUploadedFile(file) {
  await ensureUploadsDirectory();

  const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileName = `${Date.now()}-${safeName}`;
  const storagePath = path.join(uploadsDirectory, fileName);

  await fs.writeFile(storagePath, file.buffer);

  return {
    storagePath,
    fileName: safeName
  };
}
