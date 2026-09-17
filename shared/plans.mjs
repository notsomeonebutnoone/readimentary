export const PLANS = [
  {
    id: 'individual',
    name: 'Individual',
    priceUsd: 15,
    color: 'amber',
    description: 'For regular reading.',
    features: ['Unlimited PDFs', 'RSVP reader', 'Chapter progress']
  },
  {
    id: 'pro',
    name: 'Pro',
    priceUsd: 29,
    color: 'teal',
    recommended: true,
    description: 'For daily power users.',
    features: ['Everything in Individual', 'Reading analytics', 'Priority support']
  },
  {
    id: 'team',
    name: 'Team',
    priceUsd: 79,
    color: 'pink',
    description: 'For up to 5 readers.',
    features: ['Everything in Pro', '5 user seats', 'Shared billing']
  }
];

export const DEFAULT_PLAN_ID = 'individual';

export const findPlan = (planId) => PLANS.find((plan) => plan.id === planId) || null;
