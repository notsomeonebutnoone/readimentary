import Stripe from 'stripe';
let stripe;
export function getStripe(env = process.env) { if (!stripe) stripe = new Stripe(env.STRIPE_SECRET_KEY); return stripe; }
