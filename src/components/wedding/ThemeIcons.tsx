/**
 * ThemeIcons.tsx
 *
 * Authentic SVG icon components — one per design intent.
 * These replace all emoji decorations (✦ ✨ ❋ 📱 📞 📘 ✉️ etc.)
 * across themed layouts. Each SVG is hand-coded to match the
 * visual grammar of its intended theme era/mood.
 *
 * Usage:
 *   import { LotusIcon, KbachDiamond, CandleFlame } from './ThemeIcons';
 *   <LotusIcon className="w-6 h-6 text-[#C9932A]" />
 *
 * All icons accept standard SVG props + className.
 */

import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement>;

// ─── KHMER TRADITIONAL ICONS ────────────────────────────────────────────────

/**
 * Lotus Blossom — replaces ❋ in GreetingSection and closing ornaments.
 * 8-petal lotus, the sacred flower of Khmer ceremony.
 */
export function LotusIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {/* Outer petals */}
      <path d="M16 2C14 7 14 11 16 14C18 11 18 7 16 2Z" fill="currentColor" opacity="0.65" />
      <path d="M16 30C18 25 18 21 16 18C14 21 14 25 16 30Z" fill="currentColor" opacity="0.65" />
      <path d="M2 16C7 14 11 14 14 16C11 18 7 18 2 16Z" fill="currentColor" opacity="0.65" />
      <path d="M30 16C25 18 21 18 18 16C21 14 25 14 30 16Z" fill="currentColor" opacity="0.65" />
      {/* Diagonal petals */}
      <path d="M5.17 5.17C8.5 9.5 10.5 12 12 14C10 12 8 9 5.17 5.17Z" fill="currentColor" opacity="0.45" />
      <path d="M26.83 5.17C23.5 9.5 21.5 12 20 14C22 12 24 9 26.83 5.17Z" fill="currentColor" opacity="0.45" />
      <path d="M5.17 26.83C9.5 23.5 12 21.5 14 20C12 22 9 24 5.17 26.83Z" fill="currentColor" opacity="0.45" />
      <path d="M26.83 26.83C23.5 23.5 21.5 22 20 20C22 22 24 24 26.83 26.83Z" fill="currentColor" opacity="0.45" />
      {/* Centre */}
      <circle cx="16" cy="16" r="3" fill="currentColor" opacity="0.9" />
      <circle cx="16" cy="16" r="1.5" fill="currentColor" />
    </svg>
  );
}

/**
 * Kbach Diamond — replaces ✦ in section dividers and HeroSection gold divider.
 * Kbach Khmer: four-directional petal around a central jewel.
 */
export function KbachDiamond({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {/* Four cardinal petals */}
      <path d="M12 1C11 5 11 8 12 11C13 8 13 5 12 1Z" fill="currentColor" />
      <path d="M12 23C13 19 13 16 12 13C11 16 11 19 12 23Z" fill="currentColor" />
      <path d="M1 12C5 11 8 11 11 12C8 13 5 13 1 12Z" fill="currentColor" />
      <path d="M23 12C19 13 16 13 13 12C16 11 19 11 23 12Z" fill="currentColor" />
      {/* Centre jewel */}
      <circle cx="12" cy="12" r="2.2" fill="currentColor" />
    </svg>
  );
}

/**
 * KbachDivider — horizontal ornamental divider row.
 * Use instead of the section-divider CSS class in khmer-traditional layout.
 * Renders as: ——  ◆  ——  ✿  ——  ◆  ——
 */
