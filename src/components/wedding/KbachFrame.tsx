/**
 * KbachFrame.tsx
 *
 * An SVG ornamental frame component inspired by authentic Kbach Khmer motifs —
 * the interlocking lotus-scroll borders found on Khmer temple architecture,
 * traditional silk weaving (hol), and printed wedding stationery.
 *
 * The frame does NOT use CSS borders. It renders four SVG edge elements
 * (top, bottom, left corner, right corner) that animate into view as if
 * assembling around the content — each edge draws in from its respective side.
 *
 * Props:
 *   variant    — 'full' renders all four edges; 'cap' renders only top+bottom bands
 *   animate    — enables the frame-assembly reveal animation (default: true)
 *   gold       — the frame ink color (default: #C9932A — Temple Gold)
 *   ink        — the fill tint color (default: #8B1A1A — Lacquer Red)
 *   className  — applied to the outer wrapper
 *   children   — the content placed inside the frame
 */

import React from 'react';
import { motion, useReducedMotion, Variants } from 'framer-motion';

interface KbachFrameProps {
  variant?: 'full' | 'cap';
  animate?: boolean;
  gold?: string;
  ink?: string;
  className?: string;
  children?: React.ReactNode;
}

// ─── Sub-components: SVG ornament strips ────────────────────────────────────

/**
 * KbachBand — a horizontal ornamental strip.
 * Repeating lotus-scroll motif: central rosette flanked by scrolling vine.
 */
function KbachBand({
  gold,
  ink,
  className,
}: {
  gold: string;
  ink: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 400 28"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      className={`w-full ${className ?? ''}`}
      style={{ overflow: 'visible' }}
    >
      {/* Outer hairline rules */}
      <line x1="0" y1="2" x2="400" y2="2" stroke={gold} strokeWidth="0.8" opacity="0.6" />
      <line x1="0" y1="26" x2="400" y2="26" stroke={gold} strokeWidth="0.8" opacity="0.6" />

      {/* Middle ruled lane */}
      <line x1="0" y1="14" x2="400" y2="14" stroke={gold} strokeWidth="0.4" opacity="0.3" />

      {/* Repeating vine scroll — left half */}
      {[0, 80, 160].map((offset) => (
        <g key={`l-${offset}`} transform={`translate(${offset}, 0)`}>
          <path
            d="M0 14 C10 8, 20 6, 30 9 C40 12, 48 9, 54 5"
            fill="none"
            stroke={gold}
            strokeWidth="1"
            opacity="0.55"
            strokeLinecap="round"
          />
          <circle cx="30" cy="9" r="1.8" fill={gold} opacity="0.4" />
          {/* Small leaf */}
          <path
            d="M30 9 C28 5, 26 3, 30 1 C34 3, 32 5, 30 9Z"
            fill={ink}
            opacity="0.25"
          />
        </g>
      ))}

      {/* Repeating vine scroll — right half (mirrored) */}
      {[0, 80, 160].map((offset) => (
        <g key={`r-${offset}`} transform={`translate(${400 - offset}, 0) scale(-1,1)`}>
          <path
            d="M0 14 C10 8, 20 6, 30 9 C40 12, 48 9, 54 5"
            fill="none"
            stroke={gold}
            strokeWidth="1"
            opacity="0.55"
            strokeLinecap="round"
          />
          <circle cx="30" cy="9" r="1.8" fill={gold} opacity="0.4" />
          <path
            d="M30 9 C28 5, 26 3, 30 1 C34 3, 32 5, 30 9Z"
            fill={ink}
            opacity="0.25"
          />
        </g>
      ))}

      {/* Central lotus rosette */}
      <g transform="translate(200, 14)">
        {/* 8-petal rosette */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <path
            key={angle}
            d={`M0 0 C${Math.cos(((angle - 20) * Math.PI) / 180) * 9} ${Math.sin(((angle - 20) * Math.PI) / 180) * 9},
               ${Math.cos(((angle + 20) * Math.PI) / 180) * 9} ${Math.sin(((angle + 20) * Math.PI) / 180) * 9},
               ${Math.cos((angle * Math.PI) / 180) * 11} ${Math.sin((angle * Math.PI) / 180) * 11}Z`}
            fill={angle % 90 === 0 ? gold : ink}
            opacity={angle % 90 === 0 ? 0.75 : 0.35}
          />
        ))}
        <circle r="3" fill={gold} opacity="0.9" />
        <circle r="1.5" fill={ink} opacity="0.8" />
      </g>

      {/* Corner jewels */}
      {[8, 392].map((cx) => (
        <g key={cx} transform={`translate(${cx}, 14)`}>
          <circle r="3" fill={gold} opacity="0.6" />
          <circle r="1.5" fill={ink} opacity="0.5" />
        </g>
      ))}
    </svg>
  );
}

