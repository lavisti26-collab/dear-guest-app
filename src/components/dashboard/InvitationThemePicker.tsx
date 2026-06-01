import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme, THEME_INFO, type ThemeName } from '@/contexts/ThemeContext';
import { INVITATION_THEME_GROUPS } from '@/lib/invitation-themes';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function InvitationThemePicker() {
  const { theme, setTheme } = useTheme();
  const [search, setSearch] = useState('');
  const [activeGroup, setActiveGroup] = useState<string | 'all'>('all');

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    return INVITATION_THEME_GROUPS.map((group) => ({
      ...group,
      themes: group.themes.filter((id) => {
        const info = THEME_INFO[id as ThemeName];
        if (!info) return false;
        if (activeGroup !== 'all' && group.id !== activeGroup) return false;
        if (!q) return true;
        return (
          info.label.toLowerCase().includes(q) ||
          info.description.toLowerCase().includes(q) ||
          id.includes(q)
        );
      }),
    })).filter((g) => g.themes.length > 0);
  }, [search, activeGroup]);

  const totalCount = INVITATION_THEME_GROUPS.reduce((n, g) => n + g.themes.length, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search themes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 font-dashboard"
          />
        </div>
        <p className="text-xs text-muted-foreground font-dashboard self-center shrink-0">
          {totalCount} premium palettes
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveGroup('all')}
          className={cn(
            'rounded-full px-3 py-1 text-xs font-dashboard border transition-colors',
            activeGroup === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted/50'
          )}
        >
          All
        </button>
        {INVITATION_THEME_GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setActiveGroup(g.id)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-dashboard border transition-colors',
              activeGroup === g.id
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border hover:bg-muted/50'
            )}
          >
            {g.emoji} {g.label}
          </button>
        ))}
      </div>

      {filteredGroups.map((group) => (
        <div key={group.id} className="space-y-3">
          <h4 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
            <span>{group.emoji}</span> {group.label}
          </h4>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {group.themes.map((themeName) => {
              const id = themeName as ThemeName;
              const info = THEME_INFO[id];
              if (!info) return null;
              const isActive = theme === id;
              return (
                <motion.button
                  key={id}
                  type="button"
                  onClick={() => {
                    setTheme(id);
                    toast.success(`${info.emoji} ${info.label} applied`);
                  }}
                  className={cn(
                    'relative rounded-2xl p-4 text-left transition-all border-2 min-h-[140px] flex flex-col',
                    isActive
                      ? 'border-accent shadow-luxury scale-[1.02]'
                      : 'border-border/40 hover:border-accent/50 hover:shadow-surface'
                  )}
                  style={{
                    background: isActive
                      ? `linear-gradient(145deg, ${info.colors[2] ?? info.colors[0]}55, ${info.colors[0]}22)`
                      : undefined,
                  }}
                  whileHover={{ scale: isActive ? 1.02 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isActive && (
                    <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-bold">
                      ✓
                    </span>
                  )}
                  <span className="text-2xl mb-1">{info.emoji}</span>
                  <span className="font-display font-semibold text-foreground text-sm leading-tight">
                    {info.label}
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-1 line-clamp-2 flex-1">
                    {info.description}
                  </span>
                  <div className="flex gap-1 mt-2">
                    {info.colors.slice(0, 4).map((c) => (
                      <span
                        key={c}
                        className="w-5 h-5 rounded-full border border-border/40 shrink-0"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="glass-card rounded-2xl p-4">
        <p className="text-xs text-muted-foreground font-dashboard">
          <strong className="text-foreground">Live preview:</strong> {THEME_INFO[theme]?.emoji}{' '}
          {THEME_INFO[theme]?.label} — guests see this on your invitation immediately after save.
        </p>
      </div>
    </div>
  );
}
