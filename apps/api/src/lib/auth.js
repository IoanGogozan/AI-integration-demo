import crypto from 'crypto';

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
    role: user.role,
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
      name: payload.name,
      role: allowedRoles.has(payload.role) ? payload.role : 'viewer'
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

export function requireRole(allowed) {
  const allowedSet = new Set(allowed);

  return (req, res, next) => {
    if (!req.sessionUser) {
      res.status(401).json({
        message: 'Authentication required'
      });
      return;
    }

    if (!allowedSet.has(req.sessionUser.role)) {
      res.status(403).json({
        message: 'Insufficient role for this action'
      });
      return;
    }

    next();
  };
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
  return getDemoUsers().find((user) => user.email === email && user.password === password) || null;
}

export function getSessionCookieName() {
  return sessionCookieName;
}

export function getDemoUserConfig() {
  return getDemoUsers().map(({ password, ...user }) => user);
}
