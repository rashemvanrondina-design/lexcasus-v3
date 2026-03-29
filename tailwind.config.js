/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 🆕 Adding the Lex Casus Signature Palette
        brand: {
          dark: '#020617',    // Slate-950 (Your main background)
          card: '#0f172a',    // Slate-900 (Your card background)
          border: '#1e293b',  // Slate-800 (Your border color)
          primary: '#fbbf24', // Amber-400 (Your main accent)
          secondary: '#f59e0b',// Amber-500 (Your dark accent)
        }
      },
      fontFamily: {
        // Inter is the gold standard for SaaS dashboard readability
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        // 🆕 Adding a smooth fade-in for AI chat bubbles
        'fade-in': 'fadeIn 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};