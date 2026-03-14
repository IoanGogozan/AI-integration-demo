import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { prisma } from './lib/prisma.js';
import { serializeEmail } from './lib/serializers.js';

const app = express();
const port = Number(process.env.API_PORT || 4000);

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
  const email = await prisma.email.findUnique({
    where: {
      id: req.params.id
    },
    include: {
      attachments: true,
      aiResults: {
        orderBy: {
          createdAt: 'desc'
        },
        take: 1
      },
      jobs: {
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  });

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

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
