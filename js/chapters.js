// --- CAPÍTULOS ---
// Datos narrativos de la campaña. Cada capítulo define su intro (beats del
// relato), su epílogo al vencer, el arte de fondo del combate y el mazo del
// bot. Para añadir capítulos futuros basta con agregar entradas aquí: la
// pantalla de selección, la intro y el combate se generan solos.
const CHAPTERS = [
    {
        id: 1,
        number: 1,
        title: 'El Despertar en la Hélade',
        subtitle: 'La historia comienza en una Grecia arcaica y dividida. Las tribus moran en valles oscuros y en las laderas de Arcadia, temiendo la noche y rindiendo culto a las fuerzas telúricas de la tierra.',
        beats: [
            { icon: 'fa-cloud', title: 'La Niebla del Caos', text: 'Una densa penumbra cae sobre los valles. Los mortales desesperados elevan sus primeras plegarias en altares de piedra tosca.' },
            { icon: 'fa-paw', title: 'Los Primeros Encuentros', text: 'De las sombras de los bosques antiguos surgen criaturas híbridas y feroces que atacan los primeros asentamientos.' },
            { icon: 'fa-sun', title: 'La Chispa de la Fe', text: 'La devoción de los mortales resuena en las alturas del Olimpo, provocando la primera intervención divina directa.' }
        ],
        epilogue: 'La fe de los mortales encendió la primera chispa y el Olimpo respondió: la primera intervención divina marca el amanecer de una nueva era. La Niebla del Caos retrocede por ahora, pero las criaturas siguen acechando entre los bosques antiguos... y la Hélade necesitará héroes para lo que viene.',
        art: 'assets/capitulos/capitulo-01-el-despertar-en-la-helade.webp',
        rival: { name: 'Caos', sub: 'TELAR' },
        botDeck: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10']
    }
];

// Capítulo seleccionado (define el fondo de combate y el mazo del bot).
let currentChapter = null;

// Progreso persistente: ids de capítulos completados.
function getCompletedChapters() {
    let raw = safeStorageGet('nexo_chapters_v1');
    if (!raw) return [];
    try { return JSON.parse(raw); } catch(e) { return []; }
}

function isChapterCompleted(id) { return getCompletedChapters().includes(id); }

function markChapterCompleted(id) {
    let done = getCompletedChapters();
    if (!done.includes(id)) {
        done.push(id);
        safeStorageSet('nexo_chapters_v1', JSON.stringify(done));
    }
}

// Mazo del bot del capítulo activo (resuelve ids contra las plantillas).
function getChapterBotDeck() {
    if (!currentChapter) return ALL_CARDS;
    return currentChapter.botDeck.map(id => ALL_CARDS.find(c => c.id === id)).filter(c => c !== undefined);
}
