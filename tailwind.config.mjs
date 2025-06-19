import { join } from 'path';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    join(__dirname, 'src/**/*.{js,ts,jsx,tsx,mdx}'),
    join(__dirname, 'src/**/**/*.{js,ts,jsx,tsx,mdx}'),
    join(__dirname, 'src/**/**/**/*.{js,ts,jsx,tsx,mdx}'),
    join(__dirname, 'src/**/**/**/**/*.{js,ts,jsx,tsx,mdx}'),
    join(__dirname, 'src/**/**/**/**/**/*.{js,ts,jsx,tsx,mdx}'),
  ],
  theme: {
    extend: {
      // Configure modern fonts: Geist as primary, Geist Mono as secondary
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
    },
  },
  plugins: [],
}; 