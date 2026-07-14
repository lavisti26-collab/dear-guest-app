import type { UserRole } from '@/contexts/RoleContext';

/** Default premium palette per dashboard role.
 *  Values are resolved through resolveLegacyTheme() before use in ThemeEngine,
 *  so they accept any ThemeEngine registry ID (string), not just the legacy ThemeName union. */
export const ROLE_DEFAULT_THEME: Record<UserRole, string> = {
  guest: 'rose-gold-elegance',
  admin: 'elegant-gold',      // warm ivory/gold — matches ThemeEngine DEFAULT_THEME_ID
  super_admin: 'elegant-gold',
};

export function getThemeForRole(role: UserRole): string {
  return ROLE_DEFAULT_THEME[role];
}
