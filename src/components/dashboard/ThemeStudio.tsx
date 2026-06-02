import React, { useState, useEffect, useMemo } from 'react';
import { useTheme, THEME_INFO, type ThemeName } from '@/contexts/ThemeContext';
import { useVisualStyle } from '@/hooks/useVisualSurface';
import { INVITATION_THEME_GROUPS } from '@/lib/invitation-themes';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Check, Loader2 } from 'lucide-react';

interface ThemeStudioProps {
  ownerUserId?: string | null;
}

type FontWeight = 'elegant-script' | 'modern-sans' | 'editorial' | 'classic-serif';

export default function ThemeStudio({ ownerUserId }: ThemeStudioProps) {
  const { theme, setTheme } = useTheme();
  const [typography, setTypography] = useState<{ heading: FontWeight; body: FontWeight }>({
    heading: 'elegant-script',
    body: 'modern-sans',
  });
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Font options
  const fontOptions = {
    heading: [
      { id: 'elegant-script', label: 'Elegant Script', family: 'serif' },
      { id: 'modern-sans', label: 'Modern Sans', family: 'sans-serif' },
      { id: 'classic-serif', label: 'Classic Serif', family: 'serif' },
    ],
    body: [
      { id: 'modern-sans', label: 'Modern Sans', family: 'sans-serif' },
      { id: 'classic-serif', label: 'Classic Serif', family: 'serif' },
      { id: 'elegant-script', label: 'Editorial', family: 'serif' },
    ],
  };

  // Fetch saved typography from database
  useEffect(() => {
    if (!ownerUserId) return;
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('theme_typography')
        .eq('user_id', ownerUserId)
        .maybeSingle();
      
      if (data?.theme_typography) {
        try {
          const parsed = JSON.parse(data.theme_typography);
          setTypography(parsed);
        } catch (e) {
          console.error('Failed to parse typography:', e);
        }
      }
    })();
  }, [ownerUserId]);

  const handleThemeChange = async (newTheme: ThemeName) => {
    setSaving(true);
    try {
      setTheme(newTheme);
      
      if (ownerUserId) {
        const { error } = await supabase
          .from('profiles')
          .update({ theme: newTheme })
          .eq('user_id', ownerUserId);

        if (error) {
          console.error('Failed to save theme:', error);
          toast.error('Theme change failed to save');
        } else {
          toast.success(`✨ Theme updated to ${THEME_INFO[newTheme]?.label || 'new theme'}`);
          setLastSaved(new Date());
        }
      }
    } catch (err) {
      console.error('Error changing theme:', err);
      toast.error('Failed to update theme');
    } finally {
      setSaving(false);
    }
  };

  const handleTypographyChange = async (slot: 'heading' | 'body', fontId: string) => {
    const updated = { ...typography, [slot]: fontId };
    setTypography(updated);
    setSaving(true);

    try {
      if (ownerUserId) {
        const { error } = await supabase
          .from('profiles')
          .update({ theme_typography: JSON.stringify(updated) })
          .eq('user_id', ownerUserId);

        if (error) {
          console.error('Failed to save typography:', error);
          toast.error('Typography save failed');
        } else {
          toast.success('📝 Typography updated');
          setLastSaved(new Date());
        }
      }
    } catch (err) {
      console.error('Error saving typography:', err);
      toast.error('Failed to update typography');
    } finally {
      setSaving(false);
    }
  };

  const currentThemeInfo = THEME_INFO[theme];
  const filteredThemes = useMemo(() => {
    return INVITATION_THEME_GROUPS.map((group) => ({
      ...group,
      themes: group.themes.filter((id) => {
        const info = THEME_INFO[id as ThemeName];
        return info !== undefined;
      }),
    })).filter((g) => g.themes.length > 0);
  }, []);

  const headingFontFamily = typography.heading === 'elegant-script' ? 'serif' : 'sans-serif';
  const bodyFontFamily = typography.body === 'classic-serif' ? 'serif' : 'sans-serif';

  return (
    <div className="space-y-8">
      {/* THEME SELECTOR */}
      <div className="space-y-4">
        <div>
          <h3 className="font-display text-xl font-semibold text-foreground mb-2">
            🎨 Choose Your Theme
          </h3>
          <p className="text-sm text-muted-foreground">
            Each theme sets a unique color palette and mood for your wedding website. Changes apply instantly to your guest invitation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
          {filteredThemes.map((group) => (
            <div key={group.id} className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{group.id}</p>
              <div className="space-y-2">
                {group.themes.map((themeName) => {
                  const id = themeName as ThemeName;
                  const info = THEME_INFO[id];
                  const isActive = theme === id;

                  return (
                    <button
                      key={id}
                      onClick={() => handleThemeChange(id)}
                      disabled={saving}
                      className={`w-full text-left rounded-2xl p-4 border-2 transition-all ${
                        isActive
                          ? 'border-accent bg-accent/10'
                          : 'border-border hover:border-accent/50 hover:bg-muted/30'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-foreground">
                            {info?.emoji} {info?.label}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{info?.description}</p>
                        </div>
                        {isActive && (
                          <div className="flex-shrink-0 pt-0.5">
                            {saving ? (
                              <Loader2 className="w-4 h-4 text-accent animate-spin" />
                            ) : (
                              <Check className="w-4 h-4 text-accent" />
                            )}
                          </div>
                        )}
                      </div>
                      {info?.colors && (
                        <div className="flex gap-1.5 mt-3">
                          {info.colors.slice(0, 4).map((color) => (
                            <div
                              key={color}
                              className="h-3 w-3 rounded-full border border-border"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TYPOGRAPHY CUSTOMIZATION */}
      <div className="space-y-4 pt-6 border-t border-border">
        <div>
          <h3 className="font-display text-xl font-semibold text-foreground mb-2">
            📝 Typography
          </h3>
          <p className="text-sm text-muted-foreground">
            Customize fonts for headings and body text to match your style.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Heading Font */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">Heading Font</label>
            <div className="space-y-2">
              {fontOptions.heading.map((font) => (
                <button
                  key={font.id}
                  onClick={() => handleTypographyChange('heading', font.id as FontWeight)}
                  className={`w-full text-left rounded-lg px-4 py-3 border transition-all ${
                    typography.heading === font.id
                      ? 'border-accent bg-accent/10'
                      : 'border-border hover:border-accent/30 hover:bg-muted/20'
                  }`}
                  style={{ fontFamily: font.family }}
                >
                  <div className="text-sm font-semibold">{font.label}</div>
                  <div className="text-xs text-muted-foreground font-sans mt-1">
                    Sample text in heading style
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Body Font */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">Body Font</label>
            <div className="space-y-2">
              {fontOptions.body.map((font) => (
                <button
                  key={font.id}
                  onClick={() => handleTypographyChange('body', font.id as FontWeight)}
                  className={`w-full text-left rounded-lg px-4 py-3 border transition-all ${
                    typography.body === font.id
                      ? 'border-accent bg-accent/10'
                      : 'border-border hover:border-accent/30 hover:bg-muted/20'
                  }`}
                  style={{ fontFamily: font.family }}
                >
                  <div className="text-sm font-semibold">{font.label}</div>
                  <div className="text-xs text-muted-foreground font-sans mt-1">
                    This is sample body text
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* LIVE PREVIEW */}
      <div className="space-y-4 pt-6 border-t border-border">
        <div>
          <h3 className="font-display text-xl font-semibold text-foreground mb-2">
            👁️ Live Preview
          </h3>
          <p className="text-sm text-muted-foreground">
            This is how your invitation will look to guests with your current theme and fonts.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 space-y-6" style={{ fontFamily: bodyFontFamily }}>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Your Wedding</p>
            <h1
              className="text-3xl font-bold leading-tight text-foreground mb-4"
              style={{ fontFamily: headingFontFamily }}
            >
              A Beautiful Celebration of Love
            </h1>
            <p className="text-base text-foreground/80 leading-relaxed max-w-2xl">
              Join us as we celebrate our wedding day. We can't wait to share this special moment with our loved ones. Your presence means the world to us.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-semibold text-sm">
              RSVP Now
            </button>
            <button className="px-6 py-2 border border-border rounded-full text-foreground text-sm">
              View Details
            </button>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">Theme: {currentThemeInfo?.emoji} {currentThemeInfo?.label}</p>
          </div>
        </div>
      </div>

      {/* SAVE STATUS */}
      {lastSaved && (
        <div className="p-3 bg-accent/10 border border-accent/30 rounded-lg text-xs text-accent-foreground">
          ✓ All changes saved {lastSaved.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
