/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'pm-dark': '#050505',
        'pm-ink': '#0B0B0B',
        'pm-wine': '#0B0B0B',
        'pm-berry': '#171717',
        'pm-rose': '#C6A15B',
        'pm-gold': '#C6A15B',
        'pm-gold-light': '#D8C28D',
        'pm-gold-deep': '#8A6F3B',
        'pm-sun': '#C6A15B',
        'pm-ivory': '#F7F5EF',
        'pm-sand': '#ECE8DE',
        'pm-off-white': '#FFFFFF',
        'pm-coral': '#C6A15B',
        'pm-coral-soft': '#E8DFC9',
        'pm-peach': '#F2EEE4',
        'pm-sage': '#E8E6DF',
        'pm-mint': '#EFECE4',
        'pm-teal': '#111111',
        'pm-sky': '#F1EFE9',
        'pm-lilac': '#ECE8DE',
        'pm-paper': '#FBFAF6',
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
        float: 'float 8s ease-in-out infinite',
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
          '0%, 100%': { boxShadow: '0 0 5px #C6A15B, 0 0 10px #C6A15B' },
          '50%': { boxShadow: '0 0 20px #C6A15B, 0 0 30px #C6A15B' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
