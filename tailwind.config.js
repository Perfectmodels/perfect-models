/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'pm-dark': '#38152D',
        'pm-ink': '#251820',
        'pm-wine': '#7D1F4D',
        'pm-berry': '#A72B64',
        'pm-rose': '#E64C78',
        'pm-gold': '#F2A43A',
        'pm-gold-light': '#FFD082',
        'pm-gold-deep': '#9A5D1C',
        'pm-sun': '#FFC857',
        'pm-ivory': '#FFF8F1',
        'pm-sand': '#F3E5D7',
        'pm-off-white': '#FFFDF9',
        'pm-coral': '#F25F4B',
        'pm-coral-soft': '#FFB7A6',
        'pm-peach': '#FFD9C7',
        'pm-sage': '#D9EAD8',
        'pm-mint': '#BDE6D0',
        'pm-teal': '#147D75',
        'pm-sky': '#CFE7F5',
        'pm-lilac': '#E8D7F0',
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
          '0%, 100%': { boxShadow: '0 0 5px #F2A43A, 0 0 10px #F2A43A' },
          '50%': { boxShadow: '0 0 20px #F2A43A, 0 0 30px #F2A43A' },
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
