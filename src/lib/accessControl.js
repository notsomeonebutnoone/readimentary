export const PROTECTED_SCREENS = new Set(['library', 'dashboard', 'chapters', 'reader']);

export function canAccessScreen(screen, user) {
  return !PROTECTED_SCREENS.has(screen) || Boolean(user?.id);
}
