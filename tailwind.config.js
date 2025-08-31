/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0b1020",
        foreground: "hsl(210, 40%, 98%)",
        card: "rgba(17, 24, 48, 0.9)",
        border: "hsl(217.2, 32.6%, 17.5%)",
        primary: "#2f6df6",
        success: "#10b981",
        danger: "#ef4444"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.05), 0 8px 40px rgba(47,109,246,0.25)"
      }
    }
  },
  plugins: []
};
