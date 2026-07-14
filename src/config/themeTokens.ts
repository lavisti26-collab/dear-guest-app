export const THEME_TOKENS = {
  'classic': {
    primary: '#b5832d', primaryForeground: '#fff', accent: '#c49b3f', accentForeground: '#000', background: '#fff8ef', surface: '#fff', surfaceAlt: '#f6efe6', foreground: '#111', muted: '#6b6b6b', border: '#e6dccf', ornament: '#c4a96b', overlay: 'rgba(0,0,0,0.4)'
  },
  'cinematic': {
    primary: '#0f172a', primaryForeground: '#fff', accent: '#ff6b6b', accentForeground: '#fff', background: '#061026', surface: '#071233', surfaceAlt: '#0b1930', foreground: '#e6eef8', muted: '#9fb0c8', border: '#17324a', ornament: '#2b4b6e', overlay: 'rgba(0,0,0,0.6)'
  },
  'minimal': {
    primary: '#111827', primaryForeground: '#fff', accent: '#2563eb', accentForeground: '#fff', background: '#ffffff', surface: '#ffffff', surfaceAlt: '#f7f7f9', foreground: '#111827', muted: '#6b7280', border: '#e6e9ef', ornament: '#f1f5f9', overlay: 'rgba(0,0,0,0.04)'
  },
  'romantic': {
    primary: '#d946ef', primaryForeground: '#fff', accent: '#f97316', accentForeground: '#fff', background: '#fff7fb', surface: '#fff', surfaceAlt: '#fff0f6', foreground: '#111', muted: '#7b6b7b', border: '#f4e6f2', ornament: '#f8d7f2', overlay: 'rgba(255,240,250,0.6)'
  },
  'khmer-traditional': {
    primary: '#6b2e00', primaryForeground: '#fff', accent: '#d4af37', accentForeground: '#000', background: '#0e0b07', surface: '#1a1209', surfaceAlt: '#2a1f16', foreground: '#fff', muted: '#ccbfa9', border: '#4a3b2a', ornament: '#d4af37', overlay: 'rgba(0,0,0,0.5)'
  },
  'playful': {
    primary: '#06b6d4', primaryForeground: '#fff', accent: '#f59e0b', accentForeground: '#000', background: '#f0fdfa', surface: '#ffffff', surfaceAlt: '#f8fffe', foreground: '#0f172a', muted: '#6b7280', border: '#e6f7f8', ornament: '#aee6f0', overlay: 'rgba(0,0,0,0.04)'
  },
  'newspaper': {
    primary: '#111111', primaryForeground: '#fff', accent: '#d94626', accentForeground: '#fff', background: '#ffffff', surface: '#ffffff', surfaceAlt: '#f9fafb', foreground: '#111', muted: '#6b7280', border: '#e6e6e6', ornament: '#111', overlay: 'rgba(0,0,0,0.04)'
  }
};

export type ThemeKey = keyof typeof THEME_TOKENS;
export default THEME_TOKENS;
