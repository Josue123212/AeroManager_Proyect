import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    path.join(__dirname, 'index.html'),
    path.join(__dirname, 'src/**/*.{js,ts,jsx,tsx}')
  ],
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
