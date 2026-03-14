import { prisma } from './prisma.js';
import { processEmailWithAi } from './ai-provider.js';
import { setEmailAssignment } from './review-actions.js';

export async function runAiProcessing(email) {
  const job = await prisma.processingJob.create({
    data: {
      emailId: email.id,
      status: 'running',
      startedAt: new Date()
    }
  });

  await prisma.email.update({
    where: {
      id: email.id
    },
    data: {
      status: 'processing'
    }
  });

  try {
    const { result, meta } = await processEmailWithAi(email);
    const nextStatus = result.confidence < 0.75 ? 'needs_review' : 'approved';

    await prisma.aiResult.create({
      data: {
        emailId: email.id,
        category: result.category,
        priority: result.priority,
        summary: result.summary,
        evidenceSnippets: result.evidence_snippets,
        suggestedRoute: result.suggested_route,
        suggestedNextAction: result.suggested_next_action,
        suggestedReply: result.suggested_reply,
        confidence: result.confidence,
        extractedJson: result.extracted_fields
      }
    });

    await setEmailAssignment(email.id, result.suggested_route, 'ai');

    if (meta.invalidStructuredOutput) {
      await prisma.auditEvent.create({
        data: {
          entityType: 'email',
          entityId: email.id,
          action: 'ai_invalid_structured_output',
          payload: {
            providerAttempted: 'openai',
            fallbackProvider: meta.provider,
            fallbackReason: meta.fallbackReason,
            rawOutput: meta.rawOutput ? meta.rawOutput.slice(0, 2000) : null
          }
        }
      });
    }

    await prisma.processingJob.update({
      where: {
        id: job.id
      },
      data: {
        status: 'succeeded',
        finishedAt: new Date()
      }
    });

    await prisma.email.update({
      where: {
        id: email.id
      },
      data: {
        status: nextStatus
      }
    });

    await prisma.auditEvent.create({
      data: {
        entityType: 'email',
        entityId: email.id,
        action: 'ai_processed',
        payload: {
          category: result.category,
          priority: result.priority,
          confidence: result.confidence,
          assignedTeam: result.suggested_route,
          provider: meta.provider,
          fallbackReason: meta.fallbackReason
        }
      }
    });

    return {
      jobId: job.id,
      result
    };
  } catch (error) {
    await prisma.processingJob.update({
      where: {
        id: job.id
      },
      data: {
        status: 'failed',
        finishedAt: new Date(),
        error: error.message
      }
    });

    await prisma.email.update({
      where: {
        id: email.id
      },
      data: {
        status: 'needs_review'
      }
    });

    await prisma.auditEvent.create({
      data: {
        entityType: 'email',
        entityId: email.id,
        action: 'ai_processing_failed',
        payload: {
          error: error.message
        }
      }
    });

    throw error;
  }
}
