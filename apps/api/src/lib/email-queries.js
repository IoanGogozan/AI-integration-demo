import { prisma } from './prisma.js';

export async function findEmailWithRelations(id) {
  return prisma.email.findUnique({
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
  });
}
