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
