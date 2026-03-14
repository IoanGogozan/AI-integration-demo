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
            'You are an internal workflow assistant for a B2B operations team. Analyze the incoming email and attached document text. Return only valid JSON that matches the provided schema. Never invent missing values. If a field is unknown, return null and reduce confidence. Keep outputs concise, practical, and presentation-ready.'
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
            'Output rules:',
            '- summary: maximum 2 sentences, ideally under 35 words',
            '- evidence_snippets: include 1 to 3 short direct snippets from the email or attachment text',
            '- evidence_snippets: each snippet should stay short, concrete, and support the summary or route',
            '- suggested_next_action: exactly 1 sentence, ideally under 28 words',
            '- suggested_reply: maximum 2 short sentences, professional and clear',
            '- extracted_fields.request_type: short phrase, not a full sentence',
            '- keep wording compact and operational, not verbose',
            '',
            'Return a concise internal summary, evidence snippets, the best next action, an editable reply draft, and extracted fields.'
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
