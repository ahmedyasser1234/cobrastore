/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        surface: '#F8FAFC',
        primary: {
          DEFAULT: '#22D3EE', // Cyan-400 (User's choice)
          dark: '#0891B2',
          light: '#67E8F9',
        },
        secondary: {
          DEFAULT: '#6366F1', // Indigo/Violet (goes well with white/blue)
          dark: '#4F46E5',
          light: '#A5B4FC',
        },
        text: {
          main: '#0F172A',
          muted: '#64748B',
        },
        border: '#E2E8F0',
      },
      fontFamily: {
        sans: ['Inter', 'IBM Plex Sans Arabic', 'sans-serif'],
      },
      borderRadius: {
        'cobra': '20px',
        'cobra-lg': '32px',
      },
      boxShadow: {
        'glow-primary': '0 10px 30px -10px rgba(34, 211, 238, 0.3)',
        'glow-secondary': '0 10px 30px -10px rgba(99, 102, 241, 0.2)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'cobra-gradient': 'linear-gradient(135deg, #22D3EE 0%, #6366F1 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'gradient-x': 'gradient-x 15s ease infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.6', filter: 'blur(20px)' },
          '50%': { opacity: '1', filter: 'blur(15px)' },
        },
        'gradient-x': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        }
      }
    },
  },
  plugins: [],
}
