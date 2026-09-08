import { describe, expect, it } from 'vitest';
import { canAccessScreen } from './accessControl';

describe('protected application areas', () => {
  it.each(['library', 'dashboard', 'chapters', 'reader'])('rejects signed-out access to %s', (screen) => {
    expect(canAccessScreen(screen, null)).toBe(false);
  });

  it('allows public landing access and authenticated workspace access', () => {
    expect(canAccessScreen('home', null)).toBe(true);
    expect(canAccessScreen('library', { id: 'user_123' })).toBe(true);
  });
});
