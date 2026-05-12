/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', 'IBM Plex Sans', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
}

