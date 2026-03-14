import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const emails = [
  {
    sender: 'lars@fjordindustrial.no',
    subject: 'Request for quote for document workflow automation',
    body:
      'Hello, we want a proposal for reducing manual work around incoming PDF requests and support emails. We are evaluating options this month and would like a call next week.',
    receivedAt: new Date('2026-03-10T08:15:00Z'),
    status: 'new',
    attachments: [
      {
        fileName: 'workflow-requirements.txt',
        mimeType: 'text/plain',
        extractedText:
          'Company: Fjord Industrial. Need: classify inbox requests, summarize attachments, and route finance-related cases to the correct team.'
      }
    ]
  },
  {
    sender: 'invoice@northsupport.no',
    subject: 'Invoice 2026-1043 needs correction before payment',
    body:
      'Hi, invoice 2026-1043 includes the wrong billing address. Please review and send an updated copy before March 20.',
    receivedAt: new Date('2026-03-11T10:30:00Z'),
    status: 'needs_review',
    aiResult: {
      category: 'invoice_billing',
      priority: 'medium',
      summary:
        'The customer requests a corrected invoice because the billing address is wrong and asks for an updated copy before March 20.',
      suggestedRoute: 'finance',
      suggestedNextAction: 'Review the invoice record, correct the billing address, and prepare a replacement PDF.',
      suggestedReply:
        'Hello, we reviewed your invoice request and our finance team is preparing an updated copy with the corrected billing address.',
      confidence: 0.82,
      extractedJson: {
        company_name: 'North Support',
        contact_name: null,
        contact_email: 'invoice@northsupport.no',
        phone: null,
        invoice_number: '2026-1043',
        amount: 'NOK 18,400',
        deadline: '2026-03-20',
        request_type: 'invoice_billing'
      }
    },
    attachments: [
      {
        fileName: 'invoice-2026-1043.txt',
        mimeType: 'text/plain',
        extractedText:
          'Invoice number: 2026-1043. Amount: NOK 18,400. Requested action: correct billing address and resend PDF.'
      }
    ]
  },
  {
    sender: 'support@arcticlogistics.no',
    subject: 'Urgent access issue for Oslo operations team',
    body:
      'Our Oslo team cannot access the internal portal after the latest update. We need this fixed today because shipments are blocked.',
    receivedAt: new Date('2026-03-12T06:45:00Z'),
    status: 'processing',
    attachments: []
  },
  {
    sender: 'mona@oslobyran.no',
    subject: 'Contract review request for supplier renewal',
    body:
      'Hello, please review the attached supplier renewal agreement before we send it to the vendor. We need comments by Friday.',
    receivedAt: new Date('2026-03-12T09:20:00Z'),
    status: 'approved',
    aiResult: {
      category: 'contract_agreement',
      priority: 'medium',
      summary:
        'The sender requests a legal review of a supplier renewal agreement and needs comments before the end of the week.',
      suggestedRoute: 'legal',
      suggestedNextAction: 'Assign the agreement to legal review and capture comments for procurement before vendor submission.',
      suggestedReply:
        'Hello, we received the supplier renewal agreement and our legal review is underway. We will return comments before Friday.',
      confidence: 0.87,
      extractedJson: {
        company_name: 'Nord Supply AS',
        contact_name: 'Mona',
        contact_email: 'mona@oslobyran.no',
        phone: null,
        invoice_number: null,
        amount: null,
        deadline: 'Friday',
        request_type: 'contract_agreement'
      }
    },
    attachments: [
      {
        fileName: 'supplier-renewal-agreement.txt',
        mimeType: 'text/plain',
        extractedText:
          'Agreement draft. Supplier: Nord Supply AS. Renewal term: 24 months. Review request: legal comments and approval before signature.'
      }
    ]
  },
  {
    sender: 'sales@vestbygg.no',
    subject: 'Need pricing and implementation timeline',
    body:
      'We are comparing vendors for inbox automation. Please send pricing, implementation timeline, and whether you can integrate with our current CRM.',
    receivedAt: new Date('2026-03-12T13:00:00Z'),
    status: 'approved',
    aiResult: {
      category: 'sales_inquiry',
      priority: 'medium',
      summary:
        'The prospect wants pricing, implementation timing, and confirmation of CRM integration capabilities for inbox automation.',
      suggestedRoute: 'sales',
      suggestedNextAction: 'Prepare a pilot proposal with pricing range, timeline estimate, and CRM integration scope.',
      suggestedReply:
        'Hello, thanks for reaching out. We can share a pilot scope, estimated timeline, and CRM integration approach for your team.',
      confidence: 0.84,
      extractedJson: {
        company_name: 'Vestbygg AS',
        contact_name: null,
        contact_email: 'sales@vestbygg.no',
        phone: null,
        invoice_number: null,
        amount: null,
        deadline: null,
        request_type: 'sales_inquiry'
      }
    },
    attachments: [
      {
        fileName: 'requirements-overview.txt',
        mimeType: 'text/plain',
        extractedText:
          'Vestbygg AS wants CRM integration, email classification, finance routing, and reporting for operations managers.'
      }
    ]
  },
  {
    sender: 'billing@bergenmarine.no',
    subject: 'Missing credit note for February invoice',
    body:
      'We were promised a credit note for the overcharge on the February invoice. Please confirm the amount and send the corrected document.',
    receivedAt: new Date('2026-03-13T07:15:00Z'),
    status: 'needs_review',
    attachments: [
      {
        fileName: 'february-billing-case.txt',
        mimeType: 'text/plain',
        extractedText:
          'Reference invoice: BM-2048. Overcharge discussed: NOK 4,250. Customer requests updated invoice and credit note.'
      }
    ]
  },
  {
    sender: 'operations@northgrid.no',
    subject: 'Support request with field technician deadline',
    body:
      'Please prioritize this. Our field technician needs remote portal access restored before 2026-03-18 or project work will stop.',
    receivedAt: new Date('2026-03-13T08:50:00Z'),
    status: 'needs_review',
    aiResult: {
      category: 'support_request',
      priority: 'high',
      summary:
        'A field technician access issue threatens project work, and the sender states the problem must be resolved before 2026-03-18.',
      suggestedRoute: 'support',
      suggestedNextAction: 'Create a high-priority support task and verify access restoration before the stated deadline.',
      suggestedReply:
        'Hello, we marked this as high priority and our support team is reviewing the access issue now.',
      confidence: 0.73,
      extractedJson: {
        company_name: 'Northgrid',
        contact_name: null,
        contact_email: 'operations@northgrid.no',
        phone: null,
        invoice_number: null,
        amount: null,
        deadline: '2026-03-18',
        request_type: 'support_request'
      }
    },
    attachments: []
  },
  {
    sender: 'anna@clearaccounting.no',
    subject: 'General admin request for onboarding forms',
    body:
      'Can you confirm where completed onboarding forms should be routed internally? We want to standardize the process for new clients.',
    receivedAt: new Date('2026-03-13T10:05:00Z'),
    status: 'new',
    attachments: [
      {
        fileName: 'onboarding-process-notes.txt',
        mimeType: 'text/plain',
        extractedText:
          'Current issue: onboarding forms arrive by email and are forwarded manually. Teams involved: admin, finance, support.'
      }
    ]
  },
  {
    sender: 'procurement@fjelltek.no',
    subject: 'Complaint about delayed response on agreement intake',
    body:
      'We sent our agreement package last week and still have no confirmation. This delay is affecting our procurement timeline.',
    receivedAt: new Date('2026-03-13T12:40:00Z'),
    status: 'new',
    attachments: [
      {
        fileName: 'agreement-package-summary.txt',
        mimeType: 'text/plain',
        extractedText:
          'Agreement package delivered previously. Customer requests confirmation, owner assignment, and expected review timeline.'
      }
    ]
  },
  {
    sender: 'support@trondheimit.no',
    subject: 'Weekly backlog summary for support queue',
    body:
      'Sharing our current support backlog to discuss whether your workflow can summarize and route these requests faster.',
    receivedAt: new Date('2026-03-13T14:10:00Z'),
    status: 'new',
    attachments: [
      {
        fileName: 'support-backlog-summary.txt',
        mimeType: 'text/plain',
        extractedText:
          'Recurring themes: login issues, invoice clarification, access permissions, onboarding questions. Need prioritization and routing.'
      }
    ]
  },
  {
    sender: 'cecilie@novabridge.no',
    subject: 'Follow-up on AI workflow pilot scope',
    body:
      'We want a short pilot focused on intake, summaries, and finance-related routing. Please propose the first scope and expected effort.',
    receivedAt: new Date('2026-03-14T07:35:00Z'),
    status: 'new',
    attachments: []
  },
  {
    sender: 'legal@polarisservice.no',
    subject: 'Agreement intake with requested turnaround',
    body:
      'Attached is the agreement intake note for a client renewal. We need the first legal pass within three working days.',
    receivedAt: new Date('2026-03-14T08:25:00Z'),
    status: 'new',
    attachments: [
      {
        fileName: 'client-renewal-intake.txt',
        mimeType: 'text/plain',
        extractedText:
          'Client renewal agreement. Required action: legal review. Requested turnaround: three working days. Stakeholders: legal and account management.'
      }
    ]
  }
];

