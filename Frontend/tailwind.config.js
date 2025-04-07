/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#0E151F",
          surface: "#1B222C",
          "surface-lighter": "#1B222C",
          "text-primary": "#FFFFFF",
          "text-secondary": "#8B949E",
          accent: "#FFB300",
          "accent-hover": "#FFC133",
          border: "#30363D",
          shadow: "rgba(0, 0, 0, 0.3)",
          "blue-highlight": "#1f6feb33",
        },
        light: {
          bg: "#FFFFFF",
          surface: "#F5F5F5",
          "surface-lighter": "#E0E0E0",
          "text-primary": "#000000",
          "text-secondary": "#616161",
          accent: "#FFB300",
          "accent-hover": "#FFC133",
          border: "#E0E0E0",
          shadow: "rgba(0, 0, 0, 0.1)",
          "blue-highlight": "#1f6feb33",
        },
      },
    },
  },
  plugins: [],
};
