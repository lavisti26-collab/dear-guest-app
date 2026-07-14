/**
 * FontLibraryPicker - English and Khmer font selection.
 * Two-tab selector for display font, body font, and Khmer font.
 */
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  FONT_PAIRS,
  ENGLISH_FONT_OPTIONS,
  KHMER_FONT_OPTIONS,
  type FontPairDef,
} from '@/config/fontPairs';
import injectFontFaces from '@/lib/font-loader';

type Tab = 'pairs' | 'english' | 'khmer';

interface FontLibraryPickerProps {
  currentPairKey: string;
  onChange: (pairKey: string) => void;
}

/** Group the predefined pairs by category for quick selection */
const CATEGORY_LABELS: Record<string, string> = {
  classic: '🪷 Classic Serif',
  modern: '⚪ Modern Sans',
  romantic: '💗 Romantic Script',
  editorial: '📝 Minimal / Editorial',
  'khmer-traditional': '🇰🇭 Khmer Traditional',
  'khmer-modern': '🇰🇭 Khmer Modern',
};

const CATEGORY_ORDER = [
  'classic', 'modern', 'romantic', 'editorial',
  'khmer-traditional', 'khmer-modern',
];

export default function FontLibraryPicker({
  currentPairKey,
  onChange,
}: FontLibraryPickerProps) {
  const [tab, setTab] = useState<Tab>('pairs');
  const [displayFont, setDisplayFont] = useState<string>('');
  const [bodyFont, setBodyFont] = useState<string>('');
  const [khmerFont, setKhmerFont] = useState<string>('');
  const [showPreview, setShowPreview] = useState(true);

  // Sync from current pair when it changes
  useEffect(() => {
    const pair = FONT_PAIRS[currentPairKey];
    if (pair) {
      setDisplayFont(pair.display);
      setBodyFont(pair.body);
      setKhmerFont(pair.khmer);
    }
  }, [currentPairKey]);

  /** Apply custom English + Khmer selection as a unique pair key */
  const applyCustom = useCallback(() => {
    if (!displayFont || !bodyFont || !khmerFont) return;
    // Build a custom pair key encoding all 3 font names
    const disp = displayFont.toLowerCase().replace(/\s+/g, '-').replace(/['']/g, '');
    const body = bodyFont.toLowerCase().replace(/\s+/g, '-').replace(/['']/g, '');
    const khmer = khmerFont.toLowerCase().replace(/\s+/g, '-').replace(/['']/g, '');
    const key = `custom-d:${disp}--b:${body}--k:${khmer}`;
    const pair: FontPairDef = {
      display: displayFont,
      body: bodyFont,
      khmer: khmerFont,
      weights: [400, 700],
      category: 'modern',
    };
    // Temporarily register in FONT_PAIRS so ThemeStudio can find it
    (FONT_PAIRS as any)[key] = pair;
    injectFontFaces(pair, key);
    onChange(key);
  }, [displayFont, bodyFont, khmerFont, onChange]);

  /** Group predefined pairs by category */
  const groupedPairs = useMemo(() => {
    const groups: { category: string; label: string; items: [string, FontPairDef][] }[] = [];
    for (const cat of CATEGORY_ORDER) {
      const items = Object.entries(FONT_PAIRS).filter(([, def]) => def.category === cat);
      if (items.length > 0) {
        groups.push({ category: cat, label: CATEGORY_LABELS[cat] || cat, items });
      }
    }
    return groups;
  }, []);

  return (
    <div className="space-y-4">
      {/* Tab selector */}
      <div className="flex gap-1 p-1 bg-muted/30 rounded-xl border border-border/30">
        {([
          { key: 'pairs' as Tab, label: '📦 Font Pairs' },
          { key: 'english' as Tab, label: '🇬🇧 English' },
          { key: 'khmer' as Tab, label: '🇰🇭 Khmer' },
        ]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-all',
              tab === t.key
                ? 'bg-accent text-accent-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/20'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* PREDEFINED PAIRS TAB */}
      {tab === 'pairs' && (
        <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
          {groupedPairs.map(({ category, label, items }) => (
            <div key={category}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 px-1">
                {label}
              </p>
              <div className="grid grid-cols-1 gap-1.5">
                {items.map(([key, def]) => {
                  const active = currentPairKey === key;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        onChange(key);
                        injectFontFaces(def, key);
                      }}
                      className={cn(
                        'w-full text-left rounded-xl px-3 py-2 border transition-all',
                        active
                          ? 'border-accent bg-accent/10 shadow-glow'
                          : 'border-border/40 hover:border-accent/40 hover:bg-muted/10'
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground truncate"
                             style={{ fontFamily: `'${def.display}', serif` }}>
                            {def.display}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate"
                             style={{ fontFamily: `'${def.body}', sans-serif` }}>
                            {def.body} + {def.khmer}
                          </p>
                        </div>
                        {active && (
                          <span className="text-accent text-xs font-bold">✓</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CUSTOM ENGLISH FONTS TAB */}
      {tab === 'english' && (
        <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 px-1">
            Display / Heading Font
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {ENGLISH_FONT_OPTIONS.filter(f => !f.startsWith('Noto') && f !== 'Hanuman').map(font => (
              <button
                key={font}
                onClick={() => {
                  setDisplayFont(font);
                  applyCustom();
                }}
                className={cn(
                  'text-left rounded-lg px-2.5 py-1.5 border text-xs transition-all',
                  displayFont === font
                    ? 'border-accent bg-accent/10'
                    : 'border-border/30 hover:border-accent/30'
                )}
                style={{ fontFamily: `'${font}', serif` }}
              >
                <span className="text-foreground font-medium">{font}</span>
              </button>
            ))}
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 px-1">
              Body Font
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {ENGLISH_FONT_OPTIONS.filter(f => !f.startsWith('Noto') && f !== 'Hanuman').map(font => (
                <button
                  key={font}
                  onClick={() => {
                    setBodyFont(font);
                    applyCustom();
                  }}
                  className={cn(
                    'text-left rounded-lg px-2.5 py-1.5 border text-xs transition-all',
                    bodyFont === font
                      ? 'border-accent bg-accent/10'
                      : 'border-border/30 hover:border-accent/30'
                  )}
                  style={{ fontFamily: `'${font}', sans-serif` }}
                >
                  <span className="text-foreground font-medium">{font}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM KHMER FONTS TAB */}
      {tab === 'khmer' && (
        <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 px-1">
            Khmer Font (from Supabase Storage)
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {KHMER_FONT_OPTIONS.map(font => (
              <button
                key={font}
                onClick={() => {
                  setKhmerFont(font);
                  applyCustom();
                }}
                className={cn(
                  'text-left rounded-lg px-2.5 py-1.5 border text-xs transition-all',
                  khmerFont === font
                    ? 'border-accent bg-accent/10'
                    : 'border-border/30 hover:border-accent/30'
                )}
              >
                <span className="text-foreground font-medium">{font}</span>
              </button>
            ))}
          </div>
          {/* Google Fonts Khmer options */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 px-1">
              Khmer Font (from Google Fonts)
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {['Noto Sans Khmer', 'Noto Serif Khmer', 'Hanuman'].map(font => (
                <button
                  key={font}
                  onClick={() => {
                    setKhmerFont(font);
                    applyCustom();
                  }}
                  className={cn(
                    'text-left rounded-lg px-2.5 py-1.5 border text-xs transition-all',
                    khmerFont === font
                      ? 'border-accent bg-accent/10'
                      : 'border-border/30 hover:border-accent/30'
                  )}
                >
                  <span className="text-foreground font-medium">{font}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* LIVE PREVIEW */}
      {showPreview && (
        <div className="rounded-xl border border-border/30 bg-muted/10 p-4 space-y-3 mt-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
            Preview
          </p>
          <div style={{ fontFamily: `'${displayFont || 'Playfair Display'}', serif` }}>
            <p className="text-lg font-bold text-foreground">Wedding Day</p>
            <p className="text-sm text-muted-foreground" style={{ fontFamily: `'${bodyFont || 'Lora'}', serif` }}>
              Join us as we celebrate our special day together
            </p>
          </div>
          <div style={{ fontFamily: `'${khmerFont || 'Noto Serif Khmer'}', serif` }} className="text-sm">
            <p className="text-foreground">ពិធីមង្គលការ</p>
            <p className="text-muted-foreground">សូមអញ្ជើញចូលរួម</p>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Display: {displayFont} · Body: {bodyFont} · Khmer: {khmerFont}
          </p>
        </div>
      )}

      {/* Toggle preview */}
      <button
        onClick={() => setShowPreview(v => !v)}
        className="text-[10px] text-accent hover:underline"
      >
        {showPreview ? 'Hide Preview' : 'Show Preview'}
      </button>
    </div>
  );
}