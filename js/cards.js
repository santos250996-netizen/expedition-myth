// --- DATOS DE LAS CARTAS (Solo SER o EVENTO) ---
// Plantillas compartidas: las instancias en tablero son copias, así las
// funciones effect/startTurn sobreviven para ambos jugadores.
const ALL_CARDS = [
            { 
                id: 'c1', name: 'Mortal de Arcadia', kind: 'Ser', cost: 1, atk: 1, hp: 1, 
                icon: 'fa-user', 
                desc: 'Sin habilidades, solo voluntad.', 
                lore: 'En las laderas de los valles oscuros, pequeños grupos de hombres y mujeres intentan sobrevivir al frío y a la intemperie. No tienen armas de bronce ni armaduras pesadas, solo una frágil voluntad y fogatas improvisadas para espantar a la noche.',
                art: 'assets/cartas/carta-01-mortal-de-arcadia.webp',
                effect: null, startTurn: null 
            },
            { 
                id: 'c2', name: 'Sátiro de los Bosques', kind: 'Ser', cost: 2, atk: 0, hp: 2, 
                icon: 'fa-leaf', 
                desc: 'Inicio de turno: Gana +1 ATK por cada otro Ser aliado en el tablero (hasta el final del turno).', 
                lore: 'De la espesura más profunda de los matorrales surgen criaturas híbridas de torso humano y patas caprinas. Son seres salvajes y caóticos que no obedecen a ninguna ley humana, merodeando los bordes de los caminos para asustar y desorientar a los viajeros.',
                art: 'assets/cartas/carta-02-satiro-de-los-bosques.webp',
                effect: null, 
                startTurn: (self, player) => { self.atk = 0; let others = player.activeBoard.filter(c => c.uid !== self.uid && c.kind === 'Ser' && !c.dying).length; if (others > 0) { self.atk += others; queueFx({ t: 'buff', side: sideOf(player), uid: self.uid, text: '+' + others + ' ATK', icon: 'fa-arrow-trend-up' }); } } 
            },
            { 
                id: 'c3', name: 'Minotauro Joven', kind: 'Ser', cost: 3, atk: 3, hp: 4, 
                icon: 'fa-cow', 
                desc: 'Sin habilidades, pero un muro sólido.', 
                lore: 'Encerrados en cuevas profundas y laberintos naturales de piedra tosca crecen bestias colosales con cuerpo de hombre y cabeza de toro. Su fuerza bruta es incontrolable y comienzan a salir de sus guaridas atraídos por el olor del ganado humano.',
                art: 'assets/cartas/carta-03-minotauro-joven.webp',
                effect: null, startTurn: null 
            },
            { 
                id: 'c4', name: 'Plegaria Arcana', kind: 'Evento', cost: 1, atk: 0, hp: 0, 
                icon: 'fa-hands-praying', 
                desc: 'Otorga +2 Puntos de Gloria instantáneos.', 
                lore: 'Ante el terror de la oscuridad, los jefes de las tribus alzan las manos al cielo estrellado y elevan sus primeros cánticos y ofrendas. Esta devoción pura resuena por primera vez en las alturas, atrayendo la atención de fuerzas invisibles.',
                art: 'assets/cartas/carta-04-plegaria-arcana.webp',
                effect: (p) => { p.score += 2; queueFx({ t: 'gloria', side: sideOf(p), text: '+2 GLORIA', icon: 'fa-hands-praying', num: 2 }); }
            },
            { 
                id: 'c5', name: 'Niebla del Caos', kind: 'Evento', cost: 2, atk: 0, hp: 0, 
                icon: 'fa-cloud', 
                desc: 'Reduce en -2 el ATK del Ser rival que esté en la posición 1 (cima de su columna).', 
                lore: 'Una densa penumbra inexplorada desciende de los cielos y cubre los valles arcaicos de Grecia. Esta neblina antinatural nubla el juicio de las tribus y debilita los primeros asentamientos humanos, obligándolos a dar sus primeros pasos a ciegas en la oscuridad.',
                art: 'assets/cartas/carta-05-niebla-del-caos.webp',
                effect: (p, opp) => { let target = opp.activeBoard[0]; if (target && !target.dying) { target.atk = Math.max(0, target.atk - 2); queueFx({ t: 'debuff', side: sideOf(opp), uid: target.uid, text: '-2 ATK', icon: 'fa-cloud', overlay: 'fog', pulse: 'fx-pulse-gray', cls: 'fx-gray' }); } } 
            },
            { 
                id: 'c6', name: 'El Lamento de la Fuente Seca', kind: 'Ser', cost: 2, atk: 1, hp: 3, 
                icon: 'fa-water', 
                desc: 'Al entrar: Reduce en -1 el ATK del Ser rival en la posición 1.', 
                lore: 'Las protectoras de los manantiales sufren la corrupción de la niebla. Al verse marchitas y sin agua pura, pierden la razón y se convierten en espectros errantes que lloran desconsoladamente, confundiendo con sus cantos a cualquiera que se acerque.',
                art: 'assets/cartas/carta-06-lamento-fuente-seca.webp',
                effect: (p, opp) => { let target = opp.activeBoard[0]; if (target && !target.dying) { target.atk = Math.max(0, target.atk - 1); queueFx({ t: 'debuff', side: sideOf(opp), uid: target.uid, text: '-1 ATK', icon: 'fa-water', overlay: 'tears' }); } }, startTurn: null 
            },
            { 
                id: 'c7', name: 'La Embestida de Erimanto', kind: 'Ser', cost: 5, atk: 4, hp: 3, 
                icon: 'fa-hippo', 
                desc: 'Inicio de turno: Inflige 1 daño al Ser rival de su misma fila y pierde 1 HP propio.', 
                lore: 'Desde las cumbres heladas desciende una bestia descomunal: un jabalí salvaje de piel acorazada y colmillos afilados que arrasa con los primeros cultivos y siembra el pánico absoluto en las laderas de Arcadia.',
                art: 'assets/cartas/carta-07-embestida-de-erimanto.webp',
                effect: null, 
                startTurn: (self, player, opp) => {
                    let myIndex = player.activeBoard.indexOf(self);
                    let target = opp.activeBoard[myIndex];
                    if (target && !target.dying) {
                        // El daño del choque se ENCOLA: gameTick lo aplica
                        // después de leer ambos tableros (turno compartido —
                        // ninguna Embestida golpea antes que otra).
                        gameState.clashQueue.push({ target: target });
                        queueFx({ t: 'clash', side: sideOf(player), uidA: self.uid, uidB: target.uid });
                    }
                    self.hp -= 1;
                    if (self.hp <= 0) { self.hp = 0; self.dying = true; }
                }
            },
            { 
                id: 'c8', name: 'El Balbuceo del Oráculo Ciego', kind: 'Ser', cost: 1, atk: 0, hp: 2, 
                icon: 'fa-eye-slash', 
                desc: 'Mientras esté en el tablero, tus Eventos cuestan -1 Energía (mínimo 0).', 
                lore: 'En una cueva donde los vapores de la tierra escapan por las grietas, un anciano inhala los efluvios telúricos. Entra en un profundo trance y comienza a escupir profecías indescifrables sobre un destino escrito con sangre y bronce.',
                art: 'assets/cartas/carta-08-oraculo-ciego.webp',
                effect: null, startTurn: null 
            },
            { 
                id: 'c9', name: 'Pacto de Sangre en el Altar de Piedra', kind: 'Evento', cost: 3, atk: 0, hp: 0, 
                icon: 'fa-droplet', 
                desc: 'Destruye el Ser rival con menos HP y otorga +6 Puntos de Gloria.', 
                lore: 'Desesperados por detener las malas cosechas y los ataques, los mortales construyen altares toscos de roca y entregan la vida de sus cazadores en un ritual oscuro para apaciguar a las fuerzas que los acechan.',
                art: 'assets/cartas/carta-09-pacto-de-sangre.webp',
                effect: (p, opp) => { 
                    p.score += 6; 
                    queueFx({ t: 'gloria', side: sideOf(p), text: '+6 GLORIA', icon: 'fa-droplet', num: 6 });
                    let alive = opp.activeBoard.filter(c => !c.dying);
                    if (alive.length > 0) { 
                        let weakest = alive.reduce((min, c) => c.hp < min.hp ? c : min, alive[0]); 
                        weakest.dying = true;
                        queueFx({ t: 'sacrifice', side: sideOf(opp), uid: weakest.uid });
                    } 
                } 
            },
            { 
                id: 'c10', name: 'Los Ecos del Bosque de Dodona', kind: 'Evento', cost: 1, atk: 0, hp: 0, 
                icon: 'fa-tree', 
                desc: 'Reduce en -1 el ATK de todos los Seres rivales durante este turno.', 
                lore: 'Los robles milenarios de los bosques sagrados guardan secretos antiguos. Cuando los intrusos se adentran sin respeto, las hojas y el viento susurran nombres prohibidos que paralizan la voluntad y confunden las mentes de los enemigos.',
                art: 'assets/cartas/carta-10-ecos-de-dodona.webp',
                effect: (p, opp) => { 
                    queueFx({ t: 'wave', side: sideOf(opp) });
                    opp.activeBoard.forEach(c => { c.tempAtkMod = (c.tempAtkMod || 0) - 1; queueFx({ t: 'debuff', side: sideOf(opp), uid: c.uid, text: '-1', icon: 'fa-leaf', overlay: 'leaf' }); }); 
                } 
            }
        ];

// El mazo del rival comparte estas mismas plantillas (las instancias en
// tablero son copias; clonar con JSON eliminaría effect/startTurn).
let rivalDeck = ALL_CARDS;
