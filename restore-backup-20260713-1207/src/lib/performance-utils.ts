/**
 * Performance optimization utilities.
 */

/**
 * Preloads a font by injecting a <link rel="preload"> tag into the <head>.
 */
export function preloadFont(fontFamily: string, url: string): void {
  if (document.querySelector(`link[href="${url}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'font';
  link.href = url;
  link.crossOrigin = 'anonymous';
  link.type = 'font/woff2';
  document.head.appendChild(link);
}

/**
 * Adds a <link rel="preconnect"> hint for a given URL.
 */
export function preconnect(url: string, crossOrigin = false): void {
  if (document.querySelector(`link[href="${url}"][rel="preconnect"]`)) return;
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = url;
  if (crossOrigin) link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
}

import React from 'react';

type AsyncComponent<T> = () => Promise<{ default: React.ComponentType<T> }>;

/**
 * Creates a deferred load wrapper. Usage: const DelayedSection = deferRender(import('./Section'), 300);
 */
export function deferRender<T>(importFn: AsyncComponent<T>, delay = 100) {
  let loaded = false;
  let Component: React.ComponentType<T> | null = null;

  const loader = async () => {
    if (loaded) return;
    const mod = await importFn();
    Component = mod.default;
    loaded = true;
  };

  // Start loading after delay
  setTimeout(loader, delay);

  return (props: T) => {
    if (!Component) return null;
    return React.createElement(Component, props as any);
  };
}

/**
 * Creates an optimized image URL for Supabase Storage images.
 * For non-Supabase URLs, returns the original.
 */
export function imageOptimizer(url: string, width?: number): string {
  if (!url) return '';
  if (url.includes('supabase.co/storage')) {
    const separator = url.includes('?') ? '&' : '?';
    const params = [`format=webp`];
    if (width) params.push(`width=${width}`);
    return `${url}${separator}${params.join('&')}`;
  }
  return url;
}