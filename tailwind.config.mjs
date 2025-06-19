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
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
    },
  },
  plugins: [],
}; 