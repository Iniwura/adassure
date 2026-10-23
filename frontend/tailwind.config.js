/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#07090e',
          900: '#0a0d14',
          850: '#0e121b',
          800: '#141925',
          700: '#1e2536',
        },
        brass: {
          DEFAULT: '#d4a359',
          light: '#e2ba77',
          dark: '#b38238',
        },
        verified: {
          DEFAULT: '#10b981',
          light: '#34d399',
          glow: 'rgba(16, 185, 129, 0.15)',
        }
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
