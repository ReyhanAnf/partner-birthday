/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        romantic: {
          bg: "#070A12",
          surface: "#0F1424",
          card: "#161B30",
          border: "rgba(244, 63, 94, 0.15)",
          rose: {
            50: "#FFF1F2",
            100: "#FFE4E6",
            200: "#FECDD3",
            300: "#FDA4AF",
            400: "#FB7185",
            500: "#F43F5E",
            600: "#E11D48",
            700: "#BE123C",
            800: "#9F1239",
            900: "#881337",
          },
          gold: {
            300: "#FDE68A",
            400: "#FBBF24",
            500: "#F59E0B",
            600: "#D97706",
          },
          champagne: "#FAF5EF",
          obsidian: "#06080F",
        },
      },
      fontFamily: {
        serif: ["'Cormorant Garamond'", "'Cormorant Infant'", "Playfair Display", "Georgia", "serif"],
        sans: ["Montserrat", "'Plus Jakarta Sans'", "Inter", "sans-serif"],
        script: ["'Great Vibes'", "'Dancing Script'", "cursive"],
      },
      animation: {
        spotlight: "spotlight 2s ease .75s 1 forwards",
        float: "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 8s linear infinite",
        shimmer: "shimmer 2.5s linear infinite",
        marquee: "marquee 55s linear infinite",
        "marquee-reverse": "marquee-reverse 55s linear infinite",
      },
      keyframes: {
        spotlight: {
          "0%": {
            opacity: "0",
            transform: "translate(-72%, -62%) scale(0.5)",
          },
          "100%": {
            opacity: "1",
            transform: "translate(-50%, -40%) scale(1)",
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          from: { backgroundPosition: "0 0" },
          to: { backgroundPosition: "-200% 0" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "marquee-reverse": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0%)" },
        },
      },
    },
  },
  plugins: [],
};