async function main() {
  await prisma.auditEvent.deleteMany();
  await prisma.processingJob.deleteMany();
  await prisma.aiResult.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.email.deleteMany();

  for (const item of emails) {
    const email = await prisma.email.create({
      data: {
        sender: item.sender,
        subject: item.subject,
        body: item.body,
        receivedAt: item.receivedAt,
        status: item.status,
        attachments: {
          create: item.attachments
        }
      }
    });

    if (item.aiResult) {
      await prisma.aiResult.create({
        data: {
          emailId: email.id,
          category: item.aiResult.category,
          priority: item.aiResult.priority,
          summary: item.aiResult.summary,
          suggestedRoute: item.aiResult.suggestedRoute,
          suggestedNextAction: item.aiResult.suggestedNextAction,
          suggestedReply: item.aiResult.suggestedReply,
          confidence: item.aiResult.confidence,
          extractedJson: item.aiResult.extractedJson
        }
      });

      await prisma.processingJob.create({
        data: {
          emailId: email.id,
          status: 'succeeded',
          startedAt: item.receivedAt,
          finishedAt: item.receivedAt
        }
      });

      await prisma.auditEvent.create({
        data: {
          entityType: 'email',
          entityId: email.id,
          action: 'seeded_ai_result',
          payload: {
            category: item.aiResult.category,
            priority: item.aiResult.priority
          }
        }
      });
    }

    await prisma.auditEvent.create({
      data: {
        entityType: 'email',
        entityId: email.id,
        action: 'seeded',
        payload: {
          source: 'prisma-seed'
        }
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
