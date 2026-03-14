import crypto from 'crypto';

const sessionCookieName = 'norvix_demo_session';
const defaultAuthSecret = 'norvix-demo-auth-secret';

function getAuthSecret() {
  return process.env.AUTH_SECRET || defaultAuthSecret;
}

function getSessionTtlMs() {
  const ttlHours = Number(process.env.SESSION_TTL_HOURS || 12);
  return ttlHours * 60 * 60 * 1000;
}

function getDemoCredentials() {
  return {
    email: process.env.DEMO_AUTH_EMAIL || 'demo@norvix.ai',
    password: process.env.DEMO_AUTH_PASSWORD || 'demo1234',
    name: process.env.DEMO_AUTH_NAME || 'Demo Operator'
  };
}

function base64UrlEncode(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function base64UrlDecode(input) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return Buffer.from(`${normalized}${padding}`, 'base64').toString('utf8');
}

function signValue(value) {
  return crypto.createHmac('sha256', getAuthSecret()).update(value).digest('hex');
}

function parseCookieHeader(cookieHeader = '') {
  return cookieHeader
    .split(';')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .reduce((result, entry) => {
      const separatorIndex = entry.indexOf('=');

      if (separatorIndex === -1) {
        return result;
      }

      const key = entry.slice(0, separatorIndex);
      const value = entry.slice(separatorIndex + 1);

      result[key] = decodeURIComponent(value);
      return result;
    }, {});
}

function createSessionToken(user) {
  const payload = {
    email: user.email,
    name: user.name,
    exp: Date.now() + getSessionTtlMs()
  };
  const serializedPayload = JSON.stringify(payload);
  const encodedPayload = base64UrlEncode(serializedPayload);
  const signature = signValue(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

function verifySessionToken(token) {
  if (!token || !token.includes('.')) {
    return null;
  }

  const [encodedPayload, signature] = token.split('.');

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signValue(encodedPayload);

  if (signature.length !== expectedSignature.length) {
    return null;
  }

  const signaturesMatch = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );

  if (!signaturesMatch) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));

    if (!payload.exp || payload.exp < Date.now()) {
      return null;
    }

    return {
      email: payload.email,
      name: payload.name
    };
  } catch (_error) {
    return null;
  }
}

function buildCookieValue(token, maxAgeMs) {
  const parts = [
    `${sessionCookieName}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${Math.floor(maxAgeMs / 1000)}`
  ];

  if (process.env.NODE_ENV === 'production') {
    parts.push('Secure');
  }

  return parts.join('; ');
}

export function attachSession(req, _res, next) {
  const cookies = parseCookieHeader(req.headers.cookie);
  req.sessionUser = verifySessionToken(cookies[sessionCookieName] || '');
  next();
}

export function requireSession(req, res, next) {
  if (!req.sessionUser) {
    res.status(401).json({
      message: 'Authentication required'
    });
    return;
  }

  next();
}

export function setSessionCookie(res, user) {
  const token = createSessionToken(user);
  res.setHeader('Set-Cookie', buildCookieValue(token, getSessionTtlMs()));
}

export function clearSessionCookie(res) {
  const parts = [
    `${sessionCookieName}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0'
  ];

  if (process.env.NODE_ENV === 'production') {
    parts.push('Secure');
  }

  res.setHeader('Set-Cookie', parts.join('; '));
}

export function authenticateDemoUser(email, password) {
  const credentials = getDemoCredentials();

  if (email !== credentials.email || password !== credentials.password) {
    return null;
  }

  return {
    email: credentials.email,
    name: credentials.name
  };
}

export function getSessionCookieName() {
  return sessionCookieName;
}

export function getDemoUserConfig() {
  return getDemoCredentials();
}
