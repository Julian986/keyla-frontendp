export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        scroll: "scroll var(--animation-duration, 120s) var(--animation-direction, forwards) linear infinite",
      },
      keyframes: {
        scroll: {
          to: {
            transform: "translate(calc(-100% - var(--gap,1rem)))", // Cambiado de 50% a 100%
          }
        }
      }
    }
  },
  plugins: [],
}
