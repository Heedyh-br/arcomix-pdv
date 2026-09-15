/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Painel escuro (identidade da marca / área de destaque)
        night: {
          DEFAULT: '#16211C',
          soft: '#1E2B24',
        },
        // Superfície clara onde o operador interage (formulário)
        paper: '#ECE7DC',
        // Verde "hortifruti" — única cor de ação primária
        market: {
          DEFAULT: '#3F8F5F',
          dark: '#2E6D46',
        },
        // Alerta / erro
        brick: '#C4463A',
        ink: '#20261F',
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
