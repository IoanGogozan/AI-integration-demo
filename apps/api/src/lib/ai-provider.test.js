import { describe, expect, it } from 'vitest';
import { processEmailWithAi } from './ai-provider.js';

describe('processEmailWithAi', () => {
  it('uses the fallback processor when no OpenAI key is configured', async () => {
    const { result, meta } = await processEmailWithAi({
      sender: 'invoice@example.com',
      subject: 'Invoice INV-42 needs correction',
      body: 'Please correct invoice INV-42 and send an updated copy.',
      receivedAt: new Date('2026-03-14T09:00:00Z'),
      attachments: [
        {
          extractedText: 'Invoice number: INV-42. Amount: NOK 1200.'
        }
      ]
    });

    expect(meta.provider).toBe('fallback');
    expect(meta.fallbackReason).toBe('missing_api_key');
    expect(result.category).toBe('invoice_billing');
    expect(result.suggested_route).toBe('finance');
    expect(result.evidence_snippets.length).toBeGreaterThan(0);
    expect(result.evidence_snippets[0].toLowerCase()).toContain('invoice');
    expect(result.extracted_fields.invoice_number).toBe('inv-42');
  });
});
