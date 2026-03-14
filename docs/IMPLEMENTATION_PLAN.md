# Implementation Plan

## Purpose

This document translates the product brief into a practical execution plan. It should be updated as work progresses and when scope changes are approved.

## Delivery Principles

- Build in small phases and keep the app runnable after each phase.
- Prefer clear, modular code over premature abstraction.
- Keep the MVP focused on a strong demo workflow.
- Validate AI output strictly before saving it.
- Require human review for all meaningful downstream actions.

## Delivery Stack

- Docker
- PostgreSQL
- Node.js
- JavaScript
- Prisma

Suggested app shape:

- `apps/web`: frontend UI
- `apps/api`: backend API
- `packages/shared-types`: shared request and response contracts
- `packages/prompts`: prompt templates and schemas

## Phase Plan

### Phase 0: Project Foundation

Goal: create a clean local development baseline.

Tasks:

- create repository structure for `apps`, `packages`, and `docs`
- add Docker setup for local services
- add PostgreSQL container configuration
- define environment variable strategy
- decide frontend and backend app bootstrap approach
- write startup instructions

Deliverables:

- runnable local environment
- initial folder structure
- documented setup steps

## Phase 1: Data and Backend Skeleton

Goal: establish the core persistence and API foundation.

Tasks:

- define database schema for `emails`, `attachments`, `ai_results`, `processing_jobs`, and `audit_events`
- add migration or schema initialization flow
- create API skeleton
- implement basic health and local test endpoints
- add seed loader for demo cases

Deliverables:

- database schema in place
- backend can connect to PostgreSQL
- seed data can be loaded locally

## Phase 2: Inbox and Case Management UI

Goal: make seeded cases visible and navigable.

Tasks:

- build inbox list page
- build email detail page
- show metadata, body, and attachments
- add filtering by status and category placeholders
- add status badges and review state placeholders

Deliverables:

- end-to-end navigation from inbox to case detail
- seeded email cases visible in the UI

## Phase 3: File Handling and Text Extraction

Goal: support realistic attachment-driven demo cases.

Tasks:

- implement attachment upload
- save uploaded files locally for MVP
- extract text from supported text-based files and simple PDFs
- persist extracted text
- surface extracted content in the backend workflow

Deliverables:

- upload flow works locally
- extracted text is stored and retrievable

## Phase 4: AI Processing Pipeline

Goal: process a case into a structured AI result.

Tasks:

- create prompt templates
- define strict JSON output schema
- implement processing endpoint
- send subject, sender, body, and attachment text to the model
- validate model output
- handle invalid JSON with retry or review fallback
- save result, confidence, and audit event

Deliverables:

- one-click case processing
- validated structured AI output stored in PostgreSQL

## Phase 5: Review Workflow

Goal: keep the workflow human-supervised and demo-ready.

Tasks:

- add editable fields for summary and reply draft
- add approve, edit, and reject actions
- add workflow status updates
- log changes in `audit_events`
- make low-confidence results visually clear

Deliverables:

- human review flow works in UI and backend
- audit trail exists for important actions

## Phase 6: Dashboard and Demo Readiness

Goal: show measurable operational value.

Tasks:

- add dashboard metrics for category, priority, and review volume
- add list of items needing review
- add counts by workflow status
- improve empty states and error handling
- confirm all seeded demo cases run end-to-end

Deliverables:

- dashboard page
- stable demo flow for presentation

## Phase 7: Polish and Handoff

Goal: make the project clear, reusable, and ready for iterative expansion.

Tasks:

- refine README and docs
- document API routes and environment variables
- clean up prompts and shared contracts
- review naming consistency
- capture known gaps and post-MVP ideas

Deliverables:

- maintainable project baseline
- clear next-step backlog

## MVP Functional Checklist

- inbox list
- email detail view
- attachment upload
- text extraction
- AI classification
- field extraction
- summary generation
- suggested route
- suggested next action
- editable reply draft
- save AI result
- manual review
- status change
- dashboard statistics

## AI Output Baseline

Minimum output shape:

```json
{
  "category": "sales_inquiry | support_request | invoice_billing | contract_agreement | general_admin | complaint",
  "priority": "low | medium | high",
  "summary": "string",
  "suggested_route": "sales | support | finance | admin | legal",
  "suggested_next_action": "string",
  "suggested_reply": "string",
  "confidence": 0.0,
  "extracted_fields": {
    "company_name": "string | null",
    "contact_name": "string | null",
    "contact_email": "string | null",
    "phone": "string | null",
    "invoice_number": "string | null",
    "amount": "string | null",
    "deadline": "string | null",
    "request_type": "string | null"
  }
}
```

## Acceptance Criteria

### Technical

- the project starts locally with documented commands
- PostgreSQL runs in Docker locally
- demo data can be seeded quickly
- at least 10 demo cases can be processed without crashes
- AI results are persisted and shown again correctly
- review actions produce audit entries
- dashboard metrics reflect processed data

### Commercial

- a prospect can understand the value in a 2 to 3 minute walkthrough
- the link between AI and reduced manual work is obvious
- the demo shows backend, workflow, and AI orchestration capability
- the demo clearly suggests future integrations with real client systems

## Current Execution Order

1. Finalize the documentation baseline.
2. Scaffold the project structure and local Docker environment.
3. Implement the database schema and seed data.
4. Build the inbox and case detail UI.
5. Add upload and extraction.
6. Add AI processing and schema validation.
7. Add review workflow and dashboard.

## Immediate Next Step

The MVP baseline is implemented. The current practical next steps are:

1. keep the seeded demo dataset presentation-ready
2. maintain lightweight role-based access for demo sharing
3. add dictionary-based localization when the English flow no longer changes frequently
