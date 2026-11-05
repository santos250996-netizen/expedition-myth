// --- LÓGICA DE COMBATE ---
// Reloj de turnos, despliegue por energía, resolución de efectos y fin de partida.

// Descuento del Oráculo Ciego (c8): los Eventos cuestan -1 mientras haya un
// Oráculo vivo en tablero. Única fuente: la usa la partida y el HUD, así el
// coste mostrado siempre coincide con el cobrado.
function oracleDiscountFor(player, card) {
    if (!card || card.kind !== 'Evento') return 0;
    return player.activeBoard.some(c => c.id === 'c8' && !c.dying) ? 1 : 0;
}

// Daño canónico: aplica HP, marca moribunda y, si sobrevive, dispara la
// reacción al daño (Titán Menor c12: +1 ATK permanente). Toda fuente de
// daño (choques de Embestida y eventos) pasa por aquí para que la reacción
// no dependa de quién golpea.
function dealDamage(target, amount) {
    if (!target || target.dying) return;
    target.hp -= amount;
    if (target.hp <= 0) { target.hp = 0; target.dying = true; return; }
    if (target.damageReact) target.damageReact(target);
}

// Lado del jugador dueño de una carta en tablero (para FX de reacciones que
// se disparan sin contexto de jugador, como el buff del Titán).
function ownerSideOf(card) {
    return gameState.p1.activeBoard.includes(card) ? 'p1' : 'p2';
}

