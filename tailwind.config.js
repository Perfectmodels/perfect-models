/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'pm-dark': '#3E1930',
        'pm-ink': '#251B20',
        'pm-wine': '#7B2E4B',
        'pm-gold': '#E79C42',
        'pm-gold-light': '#F6C777',
        'pm-gold-deep': '#9A5D1C',
        'pm-ivory': '#FFF9F2',
        'pm-sand': '#F2E4D5',
        'pm-off-white': '#FFFDF9',
        'pm-coral': '#EF7054',
        'pm-coral-soft': '#F8B5A3',
        'pm-peach': '#FFD9C8',
        'pm-sage': '#DCE9DE',
        'pm-teal': '#2D756C',
        'pm-paper': '#FFFCF8',
      },
      fontFamily: {
        playfair: ['var(--font-pmm-display)', 'Georgia', 'serif'],
        montserrat: ['var(--font-pmm-sans)', 'Arial', 'sans-serif'],
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
