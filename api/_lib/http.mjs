export function sendJson(res, status, payload, headers = {}) {
  res.statusCode = status;
  for (const [key, value] of Object.entries({ 'Content-Type': 'application/json', ...headers })) res.setHeader?.(key, value);
  res.end(JSON.stringify(payload));
}
export function methodNotAllowed(res, allow) { return sendJson(res, 405, { error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed.' } }, { Allow: allow }); }
export async function readRawBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return Buffer.from(req.body);
  if (req.body && typeof req.body === 'object') {
    const error = new Error('Raw request body is required.');
    error.status = 400;
    error.code = 'RAW_BODY_REQUIRED';
    throw error;
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks);
}
export async function readJson(req) {
  const raw = await readRawBody(req);
  if (!raw.length) return {};
  try { return JSON.parse(raw.toString('utf8')); }
  catch { const error = new Error('Request body must be valid JSON.'); error.status = 400; error.code = 'INVALID_JSON'; throw error; }
}
export function handleError(res, error) {
  const status = error.status || 500;
  const code = error.code || (status === 500 ? 'INTERNAL_ERROR' : 'BAD_REQUEST');
  return sendJson(res, status, { error: { code, message: status === 500 ? 'Something went wrong.' : error.message } });
}
