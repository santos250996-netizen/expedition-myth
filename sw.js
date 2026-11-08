// --- SERVICE WORKER: CACHÉ DE LA APP Y SUS IMÁGENES ---
// Al instalarse precachea el shell completo (HTML, CSS, JS, manifest e
// icono) y TODAS las imágenes de cartas y capítulos. A partir de ahí:
//  - Navegaciones (index.html): red primero con reserva en caché, así las
//    actualizaciones llegan en cuanto hay red; sin red, abre igual.
//  - El resto (assets, CSS/JS versionados, fuentes CDN): stale-while-
//    revalidate: respuesta instantánea desde caché y refresco en segundo
//    plano. Reabrir el juego no vuelve a descargar ninguna imagen.
// Para publicar cambios: subir la versión de CACHE (y los ?v= del HTML).
const CACHE = 'nexo-v20261118g';

const PRECACHE = [
    './', './index.html', './manifest.json', './icon.svg',
    './css/styles.css?v=20261118g',
    './js/cards.js?v=20261118g',
    './js/state.js?v=20261118g',
    './js/fx.js?v=20261118g',
    './js/deck.js?v=20261118g',
    './js/chapters.js?v=20261118g',
    './js/patchnotes.js?v=20261118g',
    './js/ui.js?v=20261118g',
    './js/game.js?v=20261118g',
    './js/dev.js?v=20261118g',
    './js/main.js?v=20261118g',
    // Dependencias vendorizadas (antes CDN): Tailwind precompilado,
    // Font Awesome y Google Fonts. Sin ellas offline el juego perdería
    // estilos y tipografía.
    './css/vendor/tailwind.min.css?v=20261118g',
    './css/vendor/all.min.css',
    './css/webfonts/fa-solid-900.woff2',
    './css/webfonts/fa-regular-400.woff2',
    './css/webfonts/fa-brands-400.woff2',
    './css/webfonts/fa-v4compatibility.woff2',
    './css/fonts/orbitron-500.woff2',
    './css/fonts/orbitron-700.woff2',
    './css/fonts/orbitron-900.woff2',
    './css/fonts/rajdhani-500.woff2',
    './css/fonts/rajdhani-600.woff2',
    './css/fonts/rajdhani-700.woff2',
    // Artes de cartas
    './assets/cartas/carta-01-mortales-de-arcadia.webp',
    './assets/cartas/carta-02-satiro-de-los-bosques.webp',
    './assets/cartas/carta-03-asterion-el-minotauro.webp',
    './assets/cartas/carta-04-plegaria-arcana.webp',
    './assets/cartas/carta-05-niebla-del-caos.webp',
    './assets/cartas/carta-06-ninfas-de-las-fuentes-secas.webp',
    './assets/cartas/carta-07-jabali-de-erimanto.webp',
    './assets/cartas/carta-08-oraculo-ciego.webp',
    './assets/cartas/carta-09-pacto-de-sangre.webp',
    './assets/cartas/carta-10-ecos-de-dodona.webp',
    // Artes del mazo de Asterión (subhistoria)
    './assets/cartas/asterion-a2-enfurecido.webp',
    './assets/cartas/asterion-a3-senor-laberinto.webp',
    './assets/cartas/asterion-a4-toro-blanco.webp',
    './assets/cartas/asterion-a5-teseo-laberinto.webp',
    './assets/cartas/asterion-a6-pasifae.webp',
    './assets/cartas/asterion-a7-dedalo.webp',
    './assets/cartas/asterion-a8-vaca-madera.webp',
    './assets/cartas/asterion-a9-nacimiento-minotauro.webp',
    './assets/cartas/asterion-a10-construccion-laberinto.webp',
    './assets/cartas/asterion-a11-muerte-minotauro.webp',
    // Artes del mazo de Medusa (subhistoria; placeholders hasta tener arte)
    './assets/cartas/medusa-b0-serpientes-cabeza.webp',
    './assets/cartas/medusa-b1-doncella.webp',
    './assets/cartas/medusa-b2-gorgona.webp',
    './assets/cartas/medusa-b3-esteno.webp',
    './assets/cartas/medusa-b4-euriale.webp',
    './assets/cartas/medusa-b5-escudo-espejo.webp',
    './assets/cartas/medusa-b6-sandalias-aladas.webp',
    './assets/cartas/medusa-b7-casco-invisibilidad.webp',
    './assets/cartas/medusa-b8-pegaso.webp',
    './assets/cartas/medusa-b9-crisaor.webp',
    './assets/cartas/medusa-b10-mirada-piedra.webp',
    // Artes de capítulos
    './assets/capitulos/capitulo-01-el-despertar-en-la-helade.webp',
    './assets/capitulos/capitulo-1-3-el-eclipse-del-olimpo.webp'
];

self.addEventListener('install', (event) => {
    event.waitUntil((async () => {
        let cache = await caches.open(CACHE);
        // addAll es atómico: si un asset falla no se instala nada. Se
        // precachea uno a uno para que un solo fallo no tire la app.
        await Promise.all(PRECACHE.map(url => cache.add(url).catch(() => {})));
        await self.skipWaiting();
    })());
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        let names = await caches.keys();
        await Promise.all(names.filter(n => n !== CACHE).map(n => caches.delete(n)));
        await self.clients.claim();
    })());
});

self.addEventListener('fetch', (event) => {
    let req = event.request;
    if (req.method !== 'GET') return;

    // Navegación: red primero (llega la última versión), caché de reserva.
    if (req.mode === 'navigate') {
        event.respondWith((async () => {
            try {
                let fresh = await fetch(req);
                let cache = await caches.open(CACHE);
                cache.put(req, fresh.clone());
                return fresh;
            } catch (e) {
                let cached = await caches.match(req);
                return cached || caches.match('./index.html');
            }
        })());
        return;
    }

    // Resto: caché primero, refresco en segundo plano (SWR). Incluye los
    // CDN de Tailwind/Font Awesome/fuentes: respuestas opacas cacheables.
    event.respondWith((async () => {
        let cache = await caches.open(CACHE);
        let cached = await cache.match(req);
        let refresh = fetch(req).then(res => {
            if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
            return res;
        }).catch(() => {});
        return cached || refresh;
    })());
});
