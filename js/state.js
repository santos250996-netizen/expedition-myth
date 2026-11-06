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

// --- INVENTARIO DEL JUGADOR ---
// Cartas que el jugador posee (se llena al inicio con el mazo starter).
let ownedCardIds = [];

// Al cargar el juego, el jugador solo tiene las cartas del Capítulo 1.0.
function initOwnedCards() {
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
