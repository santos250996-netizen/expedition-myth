// --- DATOS DE LAS CARTAS (Solo SER o EVENTO) ---
// Plantillas compartidas: las instancias en tablero son copias, así las
// funciones effect/startTurn sobreviven para ambos jugadores.
const ALL_CARDS = [
            { 
                id: 'c1', name: 'Mortales de Arcadia', kind: 'Ser', cost: 1, atk: 1, hp: 1, 
                icon: 'fa-user', 
                desc: 'Sin habilidades, solo voluntad.', 
                lore: 'En las laderas de los valles oscuros, pequeños grupos de hombres y mujeres intentan sobrevivir al frío y a la intemperie. No tienen armas de bronce ni armaduras pesadas, solo una frágil voluntad y fogatas improvisadas para espantar a la noche. Son la primera creación de Prometeo, el titán que les dio forma con barro y les robó el fuego a los dioses.',
                art: 'assets/cartas/carta-01-mortales-de-arcadia.webp',
                effect: null, startTurn: null 
            },
            { 
                id: 'c2', name: 'Sátiro de los Bosques', kind: 'Ser', cost: 2, atk: 0, hp: 2, 
                icon: 'fa-leaf', 
                desc: 'Inicio de turno (si hay aliados): Fortalecer 1 por cada otro aliado.', 
                lore: 'De la espesura más profunda de los matorrales surge una criatura híbrida de torso humano y patas caprinas. Es un ser salvaje y caótico que no obedece a ninguna ley humana, merodeando los bordes de los caminos para asustar y desorientar a los viajeros. Es el cortejo de Dioniso, el dios del vino y el éxtasis, y su sola presencia anuncia el caos.',
                art: 'assets/cartas/carta-02-satiro-de-los-bosques.webp',
                effect: null, 
                startTurn: (self, player) => { self.atk = 0; let others = player.activeBoard.filter(c => c.uid !== self.uid && c.kind === 'Ser' && !c.dying).length; if (others > 0) { self.atk += others; queueFx({ t: 'buff', side: sideOf(player), uid: self.uid, text: '+' + others + ' ATK', icon: 'fa-arrow-trend-up' }); } } 
            },
            { 
                id: 'c3', name: 'Asterión, el Minotauro', kind: 'Ser', cost: 3, atk: 2, hp: 4, 
                icon: 'fa-cow', 
                desc: 'Sin habilidades, pero un muro solido.', 
                lore: 'De la unión prohibida entre Pasífae y el toro blanco nació Asterión, una criatura de cuerpo humano y cabeza de toro. Creció entre los muros del palacio de Cnosos, y aunque al principio no era más que un cachorro asustado, su fuerza bruta y su naturaleza salvaje comenzaron a manifestarse. La corte lo miraba con temor, y los susurros sobre la maldición de Poseidón no tardaron en recorrer los pasillos. Algunos dicen que el laberinto de Creta aún lo espera.',
                art: 'assets/cartas/carta-03-asterion-el-minotauro.webp',
                effect: null, startTurn: null 
            },
            { 
                id: 'c4', name: 'Plegaria Arcana', kind: 'Evento', cost: 1, atk: 0, hp: 0, 
                icon: 'fa-hands-praying', 
                desc: 'Al entrar: Gloria 4.', 
                lore: 'Ante el terror de la oscuridad, los jefes de las tribus alzan las manos al cielo estrellado y elevan sus primeros cánticos y ofrendas. Esta devoción pura resuena por primera vez en las alturas, atrayendo la atención de fuerzas invisibles. Es la primera vez que los mortales invocan a Zeus, el rey de los dioses.',
                art: 'assets/cartas/carta-04-plegaria-arcana.webp',
                effect: (p) => { p.score += 4; queueFx({ t: 'gloria', side: sideOf(p), text: '+4 GLORIA', icon: 'fa-hands-praying', num: 4 }); }
            },
            { 
                id: 'c5', name: 'Niebla del Caos', kind: 'Evento', cost: 2, atk: 0, hp: 0, 
                icon: 'fa-cloud', 
                desc: 'Al entrar: Debilitar 2 a todos los rivales.', 
                lore: 'Una densa penumbra inexplorada desciende de los cielos y cubre los valles arcaicos de Grecia. Esta neblina antinatural nubla el juicio de las tribus y debilita los primeros asentamientos humanos, obligándolos a dar sus primeros pasos a ciegas en la oscuridad. Es el aliento de Cronos, el titán que devora a sus hijos, filtrándose desde el Tártaro.',
                art: 'assets/cartas/carta-05-niebla-del-caos.webp',
                effect: (p, opp) => {
                    queueFx({ t: 'wave', side: sideOf(opp) });
                    opp.activeBoard.forEach(c => {
                        if (c.dying || c.noAtkRed) return;
                        if (c.reflectCharges > 0 && !c.immuneThisTurn) {
                            if (tryReflect(c, p, (rt) => { rt.atk = Math.max(0, rt.atk - 2); queueFx({ t: 'debuff', side: sideOf(p), uid: rt.uid, text: '-2 ATK', icon: 'fa-cloud' }); })) return;
                        }
                        let d = bloqueoAbsorb(c, 2);
                        if (d > 0) { c.atk = Math.max(0, c.atk - d); queueFx({ t: 'debuff', side: sideOf(opp), uid: c.uid, text: '-' + d + ' ATK', icon: 'fa-cloud', overlay: 'fog' }); }
                    });
                }
            },
            { 
                id: 'c6', name: 'Ninfas de las Fuentes Secas', kind: 'Ser', cost: 2, atk: 1, hp: 2, 
                icon: 'fa-water', 
                desc: 'Al entrar: Debilitar 1 a Fila 1 rival.', 
                lore: 'Las protectoras de los manantiales sufren la corrupción de la niebla. Al verse marchitas y sin agua pura, pierden la razón y se convierten en espectros errantes que lloran desconsoladamente, confundiendo con sus cantos a cualquiera que se acerque. Son las ninfas de Poseidón, hijas del mar y de los ríos, ahora corrompidas por el Caos.',
                art: 'assets/cartas/carta-06-ninfas-de-las-fuentes-secas.webp',
                effect: (p, opp) => {
                    let t = opp.activeBoard[0];
                    if (!t || t.dying || t.noAtkRed) return;
                    if (t.reflectCharges > 0 && !t.immuneThisTurn) {
                        if (tryReflect(t, p, (rt) => { rt.atk = Math.max(0, rt.atk - 1); queueFx({ t: 'debuff', side: sideOf(p), uid: rt.uid, text: '-1 ATK', icon: 'fa-water' }); })) return;
                    }
                    let d = bloqueoAbsorb(t, 1);
                    if (d > 0) { t.atk = Math.max(0, t.atk - d); queueFx({ t: 'debuff', side: sideOf(opp), uid: t.uid, text: '-' + d + ' ATK', icon: 'fa-water', overlay: 'tears' }); }
                }, startTurn: null
            },
            { 
                id: 'c7', name: 'Jabalí de Erimanto', kind: 'Ser', cost: 5, atk: 4, hp: 6,
                icon: 'fa-hippo', 
                desc: 'Embestida 1: Daño 2 a 1 rival aleatorio.', 
                lore: 'Desde las cumbres heladas desciende una bestia descomunal: un jabalí salvaje de piel acorazada y colmillos afilados que arrasa con los primeros cultivos y siembra el pánico absoluto en las laderas de Arcadia. Los pastores susurran su nombre con terror, pues no hay lanza ni trampa que pueda detenerlo. Es una de las bestias primigenias que habitan las montañas, un recordatorio de que la naturaleza salvaje aún no ha sido domesticada por los hombres.',
                art: 'assets/cartas/carta-07-jabali-de-erimanto.webp',
                effect: null,
                startTurn: (self, player, opp) => {
                    embestida(self, player, opp, 1);
                },
                embestidaEffect: (self, player, opp) => {
                    let targets = opp.activeBoard.filter(c => !c.dying);
                    if (!targets.length) return;
                    let target = targets[Math.floor(Math.random() * targets.length)];
                    dealDamage(target, 2, sideOf(opp));
                    queueFx({ t: 'clash', side: sideOf(opp), uidA: self.uid, uidB: target.uid });
                }
            },
            { 
                id: 'c8', name: 'Oráculo Ciego', kind: 'Ser', cost: 2, atk: 1, hp: 1,
                icon: 'fa-eye-slash', 
                desc: 'Al entrar: Descuento 1 a tu siguiente Evento.', 
                lore: 'En una cueva donde los vapores de la tierra escapan por las grietas, un anciano inhala los efluvios telúricos. Entra en un profundo trance y comienza a escupir profecías indescifrables sobre un destino escrito con sangre y bronce. Es un oráculo de Apolo, el dios de la profecía, y sus palabras son tan oscuras como el futuro que anuncian.',
                art: 'assets/cartas/carta-08-oraculo-ciego.webp',
                effect: (p) => { p.pendingEventDiscount = (p.pendingEventDiscount || 0) + 1; queueFx({ t: 'discount', side: sideOf(p), text: '-1' }); }, startTurn: null 
            },
            { 
                id: 'c9', name: 'Pacto de Sangre en el Altar de Piedra', kind: 'Evento', cost: 5, atk: 0, hp: 0,
                icon: 'fa-droplet', 
                desc: 'Sacrificio 4: Gloria 4. Destruir 1 rival con menos HP.', 
                lore: 'Desesperados por detener las malas cosechas y los ataques, los mortales construyen altares toscos de roca y entregan la vida de sus cazadores en un ritual oscuro para apaciguar a las fuerzas que los acechan. Es un pacto con Hades, el dios del inframundo, que acepta la sangre como moneda de cambio.',
                art: 'assets/cartas/carta-09-pacto-de-sangre.webp',
                effect: (p, opp) => {
                    sacrificio(p, 4, () => {
                        p.score += 4;
                        queueFx({ t: 'gloria', side: sideOf(p), text: '+4 GLORIA', icon: 'fa-droplet', num: 4 });
                        let alive = opp.activeBoard.filter(c => !c.dying && !c.noDestroy && !c.stunned);
                        if (alive.length > 0) {
                            let weakest = alive.reduce((min, c) => c.hp < min.hp ? c : min, alive[0]);
                            killCard(weakest, sideOf(opp));
                            queueFx({ t: 'sacrifice', side: sideOf(opp), uid: weakest.uid });
                        }
                    });
                }
            },
            {
                id: 'c10', name: 'Ecos del Bosque de Dodona', kind: 'Evento', cost: 1, atk: 0, hp: 0,
                icon: 'fa-tree',
                desc: 'Al entrar: Debilitar 1 a todos los Seres.',
                lore: 'Los robles milenarios de los bosques sagrados guardan secretos antiguos. Cuando los intrusos se adentran sin respeto, las hojas y el viento susurran nombres prohibidos que paralizan la voluntad y confunden las mentes de los enemigos. Es el santuario oracular más antiguo de Zeus, donde los robles susurran sus profecías y su poder debilita a los incrédulos.',
                art: 'assets/cartas/carta-10-ecos-de-dodona.webp',
                effect: (p, opp) => {
                    [p, opp].forEach(owner => {
                        let other = owner === p ? opp : p;
                        queueFx({ t: 'wave', side: sideOf(owner) });
                        owner.activeBoard.forEach(c => {
                            if (c.dying || c.noAtkRed) return;
                            if (c.reflectCharges > 0 && !c.immuneThisTurn) {
                                if (tryReflect(c, other, (rt) => { rt.atk = Math.max(0, rt.atk - 1); queueFx({ t: 'debuff', side: sideOf(other), uid: rt.uid, text: '-1 ATK', icon: 'fa-leaf' }); })) return;
                            }
                            let d = bloqueoAbsorb(c, 1);
                            if (d > 0) { c.atk = Math.max(0, c.atk - d); queueFx({ t: 'debuff', side: sideOf(owner), uid: c.uid, text: '-' + d + ' ATK', icon: 'fa-leaf', overlay: 'leaf' }); }
                        });
                    });
                }
            },
{
    id: 'a2', name: 'Asterion, Enfurecido', kind: 'Ser', cost: 5, atk: 2, hp: 4,
    icon: 'fa-cow',
    desc: 'Enfurecer 4: Destruir 1 rival aleatorio.',
    lore: 'El cachorro se convirtio en una bestia. Asterion probo la sangre humana y algo se rompio en su interior: ya no distinguia entre el hambre y la furia. Minos, aterrado por lo que su propio pecado habia engendrado, ordeno a Dedalo construir un laberinto para encerrarlo.',
    art: 'assets/cartas/asterion-a2-enfurecido.webp',
    substory: 'asterion',
    effect: null,
    startTurn: null,
    enfurecerThreshold: 4,
    enfurecerEffect: (self, player) => {
        // El motor pasa (target, owner): el lado rival se deriva del owner.
        let opp = (player === gameState.p1) ? gameState.p2 : gameState.p1;
        let alive = opp.activeBoard.filter(c => !c.dying && !c.noDestroy && !c.stunned);
        if (!alive.length) return;
        let target = alive[Math.floor(Math.random() * alive.length)];
        killCard(target, sideOf(opp));
        queueFx({ t: 'sacrifice', side: sideOf(opp), uid: target.uid });
    }
},
{
    id: 'a3', name: 'Asterión, el Señor del Laberinto', kind: 'Ser', cost: 7, atk: 6, hp: 4,
    icon: 'fa-maze',
    desc: 'Al entrar: Exilio 2 a 1 rival aleatorio.',
    lore: 'Encerrado en el laberinto de Cnosos, Asterión aprendió a moverse entre sus muros como si fueran una extensión de su propio cuerpo. Conocía cada rincón, cada trampa, cada sombra. Los que osaban entrar en su dominio no encontraban la salida, y la bestia los acechaba desde la oscuridad.',
    art: 'assets/cartas/asterion-a3-senor-laberinto.webp',
    substory: 'asterion',
    effect: (p, opp) => { exilio(p, opp, 2); },
    startTurn: null
},
{
    id: 'a4', name: 'El Toro Blanco de Creta', kind: 'Ser', cost: 4, atk: 1, hp: 5,
    icon: 'fa-cow',
    desc: 'Al entrar: Bloqueo 2.',
    lore: 'Poseidón hizo emerger del mar un toro blanco como la espuma, un regalo sagrado para Minos, rey de Creta. El animal era de una belleza sobrecogedora, y Minos, incapaz de alzar la mano contra él, lo conservó en sus dominios. Pero la afrenta no quedó impune: Poseidón encendió en el corazón de Pasífae una pasión prohibida por el toro.',
    art: 'assets/cartas/asterion-a4-toro-blanco.webp',
    substory: 'asterion',
    effect: null,
    startTurn: null
},
{
    id: 'a5', name: 'Teseo en el Laberinto', kind: 'Ser', cost: 5, atk: 4, hp: 4,
    icon: 'fa-scroll',
    desc: 'Al entrar: Gloria 2 por cada aliado en el tablero.',
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
    id: 'a6', name: 'Pasífae, la Reina de Creta', kind: 'Ser', cost: 2, atk: 0, hp: 2,
    icon: 'fa-crown',
    desc: 'Al entrar: Blindar 1 a todos tus Asterion (tablero + mazo).',
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
    id: 'a7', name: 'Dédalo, el Arquitecto', kind: 'Ser', cost: 3, atk: 1, hp: 4,
    icon: 'fa-compass-drafting',
    desc: 'Al entrar: Invocar 1 Vaca de Madera Hueca.',
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
    id: 'a8', name: 'Vaca de Madera Hueca', kind: 'Token', cost: 0, atk: 0, hp: 1,
    icon: 'fa-horse',
    desc: 'Al morir: Invocar 1 Asterion, el Minotauro.',
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
    id: 'a9', name: 'El Nacimiento del Minotauro', kind: 'Evento', cost: 3, atk: 0, hp: 0,
    icon: 'fa-egg',
    desc: 'Al entrar: Invocar 1 Asterion, el Minotauro.',
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
    id: 'a10', name: 'El Laberinto de Creta', kind: 'Evento', cost: 4, atk: 0, hp: 0,
    icon: 'fa-dungeon',
    desc: 'Al entrar: Exilio 2 a 1 rival aleatorio.',
    lore: 'En las profundidades del palacio de Cnosos, bajo los cimientos de piedra, se extiende una red de pasillos que no llevan a ninguna parte. Sus muros son fríos, sus antorchas no dan calor, y el aire huele a polvo y a miedo. Quien entra en el Laberinto de Creta no encuentra la salida: encuentra el silencio, y luego los pasos de algo que se arrastra en la oscuridad.',
    art: 'assets/cartas/asterion-a10-construccion-laberinto.webp',
    substory: 'asterion',
    effect: (p, opp) => { exilio(p, opp, 2); },
    startTurn: null
},
{
    id: 'a11', name: 'La Muerte del Minotauro', kind: 'Evento', cost: 2, atk: 0, hp: 0,
    icon: 'fa-skull',
    desc: 'Al entrar: Daño 4 al rival con mas ATK.',
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
    id: 'b0', name: 'Serpientes de la Cabeza', kind: 'Token', cost: 0, atk: 1, hp: 1,
    icon: 'fa-snake',
    desc: 'Sin habilidades. Las serpientes del cabello de Medusa buscan venganza.',
    lore: 'Las serpientes del cabello de Medusa siguen vivas incluso después de la muerte de su portadora. Buscan venganza con colmillos pequeños pero certeros.',
    art: 'assets/cartas/medusa-b0-serpientes-cabeza.webp',
    substory: 'medusa',
    effect: null, startTurn: null
},
{
    id: 'b1', name: 'Medusa, la Doncella', kind: 'Ser', cost: 2, atk: 0, hp: 3,
    icon: 'fa-user',
    desc: 'Al entrar: Gloria 1 por cada Ser aliado en el tablero.',
    lore: 'Antes de la maldición, Medusa era la más bella de las sacerdotisas de Atenea. Su cabello dorado caía como una cascada y su voz calmaba a las bestias. Los hombres cruzaban el mar solo para verla, y ella, orgullosa, se atrevió a compararse con la diosa.',
    art: 'assets/cartas/medusa-b1-doncella.webp',
    substory: 'medusa',
    effect: (p) => {
        let n = p.activeBoard.filter(c => !c.dying && !c.stunned).length;
        if (n > 0) { p.score += n; queueFx({ t: 'gloria', side: sideOf(p), text: '+' + n + ' GLORIA', icon: 'fa-user', num: n }); }
    },
    startTurn: null
},
{
    id: 'b2', name: 'Medusa, la Gorgona', kind: 'Ser', cost: 6, atk: 2, hp: 2,
    icon: 'fa-snake',
    desc: 'Al entrar: Exilio 2 a 1 rival aleatorio. Inicio de turno (si esta en Fila 1): Daño 1 a Fila 1 rival. Al morir: Invocar 2 Serpientes de la Cabeza.',
    lore: 'Atenea no distinguió entre el culpable y la víctima. El cabello de Medusa se enroscó en serpientes, y su mirada se volvió piedra. Huyó al norte, donde las Gorgonas la acogieron, y desde entonces ningún hombre que la mirara volvió a contar lo que vio.',
    art: 'assets/cartas/medusa-b2-gorgona.webp',
    substory: 'medusa',
    effect: (p, opp) => { exilio(p, opp, 2); },
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
    id: 'b3', name: 'Esteno, la Fuerte', kind: 'Ser', cost: 4, atk: 3, hp: 3, bloqueo: 2,
    icon: 'fa-shield-halved',
    desc: 'Al entrar: Bloqueo 2.',
    lore: 'La mayor de las Gorgonas, hija de Forcis y Ceto. Su fuerza era tal que podía detener a un toro con una mano. Cuando Medusa llegó al norte, Esteno la abrazó como a una hermana y juró protegerla de los hombres que la buscaban.',
    art: 'assets/cartas/medusa-b3-esteno.webp',
    substory: 'medusa',
    effect: null, startTurn: null
},
{
    id: 'b4', name: 'Euríale, la Errante', kind: 'Ser', cost: 3, atk: 2, hp: 3,
    icon: 'fa-eye',
    desc: 'Al entrar: Debilitar 1 a Fila 1 rival.',
    lore: 'La tercera Gorgona, errante y silenciosa. Se dice que podía ver el futuro en el vuelo de los cuervos. Fue ella quien advirtió a Medusa de que un héroe con sandalias aladas cruzaba el mar, pero Medusa ya no podía escuchar.',
    art: 'assets/cartas/medusa-b4-euriale.webp',
    substory: 'medusa',
    effect: (p, opp) => {
        let t = opp.activeBoard[0];
        if (!t || t.dying || t.noAtkRed) return;
        if (t.reflectCharges > 0 && !t.immuneThisTurn) {
            if (tryReflect(t, p, (rt) => { rt.atk = Math.max(0, rt.atk - 1); queueFx({ t: 'debuff', side: sideOf(p), uid: rt.uid, text: '-1 ATK', icon: 'fa-eye' }); })) return;
        }
        let d = bloqueoAbsorb(t, 1);
        if (d > 0) { t.atk = Math.max(0, t.atk - d); queueFx({ t: 'debuff', side: sideOf(opp), uid: t.uid, text: '-' + d + ' ATK', icon: 'fa-eye' }); }
    },
    startTurn: null
},
{
    id: 'b5', name: 'El Escudo Espejo', kind: 'Evento', cost: 2, atk: 0, hp: 0,
    icon: 'fa-shield-halved',
    desc: 'Al entrar: Reflejo 1 a todos los aliados.',
    lore: 'Atenea entregó a Perseo un escudo pulido como un espejo. "No la mires a los ojos", le dijo. "Mírala en el reflejo". El héroe avanzó por la cueva con el escudo en alto, y las serpientes de Medusa se reflejaron en el bronce antes de que pudieran alcanzarlo.',
    art: 'assets/cartas/medusa-b5-escudo-espejo.webp',
    substory: 'medusa',
    effect: (p) => {
        let alive = p.activeBoard.filter(c => !c.dying);
        if (!alive.length) return;
        alive.forEach(c => {
            c.reflectCharges = (c.reflectCharges || 0) + 1;
            queueFx({ t: 'buff', side: sideOf(p), uid: c.uid, text: 'REFLEJO 1', icon: 'fa-shield-halved' });
        });
    },
    startTurn: null
},
{
    id: 'b6', name: 'Las Sandalias Aladas', kind: 'Evento', cost: 2, atk: 0, hp: 0,
    icon: 'fa-shoe-prints',
    desc: 'Al entrar: Fortalecer 2 al aliado con mas ATK.',
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
    id: 'b7', name: 'El Casco de Invisibilidad', kind: 'Evento', cost: 2, atk: 0, hp: 0,
    icon: 'fa-ghost',
    desc: 'Al entrar: Inmune 1 a todos los aliados.',
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
    id: 'b8', name: 'Pegaso, el Nacido de la Sangre', kind: 'Ser', cost: 5, atk: 3, hp: 4,
    icon: 'fa-horse',
    desc: 'Al entrar: Gloria 2 + Fortalecer 1 a todos los aliados.',
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
    id: 'b9', name: 'Crisaor, el de la Espada de Oro', kind: 'Ser', cost: 4, atk: 3, hp: 3,
    icon: 'fa-sword',
    desc: 'Al entrar: Fortalecer 1 a todos los aliados.',
    lore: 'El hermano de Pegaso, nacido de la misma sangre. Crisaor empuñaba una espada de oro que ningún mortal podía mirar sin deslumbrarse. Se dice que fue él quien recogió la cabeza de Medusa del suelo, y que la entregó a Atenea con sus propias manos.',
    art: 'assets/cartas/medusa-b9-crisaor.webp',
    substory: 'medusa',
    effect: (p) => {
        p.activeBoard.forEach(c => { if (!c.dying) { c.atk += 1; queueFx({ t: 'buff', side: sideOf(p), uid: c.uid, text: '+1 ATK', icon: 'fa-sword' }); } });
    },
    startTurn: null
},
{
    id: 'b10', name: 'La Mirada de Piedra', kind: 'Evento', cost: 4, atk: 0, hp: 0,
    icon: 'fa-eye-slash',
    desc: 'Al entrar x2: Exilio 2 a 1 rival aleatorio.',
    lore: 'Quien mire a los ojos de la Gorgona se convierte en piedra. No hay escudo que valga, no hay dios que proteja. La mirada de Medusa es la mirada de Atenea: fría, justa, implacable. Y la piedra que deja no es un castigo: es una advertencia.',
    art: 'assets/cartas/medusa-b10-mirada-piedra.webp',
    substory: 'medusa',
    effect: (p, opp) => {
        exilio(p, opp, 2);
        exilio(p, opp, 2);
    },
    startTurn: null
},
{
    id: 'e1', name: 'León de Nemea', kind: 'Ser', subtype: 'Vástago', cost: 5, atk: 2, hp: 4,
    icon: 'fa-paw',
    desc: 'Al entrar: Bloqueo 4.',
    lore: 'En los bosques entre Nemea y Cleone, en la Argólide, vive una bestia que no es un animal. Su pelaje dorado brilla como el oro bajo la luna, y su piel es tan dura que ninguna lanza, espada o flecha puede rasgarla. Es el hijo de Tifón y Equidna, engendrado por la sangre de los monstruos, pero fue Hera quien lo crió en los montes de Nemea y lo dejó crecer para castigar a los mortales que olvidaron rendirle culto. Los pastores han aprendido a no cruzar los límites del bosque, y los rebaños desaparecen uno a uno sin que nadie encuentre rastro. No es un depredador: es un castigo divino.',
    art: 'assets/cartas/e1-leon-de-nemea.webp',
    effect: null, startTurn: null, bloqueo: 4
},
{
    id: 'e2', name: 'Equidna, la Madre de Monstruos', kind: 'Ser', cost: 7, atk: 0, hp: 4,
    icon: 'fa-snake',
    desc: 'Inicio de turno (si es la ultima carta de tu columna): Invocar 1 Vastago aleatorio.',
    lore: 'En una cueva de la Argólide, entre rocas húmedas y sombras, vive Equidna: mitad mujer, mitad serpiente. Su cuerpo se arrastra por la piedra con un susurro húmedo, y sus ojos brillan en la oscuridad como ascuas. Su voz hiela la sangre de quien la escucha. No lucha, no caza, no huye: pare. Y cada cría que sale de su vientre es un nuevo terror para Grecia.',
    art: 'assets/cartas/e2-equidna-madre-monstruos.webp',
    effect: null,
    startTurn: (self, player, opp) => {
        if (player.activeBoard[player.activeBoard.length - 1] !== self) return;
        if (self.dying) return;
        invocarVastago(player);
    }
},
{
    id: 'e3', name: 'Heracles, el Héroe', kind: 'Ser', cost: 8, atk: 3, hp: 5,
    icon: 'fa-user-shield',
    desc: 'Al entrar: Destruir 1 rival con coste >= 5.',
    lore: 'Heracles es un hombre de hombros anchos y músculos tensos como cuerdas de arco. Su piel curtida por el sol y el polvo de los caminos, y su mirada lleva el peso de las doce pruebas que Euristeo le impuso. Hijo de Zeus y de una mortal, cargó desde niño con la envidia de Hera, que lo persiguió incluso antes de nacer. No lucha por gloria: lucha por redención. Y cada monstruo que cae bajo su maza es un paso más hacia el Olimpo.',
    art: 'assets/cartas/e3-heracles-el-heroe.webp',
    effect: (p, opp) => {
        destruirSerCosteAlto(opp, 5);
    },
    startTurn: null
},
{
    id: 'e5', name: 'Hidra de Lerna', kind: 'Ser', subtype: 'Vástago', cost: 5, atk: 0, hp: 1,
    icon: 'fa-snake',
    desc: 'Al morir: Invocar 3 Hidra de Lerna (tokens 2/1).',
    lore: 'En los pantanos de Lerna, entre aguas estancadas y juncos podridos, vive la Hidra: una serpiente de nueve cabezas, con escamas verdes como el musgo y aliento venenoso. Por cada cabeza que pierde, le nacen dos más. Su sangre es un veneno que no tiene cura, y su sola presencia envenena el aire. No es una bestia: es una plaga.',
    art: 'assets/cartas/e5-hidra-de-lerna.webp',
    effect: null,
    startTurn: null,
    onDeath: (owner) => {
        let tpl = ALL_CARDS.find(c => c.id === 'e5_token');
        if (tpl) { summonCard(owner, tpl); summonCard(owner, tpl); summonCard(owner, tpl); }
    }
},
{
    id: 'e5_token', name: 'Hidra de Lerna', kind: 'Token', cost: 0, atk: 2, hp: 1,
    icon: 'fa-snake',
    desc: 'Sin habilidades.',
    lore: 'Le cortaron una cabeza a la Hidra. Pero su cuerpo no cayó: se retorció, y de la herida brotó otra cabeza. Es la misma Hidra, más pequeña, más débil, pero viva. Y mientras quede una sola cabeza, la plaga no habrá terminado.',
    // Mismo arte que e5: el token representa la misma Hidra renacida.
    art: 'assets/cartas/e5-hidra-de-lerna.webp',
    effect: null, startTurn: null
},
{
    id: 'talos', name: 'El Talos', kind: 'Ser', cost: 8, atk: 5, hp: 7,
    icon: 'fa-robot',
    desc: 'Al entrar: Daño 2 a todos los rivales.',
    lore: 'En las costas de Creta, un gigante de bronce patrulla la isla. Su cuerpo es metal pulido, sus ojos son ascuas, y su piel no conoce el dolor. Tres veces al día recorre las playas, y a quien se acerca a la orilla le lanza rocas del tamaño de un hombre. No es un dios ni un monstruo: es una máquina, la obra maestra de Dédalo. Y como toda obra maestra, tiene un punto débil: un clavo en el tobillo que guarda su vida.',
    art: 'assets/cartas/dedalo-talos-guardian-de-creta.webp',
    effect: (p, opp) => {
        opp.activeBoard.filter(c => !c.dying).slice().forEach(c => {
            dealDamage(c, 2, sideOf(opp));
            queueFx({ t: 'debuff', side: sideOf(opp), uid: c.uid, text: '-2 HP', icon: 'fa-robot', overlay: 'hit', pulse: 'fx-shake' });
        });
    },
    startTurn: null
},
{
    id: 'fuego', name: 'Mortales del Fuego', kind: 'Ser', cost: 3, atk: 2, hp: 2,
    icon: 'fa-fire',
    desc: 'Al entrar: Fortalecer 1 a todos tus Seres.',
    lore: 'Prometeo robo una chispa del carro de Helios y la escondio en una cana hueca. Cuando la entrego a los mortales, les dio el primer poder divino: el fuego. Con el aprendieron a forjar el bronce, a cocinar el grano y a iluminar la noche. Pero cada llama que encendian era una afrenta a Zeus, y el titan pagaria su osadia con una condena eterna.',
    art: 'assets/cartas/mortales-fuego.webp',
    substory: 'mortales',
    effect: (p) => {
        p.activeBoard.forEach(c => {
            if (c.dying) return;
            if (c.id === 'c1' || c.id === 'fuego' || c.id === 'muros') {
                c.atk += 1;
                queueFx({ t: 'buff', side: sideOf(p), uid: c.uid, text: '+1 ATK', icon: 'fa-fire' });
            }
        });
    },
    startTurn: null
},
{
    id: 'muros', name: 'Mortales de los Muros', kind: 'Ser', cost: 4, atk: 1, hp: 5,
    icon: 'fa-monument', bloqueo: 2,
    desc: 'Al entrar: Bloqueo 2.',
    lore: 'Con el fuego llego el bronce, y con el bronce, las herramientas. Los mortales levantaron muros de piedra ciclopea, tan pesados que solo los gigantes de un ojo podrian haberlos movido. Micenas, Tirinto, Argos: ciudades amuralladas que resistieron el asedio de los siglos. Pero ningun muro detiene a los dioses, y los mortales lo sabian.',
    art: 'assets/cartas/mortales-muros.webp',
    substory: 'mortales',
    effect: null,
    startTurn: null
},
{
    id: 'sat_cortejo', name: 'Satiro del Cortejo', kind: 'Ser', cost: 3, atk: 1, hp: 3,
    icon: 'fa-wine-glass',
    desc: 'Al entrar: Fortalecer 1 a todos los aliados.',
    lore: 'Cuando el vino corre y la flauta suena, el satiro deja de ser un pastor solitario y se convierte en el alma del cortejo. Con los cuernos mas largos y la mirada encendida, lidera a los demas satiros en danzas que duran hasta el amanecer. Los que lo siguen no envejecen, pero tampoco recuerdan su nombre al dia siguiente. Dioniso lo ama, y por eso le concede el don de encender la sangre de sus hermanos.',
    art: 'assets/cartas/satiro-sat-cortejo.webp',
    substory: 'satiro',
    effect: (p) => {
        p.activeBoard.forEach(c => {
            if (c.dying) return;
            c.atk += 1;
            queueFx({ t: 'buff', side: sideOf(p), uid: c.uid, text: '+1 ATK', icon: 'fa-wine-glass' });
        });
    },
    startTurn: null
},
{
    id: 'sat_pan', name: 'Pan, el del Grito', kind: 'Ser', cost: 4, atk: 1, hp: 5,
    icon: 'fa-bullhorn',
    desc: 'Al entrar: Exilio 1 a Fila 1 rival.',
    lore: 'Pan es el mas antiguo de los satiros, el que tocaba la flauta en las cumbres de Arcadia cuando los dioses aun no tenian nombre. Los pastores le ofrecen leche y miel para que cuide de sus rebanos, y el, a cambio, les ensena los secretos de la musica. Pero Pan es tambien el dios del panico: cuando grita, los ejercitos huyen sin saber por que. En la Batalla de Maraton, su voz helo la sangre de los persas, y desde entonces los hombres llaman "panico" al miedo que no tiene causa.',
    art: 'assets/cartas/satiro-sat-pan.webp',
    substory: 'satiro',
    effect: (p, opp) => { exilio(p, opp, 1); },
    startTurn: null
},
{
    id: 'altar_zeus', name: 'El Altar de Zeus', kind: 'Evento', cost: 2, atk: 0, hp: 0,
    icon: 'fa-monument',
    desc: 'Al entrar: Fortalecer 2 a todos los aliados.',
    lore: 'La plegaria no cayo en el vacio. Sobre la colina sagrada, donde los pastores habian alzado sus manos al cielo, un rayo partio el aire y encendio un fuego que no se apagaba. Los mortales comprendieron que Zeus los habia escuchado, y levantaron un altar de piedra negra en su honor. Desde entonces, cada tribu que se acercaba al altar recibia una chispa de la voluntad del dios: los guerreros sentian fuerza en los brazos, los ancianos veian el futuro en el humo, y los ninos crecian sin miedo a la noche.',
    art: 'assets/cartas/plegaria-altar-de-zeus.webp',
    substory: 'plegaria',
    effect: (p) => {
        p.activeBoard.forEach(c => {
            if (c.dying) return;
            c.atk += 2;
            queueFx({ t: 'buff', side: sideOf(p), uid: c.uid, text: '+2 ATK', icon: 'fa-monument' });
        });
    },
    startTurn: null
},
{
    id: 'tocado_rayo', name: 'El Tocado por el Rayo', kind: 'Ser', cost: 5, atk: 1, hp: 1,
    icon: 'fa-bolt',
    desc: 'Al entrar: Destruir 1 rival con coste >= 4.',
    lore: 'Zeus no solo escucho: eligio. Entre los mortales que se arrodillaban ante el altar, uno fue tocado por el rayo. Su carne se volvio bronce, sus ojos se encendieron con la luz del Olimpo, y su voz sono como un trueno. Los demas mortales lo llamaron "el Tocado", y el camino entre ellos no como un rey, sino como un heraldo de la voluntad de Zeus. Cuando el Tocado alzaba su lanza, los enemigos de la Helade temblaban, porque sabian que no luchaban contra un hombre, sino contra el mismisimo padre de los dioses.',
    art: 'assets/cartas/plegaria-tocado-por-el-rayo.webp',
    substory: 'plegaria',
    effect: (p, opp) => {
        let targets = opp.activeBoard.filter(c => !c.dying && c.cost >= 4 && !c.noDestroy);
        if (!targets.length) return;
        let target = targets.reduce((max, c) => c.cost > max.cost ? c : max, targets[0]);
        killCard(target, sideOf(opp));
        queueFx({ t: 'sacrifice', side: sideOf(opp), uid: target.uid });
    },
    startTurn: null
},
{
    id: 'sombra_niebla', name: 'La Sombra en la Niebla', kind: 'Ser', cost: 3, atk: 2, hp: 2,
    icon: 'fa-ghost',
    desc: 'Inicio de turno (si hay un Ser exiliado): Exilio 1 a 1 rival aleatorio.',
    lore: 'La niebla no era solo niebla. Los mortales que se adentraban en ella empezaron a ver formas: primero sombras, luego siluetas, luego ojos que los miraban desde la oscuridad. La Sombra no es un hombre ni una bestia: es la niebla misma tomando forma, un reflejo de los miedos de quien la mira. Los que se cruzan con ella sienten que el mundo se estrecha, que el aire se vuelve pesado, que sus propios pensamientos se vuelven contra ellos. La Sombra no ataca: te envuelve. Y cuando te envuelve, ya no sabes si estas vivo o si siempre has sido parte de la niebla.',
    art: 'assets/cartas/niebla-sombra-en-la-niebla.webp',
    substory: 'niebla',
    effect: null,
    startTurn: (self, player, opp) => {
        let anyExiled = opp.activeBoard.some(c => c.stunned && c.exilioTurns > 0);
        if (!anyExiled) return;
        exilio(player, opp, 1);
    }
},
{
    id: 'espectro_niebla', name: 'El Espectro de la Niebla', kind: 'Ser', cost: 5, atk: 1, hp: 1,
    icon: 'fa-ghost',
    desc: 'Al morir: Destruir 1 rival con el ATK mas alto.',
    lore: 'Los que se pierden en la niebla no mueren: se convierten en ella. El Espectro es el recuerdo de un mortal que nunca volvio, condenado a vagar por la oscuridad que lo reclamo. No tiene rostro, no tiene voz, solo una mano fria que se posa sobre el hombro de los vivos. Cuando el Espectro te toca, la niebla te reclama, y tu nombre se borra de la memoria de los hombres. Los ancianos dicen que hay tantos espectros como mortales se han perdido en la niebla desde el principio de los tiempos, y que cada uno busca lo que perdio: un nombre, un rostro, una vida que ya no recuerda.',
    art: 'assets/cartas/niebla-espectro-de-la-niebla.webp',
    substory: 'niebla',
    effect: null,
    startTurn: null,
    onDeath: (owner) => {
        let opp = owner === gameState.p1 ? gameState.p2 : gameState.p1;
        let alive = opp.activeBoard.filter(c => !c.dying && !c.noDestroy && !c.stunned);
        if (!alive.length) return;
        let target = alive.reduce((max, c) => (c.atk + (c.tempAtkMod||0)) > (max.atk + (max.tempAtkMod||0)) ? c : max, alive[0]);
        killCard(target, sideOf(opp));
        queueFx({ t: 'sacrifice', side: sideOf(opp), uid: target.uid });
    }
},
{
    id: 'canto_fuente', name: 'El Canto de la Fuente', kind: 'Evento', cost: 2, atk: 0, hp: 0,
    icon: 'fa-music',
    desc: 'Al entrar: Exilio 1 a 1 rival aleatorio. Gloria 4.',
    lore: 'Cuando la luna se refleja en el agua estancada, las ninfas corrompidas alzan su canto. No es un canto de mujer, ni de pájaro, ni de viento: es un sonido que no existe en la naturaleza, un lamento que se cuela en los oídos y borra todos los pensamientos. Los mortales que lo escuchan olvidan por qué caminaban, hacia dónde iban, quiénes eran. Se quedan quietos junto a la fuente, mirando el agua negra, hasta que el hambre o la sed los reclaman. Y entonces la ninfa los envuelve con sus brazos fríos y se los lleva al fondo, donde el agua no tiene superficie.',
    art: 'assets/cartas/ninfas-canto-de-la-fuente.webp',
    substory: 'ninfas',
    effect: (p, opp) => {
        exilio(p, opp, 1);
        p.score += 4;
        queueFx({ t: 'gloria', side: sideOf(p), text: '+4 GLORIA', icon: 'fa-music', num: 4 });
    },
    startTurn: null
},
{
    id: 'ninfa_ahogada', name: 'La Ninfa Ahogada', kind: 'Ser', cost: 5, atk: 3, hp: 3,
    icon: 'fa-water',
    desc: 'Al morir: Daño 4 a 1 rival aleatorio.',
    lore: 'La ninfa que se ahogó en su propia fuente no descansa. Se arrastra por el fondo del agua negra, con el cabello cubierto de limo y los ojos blancos como la luna. Cuando un mortal se acerca a beber, ella alarga la mano desde el fondo y lo arrastra al abismo. No lo mata: lo guarda. Los que se ahogan en la fuente no mueren, se convierten en parte de ella, y sus rostros se ven en el agua negra como sombras que gritan sin voz. La Ninfa Ahogada no busca venganza: busca compañía. Y cada mortal que se lleva es un nuevo rostro en el fondo de la fuente.',
    art: 'assets/cartas/ninfas-ninfa-ahogada.webp',
    substory: 'ninfas',
    effect: null,
    startTurn: null,
    onDeath: (owner) => {
        let opp = owner === gameState.p1 ? gameState.p2 : gameState.p1;
        let alive = opp.activeBoard.filter(c => !c.dying && !c.stunned);
        if (!alive.length) return;
        let target = alive[Math.floor(Math.random() * alive.length)];
        dealDamage(target, 4, sideOf(opp));
        queueFx({ t: 'debuff', side: sideOf(opp), uid: target.uid, text: '-4 HP', icon: 'fa-water', overlay: 'hit' });
    }
},
{
    id: 'jabali_capturado', name: 'El Jabalí Capturado', kind: 'Ser', cost: 4, atk: 2, hp: 2,
    icon: 'fa-hippo',
    desc: 'Al entrar: Debilitar 2 a todos los rivales.',
    lore: 'El Jabalí no entendía las cadenas. Había nacido en las cumbres del Erimanto, donde la nieve no se derrite y el viento aulla como un lobo. Había arrasado cultivos, había atravesado lanzas con su piel acorazada, había hecho huir a ejércitos enteros. Pero ahora estaba atado con cadenas de bronce, cargado sobre los hombros de un hombre que olía a gloria y a sudor. El Jabalí rugió, y los habitantes de Micenas huyeron aterrorizados al verlo vivo. No era la muerte lo que temían: era la bestia misma, la naturaleza salvaje que se negaba a ser domesticada. Heracles lo encerró en los establos reales, y durante la noche, los guardias temblaban al oír sus colmillos contra la piedra.',
    art: 'assets/cartas/jabali-capturado.webp',
    substory: 'jabali',
    effect: (p, opp) => {
        opp.activeBoard.forEach(c => {
            if (c.dying || c.stunned) return;
            let d = bloqueoAbsorb(c, 2);
            if (d > 0) {
                c.atk = Math.max(0, c.atk - d);
                queueFx({ t: 'debuff', side: sideOf(opp), uid: c.uid, text: '-' + d + ' ATK', icon: 'fa-hippo' });
            }
        });
    },
    startTurn: null
},
{
    id: 'colmillos_jabali', name: 'Los Colmillos del Jabalí', kind: 'Evento', cost: 2, atk: 0, hp: 0,
    icon: 'fa-tooth',
    desc: 'Al entrar: Fortalecer 2 a todos los aliados.',
    lore: 'Cuando el Jabalí cayó, los cazadores no lo enterraron. Le arrancaron los colmillos y los exhibieron en el centro del poblado, como trofeo y advertencia: la bestia que había arrasado los cultivos durante generaciones ya no volvería. Pero los colmillos seguían brillando con una luz extraña, y los que los tocaban sentían la furia del animal recorrerles los brazos: los ancianos recuperaban la fuerza de su juventud, los cobardes se volvían valientes, los guerreros sentían el impulso de embestir como el Jabalí. Los sacerdotes dijeron que los colmillos debían ser ofrecidos a Artemisa, la diosa de la caza, o la maldición del Jabalí caería sobre el pueblo. Y así se hizo: los colmillos fueron clavados en el altar de la diosa, y desde entonces, cada cazador que los toca antes de partir recibe la furia del Jabalí en sus manos.',
    art: 'assets/cartas/jabali-colmillos.webp',
    substory: 'jabali',
    effect: (p) => {
        p.activeBoard.forEach(c => {
            if (c.dying) return;
            c.atk += 2;
            queueFx({ t: 'buff', side: sideOf(p), uid: c.uid, text: '+2 ATK', icon: 'fa-tooth' });
        });
    },
    startTurn: null
},
{
    id: 'juicio_tiresias', name: 'El Juicio de Tiresias', kind: 'Ser', cost: 3, atk: 1, hp: 3,
    icon: 'fa-eye-slash',
    desc: 'Al morir: Exilio 1 a 1 rival aleatorio.',
    lore: 'Tiresias fue consultado en la disputa entre Zeus y Hera. "¿Quién disfruta más del amor, el hombre o la mujer?", preguntaron los dioses. Tiresias, que había sido hombre y mujer, respondió sin dudar: "La mujer, tres veces más". Hera, ofendida, lo cegó con un toque de sus dedos. Zeus, compadecido, le dio el don de la profecía como compensación. Desde entonces, Tiresias ve el futuro con una claridad que los dioses le concedieron a cambio de sus ojos. Pero la sentencia de Hera no fue solo la ceguera: fue el juicio mismo, que cae sobre quien se atreve a contradecir a los dioses. Y Tiresias, ciego, se convirtió en el juez de los que osan desafiar al Olimpo.',
    art: 'assets/cartas/oraculo-juicio-tiresias.webp',
    substory: 'oraculo',
    effect: null,
    startTurn: null,
    onDeath: (owner) => {
        let opp = owner === gameState.p1 ? gameState.p2 : gameState.p1;
        exilio(owner, opp, 1);
    }
},
{
    id: 'vara_tiresias', name: 'La Vara de Tiresias', kind: 'Evento', cost: 4, atk: 0, hp: 0,
    icon: 'fa-staff-snake',
    desc: 'Al entrar: Destruir 1 rival con el ATK mas alto.',
    lore: 'Tiresias caminaba con una vara de olivo que lo guiaba por el mundo. No era un simple bastón: era el símbolo de su don, la herramienta con la que tocaba el mundo y lo comprendía. Cuando Tiresias clavaba la vara en la tierra, el futuro se abría ante él como un libro. Los que se atrevían a tocar la vara sentían el peso de la profecía: no era un objeto, era una sentencia. Y cuando Tiresias murió, la vara quedó en el templo de Apolo, esperando a quien se atreviera a empuñarla. El que la empuña ve el futuro, pero también ve su propio final, y eso lo destruye.',
    art: 'assets/cartas/oraculo-vara-tiresias.webp',
    substory: 'oraculo',
    effect: (p, opp) => {
        let alive = opp.activeBoard.filter(c => !c.dying && !c.noDestroy && !c.stunned);
        if (!alive.length) return;
        let target = alive.reduce((max, c) => (c.atk + (c.tempAtkMod||0)) > (max.atk + (max.tempAtkMod||0)) ? c : max, alive[0]);
        killCard(target, sideOf(opp));
        queueFx({ t: 'sacrifice', side: sideOf(opp), uid: target.uid });
    },
    startTurn: null
},
{
    id: 'ofrenda_hades', name: 'La Ofrenda a Hades', kind: 'Evento', cost: 1, atk: 0, hp: 0,
    icon: 'fa-droplet',
    desc: 'Sacrificio 2: Fortalecer 2 a todos los aliados.',
    lore: 'El altar de piedra negra se alzaba en el centro del poblado, y sobre él, los cazadores dejaban su sangre. No era un sacrificio cualquiera: era un pacto. Hades, el dios que no escucha plegarias, aceptaba la ofrenda y, a cambio, apartaba a los males de la aldea. Pero la sangre derramada no desaparecía: se filtraba en la tierra y llegaba al Inframundo, donde los muertos la bebían y recordaban su vida. Y los que quedaban en la aldea sentían esa sangre correr por sus venas, como si los cazadores muertos les prestaran su fuerza.',
    art: 'assets/cartas/pacto-ofrenda-hades.webp',
    substory: 'pacto',
    effect: (p) => {
        sacrificio(p, 2, () => {
            p.activeBoard.forEach(c => {
                if (c.dying) return;
                c.atk += 2;
                queueFx({ t: 'buff', side: sideOf(p), uid: c.uid, text: '+2 ATK', icon: 'fa-droplet' });
            });
        });
    },
    startTurn: null
},
{
    id: 'deuda_sangre', name: 'La Deuda de Sangre', kind: 'Evento', cost: 2, atk: 0, hp: 0,
    icon: 'fa-skull',
    desc: 'Sacrificio 4: Exilio 4 a 1 rival aleatorio.',
    lore: 'El pacto se cumplió, pero los dioses no olvidan. La sangre derramada en el altar no era una ofrenda: era una deuda. Y cuando llegó el momento de pagarla, Hades envió a sus espectros para cobrar. Los mortales que habían participado en el ritual empezaron a morir uno a uno, y sus almas eran arrastradas al Inframundo. La deuda no se olvidó: cada generación, alguien debía derramar sangre en el altar para mantener a los espectros alejados. Y así, el pacto se convirtió en una cadena que nunca se rompería.',
    art: 'assets/cartas/pacto-deuda-sangre.webp',
    substory: 'pacto',
    effect: (p, opp) => {
        sacrificio(p, 4, () => {
            exilio(p, opp, 4);
        });
    },
    startTurn: null
},
{
    id: 'roble_dodona', name: 'El Roble de Dodona', kind: 'Ser', cost: 3, atk: 0, hp: 3,
    icon: 'fa-tree',
    desc: 'Al entrar: Bloqueo 3.',
    lore: 'En el centro del bosque sagrado de Dodona se alza un roble milenario, el árbol más antiguo de Grecia. Sus raíces llegan al centro de la tierra, y sus hojas susurran las profecías de Zeus cuando el viento las agita. Los sacerdotes, llamados Selloi, duermen en el suelo a su sombra y no se lavan los pies para mantener contacto con la tierra. Los que intentan talar el roble mueren antes de levantar el hacha: el árbol es sagrado, y su corteza es tan dura como el bronce. El Roble de Dodona no habla: susurra. Pero los que saben escuchar, entienden.',
    art: 'assets/cartas/dodona-roble.webp',
    substory: 'dodona',
    effect: (p) => {
        // Bloqueo 3 se inicializa en la instancia de la carta.
        // No se necesita hacer nada aqui: el motor lo lee de la plantilla.
    },
    startTurn: null,
    bloqueo: 3
},
{
    id: 'palomas_dodona', name: 'Las Palomas de Dodona', kind: 'Evento', cost: 4, atk: 0, hp: 0,
    icon: 'fa-dove',
    desc: 'Al entrar: Destruir 1 rival con el ATK mas alto.',
    lore: 'Dos palomas negras salieron de Egipto y cruzaron el mar. Una fundó el oráculo de Dodona, la otra el de Ammon en Libia. Desde entonces, las palomas de Dodona son las mensajeras de Zeus: su vuelo trae la sentencia divina, y su arrullo anuncia la muerte. Los que las ven posarse sobre el roble sagrado saben que su destino está escrito. Y cuando las palomas alzan el vuelo, el cielo se oscurece, y el hombre más fuerte del lugar cae sin vida. No es un castigo: es la voluntad de Zeus, que no tolera que los mortales olviden su poder.',
    art: 'assets/cartas/dodona-palomas.webp',
    substory: 'dodona',
    effect: (p, opp) => {
        let alive = opp.activeBoard.filter(c => !c.dying && !c.noDestroy && !c.stunned);
        if (!alive.length) return;
        let target = alive.reduce((max, c) => (c.atk + (c.tempAtkMod||0)) > (max.atk + (max.tempAtkMod||0)) ? c : max, alive[0]);
        killCard(target, sideOf(opp));
        queueFx({ t: 'sacrifice', side: sideOf(opp), uid: target.uid });
    },
    startTurn: null
},
{
    id: 'teseo_creta', name: 'Teseo en Creta', kind: 'Ser', cost: 3, atk: 1, hp: 1,
    icon: 'fa-scroll',
    desc: 'Al entrar: Descuento 2 a tu siguiente Ser.',
    lore: 'Teseo llegó a Creta con los trece jóvenes atenienses. Esa noche, Ariadna, hija del rey Minos, lo esperaba en la oscuridad. Conocía los secretos del laberinto y le entregó un ovillo de hilo: ataría un extremo a la entrada y lo desenrollaría al avanzar, para encontrar el camino de vuelta. Teseo aceptó, afiló su espada, y esperó el amanecer con el hilo de Ariadna en la mano.',
    art: 'assets/cartas/teseo-en-creta.webp',
    substory: 'teseo',
    effect: (p) => {
        p.pendingSerDiscount = (p.pendingSerDiscount || 0) + 2;
        queueFx({ t: 'discount', side: sideOf(p), text: '-2' });
    },
    startTurn: null
},
{
    id: 'medusa_cabeza', name: 'Medusa, la Cabeza', kind: 'Evento', cost: 4, atk: 0, hp: 0,
    icon: 'fa-eye-slash',
    desc: 'Al entrar: Exilio 2 a todos los rivales.',
    lore: 'Cuando Perseo cortó la cabeza de Medusa, no la enterró. La entregó a Atenea, que la clavó en el centro de su égida, el escudo divino que protegía a los héroes. Desde entonces, la cabeza de Medusa vive en el escudo de la diosa: sus ojos siguen abiertos, sus serpientes siguen moviéndose, y su mirada sigue convirtiendo en piedra a todo aquel que se atreve a mirarla. La Cabeza no es un arma: es una advertencia. Quien la ve, muere. Quien la porta, gana la guerra.',
    art: 'assets/cartas/medusa-la-cabeza.webp',
    substory: 'medusa',
    effect: (p, opp) => {
        opp.activeBoard.forEach(c => {
            if (c.dying || c.stunned) return;
            c.stunned = true;
            c.exilioTurns = 2;
            c._exilioSavedAtk = c.atk;
            c._exilioSavedHp = c.hp;
            c.atk = 0;
            c.hp = 0;
            queueFx({ t: 'exilio', side: sideOf(opp), uid: c.uid });
        });
    },
    startTurn: null
},
{
    id: 'esteno_protectora', name: 'Esteno, la Protectora de Medusa', kind: 'Ser', cost: 4, atk: 4, hp: 4,
    icon: 'fa-shield-halved',
    desc: 'Embestida 2: Blindar 2 a todos los aliados.',
    lore: 'Cuando Medusa llegó al norte, huyendo de los hombres que la buscaban, Esteno la abrazó como a una hermana. "No temas", le dijo. "Mientras yo esté a tu lado, nadie te tocará". Y así fue: Esteno se plantó en la entrada de la cueva de las Gorgonas, y ningún hombre que intentó entrar volvió a salir. Su lealtad era más fuerte que su fuerza, y su amor de hermana, más duro que su piel de bronce.',
    art: 'assets/cartas/esteno-protectora-de-medusa.webp',
    substory: 'esteno',
    effect: null,
    startTurn: (self, player, opp) => {
        if (self.atk < 2 || self.hp < 2) return;
        if (!opp.activeBoard.some(c => !c.dying)) return;
        // Embestida 2: paga 2 ATK + 2 HP, dispara Blindar 2 a todos los aliados.
        self.atk -= 2;
        self.hp -= 2;
        queueFx({ t: 'clash', side: sideOf(player), uidA: self.uid });
        if (self.hp <= 0) { self.hp = 0; self.dying = true; queueFx({ t: 'sacrifice', side: sideOf(player), uid: self.uid }); }
        player.activeBoard.forEach(c => {
            if (c.dying) return;
            c.hp += 2;
            queueFx({ t: 'buff', side: sideOf(player), uid: c.uid, text: '+2 HP', icon: 'fa-shield-halved' });
        });
    }
},
{
    id: 'esteno_vengadora', name: 'Esteno, la Vengadora', kind: 'Ser', cost: 4, atk: 3, hp: 3,
    icon: 'fa-skull',
    desc: 'Enfurecer 2: Dano 4 a 1 rival aleatorio.',
    lore: 'Cuando supo que Perseo había cortado la cabeza de Medusa, Esteno no lloró: las Gorgonas no lloran. Tomó su lanza y juró que encontraría al asesino de su hermana. Recorrió el mundo entero, de norte a sur, y donde pasaba, los hombres se convertían en piedra. Pero Perseo ya estaba en el Olimpo, protegido por los dioses, y Esteno sigue esperando la oportunidad de cobrarse la deuda.',
    art: 'assets/cartas/esteno-vengadora.webp',
    substory: 'esteno',
    effect: null,
    startTurn: null,
    enfurecerThreshold: 2,
    enfurecerEffect: (self, player) => {
        let opp = player === gameState.p1 ? gameState.p2 : gameState.p1;
        let alive = opp.activeBoard.filter(c => !c.dying && !c.stunned);
        if (!alive.length) return;
        let target = alive[Math.floor(Math.random() * alive.length)];
        dealDamage(target, 4, sideOf(opp));
        queueFx({ t: 'debuff', side: sideOf(opp), uid: target.uid, text: '-4 HP', icon: 'fa-skull', overlay: 'hit' });
    }
},
{
    id: 'euriale_advirtio', name: 'Euriale, la que Advirtió a Medusa', kind: 'Ser', cost: 3, atk: 1, hp: 1,
    icon: 'fa-eye',
    desc: 'Al entrar: Descuento 2 a tu siguiente Ser.',
    lore: 'Cuando Euriale vio en el vuelo de los cuervos que un héroe con sandalias aladas cruzaba el mar, corrió a advertir a Medusa. "Perseo viene", le dijo. "Y no viene solo: los dioses lo protegen". Pero Medusa ya no podía escuchar: la maldición de Atenea le había nublado el juicio, y su orgullo era más fuerte que la advertencia de su hermana. Euriale lo intentó de nuevo, pero Medusa la apartó con desprecio, y cuando Perseo llegó, Euriale ya no estaba.',
    art: 'assets/cartas/euriale-advirtio-a-medusa.webp',
    substory: 'euriale',
    effect: (p) => {
        p.pendingSerDiscount = (p.pendingSerDiscount || 0) + 2;
        queueFx({ t: 'discount', side: sideOf(p), text: '-2' });
    },
    startTurn: null
},
{
    id: 'euriale_lloro', name: 'Euriale, la que Lloró a Medusa', kind: 'Ser', cost: 3, atk: 2, hp: 2,
    icon: 'fa-water',
    desc: 'Al morir: Gloria 4.',
    lore: 'Cuando supo que Perseo había cortado la cabeza de Medusa, Euriale no buscó venganza: buscó el silencio. Se retiró a las montañas más altas, donde los cuervos no vuelan, y allí lloró durante siete días y siete noches. Sus lágrimas se convirtieron en los ríos que bajan de las montañas, y su dolor, en el viento que aúlla en las cumbres. Desde entonces, Euriale no vuelve a ver el futuro: solo ve el pasado, y el pasado está lleno de Medusa.',
    art: 'assets/cartas/euriale-lloro-a-medusa.webp',
    substory: 'euriale',
    effect: null,
    startTurn: null,
    onDeath: (owner) => {
        owner.score += 4;
        queueFx({ t: 'gloria', side: sideOf(owner), text: '+4 GLORIA', icon: 'fa-water', num: 4 });
    }
},
{
    id: 'pegaso_belerofonte', name: 'Pegaso, el que Derribo a Belerofonte', kind: 'Ser', cost: 4, atk: 3, hp: 3,
    icon: 'fa-horse',
    desc: 'Al entrar: Dano 3 a 1 rival aleatorio.',
    lore: 'Pegaso llevo a Belerofonte a la victoria contra la Quimera y las Amazonas, pero el heroe se volvio arrogante. Cuando Belerofonte quiso volar al Olimpo para sentarse entre los dioses, Pegaso se nego. El caballo alado derribo a su jinete en pleno vuelo, y Belerofonte cayo a la tierra, condenado a vagar ciego y solo. Pegaso volvio al Olimpo, fiel a Zeus, y desde entonces ningun mortal volvio a montarlo.',
    art: 'assets/cartas/pegaso-belerofonte.webp',
    substory: 'pegaso',
    effect: (p, opp) => {
        let alive = opp.activeBoard.filter(c => !c.dying && !c.stunned);
        if (!alive.length) return;
        let target = alive[Math.floor(Math.random() * alive.length)];
        dealDamage(target, 3, sideOf(opp));
        queueFx({ t: 'debuff', side: sideOf(opp), uid: target.uid, text: '-3 HP', icon: 'fa-horse', overlay: 'hit' });
    },
    startTurn: null
},
{
    id: 'pegaso_zeus', name: 'Pegaso, el Corcel de Zeus', kind: 'Ser', cost: 5, atk: 3, hp: 3,
    icon: 'fa-bolt',
    desc: 'Al entrar: Fortalecer 2 a todos los aliados.',
    lore: 'Tras la caida de Belerofonte, Pegaso volvio al Olimpo y se convirtio en el corcel de Zeus. Desde entonces, lleva el rayo del dios a traves del cielo, y su vuelo anuncia la tormenta. Los mortales que ven su silueta entre las nubes saben que Zeus los observa, y que su furia puede caer en cualquier momento. Pero Pegaso no es un arma: es un mensajero, y su vuelo trae tanto la bendicion como el castigo.',
    art: 'assets/cartas/pegaso-corcel-de-zeus.webp',
    substory: 'pegaso',
    effect: (p) => {
        p.activeBoard.forEach(c => {
            if (c.dying) return;
            c.atk += 2;
            queueFx({ t: 'buff', side: sideOf(p), uid: c.uid, text: '+2 ATK', icon: 'fa-bolt' });
        });
    },
    startTurn: null
},
{
    id: 'crisaor_cabeza', name: 'Crisaor, el que Recogio la Cabeza de Medusa', kind: 'Ser', cost: 4, atk: 2, hp: 3,
    icon: 'fa-sword',
    desc: 'Al entrar: Exilio 1 a 1 rival aleatorio.',
    lore: 'Cuando Perseo corto la cabeza de Medusa, nadie se atrevio a tocarla. Las serpientes seguian moviendose, y la mirada de piedra aun brillaba en los ojos vacios. Pero Crisaor, nacido de la misma sangre que Medusa, se acerco sin miedo. Recogio la cabeza con sus propias manos y la entrego a Atenea, que la clavo en su egida, y desde entonces su espada de oro protege el trofeo de los que osan robarlo.',
    art: 'assets/cartas/crisaor-cabeza-de-medusa.webp',
    substory: 'crisaor',
    effect: (p, opp) => {
        exilio(p, opp, 1);
    },
    startTurn: null
},
{
    id: 'crisaor_gerion', name: 'Crisaor, el Padre de Gerion', kind: 'Ser', cost: 4, atk: 2, hp: 2,
    icon: 'fa-users',
    desc: 'Al morir: Dano 4 a 1 rival aleatorio.',
    lore: 'Crisaor se caso con Calirroe, hija de Oceano, y de esa union nacio Gerion, el gigante de tres cuerpos. Gerion crecio en la isla de Eritia, al oeste del mundo, y se convirtio en un pastor de rebanos rojos. Pero su sangre era la de Medusa, y su destino estaba escrito: Heracles lo mataria para robarle sus rebanos. Crisaor lo sabia, pero no hizo nada por evitarlo, porque sabia que el destino de los hijos de Medusa era morir a manos de los heroes.',
    art: 'assets/cartas/crisaor-padre-de-gerion.webp',
    substory: 'crisaor',
    effect: null,
    startTurn: null,
    onDeath: (owner) => {
        let opp = owner === gameState.p1 ? gameState.p2 : gameState.p1;
        let alive = opp.activeBoard.filter(c => !c.dying && !c.stunned);
        if (!alive.length) return;
        let target = alive[Math.floor(Math.random() * alive.length)];
        dealDamage(target, 4, sideOf(opp));
        queueFx({ t: 'debuff', side: sideOf(opp), uid: target.uid, text: '-4 HP', icon: 'fa-users', overlay: 'hit' });
    }
}
        ];

// El mazo del rival comparte estas mismas plantillas (las instancias en
// tablero son copias; clonar con JSON eliminaría effect/startTurn).
let rivalDeck = ALL_CARDS;
