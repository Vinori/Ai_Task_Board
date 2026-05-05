/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
        ],
      },
      borderRadius: {
        "2.5xl": "1.125rem",
        "3xl": "1.25rem",
      },
      boxShadow: {
        glow: "0 0 48px -12px rgba(124, 58, 237, 0.4)",
        "glow-blue": "0 0 40px -10px rgba(37, 99, 235, 0.35)",
        "card-dark":
          "0 4px 24px -4px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.06) inset",
        "glass-edge": "0 1px 0 0 rgba(255, 255, 255, 0.08) inset",
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #7c3aed 0%, #4f46e5 45%, #2563eb 100%)",
        "gradient-brand-soft":
          "linear-gradient(135deg, rgba(124, 58, 237, 0.35) 0%, rgba(37, 99, 235, 0.2) 100%)",
        "mesh-dark":
          "radial-gradient(ellipse 85% 55% at 50% -18%, rgba(124, 58, 237, 0.22), transparent 55%), radial-gradient(ellipse 55% 38% at 100% 0%, rgba(37, 99, 235, 0.14), transparent 50%), radial-gradient(ellipse 45% 35% at 0% 15%, rgba(139, 92, 246, 0.12), transparent 45%)",
        "mesh-light":
          "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(124, 58, 237, 0.08), transparent 50%), radial-gradient(ellipse 50% 40% at 100% 0%, rgba(37, 99, 235, 0.06), transparent 50%)",
      },
    },
  },
  plugins: [],
};
