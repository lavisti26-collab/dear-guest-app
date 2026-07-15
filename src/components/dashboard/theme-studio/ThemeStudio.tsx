import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme as useEngineTheme } from '@/theme/ThemeEngine';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FONT_PAIRS } from '@/config/fontPairs';
import injectFontFaces from '@/lib/font-loader';
import FontLibraryPicker from '@/components/dashboard/FontLibraryPicker';
import { useWeddingData, type CoupleCardConfig, DEFAULT_COUPLE_CARD_CONFIG } from '@/contexts/WeddingDataContext';
import CoupleCard from '@/components/wedding/CoupleCard';
import EnvelopeAnimation from '@/components/wedding/envelope/EnvelopeAnimation';
import { Type, Sliders, Heart, Sparkles, BookOpen, Settings, Layout, SwatchBook } from 'lucide-react';

interface ThemeStudioProps {
  ownerUserId?: string | null;
}

const COUPLE_FONT_OPTIONS = [
  // ── Khmer (Supabase storage) ──
  { value: 'Battambang',        label: 'Battambang' },
  { value: 'Angkor',            label: 'Angkor' },
  { value: 'Bayon',             label: 'Bayon' },
  { value: 'Chenla',            label: 'Chenla' },
  { value: 'Kantumruy Pro',     label: 'Kantumruy Pro' },
  { value: 'Koulen',            label: 'Koulen' },
  { value: 'Moulpali',          label: 'Moulpali' },
  { value: 'Preahvihear',       label: 'Preahvihear' },
  { value: 'Siemreap',          label: 'Siemreap' },
  { value: 'AKbalthom KhmerLer',label: 'AKbalthom KhmerLer' },
  { value: 'Kh BL LazyOutline', label: 'Kh BL LazyOutline' },
  // ── Khmer (Google Fonts) ──
  { value: 'Moul',              label: 'Moul (Google)' },
  { value: 'Noto Sans Khmer',   label: 'Noto Sans Khmer' },
  { value: 'Noto Serif Khmer',  label: 'Noto Serif Khmer' },
  { value: 'Hanuman',           label: 'Hanuman' },
  { value: 'Koh Santepheap',    label: 'Koh Santepheap' },
  // ── Latin ──
  { value: 'Cormorant Garamond',label: 'Cormorant Garamond' },
  { value: 'Playfair Display',  label: 'Playfair Display' },
  { value: 'Great Vibes',       label: 'Great Vibes (script)' },
  { value: 'Dancing Script',    label: 'Dancing Script' },
  { value: 'Cinzel',            label: 'Cinzel (caps)' },
  { value: 'Lora',              label: 'Lora' },
];

const AMBIANCE_OPTIONS = [
  { value: 'none',         label: 'None' },
  { value: 'flowers',      label: 'Cherry Blossoms' },
  { value: 'roses',        label: 'Roses' },
  { value: 'hearts',       label: 'Hearts' },
  { value: 'butterflies',  label: 'Butterflies' },
  { value: 'sparkles',     label: 'Sparkles' },
  { value: 'stars',        label: 'Stars' },
  { value: 'diamonds',     label: 'Diamonds' },
  { value: 'bokeh',        label: 'Bokeh Glow' },
];

const STICKER_OPTIONS = [
  { id: 'blessing', label: 'Khmer Blessing', icon: 'សិរីសួស្តី', desc: 'សិរីសួស្តី អាពាហ៍ពិពាហ៍' },
  { id: 'kbach', label: 'Kbach Ornament', icon: '🔱', desc: 'Khmer gold accent emblem' },
  { id: 'hearts', label: 'Twin Hearts', icon: '💕', desc: 'Glowing hearts overlay' },
  { id: 'rings', label: 'Double Rings', icon: '💍💍', desc: 'Symbolic wedding rings' },
  { id: 'flowers', label: 'Flower Petals', icon: '🌸', desc: 'Floating cherry blossom' },
];

