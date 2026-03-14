import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const emailRecord = {
  id: 'email-1',
  sender: 'invoice@example.com',
  subject: 'Invoice correction request',
  body: 'Please correct invoice INV-42.',
  receivedAt: new Date('2026-03-14T09:00:00Z'),
  status: 'needs_review',
  assignedTeam: 'finance',
  assignedQueue: 'finance',
  assignedAt: new Date('2026-03-14T09:05:00Z'),
  assignmentSource: 'ai',
  createdAt: new Date('2026-03-14T09:00:00Z'),
  updatedAt: new Date('2026-03-14T09:00:00Z'),
  attachments: [],
  aiResults: [
    {
      id: 'ai-1',
      category: 'invoice_billing',
      priority: 'medium',
      summary: 'Original summary',
      evidenceSnippets: ['invoice INV-42 needs correction'],
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
  jobs: [],
  auditEvents: []
};

const prismaMock = {
  $queryRaw: vi.fn(),
  auditEvent: {
    create: vi.fn()
  },
  email: {
    findMany: vi.fn()
  }
};

const findEmailWithRelations = vi.fn();
const getDashboardStats = vi.fn();
const runAiProcessing = vi.fn();
const updateAiReview = vi.fn();
const setEmailStatus = vi.fn();
const setEmailAssignment = vi.fn();

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
  setEmailAssignment,
  setEmailStatus
}));

describe('createApp', () => {
  beforeEach(() => {
    process.env.AUTH_SECRET = 'test-secret';
    process.env.ENFORCE_API_AUTH = 'true';
    process.env.DEMO_AUTH_EMAIL = 'demo@norvix.ai';
    process.env.DEMO_AUTH_PASSWORD = 'demo1234';
    process.env.DEMO_AUTH_NAME = 'Demo Operator';
    process.env.DEMO_AUTH_ROLE = 'operator';
    process.env.DEMO_REVIEWER_EMAIL = 'reviewer@norvix.ai';
    process.env.DEMO_REVIEWER_PASSWORD = 'review1234';
    process.env.DEMO_REVIEWER_NAME = 'Demo Reviewer';
    process.env.DEMO_VIEWER_EMAIL = 'viewer@norvix.ai';
    process.env.DEMO_VIEWER_PASSWORD = 'view1234';
    process.env.DEMO_VIEWER_NAME = 'Demo Viewer';
    prismaMock.$queryRaw.mockReset();
    prismaMock.auditEvent.create.mockReset();
    prismaMock.email.findMany.mockReset();
    findEmailWithRelations.mockReset();
    getDashboardStats.mockReset();
    runAiProcessing.mockReset();
    updateAiReview.mockReset();
    setEmailAssignment.mockReset();
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
    expect(response.body.user.role).toBe('operator');
    expect(response.headers['set-cookie']).toBeTruthy();
  });

  it('returns demo auth config without passwords', async () => {
    const { createApp } = await import('./app.js');
    const app = createApp();

    const response = await request(app).get('/auth/config');

    expect(response.status).toBe(200);
    expect(response.body.users.length).toBeGreaterThanOrEqual(3);
    expect(response.body.users[0].password).toBeUndefined();
  });

  it('rejects process actions for a viewer role', async () => {
    findEmailWithRelations.mockResolvedValue(emailRecord);

    const { createApp } = await import('./app.js');
    const app = createApp();
    const agent = request.agent(app);

    await agent.post('/auth/login').send({
      email: 'viewer@norvix.ai',
      password: 'view1234'
    });

    const response = await agent.post('/emails/email-1/process');

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Insufficient role for this action');
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

  it('blocks processing for approved cases', async () => {
    findEmailWithRelations.mockResolvedValue({
      ...emailRecord,
      status: 'approved'
    });

    const { createApp } = await import('./app.js');
    const app = createApp();
    const agent = request.agent(app);

    await agent.post('/auth/login').send({
      email: 'demo@norvix.ai',
      password: 'demo1234'
    });

    const response = await agent.post('/emails/email-1/process');

    expect(response.status).toBe(409);
    expect(response.body.message).toBe('AI processing is only available for new or needs_review cases');
    expect(runAiProcessing).not.toHaveBeenCalled();
  });

  it('updates review fields', async () => {
    updateAiReview.mockResolvedValue({});
    findEmailWithRelations.mockResolvedValue(emailRecord);

    const { createApp } = await import('./app.js');
    const app = createApp();
    const agent = request.agent(app);

    await agent.post('/auth/login').send({
      email: 'reviewer@norvix.ai',
      password: 'review1234'
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
      email: 'reviewer@norvix.ai',
      password: 'review1234'
    });

    const response = await agent
      .patch('/emails/email-1/status')
      .send({
        status: 'bad-status'
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Status update failed');
  });

  it('updates assignment for reviewer role', async () => {
    setEmailAssignment.mockResolvedValue({});
    findEmailWithRelations.mockResolvedValue(emailRecord);

    const { createApp } = await import('./app.js');
    const app = createApp();
    const agent = request.agent(app);

    await agent.post('/auth/login').send({
      email: 'reviewer@norvix.ai',
      password: 'review1234'
    });

    const response = await agent
      .patch('/emails/email-1/assignment')
      .send({
        assignedTeam: 'legal'
      });

    expect(response.status).toBe(200);
    expect(setEmailAssignment).toHaveBeenCalledWith('email-1', 'legal', 'manual');
  });

  it('records a workflow business action', async () => {
    prismaMock.auditEvent.create.mockResolvedValue({});
    findEmailWithRelations.mockResolvedValue(emailRecord);

    const { createApp } = await import('./app.js');
    const app = createApp();
    const agent = request.agent(app);

    await agent.post('/auth/login').send({
      email: 'demo@norvix.ai',
      password: 'demo1234'
    });

    const response = await agent
      .post('/emails/email-1/actions')
      .send({
        actionType: 'create_internal_task'
      });

    expect(response.status).toBe(201);
    expect(prismaMock.auditEvent.create).toHaveBeenCalled();
    expect(response.body.item.id).toBe('email-1');
  });
});