export function KbachDivider({ className }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center gap-2 ${className ?? ''}`}
      aria-hidden="true"
    >
      {/* Left line */}
      <div
        className="h-px flex-1 max-w-[60px]"
        style={{ background: 'linear-gradient(to right, transparent, currentColor)' }}
      />
      {/* Left small petal node */}
      <svg viewBox="0 0 12 12" fill="none" className="w-2 h-2 flex-shrink-0" aria-hidden="true">
        <path d="M6 0C5.2 3 5.2 5 6 7C6.8 5 6.8 3 6 0Z" fill="currentColor" opacity="0.7" />
        <path d="M6 12C6.8 9 6.8 7 6 5C5.2 7 5.2 9 6 12Z" fill="currentColor" opacity="0.7" />
        <path d="M0 6C3 5.2 5 5.2 7 6C5 6.8 3 6.8 0 6Z" fill="currentColor" opacity="0.7" />
        <path d="M12 6C9 6.8 7 6.8 5 6C7 5.2 9 5.2 12 6Z" fill="currentColor" opacity="0.7" />
      </svg>
      {/* Centre lotus rosette */}
      <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 flex-shrink-0" aria-hidden="true">
        <path d="M10 1C9 4.5 9 7 10 9.5C11 7 11 4.5 10 1Z" fill="currentColor" opacity="0.8" />
        <path d="M10 19C11 15.5 11 13 10 10.5C9 13 9 15.5 10 19Z" fill="currentColor" opacity="0.8" />
        <path d="M1 10C4.5 9 7 9 9.5 10C7 11 4.5 11 1 10Z" fill="currentColor" opacity="0.8" />
        <path d="M19 10C15.5 11 13 11 10.5 10C13 9 15.5 9 19 10Z" fill="currentColor" opacity="0.8" />
        <circle cx="10" cy="10" r="2.5" fill="currentColor" />
      </svg>
      {/* Right small petal node */}
      <svg viewBox="0 0 12 12" fill="none" className="w-2 h-2 flex-shrink-0" aria-hidden="true">
        <path d="M6 0C5.2 3 5.2 5 6 7C6.8 5 6.8 3 6 0Z" fill="currentColor" opacity="0.7" />
        <path d="M6 12C6.8 9 6.8 7 6 5C5.2 7 5.2 9 6 12Z" fill="currentColor" opacity="0.7" />
        <path d="M0 6C3 5.2 5 5.2 7 6C5 6.8 3 6.8 0 6Z" fill="currentColor" opacity="0.7" />
        <path d="M12 6C9 6.8 7 6.8 5 6C7 5.2 9 5.2 12 6Z" fill="currentColor" opacity="0.7" />
      </svg>
      {/* Right line */}
      <div
        className="h-px flex-1 max-w-[60px]"
        style={{ background: 'linear-gradient(to left, transparent, currentColor)' }}
      />
    </div>
  );
}

/**
 * CandleFlame — replaces ✨ in the scroll hint button.
 * A tapered flame silhouette — evocative of Khmer ceremony offerings.
 */
export function CandleFlame({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 24"
      fill="none"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {/* Inner flame core */}
      <path
        d="M8 2C6.5 6 5 9 5.5 13C6 16 7 18 8 20C9 18 10 16 10.5 13C11 9 9.5 6 8 2Z"
        fill="currentColor"
        opacity="0.9"
      />
      {/* Outer flame glow */}
      <path
        d="M8 0C5 5 3.5 9 4 13.5C4.5 17 6 19.5 8 22C10 19.5 11.5 17 12 13.5C12.5 9 11 5 8 0Z"
        fill="currentColor"
        opacity="0.35"
      />
      {/* Candle body */}
      <rect x="6.5" y="22" width="3" height="2" rx="0.5" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

// ─── CONTACT SECTION ICONS (Khmer Traditional style) ────────────────────────

/**
 * TelegramIcon — SVG line-art for contact cards.
 * Replaces 📱 emoji in ContactSection.
 */
export function TelegramIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="Telegram"
      className={className}
      {...props}
    >
      <path d="M22 2L11 13" />
      <path d="M22 2L15 22L11 13L2 9L22 2Z" />
    </svg>
  );
}

/**
 * PhoneIcon — SVG line-art for contact cards.
 * Replaces 📞 emoji in ContactSection.
 */
export function PhoneIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="Phone"
      className={className}
      {...props}
    >
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.7A2 2 0 012.18 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.15A16 16 0 0013.85 15.09l1.31-1.32a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  );
}

/**
 * FacebookIcon — SVG line-art for contact cards.
 * Replaces 📘 emoji in ContactSection.
 */
export function FacebookIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="Facebook"
      className={className}
      {...props}
    >
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    </svg>
  );
}

/**
 * MailIcon — SVG line-art for contact cards.
 * Replaces ✉️ emoji in ContactSection.
 */
export function MailIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="Email"
      className={className}
      {...props}
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 7l10 7 10-7" />
    </svg>
  );
}

/**
 * ScrollDownIcon — replaces the chevron / animated dot scroll indicator.
 * Rendered as a delicate downward-pointing leaf cluster.
 */
export function ScrollDownIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M12 5v14" />
      <path d="M7 14l5 5 5-5" />
    </svg>
  );
}
