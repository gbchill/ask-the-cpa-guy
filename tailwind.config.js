/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#cd9f27', // Gold accent
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#475569', // Slate
          foreground: '#ffffff',
        },
        destructive: {
          DEFAULT: '#ef4444', // Red
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#383838', // Darker gray
          foreground: '#cdcdcd',
        },
        accent: {
          DEFAULT: '#333333', // Slightly lighter than background
          foreground: '#cd9f27',
        },
        background: {
          DEFAULT: '#212121', // Dark background
        },
        foreground: {
          DEFAULT: '#ffffff', // White text
        },
        card: {
          DEFAULT: '#2d2d2d', // Slightly lighter than background
          foreground: '#ffffff',
        },
        border: {
          DEFAULT: '#3d3d3d', // Border color
        },
      },
      boxShadow: {
        'gold': '0 0 10px rgba(205, 159, 39, 0.5)',
      },
    },
  },
  plugins: [],
};