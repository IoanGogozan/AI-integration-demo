const defaultApiBaseUrl = process.env.API_BASE_URL || 'http://localhost:4000';

async function request(path) {
  const response = await fetch(`${defaultApiBaseUrl}${path}`, {
    cache: 'no-store'
  });

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
