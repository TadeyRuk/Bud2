/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bud: {
          primary: "#C1440E",
          "primary-dim": "#a63a0c",
          bg: "#F5F0E8",
          card: "#FFFFFF",
          text: "#2C1A0E",
          "text-muted": "#56423c",
          nav: "#1a1a1a",
          accent: "#005763",
          "accent-container": "#007180",
          "surface-low": "#ebe6de",
          "surface-well": "#e5e2de",
          "lost-bg": "#ffdad6",
          "lost-text": "#93000a",
          "found-bg": "#007180",
          "found-text": "#ffffff",
        },
      },
      fontFamily: {
        headline: ["Manrope", "system-ui", "sans-serif"],
        body: ["Work Sans", "system-ui", "sans-serif"],
      },
      boxShadow: {
        ambient: "0 8px 24px rgba(44, 26, 14, 0.08)",
        phone: "0 24px 80px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255,255,255,0.06)",
        fab: "0 8px 24px rgba(193, 68, 14, 0.45)",
      },
    },
  },
  plugins: [],
};
