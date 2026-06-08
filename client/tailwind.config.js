/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#3B82F6",
          dark: "#60A5FA",
        },
        accent: {
          light: "#EC4899",
          dark: "#F472B6",
        },
        success: {
          light: "#10B981",
          dark: "#34D399",
        },
        ink: "#0F172A",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        soft: "0 20px 50px -28px rgba(15, 23, 42, 0.35)",
      },
    },
  },
  plugins: [],
};
