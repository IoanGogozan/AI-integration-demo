import {
  allowedRoles,
  createSessionToken,
  getAuthSecret,
  getDemoUsers,
  getSessionTtlMs,
  sessionCookieName,
  verifySessionToken
} from '../../../../packages/shared-auth/src/index.js';

function isApiAuthEnforced() {
  return process.env.ENFORCE_API_AUTH === 'true';
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
  if (!isApiAuthEnforced()) {
    next();
    return;
  }

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
    if (!isApiAuthEnforced()) {
      next();
      return;
    }

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
