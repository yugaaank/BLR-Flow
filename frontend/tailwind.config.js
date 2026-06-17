/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        police: {
          dark: '#0f172a',
          blue: '#3b82f6',
          red: '#ef4444',
          accent: '#38bdf8'
        }
      }
    },
  },
  plugins: [],
}