const PRESETS = [
  {
    name: 'Imperial Gold',
    bg: '#D4AF37',
    accentColor: '#D4AF37',
    cardStyle: 'royal-gold' as const,
    textEffect: 'gold-foil' as const,
    ornament: 'kbach' as const,
  },
  {
    name: 'Emerald & Gold',
    bg: '#064E3B',
    accentColor: '#D4A76A',
    cardStyle: 'emerald-luxury' as const,
    textEffect: 'gold-foil' as const,
    ornament: 'kbach' as const,
  },
  {
    name: 'Midnight Gold',
    bg: '#1A1712',
    accentColor: '#fbbf24',
    cardStyle: 'dark-glass' as const,
    textEffect: 'gold-foil' as const,
    ornament: 'minimal' as const,
  },
  {
    name: 'Romantic Blush',
    bg: '#FCE7F3',
    accentColor: '#DB2777',
    cardStyle: 'romantic-blush' as const,
    textEffect: 'soft-glow' as const,
    ornament: 'minimal' as const,
  },
  {
    name: 'Vintage Parchment',
    bg: '#FAF6EE',
    accentColor: '#5D4037',
    cardStyle: 'vintage-parchment' as const,
    textEffect: 'letterpress' as const,
    ornament: 'star' as const,
  },
  {
    name: 'Minimal Clean',
    bg: '#E5E7EB',
    accentColor: '#b45309',
    cardStyle: 'light-glass' as const,
    textEffect: 'none' as const,
    ornament: 'none' as const,
  },
];

const ORNAMENT_BORDER_OPTIONS = [
  {
    id: 'none' as const,
    label: 'None',
    description: 'Clean borderless look',
    preview: (
      <div className="w-full h-8 flex items-center justify-center border border-dashed border-[#E6DFD3] rounded text-xs text-[#8C7A6B]">
        ∅
      </div>
    ),
  },
  {
    id: 'kbach' as const,
    label: 'Kbach Gold',
    description: 'Traditional Khmer gold frame',
    preview: (
      <div className="w-full h-8 flex items-center justify-center">
        <svg viewBox="0 0 100 20" className="w-16 h-4" fill="none">
          <path d="M50 1 C52 4, 55 6, 60 6 C55 6, 52 8, 50 11 C48 8, 45 6, 40 6 C45 6, 48 4, 50 1 Z" fill="#D4AF37" />
          <path d="M5 6 Q28 2 50 6 T95 6" fill="none" stroke="#D4AF37" strokeWidth="0.8" />
        </svg>
      </div>
    ),
  },
  {
    id: 'star' as const,
    label: 'Star Line',
    description: 'Delicate celestial sparkle',
    preview: (
      <div className="w-full h-8 flex items-center justify-center">
        <svg viewBox="0 0 100 20" className="w-16 h-4" fill="none">
          <path d="M50 1 Q50 6 54 6 Q50 6 50 11 Q50 6 46 6 Q50 6 50 1 Z" fill="#D4AF37" />
          <line x1="5" y1="6" x2="40" y2="6" stroke="#D4AF37" strokeWidth="0.6" />
          <line x1="60" y1="6" x2="95" y2="6" stroke="#D4AF37" strokeWidth="0.6" />
        </svg>
      </div>
    ),
  },
  {
    id: 'minimal' as const,
    label: 'Minimal Line',
    description: 'Contemporary clean accent',
    preview: (
      <div className="w-full h-8 flex items-center justify-center gap-1">
        <div className="w-5 h-[1px] bg-[#D4AF37]" />
        <div className="w-1 h-1 rounded-full bg-[#D4AF37]" />
        <div className="w-5 h-[1px] bg-[#D4AF37]" />
      </div>
    ),
  },
];

// Helper to resolve font stack for preview styling
function getFontStack(f?: string) {
  if (!f || f === 'auto') return "sans-serif";
  const FONT_MAP: Record<string, string> = {
    angkor: "'Angkor', serif",
    bayon: "'Bayon', serif",
    battambang: "'Battambang', serif",
    chenla: "'Chenla', serif",
    kantumruypro: "'Kantumruy Pro', sans-serif",
    kantumruy: "'Kantumruy Pro', sans-serif",
    koulen: "'Koulen', sans-serif",
    moulpali: "'Moulpali', serif",
    preahvihear: "'Preahvihear', serif",
    siemreap: "'Kantumruy Pro', 'Noto Sans Khmer', sans-serif",
    akbalthomkhmerler: "'AKbalthom KhmerLer', sans-serif",
    khbllazyoutline: "'Kh BL LazyOutline', sans-serif",
    notosanskhmer: "'Noto Sans Khmer', sans-serif",
    notoserifkhmer: "'Noto Serif Khmer', serif",
    hanuman: "'Hanuman', serif",
    kohsantepheap: "'Koh Santepheap', serif",
    moul: "'Moul', serif",
    cormorantgaramond: "'Cormorant Garamond', serif",
    playfairdisplay: "'Playfair Display', serif",
    greatvibes: "'Great Vibes', cursive",
    dancingscript: "'Dancing Script', cursive",
    cinzel: "'Cinzel', serif",
    lora: "'Lora', serif",
  };
  const key = f.toLowerCase().replace(/[^a-z]/g, '');
  return FONT_MAP[key] ?? "sans-serif";
}

