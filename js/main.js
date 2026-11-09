// --- ARRANQUE Y NAVEGACIÓN ---
// Cambio de vistas, sincronización de controles e inicialización.

// --- NAVEGACIÓN ---
function switchView(viewId) {
    // FIX: al salir del combate hay que parar el timer y ocultar la pausa,
    // si no el juego seguía corriendo en segundo plano tras volver al menú.
    if (viewId !== 'view-game') {
        pauseGame();
        document.getElementById('pause-overlay').classList.add('hidden-view');
    }
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden-view'));
    document.getElementById(viewId).classList.remove('hidden-view');
    if (navigator.vibrate) navigator.vibrate(8);
    // Fondo de capítulo en cada cambio de pantalla: combate → capítulo
    // en juego; resto de UIs → capítulo más avanzado del jugador.
    updateGlobalBackground(viewId);
    if (viewId === 'view-home') updateHomeChapterLabel();
    if (viewId === 'view-game') resetMatch();
    if (viewId === 'view-chapters') renderChapterSelect();
    if (viewId === 'view-deckbuilder') { renderDeckEditor(); renderCollection(); }
    if (viewId === 'view-decks') document.getElementById('deck-count-label').innerText = playerDeck.length;

    // --- Ocultar botones globales ---
    // Perfil y Opciones solo en la home: la selección de capítulos y el
    // resto de pantallas quedan limpias.
    let topButtons = document.getElementById('global-top-buttons');
    if (topButtons) {
        topButtons.style.display = viewId === 'view-home' ? 'flex' : 'none';
    }

    // El nav inferior deja paso al footer de controles del combate
    // (pausa / velocidad / saltar): lo tapaba al compartir bottom-0 y z-40.
    let bottomNav = document.getElementById('bottom-nav');
    if (bottomNav) {
        bottomNav.style.display = viewId === 'view-game' ? 'none' : 'flex';
    }

    // --- Avanzar tutorial al entrar al deckbuilder ---
    if (viewId === 'view-deckbuilder' && tutorialActive && tutorialStep === 5) {
        setTutorialStep(6);
    }

    updateEventsButtonState();
}

// --- CONTROLES DE REPRODUCCIÓN (estado centralizado) ---
function syncControls() {
    document.getElementById('lbl-play-pause').innerText = gameState.isPlaying ? "PAUSA" : "SEGUIR";
    document.getElementById('icon-pause-game').className = gameState.isPlaying ? "fa-solid fa-pause text-sm" : "fa-solid fa-play text-sm";
}

// --- SERVICE WORKER (caché de la app e imágenes) ---
// Solo en contexto seguro (https o localhost); en file:// o visores
// embebidos se omite silenciosamente y el juego carga igual.
if ('serviceWorker' in navigator &&
    (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    });
}

// --- PRECARGA DE ARTE EN TIEMPO MUERTO (fluidez) ---
// Las artes van como background-image: el WebView no las decodifica hasta
// la primera pintura de cada carta, y eso mete un tirón justo al desplegar
// en pleno combate. Tras el primer render decodificamos todo el arte en
// segundo plano, en tandas pequeñas para no competir con la UI.
function preloadGameArt() {
    let urls = [];
    if (typeof ALL_CARDS !== 'undefined') ALL_CARDS.forEach(c => { if (c.art) urls.push(c.art); });
    if (typeof CHAPTERS !== 'undefined') CHAPTERS.forEach(ch => { if (ch.art) urls.push(ch.art); });
    let i = 0;
    let lote = () => {
        let fin = Math.min(i + 4, urls.length);
        for (; i < fin; i++) { new Image().src = urls[i]; }
        if (i < urls.length) {
            if (window.requestIdleCallback) requestIdleCallback(lote, { timeout: 2000 });
            else setTimeout(lote, 150);
        }
    };
    if (urls.length) lote();
}

window.onload = () => {
    initDevMode();

    // Cargar perfil y configuración
    loadProfile();
    renderProfile();
    checkNewVersion();
    updateEventsButtonState();

    // --- Cargar estado del tutorial ---
    let savedTutorial = safeStorageGet('nexo_tutorial_v1');
    if (savedTutorial === 'true') {
        tutorialActive = false;
    } else {
        tutorialActive = true;
        tutorialStep = 0;
    }

    // Cargar inventario de cartas guardado (si existe).
    let savedOwned = safeStorageGet('nexo_owned_cards');
    if (savedOwned) {
        try { ownedCardIds = JSON.parse(savedOwned); } catch(e) {}
    }
    if (!ownedCardIds || ownedCardIds.length === 0) {
        initOwnedCards(); // Inicializar con las cartas del tutorial
    }

    migrateCleanup();
    loadDeck();
    document.getElementById('deck-count-label').innerText = playerDeck.length;
    updateHUD();
    renderBoards();
    updateGlobalBackground('view-home');
    updateHomeChapterLabel();

    // Iniciar tutorial si es la primera vez
    if (tutorialActive) {
        setTimeout(() => startTutorial(), 500);
    }

    // Precarga del arte una vez pintada la home (no compite con el primer render)
    setTimeout(preloadGameArt, 250);

    // Modo dev: montar panel y barra de combate si está activo.
    if (isDevMode() && typeof mountDevUI === 'function') {
        mountDevUI();
    }
};

// --- BOTÓN ATRÁS DE ANDROID (CAPACITOR) ---
// Solo se ejecuta si la app está empaquetada con Capacitor
if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
    window.Capacitor.Plugins.App.addListener('backButton', () => {
        // Si NO estamos en el menú principal, volvemos a él
        let homeView = document.getElementById('view-home');
        if (homeView && !homeView.classList.contains('hidden-view')) {
            // Ya estamos en el inicio, salir de la app
            window.Capacitor.Plugins.App.exitApp();
        } else {
            // Estamos en otra vista, volver al inicio
            switchView('view-home');
        }
    });
}

// --- FEEDBACK TÁCTIL UNIFICADO ---
// Cualquier botón con .btn-base vibra ligeramente al tocarlo.
document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('touchstart', (e) => {
        let btn = e.target.closest('.btn-base');
        if (btn && navigator.vibrate) navigator.vibrate(8);
    }, { passive: true });
});
