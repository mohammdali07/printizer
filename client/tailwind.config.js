/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '420px',
      },
      colors: {
        brand: {
          navy: '#0b1a30',
          'navy-dark': '#060f1d',
          'navy-light': '#142a4a',
          blue: '#1d4ed8',
          'blue-bright': '#2563eb',
          crimson: '#e11438',
          red: '#dc2626',
          pink: '#f43f5e',
          accent: '#ff2d55',
          gold: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'brand': '0 10px 30px -10px rgba(11, 26, 48, 0.15)',
        'brand-hover': '0 20px 40px -15px rgba(11, 26, 48, 0.25)',
        'glow-red': '0 0 25px -5px rgba(225, 20, 56, 0.4)',
        'glow-blue': '0 0 25px -5px rgba(29, 78, 216, 0.4)',
      }
    },
  },
  plugins: [],
}
