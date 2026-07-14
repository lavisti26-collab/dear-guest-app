export interface ThemeTokens {
  colors: {
    primary: string;
    primaryForeground: string;
    accent: string;
    accentForeground: string;
    background: string;
    foreground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    card: string;
    cardForeground: string;
    border: string;
    input: string;
    ring: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    khmerHeadingFont: string;
    khmerBodyFont: string;
    headingWeight: string;
    bodyWeight: string;
    letterSpacing: string;
  };
  visuals: {
    radius: string;
    shadow: string;
    glassEffect: 'none' | 'soft' | 'strong' | 'frosted';
    borderStyle: 'none' | 'thin' | 'thick' | 'double' | 'dashed';
    borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  };
  identity: {
    backgroundPattern: string; // CSS class or URL
    backgroundGradient: string; // CSS gradient string
    texture: string; // CSS class or URL
    accentPattern: string;
    sectionDecoration: string;
    particleEffect: 'none' | 'petals' | 'sparkles' | 'bubbles' | 'snow';
  };
  components: {
    card: {
      style: 'flat' | 'glass' | 'luxury' | 'neo-brutalism' | 'minimal';
      border: string;
      shadow: string;
    };
    button: {
      style: 'apple' | 'pill' | 'sharp' | 'glass' | 'neo';
      transition: string;
    };
    timeline: {
      style: 'vertical' | 'horizontal' | 'zigzag' | 'minimal';
      markerStyle: 'dot' | 'diamond' | 'circle' | 'icon';
    };
    gallery: {
      style: 'grid' | 'masonry' | 'carousel' | 'stack';
      gap: string;
    };
    rsvp: {
      style: 'form' | 'step-by-step' | 'minimal';
    };
    footer: {
      style: 'classic' | 'modern' | 'luxury';
    };
  };
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  tokens: ThemeTokens;
  category: 'Modern' | 'Luxury' | 'Traditional' | 'Artistic' | 'Minimal';
}