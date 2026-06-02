export type V2ThemeId =
  | 'royal-khmer'
  | 'modern-khmer'
  | 'luxury-gold'
  | 'black-gold'
  | 'white-minimal'
  | 'korean-elegant'
  | 'japanese-sakura'
  | 'romantic-floral'
  | 'beach-sunset'
  | 'vintage-film'
  | 'glassmorphism'
  | 'cinematic-dark';

export const V2_THEMES: Array<{
  id: V2ThemeId;
  label: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    card: string;
    border: string;
    shadow: string;
  };
  swatches: string[];
  isDark: boolean;
}> = [
  {
    id: 'royal-khmer',
    label: 'Royal Khmer',
    description: 'Elegant heritage styling with deep red and gold accents.',
    colors: {
      primary: '#6B3A1F',
      secondary: '#D8B469',
      accent: '#B08534',
      background: '#F6F1E9',
      text: '#2D1B10',
      card: '#FFF8EF',
      border: '#E2D1B8',
      shadow: '0 20px 80px rgba(88, 58, 30, 0.12)',
    },
    swatches: ['#6B3A1F', '#D8B469', '#B08534', '#F6F1E9'],
    isDark: false,
  },
  {
    id: 'modern-khmer',
    label: 'Modern Khmer',
    description: 'Clean layout with warm ivory, bronze, and soft charcoal.',
    colors: {
      primary: '#3D2C25',
      secondary: '#C9A77B',
      accent: '#F0E3D6',
      background: '#FBF8F4',
      text: '#2B1D18',
      card: '#FFFFFF',
      border: '#E8DCC9',
      shadow: '0 18px 60px rgba(34, 23, 17, 0.14)',
    },
    swatches: ['#3D2C25', '#C9A77B', '#F0E3D6', '#FBF8F4'],
    isDark: false,
  },
  {
    id: 'luxury-gold',
    label: 'Luxury Gold',
    description: 'High-end gold shimmer with graphite contrast.',
    colors: {
      primary: '#1F1B16',
      secondary: '#D4AF6A',
      accent: '#F4E7C1',
      background: '#0F0D0A',
      text: '#F8F2E9',
      card: '#1C1914',
      border: '#3C352A',
      shadow: '0 24px 100px rgba(0, 0, 0, 0.35)',
    },
    swatches: ['#1F1B16', '#D4AF6A', '#F4E7C1', '#0F0D0A'],
    isDark: true,
  },
  {
    id: 'black-gold',
    label: 'Black & Gold',
    description: 'Bold, dramatic contrast with modern metallic shine.',
    colors: {
      primary: '#0D0B09',
      secondary: '#BFA56A',
      accent: '#F6E8C5',
      background: '#080705',
      text: '#EFE7D9',
      card: '#14120F',
      border: '#2E2A23',
      shadow: '0 22px 80px rgba(255, 221, 135, 0.18)',
    },
    swatches: ['#0D0B09', '#BFA56A', '#F6E8C5', '#14120F'],
    isDark: true,
  },
  {
    id: 'white-minimal',
    label: 'White Minimal',
    description: 'Airy, editorial composition with crisp spacings.',
    colors: {
      primary: '#111111',
      secondary: '#6B6B6B',
      accent: '#E6E0D9',
      background: '#FFFFFF',
      text: '#111111',
      card: '#FFFFFF',
      border: '#E7E3DE',
      shadow: '0 16px 48px rgba(17, 17, 17, 0.08)',
    },
    swatches: ['#111111', '#6B6B6B', '#E6E0D9', '#FFFFFF'],
    isDark: false,
  },
  {
    id: 'korean-elegant',
    label: 'Korean Elegant',
    description: 'Soft ivory, subtle peach and modern glass finishes.',
    colors: {
      primary: '#3F3A36',
      secondary: '#F1D6C4',
      accent: '#BCC2C6',
      background: '#FAF6F1',
      text: '#2C2724',
      card: '#FFFFFF',
      border: '#E7E2DE',
      shadow: '0 18px 56px rgba(58, 50, 44, 0.12)',
    },
    swatches: ['#3F3A36', '#F1D6C4', '#BCC2C6', '#FAF6F1'],
    isDark: false,
  },
  {
    id: 'japanese-sakura',
    label: 'Japanese Sakura',
    description: 'Soft blush, floral pink and traditional paper texture.',
    colors: {
      primary: '#4A2436',
      secondary: '#F3C3D4',
      accent: '#F8ECE8',
      background: '#FFF7F4',
      text: '#2B1D22',
      card: '#FFF5F2',
      border: '#E2CFD3',
      shadow: '0 18px 60px rgba(74, 36, 54, 0.10)',
    },
    swatches: ['#4A2436', '#F3C3D4', '#F8ECE8', '#FFF7F4'],
    isDark: false,
  },
  {
    id: 'romantic-floral',
    label: 'Romantic Floral',
    description: 'Warm rose petals and refined editorial styling.',
    colors: {
      primary: '#4B2A33',
      secondary: '#C2858C',
      accent: '#F5D9DA',
      background: '#FEF5F4',
      text: '#3A232C',
      card: '#FFF4F2',
      border: '#E5C9CD',
      shadow: '0 18px 58px rgba(74, 42, 57, 0.14)',
    },
    swatches: ['#4B2A33', '#C2858C', '#F5D9DA', '#FEF5F4'],
    isDark: false,
  },
  {
    id: 'beach-sunset',
    label: 'Beach Sunset',
    description: 'Warm coral, golden sand and coastal modern feel.',
    colors: {
      primary: '#2B3A47',
      secondary: '#F4A261',
      accent: '#F7D6B6',
      background: '#FEF7F0',
      text: '#2C3540',
      card: '#FFFFFF',
      border: '#E9D9D0',
      shadow: '0 20px 70px rgba(74, 92, 110, 0.12)',
    },
    swatches: ['#2B3A47', '#F4A261', '#F7D6B6', '#FEF7F0'],
    isDark: false,
  },
  {
    id: 'vintage-film',
    label: 'Vintage Film',
    description: 'Muted sepia, faded textures and nostalgic romance.',
    colors: {
      primary: '#2E231B',
      secondary: '#B69A78',
      accent: '#E8DBC8',
      background: '#F7F1EA',
      text: '#2B221A',
      card: '#FBF3EB',
      border: '#D8C5B2',
      shadow: '0 18px 64px rgba(46, 35, 27, 0.16)',
    },
    swatches: ['#2E231B', '#B69A78', '#E8DBC8', '#F7F1EA'],
    isDark: false,
  },
  {
    id: 'glassmorphism',
    label: 'Modern Glass',
    description: 'Translucent panels, soft blue glow and luxury spacing.',
    colors: {
      primary: '#1E3A59',
      secondary: '#8AB6D6',
      accent: '#DDE9F2',
      background: '#F4F8FC',
      text: '#122635',
      card: 'rgba(255, 255, 255, 0.72)',
      border: 'rgba(30, 58, 89, 0.12)',
      shadow: '0 24px 100px rgba(28, 58, 89, 0.12)',
    },
    swatches: ['#1E3A59', '#8AB6D6', '#DDE9F2', '#F4F8FC'],
    isDark: false,
  },
  {
    id: 'cinematic-dark',
    label: 'Cinematic Dark',
    description: 'Storytelling drama with smoky blue and bronze highlights.',
    colors: {
      primary: '#0B1324',
      secondary: '#2E4A6A',
      accent: '#B78A4A',
      background: '#080C18',
      text: '#F2F4F8',
      card: '#121A2B',
      border: '#2F435F',
      shadow: '0 26px 110px rgba(16, 25, 48, 0.35)',
    },
    swatches: ['#0B1324', '#2E4A6A', '#B78A4A', '#080C18'],
    isDark: true,
  },
];

