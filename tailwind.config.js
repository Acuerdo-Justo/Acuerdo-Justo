/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#2657A7',
          light: '#E6F0FF',
          soft: '#F7F9FC',
        },
        accent: {
          DEFAULT: '#F26D8A',
          light: '#FFE6EC',
        },
        ink: {
          DEFAULT: '#1A2433',
          muted: '#4A5568',
          subtle: '#9CA3AF',
          line: '#E5E7EB',
        },
        success: '#28B463',
      },
      boxShadow: {
        professional: '0 18px 45px -28px rgba(26, 36, 51, 0.35)',
      },
    },
  },
  plugins: [],
};
