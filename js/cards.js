// --- DATOS DE LAS CARTAS (Solo SER o EVENTO) ---
// Plantillas compartidas: las instancias en tablero son copias, así las
// funciones effect/startTurn sobreviven para ambos jugadores.
const ALL_CARDS = [
            { 
                id: 'c1', name: 'Mortales de Arcadia', kind: 'Ser', faction: 'Prometeo', cost: 1, atk: 1, hp: 1, 
                icon: 'fa-user', 
                desc: 'Sin habilidades, solo voluntad.', 
                lore: 'En las laderas de los valles oscuros, pequeños grupos de hombres y mujeres intentan sobrevivir al frío y a la intemperie. No tienen armas de bronce ni armaduras pesadas, solo una frágil voluntad y fogatas improvisadas para espantar a la noche. Son la primera creación de Prometeo, el titán que les dio forma con barro y les robó el fuego a los dioses.',
                art: 'assets/cartas/carta-01-mortales-de-arcadia.webp',
                effect: null, startTurn: null 
            },
            { 
                id: 'c2', name: 'Sátiro de los Bosques', kind: 'Ser', faction: 'Dioniso', cost: 2, atk: 0, hp: 2, 
                icon: 'fa-leaf', 
                desc: 'Inicio de turno: Gana +1 ATK por cada otro Ser aliado en el tablero.', 
                lore: 'De la espesura más profunda de los matorrales surge una criatura híbrida de torso humano y patas caprinas. Es un ser salvaje y caótico que no obedece a ninguna ley humana, merodeando los bordes de los caminos para asustar y desorientar a los viajeros. Es el cortejo de Dioniso, el dios del vino y el éxtasis, y su sola presencia anuncia el caos.',
                art: 'assets/cartas/carta-02-satiro-de-los-bosques.webp',
                effect: null, 
                startTurn: (self, player) => { self.atk = 0; let others = player.activeBoard.filter(c => c.uid !== self.uid && c.kind === 'Ser' && !c.dying).length; if (others > 0) { self.atk += others; queueFx({ t: 'buff', side: sideOf(player), uid: self.uid, text: '+' + others + ' ATK', icon: 'fa-arrow-trend-up' }); } } 
            },
            { 
                id: 'c3', name: 'Asterión, el Minotauro', kind: 'Ser', faction: 'Poseidón', cost: 3, atk: 2, hp: 4, 
                icon: 'fa-cow', 
                desc: 'Sin habilidades, pero un muro sólido.', 
                lore: 'De la unión prohibida entre Pasífae y el toro blanco nació Asterión, una criatura de cuerpo humano y cabeza de toro. Creció entre los muros del palacio de Cnosos, y aunque al principio no era más que un cachorro asustado, su fuerza bruta y su naturaleza salvaje comenzaron a manifestarse. La corte lo miraba con temor, y los susurros sobre la maldición de Poseidón no tardaron en recorrer los pasillos. Algunos dicen que el laberinto de Creta aún lo espera.',
                art: 'assets/cartas/carta-03-asterion-el-minotauro.webp',
                effect: null, startTurn: null 
            },
            { 
                id: 'c4', name: 'Plegaria Arcana', kind: 'Evento', faction: 'Zeus', cost: 1, atk: 0, hp: 0, 
                icon: 'fa-hands-praying', 
                desc: 'Otorga +4 Puntos de Gloria instantáneos.', 
                lore: 'Ante el terror de la oscuridad, los jefes de las tribus alzan las manos al cielo estrellado y elevan sus primeros cánticos y ofrendas. Esta devoción pura resuena por primera vez en las alturas, atrayendo la atención de fuerzas invisibles. Es la primera vez que los mortales invocan a Zeus, el rey de los dioses.',
                art: 'assets/cartas/carta-04-plegaria-arcana.webp',
                effect: (p) => { p.score += 4; queueFx({ t: 'gloria', side: sideOf(p), text: '+4 GLORIA', icon: 'fa-hands-praying', num: 4 }); }
            },
            { 
                id: 'c5', name: 'Niebla del Caos', kind: 'Evento', faction: 'Cronos', cost: 2, atk: 0, hp: 0, 
                icon: 'fa-cloud', 
                desc: 'Reduce en -2 el ATK de TODOS los Seres rivales (permanente).', 
                lore: 'Una densa penumbra inexplorada desciende de los cielos y cubre los valles arcaicos de Grecia. Esta neblina antinatural nubla el juicio de las tribus y debilita los primeros asentamientos humanos, obligándolos a dar sus primeros pasos a ciegas en la oscuridad. Es el aliento de Cronos, el titán que devora a sus hijos, filtrándose desde el Tártaro.',
                art: 'assets/cartas/carta-05-niebla-del-caos.webp',
                effect: (p, opp) => { queueFx({ t: 'wave', side: sideOf(opp) }); opp.activeBoard.forEach(c => { if (!c.dying && !c.noAtkRed) { let d = bloqueoAbsorb(c, 2);
                if (d > 0) { d = colossusShieldFor(opp, d); }
                if (d > 0) { c.atk = Math.max(0, c.atk - d); queueFx({ t: 'debuff', side: sideOf(opp), uid: c.uid, text: '-' + d + ' ATK', icon: 'fa-cloud', overlay: 'fog', pulse: 'fx-pulse-gray', cls: 'fx-gray' }); } } }); } 
            },
            { 
                id: 'c6', name: 'Ninfas de las Fuentes Secas', kind: 'Ser', faction: 'Poseidón', cost: 2, atk: 1, hp: 2, 
                icon: 'fa-water', 
                desc: 'Al entrar: Reduce en -1 el ATK del Ser rival en la Fila 1 (permanente).', 
                lore: 'Las protectoras de los manantiales sufren la corrupción de la niebla. Al verse marchitas y sin agua pura, pierden la razón y se convierten en espectros errantes que lloran desconsoladamente, confundiendo con sus cantos a cualquiera que se acerque. Son las ninfas de Poseidón, hijas del mar y de los ríos, ahora corrompidas por el Caos.',
                art: 'assets/cartas/carta-06-ninfas-de-las-fuentes-secas.webp',
                effect: (p, opp) => { let target = opp.activeBoard[0]; if (target && !target.dying && !target.noAtkRed) { let d = bloqueoAbsorb(target, 1);
                if (d > 0) { d = colossusShieldFor(opp, d); }
                if (d > 0) { target.atk = Math.max(0, target.atk - d); queueFx({ t: 'debuff', side: sideOf(opp), uid: target.uid, text: '-' + d + ' ATK', icon: 'fa-water', overlay: 'tears' }); } } }, startTurn: null 
            },
            { 
                id: 'c7', name: 'Jabalí de Erimanto', kind: 'Ser', cost: 5, atk: 4, hp: 6, faction: 'Artemisa',
                icon: 'fa-hippo', 
                desc: 'Embestida 1.', 
                lore: 'Desde las cumbres heladas desciende una bestia descomunal: un jabalí salvaje de piel acorazada y colmillos afilados que arrasa con los primeros cultivos y siembra el pánico absoluto en las laderas de Arcadia. Los pastores susurran su nombre con terror, pues no hay lanza ni trampa que pueda detenerlo. Es una de las bestias primigenias que habitan las montañas, un recordatorio de que la naturaleza salvaje aún no ha sido domesticada por los hombres.',
                art: 'assets/cartas/carta-07-jabali-de-erimanto.webp',
                effect: null, 
                startTurn: (self, player, opp) => {
                    embestida(self, player, opp, 1);
                }
            },
            { 
                id: 'c8', name: 'Oráculo Ciego', kind: 'Ser', faction: 'Apolo', cost: 2, atk: 1, hp: 1,
                icon: 'fa-eye-slash', 
                desc: 'Al entrar: Tu siguiente Evento cuesta -1 Energía (mínimo 0).', 
                lore: 'En una cueva donde los vapores de la tierra escapan por las grietas, un anciano inhala los efluvios telúricos. Entra en un profundo trance y comienza a escupir profecías indescifrables sobre un destino escrito con sangre y bronce. Es un oráculo de Apolo, el dios de la profecía, y sus palabras son tan oscuras como el futuro que anuncian.',
                art: 'assets/cartas/carta-08-oraculo-ciego.webp',
                effect: (p) => { p.pendingEventDiscount = (p.pendingEventDiscount || 0) + 1; queueFx({ t: 'discount', side: sideOf(p), text: '-1' }); }, startTurn: null 
            },
            { 
                id: 'c9', name: 'Pacto de Sangre en el Altar de Piedra', kind: 'Evento', faction: 'Hades', cost: 3, atk: 0, hp: 0, 
                icon: 'fa-droplet', 
                desc: 'Destruye el Ser rival con menos HP, otorga +4 Puntos de Gloria y resta 4 HP a tu Ser con más HP. Sin Ser aliado, el ritual no se activa.', 
                lore: 'Desesperados por detener las malas cosechas y los ataques, los mortales construyen altares toscos de roca y entregan la vida de sus cazadores en un ritual oscuro para apaciguar a las fuerzas que los acechan. Es un pacto con Hades, el dios del inframundo, que acepta la sangre como moneda de cambio.',
                art: 'assets/cartas/carta-09-pacto-de-sangre.webp',
                effect: (p, opp) => {
                    // Canon: sin Ser aliado vivo, el ritual no se activa.
                    let own = p.activeBoard.filter(c => c.kind === 'Ser' && !c.dying);
                    if (own.length === 0) return;
                    p.score += 4;
                    queueFx({ t: 'gloria', side: sideOf(p), text: '+4 GLORIA', icon: 'fa-droplet', num: 4 });
                    let alive = opp.activeBoard.filter(c => !c.dying && !c.noDestroy && !c.stunned);
                    if (alive.length > 0) {
                        let weakest = alive.reduce((min, c) => c.hp < min.hp ? c : min, alive[0]);
                        weakest.dying = true;
                        queueFx({ t: 'sacrifice', side: sideOf(opp), uid: weakest.uid });
                    }
                    // Drawback: tu Ser con más HP paga 4 HP (puede morir).
                    let strongest = own.reduce((max, c) => c.hp > max.hp ? c : max, own[0]);
                    strongest.hp = Math.max(0, strongest.hp - 4);
                    queueFx({ t: 'debuff', side: sideOf(p), uid: strongest.uid, text: '-4 HP', icon: 'fa-droplet', overlay: 'hit' });
                    if (strongest.hp === 0) { strongest.dying = true; queueFx({ t: 'sacrifice', side: sideOf(p), uid: strongest.uid }); }
                } 
            },
            {
                id: 'c10', name: 'Ecos del Bosque de Dodona', kind: 'Evento', faction: 'Zeus', cost: 1, atk: 0, hp: 0,
                icon: 'fa-tree',
                desc: 'Reduce en -1 el ATK de TODOS los Seres (rivales y aliados), permanentemente.',
                lore: 'Los robles milenarios de los bosques sagrados guardan secretos antiguos. Cuando los intrusos se adentran sin respeto, las hojas y el viento susurran nombres prohibidos que paralizan la voluntad y confunden las mentes de los enemigos. Es el santuario oracular más antiguo de Zeus, donde los robles susurran sus profecías y su poder debilita a los incrédulos.',
                art: 'assets/cartas/carta-10-ecos-de-dodona.webp',
                effect: (p, opp) => { [p, opp].forEach(owner => { queueFx({ t: 'wave', side: sideOf(owner) }); owner.activeBoard.forEach(c => { if (!c.dying && !c.noAtkRed) { let d = bloqueoAbsorb(c, 1);
                if (d > 0) { d = colossusShieldFor(owner, d); }
                if (d > 0) { c.atk = Math.max(0, c.atk - d); queueFx({ t: 'debuff', side: sideOf(owner), uid: c.uid, text: '-' + d + ' ATK', icon: 'fa-leaf', overlay: 'leaf' }); } } }); }); }
            },
{
    id: 'a2', name: 'Asterión, Enfurecido', kind: 'Ser', faction: 'Poseidón', cost: 5, atk: 5, hp: 5,
    icon: 'fa-cow',
    desc: 'Embestida 1.',
    lore: 'El cachorro se convirtió en una bestia. Asterión probó la sangre humana y algo se rompió en su interior: ya no distinguía entre el hambre y la furia. Minos, aterrado por lo que su propio pecado había engendrado, ordenó a Dédalo construir un laberinto para encerrarlo.',
    art: 'assets/cartas/asterion-a2-enfurecido.webp',
    substory: 'asterion',
    effect: null,
    startTurn: (self, player, opp) => { embestida(self, player, opp, 1); }
},
{
    id: 'a3', name: 'Asterión, el Señor del Laberinto', kind: 'Ser', faction: 'Poseidón', cost: 7, atk: 6, hp: 4,
    icon: 'fa-maze',
    desc: 'Al entrar: Laberinto 2 (atrapa a un Ser rival aleatorio 2 turnos).',
    lore: 'Encerrado en el laberinto de Cnosos, Asterión aprendió a moverse entre sus muros como si fueran una extensión de su propio cuerpo. Conocía cada rincón, cada trampa, cada sombra. Los que osaban entrar en su dominio no encontraban la salida, y la bestia los acechaba desde la oscuridad.',
    art: 'assets/cartas/asterion-a3-senor-laberinto.webp',
    substory: 'asterion',
    effect: (p, opp) => { laberinto(p, opp, 2); },
    startTurn: null
},
{
    id: 'a4', name: 'El Toro Blanco de Creta', kind: 'Ser', faction: 'Poseidón', cost: 4, atk: 1, hp: 5,
    icon: 'fa-cow',
    desc: 'Bloqueo 2.',
    lore: 'Poseidón hizo emerger del mar un toro blanco como la espuma, un regalo sagrado para Minos, rey de Creta. El animal era de una belleza sobrecogedora, y Minos, incapaz de alzar la mano contra él, lo conservó en sus dominios. Pero la afrenta no quedó impune: Poseidón encendió en el corazón de Pasífae una pasión prohibida por el toro.',
    art: 'assets/cartas/asterion-a4-toro-blanco.webp',
    substory: 'asterion',
    effect: null,
    startTurn: null
},
{
    id: 'a5', name: 'Teseo en el Laberinto', kind: 'Ser', faction: 'Atenea', cost: 5, atk: 4, hp: 4,
    icon: 'fa-scroll',
    desc: 'Al entrar: +2 Gloria por cada aliado en el tablero.',
    lore: 'Teseo y sus aliados se adentraron en la oscuridad del laberinto con el hilo de Ariadna como única guía. Asterión los acechaba desde las sombras, y cada paso que daban juntos era un latido de esperanza. Cada vida que lograba escapar de las sombras era una victoria para Atenas.',
    art: 'assets/cartas/asterion-a5-teseo-laberinto.webp',
    substory: 'asterion',
    effect: (p) => {
        let n = 2 * p.activeBoard.filter(c => !c.dying && !c.stunned).length;
        if (n > 0) {
            p.score += n;
            queueFx({ t: 'gloria', side: sideOf(p), text: '+' + n + ' GLORIA', icon: 'fa-scroll', num: n });
        }
    },
    startTurn: null
},
{
    id: 'a6', name: 'Pasífae, la Reina de Creta', kind: 'Ser', faction: 'Afrodita', cost: 2, atk: 0, hp: 3,
    icon: 'fa-crown',
    desc: 'Al entrar: +1 HP a todos tus Asterión (en tablero o en mazo).',
    lore: 'Pasífae, esposa de Minos, caminaba por los jardines de Cnosos con la mirada perdida, ajena al hechizo que Poseidón había tejido sobre ella. Una pasión prohibida por el toro blanco encendió su corazón, y de esa unión contra natura nació Asterión. Aterrorizada por lo que había engendrado, la reina se retiró a las sombras del palacio, pero su amor de madre aún protege a su hijo, dondequiera que esté.',
    art: 'assets/cartas/asterion-a6-pasifae.webp',
    substory: 'asterion',
    effect: (p) => {
        // +1 HP a todos los Asterión (en tablero).
        p.activeBoard.forEach(c => {
            if (!c.dying && (c.id === 'c3' || c.id === 'a2' || c.id === 'a3')) {
                c.hp += 1;
                queueFx({ t: 'buff', side: sideOf(p), uid: c.uid, text: '+1 HP', icon: 'fa-crown' });
            }
        });
        // +1 HP a todos los Asterión restantes en el mazo del jugador (no los
        // ya jugados). Se mutan las cartas del mazo en memoria (copia por
        // partida), no las plantillas de ALL_CARDS.
        if (p.deck) {
            p.deck.forEach(c => {
                if (c.id === 'c3' || c.id === 'a2' || c.id === 'a3') {
                    c.hp = (c.hp || 0) + 1;
                }
            });
        }
    },
    startTurn: null
},
{
    id: 'a7', name: 'Dédalo, el Arquitecto', kind: 'Ser', faction: 'Hefesto', cost: 3, atk: 1, hp: 4,
    icon: 'fa-compass-drafting',
    desc: 'Al entrar: invoca una Vaca de Madera Hueca (0/1) en tu tablero.',
    lore: 'Dédalo era el artesano más brillante de Grecia, capaz de construir estructuras imposibles y artilugios que desafiaban a los dioses. Minos le ordenó diseñar un laberinto del que nadie pudiera escapar, y Dédalo obedeció, aunque sabía que estaba creando una prisión para una criatura inocente. Su genio lo condenó a vivir con el peso de su obra, y desde entonces, sus manos nunca volvieron a crear nada que no fuera una jaula.',
    art: 'assets/cartas/asterion-a7-dedalo.webp',
    substory: 'asterion',
    effect: (p) => {
        let tpl = ALL_CARDS.find(c => c.id === 'a8');
        if (tpl) summonCard(p, tpl);
    },
    startTurn: null
},
{
    id: 'a8', name: 'Vaca de Madera Hueca', kind: 'Token', faction: 'Hefesto', cost: 0, atk: 0, hp: 1,
    icon: 'fa-horse',
    desc: 'Al ser destruida: invoca un Asterión, el Minotauro.',
    lore: 'Una vaca de madera hueca, construida por Dédalo para que Pasífae pudiera consumar su pasión prohibida por el Toro Blanco. En su interior, la reina se ocultó para engendrar a Asterión. La vaca es el símbolo del engaño y la tragedia que envolvió a la casa de Minos.',
    art: 'assets/cartas/asterion-a8-vaca-madera.webp',
    substory: 'asterion',
    effect: null,
    startTurn: null,
    onDeath: (owner) => {
        let tpl = ALL_CARDS.find(c => c.id === 'c3');
        if (tpl) summonCard(owner, tpl);
    }
},
{
    id: 'a9', name: 'El Nacimiento del Minotauro', kind: 'Evento', faction: 'Poseidón', cost: 3, atk: 0, hp: 0,
    icon: 'fa-egg',
    desc: 'Invoca un Asterión, el Minotauro en tu tablero.',
    lore: 'En la oscuridad de la noche, Pasífae dio a luz a una criatura de cuerpo humano y cabeza de toro. Los gritos de la reina resonaron en los pasillos del palacio, y los dioses guardaron silencio. Asterión había nacido, y con él, la vergüenza y el castigo divino se instalaron en Creta.',
    art: 'assets/cartas/asterion-a9-nacimiento-minotauro.webp',
    substory: 'asterion',
    effect: (p) => {
        let tpl = ALL_CARDS.find(c => c.id === 'c3');
        if (tpl) summonCard(p, tpl);
    },
    startTurn: null
},
{
    id: 'a10', name: 'La Construcción del Laberinto', kind: 'Evento', faction: 'Hefesto', cost: 4, atk: 0, hp: 0,
    icon: 'fa-dungeon',
    desc: 'Laberinto 2: atrapa a un Ser rival aleatorio durante 2 turnos.',
    lore: 'Dédalo, el arquitecto más brillante de Grecia, recibió la orden de Minos: construir una prisión de la que nadie pudiera escapar. Durante meses, sus manos trabajaron la piedra y el bronce, levantando muros infinitos y pasillos sin salida. El Laberinto de Cnosos nació para encerrar a Asterión, pero también se convirtió en la tumba de todos los que osaron entrar en él.',
    art: 'assets/cartas/asterion-a10-construccion-laberinto.webp',
    substory: 'asterion',
    effect: (p, opp) => { laberinto(p, opp, 2); },
    startTurn: null
},
{
    id: 'a11', name: 'La Muerte del Minotauro', kind: 'Evento', faction: 'Atenea', cost: 2, atk: 0, hp: 0,
    icon: 'fa-skull',
    desc: 'Inflige 4 de daño al Ser rival con más ATK.',
    lore: 'En el centro del Laberinto, Teseo se enfrentó a Asterión. La bestia rugió y cargó contra él, pero el héroe ateniense esquivó sus embestidas y, con un golpe certero, puso fin a la vida del Minotauro. La sangre de Asterión empapó la piedra del laberinto, y el silencio se instaló en Creta.',
    art: 'assets/cartas/asterion-a11-muerte-minotauro.webp',
    substory: 'asterion',
    effect: (p, opp) => {
        let alive = opp.activeBoard.filter(c => !c.dying && !c.stunned);
        if (!alive.length) return;
        let target = alive.reduce((max, c) => (c.atk + (c.tempAtkMod || 0)) > (max.atk + (max.tempAtkMod || 0)) ? c : max, alive[0]);
        dealDamage(target, 4, sideOf(opp));
        queueFx({ t: 'debuff', side: sideOf(opp), uid: target.uid, text: '-4 HP', icon: 'fa-skull', overlay: 'hit' });
    },
    startTurn: null
},
{
    id: 'b0', name: 'Serpientes de la Cabeza', kind: 'Token', faction: 'Atenea', cost: 0, atk: 1, hp: 1,
    icon: 'fa-snake',
    desc: 'Sin habilidades. Las serpientes del cabello de Medusa buscan venganza.',
    lore: 'Las serpientes del cabello de Medusa siguen vivas incluso después de la muerte de su portadora. Buscan venganza con colmillos pequeños pero certeros.',
    art: 'assets/cartas/medusa-b0-serpientes-cabeza.webp',
    substory: 'medusa',
    effect: null, startTurn: null
},
{
    id: 'b1', name: 'Medusa, la Doncella', kind: 'Ser', faction: 'Afrodita', cost: 2, atk: 0, hp: 3,
    icon: 'fa-user',
    desc: 'Al entrar: +1 Gloria por cada Ser aliado en el tablero.',
    lore: 'Antes de la maldición, Medusa era la más bella de las sacerdotisas de Atenea. Su cabello dorado caía como una cascada y su voz calmaba a las bestias. Los hombres cruzaban el mar solo para verla, y ella, orgullosa, se atrevió a compararse con la diosa.',
    art: 'assets/cartas/medusa-b1-doncella.webp',
    substory: 'medusa',
    effect: (p) => {
        let n = p.activeBoard.filter(c => !c.dying && !c.stunned && !(c.petrifiedTurns > 0)).length;
        if (n > 0) { p.score += n; queueFx({ t: 'gloria', side: sideOf(p), text: '+' + n + ' GLORIA', icon: 'fa-user', num: n }); }
    },
    startTurn: null
},
{
    id: 'b2', name: 'Medusa, la Gorgona', kind: 'Ser', faction: 'Atenea', cost: 6, atk: 2, hp: 2,
    icon: 'fa-snake',
    desc: 'Al entrar: Petrificar 2. Mientras esté en Fila 1, al inicio de cada turno, 1 daño al rival de Fila 1. Al morir: invoca 2 Serpientes de la Cabeza.',
    lore: 'Atenea no distinguió entre el culpable y la víctima. El cabello de Medusa se enroscó en serpientes, y su mirada se volvió piedra. Huyó al norte, donde las Gorgonas la acogieron, y desde entonces ningún hombre que la mirara volvió a contar lo que vio.',
    art: 'assets/cartas/medusa-b2-gorgona.webp',
    substory: 'medusa',
    effect: (p, opp) => { petrificar(p, opp, 2); },
    startTurn: (self, player, opp) => {
        if (player.activeBoard[0] !== self) return;
        let target = opp.activeBoard[0];
        if (!target || target.dying) return;
        dealDamage(target, 1, sideOf(opp), player);
        queueFx({ t: 'debuff', side: sideOf(opp), uid: target.uid, text: '-1 HP', icon: 'fa-snake', overlay: 'hit' });
    },
    onDeath: (owner) => {
        let tpl = ALL_CARDS.find(c => c.id === 'b0');
        if (tpl) { summonCard(owner, tpl); summonCard(owner, tpl); }
    }
},
{
    id: 'b3', name: 'Esteno, la Fuerte', kind: 'Ser', faction: 'Atenea', cost: 4, atk: 3, hp: 3, bloqueo: 2,
    icon: 'fa-shield-halved',
    desc: 'Bloqueo 2.',
    lore: 'La mayor de las Gorgonas, hija de Forcis y Ceto. Su fuerza era tal que podía detener a un toro con una mano. Cuando Medusa llegó al norte, Esteno la abrazó como a una hermana y juró protegerla de los hombres que la buscaban.',
    art: 'assets/cartas/medusa-b3-esteno.webp',
    substory: 'medusa',
    effect: null, startTurn: null
},
{
    id: 'b4', name: 'Euríale, la Errante', kind: 'Ser', faction: 'Atenea', cost: 3, atk: 2, hp: 3,
    icon: 'fa-eye',
    desc: 'Al entrar: -1 ATK al Ser rival en la Fila 1.',
    lore: 'La tercera Gorgona, errante y silenciosa. Se dice que podía ver el futuro en el vuelo de los cuervos. Fue ella quien advirtió a Medusa de que un héroe con sandalias aladas cruzaba el mar, pero Medusa ya no podía escuchar.',
    art: 'assets/cartas/medusa-b4-euriale.webp',
    substory: 'medusa',
    effect: (p, opp) => { let t = opp.activeBoard[0]; if (t && !t.dying && !t.noAtkRed) { t.atk = Math.max(0, t.atk - 1); queueFx({ t: 'debuff', side: sideOf(opp), uid: t.uid, text: '-1 ATK', icon: 'fa-eye' }); } },
    startTurn: null
},
{
    id: 'b5', name: 'El Escudo Espejo', kind: 'Evento', faction: 'Atenea', cost: 2, atk: 0, hp: 0,
    icon: 'fa-shield-halved',
    desc: 'Tu Ser con más ATK gana Reflejo 1 este turno (refleja el próximo efecto rival que lo targetee).',
    lore: 'Atenea entregó a Perseo un escudo pulido como un espejo. "No la mires a los ojos", le dijo. "Mírala en el reflejo". El héroe avanzó por la cueva con el escudo en alto, y las serpientes de Medusa se reflejaron en el bronce antes de que pudieran alcanzarlo.',
    art: 'assets/cartas/medusa-b5-escudo-espejo.webp',
    substory: 'medusa',
    effect: (p) => {
        let alive = p.activeBoard.filter(c => !c.dying);
        if (!alive.length) return;
        let target = alive.reduce((max, c) => (c.atk + (c.tempAtkMod || 0)) > (max.atk + (max.tempAtkMod || 0)) ? c : max, alive[0]);
        target.reflectCharges = (target.reflectCharges || 0) + 1;
        queueFx({ t: 'buff', side: sideOf(p), uid: target.uid, text: 'REFLEJO 1', icon: 'fa-shield-halved' });
    },
    startTurn: null
},
{
    id: 'b6', name: 'Las Sandalias Aladas', kind: 'Evento', faction: 'Hermes', cost: 2, atk: 0, hp: 0,
    icon: 'fa-shoe-prints',
    desc: 'Tu Ser con más ATK gana +2 ATK este turno.',
    lore: 'Hermes, el mensajero de los dioses, prestó a Perseo sus sandalias aladas. Con ellas, el héroe podía volar sobre el mar y escapar de cualquier enemigo. Pero las sandalias no protegían de la mirada de la Gorgona: solo de sus garras.',
    art: 'assets/cartas/medusa-b6-sandalias-aladas.webp',
    substory: 'medusa',
    effect: (p) => {
        let alive = p.activeBoard.filter(c => !c.dying);
        if (!alive.length) return;
        let target = alive.reduce((max, c) => (c.atk + (c.tempAtkMod || 0)) > (max.atk + (max.tempAtkMod || 0)) ? c : max, alive[0]);
        target.tempAtkMod = (target.tempAtkMod || 0) + 2;
        queueFx({ t: 'buff', side: sideOf(p), uid: target.uid, text: '+2 ATK', icon: 'fa-shoe-prints' });
    },
    startTurn: null
},
{
    id: 'b7', name: 'El Casco de Invisibilidad', kind: 'Evento', faction: 'Hades', cost: 2, atk: 0, hp: 0,
    icon: 'fa-ghost',
    desc: 'Tus Seres son inmunes a efectos rivales este turno (no pueden ser target de debuffs, petrificar ni destruir).',
    lore: 'Hades, el dios del inframundo, prestó a Perseo su casco de invisibilidad. Con él, el héroe podía caminar entre los monstruos sin ser visto. Pero el casco no lo hacía invisible a los dioses: solo a los ojos de los mortales.',
    art: 'assets/cartas/medusa-b7-casco-invisibilidad.webp',
    substory: 'medusa',
    effect: (p) => {
        p.activeBoard.forEach(c => {
            if (!c.dying) { c.immuneThisTurn = true; }
        });
        queueFx({ t: 'buff', side: sideOf(p), text: 'INMUNE', icon: 'fa-ghost' });
    },
    startTurn: null
},
{
    id: 'b8', name: 'Pegaso, el Nacido de la Sangre', kind: 'Ser', faction: 'Poseidón', cost: 5, atk: 3, hp: 4,
    icon: 'fa-horse',
    desc: 'Al entrar: +2 Gloria y +1 ATK a todos tus Seres.',
    lore: 'Cuando la cabeza de Medusa cayó, de su sangre brotaron dos criaturas: Crisaor, el de la espada de oro, y Pegaso, el caballo alado. Pegaso voló al Olimpo y se convirtió en el corcel de Zeus. Pero su sangre era la de Poseidón, y su alma, la de Medusa.',
    art: 'assets/cartas/medusa-b8-pegaso.webp',
    substory: 'medusa',
    effect: (p) => {
        p.score += 2;
        p.activeBoard.forEach(c => { if (!c.dying) { c.atk += 1; queueFx({ t: 'buff', side: sideOf(p), uid: c.uid, text: '+1 ATK', icon: 'fa-horse' }); } });
        queueFx({ t: 'gloria', side: sideOf(p), text: '+2 GLORIA', icon: 'fa-horse', num: 2 });
    },
    startTurn: null
},
{
    id: 'b9', name: 'Crisaor, el de la Espada de Oro', kind: 'Ser', faction: 'Poseidón', cost: 4, atk: 3, hp: 3,
    icon: 'fa-sword',
    desc: 'Al entrar: +1 ATK permanente a todos tus Seres.',
    lore: 'El hermano de Pegaso, nacido de la misma sangre. Crisaor empuñaba una espada de oro que ningún mortal podía mirar sin deslumbrarse. Se dice que fue él quien recogió la cabeza de Medusa del suelo, y que la entregó a Atenea con sus propias manos.',
    art: 'assets/cartas/medusa-b9-crisaor.webp',
    substory: 'medusa',
    effect: (p) => {
        p.activeBoard.forEach(c => { if (!c.dying) { c.atk += 1; queueFx({ t: 'buff', side: sideOf(p), uid: c.uid, text: '+1 ATK', icon: 'fa-sword' }); } });
    },
    startTurn: null
},
{
    id: 'b10', name: 'La Mirada de Piedra', kind: 'Evento', faction: 'Atenea', cost: 4, atk: 0, hp: 0,
    icon: 'fa-eye-slash',
    desc: 'Petrificar 2 a un rival aleatorio. Se repite 2 veces.',
    lore: 'Quien mire a los ojos de la Gorgona se convierte en piedra. No hay escudo que valga, no hay dios que proteja. La mirada de Medusa es la mirada de Atenea: fría, justa, implacable. Y la piedra que deja no es un castigo: es una advertencia.',
    art: 'assets/cartas/medusa-b10-mirada-piedra.webp',
    substory: 'medusa',
    effect: (p, opp) => {
        petrificar(p, opp, 2);
        petrificar(p, opp, 2);
    },
    startTurn: null
}
        ];

// El mazo del rival comparte estas mismas plantillas (las instancias en
// tablero son copias; clonar con JSON eliminaría effect/startTurn).
let rivalDeck = ALL_CARDS;
