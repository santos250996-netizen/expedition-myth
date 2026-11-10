// --- NOTAS DEL PARCHE (PATCH NOTES) ---
// Historial versionado de cambios del juego. Cada entrada es una versión.
// La más reciente va PRIMERO (índice 0). El banner de la home y el badge de
// Opciones se activan si nexo_last_seen_version < PATCH_NOTES[0].version.
// El formato de cambios es categorizado: new, buffs, nerfs, fixes, removed.
// En modo dev, además, se muestran las versiones con dev:true (sección [DEV]).

const PATCH_NOTES = [
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
