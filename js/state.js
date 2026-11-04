// --- ESTADO GLOBAL ---
// Única fuente de verdad de la partida y de la selección de mazo.
        // --- ESTADO GLOBAL ---
        let playerDeck = []; 
        let draggedCardId = null; 
        let modalAutoPaused = false;
        let gameState = {
            turn: 1,
            isPlaying: false,
            speed: 1,
            timer: null,
            justDeployed: [],
            p1: { score: 0, energy: 1, deckPointer: 0, activeBoard: [], lastPlayed: null, costDiscount: 0, extraPoints: 0, extraDraws: 0 },
            p2: { score: 0, energy: 1, deckPointer: 0, activeBoard: [], lastPlayed: null, costDiscount: 0, extraPoints: 0, extraDraws: 0 }
        };
