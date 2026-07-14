import React, { useEffect, useState } from 'react';

// In-memory cache for fetched SVG contents to prevent repeated network requests
const svgCache: Record<string, string> = {};

interface NavIconProps {
  name: string;
  className?: string;
  size?: number | string;
}

export default function NavIcon({ name, className = '', size = 20 }: NavIconProps) {
  const [svgContent, setSvgContent] = useState<string>('');

  useEffect(() => {
    // Clean local fallback SVGs for robust immediate rendering
    if (name === 'contacts') {
      const fallback = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-phone"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;
      setSvgContent(fallback);
      return;
    }
    if (name === 'gallery') {
      const fallback = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`;
      setSvgContent(fallback);
      return;
    }

    const url = `https://jxtmjmsxziowyihktpoq.supabase.co/storage/v1/object/public/photos/icons/${name}.svg`;

    // Return if already cached
    if (svgCache[name]) {
      setSvgContent(svgCache[name]);
      return;
    }

    // Fetch the SVG file content
    const fetchSvg = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to load SVG icon: ${name}`);
        }
        let text = await response.text();
        
        // Strip out <?xml...>, <!DOCTYPE...> and other header wrappers if present
        text = text.replace(/<\?xml[^>]*\?>/i, '');
        text = text.replace(/<!DOCTYPE[^>]*>/i, '');
        
        // Make sure it has correct accessibility attributes
        text = text.replace(/<svg/i, `<svg aria-hidden="true"`);

        svgCache[name] = text;
        setSvgContent(text);
      } catch (err) {
        console.error(`Error loading SVG icon: ${name}`, err);
        // Fallback placeholder (a dot/circle) in case of error
        const fallback = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>`;
        svgCache[name] = fallback;
        setSvgContent(fallback);
      }
    };

    fetchSvg();
  }, [name]);

  // Adjust size styles
  const sizeStyle = typeof size === 'number' ? `${size}px` : size;

  return (
    <span
      className={`inline-flex items-center justify-center nav-icon-wrapper ${className}`}
      style={{ width: sizeStyle, height: sizeStyle }}
    >
      <style>{`
        .nav-icon-wrapper svg {
          width: 100%;
          height: 100%;
          display: block;
        }
        .nav-icon-wrapper svg path,
        .nav-icon-wrapper svg rect,
        .nav-icon-wrapper svg circle,
        .nav-icon-wrapper svg polygon,
        .nav-icon-wrapper svg line,
        .nav-icon-wrapper svg ellipse {
          fill: currentColor;
        }
        .nav-icon-wrapper svg [fill="none"] {
          fill: none !important;
        }
        .nav-icon-wrapper svg [stroke] {
          fill: none;
          stroke: currentColor;
        }
      `}</style>
      <span className="w-full h-full inline-flex items-center justify-center" dangerouslySetInnerHTML={{ __html: svgContent }} />
    </span>
  );
}
