import { prisma } from './prisma.js';

const allowedStatuses = new Set([
  'new',
  'processing',
  'needs_review',
  'approved',
  'completed'
]);

const allowedTeams = new Set(['admin', 'finance', 'legal', 'sales', 'support']);

export async function updateAiReview(emailId, payload) {
  const email = await prisma.email.findUnique({
    where: {
      id: emailId
    },
    include: {
      aiResults: {
        orderBy: {
          createdAt: 'desc'
        },
        take: 1
      }
    }
  });

  if (!email) {
    throw new Error('Email not found');
  }

  const latestAiResult = email.aiResults[0];

  if (!latestAiResult) {
    throw new Error('No AI result available for review');
  }

  const data = {};

  if (typeof payload.summary === 'string') {
    data.summary = payload.summary;
  }

  if (typeof payload.suggestedNextAction === 'string') {
    data.suggestedNextAction = payload.suggestedNextAction;
  }

  if (typeof payload.suggestedReply === 'string') {
    data.suggestedReply = payload.suggestedReply;
  }

  if (payload.extractedJson && typeof payload.extractedJson === 'object') {
    data.extractedJson = payload.extractedJson;
  }

  const updatedAiResult = await prisma.aiResult.update({
    where: {
      id: latestAiResult.id
    },
    data
  });

  await prisma.auditEvent.create({
    data: {
      entityType: 'email',
      entityId: emailId,
      action: 'ai_review_updated',
      payload: {
        aiResultId: latestAiResult.id,
        updatedFields: Object.keys(data)
      }
    }
  });

  return updatedAiResult;
}

export async function setEmailStatus(emailId, status, action = 'status_updated') {
  if (!allowedStatuses.has(status)) {
    throw new Error('Invalid status');
  }

  const email = await prisma.email.update({
    where: {
      id: emailId
    },
    data: {
      status
    }
  });

  await prisma.auditEvent.create({
    data: {
      entityType: 'email',
      entityId: emailId,
      action,
      payload: {
        status
      }
    }
  });

  return email;
}

export async function setEmailAssignment(emailId, assignedTeam, assignmentSource = 'manual') {
  if (!allowedTeams.has(assignedTeam)) {
    throw new Error('Invalid assigned team');
  }

  const email = await prisma.email.update({
    where: {
      id: emailId
    },
    data: {
      assignedTeam,
      assignedQueue: assignedTeam,
      assignedAt: new Date(),
      assignmentSource
    }
  });

  await prisma.auditEvent.create({
    data: {
      entityType: 'email',
      entityId: emailId,
      action: assignmentSource === 'ai' ? 'assignment_applied_by_ai' : 'assignment_updated',
      payload: {
        assignedTeam,
        assignedQueue: assignedTeam,
        assignmentSource
      }
    }
  });

  return email;
}
