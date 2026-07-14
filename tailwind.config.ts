import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        tea: {
          ink: '#10251f',
          leaf: '#1f7a4d',
          spring: '#8dcf76',
          mist: '#edf7ef',
          clay: '#c77943',
          gold: '#d8a94f',
          sky: '#61b3c7',
        },
      },
      boxShadow: {
        soft: '0 24px 80px rgba(16, 37, 31, 0.12)',
        glow: '0 18px 60px rgba(97, 179, 199, 0.24)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Microsoft YaHei UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
