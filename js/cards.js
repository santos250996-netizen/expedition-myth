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
            },
            {
                id: 'c11', name: 'El Acechador de los Matorrales', kind: 'Ser', cost: 2, atk: 1, hp: 2,
                icon: 'fa-eye', 
                desc: 'Al entrar: Inflige 1 de daño al HP del Ser rival en la posición 1.', 
                lore: 'En las afueras de los asentamientos, donde los campos cultivados se funden con la espesura del bosque salvaje, merodean criaturas con torso humano y patas de bestia que se ocultan en la maleza. No buscan destruir las aldeas por furia ciega, sino que vigilan desde las sombras, esperando el descuido de los cazadores solitarios para emboscarlos.',
                art: 'assets/cartas/carta-11-acechador-de-los-matorrales.webp',
                effect: (p, opp) => { let target = opp.activeBoard[0]; if (target && !target.dying) { dealDamage(target, 1); queueFx({ t: 'debuff', side: sideOf(opp), uid: target.uid, text: '-1 HP', icon: 'fa-heart-crack', overlay: 'hit', pulse: 'fx-shake' }); } }, startTurn: null 
            },
            { 
                id: 'c12', name: 'El Despertar del Titán Menor', kind: 'Ser', cost: 8, atk: 5, hp: 6, 
                icon: 'fa-mountain', 
                desc: 'Cada vez que recibe daño, gana +1 ATK permanentemente.', 
                lore: 'Bajo las profundidades de la tierra arcadia, el temblor provocado por los rituales humanos despierta a un fragmento olvidado de la antigua estirpe titánica. Es una masa de piedra y furia ciega que comienza a agrietar el suelo de los valles, amenazando con devorar tanto a los mortales como a las bestias por igual.',
                art: 'assets/cartas/carta-12-despertar-del-titan-menor.webp',
                effect: null, startTurn: null,
                damageReact: (self) => { self.atk += 1; queueFx({ t: 'buff', side: ownerSideOf(self), uid: self.uid, text: '+1 ATK', icon: 'fa-mountain' }); }
            },
            { 
                id: 'c13', name: 'La Disputa del Territorio', kind: 'Evento', cost: 2, atk: 0, hp: 0, 
                icon: 'fa-burst', 
                desc: 'Inflige 2 de daño al HP de TODOS los Seres en el tablero.', 
                lore: 'La escasez de recursos y el avance de la niebla provocan un violento enfrentamiento en los límites del bosque. Las tribus humanas, armadas con lanzas de madera tosca, chocan directamente contra las manadas de bestias salvajes que defienden desesperadamente su hábitat natural, desatando una brutal guerra por el control del valle.',
                art: 'assets/cartas/carta-13-disputa-del-territorio.webp',
                effect: (p, opp) => { 
                    [p, opp].forEach(owner => owner.activeBoard.filter(c => !c.dying).slice().forEach(c => { 
                        dealDamage(c, 2); 
                        queueFx({ t: 'debuff', side: sideOf(owner), uid: c.uid, text: '-2 HP', icon: 'fa-burst', overlay: 'hit', pulse: 'fx-shake' }); 
                    })); 
                } 
            },
            { 
                id: 'c14', name: 'El Canto Embrujado de la Hondonada', kind: 'Evento', cost: 2, atk: 0, hp: 0, 
                icon: 'fa-ghost', 
                desc: 'El Ser rival con menos ATK no puede atacar durante este turno.', 
                lore: 'Un sonido melancólico y antinatural reverbera entre los desfiladeros de las colinas. Las almas de aquellos cazadores que se adentraron demasiado en la niebla y nunca regresaron emiten un llamado hipnótico que arrastra a los vivos hacia precipicios oscuros y trampas mortales.',
                art: 'assets/cartas/carta-14-canto-embrujado-hondonada.webp',
                effect: (p, opp) => { 
                    let alive = opp.activeBoard.filter(c => !c.dying); 
                    if (alive.length > 0) { 
                        let weakest = alive.reduce((min, c) => (c.atk + (c.tempAtkMod || 0)) < (min.atk + (min.tempAtkMod || 0)) ? c : min, alive[0]); 
                        weakest.stunned = true; 
                        queueFx({ t: 'debuff', side: sideOf(opp), uid: weakest.uid, text: 'NO ATACA', icon: 'fa-ghost', cls: 'fx-gray', pulse: 'fx-pulse-gray' }); 
                    } 
                } 
            },
            { 
                id: 'c15', name: 'El Guardián del Fuego Sagrado', kind: 'Ser', cost: 4, atk: 2, hp: 4, 
                icon: 'fa-fire', 
                desc: 'Inicio de turno: Otorga +1 Punto de Gloria extra.', 
                lore: 'Para frenar el avance de las criaturas de la oscuridad, los líderes de las tribus designan a sus guerreros más valientes para custodiar las pocas fogatas que aún resisten. Este protector porta una antorcha de madera resinosa, convirtiéndose en el único faro de esperanza y orden en medio del caos que empieza a devorar la región.',
                art: 'assets/cartas/carta-15-guardian-fuego-sagrado.webp',
                effect: null, 
                startTurn: (self, player) => { player.extraPoints += 1; queueFx({ t: 'gloria', side: sideOf(player), uid: self.uid, text: '+1 GLORIA', icon: 'fa-fire', num: 1 }); } 
            },
            { 
                id: 'c16', name: 'La Sombra en el Pozo', kind: 'Ser', cost: 3, atk: 2, hp: 3, 
                icon: 'fa-moon', 
                desc: 'Al entrar: Reduce en -2 el ATK del Ser rival en la Fila 1.', 
                lore: 'En las reservas de agua que aún quedan limpias en los valles, una entidad acuática de formas líquidas y oscuras comienza a manifestarse. No ataca directamente, sino que corrompe el líquido vital, haciendo que cualquier criatura o mortal que beba de él pierda la razón y ataque a los suyos.',
                art: 'assets/cartas/carta-16-sombra-en-el-pozo.webp',
                effect: (p, opp) => { let target = opp.activeBoard[0]; if (target && !target.dying) { target.atk = Math.max(0, target.atk - 2); queueFx({ t: 'debuff', side: sideOf(opp), uid: target.uid, text: '-2 ATK', icon: 'fa-moon', overlay: 'fog', pulse: 'fx-pulse-gray' }); } }, startTurn: null 
            },
            { 
                id: 'c17', name: 'Saqueo a la Luz de la Antorcha', kind: 'Evento', cost: 1, atk: 0, hp: 0, 
                icon: 'fa-bag-shopping', 
                desc: 'Otorga +3 Puntos de Gloria instantáneos.', 
                lore: 'Aprovechando el desconcierto y el miedo generalizado por las criaturas que acechan en los matorrales, facciones rivales dentro de las propias tribus humanas se traicionan entre sí, asaltando los precarios campamentos vecinos para robar las pocas provisiones y reservas de bronce que quedan.',
                art: 'assets/cartas/carta-17-saqueo-antorcha.webp',
                effect: (p) => { p.score += 3; queueFx({ t: 'gloria', side: sideOf(p), text: '+3 GLORIA', icon: 'fa-bag-shopping', num: 3 }); } 
            },
            { 
                id: 'c18', name: 'El Centinela del Barranco', kind: 'Ser', cost: 4, atk: 3, hp: 4,
                icon: 'fa-crosshairs', 
                desc: 'Mientras esté en la Fila 1, gana +1 ATK al inicio de tu turno.', 
                lore: 'Un veterano cazador de las tribus, marcado por las cicatrices de los primeros ataques de las bestias, toma posición en los desfiladeros más estrechos. Armado únicamente con un arco de madera reforzada y una determinación férrea, bloquea el avance de cualquier intruso que intente flanquear los asentamientos.',
                art: 'assets/cartas/carta-18-centinela-del-barranco.webp',
                effect: null, 
                startTurn: (self, player) => { if (player.activeBoard[0] === self && !self.dying) { self.atk += 1; queueFx({ t: 'buff', side: sideOf(player), uid: self.uid, text: '+1 ATK', icon: 'fa-crosshairs' }); } } 
            },
            { 
                id: 'c19', name: 'Derrumbe de las Rocas Sagradas', kind: 'Evento', cost: 3, atk: 0, hp: 0, 
                icon: 'fa-house-crack', 
                desc: 'Inflige 3 de daño al HP del Ser rival en la posición 1.', 
                lore: 'Los constantes temblores provocados por el despertar de las fuerzas telúricas bajo la tierra hacen que las laderas de las montañas colapsen de repente, sepultando senderos enteros, aislando a las aldeas y destruyendo los santuarios improvisados que los mortales habían levantado.',
                art: 'assets/cartas/carta-19-derrumbe-rocas-sagradas.webp',
                effect: (p, opp) => { let target = opp.activeBoard[0]; if (target && !target.dying) { dealDamage(target, 3); queueFx({ t: 'debuff', side: sideOf(opp), uid: target.uid, text: '-3 HP', icon: 'fa-house-crack', overlay: 'hit', pulse: 'fx-shake' }); } } 
            },
            { 
                id: 'c20', name: 'La Profecía de la Sangre Derramada', kind: 'Ser', cost: 5, atk: 6, hp: 4, 
                icon: 'fa-book-skull', 
                desc: 'Al inicio de tu turno, si tienes 3 o más Seres en el tablero, ganas +1 Energía extra.', 
                lore: 'Un devoto enloquecido por las visiones del oráculo emerge de las cuevas oscuras con la piel cubierta de runas pintadas con barro y sangre. Se desplaza de campamento en campamento anunciando que el conflicto actual es solo el preludio de una guerra mucho mayor que obligará a los dioses a descender de los cielos.',
                art: 'assets/cartas/carta-20-profecia-sangre-derramada.webp',
                effect: null, 
                startTurn: (self, player) => { if (player.activeBoard.filter(c => !c.dying).length >= 3) { player.energy += 1; queueFx({ t: 'discount', side: sideOf(player), text: '+1' }); } } 
            }
        ];

// El mazo del rival comparte estas mismas plantillas (las instancias en
// tablero son copias; clonar con JSON eliminaría effect/startTurn).
let rivalDeck = ALL_CARDS;
