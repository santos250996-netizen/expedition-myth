// --- SERVICE WORKER: CACHÉ DE LA APP Y SUS IMÁGENES ---
// Al instalarse precachea el shell completo (HTML, CSS, JS, manifest e
// icono) y TODAS las imágenes de cartas y capítulos. A partir de ahí:
//  - Navegaciones (index.html): red primero con reserva en caché, así las
//    actualizaciones llegan en cuanto hay red; sin red, abre igual.
//  - El resto (assets, CSS/JS versionados, fuentes CDN): stale-while-
//    revalidate: respuesta instantánea desde caché y refresco en segundo
//    plano. Reabrir el juego no vuelve a descargar ninguna imagen.
// Para publicar cambios: subir la versión de CACHE (y los ?v= del HTML).
const CACHE = 'nexo-v20261106o';

const PRECACHE = [
    './', './index.html', './manifest.json', './icon.svg',
    './css/styles.css?v=20261106o',
    './js/cards.js?v=20261106o',
    './js/state.js?v=20261106o',
    './js/fx.js?v=20261106o',
    './js/deck.js?v=20261106o',
    './js/chapters.js?v=20261106o',
    './js/ui.js?v=20261106o',
    './js/game.js?v=20261106o',
    './js/main.js?v=20261106o',
    // Dependencias vendorizadas (antes CDN): Tailwind, Font Awesome y
    // Google Fonts. Sin ellas offline el juego perdería estilos y tipografía.
    './js/vendor/tailwindcdn.js?v=20261106o',
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
    './assets/cartas/carta-01-mortal-de-arcadia.webp',
    './assets/cartas/carta-02-satiro-de-los-bosques.webp',
    './assets/cartas/carta-03-minotauro-joven.webp',
    './assets/cartas/carta-04-plegaria-arcana.webp',
    './assets/cartas/carta-05-niebla-del-caos.webp',
    './assets/cartas/carta-06-lamento-fuente-seca.webp',
    './assets/cartas/carta-07-embestida-de-erimanto.webp',
    './assets/cartas/carta-08-oraculo-ciego.webp',
    './assets/cartas/carta-09-pacto-de-sangre.webp',
    './assets/cartas/carta-10-ecos-de-dodona.webp',
    './assets/cartas/carta-11-acechador-de-los-matorrales.webp',
    './assets/cartas/carta-12-despertar-del-titan-menor.webp',
    './assets/cartas/carta-13-disputa-del-territorio.webp',
    './assets/cartas/carta-14-canto-embrujado-hondonada.webp',
    './assets/cartas/carta-15-guardian-fuego-sagrado.webp',
    './assets/cartas/carta-16-sombra-en-el-pozo.webp',
    './assets/cartas/carta-17-saqueo-antorcha.webp',
    './assets/cartas/carta-18-centinela-del-barranco.webp',
    './assets/cartas/carta-19-derrumbe-rocas-sagradas.webp',
    './assets/cartas/carta-20-profecia-sangre-derramada.webp',
    './assets/cartas/carta-21-juramento-lanzas-bronce.webp',
    './assets/cartas/carta-22-forjador-yunque-oculto.webp',
    './assets/cartas/carta-23-ofrenda-hecatombe.webp',
    './assets/cartas/carta-24-coloso-grieta-profunda.webp',
    './assets/cartas/carta-25-ira-cielo-abierto.webp',
    './assets/cartas/carta-26-cazador-bestias-colinas.webp',
    './assets/cartas/carta-27-juicio-rayo-caido.webp',
    './assets/cartas/carta-28-vigia-muralla-ciclopea.webp',
    './assets/cartas/carta-29-temblor-raices-ocultas.webp',
    './assets/cartas/carta-30-despertar-heroe-bronce.webp',
    './assets/cartas/carta-31-campeon-eclipse.webp',
    './assets/cartas/carta-32-guardian-templo-delfos.webp',
    './assets/cartas/carta-33-vidente-ciego-arcadia.webp',
    './assets/cartas/carta-34-coloso-bronce-olvidado.webp',
    './assets/cartas/carta-35-heraldo-dioses.webp',
    './assets/cartas/carta-36-eclipse-zeus.webp',
    './assets/cartas/carta-37-bendicion-atenea.webp',
    './assets/cartas/carta-38-juicio-hades.webp',
    './assets/cartas/carta-39-colera-ares.webp',
    './assets/cartas/carta-40-traicion-hermes.webp',
    // Artes de capítulos
    './assets/capitulos/capitulo-01-el-despertar-en-la-helade.webp',
    './assets/capitulos/capitulo-1-1-las-grietas-de-la-discordia.webp',
    './assets/capitulos/capitulo-1-2-el-veredicto-de-la-sangre-y-el-bronce.webp',
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
