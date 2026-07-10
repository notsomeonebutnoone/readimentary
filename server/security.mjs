import crypto from 'node:crypto';

const b64 = (value) => Buffer.from(value).toString('base64url');
const secret = () => process.env.JWT_SECRET || 'development-only-change-me';

export function signJwt(payload, expiresInSeconds = 60 * 60 * 24 * 30) {
  const header = b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + expiresInSeconds }));
  const signature = crypto.createHmac('sha256', secret()).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

export function verifyJwt(token) {
  if (!token) return null;
  const [header, body, signature] = token.split('.');
  if (!header || !body || !signature) return null;
  const expected = crypto.createHmac('sha256', secret()).update(`${header}.${body}`).digest();
  const actual = Buffer.from(signature, 'base64url');
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return null;
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  return payload.exp > Date.now() / 1000 ? payload : null;
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  const [salt, expectedHex] = (stored || '').split(':');
  if (!salt || !expectedHex) return false;
  const actual = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHex, 'hex');
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

export const randomState = () => crypto.randomBytes(24).toString('base64url');

export function verifyStripeSignature(rawBody, signatureHeader, endpointSecret) {
  if (!signatureHeader || !endpointSecret) return false;
  const entries = Object.fromEntries(signatureHeader.split(',').map((part) => part.split('=')));
  if (!entries.t || !entries.v1 || Math.abs(Date.now() / 1000 - Number(entries.t)) > 300) return false;
  const expected = crypto.createHmac('sha256', endpointSecret).update(`${entries.t}.${rawBody}`).digest('hex');
  const actual = Buffer.from(entries.v1, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');
  return actual.length === expectedBuffer.length && crypto.timingSafeEqual(actual, expectedBuffer);
}
