export const PRICING_PLANS = Object.freeze([
  { name: 'Individual', prices: { monthly: 15, annual: 144 }, color: 'amber', cta: 'Choose Individual', description: 'For focused personal PDF reading.', features: ['Unlimited local PDF imports', 'RSVP reader', 'Chapter and progress tracking'] },
  { name: 'Pro', prices: { monthly: 29, annual: 278.40 }, color: 'teal', cta: 'Choose Pro', recommended: true, description: 'For readers who want priority product support.', features: ['Everything in Individual', 'Priority support', 'Pro subscription status'] },
  { name: 'Team', prices: { monthly: 79, annual: 758.40 }, color: 'pink', cta: 'Coming soon', comingSoon: true, description: 'For groups evaluating shared reading workflows.', features: ['Team workspace planning', 'Contact-led setup', 'Not available for purchase'] }
]);
