/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'serif']
      },
      colors: {
        // Paleta inspirada en claqueta + neón de monitor de DIT
        ink: {
          50: '#f6f6f7',
          100: '#e2e3e6',
          200: '#c4c7cc',
          300: '#9aa0a8',
          400: '#6b727c',
          500: '#4a5159',
          600: '#363c43',
          700: '#272c32',
          800: '#1a1e23',
          900: '#0e1115',
          950: '#06080a'
        },
        amber: {
          arte: '#f5b400' // pantone "art dept yellow"
        }
      },
      boxShadow: {
        card: '0 1px 0 rgba(9, 30, 66, .25)',
        'card-hover': '0 4px 8px rgba(9, 30, 66, .25)',
        list: '0 1px 1px rgba(9, 30, 66, .25), 0 0 1px 1px rgba(9, 30, 66, .13)'
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'pop': 'pop 150ms ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(4px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        pop: {
          '0%': { transform: 'scale(.96)' },
          '100%': { transform: 'scale(1)' }
        }
      }
    }
  },
  plugins: []
};
