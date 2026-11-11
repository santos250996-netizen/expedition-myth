// --- NOTAS DEL PARCHE (PATCH NOTES) ---
// Historial versionado de cambios del juego. Cada entrada es una versión.
// La más reciente va PRIMERO (índice 0). El banner de la home y el badge de
// Opciones se activan si nexo_last_seen_version < PATCH_NOTES[0].version.
// El formato de cambios es categorizado: new, buffs, nerfs, fixes, removed.
// En modo dev, además, se muestran las versiones con dev:true (sección [DEV]).

const PATCH_NOTES = [
    {
        version: '1.10.6',
        date: '2026-11-11',
        title: 'Familias objetos, pegaso y crisaor',
        highlights: [
            '3 familias nuevas: objetos, pegaso, crisaor',
            '4 cartas nuevas: Pegaso Belerofonte, Pegaso Zeus, Crisaor Cabeza, Crisaor Gerion'
        ],
        changes: {
            new: [
                'Familia objetos: b5 (Soporte), b6 (Buffer), b7 (Soporte).',
                'Familia pegaso: b8 (Buffer/Generador), pegaso_belerofonte (Agresor), pegaso_zeus (Soporte).',
                'Familia crisaor: b9 (Buffer), crisaor_cabeza (Control), crisaor_gerion (Invocador).',
                'Carta: Pegaso, el que Derribo a Belerofonte (Ser, cost 4, 3/3, Al entrar: Dano 3 a 1 rival aleatorio).',
                'Carta: Pegaso, el Corcel de Zeus (Ser, cost 5, 3/3, Al entrar: Fortalecer 2 a todos los aliados).',
                'Carta: Crisaor, el que Recogio la Cabeza de Medusa (Ser, cost 4, 2/3, Al entrar: Exilio 1 a 1 rival aleatorio).',
                'Carta: Crisaor, el Padre de Gerion (Ser, cost 4, 2/2, Al morir: Dano 4 a 1 rival aleatorio).'
            ],
            buffs: [],
            nerfs: [],
            fixes: [],
            removed: []
        }
    },
    {
        version: '1.10.5',
        date: '2026-11-11',
        title: 'Familias esteno y euriale',
        highlights: [
            '2 familias nuevas: esteno y euriale',
            '4 cartas nuevas: Esteno Protectora, Esteno Vengadora, Euriale Advirtio, Euriale Lloro',
            'Triggers variados: Embestida, Enfurecer, Al entrar, Al morir',
            'Regla nueva: Enfurecer X requiere X < HP de la carta'
        ],
        changes: {
            new: [
                'Familia esteno: b3 (Tanque), esteno_protectora (Buffer), esteno_vengadora (Ejecutor).',
                'Familia euriale: b4 (Debuffer), euriale_advirtio (Acelerador), euriale_lloro (Generador).',
                'Carta: Esteno, la Protectora de Medusa (Ser, cost 4, 4/4, Embestida 2: Blindar 2 a todos los aliados).',
                'Carta: Esteno, la Vengadora (Ser, cost 4, 3/3, Enfurecer 2: Dano 4 a 1 rival aleatorio).',
                'Carta: Euriale, la que Advirtio a Medusa (Ser, cost 3, 1/1, Al entrar: Descuento 2 a tu siguiente Ser).',
                'Carta: Euriale, la que Lloro a Medusa (Ser, cost 3, 2/2, Al morir: Gloria 4).'
            ],
            buffs: [],
            nerfs: [],
            fixes: [],
            removed: []
        }
    },
    {
        version: '1.10.4',
        date: '2026-11-10',
        title: 'Familias minoico, teseo y medusa',
        highlights: [
            '3 familias nuevas: minoico, teseo, medusa',
            '2 cartas nuevas: Teseo en Creta, Medusa, la Cabeza',
            'Pasifae: hp 3 -> 2 (nerf de PPT)',
            'Nuevo soporte para Descuento en Seres'
        ],
        changes: {
            new: [
                'Familia minoico: a4 (Tanque), a6 (Buffer), a9 (Invocador).',
                'Familia teseo: teseo_creta (Acelerador), a5 (Buffer/Generador), a11 (Ejecutor).',
                'Familia medusa: b1 (Generador), b2 (Control), medusa_cabeza (Control).',
                'Carta: Teseo en Creta (Ser, cost 3, 1/1, Al entrar: Descuento 2 a tu siguiente Ser).',
                'Carta: Medusa, la Cabeza (Evento, cost 4, Al entrar: Exilio 2 a todos los rivales).'
            ],
            buffs: [],
            nerfs: [
                'Pasifae a6: hp 3 -> 2.'
            ],
            fixes: [
                'a6 Pasifae: desc reescrita con keyword Blindar.',
                'game.js: soporte para Descuento en Seres (pendingSerDiscount).'
            ],
            removed: []
        }
    },
    {
        version: '1.10.3',
        date: '2026-11-10',
        title: 'Familias c6, c7, c8, c9, c10',
        highlights: [
            '5 familias nuevas: ninfas, jabali, oraculo, pacto, dodona',
            '10 cartas nuevas con arquetipos, triggers y keywords variados',
            'Nuevo tipo de mision: games_with_both (jugar 2 cartas especificas)'
        ],
        changes: {
            new: [
                'Familia ninfas: c6 (Debuffer), canto_fuente (Control + Generador), ninfa_ahogada (Ejecutor).',
                'Familia jabali: c7 (Agresor), jabali_capturado (Debuffer), colmillos_jabali (Buffer).',
                'Familia oraculo: c8 (Acelerador), juicio_tiresias (Control), vara_tiresias (Ejecutor).',
                'Familia pacto: c9 (Sacrificio, coste 5), ofrenda_hades (Buffer), deuda_sangre (Control).',
                'Familia dodona: c10 (Debuffer), roble_dodona (Tanque), palomas_dodona (Ejecutor).',
                'Tipo de mision games_with_both: jugar 2 cartas especificas en la misma partida.'
            ],
            buffs: [],
            nerfs: [
                'c9 Pacto de Sangre: coste 3 -> 5 (para cuadrar PPT con Sacrificio 4).'
            ],
            fixes: [
                'c9 Pacto de Sangre: reescrito como Sacrificio 4: Gloria 4. Destruir 1 rival con menos HP.'
            ],
            removed: []
        }
    },
    {
        version: '1.10.1',
        date: '2026-11-10',
        title: 'Modal de carta: altura fija',
        highlights: [
            'Los 3 boxes del modal (leyenda, misiones, formas) tienen altura fija',
            'El box de misiones desaparece y cede su espacio cuando se completan todas',
            'El box de formas desaparece y cede su espacio si la carta no tiene familia',
            'Sin brinco al cambiar de forma o completar misiones'
        ],
        changes: {
            new: [],
            buffs: [],
            nerfs: [],
            fixes: [
                'Modal de carta: leyenda 88px fijo, misiones 88px fijo, formas 56px fijo.',
                'Misiones y formas usan display: none (no hidden-view) para ocultarse sin transicion.',
                'El box de misiones desaparece cuando todas las misiones de la forma estan completadas.',
                'Scroll interno en leyenda y misiones si el contenido no cabe.'
            ],
            removed: [
                '#modal-info-panel { height: 100px } (reemplazado por altura fija inline).'
            ]
        }
    },
    {
        version: '1.10.0',
        date: '2026-11-10',
        title: 'Documentación y familia niebla',
        highlights: [
            'Nuevos docs: familias.md, misiones.md, diseno-de-cartas.md',
            'Nueva familia: Niebla del Caos (c5 → sombra_niebla → espectro_niebla)',
            '2 cartas nuevas: La Sombra en la Niebla y El Espectro de la Niebla'
        ],
        changes: {
            new: [
                'docs/familias.md: las 6 familias actuales + reglas + patrón de misiones.',
                'docs/misiones.md: sistema de misiones + tipos + tracking + panel.',
                'docs/diseno-de-cartas.md: flujo de creación + reglas + ejemplos.',
                'Familia niebla: c5 (base), sombra_niebla (forma 2), espectro_niebla (forma 3).',
                'Carta: La Sombra en la Niebla (Ser, cost 3, 2/2, Inicio de turno (si hay un Ser exiliado): Exilio 1 a 1 rival aleatorio).',
                'Carta: El Espectro de la Niebla (Ser, cost 5, 1/1, Al morir: Destruir 1 rival con el ATK mas alto).',
                'Misión sombra_niebla: 2 misiones con c5 (10 partidas + 5 wins).',
                'Misión espectro_niebla: 4 misiones (15 partidas + 10 wins con c5; 3 exilios + 5 wins con sombra_niebla).'
            ],
            buffs: [],
            nerfs: [],
            fixes: [],
            removed: []
        }
    },
    {
        version: '1.9.4',
        date: '2026-11-10',
        title: 'Colores, recompensas y familia Plegaria Arcana',
        highlights: [
            'Card-effect-box con colores: triggers ambar, keywords cyan',
            'Recompensas: nunca formas 2/3 ni Tokens, integradas en el modal de victoria',
            'Misiones multiples por forma (2 en forma 2, 4 en forma 3) con panel propio',
            'Familia nueva: Plegaria Arcana (c4 + El Altar de Zeus + El Tocado por el Rayo)'
        ],
        changes: {
            new: [
                'Card-effect-box: triggers y keywords coloreados igual que la leyenda.',
                'Tipos de mision nuevos: kills_with, invoke_with, exile_with, fortalecer_with y glory_with.',
                'Panel de misiones separado de la leyenda; desaparece cuando todo esta completado.',
                'Familia plegaria: c4 (base), El Altar de Zeus (forma 2) y El Tocado por el Rayo (forma 3).'
            ],
            buffs: [],
            nerfs: [],
            fixes: [
                'Recompensas: se excluyen las formas 2/3 de las familias y los Tokens.',
                'La recompensa se muestra integrada en el modal de victoria (entre la puntuacion y los botones).',
                'Una forma se desbloquea solo cuando TODAS sus misiones estan completadas.'
            ],
            removed: [
                'renderRewardCard() y el div #gameover-reward-card (reemplazados por el slot integrado).'
            ]
        }
    },
    {
        version: '1.9.3',
        date: '2026-11-10',
        title: 'Asterion Enfurecido con Enfurecer',
        highlights: [
            'a2 Asterion Enfurecido: Embestida -> Enfurecer 4',
            'Stats: 5/5 -> 2/4 (cuadra PPT)'
        ],
        changes: {
            new: [],
            buffs: [],
            nerfs: [],
            fixes: [
                'a2 Asterion Enfurecido: ahora usa Enfurecer 4: Destruir 1 rival aleatorio (antes Embestida 1: Daño 2).',
                'a2 stats: 5/5 -> 2/4 para cuadrar el presupuesto (coste 5 = 10 PPT; Destruir 8/2 = 4 PPT; stats 6 PPT).'
            ],
            removed: [
                'Embestida de a2 (reemplazada por Enfurecer).'
            ]
        }
    },
    {
        version: '1.9.2',
        date: '2026-11-10',
        title: 'Sistema de efectos cerrado',
        highlights: [
            'Triggers Embestida, Enfurecer y Sacrificio definidos',
            'c7 y a2: Embestida 1: Daño 2 a 1 rival aleatorio',
            'c9 Pacto de Sangre: Sacrificio 4',
            'Panel de keywords: leyenda con colores (ambar/cyan)'
        ],
        changes: {
            new: [
                'Trigger Sacrificio X: resta X HP de tus Seres (de mas HP a menos). Si no hay X HP, no se dispara.',
                'Trigger Enfurecer X: acumula X daño recibido, dispara el efecto y resetea.',
                'Trigger Embestida X: consume X ATK/HP y dispara el efecto que le siga.'
            ],
            buffs: [],
            nerfs: [],
            fixes: [
                'embestida() sin comprobar rival (dispara el efecto que le siga).',
                'c7 y a2: Embestida 1: Daño 2 a 1 rival aleatorio (antes Daño 1).',
                'c9 Pacto de Sangre: reescrito como Sacrificio 4: Gloria 4. Destruir 1 rival con menos HP.',
                'Panel de keywords: leyenda sin titulos, colores ambar (triggers) y cyan (keywords).'
            ],
            removed: [
                'Variable cardModalHasKeyword (reemplazada por la leyenda).'
            ]
        }
    },
    {
        version: '1.9.1',
        date: '2026-11-10',
        title: 'Triggers Embestida, Enfurecer y Sacrificio',
        highlights: [
            'Embestida X, Enfurecer X y Sacrificio X son triggers',
            'c7 y a2: Embestida ahora apunta a 1 rival aleatorio',
            'c9 Pacto de Sangre usa Sacrificio 4',
            'Panel de keywords: leyenda con colores (ambar/cyan)'
        ],
        changes: {
            new: [
                'Trigger Sacrificio X: resta X HP de tus Seres (de mas HP a menos) y dispara el efecto.',
                'Trigger Enfurecer X: acumula X daño recibido, dispara el efecto y resetea.',
                'Trigger Embestida X: consume X ATK/HP y dispara el efecto sobre 1 rival aleatorio.',
                'Panel de keywords: leyenda sin titulos, colores ambar (triggers) y cyan (keywords).'
            ],
            buffs: [],
            nerfs: [],
            fixes: [
                'c7 Jabali y a2 Asterion: Embestida apunta a 1 rival aleatorio (antes fila opuesta).',
                'c9 Pacto de Sangre: reescrito como Sacrificio 4.',
                'Desc corregidas: c2, c5, c6, c8, c10, b2, a4, a10, b3, e1, muros, fuego.'
            ],
            removed: [
                'Variable cardModalHasKeyword (reemplazada por la leyenda).'
            ]
        }
    },
    {
        version: '1.9.0',
        date: '2026-11-10',
        title: 'Sistema de efectos, arquetipos y familia satiro',
        highlights: [
            'Nuevo sistema de efectos: triggers, keywords, alcances',
            'Laberinto y Petrificar unificados en Exilio',
            'Todas las desc reescritas al nuevo formato',
            'Nueva familia: Satiro de los Bosques (c2 -> sat_cortejo / sat_pan)',
            '2 cartas nuevas: Satiro del Cortejo y Pan, el del Grito',
            '2 documentos nuevos: docs/sistema-de-efectos.md y docs/arquetipos.md'
        ],
        changes: {
            new: [
                'docs/sistema-de-efectos.md: 3 triggers, 12 keywords puras, 2 compuestas, 9 alcances, formula PPT.',
                'docs/arquetipos.md: 23 arquetipos agrupados en 4 grupos.',
                'Keyword Exilio X: unifica Laberinto y Petrificar.',
                'Familia satiro: c2 (base), sat_cortejo (rama buffer), sat_pan (rama control).',
                'Carta: Satiro del Cortejo (Ser, cost 3, 1/3, al entrar Fortalecer 1 a todos los aliados).',
                'Carta: Pan, el del Grito (Ser, cost 4, 1/5, al entrar Exilio 1 a Fila 1 rival).',
                'Mision sat_cortejo: gana 5 combates con Satiro de los Bosques en el tablero.',
                'Mision sat_pan: juega a Satiro de los Bosques en 20 partidas distintas.'
            ],
            buffs: [],
            nerfs: [],
            fixes: [
                'b2 y b10 pasan de Petrificar a Exilio (mismo coste, mismo PPT).',
                'Todas las desc reescritas al formato [Trigger]: [Keyword] [Alcance].',
                'Identificadores internos renombrados de laberinto/petrificar a exilio.'
            ],
            removed: [
                'Keyword Petrificar (unificada en Exilio).',
                'Funciones laberinto() y petrificar() de game.js (unificadas en exilio()).',
                'Estado petrifiedTurns (unificado en stunned + exilioTurns).',
                'Clases CSS fx-lab, fx-petrificado (renombradas/eliminadas).'
            ]
        }
    },
    {
        version: '1.8.0',
        date: '2026-11-10',
        title: 'Familia mortales y rebalance Pasifae',
        highlights: [
            'Nueva familia: Mortales de Arcadia (c1 -> fuego -> muros)',
            '2 cartas nuevas: Mortales del Fuego y Mortales de los Muros',
            'Nerf Pasifae: 0/3 -> 0/2'
        ],
        changes: {
            new: [
                'Familia mortales: c1 (base), fuego (forma II), muros (forma III).',
                'Carta: Mortales del Fuego (Ser, cost 3, 2/2, +1 ATK a todos tus Mortales al entrar).',
                'Carta: Mortales de los Muros (Ser, cost 4, 1/5, Bloqueo 2).',
                'Mision fuego: gana 10 combates con Mortales de Arcadia en el tablero.',
                'Mision muros: juega a Mortales del Fuego en 30 partidas distintas.'
            ],
            buffs: [],
            nerfs: [
                'Pasifae a6: stats 0/3 -> 0/2.'
            ],
            fixes: [],
            removed: []
        }
    },
    {
        version: '1.7.5',
        date: '2026-11-10',
        title: 'Selector de mazos: renombrar y arte de familia',
        highlights: [
            'El lapiz del mazo renombra (antes abria el deckbuilder)',
            'El arte del mazo resuelve la forma marcada de familias'
        ],
        changes: {
            new: [],
            buffs: [],
            nerfs: [],
            fixes: [
                'Lapiz del mazo abre prompt de renombrar, no el deckbuilder.',
                'Arte del mazo resuelve familyId y cardId de familia (usa la forma marcada).'
            ],
            removed: []
        }
    },
    {
        version: '1.7.4',
        date: '2026-11-09',
        title: 'Progreso, avatar y mazos',
        highlights: [
            'Reiniciar Progreso borra TODO el progreso real',
            'Ganar el Cap 1 desbloquea los eventos',
            'El avatar y el nombre se ven en el combate',
            'Selector de mazos en 1 columna con arte de la primera carta',
            'Fondo dinamico: el del ultimo combate jugado'
        ],
        changes: {
            new: [
                'Selector de mazos en 1 columna con aspect 3/2 y arte de la primera carta del mazo.',
                'Avatar del jugador en el header del combate.',
                'Nombre del jugador en el header del combate.',
                'Fondo del ultimo combate jugado en home/mazos/perfil/opciones.'
            ],
            buffs: [],
            nerfs: [],
            fixes: [
                'Reiniciar Progreso borra misiones, formas y stats.',
                'Ganar el Cap 1 desbloquea los eventos.',
                'Keyword redundante en card-effect-box: a3 y a10 muestran solo la mencion.',
                'Combates ganados se cuentan correctamente en el perfil.',
                'openDeckbuilderFromGameover y switchView recargan el mazo activo.'
            ],
            removed: [
                'Explicacion larga de la keyword en a3 y a10 (queda en el panel inferior).'
            ]
        }
    },
    {
        version: '1.7.3',
        date: '2026-11-09',
        title: 'Estructura de mazos y pulido de progreso',
        highlights: [
            'Entrar al deckbuilder desde la lista de mazos',
            'Boton MAZOS: lista -> deckbuilder -> lista',
            'Reiniciar Progreso borra TODO el progreso real',
            'Combates ganados se cuentan en el perfil'
        ],
        changes: {
            new: [],
            buffs: [],
            nerfs: [],
            fixes: [
                'Entrar al deckbuilder desde la lista de mazos (boton Editar y tarjeta).',
                'Boton MAZOS: lista -> deckbuilder -> lista (ya no expulsa a home).',
                'closeCardModal no reanuda una partida ya terminada.',
                'Reiniciar Progreso borra mazos, formas, misiones y stats.',
                'Renombrar mazo ya no pierde el foco del input.',
                'Combates ganados se cuentan correctamente en el perfil.',
                'openDeckbuilderFromGameover y switchView recargan el mazo activo.',
                'Limpiado codigo muerto: faction, c15, c18.'
            ],
            removed: [
                'Bloque faction del modal de carta (ninguna carta lo usa).',
                'Referencias a c15 y c18 en canStillScore (cartas eliminadas en v1.1.0).'
            ]
        }
    },
    {
        version: '1.7.2',
        date: '2026-11-09',
        title: 'Navegacion de mazos y arte del modal',
        highlights: [
            'Entrar al deckbuilder desde la lista de mazos',
            'Boton MAZOS: lista -> deckbuilder -> lista',
            'Arte del modal recupera tamano grande en modo combate'
        ],
        changes: {
            new: [],
            buffs: [],
            nerfs: [],
            fixes: [
                'Entrar al deckbuilder desde la lista de mazos (boton Editar y tarjeta).',
                'Boton MAZOS: lista -> deckbuilder -> lista (ya no expulsa a home).',
                'Arte del modal recupera tamano grande en modo combate.',
                'openDeckbuilderFromGameover() recarga el mazo activo.'
            ],
            removed: []
        }
    },
    {
        version: '1.7.1',
        date: '2026-11-08',
        title: 'Reflejo Real y Visuales de Estado',
        highlights: [
            'Reflejo ahora refleja el mismo efecto al rival',
            'Bloqueo real: amortigua reducciones de ATK/HP',
            'Los estados se ven en el tablero: reflejo, buff, debuff, inmune, bloqueo',
            'Ajustes de balance en b2, b3, b5, b10'
        ],
        changes: {
            new: [
                'Indicadores visuales persistentes: reflejo (azul), buff ATK (verde), debuff ATK (rojo), inmune (blanco), bloqueo (dorado)',
                'Reflejo real: refleja el mismo efecto (petrificar, debuff, daño dirigido) al rival',
                'Bloqueo X: amortigua reducciones de ATK/HP de efectos rivales'
            ],
            buffs: [
                'b5 (El Escudo Espejo): Reflejo 1 a todos tus Seres (antes solo al de más ATK).'
            ],
            nerfs: [
                'b2 (Medusa, la Gorgona): stats 3/4 → 2/2. startTurn con condición (Fila 1).',
                'b10 (La Mirada de Piedra): quita +2 Gloria. Ahora petrifica 2 veces a un rival aleatorio.'
            ],
            fixes: [
                'b5 (El Escudo Espejo): coste 3 → 2',
                'Keywords Serpientes y Serpientes de la Cabeza eliminadas (efectos inline en b2)'
            ],
            removed: []
        }
    },
    {
        version: '1.7.0',
        date: '2026-11-07',
        title: 'La Gorgona',
        highlights: [
            'Nueva subhistoria: La Gorgona (Medusa)',
            '4 keywords nuevas: Petrificar, Serpientes, Reflejo, Serpientes de la Cabeza',
            'Se desbloquea tras completar el evento Asterión'
        ],
        changes: {
            new: [
                'Evento: La Gorgona (subhistoria de Medusa)',
                'Keyword: Petrificar X (no puntúa X turnos)',
                'Keyword: Serpientes X (daño recurrente al rival de Fila 1)',
                'Keyword: Reflejo X (refleja el próximo efecto rival)',
                'Keyword: Serpientes de la Cabeza X (invoca tokens 1/1 al morir)',
                'Carta: Medusa, la Doncella (0/3, +1 Gloria por aliado)',
                'Carta: Medusa, la Gorgona (3/4, Petrificar 2 + Serpientes 1 + Serpientes de la Cabeza 2)',
                'Carta: Esteno, la Fuerte (3/3, Bloqueo 2)',
                'Carta: Euríale, la Errante (2/3, -1 ATK Fila 1)',
                'Carta: El Escudo Espejo (Reflejo 1 este turno)',
                'Carta: Las Sandalias Aladas (+2 ATK este turno)',
                'Carta: El Casco de Invisibilidad (inmunidad a efectos rivales este turno)',
                'Carta: Pegaso, el Nacido de la Sangre (3/4, +2 Gloria + +1 ATK a todos)',
                'Carta: Crisaor, el de la Espada de Oro (3/3, +1 ATK permanente a todos)',
                'Carta: La Mirada de Piedra (Petrificar 2 al rival con más ATK + +2 Gloria)',
                'Token: Serpientes de la Cabeza (1/1, sin efecto)'
            ],
            buffs: [],
            nerfs: [],
            fixes: [],
            removed: []
        }
    },
    {
        version: '1.6.0',
        date: '2026-11-07',
        title: 'Pulido de UX y Embestida',
        highlights: [
            'Transiciones suaves entre pantallas',
            'Logo animado y botón COMENZAR COMBATE con pulso',
            'Embestida restaurada: la carta arremete hacia el rival',
            'Indicador de cartas nuevas en el deckbuilder'
        ],
        changes: {
            new: [
                'Transición fade al cambiar de vista',
                'Animación de entrada del logo (fade + scale)',
                'Pulso suave en el botón COMENZAR COMBATE',
                'Mejora de animate-deploy (cartas entran con bounce)',
                'Feedback táctil en acciones clave (tocar carta, mazo, combate, recompensa)',
                'Puntito rojo en cartas nuevas del deckbuilder',
                'Badge NUEVA en la carta de recompensa'
            ],
            buffs: [],
            nerfs: [],
            fixes: [
                'FIX: Embestida restaurada (la carta atacante se desplaza hacia la víctima)'
            ],
            removed: []
        }
    },
    {
        version: '1.5.0',
        date: '2026-11-07',
        title: 'Modal de Carta Profesional',
        highlights: [
            'El modal de carta ahora tiene 2 modos: combate y lore',
            'Toca la carta para ver el arte completo y su historia',
            'Bugs corregidos y mejoras de UX'
        ],
        changes: {
            new: [
                'Modo combate (por defecto): stats, efecto y keyword, sin lore',
                'Modo lore (al tocar la carta): arte expandido y lore debajo',
                'Icono indicador de modo (libro/espada) en el marco',
                'Botón de eventos con candado visual (gris + candado) en vez de alert'
            ],
            buffs: [],
            nerfs: [],
            fixes: [
                'FIX: c9 (Pacto de Sangre) respeta noDestroy y stunned',
                'FIX: validación de ownedCardIds en loadDeck (mazos huérfanos se limpian)',
                'Limpieza: eliminado pulse: fx-shake (dato muerto)'
            ],
            removed: []
        }
    },
    {
        version: '1.4.0',
        date: '2026-11-07',
        title: 'Efectos Visuales y Recompensas',
        highlights: [
            'Efectos visuales más claros: flashes de color por tipo de efecto',
            'El Laberinto ahora se siente: la carta se encoge y oscurece',
            'La recompensa se muestra como carta flotante con arte y stats'
        ],
        changes: {
            new: [
                'Flash de color por tipo de efecto (daño rojo, buff verde, debuff morado, gloria dorado, invocación azul)',
                'Micro-pausa dramática en los FX (solo visual, no pausa el tick)',
                'Laberinto: la carta atrapada se encoge y oscurece con icono de laberinto',
                'Embestida: flash rojo doble + sacudida fuerte',
                'Invocación: la carta cae con rebote',
                'Modal de recompensa con carta flotante (arte, nombre, tipo, coste, stats)',
                'La carta de recompensa es tocable para ver el detalle'
            ],
            buffs: [],
            nerfs: [],
            fixes: [
                'FIX: resetMatch copia los objetos de las cartas (Pasífae ya no contamina ALL_CARDS ni al rival)'
            ],
            removed: []
        }
    },
    {
        version: '1.3.1',
        date: '2026-11-07',
        title: 'El Lore de Asterión, Restaurado',
        highlights: [
            'Lore completo de las 10 cartas del mazo de Asterión',
            'Facciones corregidas (Pasífae → Afrodita, Dédalo → Hefesto)',
            'Pasífae ahora buffa a Asterión también en el mazo'
        ],
        changes: {
            new: [],
            buffs: [],
            nerfs: [],
            fixes: [
                'Restaurado el lore completo (3-4 frases) de a2-a11',
                'Pasífae ahora es de Afrodita (antes Poseidón)',
                'Dédalo y Construcción del Laberinto ahora son de Hefesto (antes Atenea)',
                'Pasífae aplica +1 HP a Asterión en tablero Y en mazo (antes solo tablero)'
            ],
            removed: []
        }
    },
    {
        version: '1.3.0',
        date: '2026-11-07',
        title: 'El Toro de Creta y la Rejugabilidad',
        highlights: [
            'Conexión narrativa entre el Capítulo 1 y el evento Asterión',
            '3 órdenes de mazo por bot (elegidos al azar)',
            'El bot del Capítulo 1 ahora se llama Hélade'
        ],
        changes: {
            new: [
                'Beat "El Toro de Creta" en la intro del Capítulo 1',
                '3 órdenes de mazo para el Cap 1 (Hélade) y el evento Asterión',
                'Regla de diseño: todo capítulo nuevo tendrá 3 órdenes de mazo'
            ],
            buffs: [],
            nerfs: [],
            fixes: [
                'El bot del Cap 1 ya no se llama "Caos" (ahora "Hélade")',
                'Eliminados los duplicados de c1/c2 en el mazo del Cap 1 (ahora 10 cartas únicas)'
            ],
            removed: []
        }
    },
    {
        version: '1.2.0-dev',
        date: '2026-11-07',
        title: '[DEV] Modo desarrollador',
        dev: true, // solo visible en modo dev
        highlights: [
            'Panel dev flotante para testear sin rejugar todo',
            'Override en memoria: no contamina el guardado real',
            'Barra extra en combate con atajos de debug'
        ],
        changes: {
            new: [
                'Panel dev (activación: ?dev=1 en la URL)',
                'Botón flotante DEV con toggles de desbloqueo',
                'Barra de combate dev (saltar turno, estado, forzar drop, reset)',
                'Función devForceReward, devResetMatch, devShowState, devJumpToChapter'
            ],
            buffs: [],
            nerfs: [],
            fixes: [],
            removed: []
        }
    },
    {
        version: '1.1.0',
        date: '2026-11-07',
        title: 'El Laberinto de Creta',
        highlights: [
            'Nuevo evento: El Laberinto de Creta (Asterión)',
            'Nueva keyword: Laberinto X',
            'Recompensa al perder: 15% (antes solo al ganar)'
        ],
        changes: {
            new: [
                'Evento: El Laberinto de Creta (subhistoria de Asterión)',
                'Keyword: Laberinto X (atrapa a un Ser rival X turnos)',
                'Carta: Asterión, Enfurecido (5/5, Embestida 1)',
                'Carta: Asterión, el Señor del Laberinto (6/4, Laberinto 2)',
                'Carta: El Toro Blanco de Creta (1/5, Bloqueo 2)',
                'Carta: Teseo en el Laberinto (4/4, +2 Gloria por aliado)',
                'Carta: Pasífae, la Reina de Creta (0/3, +1 HP a tus Asterión)',
                'Carta: Dédalo, el Arquitecto (1/4, invoca Vaca de Madera Hueca)',
                'Token: Vaca de Madera Hueca (0/1, al morir invoca Asterión)',
                'Evento: El Nacimiento del Minotauro (invoca Asterión)',
                'Evento: La Construcción del Laberinto (Laberinto 2)',
                'Evento: La Muerte del Minotauro (4 daño al rival con más ATK)'
            ],
            buffs: [],
            nerfs: [],
            fixes: [
                'Recompensa al perder: 15% de drop en Cap 2+ y eventos (antes solo al ganar)'
            ],
            removed: [
                'Capítulos 2, 3 y 4 (temporalmente, para reorganización del contenido)',
                'Cartas c11–c40 (se conservan los artes en el repo, fuera del PRECACHE)'
            ]
        }
    },
    {
        version: '1.0.0',
        date: '2026-10-01',
        title: 'Lanzamiento inicial',
        highlights: [
            'Capítulo 1: El Despertar en la Hélade',
            'Combate automático por turnos simultáneos',
            'Deckbuilder con drag & drop y táctil'
        ],
        changes: {
            new: [
                'Capítulo 1 (c1–c10)',
                'Combate: energía acumulativa, Gloria, fin por ±50 o mazo agotado',
                'Keywords: Embestida, Enfurecer, Bloqueo',
                'Tutorial en 6 pasos',
                'Perfil con avatar y nombre',
                'Opciones: música, efectos, créditos, reiniciar progreso',
                'Sistema de recompensas: 33% al ganar (Cap 2+)'
            ],
            buffs: [],
            nerfs: [],
            fixes: [],
            removed: []
        }
    }
];

// Devuelve la versión más reciente (índice 0). En modo dev, incluye las
// versiones dev:true; en modo normal, las filtra.
function getLatestVersion() {
    let visible = PATCH_NOTES.filter(p => !p.dev || (typeof isDevMode === 'function' && isDevMode()));
    return visible.length > 0 ? visible[0].version : null;
}

// Devuelve el array de notas visibles según el modo.
function getVisiblePatchNotes() {
    if (typeof isDevMode === 'function' && isDevMode()) return PATCH_NOTES;
    return PATCH_NOTES.filter(p => !p.dev);
}
