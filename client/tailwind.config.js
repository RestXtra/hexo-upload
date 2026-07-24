/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sidebar: {
          bg: '#1a1b1e',
          hover: '#2c2d30',
          active: '#3a3b3f',
          text: '#9ca3af',
          activeText: '#e5e7eb',
          border: '#2d2e32'
        }
      }
    }
  },
  plugins: []
}