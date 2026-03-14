import {
  intakeCategories,
  intakePriorities,
  intakeResponseJsonSchema,
  intakeRoutes
} from './intake-schema.js';

export function buildIntakePrompt(email) {
  return [
    {
      role: 'system',
      content: [
        {
          type: 'input_text',
          text:
            'You are an internal workflow assistant for a B2B operations team. Analyze the incoming email and attached document text. Return only valid JSON that matches the provided schema. Never invent missing values. If a field is unknown, return null and reduce confidence.'
        }
      ]
    },
    {
      role: 'user',
      content: [
        {
          type: 'input_text',
          text: [
            'Classify and extract the case.',
            '',
            `Allowed categories: ${intakeCategories.join(', ')}`,
            `Allowed priorities: ${intakePriorities.join(', ')}`,
            `Allowed routes: ${intakeRoutes.join(', ')}`,
            '',
            `Sender: ${email.sender}`,
            `Subject: ${email.subject}`,
            `Received at: ${email.receivedAt.toISOString()}`,
            '',
            'Email body:',
            email.body,
            '',
            'Attachment text:',
            buildAttachmentSection(email.attachments),
            '',
            'Return a concise internal summary, the best next action, an editable reply draft, and extracted fields.'
          ].join('\n')
        }
      ]
    }
  ];
}

export function getIntakeResponseFormat() {
  return {
    type: 'json_schema',
    name: 'intake_result',
    strict: true,
    schema: intakeResponseJsonSchema
  };
}

function buildAttachmentSection(attachments) {
  if (!attachments.length) {
    return 'No attachments provided.';
  }

  return attachments
    .map((attachment, index) => {
      return [
        `Attachment ${index + 1}: ${attachment.fileName}`,
        `Mime type: ${attachment.mimeType}`,
        attachment.extractedText || 'No extracted text available.'
      ].join('\n');
    })
    .join('\n\n');
}
