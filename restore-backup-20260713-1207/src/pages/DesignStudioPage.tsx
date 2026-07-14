import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ThemeName } from "@/contexts/ThemeContext";
import { useTheme, THEME_INFO } from "@/contexts/ThemeContext";
import { injectFontFaces } from "@/lib/font-loader";
import {
  V2_FONT_STYLES,
  V2_PERSONALITY_PRESETS,
  V2_SECTION_IDS,
  V2_SECTION_VARIANTS,
  type V2SectionId,
} from "@/lib/v2-design-system";
import { useEffect } from "react";



const deviceLabels = {
  desktop: "Desktop",
  tablet: "Tablet",
  mobile: "Mobile",
} as const;

type PreviewMode = "desktop" | "tablet" | "mobile";

type SectionConfig = {
  id: V2SectionId;
  visible: boolean;
  variant: string;
};

const defaultSections: SectionConfig[] = V2_SECTION_IDS.map((id) => ({
  id,
  visible: true,
  variant: V2_SECTION_VARIANTS[id][0].id,
}));

const initialTypography = {
  heading: "elegant-script",
  body: "modern-sans",
  quote: "editorial",
};

const DesignStudioPage = () => {
  const { theme: themeId, setTheme: setThemeId } = useTheme();
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const [typography, setTypography] = useState(initialTypography);
  const [sections, setSections] = useState<SectionConfig[]>(defaultSections);
  const [personality, setPersonality] = useState("romantic");

  const theme = useMemo(
    () => THEME_INFO[themeId] ?? THEME_INFO["royal-khmer" as ThemeName],
    [themeId]
  );

  const previewStyle = {
    backgroundColor: `hsl(var(--background))`,
    color: `hsl(var(--foreground))`, // Use foreground for text color
    boxShadow: `var(--shadow-luxury)`,
    border: `1px solid hsl(var(--border))`, // Use border color
  };

  const buttonStyle = {
    backgroundColor: `hsl(var(--primary))`,
    color: `hsl(var(--primary-foreground))`, // Use primary-foreground for button text
    borderColor: `hsl(var(--border))`, // Use border color
  };

  useEffect(() => {
    // Dynamically inject fonts based on selected typography
    injectFontFaces(typography.heading);
    injectFontFaces(typography.body);
    injectFontFaces(typography.quote);
  }, [typography]);

  const handleMoveSection = (index: number, direction: "up" | "down") => {
    setSections((current) => {
      const next = [...current];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= next.length) return next;
      const item = next.splice(index, 1)[0];
      next.splice(targetIndex, 0, item);
      return next;
    });
  };

  const toggleSection = (id: V2SectionId) => {
    setSections((current) =>
      current.map((section) =>
        section.id === id ? { ...section, visible: !section.visible } : section
      )
    );
  };

  const updateVariant = (id: V2SectionId, variant: string) => {
    setSections((current) =>
      current.map((section) =>
        section.id === id ? { ...section, variant } : section
      )
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-[1800px] px-6 py-10">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Wedding Platform V2</p>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Design Studio for premium wedding experiences.
            </h1>
            <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
              Build a modern, elegant celebration website with live theming, typography, layout controls and a mobile-first preview.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/" className="rounded-full border border-slate-700 bg-slate-900 px-5 py-3 text-sm text-slate-200 transition hover:bg-slate-800">
              Back to current app
            </Link>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[390px_1fr]">
          <aside className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold text-white">1. Studio preview</h2>
                <p className="mt-2 text-sm text-slate-400">Choose a device preview and watch the design come alive.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(Object.keys(deviceLabels) as PreviewMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPreviewMode(mode)}
                      className={`rounded-full px-4 py-2 text-sm transition ${previewMode === mode ? 'bg-white text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                      {deviceLabels[mode]}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">2. Theme palette</h2>
                    <p className="mt-1 text-sm text-slate-400">Premium preset themes plus custom swatches.</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3">
                  {Object.values(THEME_INFO).map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setThemeId(option.id as ThemeName)}
                      className={`group block rounded-3xl border px-4 py-4 text-left transition ${themeId === option.id ? "border-amber-300/80 bg-slate-800" : "border-white/10 bg-slate-950/70 hover:border-slate-400/40"}`}>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">{option.label}</p>
                          <p className="mt-1 text-sm text-slate-400">{option.description}</p>
                        </div>
                        <div className="flex gap-1">
                          {option.colors.map((color) => (
                            <span key={color} className="h-5 w-5 rounded-full border border-white/10" style={{ backgroundColor: color }} />
                          ))}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white">3. Typography studio</h2>
                <p className="mt-1 text-sm text-slate-400">Choose fonts for headings, body text and quotes.</p>
                <div className="mt-4 grid gap-3">
                  {(['heading', 'body', 'quote'] as const).map((slot) => (
                    <label key={slot} className="block">
                      <span className="text-sm text-slate-300 capitalize">{slot}</span>
                      <select
                        value={typography[slot]}
                        onChange={(event) => setTypography((current) => ({ ...current, [slot]: event.target.value }))}
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300">
                        {V2_FONT_STYLES.map((style) => (
                          <option key={style.id} value={style.id}>{style.label}</option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white">4. Personality inspiration</h2>
                <p className="mt-1 text-sm text-slate-400">Auto-suggest a style direction for the couple.</p>
                <div className="mt-4 grid gap-2">
                  {V2_PERSONALITY_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setPersonality(preset.id)}
                      className={`rounded-2xl px-4 py-3 text-left text-sm transition ${personality === preset.id ? 'bg-amber-300/20 text-amber-100' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                      {preset.label}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white">5. Layout builder</h2>
                <p className="mt-1 text-sm text-slate-400">Reorder the page sections and toggle visibility.</p>
                <div className="mt-4 space-y-3">
                  {sections.map((section, index) => (
                    <div key={section.id} className="rounded-3xl border border-white/10 bg-slate-950/80 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">{section.id}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-500">Variant {section.variant}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleMoveSection(index, 'up')}
                            disabled={index === 0}
                            className="rounded-full border border-white/10 bg-slate-800 px-3 py-2 text-xs text-slate-300 disabled:cursor-not-allowed disabled:opacity-50">
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveSection(index, 'down')}
                            disabled={index === sections.length - 1}
                            className="rounded-full border border-white/10 bg-slate-800 px-3 py-2 text-xs text-slate-300 disabled:cursor-not-allowed disabled:opacity-50">
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleSection(section.id)}
                            className={`rounded-full px-3 py-2 text-xs transition ${section.visible ? 'bg-emerald-500/20 text-emerald-100' : 'bg-slate-700 text-slate-300'}`}>
                            {section.visible ? 'Visible' : 'Hidden'}
                          </button>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        <label className="block text-sm text-slate-300">
                          Variant
                          <select
                            value={section.variant}
                            onChange={(event) => updateVariant(section.id, event.target.value)}
                            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none transition focus:border-amber-300">
                            {V2_SECTION_VARIANTS[section.id].map((variant) => (
                              <option key={variant.id} value={variant.id}>{variant.label}</option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </aside>

          <main className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Live canvas</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Instant preview</h2>
                </div>
                <div className="rounded-3xl bg-slate-800/80 px-4 py-2 text-sm text-slate-300">
                  Personality: <span className="font-semibold text-white">{personality.replace(/-/g, ' ')}</span>
                </div>
              </div>
              <div className="grid gap-6 xl:grid-cols-[1fr_auto]">
                <div className="rounded-[2rem] border border-white/10 bg-black/40 p-6" style={previewStyle}>
                  <div className="flex items-center justify-between gap-4 pb-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Preview</p>
                      <h3 className="mt-2 text-2xl font-semibold font-display">
                        {theme.label}
                      </h3>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-2 text-xs uppercase tracking-[0.35em] text-slate-400">
                      {deviceLabels[previewMode]}
                    </div>
                  </div>
                  <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6" style={{ backgroundColor: `hsl(var(--card))` }}>
                    <div className="space-y-6">
                      <div>
                        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Hero section</p>
                        <h1 className="mt-4 text-4xl font-semibold leading-tight font-display" style={{ color: `hsl(var(--primary))` }}>
                          Your unforgettable celebration.
                        </h1>
                        <p className="mt-4 max-w-2xl text-base text-slate-300 font-body">
                          A premium wedding website with a luxury experience and stunning storytelling for your guests.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-4">
                          <button type="button" className="rounded-full px-6 py-3 text-sm font-semibold transition" style={buttonStyle}>
                            See details
                          </button>
                          <button type="button" className="rounded-full border border-white/10 px-6 py-3 text-sm text-slate-200 transition hover:bg-white/5">
                            RSVP now
                          </button>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        {sections.filter((section) => section.visible).slice(0, 4).map((section) => (
                          <div key={section.id} className="rounded-3xl border border-white/10 bg-slate-950/80 p-4">
                            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{section.id}</p>
                            <p className="mt-2 text-sm text-slate-200">{V2_SECTION_VARIANTS[section.id].find((item) => item.id === section.variant)?.label}</p>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5">
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Featured story</p>
                        <blockquote className="mt-4 text-base italic leading-8 text-slate-200 font-body">
                          “A cinematic love story with modern luxury details, designed for guests to feel the moment.”
                        </blockquote>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-slate-800/70 p-5">
                  <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-sm text-slate-300">
                    <p className="uppercase tracking-[0.35em] text-slate-500">Theme colors</p>
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {theme.colors.slice(0, 5).map((color, idx) => (
                        <div key={idx} className="rounded-3xl bg-slate-900 p-3 text-center">
                          <div className="mx-auto mb-3 h-10 w-10 rounded-full border border-white/10" style={{ backgroundColor: color }} />
                          {/* No label for individual swatches, just show color */}
                          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{color}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
              <h2 className="text-xl font-semibold text-white">Design system preview</h2>
              <p className="mt-2 text-sm text-slate-400">This preview shows responsive layout controls, premium styling and visual story sections for your new wedding website.</p>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5">
                  <p className="text-sm text-slate-400">Preview mode</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {Object.keys(deviceLabels).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setPreviewMode(mode as PreviewMode)}
                        className={`rounded-2xl px-4 py-3 text-sm transition ${previewMode === mode ? 'bg-amber-300/20 text-amber-100' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                        {deviceLabels[mode as PreviewMode]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5">
                  <p className="text-sm text-slate-400">Quick actions</p>
                  <div className="mt-4 grid gap-3">
                    <button type="button" className="rounded-2xl border border-amber-300/20 px-4 py-3 text-sm text-amber-100 hover:bg-amber-300/10">Save as draft</button>
                    <button type="button" className="rounded-2xl border border-slate-700 px-4 py-3 text-sm text-slate-200 hover:bg-slate-700/60">Preview live site</button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DesignStudioPage;
