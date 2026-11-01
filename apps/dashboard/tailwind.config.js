/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        space: {
          950: '#06070a',
          900: '#0b0d14',
          850: '#10131d',
          800: '#161a29',
          700: '#20263c',
          600: '#2c3552',
        },
        galaxy: {
          400: '#a5b4fc',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          glow: '#818cf8',
        },
      },
      backgroundImage: {
        'galaxy-gradient': 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.1) 50%, rgba(6, 182, 212, 0.05) 100%)',
        'card-gradient': 'linear-gradient(180deg, rgba(22, 26, 41, 0.7) 0%, rgba(16, 19, 29, 0.9) 100%)',
        'mesh-gradient': 'radial-gradient(at 27% 37%, hsla(243, 85%, 55%, 0.18) 0px, transparent 60%), radial-gradient(at 97% 21%, hsla(271, 85%, 50%, 0.15) 0px, transparent 55%), radial-gradient(at 52% 99%, hsla(180, 85%, 45%, 0.1) 0px, transparent 50%)',
      },
      boxShadow: {
        'glow-indigo': '0 0 25px -5px rgba(99, 102, 241, 0.35)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.35)',
        'glow-purple': '0 0 25px -5px rgba(168, 85, 247, 0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
