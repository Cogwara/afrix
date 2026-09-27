import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        afrix: {
          blue: "#0B5CFF",
          emerald: "#00C896",
          dark: "#0B1020",
          card: "#12182D",
          light: "#F7F9FC",
          gold: "#FFB000",
          purple: "#7C3AED",
          rose: "#F43F5E",
        },
        primary: {
          DEFAULT: "#0B5CFF",
          foreground: "#FFFFFF",
          50: "#EEF4FF",
          100: "#E0EBFF",
          200: "#C7D9FE",
          300: "#A4C0FD",
          400: "#6093FC",
          500: "#0B5CFF",
          600: "#0246D6",
          700: "#0337A8",
          800: "#073087",
          900: "#0B2B6E",
        },
        secondary: {
          DEFAULT: "#00C896",
          foreground: "#FFFFFF",
          50: "#ECFDF7",
          100: "#D1FAE8",
          200: "#A7F3D3",
          300: "#6EE7BA",
          400: "#34D399",
          500: "#00C896",
          600: "#059669",
          700: "#047857",
          800: "#065F46",
        },
        accent: {
          DEFAULT: "#FFB000",
          foreground: "#0B1020",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 20px -5px rgba(11, 92, 255, 0.4)",
        "glow-green": "0 0 20px -5px rgba(0, 200, 150, 0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
