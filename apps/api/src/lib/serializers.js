export function serializeEmail(email) {
  const latestAiResult = email.aiResults?.[0];
  const latestSucceededJob = email.jobs?.find((job) => job.status === 'succeeded') || null;
  const latestReviewEvent =
    email.auditEvents?.find((event) =>
      ['ai_review_updated', 'status_updated', 'assignment_updated'].includes(event.action)
    ) || null;

  return {
    id: email.id,
    sender: email.sender,
    subject: email.subject,
    body: email.body,
    receivedAt: email.receivedAt,
    status: email.status,
    assignedTeam: email.assignedTeam,
    assignedQueue: email.assignedQueue,
    assignedAt: email.assignedAt,
    assignmentSource: email.assignmentSource,
    createdAt: email.createdAt,
    updatedAt: email.updatedAt,
    attachments: email.attachments?.map((attachment) => ({
      id: attachment.id,
      fileName: attachment.fileName,
      mimeType: attachment.mimeType,
      storagePath: attachment.storagePath,
      extractedText: attachment.extractedText,
      createdAt: attachment.createdAt,
      updatedAt: attachment.updatedAt
    })),
    workflowRecord: {
      status: email.status,
      assignedTeam: email.assignedTeam,
      assignedQueue: email.assignedQueue,
      processedAt: latestSucceededJob?.finishedAt || null,
      latestReviewAt: latestReviewEvent?.createdAt || null,
      sourceFilesCount: email.attachments?.length || 0
    },
    recentAuditEvents:
      email.auditEvents?.map((event) => ({
        id: event.id,
        action: event.action,
        payload: event.payload,
        createdAt: event.createdAt
      })) || [],
    latestAiResult: latestAiResult
      ? {
          id: latestAiResult.id,
          category: latestAiResult.category,
          priority: latestAiResult.priority,
          summary: latestAiResult.summary,
          evidenceSnippets: latestAiResult.evidenceSnippets,
          suggestedRoute: latestAiResult.suggestedRoute,
          suggestedNextAction: latestAiResult.suggestedNextAction,
          suggestedReply: latestAiResult.suggestedReply,
          confidence: Number(latestAiResult.confidence),
          extractedJson: latestAiResult.extractedJson,
          createdAt: latestAiResult.createdAt,
          updatedAt: latestAiResult.updatedAt
        }
      : null
  };
}
