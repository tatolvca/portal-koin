/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter, "Inter")', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        // Koin brand (header dark + green accent)
        koin: {
          header: '#0f1214',
          headerBorder: 'rgba(255,255,255,0.08)',
          green: '#00A343',
          'green-hover': '#008f3a',
          'green-muted': 'rgba(0, 163, 67, 0.15)',
        },
        // Untitled UI brand (purple) — fallback for non-header
        brand: {
          25: 'rgb(252 250 255)',
          50: 'rgb(249 245 255)',
          100: 'rgb(244 235 255)',
          200: 'rgb(233 215 254)',
          300: 'rgb(214 187 251)',
          400: 'rgb(182 146 246)',
          500: 'rgb(158 119 237)',
          600: 'rgb(127 86 217)',
          700: 'rgb(105 65 198)',
          800: 'rgb(83 56 158)',
          900: 'rgb(66 48 125)',
          950: 'rgb(44 28 95)',
        },
        // Gray-neutral (Untitled UI)
        'gray-neutral': {
          50: 'rgb(249 250 251)',
          100: 'rgb(243 244 246)',
          200: 'rgb(229 231 235)',
          300: 'rgb(210 214 219)',
          400: 'rgb(157 164 174)',
          500: 'rgb(108 115 127)',
          600: 'rgb(77 87 97)',
          700: 'rgb(56 66 80)',
          800: 'rgb(31 42 55)',
          900: 'rgb(17 25 39)',
          950: 'rgb(13 18 28)',
        },
      },
      borderRadius: {
        'untitled-xs': '0.125rem',
        'untitled-sm': '0.25rem',
        'untitled-md': '0.375rem',
        'untitled-lg': '0.5rem',
        'untitled-xl': '0.75rem',
        'untitled-2xl': '1rem',
        'untitled-3xl': '1.5rem',
      },
      boxShadow: {
        'untitled-xs': '0px 1px 2px rgba(10, 13, 18, 0.05)',
        'untitled-sm': '0px 1px 3px rgba(10, 13, 18, 0.1), 0px 1px 2px -1px rgba(10, 13, 18, 0.1)',
        'untitled-md': '0px 4px 6px -1px rgba(10, 13, 18, 0.1), 0px 2px 4px -2px rgba(10, 13, 18, 0.06)',
        'untitled-lg': '0px 12px 16px -4px rgba(10, 13, 18, 0.08), 0px 4px 6px -2px rgba(10, 13, 18, 0.03)',
        'untitled-xl': '0px 20px 24px -4px rgba(10, 13, 18, 0.08), 0px 8px 8px -4px rgba(10, 13, 18, 0.03)',
      },
    },
  },
  plugins: [],
}
