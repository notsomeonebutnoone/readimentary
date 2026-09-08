import { createClerkClient } from '@clerk/backend';
import { authorizedParties } from './config.mjs';
export function bearerToken(req) { return /^Bearer\s+(.+)$/i.exec(req.headers?.authorization || req.headers?.Authorization || '')?.[1] || null; }
export function createAuth({ clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY }), env = process.env } = {}) {
  return async function requireAuth(req) {
    const token = bearerToken(req);
    if (!token) { const error = new Error('Sign in to continue.'); error.status = 401; error.code = 'UNAUTHENTICATED'; throw error; }
    try { const payload = await clerk.verifyToken(token, { authorizedParties: authorizedParties(env) }); return { userId: payload.sub, sessionId: payload.sid, claims: payload }; }
    catch { const error = new Error('Sign in to continue.'); error.status = 401; error.code = 'UNAUTHENTICATED'; throw error; }
  };
}
