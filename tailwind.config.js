/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        chicago: ['"Chicago"', 'system-ui', 'sans-serif'],
        mono: ['"Courier New"', 'Courier', 'monospace'],
      },
      colors: {
        ipod: {
          body: '#e8e6e1',
          silver: '#c8c5be',
          screen: '#f5f3ef',
          'screen-dark': '#2d2d2d',
          'screen-bg': '#d4dfe6',
          'menu-blue': '#3478f6',
          'menu-text': '#1a1a1a',
          wheel: '#f0eeea',
          'wheel-ring': '#d8d5d0',
          'wheel-center': '#e8e5e0',
        },
      },
      animation: {
        'slide-in-right': 'slideInRight 0.2s ease-out',
        'slide-in-left': 'slideInLeft 0.2s ease-out',
        'fade-in': 'fadeIn 0.15s ease-out',
      },
      keyframes: {
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
