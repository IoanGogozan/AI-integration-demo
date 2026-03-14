import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  createSessionToken,
  getDemoUsers,
  getSessionTtlMs,
  sessionCookieName,
  verifySessionToken
} from '../../../../packages/shared-auth/src/index.js';

async function readSessionFromCookieStore() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;
  return verifySessionToken(token || '');
}

export function authenticateWebDemoUser(email, password) {
  return getDemoUsers().find((user) => user.email === email && user.password === password) || null;
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