export const V2_FONT_STYLES = [
  { id: 'elegant-script', label: 'Elegant Script' },
  { id: 'luxury-serif', label: 'Luxury Serif' },
  { id: 'modern-sans', label: 'Modern Sans' },
  { id: 'editorial', label: 'Editorial Style' },
  { id: 'minimal', label: 'Minimal Style' },
];

export const V2_SECTION_IDS = [
  'Hero',
  'Countdown',
  'Love Story',
  'Timeline',
  'Gallery',
  'Venue',
  'RSVP',
  'Guestbook',
  'Gift',
  'FAQ',
  'Contact',
] as const;

export type V2SectionId = (typeof V2_SECTION_IDS)[number];

export const V2_SECTION_VARIANTS: Record<
  V2SectionId,
  Array<{ id: string; label: string }>
> = {
  Hero: [
    { id: 'A', label: 'Editorial Hero' },
    { id: 'B', label: 'Split Visual' },
    { id: 'C', label: 'Centered Statement' },
  ],
  Countdown: [
    { id: 'A', label: 'Big Time' },
    { id: 'B', label: 'Card Timer' },
  ],
  'Love Story': [
    { id: 'A', label: 'Classic Timeline' },
    { id: 'B', label: 'Magazine Style' },
    { id: 'C', label: 'Polaroid Memory' },
  ],
  Timeline: [
    { id: 'A', label: 'Minimal Version' },
    { id: 'B', label: 'Luxury Blocks' },
  ],
  Gallery: [
    { id: 'A', label: 'Grid' },
    { id: 'B', label: 'Masonry' },
    { id: 'C', label: 'Carousel' },
  ],
  Venue: [
    { id: 'A', label: 'Map Highlight' },
    { id: 'B', label: 'Text + Image' },
  ],
  RSVP: [
    { id: 'A', label: 'Simple Form' },
    { id: 'B', label: 'Wizard' },
    { id: 'C', label: 'Luxury Card' },
  ],
  Guestbook: [
    { id: 'A', label: 'Wall' },
    { id: 'B', label: 'Cards' },
  ],
  Gift: [
    { id: 'A', label: 'Bank Details' },
    { id: 'B', label: 'Gift Registry' },
  ],
  FAQ: [
    { id: 'A', label: 'Accordion' },
    { id: 'B', label: 'Text Grid' },
  ],
  Contact: [
    { id: 'A', label: 'Minimal' },
    { id: 'B', label: 'Card' },
  ],
};

export const V2_PERSONALITY_PRESETS = [
  { id: 'romantic', label: 'Romantic' },
  { id: 'luxury', label: 'Luxury' },
  { id: 'minimalist', label: 'Minimalist' },
  { id: 'nature', label: 'Nature Lovers' },
  { id: 'travelers', label: 'Travelers' },
  { id: 'creative', label: 'Creative' },
  { id: 'modern', label: 'Modern' },
  { id: 'traditional-khmer', label: 'Traditional Khmer' },
  { id: 'cinematic', label: 'Cinematic' },
];
