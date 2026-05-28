import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        display: ["'Playfair Display'", "'Cormorant Garamond'", "serif"],
        sans: ["'Figtree'", "sans-serif"],
        khmer: ["'Kantumruy Pro'", "sans-serif"],
        "khmer-display": ["'Moul'", "'Kantumruy Pro'", "sans-serif"],
        "khmer-serif": ["'Battambang'", "'Kantumruy Pro'", "serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        gold: {
          DEFAULT: "hsl(var(--gold))",
          light: "hsl(var(--gold-light))",
        },
        "rose-gold": "hsl(var(--rose-gold))",
        champagne: "hsl(var(--champagne))",
        ivory: "hsl(var(--ivory))",
        blush: "hsl(var(--blush))",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        pill: "9999px",
      },
      boxShadow: {
        surface: "var(--shadow-surface)",
        luxury: "var(--shadow-luxury)",
        glow: "var(--shadow-glow)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "petal-fall": {
          "0%": { transform: "translateY(-10vh) rotate(0deg) translateX(0)", opacity: "0.8" },
          "50%": { transform: "translateY(50vh) rotate(180deg) translateX(20px)", opacity: "0.6" },
          "100%": { transform: "translateY(110vh) rotate(360deg) translateX(-10px)", opacity: "0" },
        },
        "float-up": {
          "0%": { transform: "translateY(0) scale(1)", opacity: "0.7" },
          "100%": { transform: "translateY(-80px) scale(0.3)", opacity: "0" },
        },
        "sparkle": {
          "0%, 100%": { opacity: "0", transform: "scale(0) rotate(0deg)" },
          "50%": { opacity: "1", transform: "scale(1) rotate(180deg)" },
        },
        "gentle-float": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-8px) rotate(3deg)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.3", boxShadow: "0 0 20px rgba(212,167,106,.1)" },
          "50%": { opacity: "0.6", boxShadow: "0 0 40px rgba(212,167,106,.2)" },
        },
        "cinematic-fade": {
          "0%": { opacity: "0", transform: "translateY(30px) scale(0.97)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "butterfly-float": {
          "0%": { transform: "translate(0, -10vh) rotate(-10deg)", opacity: "0" },
          "10%": { opacity: "0.7" },
          "25%": { transform: "translate(40px, 25vh) rotate(15deg)" },
          "50%": { transform: "translate(-30px, 50vh) rotate(-10deg)" },
          "75%": { transform: "translate(50px, 75vh) rotate(15deg)" },
          "100%": { transform: "translate(0, 110vh) rotate(-5deg)", opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "petal-fall": "petal-fall linear infinite",
        "float-up": "float-up 2.5s ease-out forwards",
        "sparkle": "sparkle 2s ease-in-out infinite",
        "gentle-float": "gentle-float 4s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "cinematic-fade": "cinematic-fade 0.8s ease-out forwards",
        "butterfly-float": "butterfly-float ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
