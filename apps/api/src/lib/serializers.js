export function serializeEmail(email) {
  const latestAiResult = email.aiResults?.[0];

  return {
    id: email.id,
    sender: email.sender,
    subject: email.subject,
    body: email.body,
    receivedAt: email.receivedAt,
    status: email.status,
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
    latestAiResult: latestAiResult
      ? {
          id: latestAiResult.id,
          category: latestAiResult.category,
          priority: latestAiResult.priority,
          summary: latestAiResult.summary,
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
