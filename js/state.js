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
    }
};

const CARD_MISSIONS = {
    a2: {
        type: 'wins', count: 3, previousCardId: 'c3',
        familyId: 'asterion', formIndex: 1,
        description: 'Gana 3 combates con Asterión, el Minotauro en el tablero.'
    },
    a3: {
        type: 'laberinto_received', count: 1, previousCardId: 'a2',
        familyId: 'asterion', formIndex: 2,
        description: 'Recibe el efecto Laberinto con Asterión, Enfurecido en el tablero.'
    },
    a10: {
        type: 'games_with', count: 30, previousCardId: 'a7',
        familyId: 'dedalo', formIndex: 1,
        description: 'Juega a Dédalo en 30 partidas distintas.'
    },
    talos: {
        type: 'games_with', count: 50, previousCardId: 'a7',
        familyId: 'dedalo', formIndex: 2,
        description: 'Juega a Dédalo en 50 partidas distintas.'
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

// Progreso de misiones: { [cardId]: { wins, laberintoReceived, gamesWith, completed } }
function getCardProgress() {
    let raw = safeStorageGet('nexo_card_progress_v1');
    if (!raw) return {};
    try { return JSON.parse(raw) || {}; } catch(e) { return {}; }
}
function saveCardProgress(progress) { safeStorageSet('nexo_card_progress_v1', JSON.stringify(progress)); }

function getProgressFor(cardId) {
    let progress = getCardProgress();
    return progress[cardId] || { wins: 0, laberintoReceived: 0, gamesWith: 0, completed: false };
}

function updateProgressFor(cardId, updates) {
    let progress = getCardProgress();
    if (!progress[cardId]) progress[cardId] = { wins: 0, laberintoReceived: 0, gamesWith: 0, completed: false };
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

