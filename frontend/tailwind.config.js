/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        border: 'var(--border)',
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          fg: 'var(--accent-fg)',
        },
        sage: 'var(--sage)',
        gold: 'var(--gold)',
        mood: {
          GREAT: '#4CB782',
          GOOD: '#4BA3C7',
          OKAY: '#E0A93B',
          LOW: '#8B7FD1',
          BAD: '#D9576B',
        },
      },
      borderRadius: {
        btn: '10px',
        card: '16px',
        panel: '24px',
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'sans-serif'],
        display: ['Fraunces', 'serif'],
        mono: ['Geist Mono', 'monospace'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
