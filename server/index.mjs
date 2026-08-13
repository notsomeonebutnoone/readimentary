import http from 'node:http';
import { URL } from 'node:url';
import checkout from '../api/billing/checkout.mjs';
import portal from '../api/billing/portal.mjs';
import status from '../api/billing/status.mjs';
import stripeWebhook from '../api/webhooks/stripe.mjs';

const port = Number(process.env.API_PORT || 8787);
const appUrl = process.env.APP_URL || 'http://localhost:5173';
const routes = new Map([
  ['/api/billing/checkout', checkout],
  ['/api/billing/portal', portal],
  ['/api/billing/status', status],
  ['/api/webhooks/stripe', stripeWebhook]
]);

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin;
  if (origin === appUrl) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, Stripe-Signature');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Vary', 'Origin');
  }
  if (req.method === 'OPTIONS') {
    res.statusCode = origin === appUrl ? 204 : 403;
    return res.end();
  }

  const pathname = new URL(req.url, `http://localhost:${port}`).pathname;
  const handler = routes.get(pathname);
  if (!handler) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'API route not found.' } }));
  }
  return handler(req, res);
});

server.listen(port, () => console.log(`Readimentary API listening on http://localhost:${port}`));
