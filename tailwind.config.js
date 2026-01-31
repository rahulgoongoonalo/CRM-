/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#5B0EB6',
          secondary: '#8015D5',
          accent: '#A429D3',
          highlight: '#CB28E9',
        },
        surface: {
          DEFAULT: '#0F0B1A',
          light: '#1A1625',
          lighter: '#25202F',
          card: '#1E1A2B',
        },
        border: {
          DEFAULT: '#2D2738',
          light: '#3A3345',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#B8B3C3',
          muted: '#726D7E',
        },
      },
      fontFamily: {
        sans: ['Grift', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontWeight: {
        light: '300',
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
      },
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
}
