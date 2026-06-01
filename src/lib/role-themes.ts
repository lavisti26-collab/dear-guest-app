import type { ThemeName } from '@/contexts/ThemeContext';
import type { UserRole } from '@/contexts/RoleContext';

/** Default premium palette per dashboard role */
export const ROLE_DEFAULT_THEME: Record<UserRole, ThemeName> = {
  guest: 'rose-gold-elegance',
  admin: 'nordic-frost',
  super_admin: 'midnight-corporate',
};

export function getThemeForRole(role: UserRole): ThemeName {
  return ROLE_DEFAULT_THEME[role];
}
