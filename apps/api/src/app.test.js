import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const emailRecord = {
  id: 'email-1',
  sender: 'invoice@example.com',
  subject: 'Invoice correction request',
  body: 'Please correct invoice INV-42.',
  receivedAt: new Date('2026-03-14T09:00:00Z'),
  status: 'needs_review',
  createdAt: new Date('2026-03-14T09:00:00Z'),
  updatedAt: new Date('2026-03-14T09:00:00Z'),
  attachments: [],
  aiResults: [
    {
      id: 'ai-1',
      category: 'invoice_billing',
      priority: 'medium',
      summary: 'Original summary',
      suggestedRoute: 'finance',
      suggestedNextAction: 'Original next action',
      suggestedReply: 'Original reply',
      confidence: 0.62,
      extractedJson: {
        invoice_number: 'INV-42'
      },
      createdAt: new Date('2026-03-14T09:00:00Z'),
      updatedAt: new Date('2026-03-14T09:00:00Z')
    }
  ],
  jobs: []
};

const prismaMock = {
  $queryRaw: vi.fn(),
  email: {
    findMany: vi.fn()
  }
};

const findEmailWithRelations = vi.fn();
const getDashboardStats = vi.fn();
const runAiProcessing = vi.fn();
const updateAiReview = vi.fn();
const setEmailStatus = vi.fn();

vi.mock('./lib/prisma.js', () => ({
  prisma: prismaMock
}));

vi.mock('./lib/email-queries.js', () => ({
  findEmailWithRelations
}));

vi.mock('./lib/dashboard-stats.js', () => ({
  getDashboardStats
}));

vi.mock('./lib/ai-processing.js', () => ({
  runAiProcessing
}));

vi.mock('./lib/review-actions.js', () => ({
  updateAiReview,
  setEmailStatus
}));

describe('createApp', () => {
  beforeEach(() => {
    process.env.AUTH_SECRET = 'test-secret';
    process.env.DEMO_AUTH_EMAIL = 'demo@norvix.ai';
    process.env.DEMO_AUTH_PASSWORD = 'demo1234';
    process.env.DEMO_AUTH_NAME = 'Demo Operator';
    prismaMock.$queryRaw.mockReset();
    prismaMock.email.findMany.mockReset();
    findEmailWithRelations.mockReset();
    getDashboardStats.mockReset();
    runAiProcessing.mockReset();
    updateAiReview.mockReset();
    setEmailStatus.mockReset();
  });

  it('returns health status', async () => {
    const { createApp } = await import('./app.js');
    const app = createApp();

    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.service).toBe('api');
  });

  it('returns dashboard stats', async () => {
    getDashboardStats.mockResolvedValue({
      totals: {
        cases: 12,
        attachments: 9,
        processed: 3,
        needsReview: 2
      },
      byStatus: [],
      byCategory: [],
      byPriority: [],
      reviewItems: []
    });

    const { createApp } = await import('./app.js');
    const app = createApp();
    const agent = request.agent(app);

    await agent.post('/auth/login').send({
      email: 'demo@norvix.ai',
      password: 'demo1234'
    });

    const response = await agent.get('/dashboard/stats');

    expect(response.status).toBe(200);
    expect(response.body.totals.cases).toBe(12);
  });

  it('rejects protected routes without a session', async () => {
    const { createApp } = await import('./app.js');
    const app = createApp();

    const response = await request(app).get('/emails');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Authentication required');
  });

  it('creates a session on login', async () => {
    const { createApp } = await import('./app.js');
    const app = createApp();

    const response = await request(app).post('/auth/login').send({
      email: 'demo@norvix.ai',
      password: 'demo1234'
    });

    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe('demo@norvix.ai');
    expect(response.headers['set-cookie']).toBeTruthy();
  });

  it('processes an email and returns updated data', async () => {
    findEmailWithRelations.mockResolvedValueOnce(emailRecord).mockResolvedValueOnce(emailRecord);
    runAiProcessing.mockResolvedValue({
      jobId: 'job-1'
    });

    const { createApp } = await import('./app.js');
    const app = createApp();
    const agent = request.agent(app);

    await agent.post('/auth/login').send({
      email: 'demo@norvix.ai',
      password: 'demo1234'
    });

    const response = await agent.post('/emails/email-1/process');

    expect(response.status).toBe(201);
    expect(runAiProcessing).toHaveBeenCalledWith(emailRecord);
    expect(response.body.item.id).toBe('email-1');
  });

  it('updates review fields', async () => {
    updateAiReview.mockResolvedValue({});
    findEmailWithRelations.mockResolvedValue(emailRecord);

    const { createApp } = await import('./app.js');
    const app = createApp();
    const agent = request.agent(app);

    await agent.post('/auth/login').send({
      email: 'demo@norvix.ai',
      password: 'demo1234'
    });

    const response = await agent
      .patch('/emails/email-1/review')
      .send({
        summary: 'Reviewed summary'
      });

    expect(response.status).toBe(200);
    expect(updateAiReview).toHaveBeenCalledWith('email-1', {
      summary: 'Reviewed summary'
    });
  });

  it('returns 400 for invalid status updates', async () => {
    setEmailStatus.mockRejectedValue(new Error('Invalid status'));

    const { createApp } = await import('./app.js');
    const app = createApp();
    const agent = request.agent(app);

    await agent.post('/auth/login').send({
      email: 'demo@norvix.ai',
      password: 'demo1234'
    });

    const response = await agent
      .patch('/emails/email-1/status')
      .send({
        status: 'bad-status'
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Status update failed');
  });
});
