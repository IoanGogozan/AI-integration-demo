import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import multer from 'multer';
import { findEmailWithRelations } from './lib/email-queries.js';
import { saveUploadedFile } from './lib/file-storage.js';
import { prisma } from './lib/prisma.js';
import { serializeEmail } from './lib/serializers.js';
import { extractTextFromFile } from './lib/text-extraction.js';

const app = express();
const port = Number(process.env.API_PORT || 4000);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'api',
    timestamp: new Date().toISOString()
  });
});

app.get('/health/db', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      message: error.message
    });
  }
});

app.get('/emails', async (_req, res) => {
  const emails = await prisma.email.findMany({
    include: {
      attachments: true,
      aiResults: {
        orderBy: {
          createdAt: 'desc'
        },
        take: 1
      }
    },
    orderBy: {
      receivedAt: 'desc'
    }
  });

  res.json({
    items: emails.map(serializeEmail)
  });
});

app.get('/emails/:id', async (req, res) => {
  const email = await findEmailWithRelations(req.params.id);

  if (!email) {
    res.status(404).json({
      message: 'Email not found'
    });
    return;
  }

  res.json({
    item: {
      ...serializeEmail(email),
      jobs: email.jobs
    }
  });
});

app.post('/emails/:id/attachments', upload.single('attachment'), async (req, res) => {
  const email = await findEmailWithRelations(req.params.id);

  if (!email) {
    res.status(404).json({
      message: 'Email not found'
    });
    return;
  }

  if (!req.file) {
    res.status(400).json({
      message: 'No file uploaded'
    });
    return;
  }

  try {
    const savedFile = await saveUploadedFile(req.file);
    const extractedText = await extractTextFromFile(req.file, savedFile.storagePath);

    await prisma.attachment.create({
      data: {
        emailId: email.id,
        fileName: savedFile.fileName,
        mimeType: req.file.mimetype || 'application/octet-stream',
        storagePath: savedFile.storagePath,
        extractedText
      }
    });

    await prisma.auditEvent.create({
      data: {
        entityType: 'email',
        entityId: email.id,
        action: 'attachment_uploaded',
        payload: {
          fileName: savedFile.fileName,
          mimeType: req.file.mimetype || 'application/octet-stream'
        }
      }
    });

    const updatedEmail = await findEmailWithRelations(email.id);

    res.status(201).json({
      item: {
        ...serializeEmail(updatedEmail),
        jobs: updatedEmail.jobs
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Attachment upload failed',
      details: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
