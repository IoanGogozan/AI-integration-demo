import cors from 'cors';
import express from 'express';
import multer from 'multer';
import { runAiProcessing } from './lib/ai-processing.js';
import { getDashboardStats } from './lib/dashboard-stats.js';
import { findEmailWithRelations } from './lib/email-queries.js';
import { saveUploadedFile } from './lib/file-storage.js';
import { prisma } from './lib/prisma.js';
import { setEmailStatus, updateAiReview } from './lib/review-actions.js';
import { serializeEmail } from './lib/serializers.js';
import { extractTextFromFile } from './lib/text-extraction.js';

export function createApp() {
  const app = express();
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

  app.get('/dashboard/stats', async (_req, res) => {
    try {
      const stats = await getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({
        message: 'Dashboard stats failed',
        details: error.message
      });
    }
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

  app.post('/emails/:id/process', async (req, res) => {
    const email = await findEmailWithRelations(req.params.id);

    if (!email) {
      res.status(404).json({
        message: 'Email not found'
      });
      return;
    }

    try {
      await runAiProcessing(email);
      const updatedEmail = await findEmailWithRelations(email.id);

      res.status(201).json({
        item: {
          ...serializeEmail(updatedEmail),
          jobs: updatedEmail.jobs
        }
      });
    } catch (error) {
      res.status(500).json({
        message: 'AI processing failed',
        details: error.message
      });
    }
  });

  app.patch('/emails/:id/review', async (req, res) => {
    try {
      await updateAiReview(req.params.id, req.body);
      const updatedEmail = await findEmailWithRelations(req.params.id);

      res.json({
        item: {
          ...serializeEmail(updatedEmail),
          jobs: updatedEmail.jobs
        }
      });
    } catch (error) {
      const statusCode =
        error.message === 'Email not found' || error.message === 'No AI result available for review'
          ? 404
          : 400;

      res.status(statusCode).json({
        message: 'Review update failed',
        details: error.message
      });
    }
  });

  app.patch('/emails/:id/status', async (req, res) => {
    try {
      await setEmailStatus(req.params.id, req.body.status);
      const updatedEmail = await findEmailWithRelations(req.params.id);

      res.json({
        item: {
          ...serializeEmail(updatedEmail),
          jobs: updatedEmail.jobs
        }
      });
    } catch (error) {
      const statusCode = error.message === 'Invalid status' ? 400 : 404;

      res.status(statusCode).json({
        message: 'Status update failed',
        details: error.message
      });
    }
  });

  return app;
}
