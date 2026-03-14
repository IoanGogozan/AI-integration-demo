import fs from 'node:fs/promises';
import pdf from 'pdf-parse';

const textMimeTypes = new Set([
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/json'
]);

export async function extractTextFromFile(file, storagePath) {
  if (file.mimetype === 'application/pdf') {
    const result = await pdf(file.buffer);
    return normalizeWhitespace(result.text);
  }

  if (textMimeTypes.has(file.mimetype) || isTextExtension(file.originalname)) {
    const content = await fs.readFile(storagePath, 'utf8');
    return normalizeWhitespace(content);
  }

  return null;
}

function isTextExtension(fileName) {
  return /\.(txt|md|csv|json)$/i.test(fileName);
}

function normalizeWhitespace(value) {
  return value.replace(/\s+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}
