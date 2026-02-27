/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'comic-cyan': '#00D9FF',
        'comic-pink': '#FF00FF',
        'comic-yellow': '#FFE500',
        'comic-green': '#00FF88',
        'comic-orange': '#FF6B00',
        'comic-purple': '#7B00FF',
        'comic-dark': '#0F0F23',
        'comic-darker': '#0A0A1A',
        'comic-surface': '#16162A',
        'comic-border': '#2A2A4A',
      },
      fontFamily: {
        'bangers': ['Bangers', 'cursive'],
        'comic': ['"Comic Neue"', 'cursive'],
      },
      boxShadow: {
        'brutal': '5px 5px 0px 0px #000000',
        'brutal-lg': '8px 8px 0px 0px #000000',
        'brutal-xl': '12px 12px 0px 0px #000000',
        'brutal-cyan': '5px 5px 0px 0px #00D9FF',
        'brutal-pink': '5px 5px 0px 0px #FF00FF',
        'brutal-yellow': '5px 5px 0px 0px #FFE500',
        'brutal-green': '5px 5px 0px 0px #00FF88',
        'glow-cyan': '0 0 20px rgba(0, 217, 255, 0.4), 0 0 60px rgba(0, 217, 255, 0.1)',
        'glow-pink': '0 0 20px rgba(255, 0, 255, 0.4), 0 0 60px rgba(255, 0, 255, 0.1)',
        'glow-yellow': '0 0 20px rgba(255, 229, 0, 0.4), 0 0 60px rgba(255, 229, 0, 0.1)',
        'neon': '0 0 5px theme(colors.comic-cyan), 0 0 20px theme(colors.comic-cyan)',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-fast': 'pulse 1s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 4s ease-in-out 1s infinite',
        'spin-slow': 'spin 20s linear infinite',
        'gradient-x': 'gradient-x 3s ease infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.5s ease-out',
        'slide-in-right': 'slide-in-right 0.5s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'blob': 'blob 7s infinite',
        'morph': 'morph 8s ease-in-out infinite',
        'typewriter': 'typewriter 2s steps(20) forwards',
        'border-dance': 'border-dance 4s linear infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-30px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(30px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 217, 255, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 217, 255, 0.6), 0 0 80px rgba(255, 0, 255, 0.3)' },
        },
        blob: {
          '0%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0, 0) scale(1)' },
        },
        morph: {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '50%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
        },
        'border-dance': {
          '0%, 100%': { clipPath: 'inset(0 0 95% 0)' },
          '25%': { clipPath: 'inset(0 95% 0 0)' },
          '50%': { clipPath: 'inset(95% 0 0 0)' },
          '75%': { clipPath: 'inset(0 0 0 95%)' },
        },
      },
      backgroundImage: {
        'comic-gradient': 'linear-gradient(135deg, #00D9FF 0%, #FF00FF 50%, #FFE500 100%)',
        'hero-gradient': 'linear-gradient(135deg, #0F0F23 0%, #16162A 50%, #1A1A3E 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(0, 217, 255, 0.05), rgba(255, 0, 255, 0.05))',
        'mesh-gradient': 'radial-gradient(at 40% 20%, rgba(0, 217, 255, 0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(255, 0, 255, 0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(0, 255, 136, 0.1) 0px, transparent 50%)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
