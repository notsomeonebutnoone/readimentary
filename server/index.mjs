import http from 'node:http';
import crypto from 'node:crypto';
import { URL, URLSearchParams } from 'node:url';
import { db, publicUser, findOrCreateOAuthUser } from './database.mjs';
import { hashPassword, signJwt, verifyJwt, verifyPassword, verifyStripeSignature } from './security.mjs';

const port = Number(process.env.API_PORT || 8787);
const appUrl = process.env.APP_URL || 'http://localhost:5173';
const apiUrl = process.env.API_URL || `http://localhost:${port}`;
const secureCookie = process.env.NODE_ENV === 'production' ? '; Secure' : '';
const cookie = (token) => `readimentary_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000${secureCookie}`;

async function verifiedAppleClaims(idToken) {
  const [encodedHeader, encodedPayload, encodedSignature] = (idToken || '').split('.');
  if (!encodedSignature) throw new Error('Apple did not return a valid identity token.');
  const header = JSON.parse(Buffer.from(encodedHeader, 'base64url').toString());
  const claims = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString());
  const keys = await (await fetch('https://appleid.apple.com/auth/keys')).json();
  const jwk = keys.keys?.find((key) => key.kid === header.kid);
  const valid = jwk && crypto.verify('RSA-SHA256', Buffer.from(`${encodedHeader}.${encodedPayload}`), crypto.createPublicKey({ key: jwk, format: 'jwk' }), Buffer.from(encodedSignature, 'base64url'));
  if (!valid || claims.iss !== 'https://appleid.apple.com' || claims.aud !== process.env.APPLE_CLIENT_ID || claims.exp <= Date.now() / 1000) throw new Error('Apple identity verification failed.');
  return claims;
}

const send = (res, status, payload, headers = {}) => {
  res.writeHead(status, { 'Content-Type': 'application/json', ...headers });
  res.end(JSON.stringify(payload));
};
const redirect = (res, location, headers = {}) => { res.writeHead(302, { Location: location, ...headers }); res.end(); };
const readBody = async (req) => { const parts=[]; for await (const part of req) parts.push(part); return Buffer.concat(parts); };
const parseCookies = (req) => Object.fromEntries((req.headers.cookie || '').split(';').filter(Boolean).map((v) => v.trim().split('=')));
const currentUser = (req) => {
  const token = parseCookies(req).readimentary_session || req.headers.authorization?.replace(/^Bearer /, '');
  const claims = verifyJwt(token);
  return claims ? db.prepare('SELECT * FROM users WHERE id = ?').get(claims.sub) : null;
};
const requireUser = (req, res) => { const user = currentUser(req); if (!user) send(res, 401, { error: { code: 'UNAUTHENTICATED', message: 'Sign in to continue.' } }); return user; };
const issueSession = (res, user) => send(res, 200, { user: publicUser(user) }, { 'Set-Cookie': cookie(signJwt({ sub: user.id })) });

