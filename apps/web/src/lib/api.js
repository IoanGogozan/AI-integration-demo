import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const defaultApiBaseUrl = process.env.API_BASE_URL || 'http://localhost:4000';

async function request(path) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');
  const response = await fetch(`${defaultApiBaseUrl}${path}`, {
    cache: 'no-store',
    headers: cookieHeader
      ? {
          cookie: cookieHeader
        }
      : undefined
  });

  if (response.status === 401) {
    redirect('/login');
  }

  if (!response.ok) {
    throw new Error(`API request failed for ${path} with status ${response.status}`);
  }

  return response.json();
}

export async function getEmails() {
  try {
    const data = await request('/emails');
    return data.items || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getEmail(id) {
  try {
    const data = await request(`/emails/${id}`);
    return data.item || null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getDashboardStats() {
  try {
    return await request('/dashboard/stats');
  } catch (error) {
    console.error(error);
    return {
      totals: {
        cases: 0,
        attachments: 0,
        processed: 0,
        needsReview: 0
      },
      byStatus: [],
      byCategory: [],
      byPriority: [],
      reviewItems: []
    };
  }
}
