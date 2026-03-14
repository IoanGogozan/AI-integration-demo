import OpenAI from 'openai';
import { buildIntakePrompt, getIntakeResponseFormat } from '../../../../packages/prompts/src/intake-prompt.js';
import { validateIntakeResult } from '../../../../packages/prompts/src/intake-schema.js';

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || 'gpt-5-mini';

const client = apiKey ? new OpenAI({ apiKey }) : null;

export async function processEmailWithAi(email) {
  if (!client) {
    return {
      result: buildFallbackResult(email),
      meta: {
        provider: 'fallback',
        fallbackReason: 'missing_api_key',
        invalidStructuredOutput: false,
        rawOutput: null
      }
    };
  }

  const requestPayload = {
    model,
    input: buildIntakePrompt(email),
    text: {
      format: getIntakeResponseFormat()
    }
  };

  if (supportsReasoningEffort(model)) {
    requestPayload.reasoning = {
      effort: 'medium'
    };
  }

  const response = await client.responses.create(requestPayload);
  const rawOutput = typeof response.output_text === 'string' ? response.output_text : '';

  try {
    const parsed = JSON.parse(rawOutput);

    return {
      result: validateIntakeResult(parsed),
      meta: {
        provider: 'openai',
        fallbackReason: null,
        invalidStructuredOutput: false,
        rawOutput
      }
    };
  } catch (error) {
    console.error('Invalid structured AI output. Falling back to deterministic classifier.', {
      message: error.message,
      rawOutput
    });

    return {
      result: buildFallbackResult(email),
      meta: {
        provider: 'fallback',
        fallbackReason: 'invalid_structured_output',
        invalidStructuredOutput: true,
        rawOutput
      }
    };
  }
}

function buildFallbackResult(email) {
  const sourceText = [email.subject, email.body, ...email.attachments.map((item) => item.extractedText || '')]
    .join('\n')
    .toLowerCase();

  let category = 'general_admin';
  let suggestedRoute = 'admin';
  let priority = 'medium';

  if (sourceText.includes('invoice') || sourceText.includes('billing')) {
    category = 'invoice_billing';
    suggestedRoute = 'finance';
  } else if (
    sourceText.includes('quote') ||
    sourceText.includes('proposal') ||
    sourceText.includes('pricing')
  ) {
    category = 'sales_inquiry';
    suggestedRoute = 'sales';
  } else if (
    sourceText.includes('issue') ||
    sourceText.includes('error') ||
    sourceText.includes('support') ||
    sourceText.includes('blocked')
  ) {
    category = 'support_request';
    suggestedRoute = 'support';
  } else if (sourceText.includes('contract') || sourceText.includes('agreement')) {
    category = 'contract_agreement';
    suggestedRoute = 'legal';
  } else if (sourceText.includes('complaint')) {
    category = 'complaint';
    suggestedRoute = 'admin';
  }

  if (sourceText.includes('urgent') || sourceText.includes('today') || sourceText.includes('blocked')) {
    priority = 'high';
  }

  const deadline = matchValue(sourceText, /deadline[:\s]+([0-9-]{8,10})/i);
  const invoiceNumber = matchValue(sourceText, /invoice(?: number)?[:\s#-]+([a-z0-9-]+)/i);
  const amount = matchValue(sourceText, /(nok\s?[0-9.,]+)/i);

  return validateIntakeResult({
    category,
    priority,
    summary: buildSummary(email, category),
    evidence_snippets: buildEvidenceSnippets(email),
    suggested_route: suggestedRoute,
    suggested_next_action: buildNextAction(category, priority),
    suggested_reply: buildReplyDraft(category),
    confidence: 0.62,
    extracted_fields: {
      company_name: null,
      contact_name: null,
      contact_email: email.sender,
      phone: null,
      invoice_number: invoiceNumber,
      amount,
      deadline,
      request_type: category
    }
  });
}

function buildEvidenceSnippets(email) {
  const candidates = [email.subject, email.body, ...email.attachments.map((item) => item.extractedText || '')]
    .flatMap((value) => value.split(/\r?\n|(?<=[.!?])\s+/))
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => value.replace(/\s+/g, ' '))
    .filter((value) => value.length >= 18)
    .slice(0, 3);

  return candidates;
}

function buildSummary(email, category) {
  return `${capitalize(category.replaceAll('_', ' '))} received from ${email.sender} regarding "${email.subject}".`;
}

function buildNextAction(category, priority) {
  const urgency = priority === 'high' ? 'Handle immediately' : 'Review and assign';
  return `${urgency} through the ${category.replaceAll('_', ' ')} workflow.`;
}

function buildReplyDraft(category) {
  return `Hello,\n\nWe received your ${category.replaceAll('_', ' ')} request and our team is reviewing it now. We will follow up with the next step shortly.\n\nBest regards,\nOperations Team`;
}

function matchValue(text, regex) {
  const match = text.match(regex);
  return match ? match[1] : null;
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function supportsReasoningEffort(modelName) {
  return modelName.startsWith('gpt-5.1');
}
