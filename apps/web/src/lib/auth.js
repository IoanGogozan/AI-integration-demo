import crypto from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const sessionCookieName = 'norvix_demo_session';
const defaultAuthSecret = 'norvix-demo-auth-secret';
const allowedRoles = new Set(['viewer', 'operator', 'reviewer', 'admin']);

function getAuthSecret() {
  return process.env.AUTH_SECRET || defaultAuthSecret;
}

function getSessionTtlMs() {
  const ttlHours = Number(process.env.SESSION_TTL_HOURS || 12);
  return ttlHours * 60 * 60 * 1000;
}

function base64UrlEncode(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function signValue(value) {
  return crypto.createHmac('sha256', getAuthSecret()).update(value).digest('hex');
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
      role: allowedRoles.has(payload.role) ? payload.role : 'viewer'
    };
  } catch (_error) {
    return null;
  }
}

function sanitizeUser(user, fallbackRole = 'viewer') {
  const role = allowedRoles.has(user.role) ? user.role : fallbackRole;

  return {
    email: String(user.email || '').trim().toLowerCase(),
    password: String(user.password || ''),
    name: String(user.name || 'Demo User'),
    role
  };
}

function getDefaultDemoUsers() {
  const primaryRole = allowedRoles.has(process.env.DEMO_AUTH_ROLE)
    ? process.env.DEMO_AUTH_ROLE
    : 'operator';

  return [
    sanitizeUser({
      email: process.env.DEMO_AUTH_EMAIL || 'demo@norvix.ai',
      password: process.env.DEMO_AUTH_PASSWORD || 'demo1234',
      name: process.env.DEMO_AUTH_NAME || 'Demo Operator',
      role: primaryRole
    }),
    sanitizeUser({
      email: process.env.DEMO_REVIEWER_EMAIL || 'reviewer@norvix.ai',
      password: process.env.DEMO_REVIEWER_PASSWORD || 'review1234',
      name: process.env.DEMO_REVIEWER_NAME || 'Demo Reviewer',
      role: 'reviewer'
    }),
    sanitizeUser({
      email: process.env.DEMO_VIEWER_EMAIL || 'viewer@norvix.ai',
      password: process.env.DEMO_VIEWER_PASSWORD || 'view1234',
      name: process.env.DEMO_VIEWER_NAME || 'Demo Viewer',
      role: 'viewer'
    }),
    sanitizeUser({
      email: process.env.DEMO_ADMIN_EMAIL || 'admin@norvix.ai',
      password: process.env.DEMO_ADMIN_PASSWORD || 'admin1234',
      name: process.env.DEMO_ADMIN_NAME || 'Demo Admin',
      role: 'admin'
    })
  ];
}

function getDemoUsers() {
  const json = process.env.DEMO_AUTH_USERS_JSON;

  if (!json) {
    return getDefaultDemoUsers();
  }

  try {
    const parsed = JSON.parse(json);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return getDefaultDemoUsers();
    }

    return parsed
      .map((item) => sanitizeUser(item))
      .filter((item) => item.email && item.password);
  } catch (_error) {
    return getDefaultDemoUsers();
  }
}

export function authenticateWebDemoUser(email, password) {
  return getDemoUsers().find((user) => user.email === email && user.password === password) || null;
}

export function createSessionToken(user) {
  const payload = {
    email: user.email,
    name: user.name,
    role: user.role,
    exp: Date.now() + getSessionTtlMs()
  };
  const serializedPayload = JSON.stringify(payload);
  const encodedPayload = base64UrlEncode(serializedPayload);
  const signature = signValue(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export async function setAppSessionCookie(user) {
  const cookieStore = await cookies();

  cookieStore.set(sessionCookieName, createSessionToken(user), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(getSessionTtlMs() / 1000),
    secure: process.env.NODE_ENV === 'production'
  });
}

export async function clearAppSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    secure: process.env.NODE_ENV === 'production'
  });
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
