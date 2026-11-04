// --- DATOS DE LAS CARTAS (Solo SER o EVENTO) ---
// Plantillas compartidas: las instancias en tablero son copias, así las
// funciones effect/startTurn sobreviven para ambos jugadores.
        // --- DATOS DE LAS CARTAS (Solo SER o EVENTO) ---
        const ALL_CARDS = [
            { 
                id: 'c1', name: 'Mortal de Arcadia', kind: 'Ser', cost: 1, atk: 1, hp: 1, 
                icon: 'fa-user', 
                desc: 'Sin habilidades, solo voluntad.', 
                lore: 'En las laderas de los valles oscuros, pequeños grupos de hombres y mujeres intentan sobrevivir al frío y a la intemperie. No tienen armas de bronce ni armaduras pesadas, solo una frágil voluntad y fogatas improvisadas para espantar a la noche.',
                art: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
                effect: null, startTurn: null 
            },
            { 
                id: 'c2', name: 'Sátiro de los Bosques', kind: 'Ser', cost: 2, atk: 0, hp: 2, 
                icon: 'fa-leaf', 
                desc: 'Inicio de turno: Gana +1 ATK por cada otro Ser aliado en el tablero (hasta el final del turno).', 
                lore: 'De la espesura más profunda de los matorrales surgen criaturas híbridas de torso humano y patas caprinas. Son seres salvajes y caóticos que no obedecen a ninguna ley humana, merodeando los bordes de los caminos para asustar y desorientar a los viajeros.',
                art: 'https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=600&auto=format&fit=crop',
                effect: null, 
                startTurn: (self, player) => { self.atk = 0; let others = player.activeBoard.filter(c => c.uid !== self.uid && c.kind === 'Ser').length; if (others > 0) self.atk += others; } 
            },
            { 
                id: 'c3', name: 'Minotauro Joven', kind: 'Ser', cost: 3, atk: 3, hp: 4, 
                icon: 'fa-cow', 
                desc: 'Sin habilidades, pero un muro sólido.', 
                lore: 'Encerrados en cuevas profundas y laberintos naturales de piedra tosca crecen bestias colosales con cuerpo de hombre y cabeza de toro. Su fuerza bruta es incontrolable y comienzan a salir de sus guaridas atraídos por el olor del ganado humano.',
                art: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=600&auto=format&fit=crop',
                effect: null, startTurn: null 
            },
            { 
                id: 'c4', name: 'Plegaria Arcana', kind: 'Evento', cost: 1, atk: 0, hp: 0, 
                icon: 'fa-hands-praying', 
                desc: 'Otorga +2 Puntos de Gloria instantáneos.', 
                lore: 'Ante el terror de la oscuridad, los jefes de las tribus alzan las manos al cielo estrellado y elevan sus primeros cánticos y ofrendas. Esta devoción pura resuena por primera vez en las alturas, atrayendo la atención de fuerzas invisibles.',
                art: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=600&auto=format&fit=crop',
                effect: (p) => { p.score += 2; } 
            },
            { 
                id: 'c5', name: 'Niebla del Caos', kind: 'Evento', cost: 2, atk: 0, hp: 0, 
                icon: 'fa-cloud', 
                desc: 'Reduce en -2 el ATK del Ser rival que esté en la posición 1 (cima de su columna).', 
                lore: 'Una densa penumbra inexplorada desciende de los cielos y cubre los valles arcaicos de Grecia. Esta neblina antinatural nubla el juicio de las tribus y debilita los primeros asentamientos humanos, obligándolos a dar sus primeros pasos a ciegas en la oscuridad.',
                art: 'https://images.unsplash.com/photo-1487621167305-5d248087c724?q=80&w=600&auto=format&fit=crop',
                effect: (p, opp) => { if(opp.activeBoard.length > 0) { opp.activeBoard[0].atk = Math.max(0, opp.activeBoard[0].atk - 2); } } 
            },
            { 
                id: 'c6', name: 'El Lamento de la Fuente Seca', kind: 'Ser', cost: 2, atk: 1, hp: 3, 
                icon: 'fa-water', 
                desc: 'Al entrar: Reduce en -1 el ATK del Ser rival en la posición 1.', 
                lore: 'Las protectoras de los manantiales sufren la corrupción de la niebla. Al verse marchitas y sin agua pura, pierden la razón y se convierten en espectros errantes que lloran desconsoladamente, confundiendo con sus cantos a cualquiera que se acerque.',
                art: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=600&auto=format&fit=crop',
                effect: (p, opp) => { if(opp.activeBoard.length > 0) { opp.activeBoard[0].atk = Math.max(0, opp.activeBoard[0].atk - 1); } }, startTurn: null 
            },
            { 
                id: 'c7', name: 'La Embestida de Erimanto', kind: 'Ser', cost: 5, atk: 4, hp: 3, 
                icon: 'fa-hippo', 
                desc: 'Inicio de turno: Inflige 1 daño al Ser rival de su misma fila y pierde 1 HP propio.', 
                lore: 'Desde las cumbres heladas desciende una bestia descomunal: un jabalí salvaje de piel acorazada y colmillos afilados que arrasa con los primeros cultivos y siembra el pánico absoluto en las laderas de Arcadia.',
                art: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=600&auto=format&fit=crop',
                effect: null, 
                startTurn: (self, player, opp) => { let myIndex = player.activeBoard.indexOf(self); if(opp.activeBoard[myIndex]) { opp.activeBoard[myIndex].hp -= 1; if (opp.activeBoard[myIndex].hp <= 0) opp.activeBoard.splice(myIndex, 1); } self.hp -= 1; if (self.hp <= 0) { let idx = player.activeBoard.indexOf(self); if (idx > -1) player.activeBoard.splice(idx, 1); } } 
            },
            { 
                id: 'c8', name: 'El Balbuceo del Oráculo Ciego', kind: 'Ser', cost: 1, atk: 0, hp: 2, 
                icon: 'fa-eye-slash', 
                desc: 'Mientras esté en el tablero, tus Eventos cuestan -1 Energía (mínimo 0).', 
                lore: 'En una cueva donde los vapores de la tierra escapan por las grietas, un anciano inhala los efluvios telúricos. Entra en un profundo trance y comienza a escupir profecías indescifrables sobre un destino escrito con sangre y bronce.',
                art: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=600&auto=format&fit=crop',
                effect: null, startTurn: null 
            },
            { 
                id: 'c9', name: 'Pacto de Sangre en el Altar de Piedra', kind: 'Evento', cost: 3, atk: 0, hp: 0, 
                icon: 'fa-droplet', 
                desc: 'Destruye el Ser rival con menos HP y otorga +6 Puntos de Gloria.', 
                lore: 'Desesperados por detener las malas cosechas y los ataques, los mortales construyen altares toscos de roca y entregan la vida de sus cazadores en un ritual oscuro para apaciguar a las fuerzas que los acechan.',
                art: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
                effect: (p, opp) => { p.score += 6; if(opp.activeBoard.length > 0) { let weakest = opp.activeBoard.reduce((min, c) => c.hp < min.hp ? c : min, opp.activeBoard[0]); let idx = opp.activeBoard.indexOf(weakest); if (idx > -1) opp.activeBoard.splice(idx, 1); } } 
            },
            { 
                id: 'c10', name: 'Los Ecos del Bosque de Dodona', kind: 'Evento', cost: 1, atk: 0, hp: 0, 
                icon: 'fa-tree', 
                desc: 'Reduce en -1 el ATK de todos los Seres rivales durante este turno.', 
                lore: 'Los robles milenarios de los bosques sagrados guardan secretos antiguos. Cuando los intrusos se adentran sin respeto, las hojas y el viento susurran nombres prohibidos que paralizan la voluntad y confunden las mentes de los enemigos.',
                art: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=600&auto=format&fit=crop',
                effect: (p, opp) => { opp.activeBoard.forEach(c => { c.tempAtkMod = (c.tempAtkMod || 0) - 1; }); } 
            }
        ];

        // FIX: antes rivalDeck se clonaba con JSON.stringify/parse, lo que ELIMINABA
        // las funciones effect/startTurn: las cartas del rival no hacían nada.
        // Ahora comparte las mismas plantillas (las instancias en tablero son copias).
        let rivalDeck = ALL_CARDS;
