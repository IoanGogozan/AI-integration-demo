# Demo Flow

## Purpose

This document describes the recommended walkthrough for presenting the current MVP to a prospect or stakeholder.

## Suggested Demo Duration

2 to 4 minutes.

## Recommended Story

Show that the product turns unstructured inbox work into a controlled internal workflow with AI assistance and human review.

## Demo Sequence

1. Open the inbox and explain that the cases are realistic SMB operations scenarios.
2. Pick an invoice, support, or contract-related case.
3. Open the case detail page and show the original email plus attachment text.
4. If useful, upload one more attachment to simulate a live incoming file.
5. Run `Process with AI`.
6. Show the structured result:
   - category
   - priority
   - summary
   - suggested route
   - suggested next action
   - reply draft
   - extracted fields
7. Edit the summary or reply draft in the manual review panel.
8. Approve the case or move it to another workflow status.
9. Open the dashboard and show:
   - case volume
   - processed cases
   - items needing review
   - category and priority mix

## Best Demo Cases

- `Invoice 2026-1043 needs correction before payment`
- `Urgent access issue for Oslo operations team`
- `Contract review request for supplier renewal`
- `Need pricing and implementation timeline`

## Key Messages to Say Out Loud

- The value is not just AI text generation; it is workflow structure.
- The system keeps humans in control for review and approval.
- The same pattern can later connect to CRM, ERP, ticketing, Gmail, or Outlook.
- Norwegian language support can be added after the English MVP is stable.

## Known Demo Constraints

- Email ingestion is seeded or manual, not live from Gmail or Outlook.
- OCR for difficult scans is not part of the MVP.
- Without `OPENAI_API_KEY`, the AI step uses a deterministic fallback classifier.
