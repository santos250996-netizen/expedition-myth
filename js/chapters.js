// --- CAPÍTULOS ---
// Datos narrativos de la campaña. Cada capítulo define su intro (beats del
// relato), su epílogo al vencer, el arte de fondo del combate y el mazo del
// bot. Para añadir capítulos futuros basta con agregar entradas aquí: la
// pantalla de selección, la intro y el combate se generan solos.
const CHAPTERS = [
    {
        id: 1,
        number: '1',
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
        // Mazo del bot NO espejo: sin Minotauro (c3) ni Embestida (c7),
        // duplica los dos Seres más débiles y arranca por el Sátiro. Con el
        // mazo idéntico al del jugador, ambos puntuaban lo mismo todos los
        // turnos y la partida no acababa nunca.
        botDeck: ['c2', 'c1', 'c4', 'c8', 'c6', 'c10', 'c5', 'c1', 'c9', 'c2']
    },
{
    id: 'asterion',
    number: '★',
    title: 'El Laberinto de Creta',
    subtitle: 'Más allá de los valles de la Hélade, en la isla de Creta, un rey encerró en un laberinto al fruto de una maldición divina. El hilo de Ariadna aún no se ha tensado, y el toro espera en el centro.',
    beats: [
        { icon: 'fa-cow', title: 'La Maldición de Poseidón', text: 'Minos no sacrificó al Toro Blanco y el dios del mar cobró su ofrenda con creces: Pasífae engendró a Asterión, mitad hombre, mitad toro.' },
        { icon: 'fa-dungeon', title: 'El Laberinto de Dédalo', text: 'El arquitecto trazó pasillos que no llevaban a ninguna parte. El Minotauro aprendió a moverse por ellos como si fueran su propio cuerpo.' },
        { icon: 'fa-scroll', title: 'El Hilo de Ariadna', text: 'Teseo entró con el hilo y sus aliados. No buscaba gloria: buscaba sobrevivir y liberar Atenas del tributo de sangre.' }
    ],
    epilogue: 'El laberinto quedó en silencio y el toro cayó. Pero el hilo de Ariadna solo marca la salida para quien ya conoce la entrada: los que entraron no volvieron igual, y Creta nunca olvidó el precio de su maldición.',
    art: 'assets/capitulos/capitulo-1-3-el-eclipse-del-olimpo.webp',
    rival: { name: 'Asterión', sub: 'LABERINTO' },
    isEvent: true,
    unlockedBy: 1,
    botDeck: ['c3', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a9', 'a10', 'a11']
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
