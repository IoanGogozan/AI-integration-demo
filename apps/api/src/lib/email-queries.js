import { prisma } from './prisma.js';

export async function findEmailWithRelations(id) {
  const [email, auditEvents] = await Promise.all([
    prisma.email.findUnique({
      where: {
        id
      },
      include: {
        attachments: true,
        aiResults: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        },
        jobs: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    }),
    prisma.auditEvent.findMany({
      where: {
        entityType: 'email',
        entityId: id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 8
    })
  ]);

  if (!email) {
    return null;
  }

  return {
    ...email,
    auditEvents
  };
}
