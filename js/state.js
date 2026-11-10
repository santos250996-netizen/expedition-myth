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

    // 4. Mazo guardado: loadDeck ya normaliza y filtra, pero si el mazo
    // tenía cartas borradas y queda vacío, se reconstruye el starter.
    // SISTEMA DE FAMILIAS: los familyId ('asterion', 'dedalo') también son
    // entradas válidas del mazo.
    try {
        let rawDeck = safeStorageGet('nexo_deck_v1');
        if (rawDeck) {
            let savedIds = JSON.parse(rawDeck);
            if (Array.isArray(savedIds)) {
                let validIds = new Set([...ALL_CARDS.map(c => c.id), ...Object.keys(CARD_FAMILIES)]);
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

// --- SISTEMA DE FAMILIAS ---
// Cada familia agrupa formas de una misma carta (base + desbloqueables).
// El mazo guarda el familyId; el motor juega la forma marcada.
const CARD_FAMILIES = {
    asterion: {
        id: 'asterion',
        name: 'Asterión',
        forms: ['c3', 'a2', 'a3']
    },
    dedalo: {
        id: 'dedalo',
        name: 'Dédalo',
        forms: ['a7', 'a10', 'talos']
    },
    mortales: {
        id: 'mortales',
        name: 'Mortales de Arcadia',
        forms: ['c1', 'fuego', 'muros']
    },
    satiro: {
        id: 'satiro',
        name: 'Satiro de los Bosques',
        forms: ['c2', 'sat_cortejo', 'sat_pan']
    },
    plegaria: {
        id: 'plegaria',
        name: 'Plegaria Arcana',
        forms: ['c4', 'altar_zeus', 'tocado_rayo']
    },
    niebla: {
        id: 'niebla',
        name: 'Niebla del Caos',
        forms: ['c5', 'sombra_niebla', 'espectro_niebla']
    },
    ninfas: {
        id: 'ninfas',
        name: 'Ninfas de las Fuentes Secas',
        forms: ['c6', 'canto_fuente', 'ninfa_ahogada']
    },
    jabali: {
        id: 'jabali',
        name: 'Jabalí de Erimanto',
        forms: ['c7', 'jabali_capturado', 'colmillos_jabali']
    },
    oraculo: {
        id: 'oraculo',
        name: 'Oráculo Ciego',
        forms: ['c8', 'juicio_tiresias', 'vara_tiresias']
    },
    pacto: {
        id: 'pacto',
        name: 'Pacto de Sangre',
        forms: ['c9', 'ofrenda_hades', 'deuda_sangre']
    },
    dodona: {
        id: 'dodona',
        name: 'Ecos del Bosque de Dodona',
        forms: ['c10', 'roble_dodona', 'palomas_dodona']
    }
};

const CARD_MISSIONS = {
    // Familia asterion
    a2: {
        type: 'games_with', count: 10, previousCardId: 'c3',
        familyId: 'asterion', formIndex: 1,
        description: 'Juega a Asterion, el Minotauro en 10 partidas distintas.'
    },
    a2_2: {
        type: 'kills_with', count: 5, previousCardId: 'c3',
        familyId: 'asterion', formIndex: 1,
        description: 'Destruye 5 Seres rivales con Asterion, el Minotauro en el tablero.'
    },
    a3: {
        type: 'games_with', count: 15, previousCardId: 'c3',
        familyId: 'asterion', formIndex: 2,
        description: 'Juega a Asterion, el Minotauro en 15 partidas distintas.'
    },
    a3_2: {
        type: 'kills_with', count: 10, previousCardId: 'c3',
        familyId: 'asterion', formIndex: 2,
        description: 'Destruye 10 Seres rivales con Asterion, el Minotauro en el tablero.'
    },
    a3_3: {
        type: 'kills_with', count: 10, previousCardId: 'a2',
        familyId: 'asterion', formIndex: 2,
        description: 'Destruye 10 Seres rivales con Asterion, Enfurecido en el tablero.'
    },
    a3_4: {
        type: 'exilio_received', count: 2, previousCardId: 'a2',
        familyId: 'asterion', formIndex: 2,
        description: 'Recibe Exilio con Asterion, Enfurecido en el tablero.'
    },

    // Familia dedalo
    a10: {
        type: 'games_with', count: 10, previousCardId: 'a7',
        familyId: 'dedalo', formIndex: 1,
        description: 'Juega a Dedalo, el Arquitecto en 10 partidas distintas.'
    },
    a10_2: {
        type: 'invoke_with', count: 5, previousCardId: 'a7',
        familyId: 'dedalo', formIndex: 1,
        description: 'Invoca 5 Vacas de Madera Hueca con Dedalo, el Arquitecto en el tablero.'
    },
    talos: {
        type: 'games_with', count: 15, previousCardId: 'a7',
        familyId: 'dedalo', formIndex: 2,
        description: 'Juega a Dedalo, el Arquitecto en 15 partidas distintas.'
    },
    talos_2: {
        type: 'invoke_with', count: 10, previousCardId: 'a7',
        familyId: 'dedalo', formIndex: 2,
        description: 'Invoca 10 Vacas de Madera Hueca con Dedalo, el Arquitecto en el tablero.'
    },
    talos_3: {
        type: 'exile_with', count: 3, previousCardId: 'a10',
        familyId: 'dedalo', formIndex: 2,
        description: 'Exilia 3 Seres rivales con El Laberinto de Creta.'
    },
    talos_4: {
        type: 'wins', count: 5, previousCardId: 'a10',
        familyId: 'dedalo', formIndex: 2,
        description: 'Gana 5 combates con El Laberinto de Creta en el mazo.'
    },

    // Familia mortales
    fuego: {
        type: 'games_with', count: 10, previousCardId: 'c1',
        familyId: 'mortales', formIndex: 1,
        description: 'Juega a Mortales de Arcadia en 10 partidas distintas.'
    },
    fuego_2: {
        type: 'wins', count: 5, previousCardId: 'c1',
        familyId: 'mortales', formIndex: 1,
        description: 'Gana 5 combates con Mortales de Arcadia en el tablero.'
    },
    muros: {
        type: 'games_with', count: 15, previousCardId: 'c1',
        familyId: 'mortales', formIndex: 2,
        description: 'Juega a Mortales de Arcadia en 15 partidas distintas.'
    },
    muros_2: {
        type: 'wins', count: 10, previousCardId: 'c1',
        familyId: 'mortales', formIndex: 2,
        description: 'Gana 10 combates con Mortales de Arcadia en el tablero.'
    },
    muros_3: {
        type: 'fortalecer_with', count: 10, previousCardId: 'fuego',
        familyId: 'mortales', formIndex: 2,
        description: 'Da 10 de Fortalecer con Mortales del Fuego en el tablero.'
    },
    muros_4: {
        type: 'wins', count: 5, previousCardId: 'fuego',
        familyId: 'mortales', formIndex: 2,
        description: 'Gana 5 combates con Mortales del Fuego en el tablero.'
    },

    // Familia satiro
    sat_cortejo: {
        type: 'games_with', count: 10, previousCardId: 'c2',
        familyId: 'satiro', formIndex: 1,
        description: 'Juega a Satiro de los Bosques en 10 partidas distintas.'
    },
    sat_cortejo_2: {
        type: 'fortalecer_with', count: 10, previousCardId: 'c2',
        familyId: 'satiro', formIndex: 1,
        description: 'Da 10 de Fortalecer con Satiro de los Bosques en el tablero.'
    },
    sat_pan: {
        type: 'games_with', count: 15, previousCardId: 'c2',
        familyId: 'satiro', formIndex: 2,
        description: 'Juega a Satiro de los Bosques en 15 partidas distintas.'
    },
    sat_pan_2: {
        type: 'fortalecer_with', count: 20, previousCardId: 'c2',
        familyId: 'satiro', formIndex: 2,
        description: 'Da 20 de Fortalecer con Satiro de los Bosques en el tablero.'
    },
    sat_pan_3: {
        type: 'fortalecer_with', count: 15, previousCardId: 'sat_cortejo',
        familyId: 'satiro', formIndex: 2,
        description: 'Da 15 de Fortalecer con Satiro del Cortejo en el tablero.'
    },
    sat_pan_4: {
        type: 'wins', count: 5, previousCardId: 'sat_cortejo',
        familyId: 'satiro', formIndex: 2,
        description: 'Gana 5 combates con Satiro del Cortejo en el tablero.'
    },

    // Familia c4
    altar_zeus: {
        type: 'games_with', count: 10, previousCardId: 'c4',
        familyId: 'plegaria', formIndex: 1,
        description: 'Juega a Plegaria Arcana en 10 partidas distintas.'
    },
    altar_zeus_2: {
        type: 'glory_with', count: 20, previousCardId: 'c4',
        familyId: 'plegaria', formIndex: 1,
        description: 'Suma 20 Gloria con Plegaria Arcana en el mazo.'
    },
    tocado_rayo: {
        type: 'games_with', count: 15, previousCardId: 'c4',
        familyId: 'plegaria', formIndex: 2,
        description: 'Juega a Plegaria Arcana en 15 partidas distintas.'
    },
    tocado_rayo_2: {
        type: 'glory_with', count: 40, previousCardId: 'c4',
        familyId: 'plegaria', formIndex: 2,
        description: 'Suma 40 Gloria con Plegaria Arcana en el mazo.'
    },
    tocado_rayo_3: {
        type: 'fortalecer_with', count: 10, previousCardId: 'altar_zeus',
        familyId: 'plegaria', formIndex: 2,
        description: 'Da 10 de Fortalecer con El Altar de Zeus en el mazo.'
    },
    tocado_rayo_4: {
        type: 'wins', count: 5, previousCardId: 'altar_zeus',
        familyId: 'plegaria', formIndex: 2,
        description: 'Gana 5 combates con El Altar de Zeus en el mazo.'
    },

    // Familia niebla
    sombra_niebla: {
        type: 'games_with', count: 10, previousCardId: 'c5',
        familyId: 'niebla', formIndex: 1,
        description: 'Juega a Niebla del Caos en 10 partidas distintas.'
    },
    sombra_niebla_2: {
        type: 'wins', count: 5, previousCardId: 'c5',
        familyId: 'niebla', formIndex: 1,
        description: 'Gana 5 combates con Niebla del Caos en el mazo.'
    },
    espectro_niebla: {
        type: 'games_with', count: 15, previousCardId: 'c5',
        familyId: 'niebla', formIndex: 2,
        description: 'Juega a Niebla del Caos en 15 partidas distintas.'
    },
    espectro_niebla_2: {
        type: 'wins', count: 10, previousCardId: 'c5',
        familyId: 'niebla', formIndex: 2,
        description: 'Gana 10 combates con Niebla del Caos en el mazo.'
    },
    espectro_niebla_3: {
        type: 'exile_with', count: 3, previousCardId: 'sombra_niebla',
        familyId: 'niebla', formIndex: 2,
        description: 'Exilia 3 Seres rivales con La Sombra en la Niebla en el tablero.'
    },
    espectro_niebla_4: {
        type: 'wins', count: 5, previousCardId: 'sombra_niebla',
        familyId: 'niebla', formIndex: 2,
        description: 'Gana 5 combates con La Sombra en la Niebla en el tablero.'
    },

    // Familia ninfas
    canto_fuente: {
        type: 'games_with', count: 10, previousCardId: 'c6',
        familyId: 'ninfas', formIndex: 1,
        description: 'Juega a Ninfas de las Fuentes Secas en 10 partidas distintas.'
    },
    canto_fuente_2: {
        type: 'glory_with', count: 10, previousCardId: 'c6',
        familyId: 'ninfas', formIndex: 1,
        description: 'Suma 10 Gloria con Ninfas de las Fuentes Secas en el mazo.'
    },
    ninfa_ahogada: {
        type: 'games_with', count: 15, previousCardId: 'c6',
        familyId: 'ninfas', formIndex: 2,
        description: 'Juega a Ninfas de las Fuentes Secas en 15 partidas distintas.'
    },
    ninfa_ahogada_2: {
        type: 'glory_with', count: 20, previousCardId: 'c6',
        familyId: 'ninfas', formIndex: 2,
        description: 'Suma 20 Gloria con Ninfas de las Fuentes Secas en el mazo.'
    },
    ninfa_ahogada_3: {
        type: 'games_with', count: 10, previousCardId: 'canto_fuente',
        familyId: 'ninfas', formIndex: 2,
        description: 'Juega a El Canto de la Fuente en 10 partidas distintas.'
    },
    ninfa_ahogada_4: {
        type: 'wins', count: 5, previousCardId: 'canto_fuente',
        familyId: 'ninfas', formIndex: 2,
        description: 'Gana 5 combates con El Canto de la Fuente en el mazo.'
    },

    // Familia jabali
    jabali_capturado: {
        type: 'games_with', count: 10, previousCardId: 'c7',
        familyId: 'jabali', formIndex: 1,
        description: 'Juega a Jabalí de Erimanto en 10 partidas distintas.'
    },
    jabali_capturado_2: {
        type: 'games_with_both', count: 5, previousCardId: 'c7',
        secondCardId: 'e3',
        familyId: 'jabali', formIndex: 1,
        description: 'Juega a Jabalí de Erimanto y Heracles, el Héroe en la misma partida 5 veces.'
    },
    colmillos_jabali: {
        type: 'games_with', count: 15, previousCardId: 'c7',
        familyId: 'jabali', formIndex: 2,
        description: 'Juega a Jabalí de Erimanto en 15 partidas distintas.'
    },
    colmillos_jabali_2: {
        type: 'kills_with', count: 10, previousCardId: 'c7',
        familyId: 'jabali', formIndex: 2,
        description: 'Destruye 10 Seres rivales con Jabalí de Erimanto en el tablero.'
    },
    colmillos_jabali_3: {
        type: 'kills_with', count: 5, previousCardId: 'jabali_capturado',
        familyId: 'jabali', formIndex: 2,
        description: 'Destruye 5 Seres rivales con El Jabalí Capturado en el tablero.'
    },
    colmillos_jabali_4: {
        type: 'wins', count: 5, previousCardId: 'jabali_capturado',
        familyId: 'jabali', formIndex: 2,
        description: 'Gana 5 combates con El Jabalí Capturado en el tablero.'
    },

    // Familia oraculo
    juicio_tiresias: {
        type: 'games_with', count: 10, previousCardId: 'c8',
        familyId: 'oraculo', formIndex: 1,
        description: 'Juega a Oráculo Ciego en 10 partidas distintas.'
    },
    juicio_tiresias_2: {
        type: 'exile_with', count: 3, previousCardId: 'c8',
        familyId: 'oraculo', formIndex: 1,
        description: 'Exilia 3 Seres rivales con Oráculo Ciego en el tablero.'
    },
    vara_tiresias: {
        type: 'games_with', count: 15, previousCardId: 'c8',
        familyId: 'oraculo', formIndex: 2,
        description: 'Juega a Oráculo Ciego en 15 partidas distintas.'
    },
    vara_tiresias_2: {
        type: 'exile_with', count: 5, previousCardId: 'c8',
        familyId: 'oraculo', formIndex: 2,
        description: 'Exilia 5 Seres rivales con Oráculo Ciego en el tablero.'
    },
    vara_tiresias_3: {
        type: 'wins', count: 5, previousCardId: 'juicio_tiresias',
        familyId: 'oraculo', formIndex: 2,
        description: 'Gana 5 combates con El Juicio de Tiresias en el tablero.'
    },
    vara_tiresias_4: {
        type: 'kills_with', count: 5, previousCardId: 'juicio_tiresias',
        familyId: 'oraculo', formIndex: 2,
        description: 'Destruye 5 Seres rivales con El Juicio de Tiresias en el tablero.'
    },

    // Familia pacto
    ofrenda_hades: {
        type: 'games_with', count: 10, previousCardId: 'c9',
        familyId: 'pacto', formIndex: 1,
        description: 'Juega a Pacto de Sangre en el Altar de Piedra en 10 partidas distintas.'
    },
    ofrenda_hades_2: {
        type: 'wins', count: 5, previousCardId: 'c9',
        familyId: 'pacto', formIndex: 1,
        description: 'Gana 5 combates con Pacto de Sangre en el Altar de Piedra en el mazo.'
    },
    deuda_sangre: {
        type: 'games_with', count: 15, previousCardId: 'c9',
        familyId: 'pacto', formIndex: 2,
        description: 'Juega a Pacto de Sangre en el Altar de Piedra en 15 partidas distintas.'
    },
    deuda_sangre_2: {
        type: 'wins', count: 10, previousCardId: 'c9',
        familyId: 'pacto', formIndex: 2,
        description: 'Gana 10 combates con Pacto de Sangre en el Altar de Piedra en el mazo.'
    },
    deuda_sangre_3: {
        type: 'games_with', count: 10, previousCardId: 'ofrenda_hades',
        familyId: 'pacto', formIndex: 2,
        description: 'Juega a La Ofrenda a Hades en 10 partidas distintas.'
    },
    deuda_sangre_4: {
        type: 'wins', count: 5, previousCardId: 'ofrenda_hades',
        familyId: 'pacto', formIndex: 2,
        description: 'Gana 5 combates con La Ofrenda a Hades en el mazo.'
    },

    // Familia dodona
    roble_dodona: {
        type: 'games_with', count: 10, previousCardId: 'c10',
        familyId: 'dodona', formIndex: 1,
        description: 'Juega a Ecos del Bosque de Dodona en 10 partidas distintas.'
    },
    roble_dodona_2: {
        type: 'wins', count: 5, previousCardId: 'c10',
        familyId: 'dodona', formIndex: 1,
        description: 'Gana 5 combates con Ecos del Bosque de Dodona en el mazo.'
    },
    palomas_dodona: {
        type: 'games_with', count: 15, previousCardId: 'c10',
        familyId: 'dodona', formIndex: 2,
        description: 'Juega a Ecos del Bosque de Dodona en 15 partidas distintas.'
    },
    palomas_dodona_2: {
        type: 'wins', count: 10, previousCardId: 'c10',
        familyId: 'dodona', formIndex: 2,
        description: 'Gana 10 combates con Ecos del Bosque de Dodona en el mazo.'
    },
    palomas_dodona_3: {
        type: 'games_with', count: 10, previousCardId: 'roble_dodona',
        familyId: 'dodona', formIndex: 2,
        description: 'Juega a El Roble de Dodona en 10 partidas distintas.'
    },
    palomas_dodona_4: {
        type: 'wins', count: 5, previousCardId: 'roble_dodona',
        familyId: 'dodona', formIndex: 2,
        description: 'Gana 5 combates con El Roble de Dodona en el tablero.'
    }
};

// Formas desbloqueadas: { [familyId]: [formId, ...] }. La forma base siempre
// cuenta como desbloqueada. MIGRACIÓN: si nunca se guardó, se reconstruye
// desde ownedCardIds (el sistema anterior desbloqueaba fases añadiéndolas ahí).
function getUnlockedForms() {
    let raw = safeStorageGet('nexo_unlocked_forms_v1');
    if (!raw) {
        let migrated = {};
        let changed = false;
        for (let familyId in CARD_FAMILIES) {
            migrated[familyId] = [CARD_FAMILIES[familyId].forms[0]];
            CARD_FAMILIES[familyId].forms.forEach(formId => {
                if (formId !== CARD_FAMILIES[familyId].forms[0] && ownedCardIds.includes(formId)) {
                    migrated[familyId].push(formId);
                    changed = true;
                }
            });
        }
        if (changed) saveUnlockedForms(migrated);
        return migrated;
    }
    try { return JSON.parse(raw) || {}; } catch(e) { return {}; }
}
function saveUnlockedForms(forms) { safeStorageSet('nexo_unlocked_forms_v1', JSON.stringify(forms)); }

function isFormUnlocked(familyId, formId) {
    let unlocked = getUnlockedForms();
    let forms = unlocked[familyId] || [CARD_FAMILIES[familyId].forms[0]];
    return forms.includes(formId);
}

function unlockForm(familyId, formId) {
    let unlocked = getUnlockedForms();
    if (!unlocked[familyId]) unlocked[familyId] = [CARD_FAMILIES[familyId].forms[0]];
    if (!unlocked[familyId].includes(formId)) {
        unlocked[familyId].push(formId);
        saveUnlockedForms(unlocked);
    }
}

// Forma marcada por familia: { [familyId]: formId }. MIGRACIÓN: acepta la
// clave antigua (id de la carta base, ej. 'c3') si no existe la nueva.
function getSelectedPhase(familyId) {
    let raw = safeStorageGet('nexo_selected_phases_v1');
    if (!raw) return CARD_FAMILIES[familyId] ? CARD_FAMILIES[familyId].forms[0] : familyId;
    try {
        let parsed = JSON.parse(raw) || {};
        let family = CARD_FAMILIES[familyId];
        return parsed[familyId] || (family ? (parsed[family.forms[0]] || family.forms[0]) : familyId);
    } catch(e) { return familyId; }
}

function setSelectedPhase(familyId, formId) {
    let raw = safeStorageGet('nexo_selected_phases_v1');
    let parsed = {};
    if (raw) { try { parsed = JSON.parse(raw) || {}; } catch(e) {} }
    parsed[familyId] = formId;
    safeStorageSet('nexo_selected_phases_v1', JSON.stringify(parsed));
}

// Devuelve la familia de una carta (o null si no tiene).
function getFamilyFor(cardId) {
    for (let familyId in CARD_FAMILIES) {
        if (CARD_FAMILIES[familyId].forms.includes(cardId)) return CARD_FAMILIES[familyId];
    }
    return null;
}

function getFamilyById(familyId) { return CARD_FAMILIES[familyId] || null; }

// Devuelve la forma desbloqueada más cercana hacia atrás (para corregir
// selecciones bloqueadas). Si la marcada está desbloqueada, la devuelve.
function resolvePhase(familyId, formId) {
    let family = CARD_FAMILIES[familyId];
    if (!family) return formId;
    let idx = family.forms.indexOf(formId);
    if (idx === -1) return family.forms[0];
    for (let i = idx; i >= 0; i--) {
        if (isFormUnlocked(familyId, family.forms[i])) return family.forms[i];
    }
    return family.forms[0];
}

// Progreso de misiones: { [cardId]: { wins, exilioReceived, gamesWith, completed } }
function getCardProgress() {
    let raw = safeStorageGet('nexo_card_progress_v1');
    if (!raw) return {};
    try { return JSON.parse(raw) || {}; } catch(e) { return {}; }
}
function saveCardProgress(progress) { safeStorageSet('nexo_card_progress_v1', JSON.stringify(progress)); }

function getProgressFor(cardId) {
    let progress = getCardProgress();
    return progress[cardId] || { wins: 0, exilioReceived: 0, gamesWith: 0, completed: false };
}

function updateProgressFor(cardId, updates) {
    let progress = getCardProgress();
    if (!progress[cardId]) progress[cardId] = { wins: 0, exilioReceived: 0, gamesWith: 0, completed: false };
    Object.assign(progress[cardId], updates);
    saveCardProgress(progress);
    return progress[cardId];
}

function getMissionFor(cardId) { return CARD_MISSIONS[cardId] || null; }

function unlockCard(cardId) {
    let mission = CARD_MISSIONS[cardId];
    if (!mission) return false;
    // Si ya estaba completada, no re-notificar (evita el toast repetido en
    // cada partida que cumpla la condición de nuevo).
    if (getProgressFor(cardId).completed) return false;
    unlockForm(mission.familyId, cardId);
    updateProgressFor(cardId, { completed: true });
    return true;
}

// --- MÚLTIPLES MAZOS ---
function getDecks() {
    let raw = safeStorageGet('nexo_decks_v1');
    if (!raw) {
        let oldDeck = safeStorageGet('nexo_deck_v1');
        let cards = oldDeck ? (JSON.parse(oldDeck) || []) : [];
        let migrated = [{ id: 'default', name: 'Mazo Heládico', cards: cards }];
        safeStorageSet('nexo_decks_v1', JSON.stringify(migrated));
        safeStorageSet('nexo_active_deck_v1', 'default');
        return migrated;
    }
    try { return JSON.parse(raw) || []; } catch(e) { return []; }
}

function saveDecks(decks) { safeStorageSet('nexo_decks_v1', JSON.stringify(decks)); }
function getActiveDeckId() { return safeStorageGet('nexo_active_deck_v1') || 'default'; }
function setActiveDeckId(id) { safeStorageSet('nexo_active_deck_v1', id); }

function getActiveDeck() {
    let decks = getDecks();
    return decks.find(d => d.id === getActiveDeckId()) || decks[0] || { id: 'default', name: 'Mazo Heládico', cards: [] };
}

function createDeck(name) {
    let decks = getDecks();
    let id = 'deck_' + Date.now();
    decks.push({ id, name: name || ('Mazo ' + (decks.length + 1)), cards: [] });
    saveDecks(decks);
    return id;
}

function renameDeck(id, newName) {
    let decks = getDecks();
    let deck = decks.find(d => d.id === id);
    if (deck) { deck.name = newName; saveDecks(decks); }
}

function deleteDeck(id) {
    let decks = getDecks();
    if (decks.length <= 1) { alert('No puedes eliminar el último mazo.'); return false; }
    decks = decks.filter(d => d.id !== id);
    saveDecks(decks);
    if (getActiveDeckId() === id) setActiveDeckId(decks[0].id);
    return true;
}

// --- ESTADÍSTICAS DEL JUGADOR ---
function getPlayerStats() {
    let raw = safeStorageGet('nexo_stats_v1');
    if (!raw) return { wins: 0, losses: 0 };
    try { return JSON.parse(raw) || { wins: 0, losses: 0 }; } catch(e) { return { wins: 0, losses: 0 }; }
}
function savePlayerStats(stats) { safeStorageSet('nexo_stats_v1', JSON.stringify(stats)); }
function incrementWin() {
    let stats = getPlayerStats();
    stats.wins = (stats.wins || 0) + 1;
    savePlayerStats(stats);
}

