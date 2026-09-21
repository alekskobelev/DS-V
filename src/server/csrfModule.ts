import crypto from 'crypto';
import type { Request, Response, NextFunction, Express } from 'express';

interface TokenRecord {
  token: string;
  createdAt: number;
  expiresAt: number;
}

// In-memory registry of active CSRF tokens with automatic expiration (24h TTL)
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const activeTokens = new Map<string, TokenRecord>();

// Periodic cleanup of expired tokens every 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, record] of activeTokens.entries()) {
    if (record.expiresAt < now) {
      activeTokens.delete(token);
    }
  }
}, 30 * 60 * 1000).unref();

/**
 * Generate a cryptographically secure, high-entropy CSRF token (64 hex characters)
 */
export function generateCsrfToken(): string {
  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  activeTokens.set(token, {
    token,
    createdAt: now,
    expiresAt: now + TOKEN_TTL_MS,
  });

  // Limit map size in extreme cases
  if (activeTokens.size > 10000) {
    const oldestKey = activeTokens.keys().next().value;
    if (oldestKey) activeTokens.delete(oldestKey);
  }

  return token;
}

/**
 * Validates whether the supplied token is valid and active
 */
export function verifyCsrfToken(token: unknown): boolean {
  if (!token || typeof token !== 'string' || token.length < 16) {
    return false;
  }
  const record = activeTokens.get(token);
  if (!record) {
    return false;
  }
  if (record.expiresAt < Date.now()) {
    activeTokens.delete(token);
    return false;
  }
  return true;
}

/**
 * Express Middleware for protecting against Cross-Site Request Forgery (CSRF)
 * Validates CSRF token on all state-changing HTTP requests (POST, PUT, PATCH, DELETE)
 */
export function csrfProtectionMiddleware(req: Request, res: Response, next: NextFunction) {
  // Always attach a fresh CSRF token in the response headers for convenience
  const tokenHeader = req.headers['x-csrf-token'] || req.headers['x-xsrf-token'] || req.headers['csrf-token'];
  let currentToken = typeof tokenHeader === 'string' ? tokenHeader : undefined;

  // Exempt safe read-only methods and dry-run sandbox validators from CSRF validation
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  const isSchemaValidateSandbox = req.method.toUpperCase() === 'POST' && req.path.startsWith('/schemas/validate');
  if (safeMethods.includes(req.method.toUpperCase()) || isSchemaValidateSandbox) {
    if (!currentToken || !verifyCsrfToken(currentToken)) {
      currentToken = generateCsrfToken();
    }
    res.setHeader('X-CSRF-Token', currentToken);
    return next();
  }

  // State-changing methods: POST, PUT, PATCH, DELETE
  const incomingToken =
    tokenHeader ||
    (req.body && typeof req.body === 'object' ? req.body._csrf : undefined) ||
    (req.query ? req.query._csrf : undefined);

  if (!incomingToken || typeof incomingToken !== 'string') {
    return res.status(403).json({
      success: false,
      error: 'Защита от CSRF: CSRF-токен безопасности отсутствует в заголовках (X-CSRF-Token) или теле запроса.',
      code: 'EBADCSRFTOKEN',
      requiresCsrfToken: true,
    });
  }

  if (!verifyCsrfToken(incomingToken)) {
    return res.status(403).json({
      success: false,
      error: 'Защита от CSRF: Недействительный или истекший CSRF-токен безопасности. Обновите страницу или запросите новый токен через /api/csrf-token.',
      code: 'EBADCSRFTOKEN',
      requiresCsrfToken: true,
    });
  }

  // Token is valid; proceed with the request
  res.setHeader('X-CSRF-Token', incomingToken);
  next();
}

/**
 * Registers CSRF Token management endpoints
 */
export function registerCsrfRoutes(app: Express): void {
  // 1. Get or generate a valid CSRF token
  app.get('/api/csrf-token', (_req: Request, res: Response) => {
    const token = generateCsrfToken();
    res.setHeader('X-CSRF-Token', token);
    res.json({
      success: true,
      csrfToken: token,
      expiresIn: Math.floor(TOKEN_TTL_MS / 1000),
      message: 'CSRF-токен безопасности успешно сгенерирован.',
    });
  });

  // 2. Validate token integrity endpoint (for automated tests and DoD QA suites)
  app.post('/api/csrf-verify', (req: Request, res: Response) => {
    // If request reached here, it already passed csrfProtectionMiddleware
    res.json({
      success: true,
      valid: true,
      message: 'CSRF-токен успешно проверен сервером безопасности.',
    });
  });
}
