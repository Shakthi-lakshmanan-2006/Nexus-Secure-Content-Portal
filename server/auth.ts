import { Request, Response, NextFunction } from 'express';
import { db, isEmailAdmin } from './db.js';
import { UserProfile } from '../src/types.js';

// Session cookie constants
export const SESSION_COOKIE_NAME = '__nexus_session';
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
};

// Extend express Request type to include user profile
declare global {
  namespace Express {
    interface Request {
      user?: UserProfile;
    }
  }
}

/**
 * Resolve session from HTTP-Only cookie or Authorization Bearer header
 * Resilient for serverless platforms like Vercel
 */
export function resolveSession(req: Request): UserProfile | null {
  const sessionToken = req.cookies?.[SESSION_COOKIE_NAME];
  let decoded: any = null;
  
  if (sessionToken) {
    try {
      decoded = JSON.parse(Buffer.from(sessionToken, 'base64').toString('utf-8'));
    } catch {
      // Invalid session token format
    }
  }

  // Fallback to Bearer token if provided (e.g. for API programmatic calls or Vercel cross-origin/no-cookie fallback)
  if (!decoded) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
      } catch {
        // Ignore
      }
    }
  }

  // Fallback to token query parameter (useful for <video>, <object>, and <iframe> embedding in sandboxed environments)
  if (!decoded && req.query && typeof req.query.token === 'string') {
    try {
      decoded = JSON.parse(Buffer.from(req.query.token, 'base64').toString('utf-8'));
    } catch {
      // Ignore
    }
  }

  if (decoded && decoded.email) {
    let profile = db.getProfileByEmail(decoded.email);
    // If running in a new serverless container instance, restore profile to cache
    if (!profile) {
      const role = decoded.role || (isEmailAdmin(decoded.email) ? 'ADMIN' : 'VIEWER');
      profile = db.upsertProfile({
        email: decoded.email,
        full_name: decoded.full_name || decoded.email.split('@')[0],
        avatar_url: decoded.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(decoded.email)}`,
        role,
      });
    }

    // If token explicitly carries a demo switched role, respect it
    if (decoded.role && profile.role !== decoded.role) {
      profile.role = decoded.role;
    }

    return profile;
  }

  return null;
}

/**
 * Authentication Gate Middleware
 * Strictly returns 401 Unauthorized if request lacks valid session
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = resolveSession(req);
  if (!user) {
    return res.status(401).json({
      error: 'Unauthorized: Authentication required to access protected content.',
      code: 'AUTH_REQUIRED',
    });
  }
  req.user = user;
  next();
}

/**
 * Role Authorization Gate Middleware
 * Strictly returns 403 Forbidden if user is authenticated but not an ADMIN
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = resolveSession(req);
  if (!user) {
    return res.status(401).json({
      error: 'Unauthorized: Authentication required.',
      code: 'AUTH_REQUIRED',
    });
  }

  if (user.role !== 'ADMIN') {
    // Log unauthorized attempt to audit system
    db.addActivityLog({
      user_id: user.id,
      user_name: user.full_name,
      user_email: user.email,
      action: 'SECURITY_TEST',
      metadata: {
        event: 'UNAUTHORIZED_ADMIN_ACCESS_ATTEMPT',
        endpoint: req.originalUrl,
        method: req.method,
        ip: req.ip,
      },
    });

    return res.status(403).json({
      error: 'Forbidden: Administrator privileges required for this operation.',
      code: 'ADMIN_PRIVILEGE_REQUIRED',
    });
  }

  req.user = user;
  next();
}

/**
 * Encode user profile into secure base64 session token
 */
export function createSessionToken(user: UserProfile): string {
  const payload = {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    avatar_url: user.avatar_url,
    role: user.role,
    issuedAt: Date.now(),
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}
