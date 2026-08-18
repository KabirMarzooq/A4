/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyprus: "#1B7A3D",
        olive: "#A9BA1E",
        // Warm, green-tinted replacement for Tailwind's default slate, so it
        // sits with the brand colors instead of clashing (cool blue-gray).
        // NOTE: this file has no effect in the actual build — Tailwind v4
        // (@tailwindcss/vite) is CSS-first and there's no `@config` pointing
        // here, so the real override lives in src/index.css's @theme block.
        // Kept here in sync anyway for anyone reading this file.
        slate: {
          50: "#F8FAF9",
          100: "#F0F4F1",
          200: "#E1E8E2",
          300: "#C3CFC6",
          400: "#94A398",
          500: "#64766B",
          600: "#46594E",
          700: "#2B3D33",
          800: "#1A2A21",
          900: "#0F1B14",
          950: "#0B140F",
        },
        tealish: "#1CA7A6",
        surface: {
          light: "#F8FAFC",
          dark: "#0B1F26",
        },
        darkbg: "#0B1F26",
        darkcard: "#122E36",
        sidebar: {
          light: "#003333",
          dark: "#001a1a",
        }
      },
    },
  },
  plugins: [],
};