function splitCoupleNames(names: string): { groom: string; bride: string } {
  if (!names) return { groom: '', bride: '' };
  // eslint-disable-next-line no-misleading-character-class
  const cleanNames = names.replace(/[\u200b\u200c\u200d\ufeff]/g, '').trim();
  const regex = /\s*(?:&|and|និង|&amp;)\s*/i;
  const match = cleanNames.match(regex);
  if (match && match.index !== undefined) {
    return {
      groom: cleanNames.slice(0, match.index).trim(),
      bride: cleanNames.slice(match.index + match[0].length).trim(),
    };
  }
  return { groom: cleanNames.trim(), bride: '' };
}

function PremiumFontSelect({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (val: string) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const selectedOption = COUPLE_FONT_OPTIONS.find(o => o.value === value) || COUPLE_FONT_OPTIONS[0];

  return (
    <div className="relative">
      <label className="text-xs font-semibold text-[#8C7A6B] block mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full min-h-[50px] rounded-xl border border-[#E6DFD3] bg-white px-4 py-2 flex items-center justify-between text-left text-[#2C2620] hover:border-[#D4AF37] hover:bg-[#FAF9F6] transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
      >
        <span style={{ fontFamily: getFontStack(value) }} className="text-base font-medium">
          {selectedOption.label}
        </span>
        <span className="text-xs text-[#8C7A6B]">▼</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 mt-2 max-h-[260px] overflow-y-auto rounded-xl border border-[#E6DFD3] bg-white shadow-lg z-40 p-1.5 divide-y divide-[#F5EFE6]">
            {COUPLE_FONT_OPTIONS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => {
                  onChange(f.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center justify-between ${
                  value === f.value
                    ? 'bg-[#FDFBF7] text-[#B89047] font-semibold'
                    : 'text-[#2C2620] hover:bg-[#FAF9F6]'
                }`}
              >
                <span style={{ fontFamily: getFontStack(f.value) }} className="text-base">
                  {f.label}
                </span>
                {value === f.value && <span className="text-[#B89047]">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function ThemeStudio({ ownerUserId }: ThemeStudioProps) {
  const engine = useEngineTheme();
  const data = useWeddingData();
  const [selectedFontPair, setSelectedFontPair] = useState<string>('elegant-serif');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'typography' | 'ornaments' | 'stickers' | 'effects'>('typography');
  const [previewMode, setPreviewMode] = useState<'card' | 'envelope'>('card');

  const [previewGroom, setPreviewGroom] = useState('');
  const [previewBride, setPreviewBride] = useState('');

  // Fetch saved font_pair from settings
  useEffect(() => {
    if (!ownerUserId) return;
    (async () => {
      const { data } = await supabase
        .from('settings')
        .select('font_pair')
        .eq('user_id', ownerUserId)
        .maybeSingle();
      
      if (data?.font_pair && (FONT_PAIRS[data.font_pair] || data.font_pair.startsWith('custom-'))) {
        setSelectedFontPair(data.font_pair);
        const pair = FONT_PAIRS[data.font_pair];
        if (pair) injectFontFaces(pair, data.font_pair);
      }
    })();
  }, [ownerUserId]);

  const handleFontPairChange = async (pairKey: string) => {
    const pair = FONT_PAIRS[pairKey];
    if (!pair) return;
    setSelectedFontPair(pairKey);
    setSaving(true);
    injectFontFaces(pair, pairKey);

    try {
      if (ownerUserId) {
        const { data: existing } = await supabase
          .from('settings')
          .select('id')
          .eq('user_id', ownerUserId)
          .maybeSingle();

        if (existing?.id) {
          const { error } = await supabase
            .from('settings')
            .update({ font_pair: pairKey })
            .eq('id', existing.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('settings')
            .insert({ user_id: ownerUserId, font_pair: pairKey });
          if (error) throw error;
        }

        toast.success(`📝 Fonts: ${pair.display} + ${pair.body} + ${pair.khmer}`);
        setLastSaved(new Date());
      }
    } catch (err: any) {
      console.error('Error saving font pair:', err);
      toast.error(err?.message || 'Failed to save font selection');
    } finally {
      setSaving(false);
    }
  };

  const cfg: CoupleCardConfig = { ...DEFAULT_COUPLE_CARD_CONFIG, ...(data.settings.coupleCardConfig || {}) };
  const patch = (partial: Partial<CoupleCardConfig>) =>
    data.updateSettings({ coupleCardConfig: { ...cfg, ...partial } });

  const inputClass = "w-full min-h-[48px] rounded-xl border border-[#E6DFD3] bg-white px-4 text-[#2C2620] focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] outline-none transition-all text-sm";
  const labelClass = "text-xs font-semibold text-[#8C7A6B] block mb-1.5 uppercase tracking-wider";

  // Parse names for preview
  const names = data.settings.coupleNames || 'Groom & Bride';
  const { groom: defaultGroom, bride: defaultBride } = splitCoupleNames(names);
  const groomName = previewGroom || defaultGroom;
  const brideName = previewBride || defaultBride;

  const subTabs = [
    { id: 'typography', label: 'Typography & Layout', icon: Type },
    { id: 'ornaments', label: 'Kbach & Ornaments', icon: Sliders },
    { id: 'stickers', label: 'Stickers & Badges', icon: Heart },
    { id: 'effects', label: 'Effects & Ambiance', icon: Sparkles },
  ] as const;

  return (
    <div className="space-y-8">

      {/* ── QUICK SETTINGS: NAV ICON STYLE ─────────────────────────────────── */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-display text-base font-bold text-[#2C2620] flex items-center gap-2">
              <Layout className="w-4 h-4 text-[#B89047]" />
              Navigation Icon Style
            </h3>
            <p className="text-xs text-[#8C7A6B] mt-0.5">Choose how icons appear in the navigation bar for guests and admin.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(['outline', 'emoji'] as const).map((style) => {
            const active = (cfg.navIconStyle || 'outline') === style;
            return (
              <button
                key={style}
                type="button"
                onClick={() => patch({ navIconStyle: style })}
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                  active
                    ? 'border-[#D4AF37] bg-[#FDFBF7] shadow-sm ring-1 ring-[#D4AF37]/30'
                    : 'border-[#E6DFD3] bg-white hover:border-[#D4AF37]/60'
                }`}
              >
                <span className="text-2xl select-none">{style === 'outline' ? '🎨' : '😊'}</span>
                <div>
                  <p className="text-xs font-bold text-[#2C2620]">{style === 'outline' ? 'Outline SVGs' : 'Classic Emojis'}</p>
                  <p className="text-[10px] text-[#8C7A6B]">{style === 'outline' ? 'Premium vector icons' : 'Familiar emoji icons'}</p>
                </div>
                <div className={`ml-auto w-4 h-4 rounded-full border flex items-center justify-center text-[8px] flex-shrink-0 ${
                  active ? 'border-[#B89047] bg-[#B89047] text-white' : 'border-[#E6DFD3]'
                }`}>
                  {active && '✓'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* FONT LIBRARY — ENGLISH + KHMER */}
      <div className="space-y-4 pt-2 border-t border-[#E6DFD3]">
        <div>
          <h3 className="font-display text-xl font-semibold text-[#2C2620] mb-1 flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-[#B89047]" />
            Primary Font Library
          </h3>
          <p className="text-xs text-[#8C7A6B]">Select the font pairing style for body text and headers across your invitation.</p>
        </div>
        <FontLibraryPicker
          currentPairKey={selectedFontPair}
          onChange={handleFontPairChange}
        />
      </div>

      <div className="pt-6 border-t border-[#E6DFD3]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: SETTINGS PANEL */}
          <div className="lg:col-span-7 bg-[#FDFBF7] border border-[#E9E1D5] rounded-3xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-display text-lg font-bold text-[#2C2620] mb-1 flex items-center gap-2">
                <Settings className="w-4.5 h-4.5 text-[#B89047]" />
                Couple Card Customize
              </h3>
              <p className="text-xs text-[#8C7A6B]">Redesign and style the interactive couple names badge in detail.</p>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex flex-wrap gap-1.5 p-1 bg-[#FAF6EE] rounded-xl border border-[#E6DFD3]">
              {subTabs.map((t) => {
                const Icon = t.icon;
                const active = activeSubTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveSubTab(t.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      active
                        ? 'bg-white text-[#B89047] shadow-sm border border-[#E6DFD3] font-semibold'
                        : 'text-[#8C7A6B] hover:text-[#2C2620]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT: TYPOGRAPHY & LAYOUT */}
            <AnimatePresence mode="wait">
              {activeSubTab === 'typography' && (
                <motion.div
                  key="typography"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Groom Name Preview Override</label>
                      <input
                        type="text"
                        value={previewGroom}
                        onChange={e => setPreviewGroom(e.target.value)}
                        placeholder={defaultGroom || "Groom name..."}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Bride Name Preview Override</label>
                      <input
                        type="text"
                        value={previewBride}
                        onChange={e => setPreviewBride(e.target.value)}
                        placeholder={defaultBride || "Bride name..."}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <PremiumFontSelect
                      label="Groom Name Font"
                      value={cfg.groomFont}
                      onChange={(val) => patch({ groomFont: val })}
                    />
                    <PremiumFontSelect
                      label="Bride Name Font"
                      value={cfg.brideFont}
                      onChange={(val) => patch({ brideFont: val })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>Connector</label>
                      <select
                        value={cfg.connector}
                        onChange={e => patch({ connector: e.target.value as any })}
                        className={`${inputClass} py-2 cursor-pointer bg-white`}
                      >
                        <option value="hearts">Hearts</option>
                        <option value="ampersand">&amp; Ampersand</option>
                        <option value="ning">និង (Khmer "ning")</option>
                        <option value="pjuab">ភ្ជាប់ពាក្យ (Engagement)</option>
                      </select>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className={labelClass}>Card Layout</label>
                      <div className="grid grid-cols-2 gap-2 p-1 bg-[#FAF6EE] rounded-xl border border-[#E6DFD3]">
                        <button
                          type="button"
                          onClick={() => patch({ layout: 'vertical' })}
                          className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                            cfg.layout === 'vertical'
                              ? 'bg-white text-[#B89047] shadow-sm'
                              : 'text-[#8C7A6B] hover:text-[#2C2620]'
                          }`}
                        >
                          Vertical (Stacked)
                        </button>
                        <button
                          type="button"
                          onClick={() => patch({ layout: 'horizontal' })}
                          className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                            cfg.layout === 'horizontal'
                              ? 'bg-white text-[#B89047] shadow-sm'
                              : 'text-[#8C7A6B] hover:text-[#2C2620]'
                          }`}
                        >
                          Horizontal (Side-by-side)
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Font size slider */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider">Font Size</label>
                      <span className="text-xs font-bold text-[#B89047]">{Math.round((cfg.fontSize ?? 1.0) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.6"
                      max="2.0"
                      step="0.05"
                      value={cfg.fontSize ?? 1.0}
                      onChange={e => patch({ fontSize: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-[#E6DFD3] rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
                    />
                    <div className="flex justify-between text-[10px] text-[#8C7A6B] mt-1 font-medium">
                      <span>COMPACT (60%)</span>
                      <span>STANDARD (100%)</span>
                      <span>LARGE (200%)</span>
                    </div>
                  </div>
                </motion.div>
              )}

            {/* TAB CONTENT: KBACH & ORNAMENTS */}
            {activeSubTab === 'ornaments' && (
              <motion.div
                key="ornaments"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="space-y-5"
              >
                <div>
                  <label className={labelClass}>Ornament Border Frame</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {ORNAMENT_BORDER_OPTIONS.map((opt) => {
                      const selected = cfg.ornament === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => patch({ ornament: opt.id })}
                          className={`flex flex-col items-center p-3 rounded-2xl border transition-all text-center space-y-2 group ${
                            selected
                              ? 'bg-white border-[#D4AF37] shadow-sm ring-1 ring-[#D4AF37]/30'
                              : 'bg-white border-[#E6DFD3] hover:border-[#D4AF37] hover:bg-[#FAF9F6]'
                          }`}
                        >
                          <div className="w-full text-[#B89047] group-hover:scale-105 transition-transform">
                            {opt.preview}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#2C2620]">{opt.label}</p>
                            <p className="text-[9px] text-[#8C7A6B] line-clamp-1">{opt.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Opacity slider */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider">Ornament Opacity</label>
                    <span className="text-xs font-bold text-[#B89047]">{Math.round((cfg.ornamentOpacity ?? 0.9) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="1.0"
                    step="0.05"
                    value={cfg.ornamentOpacity ?? 0.9}
                    onChange={e => patch({ ornamentOpacity: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-[#E6DFD3] rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
                  />
                </div>

                {/* Scale slider */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider">Ornament Scale</label>
                    <span className="text-xs font-bold text-[#B89047]">{Math.round((cfg.ornamentScale ?? 1.0) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.6"
                    max="1.5"
                    step="0.05"
                    value={cfg.ornamentScale ?? 1.0}
                    onChange={e => patch({ ornamentScale: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-[#E6DFD3] rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
                  />
                </div>
              </motion.div>
            )}

            {/* TAB CONTENT: STICKERS & BADGES */}
            {activeSubTab === 'stickers' && (
              <motion.div
                key="stickers"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="space-y-5"
              >
                <div>
                  <label className={labelClass}>Overlay Stickers Grid</label>
                  <div className="grid grid-cols-2 gap-3">
                    {STICKER_OPTIONS.map((opt) => {
                      const activeStickers = cfg.stickers || [];
                      const selected = activeStickers.includes(opt.id);
                      const handleToggle = () => {
                        const next = selected
                           ? activeStickers.filter(id => id !== opt.id)
                           : [...activeStickers, opt.id];
                        patch({ stickers: next });
                      };

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={handleToggle}
                          className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left bg-white ${
                            selected
                              ? 'border-[#D4AF37] shadow-sm ring-1 ring-[#D4AF37]/30'
                              : 'border-[#E6DFD3] hover:border-[#D4AF37]'
                          }`}
                        >
                          <span className="text-2xl select-none">{opt.icon}</span>
                          <div>
                            <p className="text-xs font-bold text-[#2C2620]">{opt.label}</p>
                            <p className="text-[10px] text-[#8C7A6B] line-clamp-1">{opt.desc}</p>
                          </div>
                          <div className={`ml-auto w-4 h-4 rounded-full border flex items-center justify-center text-[8px] ${
                            selected
                              ? 'border-[#B89047] bg-[#B89047] text-white'
                              : 'border-[#E6DFD3]'
                          }`}>
                            {selected && '✓'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Stickers Placement Position</label>
                  <div className="grid grid-cols-3 gap-2 p-1 bg-[#FAF6EE] rounded-xl border border-[#E6DFD3]">
                    {(['top-corners', 'top-center', 'bottom-accent'] as const).map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => patch({ stickerPosition: pos })}
                        className={`py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                          cfg.stickerPosition === pos
                            ? 'bg-white text-[#B89047] shadow-sm border border-[#E6DFD3]'
                            : 'text-[#8C7A6B] hover:text-[#2C2620]'
                        }`}
                      >
                        {pos.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB CONTENT: EFFECTS & AMBIANCE */}
            {activeSubTab === 'effects' && (
              <motion.div
                key="effects"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Ambiance Particle Effect</label>
                    <select
                      value={cfg.ambiance}
                      onChange={e => patch({ ambiance: e.target.value as any })}
                      className={`${inputClass} py-2 cursor-pointer bg-white`}
                    >
                      {AMBIANCE_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Name Text Effect</label>
                    <select
                      value={cfg.textEffect || 'none'}
                      onChange={e => patch({ textEffect: e.target.value as any })}
                      className={`${inputClass} py-2 cursor-pointer bg-white`}
                    >
                      <option value="none">Standard Text</option>
                      <option value="gold-foil">Gold Foil Metallic</option>
                      <option value="soft-glow">Soft Accent Glow</option>
                      <option value="letterpress">Letterpress Engraved</option>
                      <option value="embossed">Embossed Raised</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Card Frame Theme</label>
                    <select
                      value={cfg.cardStyle || 'dark-glass'}
                      onChange={e => patch({ cardStyle: e.target.value as any })}
                      className={`${inputClass} py-2 cursor-pointer bg-white`}
                    >
                      <option value="dark-glass">Dark Glassmorphism</option>
                      <option value="light-glass">Light Glassmorphism</option>
                      <option value="royal-gold">Royal Palace Gold</option>
                      <option value="romantic-blush">Romantic Blush Pink</option>
                      <option value="emerald-luxury">Emerald Luxury</option>
                      <option value="vintage-parchment">Vintage Parchment</option>
                      <option value="minimal-clean">Minimal Clean</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Custom Accent Color</label>
                    <div className="flex gap-2">
                      <div className="relative w-12 h-12 rounded-xl border border-[#E6DFD3] overflow-hidden flex-shrink-0">
                        <input
                          type="color"
                          value={cfg.accentColor}
                          onChange={e => patch({ accentColor: e.target.value })}
                          className="absolute inset-0 w-full h-full cursor-pointer scale-125"
                        />
                      </div>
                      <input
                        type="text"
                        value={cfg.accentColor}
                        onChange={e => patch({ accentColor: e.target.value })}
                        className={`${inputClass} flex-1`}
                        placeholder="#D4AF37"
                      />
                    </div>
                  </div>
                </div>



                {/* Opacity & Blur Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider">Card Frame Opacity</label>
                      <span className="text-xs font-bold text-[#B89047]">{Math.round((cfg.bgOpacity ?? 0.38) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.05"
                      value={cfg.bgOpacity ?? 0.38}
                      onChange={e => patch({ bgOpacity: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-[#E6DFD3] rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider">Glass Blur Strength</label>
                      <span className="text-xs font-bold text-[#B89047]">{cfg.bgBlur ?? 14}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="24"
                      step="1"
                      value={cfg.bgBlur ?? 14}
                      onChange={e => patch({ bgBlur: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-[#E6DFD3] rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
                    />
                  </div>
                </div>

                {/* Predefined Elegant Themes */}
                <div>
                  <label className={labelClass}>Predefined Color Palettes</label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {PRESETS.map((p) => {
                      const selected = cfg.accentColor.toLowerCase() === p.accentColor.toLowerCase() && cfg.cardStyle === p.cardStyle;
                      return (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => patch({
                            accentColor: p.accentColor,
                            cardStyle: p.cardStyle,
                            textEffect: p.textEffect,
                            ornament: p.ornament
                          })}
                          className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all duration-300 relative overflow-hidden ${
                            selected
                              ? 'bg-[#FAF8F5] border-[#BF953F] shadow-[0_4px_20px_-4px_rgba(191,149,63,0.3)] scale-[1.03]'
                              : 'bg-white border-[#E6DFD3] hover:border-[#BF953F] hover:bg-[#FAF9F6] hover:scale-[1.02]'
                          }`}
                          style={selected ? { borderColor: p.accentColor, boxShadow: `0 8px 20px -6px ${p.accentColor}33` } : undefined}
                        >
                          <span
                            className="w-7 h-7 rounded-full border border-black/10 flex-shrink-0 relative flex items-center justify-center transition-transform"
                            style={{
                              background: p.cardStyle === 'emerald-luxury'
                                ? 'linear-gradient(135deg, #022013, #063C26)'
                                : p.cardStyle === 'royal-gold'
                                  ? 'linear-gradient(135deg, #1A1712, #2D2517)'
                                  : p.cardStyle === 'romantic-blush'
                                    ? 'linear-gradient(135deg, #fdf4f5, #fce7eb)'
                                    : p.cardStyle === 'vintage-parchment'
                                      ? '#FAF6EE'
                                      : p.bg
                            }}
                          >
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.accentColor }} />
                          </span>
                          <span className="text-[9px] font-semibold text-[#2C2620] tracking-wide line-clamp-1">{p.name}</span>
                          {selected && (
                            <div className="absolute right-1 top-1 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.accentColor }} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          </div>

          {/* RIGHT COLUMN: STICKY LIVE PREVIEW */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B89047] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#B89047]"></span>
                </span>
                Interactive Live Preview
              </h4>
              
              {/* Preview Toggle Tabs */}
              <div className="flex gap-1 p-0.5 bg-[#FAF6EE] border border-[#E6DFD3] rounded-lg shadow-sm">
                <button
                  type="button"
                  onClick={() => setPreviewMode('card')}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                    previewMode === 'card'
                      ? 'bg-white text-[#B89047] shadow-sm'
                      : 'text-[#8C7A6B] hover:text-[#2C2620]'
                  }`}
                >
                  Invitation Card
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('envelope')}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                    previewMode === 'envelope'
                      ? 'bg-white text-[#B89047] shadow-sm'
                      : 'text-[#8C7A6B] hover:text-[#2C2620]'
                  }`}
                >
                  Envelope Cover
                </button>
              </div>
            </div>

            {/* PREVIEW CONTAINER WINDOW */}
            <div className="bg-gradient-to-br from-[#1E1B18] to-[#0D0B0A] border border-[#3E352F] rounded-3xl p-6 relative overflow-hidden shadow-2xl min-h-[300px] flex items-center justify-center">
              
              {/* Grid Background Pattern */}
              <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#FAF9F6_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
              
              {/* Couple Card Wrapper or Envelope Cover Preview */}
              <div className="w-full max-w-[320px] relative z-10">
                {previewMode === 'card' ? (
                  <CoupleCard
                    groomName={groomName}
                    brideName={brideName}
                    groomFont={cfg.groomFont as any}
                    brideFont={cfg.brideFont as any}
                    layout={cfg.layout}
                    connector={cfg.connector}
                    ornament={cfg.ornament}
                    ambiance={cfg.ambiance}
                    accentColor={cfg.accentColor}
                    fontSize={cfg.fontSize}
                    cardStyle={cfg.cardStyle}
                    textEffect={cfg.textEffect}
                    ornamentOpacity={cfg.ornamentOpacity}
                    ornamentScale={cfg.ornamentScale}
                    stickers={cfg.stickers}
                    stickerPosition={cfg.stickerPosition}
                    bgOpacity={cfg.bgOpacity}
                    bgBlur={cfg.bgBlur}
                  />
                ) : (
                  <div className="w-full scale-90 sm:scale-95 origin-center">
                    <EnvelopeAnimation
                      guestName="Honored Guest / ឯកឧត្តម លោកជំទាវ"
                      isOpen={false}
                      onOpen={() => {}}
                      inlinePreview={true}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* SPEC SUMMARY */}
            <div className="bg-[#FAF6EE] border border-[#E6DFD3] rounded-2xl p-4 space-y-2.5 shadow-inner">
              <p className="text-[10px] font-bold text-[#2C2620] uppercase tracking-wider">Active Design Tokens</p>
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="flex items-center gap-2 text-[10px] text-[#8C7A6B] font-medium">
                  <SwatchBook className="w-3.5 h-3.5 text-[#B89047]" />
                  <span>Accent:</span>
                  <span className="flex items-center gap-1.5 font-bold text-[#2C2620]">
                    <span className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block shadow-sm" style={{ backgroundColor: cfg.accentColor }} />
                    {cfg.accentColor}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-[#8C7A6B] font-medium">
                  <Layout className="w-3.5 h-3.5 text-[#B89047]" />
                  <span>Theme:</span>
                  <span className="px-2 py-0.5 rounded-full bg-white border border-[#E6DFD3] text-[9px] font-bold text-[#2C2620] capitalize shadow-sm">
                    {(cfg.cardStyle || 'dark-glass').replace('-', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-[#8C7A6B] font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-[#B89047]" />
                  <span>Text Effect:</span>
                  <span className="px-2 py-0.5 rounded-full bg-white border border-[#E6DFD3] text-[9px] font-bold text-[#2C2620] capitalize shadow-sm">
                    {(cfg.textEffect || 'none').replace('-', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-[#8C7A6B] font-medium">
                  <Sliders className="w-3.5 h-3.5 text-[#B89047]" />
                  <span>Ambiance:</span>
                  <span className="px-2 py-0.5 rounded-full bg-white border border-[#E6DFD3] text-[9px] font-bold text-[#2C2620] capitalize shadow-sm">
                    {cfg.ambiance}
                  </span>
                </div>
              </div>
            </div>
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