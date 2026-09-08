import { createAuth } from '../_lib/auth.mjs';
import { getSql } from '../_lib/db.mjs';
import { statusForUser } from '../_lib/billing.mjs';
import { handleError, methodNotAllowed, sendJson } from '../_lib/http.mjs';
export function createStatusHandler({ requireAuth, sql, env = process.env } = {}) {
  return async function status(req, res) {
    if (req.method !== 'GET') return methodNotAllowed(res, 'GET');
    try { const { userId } = await (requireAuth || createAuth({ env }))(req); return sendJson(res, 200, await statusForUser({ sql: sql || getSql(env), userId })); }
    catch (error) { return handleError(res, error); }
  };
}
export default async function handler(req, res) { return createStatusHandler()(req, res); }
