/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'pm-dark': '#0B0B0D',
        'pm-ink': '#121216',
        'pm-wine': '#64253A',
        'pm-gold': '#C19A52',
        'pm-gold-light': '#E3C982',
        'pm-gold-deep': '#7B5921',
        'pm-ivory': '#F4EFE7',
        'pm-sand': '#DED3C3',
        'pm-off-white': '#F4EFE7',
      },
      fontFamily: {
        playfair: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        montserrat: ['"Manrope"', 'Arial', 'sans-serif'],
      },
      animation: {
        marquee: 'marquee 180s linear infinite',
        'marquee-slow': 'marquee var(--marquee-duration, 30s) linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        glow: 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px #C19A52, 0 0 10px #C19A52' },
          '50%': { boxShadow: '0 0 20px #C19A52, 0 0 30px #C19A52' },
        },
      },
    },
  },
  plugins: [],
};
