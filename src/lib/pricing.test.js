import { describe, expect, it } from 'vitest';
import { PRICING_PLANS } from './pricing';

describe('approved pricing', () => {
  it('contains the approved monthly and annual totals', () => {
    expect(PRICING_PLANS.map(({ name, prices }) => ({ name, ...prices }))).toEqual([
      { name: 'Individual', monthly: 15, annual: 144 },
      { name: 'Pro', monthly: 29, annual: 278.4 },
      { name: 'Team', monthly: 79, annual: 758.4 }
    ]);
  });

  it('keeps Team billing unavailable until seat management exists', () => {
    expect(PRICING_PLANS.find((plan) => plan.name === 'Team')).toMatchObject({ cta: 'Coming soon', comingSoon: true });
  });
});
