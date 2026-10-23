/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        agency: {
          bg: '#f3efe8',
          card: '#ffffff',
          surface: '#e9e4db',
          dark: '#0a0a0a',
          darkCard: '#171717',
          border: '#d4d4d4',
          borderLight: '#e5e0d8',
          text: '#0a0a0a',
          muted: '#525252',
          subtle: '#737373',
          coral: '#ff4c39',
          coralHover: '#d4300e',
          emerald: '#10b981',
          emeraldLight: '#ecfdf5',
        }
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'agency': '0 4px 20px -2px rgba(10, 10, 10, 0.05), 0 2px 6px -1px rgba(10, 10, 10, 0.03)',
        'agency-float': '0 20px 40px -8px rgba(10, 10, 10, 0.12)',
      }
    },
  },
  plugins: [],
}