async function stripeRequest(pathname, params) {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('Stripe is not configured.');
  const response = await fetch(`https://api.stripe.com/v1/${pathname}`, {
    method: 'POST', headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Stripe request failed.');
  return data;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, apiUrl);
  res.setHeader('Access-Control-Allow-Origin', appUrl);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Vary', 'Origin');
  if (req.method === 'OPTIONS') { res.writeHead(204, { 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS' }); return res.end(); }
  try {
    if (req.method === 'GET' && url.pathname === '/api/health') return send(res, 200, { ok: true });
    if (req.method === 'GET' && url.pathname === '/api/auth/providers') return send(res, 200, { providers: { email: true, google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET), apple: Boolean(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET) } });
    if (req.method === 'GET' && url.pathname === '/api/auth/me') { const user = currentUser(req); return user ? send(res, 200, { user: publicUser(user) }) : send(res, 401, { error: { code: 'UNAUTHENTICATED', message: 'No active session.' } }); }
    if (req.method === 'POST' && ['/api/auth/register','/api/auth/login'].includes(url.pathname)) {
      const { email, password } = JSON.parse((await readBody(req)).toString() || '{}');
      if (!email || !password || password.length < 8) return send(res, 400, { error: { code: 'INVALID_CREDENTIALS', message: 'Use a valid email and a password of at least 8 characters.' } });
      let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
      if (url.pathname.endsWith('register')) {
        if (user) return send(res, 409, { error: { code: 'EMAIL_EXISTS', message: 'An account already exists for this email.' } });
        const id = crypto.randomUUID();
        db.prepare('INSERT INTO users (id,email,password_hash,provider,created_at) VALUES (?,?,?,?,?)').run(id,email.toLowerCase(),hashPassword(password),'email',Date.now());
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
      } else if (!user || !verifyPassword(password, user.password_hash)) return send(res, 401, { error: { code: 'INVALID_CREDENTIALS', message: 'Email or password is incorrect.' } });
      return issueSession(res, user);
    }
    if (req.method === 'POST' && url.pathname === '/api/auth/logout') return send(res, 200, { ok: true }, { 'Set-Cookie': `readimentary_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secureCookie}` });
    if (req.method === 'GET' && (url.pathname.startsWith('/api/auth/oauth/') || url.pathname === '/api/auth/google')) {
      const provider = url.pathname === '/api/auth/google' ? 'google' : url.pathname.split('/').pop();
      const state = signJwt({ purpose: 'oauth-state', provider }, 600);
      if (provider === 'google' && process.env.GOOGLE_CLIENT_ID) return redirect(res, `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({client_id:process.env.GOOGLE_CLIENT_ID,redirect_uri:`${apiUrl}/api/auth/callback/google`,response_type:'code',scope:'openid email profile',state,prompt:'select_account'})}`);
      if (provider === 'apple' && process.env.APPLE_CLIENT_ID) return redirect(res, `https://appleid.apple.com/auth/authorize?${new URLSearchParams({client_id:process.env.APPLE_CLIENT_ID,redirect_uri:`${apiUrl}/api/auth/callback/apple`,response_type:'code',response_mode:'query',scope:'name email',state})}`);
      return send(res, 503, { error: { code: 'PROVIDER_NOT_CONFIGURED', message: `${provider} sign-in is not configured.` } });
    }
    if (req.method === 'GET' && url.pathname.startsWith('/api/auth/callback/')) {
      const provider=url.pathname.split('/').pop(); const saved=verifyJwt(url.searchParams.get('state'));
      if (!saved || saved.purpose !== 'oauth-state' || saved.provider!==provider) return redirect(res, `${appUrl}?auth=error`);
      const code=url.searchParams.get('code'); let tokenData;
      if (provider==='google') tokenData=await (await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({code,client_id:process.env.GOOGLE_CLIENT_ID,client_secret:process.env.GOOGLE_CLIENT_SECRET,redirect_uri:`${apiUrl}/api/auth/callback/google`,grant_type:'authorization_code'})})).json();
      else tokenData=await (await fetch('https://appleid.apple.com/auth/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({code,client_id:process.env.APPLE_CLIENT_ID,client_secret:process.env.APPLE_CLIENT_SECRET,redirect_uri:`${apiUrl}/api/auth/callback/apple`,grant_type:'authorization_code'})})).json();
      if (tokenData.error) throw new Error(tokenData.error_description || `${provider} token exchange failed.`);
      let claims;
      if (provider === 'apple') claims = await verifiedAppleClaims(tokenData.id_token);
      else {
        const profileResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', { headers: { Authorization: `Bearer ${tokenData.access_token}` } });
        if (!profileResponse.ok) throw new Error('Google identity verification failed.');
        claims = await profileResponse.json();
      }
      const user=findOrCreateOAuthUser({email:claims.email,provider,providerId:claims.sub});
      return redirect(res, `${appUrl}?auth=success`, { 'Set-Cookie': cookie(signJwt({sub:user.id})) });
    }
    if (req.method === 'GET' && url.pathname === '/api/books') { const user=requireUser(req,res); if(!user)return; return send(res,200,{books:db.prepare('SELECT * FROM books WHERE user_id=? ORDER BY created_at DESC').all(user.id)}); }
    if (req.method === 'POST' && url.pathname === '/api/books') {
      const user=requireUser(req,res); if(!user)return; const body=JSON.parse((await readBody(req)).toString()||'{}'); const id=body.id||crypto.randomUUID();
      const reserve = () => {
        db.exec('BEGIN IMMEDIATE');
        try {
        const freshUser = db.prepare('SELECT * FROM users WHERE id=?').get(user.id);
        const count=db.prepare('SELECT COUNT(*) count FROM books WHERE user_id=?').get(user.id).count;
        if(count>=1 && !freshUser.is_paid) { db.exec('ROLLBACK'); return false; }
        db.prepare('INSERT INTO books (id,user_id,title,status,total_pages,created_at) VALUES (?,?,?,?,?,?)').run(id,user.id,body.title||'Untitled','processing',body.totalPages||0,Date.now());
        db.exec('COMMIT');
        return true;
        } catch (error) { db.exec('ROLLBACK'); throw error; }
      };
      if (!reserve()) return send(res,402,{error:{code:'PAYMENT_REQUIRED',message:'Free accounts include one book. Upgrade to add another.'}});
      return send(res,201,{book:{id,title:body.title,status:'processing'}});
    }
    if (req.method === 'PATCH' && url.pathname.startsWith('/api/books/')) { const user=requireUser(req,res); if(!user)return; const id=url.pathname.split('/').pop(); const b=JSON.parse((await readBody(req)).toString()||'{}'); db.prepare('UPDATE books SET status=?,total_words=?,parsed_pages=?,total_pages=? WHERE id=? AND user_id=?').run(b.status||'processing',b.totalWords||0,b.parsedPages||0,b.totalPages||0,id,user.id); return send(res,200,{ok:true}); }
    if (req.method === 'DELETE' && url.pathname.startsWith('/api/books/')) { const user=requireUser(req,res); if(!user)return; db.prepare('DELETE FROM books WHERE id=? AND user_id=?').run(url.pathname.split('/').pop(),user.id); return send(res,200,{ok:true}); }
    if (req.method === 'POST' && url.pathname === '/api/billing/checkout') {
      const user=requireUser(req,res); if(!user)return;
      if (user.is_paid) return send(res,409,{error:{code:'ALREADY_PAID',message:'Lifetime access is already active.'}});
      const lineItem = process.env.STRIPE_PRICE_ID
        ? {'line_items[0][price]':process.env.STRIPE_PRICE_ID}
        : {'line_items[0][price_data][currency]':'usd','line_items[0][price_data][unit_amount]':'1000','line_items[0][price_data][product_data][name]':'Readimentary Lifetime Access'};
      const session=await stripeRequest('checkout/sessions',{'mode':'payment',...lineItem,'line_items[0][quantity]':'1','success_url':`${appUrl}?checkout=success`,'cancel_url':`${appUrl}?checkout=cancelled`,'client_reference_id':user.id,'customer_email':user.email,'metadata[user_id]':user.id});
      return send(res,200,{url:session.url});
    }
    if (req.method === 'POST' && ['/api/webhooks/stripe','/api/stripe/webhook'].includes(url.pathname)) { const raw=(await readBody(req)).toString(); if(!verifyStripeSignature(raw,req.headers['stripe-signature'],process.env.STRIPE_WEBHOOK_SECRET)) return send(res,400,{error:{code:'INVALID_SIGNATURE',message:'Invalid Stripe signature.'}}); const event=JSON.parse(raw); if(['checkout.session.completed','invoice.paid'].includes(event.type)){const object=event.data.object; const userId=object.client_reference_id||object.metadata?.user_id; if(userId)db.prepare('UPDATE users SET is_paid=1,stripe_customer_id=COALESCE(?,stripe_customer_id) WHERE id=?').run(object.customer||null,userId);} return send(res,200,{received:true}); }
    return send(res,404,{error:{code:'NOT_FOUND',message:'Route not found.'}});
  } catch (error) { console.error(error); return send(res,500,{error:{code:'INTERNAL_ERROR',message:error.message||'Unexpected server error.'}}); }
});
server.listen(port,()=>console.log(`Readimentary API listening on ${apiUrl}`));
