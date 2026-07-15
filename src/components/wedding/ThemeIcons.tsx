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
export function KbachDivider({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 800 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-auto ${className ?? ''}`}
      aria-hidden="true"
      {...props}
    >
      <defs>
        {/* Metallic gold gradient for luxury debossed hot stamp foil effect */}
        <linearGradient id="ktGoldFoil" x1="0" y1="0" x2="800" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A8792A" />
          <stop offset="15%" stopColor="#D9B468" />
          <stop offset="30%" stopColor="#F5DF9E" />
          <stop offset="50%" stopColor="#C59E4E" />
          <stop offset="70%" stopColor="#F5DF9E" />
          <stop offset="85%" stopColor="#D9B468" />
          <stop offset="100%" stopColor="#A8792A" />
        </linearGradient>
        {/* Subtle drop shadow filter to give debossed depth */}
        <filter id="ktDebossGlow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#1a0a00" floodOpacity="0.18" />
        </filter>
      </defs>

      <g filter="url(#ktDebossGlow)">
        {/* Horizontal boundary lines */}
        <line x1="80" y1="28" x2="720" y2="28" stroke="url(#ktGoldFoil)" strokeWidth="1.6" />
        <line x1="80" y1="33" x2="720" y2="33" stroke="url(#ktGoldFoil)" strokeWidth="0.8" />
        <line x1="80" y1="97" x2="720" y2="97" stroke="url(#ktGoldFoil)" strokeWidth="1.6" />
        <line x1="80" y1="102" x2="720" y2="102" stroke="url(#ktGoldFoil)" strokeWidth="0.8" />

        {/* ─── CENTRAL LOTUS BLOSSOM (X=400, Y=65) ─── */}
        {/* Main Central Vertical Petal / Bud */}
        <path
          d="M400 15 C391 32, 384 52, 384 75 C384 88, 391 98, 400 104 C409 98, 416 88, 416 75 C416 52, 409 32, 400 15 Z"
          stroke="url(#ktGoldFoil)"
          strokeWidth="1.8"
          fill="#FAF3E3"
        />
        {/* Central Petal Inner Filigree */}
        <path d="M400 32 C395 45, 390 60, 390 75 C390 85, 395 95, 400 98" stroke="url(#ktGoldFoil)" strokeWidth="0.8" />
        <path d="M400 32 C405 45, 410 60, 410 75 C410 85, 405 95, 400 98" stroke="url(#ktGoldFoil)" strokeWidth="0.8" />
        <path d="M400 48 V92" stroke="url(#ktGoldFoil)" strokeWidth="0.6" strokeDasharray="1,2" />

        {/* Inner flame core of the bud */}
        <path
          d="M400 40 C397 50, 395 62, 400 70 C405 62, 403 50, 400 40 Z"
          fill="url(#ktGoldFoil)"
          opacity="0.8"
        />

        {/* First Outer Layer Petals (Left & Right) */}
        <path
          d="M386 52 C370 52, 355 68, 355 84 C355 96, 372 105, 400 108"
          stroke="url(#ktGoldFoil)"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M414 52 C430 52, 445 68, 445 84 C445 96, 428 105, 400 108"
          stroke="url(#ktGoldFoil)"
          strokeWidth="1.5"
          fill="none"
        />

        {/* Second Outer Layer Petals (Left & Right) */}
        <path
          d="M384 68 C348 68, 335 82, 335 95 C335 104, 358 111, 400 114"
          stroke="url(#ktGoldFoil)"
          strokeWidth="1.3"
          fill="none"
        />
        <path
          d="M416 68 C452 68, 465 82, 465 95 C465 104, 442 111, 400 114"
          stroke="url(#ktGoldFoil)"
          strokeWidth="1.3"
          fill="none"
        />

        {/* Flame Crown Tip (Topmost Ornament) */}
        <path
          d="M400 4 C397 9, 395 16, 400 20 C405 16, 403 9, 400 4 Z"
          fill="url(#ktGoldFoil)"
        />

        {/* Bottom Sepals (Base Support) */}
        <path
          d="M372 90 C372 110, 386 122, 400 125 C414 122, 428 110, 428 90"
          stroke="url(#ktGoldFoil)"
          strokeWidth="1.8"
          fill="none"
        />
        <path
          d="M380 94 C380 108, 390 117, 400 119 C410 117, 420 108, 420 94"
          stroke="url(#ktGoldFoil)"
          strokeWidth="0.8"
          fill="none"
        />

        {/* ─── LEFT SCROLLS (X < 330) ─── */}
        {/* Main top curling branch */}
        <path
          d="M355 60 C315 36, 265 24, 215 36 C165 48, 135 68, 105 48"
          stroke="url(#ktGoldFoil)"
          strokeWidth="1.5"
          fill="none"
        />
        {/* Main bottom curling branch */}
        <path
          d="M335 80 C290 95, 240 95, 190 85 C140 75, 110 85, 80 70"
          stroke="url(#ktGoldFoil)"
          strokeWidth="1.5"
          fill="none"
        />

        {/* Outer scroll spiral 1 */}
        <path
          d="M310 52 C280 36, 250 42, 240 62 C230 82, 250 92, 265 82 C280 72, 275 58, 260 58 C250 58, 245 68, 252 72"
          stroke="url(#ktGoldFoil)"
          strokeWidth="1.2"
          fill="none"
        />
        {/* Outer scroll spiral 2 */}
        <path
          d="M210 42 C180 32, 150 38, 140 58 C130 78, 150 88, 165 78 C180 68, 175 54, 160 54 C150 54, 145 64, 152 68"
          stroke="url(#ktGoldFoil)"
          strokeWidth="1.2"
          fill="none"
        />
        {/* Outer scroll spiral 3 */}
        <path
          d="M110 48 C90 38, 70 48, 70 62 C70 76, 90 82, 100 72 C110 62, 105 52, 95 52"
          stroke="url(#ktGoldFoil)"
          strokeWidth="1.0"
          fill="none"
        />

        {/* Small leafy flame details inside left scrolls */}
        <path d="M280 38 C270 28, 260 28, 265 40 Z" fill="url(#ktGoldFoil)" opacity="0.7" />
        <path d="M175 32 C165 22, 155 22, 160 34 Z" fill="url(#ktGoldFoil)" opacity="0.7" />
        <path d="M232 78 C225 85, 220 80, 222 72 Z" fill="url(#ktGoldFoil)" opacity="0.7" />

        {/* ─── RIGHT SCROLLS (X > 470) ─── */}
        {/* Main top curling branch */}
        <path
          d="M445 60 C485 36, 535 24, 585 36 C635 48, 665 68, 695 48"
          stroke="url(#ktGoldFoil)"
          strokeWidth="1.5"
          fill="none"
        />
        {/* Main bottom curling branch */}
        <path
          d="M465 80 C510 95, 560 95, 610 85 C660 75, 690 85, 720 70"
          stroke="url(#ktGoldFoil)"
          strokeWidth="1.5"
          fill="none"
        />

        {/* Outer scroll spiral 1 */}
        <path
          d="M490 52 C520 36, 550 42, 560 62 C570 82, 550 92, 535 82 C520 72, 525 58, 540 58 C550 58, 555 68, 548 72"
          stroke="url(#ktGoldFoil)"
          strokeWidth="1.2"
          fill="none"
        />
        {/* Outer scroll spiral 2 */}
        <path
          d="M590 42 C620 32, 650 38, 660 58 C670 78, 650 88, 635 78 C620 68, 625 54, 640 54 C650 54, 655 64, 648 68"
          stroke="url(#ktGoldFoil)"
          strokeWidth="1.2"
          fill="none"
        />
        {/* Outer scroll spiral 3 */}
        <path
          d="M690 48 C710 38, 730 48, 730 62 C730 76, 710 82, 700 72 C690 62, 695 52, 705 52"
          stroke="url(#ktGoldFoil)"
          strokeWidth="1.0"
          fill="none"
        />

        {/* Small leafy flame details inside right scrolls */}
        <path d="M520 38 C530 28, 540 28, 535 40 Z" fill="url(#ktGoldFoil)" opacity="0.7" />
        <path d="M625 32 C635 22, 645 22, 640 34 Z" fill="url(#ktGoldFoil)" opacity="0.7" />
        <path d="M568 78 C575 85, 580 80, 578 72 Z" fill="url(#ktGoldFoil)" opacity="0.7" />
      </g>
    </svg>
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
