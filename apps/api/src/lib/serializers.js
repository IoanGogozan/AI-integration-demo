export function serializeEmail(email) {
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
    latestAiResult: email.aiResults?.[0]
      ? {
          id: email.aiResults[0].id,
          category: email.aiResults[0].category,
          priority: email.aiResults[0].priority,
          summary: email.aiResults[0].summary,
          suggestedRoute: email.aiResults[0].suggestedRoute,
          suggestedNextAction: email.aiResults[0].suggestedNextAction,
          suggestedReply: email.aiResults[0].suggestedReply,
          confidence: Number(email.aiResults[0].confidence),
          extractedJson: email.aiResults[0].extractedJson,
          createdAt: email.aiResults[0].createdAt,
          updatedAt: email.aiResults[0].updatedAt
        }
      : null
  };
}
