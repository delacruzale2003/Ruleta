/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'mont': ['Montserrat', 'sans-serif'],
        'narrow': ['BetterWith-Narrow', 'sans-serif'], // Clase font-narrow
        // Si quieres usar 'font-betterwith' en lugar de 'font-narrow', cambia 'narrow' por 'betterwith' aquí.
      },
      // === ANIMACIÓN DE FONDO ===
      keyframes: {
        'float-vertical': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' }, // Subir 8px
        },
      },
      animation: {
        'float-slow': 'float-vertical 6s ease-in-out infinite', // Aplicar la animación
      },
      // ==========================
    },
  },
  plugins: [],
}