/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'pm-dark': '#111111',
        'pm-gold': '#D4AF37',
        'pm-off-white': '#f0f0f0',
      },
      fontFamily: {
        playfair: ['"Playfair Display"', 'serif'],
        montserrat: ['"Montserrat"', 'sans-serif'],
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
          '0%, 100%': { boxShadow: '0 0 5px #D4AF37, 0 0 10px #D4AF37' },
          '50%': { boxShadow: '0 0 20px #D4AF37, 0 0 30px #D4AF37' },
        },
      },
    },
  },
  plugins: [],
};
