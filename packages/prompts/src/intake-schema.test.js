import { describe, expect, it } from 'vitest';
import { validateIntakeResult } from './intake-schema.js';

describe('validateIntakeResult', () => {
  it('accepts a valid intake result', () => {
    const result = validateIntakeResult({
      category: 'invoice_billing',
      priority: 'medium',
      summary: 'Billing request needs review.',
      evidence_snippets: ['invoice INV-42 needs correction', 'send an updated copy'],
      suggested_route: 'finance',
      suggested_next_action: 'Assign to finance.',
      suggested_reply: 'We are reviewing your billing request.',
      confidence: 0.62,
      extracted_fields: {
        company_name: null,
        contact_name: null,
        contact_email: 'billing@example.com',
        phone: null,
        invoice_number: 'INV-42',
        amount: 'NOK 1200',
        deadline: null,
        request_type: 'invoice_billing'
      }
    });

    expect(result.category).toBe('invoice_billing');
  });

  it('rejects an invalid category', () => {
    expect(() =>
      validateIntakeResult({
        category: 'unknown',
        priority: 'medium',
        summary: 'Bad category.',
        evidence_snippets: ['bad category'],
        suggested_route: 'finance',
        suggested_next_action: 'Assign to finance.',
        suggested_reply: 'We are reviewing your billing request.',
        confidence: 0.62,
        extracted_fields: {
          company_name: null,
          contact_name: null,
          contact_email: 'billing@example.com',
          phone: null,
          invoice_number: 'INV-42',
          amount: 'NOK 1200',
          deadline: null,
          request_type: 'invoice_billing'
        }
      })
    ).toThrow(/category must be one of/);
  });
});
