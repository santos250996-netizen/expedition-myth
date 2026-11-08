// --- ESTADO GLOBAL ---
// Única fuente de verdad de la partida y de la selección de mazo.
let playerDeck = [];
let draggedCardId = null;
let modalAutoPaused = false;
let gameState = {
    turn: 1,
    isPlaying: false,
    speed: 1,
    timer: null,
    justDeployed: [],
    fxQueue: [],
    deathQueue: [],
    p1: { score: 0, energy: 1, deckPointer: 0, activeBoard: [], lastPlayed: null, extraPoints: 0 },
    p2: { score: 0, energy: 1, deckPointer: 0, activeBoard: [], lastPlayed: null, extraPoints: 0 }
};

// --- MODO DESARROLLADOR (DEV) ---
// Activación: ?dev=1 en la URL escribe nexo_dev_mode=true y activa dev en
// esta sesión. ?dev=0 lo desactiva y borra el flag. El modo dev es un
// OVERRIDE EN MEMORIA: getCompletedChapters/getCompletedEvents/ownedCardIds
// devuelven datos ficticios sin tocar localStorage. Al desactivar, el
// jugador vuelve a su estado real guardado.
let devModeActive = false;

function initDevMode() {
    let params = new URLSearchParams(location.search);
    let q = params.get('dev');
    if (q === '1') {
        devModeActive = true;
        safeStorageSet('nexo_dev_mode', 'true');
    } else if (q === '0') {
        devModeActive = false;
        safeStorageSet('nexo_dev_mode', 'false');
    } else {
        devModeActive = safeStorageGet('nexo_dev_mode') === 'true';
    }
    return devModeActive;
}

function isDevMode() { return devModeActive === true; }

function setDevMode(on) {
    devModeActive = !!on;
    safeStorageSet('nexo_dev_mode', devModeActive ? 'true' : 'false');
}

// --- INVENTARIO DEL JUGADOR ---
// Cartas que el jugador posee (se llena al inicio con el mazo starter).
let ownedCardIds = [];

// Al cargar el juego, el jugador solo tiene las cartas del Capítulo 1.0.
// (En modo dev: todas las cartas del juego, solo en memoria.)
function initOwnedCards() {
    if (isDevMode()) {
        ownedCardIds = ALL_CARDS.map(c => c.id);
        return;
    }
    if (ownedCardIds.length === 0) {
        ownedCardIds = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10'];
    }
}

// --- PERFIL DEL JUGADOR ---
let playerProfile = {
    name: 'Invocador',
    avatarId: 'c1' // ID de la carta que se usa como avatar
};

// Cargar perfil guardado. "null" (tras Reiniciar Progreso) o un JSON
// roto dejan el perfil por defecto en pie.
function loadProfile() {
    let saved = safeStorageGet('nexo_profile_v1');
    if (saved) {
        try {
            let parsed = JSON.parse(saved);
            if (parsed) playerProfile = parsed;
        } catch(e) {}
    }
}

function saveProfile() {
    safeStorageSet('nexo_profile_v1', JSON.stringify(playerProfile));
}

// --- PROGRESO DE EVENTOS (subhistorias) ---
// Los eventos se guardan aparte de los capítulos de campaña: completar un
// evento no desbloquea capítulos y viceversa.
function getCompletedEvents() {
    if (isDevMode()) {
        return CHAPTERS.filter(c => c.isEvent).map(c => c.id);
    }
    let raw = safeStorageGet('nexo_events_v1');
    if (!raw) return [];
    try { return JSON.parse(raw); } catch(e) { return []; }
}

function isEventCompleted(id) { return getCompletedEvents().includes(id); }

function markEventCompleted(id) {
    let done = getCompletedEvents();
    if (!done.includes(id)) {
        done.push(id);
        safeStorageSet('nexo_events_v1', JSON.stringify(done));
    }
}

// --- MIGRACIÓN: limpieza de contenido eliminado ---
// El juego pasó de 4 capítulos + evento a solo Cap 1 + evento Asterión.
// Al cargar, se eliminan de localStorage los IDs de cartas y capítulos
// que ya no existen en ALL_CARDS / CHAPTERS, para que el jugador no vea
// huecos ni mazos con cartas fantasma.
function migrateCleanup() {
    // 1. Cartas poseídas: quitar las que ya no existen en ALL_CARDS.
    try {
        let rawOwned = safeStorageGet('nexo_owned_cards');
        if (rawOwned) {
            let owned = JSON.parse(rawOwned);
            if (Array.isArray(owned)) {
                let validIds = new Set(ALL_CARDS.map(c => c.id));
                let cleaned = owned.filter(id => validIds.has(id));
                if (cleaned.length !== owned.length) {
                    safeStorageSet('nexo_owned_cards', JSON.stringify(cleaned));
                }
            }
        }
    } catch(e) { console.error('migrateCleanup owned:', e); }

    // 2. Capítulos completados: quitar los que ya no existen en CHAPTERS.
    try {
        let rawCh = safeStorageGet('nexo_chapters_v1');
        if (rawCh) {
            let done = JSON.parse(rawCh);
            if (Array.isArray(done)) {
                let validCh = new Set(CHAPTERS.filter(c => !c.isEvent).map(c => c.id));
                let cleaned = done.filter(id => validCh.has(id));
                if (cleaned.length !== done.length) {
                    safeStorageSet('nexo_chapters_v1', JSON.stringify(cleaned));
                }
            }
        }
    } catch(e) { console.error('migrateCleanup chapters:', e); }

    // 3. Eventos completados: quitar los que ya no existen.
    try {
        let rawEv = safeStorageGet('nexo_events_v1');
        if (rawEv) {
            let done = JSON.parse(rawEv);
            if (Array.isArray(done)) {
                let validEv = new Set(CHAPTERS.filter(c => c.isEvent).map(c => c.id));
                let cleaned = done.filter(id => validEv.has(id));
                if (cleaned.length !== done.length) {
                    safeStorageSet('nexo_events_v1', JSON.stringify(cleaned));
                }
            }
        }
    } catch(e) { console.error('migrateCleanup events:', e); }

    // 4. Mazo guardado: loadDeck ya filtra por ownedCardIds, pero si el mazo
    // tenía cartas borradas y queda vacío, se reconstruye el starter.
    try {
        let rawDeck = safeStorageGet('nexo_deck_v1');
        if (rawDeck) {
            let savedIds = JSON.parse(rawDeck);
            if (Array.isArray(savedIds)) {
                let validIds = new Set(ALL_CARDS.map(c => c.id));
                let cleaned = savedIds.filter(id => validIds.has(id));
                if (cleaned.length !== savedIds.length) {
                    safeStorageSet('nexo_deck_v1', JSON.stringify(cleaned));
                }
            }
        }
    } catch(e) { console.error('migrateCleanup deck:', e); }
}

// --- VERSIÓN VISTA POR EL JUGADOR (para el banner de notas del parche) ---
function getLastSeenVersion() {
    return safeStorageGet('nexo_last_seen_version') || null;
}

function setLastSeenVersion(v) {
    if (!v) return;
    safeStorageSet('nexo_last_seen_version', v);
}

// --- MODO DEV: MAZOS DE BOTS EDITABLES ---
function getDevBotDecks() {
    let raw = safeStorageGet('nexo_dev_botdecks_v1');
    if (!raw) return {};
    try { return JSON.parse(raw) || {}; } catch(e) { return {}; }
}

function saveDevBotDecks(decks) {
    safeStorageSet('nexo_dev_botdecks_v1', JSON.stringify(decks));
}

let devSelectedBotDeck = null;
