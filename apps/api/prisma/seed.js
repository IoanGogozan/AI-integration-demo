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
    status: 'new',
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
    status: 'new',
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
    status: 'new',
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