function gameTick() {
            gameState.turn++;
            // Las cartas que murieron el turno anterior ya se vieron
            // disolverse durante ese tick: ahora se retiran del tablero.
            gameState.p1.activeBoard = gameState.p1.activeBoard.filter(c => !c.dying);
            gameState.p2.activeBoard = gameState.p2.activeBoard.filter(c => !c.dying);
            gameState.p1.energy += 1;
            gameState.p2.energy += 1;

            // Inicio de turno SIMULTÁNEO: los choques de Embestida se
            // registran contra el mismo estado del tablero y el daño se
            // aplica después, para que ni el orden de los tableros ni una
            // muerte temprana den ventaja a ningún lado.
            gameState.clashQueue = [];
            gameState.p1.activeBoard.slice().forEach(card => { if(card.startTurn) card.startTurn(card, gameState.p1, gameState.p2); });
            gameState.p2.activeBoard.slice().forEach(card => { if(card.startTurn) card.startTurn(card, gameState.p2, gameState.p1); });
            gameState.clashQueue.forEach(h => {
                dealDamage(h.target, 1);
            });

            gameState.p1.activeBoard.forEach(c => { c.tempAtkMod = 0; c.stunned = false; });
            gameState.p2.activeBoard.forEach(c => { c.tempAtkMod = 0; c.stunned = false; });

            // Turno COMPARTIDO: no hay "primero" ni "segundo". Fase 1: ambos
            // eligen y pagan su carta contra el mismo estado; los Seres entran
            // a la vez a la cima. Fase 2: los efectos resuelven, todos contra
            // tableros ya actualizados por los dos — así el debuff de nadie
            // ve un despliegue que el otro aún no hizo.
            let play1 = beginPlay(gameState.p1, playerDeck);
            let play2 = beginPlay(gameState.p2, rivalDeck);
            if (play1) deployPlay(gameState.p1, play1);
            if (play2) deployPlay(gameState.p2, play2);
            if (play1) resolvePlay(gameState.p1, gameState.p2, play1);
            if (play2) resolvePlay(gameState.p2, gameState.p1, play2);

            // Las cartas muriendo o aturdidas este turno (Canto Embrujado c14)
            // ya no suman gloria: aturdir = no atacar = no puntuar un tick.
            let boardPoints = (board) => board.reduce((sum, card) => sum + (card.dying || card.stunned ? 0 : Math.max(0, card.atk + (card.tempAtkMod || 0))), 0);
            let p1TurnPoints = boardPoints(gameState.p1.activeBoard) + gameState.p1.extraPoints;
            let p2TurnPoints = boardPoints(gameState.p2.activeBoard) + gameState.p2.extraPoints;
            
            gameState.p1.score += p1TurnPoints;
            gameState.p2.score += p2TurnPoints;
            
            gameState.p1.extraPoints = 0;
            gameState.p2.extraPoints = 0;

            // FIX: el ATK buffado del Sátiro (c2) ya no se resetea aquí. Su
            // startTurn parte de 0 cada turno, y este reset ANTES del render
            // hacía que el buff nunca se viera en pantalla (sí puntuaba).

            // FIX: animar solo las cartas recién desplegadas, no todo el tablero cada tick.
            gameState.justDeployed = [gameState.p1.lastPlayed, gameState.p2.lastPlayed]
                .filter(c => c && c.kind === 'Ser')
                .map(c => c.uid);

            updateHUD();
            renderBoards();
            // Los FX se materializan tras el render (el render borra el DOM).
            playQueuedFx();

            // La partida SOLO termina por diferencia de 50: aunque ambos mazos
            // se agoten, los tableros siguen puntuando turno a turno hasta que
            // alguien abra esa ventaja.
            if (Math.abs(gameState.p1.score - gameState.p2.score) >= 50) {
                pauseGame();
                showGameOver();
            }
        }

        // Fase 1 del turno compartido: comprometer la jugada (pagar y avanzar
        // el mazo) contra el estado que ambos comparten, sin aplicar nada aún.
        function beginPlay(player, deck) {
            if (player.deckPointer >= deck.length) return null;
            if (player.activeBoard.length >= 12) return null;

            let nextCard = deck[player.deckPointer];
            let oracleDiscount = oracleDiscountFor(player, nextCard);
            let effectiveCost = Math.max(0, nextCard.cost - oracleDiscount);
            if (player.energy < effectiveCost) return null;

            player.energy -= effectiveCost;
            player.deckPointer++;
            return {
                card: nextCard,
                inst: { ...nextCard, uid: Math.random().toString(36).slice(2, 9), tempAtkMod: 0, stunned: false },
                discount: oracleDiscount
            };
        }

        // Los Seres de AMBOS lados entran a la cima antes de que ningún
        // efecto resuelva: la cima del rival es la misma para los dos.
        function deployPlay(player, play) {
            if (play.inst.kind === 'Ser') player.activeBoard.unshift(play.inst);
        }

        // Fase 2 del turno compartido: efectos y avisos visuales, contra
        // tableros ya actualizados por los dos jugadores.
        function resolvePlay(player, opponent, play) {
            if (play.card.effect) play.card.effect(player, opponent, player.lastPlayed);

            // Los eventos no entran en tablero: se proyectan como hechizo
            // para que su activación se vea. El descuento del Oráculo
            // también avisa junto al contador de energía.
            if (play.card.kind === 'Evento') queueFx({ t: 'cast', side: sideOf(player), card: play.card });
            if (play.discount > 0) queueFx({ t: 'discount', side: sideOf(player), text: '−' + play.discount });

            player.lastPlayed = play.inst;
        }

        function startGame() {
            // El combate siempre ocurre dentro de un capítulo: si no hay
            // capítulo activo se lleva al jugador a la selección.
            if (!currentChapter) { openChapters(); return; }
            if(playerDeck.length === 0) { alert("¡Tu mazo está vacío!"); return; }
            
            if (gameState.isPlaying) { pauseGame(); return; }

            let gameView = document.getElementById('view-game');
            if (gameView.classList.contains('hidden-view')) {
                switchView('view-game'); // entra al combate y resetea la partida
            }

            document.getElementById('pause-overlay').classList.add('hidden-view');
            gameState.isPlaying = true;
            applyFxSpeed();
            syncControls();
            
            clearInterval(gameState.timer);
            gameState.timer = setInterval(gameTick, 1500 / gameState.speed);
            gameTick(); 
        }

        function togglePlayPause() {
            if (gameState.isPlaying) pauseGame();
            else startGame();
        }

        function pauseGame() {
            gameState.isPlaying = false;
            clearInterval(gameState.timer);
            syncControls();
        }

        function togglePauseOverlay() {
            let overlay = document.getElementById('pause-overlay');
            if (overlay.classList.contains('hidden-view')) {
                overlay.classList.remove('hidden-view');
                if (gameState.isPlaying) pauseGame();
            } else {
                overlay.classList.add('hidden-view');
            }
            syncControls(); // FIX: los iconos siempre reflejan el estado real
        }

        function skipTurn() {
            if(gameState.isPlaying) {
                clearInterval(gameState.timer);
                gameTick();
                // FIX: si el tick forzó el fin de partida, no rearmar el reloj
                // (antes la partida seguía avanzando detrás del modal final).
                if (gameState.isPlaying) gameState.timer = setInterval(gameTick, 1500 / gameState.speed);
            } else {
                gameTick();
            }
        }

        function cycleSpeed() {
            if (gameState.speed === 1) gameState.speed = 2;
            else if (gameState.speed === 2) gameState.speed = 4;
            else gameState.speed = 1;

            document.getElementById('btn-speed').innerText = `${gameState.speed}x`;
            applyFxSpeed();
            if (gameState.isPlaying) {
                clearInterval(gameState.timer);
                gameState.timer = setInterval(gameTick, 1500 / gameState.speed);
            }
        }

        function resetMatch() {
            pauseGame();
            // El mazo del bot sale de los datos del capítulo activo.
            rivalDeck = getChapterBotDeck();
            gameState.turn = 0; // el primer tick pasa a mostrar TURNO 1 (antes mostraba 2)
            gameState.justDeployed = [];
            gameState.fxQueue = [];
            gameState.clashQueue = [];
            gameState.p1 = { score: 0, energy: 1, deckPointer: 0, activeBoard: [], lastPlayed: null, extraPoints: 0 };
            gameState.p2 = { score: 0, energy: 1, deckPointer: 0, activeBoard: [], lastPlayed: null, extraPoints: 0 };
            document.getElementById('pause-overlay').classList.add('hidden-view');
            updateHUD();
            renderBoards();
        }
