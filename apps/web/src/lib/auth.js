import crypto from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const sessionCookieName = 'norvix_demo_session';
const defaultAuthSecret = 'norvix-demo-auth-secret';

function getAuthSecret() {
  return process.env.AUTH_SECRET || defaultAuthSecret;
}

function base64UrlDecode(input) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return Buffer.from(`${normalized}${padding}`, 'base64').toString('utf8');
}

function verifySignature(value, signature) {
  const expectedSignature = crypto.createHmac('sha256', getAuthSecret()).update(value).digest('hex');

  if (signature.length !== expectedSignature.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

async function readSessionFromCookieStore() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;

  if (!token || !token.includes('.')) {
    return null;
  }

  const [encodedPayload, signature] = token.split('.');

  if (!encodedPayload || !signature || !verifySignature(encodedPayload, signature)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));

    if (!payload.exp || payload.exp < Date.now()) {
      return null;
    }

    return {
      email: payload.email,
      name: payload.name,
      role: payload.role || 'viewer'
    };
  } catch (_error) {
    return null;
  }
}

export async function requireAppSession() {
  const session = await readSessionFromCookieStore();

  if (!session) {
    redirect('/login');
  }

  return session;
}

export async function getAppSession() {
  return readSessionFromCookieStore();
}