/**
 * KbachCornerRosette — 4-petal lotus corner ornament.
 * Applied at each panel corner in 'full' variant.
 */
function KbachCornerRosette({
  gold,
  ink,
  flip,
}: {
  gold: string;
  ink: string;
  flip?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 36 36"
      aria-hidden="true"
      className="w-9 h-9 absolute"
      style={
        flip
          ? { right: -1, bottom: -1, transform: 'scaleX(-1) scaleY(-1)' }
          : { left: -1, top: -1 }
      }
    >
      {/* Corner L-bracket */}
      <path
        d="M2 2 L2 14 M2 2 L14 2"
        stroke={gold}
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.85"
        fill="none"
      />
      {/* Small rosette at corner vertex */}
      <g transform="translate(2,2)">
        <path d="M0 0 C-1 -5, 1 -5, 0 -8 C-1 -5, 1 -5, 0 0Z" fill={gold} opacity="0.7" />
        <path d="M0 0 C5 -1, 5 1, 8 0 C5 -1, 5 1, 0 0Z" fill={gold} opacity="0.7" />
        <path d="M0 0 C1 5, -1 5, 0 8 C1 5, -1 5, 0 0Z" fill={ink} opacity="0.35" />
        <path d="M0 0 C-5 1, -5 -1, -8 0 C-5 1, -5 -1, 0 0Z" fill={ink} opacity="0.35" />
        <circle r="1.8" fill={gold} opacity="0.9" />
      </g>
    </svg>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export default function KbachFrame({
  variant = 'full',
  animate = true,
  gold = '#C9932A',
  ink = '#8B1A1A',
  className = '',
  children,
}: KbachFrameProps) {
  const prefersReduced = useReducedMotion();
  const shouldAnimate = animate && !prefersReduced;

  // Frame-assembly animation:
  // top draws in from left (scaleX 0→1)
  // bottom draws in from right (scaleX 0→1 with slight delay)
  // corners pop in with a scale bloom
  const topVariants: Variants = {
    hidden: { scaleX: 0, opacity: 0, originX: 0 },
    visible: {
      scaleX: 1,
      opacity: 1,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    },
  };
  const bottomVariants: Variants = {
    hidden: { scaleX: 0, opacity: 0, originX: 1 },
    visible: {
      scaleX: 1,
      opacity: 1,
      transition: { duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    },
  };
  const cornerVariants: Variants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.4, delay: 0.6, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] },
    },
  };
  const topRightVariants: Variants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.4, delay: 0.65, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] },
    },
  };
  const bottomLeftVariants: Variants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.4, delay: 0.7, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] },
    },
  };
  const bottomRightVariants: Variants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.4, delay: 0.75, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] },
    },
  };

  const MotionDiv = motion.div;

  return (
    <div className={`kbach-frame relative ${className}`}>
      {/* ── Top band ─────────────────────────────────────────── */}
      <MotionDiv
        initial={shouldAnimate ? 'hidden' : 'visible'}
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={shouldAnimate ? topVariants : {}}
        className="kbach-frame__top"
        style={{ overflow: 'visible' }}
      >
        <KbachBand gold={gold} ink={ink} />
      </MotionDiv>

      {/* ── Inner content with side rules ────────────────────── */}
      <div className="kbach-frame__body relative">
        {variant === 'full' && (
          <>
            {/* Left vertical rule */}
            <div
              className="kbach-frame__left-rule absolute left-0 top-0 bottom-0 w-px pointer-events-none"
              style={{
                background: `linear-gradient(to bottom, ${gold}40, ${gold}90, ${gold}40)`,
              }}
            />
            {/* Right vertical rule */}
            <div
              className="kbach-frame__right-rule absolute right-0 top-0 bottom-0 w-px pointer-events-none"
              style={{
                background: `linear-gradient(to bottom, ${gold}40, ${gold}90, ${gold}40)`,
              }}
            />
          </>
        )}

        {/* ── Corner ornaments ─────────────────────────────── */}
        {variant === 'full' && (
          <>
            <MotionDiv
              initial={shouldAnimate ? 'hidden' : 'visible'}
              whileInView="visible"
              viewport={{ once: true }}
              variants={shouldAnimate ? cornerVariants : {}}
              className="absolute top-0 left-0 pointer-events-none z-10"
            >
              <KbachCornerRosette gold={gold} ink={ink} />
            </MotionDiv>
            <MotionDiv
              initial={shouldAnimate ? 'hidden' : 'visible'}
              whileInView="visible"
              viewport={{ once: true }}
              variants={shouldAnimate ? topRightVariants : {}}
              className="absolute top-0 right-0 pointer-events-none z-10"
            >
              <KbachCornerRosette gold={gold} ink={ink} flip />
            </MotionDiv>
            <MotionDiv
              initial={shouldAnimate ? 'hidden' : 'visible'}
              whileInView="visible"
              viewport={{ once: true }}
              variants={shouldAnimate ? bottomLeftVariants : {}}
              className="absolute bottom-0 left-0 pointer-events-none z-10"
            >
              <svg viewBox="0 0 36 36" aria-hidden="true" className="w-9 h-9" style={{ position: 'absolute', left: -1, bottom: -1 }}>
                <path d="M2 34 L2 22 M2 34 L14 34" stroke={gold} strokeWidth="1.8" strokeLinecap="round" opacity="0.85" fill="none" />
                <g transform="translate(2,34)">
                  <path d="M0 0 C-1 5, 1 5, 0 8 C-1 5, 1 5, 0 0Z" fill={gold} opacity="0.7" />
                  <path d="M0 0 C5 1, 5 -1, 8 0 C5 1, 5 -1, 0 0Z" fill={gold} opacity="0.7" />
                  <path d="M0 0 C1 -5, -1 -5, 0 -8 C1 -5, -1 -5, 0 0Z" fill={ink} opacity="0.35" />
                  <path d="M0 0 C-5 -1, -5 1, -8 0 C-5 -1, -5 1, 0 0Z" fill={ink} opacity="0.35" />
                  <circle r="1.8" fill={gold} opacity="0.9" />
                </g>
              </svg>
            </MotionDiv>
            <MotionDiv
              initial={shouldAnimate ? 'hidden' : 'visible'}
              whileInView="visible"
              viewport={{ once: true }}
              variants={shouldAnimate ? bottomRightVariants : {}}
              className="absolute bottom-0 right-0 pointer-events-none z-10"
            >
              <svg viewBox="0 0 36 36" aria-hidden="true" className="w-9 h-9" style={{ position: 'absolute', right: -1, bottom: -1, transform: 'scaleX(-1)' }}>
                <path d="M2 34 L2 22 M2 34 L14 34" stroke={gold} strokeWidth="1.8" strokeLinecap="round" opacity="0.85" fill="none" />
                <g transform="translate(2,34)">
                  <path d="M0 0 C-1 5, 1 5, 0 8 C-1 5, 1 5, 0 0Z" fill={gold} opacity="0.7" />
                  <path d="M0 0 C5 1, 5 -1, 8 0 C5 1, 5 -1, 0 0Z" fill={gold} opacity="0.7" />
                  <path d="M0 0 C1 -5, -1 -5, 0 -8 C1 -5, -1 -5, 0 0Z" fill={ink} opacity="0.35" />
                  <path d="M0 0 C-5 -1, -5 1, -8 0 C-5 -1, -5 1, 0 0Z" fill={ink} opacity="0.35" />
                  <circle r="1.8" fill={gold} opacity="0.9" />
                </g>
              </svg>
            </MotionDiv>
          </>
        )}

        {/* ── The actual section content ─────────────────────── */}
        <div className="kbach-frame__content">{children}</div>
      </div>

      {/* ── Bottom band ──────────────────────────────────────── */}
      <MotionDiv
        initial={shouldAnimate ? 'hidden' : 'visible'}
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={shouldAnimate ? bottomVariants : {}}
        className="kbach-frame__bottom"
        style={{ overflow: 'visible' }}
      >
        <KbachBand gold={gold} ink={ink} />
      </MotionDiv>
    </div>
  );
}
