/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#10B981',
          DEFAULT: '#059669',
          dark: '#047857',
        },
        secondary: {
          light: '#0EA5E9',
          DEFAULT: '#0284C7',
        },
        accent: {
          light: '#FBBF24',
          DEFAULT: '#F59E0B',
        },
        neutralCustom: {
          white: '#FFFFFF',
          bgLight: '#F8FAFC',
          borderLight: '#E2E8F0',
          textMuted: '#64748B',
          bgDark: '#0F172A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'Manrope', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
}
