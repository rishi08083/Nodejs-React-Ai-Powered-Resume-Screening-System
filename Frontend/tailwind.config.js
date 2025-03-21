/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // App Router files
    "./pages/**/*.{js,ts,jsx,tsx,mdx}", // If using pages directory
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // Your components
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
