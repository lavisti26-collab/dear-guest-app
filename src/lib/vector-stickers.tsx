import React from 'react';

export interface VectorStickerDef {
  id: string;
  name: string;
  category: 'traditional_ornaments' | 'romantic_stickers';
  tags: string[];
  node: React.ReactNode;
}

// Gold Gradient Definition Component to be injected or used inline
export const GoldGradientDef = () => (
  <svg width="0" height="0" className="absolute">
    <defs>
      <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#BF953F" />
        <stop offset="25%" stopColor="#FCF6BA" />
        <stop offset="50%" stopColor="#B38728" />
        <stop offset="75%" stopColor="#FBF5B7" />
        <stop offset="100%" stopColor="#AA771C" />
      </linearGradient>
    </defs>
  </svg>
);

export const VECTOR_STICKERS: VectorStickerDef[] = [
  // ── TRADITIONAL KHMER ORNAMENTS ─────────────────────────────────────────────
  {
    id: 'kbach_chan',
    name: 'Kbach Chan (Lotus Star)',
    category: 'traditional_ornaments',
    tags: ['khmer', 'traditional', 'kbach', 'gold', 'flower', 'lotus', 'ornament'],
    node: (
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full text-amber-500" stroke="url(#goldGradient)">
        <circle cx="50" cy="50" r="46" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="41" strokeWidth="0.8" strokeDasharray="2 2" />
        {/* Core Center Lotus seedpod */}
        <circle cx="50" cy="50" r="8" fill="url(#goldGradient)" stroke="none" />
        {/* Radiating Khmer Flame Petals (Kbach) */}
        {/* Top Petal */}
        <path d="M50,12 C44,24 43,38 50,42 C57,38 56,24 50,12 Z" fill="url(#goldGradient)" fillOpacity="0.15" strokeWidth="1.5" />
        <path d="M50,12 C47,20 46,30 50,34 C54,30 53,20 50,12 Z" fill="url(#goldGradient)" fillOpacity="0.3" strokeWidth="1" />
        {/* Bottom Petal */}
        <path d="M50,88 C44,76 43,62 50,58 C57,62 56,76 50,88 Z" fill="url(#goldGradient)" fillOpacity="0.15" strokeWidth="1.5" />
        <path d="M50,88 C47,80 46,70 50,66 C54,70 53,80 50,88 Z" fill="url(#goldGradient)" fillOpacity="0.3" strokeWidth="1" />
        {/* Left Petal */}
        <path d="M12,50 C24,44 38,43 42,50 C38,57 24,56 12,50 Z" fill="url(#goldGradient)" fillOpacity="0.15" strokeWidth="1.5" />
        <path d="M12,50 C20,47 30,46 34,50 C30,54 20,53 12,50 Z" fill="url(#goldGradient)" fillOpacity="0.3" strokeWidth="1" />
        {/* Right Petal */}
        <path d="M88,50 C76,44 62,43 58,50 C62,57 76,56 88,50 Z" fill="url(#goldGradient)" fillOpacity="0.15" strokeWidth="1.5" />
        <path d="M88,50 C80,47 70,46 66,50 C70,54 80,53 88,50 Z" fill="url(#goldGradient)" fillOpacity="0.3" strokeWidth="1" />
        {/* Diagonals */}
        {/* Top-Left */}
        <path d="M23,23 C31,31 41,39 44,44 C39,41 31,31 23,23 Z" fill="url(#goldGradient)" fillOpacity="0.2" strokeWidth="1.5" />
        {/* Top-Right */}
        <path d="M77,23 C69,31 59,39 56,44 C61,41 69,31 77,23 Z" fill="url(#goldGradient)" fillOpacity="0.2" strokeWidth="1.5" />
        {/* Bottom-Left */}
        <path d="M23,77 C31,69 41,59 44,56 C39,59 31,69 23,77 Z" fill="url(#goldGradient)" fillOpacity="0.2" strokeWidth="1.5" />
        {/* Bottom-Right */}
        <path d="M77,77 C69,69 59,59 56,56 C61,59 69,69 77,77 Z" fill="url(#goldGradient)" fillOpacity="0.2" strokeWidth="1.5" />
        {/* Minor outer details */}
        <circle cx="50" cy="20" r="1.5" fill="url(#goldGradient)" stroke="none" />
        <circle cx="50" cy="80" r="1.5" fill="url(#goldGradient)" stroke="none" />
        <circle cx="20" cy="50" r="1.5" fill="url(#goldGradient)" stroke="none" />
        <circle cx="80" cy="50" r="1.5" fill="url(#goldGradient)" stroke="none" />
      </svg>
    )
  },
  {
    id: 'kbach_phni_tes',
    name: 'Kbach Phni Tes (Khmer Vine)',
    category: 'traditional_ornaments',
    tags: ['khmer', 'traditional', 'kbach', 'gold', 'vine', 'leaf', 'curled', 'ornament'],
    node: (
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full text-amber-500" stroke="url(#goldGradient)" strokeWidth="1.5">
        {/* S-shaped ornate Khmer vine curl (Phni Tes) */}
        <path d="M15,50 C30,30 60,30 75,50 C85,65 75,85 60,85 C45,85 40,70 50,60 C60,50 70,55 70,65 C70,70 65,72 62,70" fill="none" strokeWidth="2.5" />
        {/* Curved flame-leaves shooting outward */}
        <path d="M35,38 C32,25 45,15 50,25 C45,28 40,32 38,39 Z" fill="url(#goldGradient)" fillOpacity="0.2" />
        <path d="M55,34 C58,20 72,22 68,32 C64,32 58,34 56,36 Z" fill="url(#goldGradient)" fillOpacity="0.2" />
        <path d="M73,46 C83,38 90,50 82,55 C79,52 75,48 73,46 Z" fill="url(#goldGradient)" fillOpacity="0.2" />
        {/* Inner flame details */}
        <path d="M52,78 C42,78 38,70 45,66 M48,70 C44,70 42,66 46,64" />
        {/* Tiny decorative beads */}
        <circle cx="50" cy="24" r="1.5" fill="url(#goldGradient)" stroke="none" />
        <circle cx="71" cy="30" r="1.5" fill="url(#goldGradient)" stroke="none" />
        <circle cx="84" cy="48" r="1.5" fill="url(#goldGradient)" stroke="none" />
      </svg>
    )
  },
  {
    id: 'kbach_phni_tes_double',
    name: 'Kbach Khmer Border',
    category: 'traditional_ornaments',
    tags: ['khmer', 'traditional', 'kbach', 'gold', 'border', 'divider', 'ornament'],
    node: (
      <svg viewBox="0 0 200 60" fill="none" className="w-full h-full text-amber-500" stroke="url(#goldGradient)" strokeWidth="1.5">
        {/* Symmetrical Khmer divider */}
        <path d="M10,30 C30,10 50,10 70,30 C90,50 110,50 130,30 C150,10 170,10 190,30" strokeWidth="2" />
        <path d="M10,30 L190,30" strokeWidth="0.8" strokeDasharray="3 3" />
        {/* Center lotus bloom */}
        <path d="M100,15 C95,25 95,35 100,45 C105,35 105,25 100,15 Z" fill="url(#goldGradient)" fillOpacity="0.3" />
        <path d="M100,20 C88,25 88,35 100,40 C112,35 112,25 100,20 Z" fill="url(#goldGradient)" fillOpacity="0.1" />
        {/* Left scroll crest */}
        <path d="M40,20 C30,10 20,25 35,30 C45,35 40,45 35,42" />
        {/* Right scroll crest */}
        <path d="M160,20 C170,10 180,25 165,30 C155,35 160,45 165,42" />
      </svg>
    )
  },

  // ── ROMANTIC / MODERN CELEBRATORY VECTORS ───────────────────────────────────
  {
    id: 'wedding_rings_gold',
    name: 'Interlocking Rings',
    category: 'romantic_stickers',
    tags: ['ring', 'wedding', 'rings', 'gold', 'diamond', 'jewelry', 'romantic'],
    node: (
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
        {/* Left Ring */}
        <circle cx="40" cy="55" r="24" stroke="url(#goldGradient)" strokeWidth="4" />
        <circle cx="40" cy="55" r="21" stroke="#FFFFFF" strokeWidth="0.5" strokeOpacity="0.4" />
        {/* Right Ring */}
        <circle cx="60" cy="55" r="24" stroke="url(#goldGradient)" strokeWidth="4" />
        <circle cx="60" cy="55" r="21" stroke="#FFFFFF" strokeWidth="0.5" strokeOpacity="0.4" />
        {/* Diamond on Left Ring */}
        <path d="M34,25 L46,25 L49,32 L40,40 L31,32 Z" fill="#E2E8F0" stroke="url(#goldGradient)" strokeWidth="1.5" />
        <path d="M34,25 L40,32 L46,25" stroke="url(#goldGradient)" strokeWidth="1" />
        <path d="M40,32 L40,40" stroke="url(#goldGradient)" strokeWidth="1" />
        {/* Sparkle lines */}
        <path d="M40,12 L40,18" stroke="url(#goldGradient)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M28,17 L32,21" stroke="url(#goldGradient)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M52,17 L48,21" stroke="url(#goldGradient)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: 'romantic_heart_gold',
    name: 'Luxury Hearts',
    category: 'romantic_stickers',
    tags: ['heart', 'love', 'gold', 'luxury', 'romantic', 'wedding', 'shapes'],
    node: (
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
        {/* Big Heart Outline */}
        <path 
          d="M50,82 C50,82 14,56 14,35 C14,18 28,12 40,22 C45,26 50,32 50,32 C50,32 55,26 60,22 C72,12 86,18 86,35 C86,56 50,82 50,82 Z" 
          stroke="url(#goldGradient)" 
          strokeWidth="4" 
          fill="url(#goldGradient)"
          fillOpacity="0.08"
        />
        {/* Small Offset Inner Heart */}
        <path 
          d="M60,65 C60,65 38,48 38,34 C38,23 47,19 55,25 C58,28 60,32 60,32 C60,32 62,28 65,25 C73,19 82,23 82,34 C82,48 60,65 60,65 Z" 
          stroke="url(#goldGradient)" 
          strokeWidth="2.5" 
          fill="url(#goldGradient)"
          fillOpacity="0.2"
        />
      </svg>
    )
  },
  {
    id: 'floral_wreath_luxe',
    name: 'Floral Arrangement',
    category: 'romantic_stickers',
    tags: ['flower', 'floral', 'wreath', 'gold', 'wedding', 'leaf', 'branches'],
    node: (
      <svg viewBox="0 0 120 120" fill="none" className="w-full h-full" stroke="url(#goldGradient)" strokeWidth="1.2">
        {/* Intertwined gold branches forming a wreath */}
        <path d="M25,85 C12,65 15,35 38,22 C55,12 78,16 90,32" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M95,35 C108,55 105,85 82,98 C65,108 42,104 30,88" strokeWidth="1.5" strokeLinecap="round" />
        {/* Gold Leaves on Left Branch */}
        <path d="M22,70 C16,66 18,60 25,64 Z" fill="url(#goldGradient)" fillOpacity="0.2" />
        <path d="M19,50 C12,48 16,42 22,46 Z" fill="url(#goldGradient)" fillOpacity="0.2" />
        <path d="M26,34 C21,29 27,24 31,30 Z" fill="url(#goldGradient)" fillOpacity="0.2" />
        <path d="M38,22 C35,15 42,12 44,18 Z" fill="url(#goldGradient)" fillOpacity="0.2" />
        {/* Gold Leaves on Right Branch */}
        <path d="M98,50 C104,46 102,40 95,44 Z" fill="url(#goldGradient)" fillOpacity="0.2" />
        <path d="M101,70 C108,68 104,62 98,66 Z" fill="url(#goldGradient)" fillOpacity="0.2" />
        <path d="M94,86 C99,91 93,96 89,90 Z" fill="url(#goldGradient)" fillOpacity="0.2" />
        <path d="M82,98 C85,105 78,108 76,102 Z" fill="url(#goldGradient)" fillOpacity="0.2" />
        {/* Center Sparkles */}
        <path d="M60,40 L60,46" strokeWidth="1" />
        <path d="M57,43 L63,43" strokeWidth="1" />
        <path d="M60,74 L60,80" strokeWidth="1" />
        <path d="M57,77 L63,77" strokeWidth="1" />
      </svg>
    )
  },
  {
    id: 'champagne_toast_flat',
    name: 'Celebratory Flutes',
    category: 'romantic_stickers',
    tags: ['champagne', 'drink', 'glasses', 'toast', 'celebration', 'wedding', 'gold'],
    node: (
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
        {/* Left Glass */}
        <path d="M32,30 L45,35 L40,65 L48,65 M40,65 L40,82 L32,82 L48,82" stroke="url(#goldGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M33,35 L44,39 L41,55 L37,53 Z" fill="url(#goldGradient)" fillOpacity="0.2" />
        {/* Right Glass */}
        <path d="M68,30 L55,35 L60,65 L52,65 M60,65 L60,82 L68,82 L52,82" stroke="url(#goldGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M67,35 L56,39 L59,55 L63,53 Z" fill="url(#goldGradient)" fillOpacity="0.2" />
        {/* Clinking Sparkles */}
        <circle cx="50" cy="30" r="2" fill="url(#goldGradient)" />
        <path d="M50,16 L50,22" stroke="url(#goldGradient)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M40,24 L44,27" stroke="url(#goldGradient)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M60,24 L56,27" stroke="url(#goldGradient)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: 'love_letter_envelope',
    name: 'Love Letter',
    category: 'romantic_stickers',
    tags: ['letter', 'envelope', 'mail', 'heart', 'flat', 'love', 'romantic'],
    node: (
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
        {/* Envelope Body */}
        <rect x="15" y="30" width="70" height="46" rx="4" stroke="url(#goldGradient)" strokeWidth="3" fill="url(#goldGradient)" fillOpacity="0.05" />
        {/* Envelope Fold lines */}
        <path d="M15,30 L50,58 L85,30" stroke="url(#goldGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15,76 L38,52" stroke="url(#goldGradient)" strokeWidth="2" strokeLinecap="round" />
        <path d="M85,76 L62,52" stroke="url(#goldGradient)" strokeWidth="2" strokeLinecap="round" />
        {/* Heart Seal */}
        <path 
          d="M50,56 C50,56 42,50 42,45 C42,41 45,39 48,41 C50,42 50,44 50,44 C50,44 50,42 52,41 C55,39 58,41 58,45 C58,50 50,56 50,56 Z" 
          fill="#EF4444" 
          stroke="url(#goldGradient)" 
          strokeWidth="1" 
        />
      </svg>
    )
  }
];

export function getVectorStickerById(id: string): VectorStickerDef | undefined {
  return VECTOR_STICKERS.find(s => s.id === id);
}

export function getVectorStickersByCategory(category: VectorStickerDef['category']): VectorStickerDef[] {
  return VECTOR_STICKERS.filter(s => s.category === category);
}
