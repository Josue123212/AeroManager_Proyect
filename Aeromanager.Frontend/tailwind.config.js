/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0052CC',
        'primary-dark': '#0043A8',
        surface: '#FFFFFF',
        background: '#F8FAFC',
        charcoal: '#18181B',
        'surface-container': '#F4F4F5'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    }
  },
  plugins: []
};
