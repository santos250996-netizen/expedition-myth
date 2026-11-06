// --- CAPÍTULOS ---
// Datos narrativos de la campaña. Cada capítulo define su intro (beats del
// relato), su epílogo al vencer, el arte de fondo del combate y el mazo del
// bot. Para añadir capítulos futuros basta con agregar entradas aquí: la
// pantalla de selección, la intro y el combate se generan solos.
const CHAPTERS = [
    {
        id: 1,
        number: '1.0',
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
        id: 2,
        number: '1.1',
        title: 'Las Grietas de la Discordia',
        subtitle: 'La frágil paz que las tribus y los espíritus intentaban mantener en los valles arcaicos comienza a romperse. La presencia de la Niebla del Caos y los primeros rituales oscuros no han pasado desapercibidos; han alterado el equilibrio natural. Las bestias que antes merodeaban los límites del bosque ahora se sienten atraídas por el olor de la sangre de los altares, mientras que los propios mortales, consumidos por el miedo y la desconfianza, empiezan a dividirse entre quienes buscan la protección de los dioses y quienes prefieren pactar con las sombras de la tierra. Este choque de intereses genera los primeros conflictos directos en la Hélade.',
        beats: [
            { icon: 'fa-fire', title: 'El Olor de la Sangre', text: 'Las bestias que antes merodeaban los límites del bosque ahora se sienten atraídas por el olor de la sangre de los altares, y acechan cada vez más cerca de los asentamientos.' },
            { icon: 'fa-handshake-slash', title: 'Mortales Divididos', text: 'Consumidos por el miedo y la desconfianza, los mortales empiezan a dividirse: quienes buscan la protección de los dioses frente a quienes prefieren pactar con las sombras de la tierra.' },
            { icon: 'fa-burst', title: 'Primeros Conflictos', text: 'Este choque de intereses genera los primeros conflictos directos en la Hélade. La discordia abre grietas que ni los espíritus ni los dioses pueden cerrar solos.' }
        ],
        epilogue: 'El choque se apaga y las grietas de la discordia se calman por ahora, pero la Hélade ha quedado marcada: los que pactaron con las sombras siguen entre los valles y la Niebla del Caos no se ha retirado del todo. Desde las alturas, los primeros ecos del Olimpo comienzan a resonar sobre los mortales...',
        art: 'assets/capitulos/capitulo-1-1-las-grietas-de-la-discordia.webp',
        rival: { name: 'Discordia', sub: 'GRIETAS' },
        // Orden fijo del bot con curva de energía limpia: 1 carta por tick
        // (e1→Saqueo(1), e2→Acechador(2), ... e10→Titán Menor(8)).
        botDeck: ['c17', 'c11', 'c14', 'c13', 'c16', 'c19', 'c15', 'c18', 'c20', 'c12']
    },
    {
        id: 3,
        number: '1.2',
        title: 'El Veredicto de la Sangre y el Bronce',
        subtitle: 'El conflicto latente en los valles de Arcadia ha cruzado un punto de no retorno. La tierra misma, sacudida por la tensión entre las tribus humanas, las bestias primigenias y los susurros de los titanes subterráneos, comienza a desgarrarse. Ya no se trata solo de sobrevivir a la noche o de disputar un territorio de caza: las alianzas se rompen, los primeros héroes locales levantan armas de bronce rudimentario y las fuerzas invisibles del cosmos griego empiezan a manifestarse con una brutalidad inusitada sobre el mundo mortal.',
        beats: [
            { icon: 'fa-shield-halved', title: 'El Juramento de Bronce', text: 'Ante la masacre total, los jefes de las aldeas rivales sellan un pacto de sangre sobre un escudo oxidado: nace la primera línea de defensa organizada de la Hélade.' },
            { icon: 'fa-fire-flame-curved', title: 'El Fuego de la Forja', text: 'En las entrañas de una caverna humeante, el Forjador del Yunque Oculto extrae los primeros minerales verdaderos y da forma a las primeras armas y armaduras de bronce.' },
            { icon: 'fa-bolt-lightning', title: 'El Cielo Responde', text: 'El humo de la Hecatombe cruza las barreras celestiales: un trueno ensordecedor cae sobre el campo de batalla y los supervivientes ven la destrucción como el veredicto de los dioses.' }
        ],
        epilogue: 'El bronce habló y la sangre pagó el veredicto: las tribus que juraron sobre el escudo oxidado ya no son bandas dispersas, sino el embrión de las futuras ciudades-estado. Pero bajo las grietas siguen susurrando los titanes, el Coloso avanza sin obedecer a nadie... y el humo de la próxima ofrenda ya empieza a ascender hacia el Olimpo.',
        art: 'assets/capitulos/capitulo-1-2-el-veredicto-de-la-sangre-y-el-bronce.webp',
        rival: { name: 'Bronce', sub: 'VEREDICTO' },
        // Orden fijo del bot con curva de energía limpia: c26(2), c28(2),
        // c29(2), c22(3), c21(3), c30(5), c23(4), c25(4), c27(2), c24(8).
        // El Héroe de Bronce (c30) llega como jugada fuerte de mitad de
        // partida y el Coloso (c24) cierra el mazo como amenaza tardía.
        botDeck: ['c26', 'c28', 'c29', 'c22', 'c21', 'c30', 'c23', 'c25', 'c27', 'c24']
    },
    {
        id: 4,
        number: '1.3',
        title: 'El Eclipse del Olimpo',
        subtitle: 'La sangre y el bronce han forjado reinos, pero también han despertado la envidia en las alturas. Los dioses del Olimpo, que hasta ahora observaban a los mortales como simples hormigas, han comenzado a tomar partido en sus guerras. Zeus, temeroso de que los reyes de la Hélade se vuelvan demasiado poderosos, ha lanzado un edicto: ningún mortal debe alzarse por encima de los demás. Pero no todos los dioses están de acuerdo. Hera, Atenea y Ares ven en los héroes mortales herramientas para sus propios juegos de poder. La discordia se ha instalado en el Olimpo, y su sombra cae sobre Grecia como un eclipse.',
        beats: [
            { icon: 'fa-bolt-lightning', title: 'El Edicto de Zeus', text: 'El trueno proclama la ley del cielo: ningún mortal debe alzarse por encima de los demás. Los reyes que aunaron las tribus bajo el bronce ven ahora cómo el Olimpo apunta su ira hacia ellos.' },
            { icon: 'fa-scale-balanced', title: 'Los Dioses Tomas Partido', text: 'Hera, Atenea y Ares no aceptan el edicto: ven en los héroes mortales piezas para sus propios juegos de poder. Cada bando divino busca un campeón entre los valles, y sus bendiciones y cóleras empiezan a caer sobre Grecia.' },
            { icon: 'fa-sun', title: 'La Sombra del Eclipse', text: 'El sol se apaga en pleno día y la sombra del eclipse cubre el campo de batalla. Los mortales, sin saberlo, están a punto de convertirse en peones de una guerra divina.' }
        ],
        epilogue: 'El eclipse pasó, pero nada volvió a ser igual: los mortales han empuñado el poder de los dioses y el Olimpo está roto en bandos. Zeus ha visto a un campeón sobrevivir a su edicto... y Hera y Atenea ya tejen la próxima alianza. La era en la que los dioses jugaban con los hombres está terminando: viene la era en la que los hombres obligarán a los dioses a elegir bando.',
        art: 'assets/capitulos/capitulo-1-3-el-eclipse-del-olimpo.webp',
        rival: { name: 'Zeus', sub: 'EDICTO' },
        // Orden fijo del bot calibrado con simulador (default 0.3% de
        // winrate, mazo optimizado 71%): c33(2), c39(2), c32(4), c37(2),
        // c35(3), c40(3), c31(5), c36(4), c38(5), c34(9).
        // El Vidente abre (ramp + gloria), la Cólera limpia la cima temprana,
        // el Guardián abarata los Eventos propios, el Heraldo buffa la línea
        // ya desplegada y el Coloso de Bronce (c34) cierra inmune.
        botDeck: ['c33', 'c39', 'c32', 'c37', 'c35', 'c40', 'c31', 'c36', 'c38', 'c34']
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
