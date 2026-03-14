import { prisma } from './prisma.js';

export async function getDashboardStats() {
  const [emails, aiResults, reviewItems] = await Promise.all([
    prisma.email.findMany({
      include: {
        attachments: true
      },
      orderBy: {
        receivedAt: 'desc'
      }
    }),
    prisma.aiResult.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    }),
    prisma.email.findMany({
      where: {
        status: 'needs_review'
      },
      orderBy: {
        receivedAt: 'desc'
      },
      take: 10
    })
  ]);

  const totals = {
    cases: emails.length,
    attachments: emails.reduce((count, email) => count + email.attachments.length, 0),
    processed: aiResults.length,
    needsReview: reviewItems.length
  };

  return {
    totals,
    byStatus: countBy(emails, (item) => item.status),
    byCategory: countBy(aiResults, (item) => item.category),
    byPriority: countBy(aiResults, (item) => item.priority),
    reviewItems: reviewItems.map((item) => ({
      id: item.id,
      subject: item.subject,
      sender: item.sender,
      receivedAt: item.receivedAt,
      status: item.status
    }))
  };
}

function countBy(items, getKey) {
  const counts = new Map();

  for (const item of items) {
    const key = getKey(item);
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([key, count]) => ({
      key,
      count
    }))
    .sort((left, right) => right.count - left.count);
}
