/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#3B82F6', // Medical blue
          secondary: '#10B981', // Success green
          accent: '#00BCD4', // Cyan
          dark: '#0A1929', // Main dark background
          'dark-card': '#112240', // Card background in dark mode
          'dark-border': '#1d3557', // Border in dark mode
        },
        // Flat names for the predefined widgets
        'brand-navy': '#0A1929',
        'brand-deepNavy': '#020C1B',
        'brand-tealDark': '#0D1F3D',
        'brand-tealMid': '#132F5C',
        'brand-tealLight': '#1E3A8A',
        'brand-accent': '#00BCD4', // Vibrant Cyan (match with rgba(0, 188, 212))
        'surface-border': '#1E293B',
        risk: {
          low: '#10B981', // Emerald Green
          moderate: '#F59E0B', // Amber Yellow
          critical: '#EF4444', // Red
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
