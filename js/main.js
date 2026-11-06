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

window.onload = () => {
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
};
