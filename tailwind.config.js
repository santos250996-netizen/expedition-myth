// Configuración de Tailwind para el build estático.
// Sustituye al runtime js/vendor/tailwindcdn.js (Play CDN), que compilaba
// estilos en el navegador con cada mutación del DOM: 451 KB de JS y jank.
// Escanea el HTML y todos los JS porque las vistas de cartas/mazos se
// construyen con template literals.
module.exports = {
    content: ['./index.html', './js/**/*.js'],
    theme: {
        extend: {}
    },
    plugins: []
};
