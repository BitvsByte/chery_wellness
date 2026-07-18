/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111213',
        graphite: '#1a1b1d',
        panel: { DEFAULT: '#232426', deep: '#161718', card: '#19191b' },
        line: 'rgba(170,176,185,0.3)',
        steel: '#9ca3af',
        silver: '#c3c7cd',
        bright: '#e5e7eb',
        body: '#aeb3ba',
        dim: '#8b9099',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans Variable"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 30px 80px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.08)',
        card: '0 24px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)',
        chrome:
          '0 4px 14px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.85)',
        'chrome-glow':
          '0 4px 20px rgba(0,0,0,0.7), 0 0 22px rgba(229,231,235,0.25), inset 0 1px 0 rgba(255,255,255,0.85)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        marquee: 'marquee 32s linear infinite',
      },
    },
  },
  plugins: [],
}
