// --- LÓGICA DE COMBATE ---
// Reloj de turnos, despliegue por energía, resolución de efectos y fin de partida.

// Descuento de Eventos: cada aura viva en tablero (Profecía c20, Guardián
// de Delfos c32) abarata los Eventos en 1 Energía, mínimo 0; el Oráculo c8
// aporta -1 SOLO para el próximo Evento (trigger al entrar, se consume al
// jugarlo). Mazos singleton → como mucho dos auras. Única fuente: la usa la
// partida y el HUD, así el coste mostrado siempre coincide con el cobrado.
function oracleDiscountFor(player, card) {
    if (!card) return 0;
    let discount = 0;
    if (card.kind === 'Evento') {
        let auras = player.activeBoard.filter(c => (c.id === 'c20' || c.id === 'c32') && !c.dying).length;
        discount = auras + (player.pendingEventDiscount || 0);
    } else if (card.kind === 'Ser') {
        discount = (player.pendingSerDiscount || 0);
    }
    return discount;
}

// Expira el +HP temporal (Bendición de Atenea c37): la bendición se retira al
// comenzar el tick siguiente; si el daño recibido la consumió, el Ser muere.
function expireTempHp(card) {
    if (!card.tempHpMod) return;
    card.hp -= card.tempHpMod;
    card.tempHpMod = 0;
    if (card.hp <= 0) { card.hp = 0; card.dying = true; }
}

// --- SISTEMA DE MUERTE INMEDIATA ---
// Cuando una carta llega a 0 HP, se marca como dying, se mueve a deathQueue
// (para que se vea su animación) y se RETIRA del tablero inmediatamente.
// Así no ocupa fila y los efectos posteriores ya no la ven.
function killCard(card, side) {
    if (!card || card.dying) return;
    card.dying = true;
    if (!gameState.deathQueue) gameState.deathQueue = [];
    gameState.deathQueue.push({ card: { ...card }, side: side });
    let board = side === 'p1' ? gameState.p1.activeBoard : gameState.p2.activeBoard;
    let idx = board.indexOf(card);
    if (idx > -1) board.splice(idx, 1);
    // Mision kills_with: Seres rivales destruidos mientras la carta
    // previousCardId esta viva en el tablero del jugador (v1.9.4).
    if (card.kind === 'Ser' && side === 'p2') {
        gameState.p1.activeBoard.forEach(k => { if (!k.dying) trackMission(k.id, 'kills_with', 1); });
    }
    // Reacción al morir (Vaca de Madera Hueca a8, Serpientes de la Cabeza b2).
    if (card.onDeath) {
        let owner = side === 'p1' ? gameState.p1 : gameState.p2;
        try { card.onDeath(owner); } catch (e) { console.error('onDeath:', e); }
    }
}

// Daño canónico: aplica HP y, si la carta muere, killCard la retira del
// tablero en el acto (con copia en deathQueue para su disolución). Toda
// fuente de daño (choques de Embestida y eventos) pasa por aquí para que
// la reacción al daño (Titán Menor c12: +1 ATK permanente) no dependa de
// quién golpea; la reacción solo dispara si el golpeado sobrevive.
function dealDamage(target, amount, side, sourcePlayer) {
    if (!target || target.dying || target.stunned) return;
    // Reflejo: si el target tiene Reflejo y el atacante es un jugador concreto
    // (sourcePlayer), se refleja el daño.
    if (target.reflectCharges > 0 && sourcePlayer && !target.immuneThisTurn) {
        if (tryReflect(target, sourcePlayer, (reflectedTarget) => {
            reflectedTarget.hp -= amount;
            if (reflectedTarget.hp <= 0) { reflectedTarget.hp = 0; killCard(reflectedTarget, ownerSideOf(reflectedTarget)); }
            queueFx({ t: 'debuff', side: sideOf(sourcePlayer), uid: reflectedTarget.uid, text: '-' + amount + ' HP', icon: 'fa-heart-crack', overlay: 'hit' });
        })) return;
    }
    // Bloqueo: absorbe parte del daño (reducción de HP).
    let dmg = bloqueoAbsorb(target, amount);
    if (dmg <= 0) return;
    target.hp -= dmg;
    // Trigger Enfurecer: acumula daño recibido. Si llega al
    // umbral de la carta, dispara su efecto y resetea.
    if (target.enfurecerThreshold) {
        enfurecer(target, dmg);
    }
    if (target.hp <= 0) {
        target.hp = 0;
        killCard(target, side || ownerSideOf(target));
        return;
    }
    if (target.damageReact) target.damageReact(target);
}

// --- TRIGGER: EMBESTIDA X ---
// Consume X ATK y X HP de la carta para disparar el efecto que le siga
// (embestidaEffect), que decide su propio objetivo. Si no puede pagar el
// coste (ATK < X o HP < X) o no queda ningún rival vivo, no se activa. Si
// el pago remata a la carta, queda dying con FX de sacrificio; el efecto
// se dispara igualmente porque el trigger ya esta en marcha.
function embestida(self, player, opp, X) {
    if (self.atk < X || self.hp < X) return;
    if (!opp.activeBoard.some(c => !c.dying)) return;
    self.atk -= X;
    self.hp -= X;
    queueFx({ t: 'clash', side: sideOf(player), uidA: self.uid });
    if (self.hp <= 0) {
        self.hp = 0;
        self.dying = true;
        queueFx({ t: 'sacrifice', side: sideOf(player), uid: self.uid });
    }
    // El trigger dispara el efecto que le siga. El efecto
    // decide el objetivo.
    if (typeof self.embestidaEffect === 'function') {
        self.embestidaEffect(self, player, opp);
    }
}

// --- TRIGGER: ENFURECER X ---
// Acumula el daño real recibido (dmg tras Bloqueo). Al superar el umbral
// dispara enfurecerEffect(target, owner) y resetea el contador a 0.
function enfurecer(target, dmg) {
    if (!target.enfurecerThreshold || !target.enfurecerEffect) return;
    target.enfurecerCounter = (target.enfurecerCounter || 0) + dmg;
    if (target.enfurecerCounter >= target.enfurecerThreshold) {
        target.enfurecerCounter = 0;
        try {
            target.enfurecerEffect(target, gameState[ownerSideOf(target)]);
        } catch (e) { console.error('enfurecer:', e); }
    }
}

// --- KEYWORD: LABERINTO X ---
// Atrapa a un Ser rival aleatorio X turnos. Mientras esté atrapado: ATK y HP
// a 0, no ataca, no puntúa, no recibe daño ni efectos, no es elegido por
// efectos dirigidos. Al expirar, recupera sus stats guardados. La carta
// atrapada NO muere aunque su HP llegue a 0 (stunned la protege).
function exilio(player, opp, X) {
    let targets = opp.activeBoard.filter(c => !c.dying && !c.stunned && !c.noExilio);
    if (!targets.length) return;
    let target = targets[Math.floor(Math.random() * targets.length)];
    target.stunned = true;
    target.exilioTurns = X;
    target._exilioSavedAtk = target.atk;
    target._exilioSavedHp = target.hp;
    target.atk = 0;
    target.hp = 0;
    queueFx({ t: 'exilio', side: sideOf(opp), uid: target.uid });

    // Mision exile_with: exilios a Seres rivales mientras la carta
    // previousCardId esta viva en el tablero del jugador (v1.9.4).
    if (player === gameState.p1 && target.kind === 'Ser') {
        gameState.p1.activeBoard.forEach(k => { if (!k.dying) trackMission(k.id, 'exile_with', 1); });
    }

    // SISTEMA DE FAMILIAS: mision exilio_received
    for (let missionCardId in CARD_MISSIONS) {
        let mission = CARD_MISSIONS[missionCardId];
        if (mission.previousCardId === target.id && mission.type === 'exilio_received') {
            let progress = getProgressFor(missionCardId);
            let newCount = (progress.exilioReceived || 0) + 1;
            updateProgressFor(missionCardId, { exilioReceived: newCount });
            if (newCount >= mission.count) {
                if (unlockCard(missionCardId)) {
                    let cardData = ALL_CARDS.find(c => c.id === missionCardId);
                    showTutorialMessage("¡Mision completada!", "Has desbloqueado la forma: " + (cardData ? cardData.name : missionCardId));
                }
            }
        }
    }
}

function sacrificio(player, X, applyEffect) {
    // Comprueba si hay X HP disponibles en los Seres del jugador.
    let totalHp = player.activeBoard
        .filter(c => !c.dying && c.kind === 'Ser')
        .reduce((sum, c) => sum + c.hp, 0);
    if (totalHp < X) return false;

    // Reparte X HP de mas HP a menos.
    let remaining = X;
    let sorted = player.activeBoard
        .filter(c => !c.dying && c.kind === 'Ser')
        .slice()
        .sort((a, b) => b.hp - a.hp);

    for (let c of sorted) {
        if (remaining <= 0) break;
        let dmg = Math.min(remaining, c.hp);
        c.hp -= dmg;
        remaining -= dmg;
        queueFx({ t: 'debuff', side: sideOf(player), uid: c.uid, text: '-' + dmg + ' HP', icon: 'fa-droplet', overlay: 'hit' });
        if (c.hp <= 0) {
            c.hp = 0;
            killCard(c, sideOf(player));
        }
    }

    // Dispara el efecto.
    if (typeof applyEffect === 'function') applyEffect();
    return true;
}

// --- INVOCACIÓN DE CARTAS ---
// Instancia una carta (Ser o Token) en la cima del tablero del jugador,
// con uid nuevo. Si el tablero está lleno (12), no se invoca.
function summonCard(player, cardTemplate) {
    if (!cardTemplate) return;
    if (!player || !player.activeBoard) { console.error('summonCard: player inválido', player); return; }
    if (player.activeBoard.length >= 12) return;
    let inst = {
        ...cardTemplate,
        uid: Math.random().toString(36).slice(2, 9),
        tempAtkMod: 0,
        tempHpMod: 0,
        stunned: false,
        exilioTurns: 0,
        reflectCharges: 0,
        bloqueo: cardTemplate.bloqueo || 0,
        immuneThisTurn: false,
        enfurecerCounter: 0
    };
    // Mision invoke_with: invocaciones hechas desde un efecto mientras la
    // carta previousCardId esta viva en el tablero del jugador (v1.9.4).
    if (gameState._inEffect && player === gameState.p1) {
        gameState.p1.activeBoard.forEach(k => { if (!k.dying) trackMission(k.id, 'invoke_with', 1); });
    }
    player.activeBoard.unshift(inst);
    gameState.justDeployed.push(inst.uid);
    queueFx({ t: 'summon', side: sideOf(player), uid: inst.uid });
}

// Lado del jugador dueño de una carta en tablero (para FX de reacciones que
// se disparan sin contexto de jugador, como el buff del Titán).
function ownerSideOf(card) {
    return gameState.p1.activeBoard.includes(card) ? 'p1' : 'p2';
}

// Escudo del Coloso de la Grieta Profunda (c24): aura global que amortigua
// hasta 4 puntos acumulados de reducción de stat (ATK o HP) sobre TODAS tus
// cartas en tablero; al agotarse los 4 puntos, el efecto se desactiva. NO
// absorbe daño (Ira, Disputa, choques, Derrumbe) ni costes propios (Pacto,
// Embestida, Ofrenda, desgaste c34): solo reducciones de stat.
function colossusShieldFor(owner, amount) {
    if (amount <= 0) return 0;
    let shield = owner.activeBoard.find(c => c.id === 'c24' && !c.dying);
    if (!shield) return amount;
    if (shield.shieldCharges === undefined) shield.shieldCharges = 4;
    if (shield.shieldCharges <= 0) return amount;
    let absorbed = Math.min(amount, shield.shieldCharges);
    shield.shieldCharges -= absorbed;
    queueFx({ t: 'debuff', side: sideOf(owner), uid: shield.uid, text: '⛨ -' + absorbed, icon: 'fa-gears', cls: 'fx-gray', pulse: 'fx-pulse-gray' });
    return amount - absorbed;
}

// Reducción de HP canónica (los 4 disparos del Temblor c29): NO es daño, no
// pasa por dealDamage ni dispara reacciones al daño (Titán c12); el escudo
// del Coloso (c24) la amortigua si está activa.
function applyHpReduction(owner, target, amount, fxIcon) {
    if (!target || target.dying || target.stunned) return;
    let left = bloqueoAbsorb(target, amount);
    if (left <= 0) return;
    left = colossusShieldFor(owner, left);
    if (left <= 0) return;
    target.hp -= left;
    queueFx({ t: 'debuff', side: sideOf(owner), uid: target.uid, text: '-' + left + ' HP', icon: fxIcon || 'fa-heart-crack', cls: 'fx-gray' });
    if (target.hp <= 0) {
        target.hp = 0;
        killCard(target, sideOf(owner));
    }
}

// ¿Todavía puede este lado sumar gloria en algún turno futuro? Es fuente de
// gloria: tener mazo por jugar, o un Ser vivo con ATK permanente que puntúe
// el tick. Los generadores periódicos también: Sátiro c2 (+1 ATK por cada
// otro Ser aliado vivo, cualquier fila).
// El ATK temporal (Bendición c37) NO cuenta: se resetea antes de puntuar el
// próximo tick.
function canStillScore(player) {
    if (player.deckPointer < player.deck.length) return true;
    let alive = player.activeBoard.filter(c => !c.dying);
    return alive.some(c => {
        if (c.stunned) return (c.exilioTurns || 0) > 0;
        if (c.atk > 0) return true;
        if (c.id === 'c2' && alive.some(o => o !== c && o.kind === 'Ser')) return true;
        return false;
    });
}

function gameTick() {
            gameState.turn++;
            // --- MENSAJES DEL TUTORIAL (solo Capítulo 1.0) ---
            if (tutorialActive && currentChapter && currentChapter.id === 1) {
                if (gameState.turn === 1) {
                    showTutorialMessage("Bienvenido al combate", "Tú no controlas las cartas directamente. Tu única decisión es el ORDEN de tu mazo.");
                }
                if (gameState.p1.lastPlayed && gameState.p1.lastPlayed.kind === 'Ser' && !tutorialSerShown) {
                    tutorialSerShown = true;
                    showTutorialMessage("Has jugado un Ser", "Los Seres se quedan en el tablero y suman su ATK a tu Gloria al final de cada turno.");
                }
                if (gameState.p1.lastPlayed && gameState.p1.lastPlayed.kind === 'Evento' && !tutorialEventShown) {
                    tutorialEventShown = true;
                    showTutorialMessage("Has jugado un Evento", "Los Eventos hacen su efecto y desaparecen. ¡Úsalos para debilitar al rival o ganar Gloria!");
                }
            }
            // --- LIMPIEZA DE LA COLA DE MUERTE (del turno anterior) ---
            gameState.deathQueue = [];

            // Red de seguridad: las muertes que NO pasan por killCard
            // (expiración de la Bendición c37, sacrificio de la Ofrenda)
            // marcan dying a mano y se retiran aquí; las de killCard ya
            // salieron del tablero en el mismo tick en que murieron.
            gameState.p1.activeBoard = gameState.p1.activeBoard.filter(c => !c.dying);
            gameState.p2.activeBoard = gameState.p2.activeBoard.filter(c => !c.dying);
            gameState.p1.energy += 1;
            gameState.p2.energy += 1;

            // Reset de temp y expiración de HP temporal: solo no-stunned.
            // Reflejo e inmunidad son "este turno" (b5/b7): expiran aquí igual
            // que el ATK temporal, antes de que el nuevo turno resuelva.
            gameState.p1.activeBoard.forEach(c => { if (!c.stunned) { c.tempAtkMod = 0; expireTempHp(c); c.reflectCharges = 0; c.immuneThisTurn = false; } });
            gameState.p2.activeBoard.forEach(c => { if (!c.stunned) { c.tempAtkMod = 0; expireTempHp(c); c.reflectCharges = 0; c.immuneThisTurn = false; } });

            // Inicio de turno SIMULTÁNEO: los choques de Embestida se
            // registran contra el mismo estado del tablero y el daño se
            // aplica después, para que ni el orden de los tableros ni una
            // muerte temprana den ventaja a ningún lado.
            gameState.clashQueue = [];
            // Derrumbe de las Rocas Sagradas (c19): el segundo impacto cae al
            // inicio del turno siguiente sobre el Ser que ocupe la Fila 1.
            (gameState.pendingStrikes || []).splice(0).forEach(s => {
                let t = s.opp.activeBoard[0];
                if (t && !t.dying) {
                    dealDamage(t, 3, sideOf(s.opp));
                    queueFx({ t: 'debuff', side: sideOf(s.opp), uid: t.uid, text: '-3 HP', icon: 'fa-house-crack', overlay: 'hit' });
                }
            });
            gameState.p1.activeBoard.slice().forEach(card => { if(card.startTurn) card.startTurn(card, gameState.p1, gameState.p2); });
            gameState.p2.activeBoard.slice().forEach(card => { if(card.startTurn) card.startTurn(card, gameState.p2, gameState.p1); });
            gameState.clashQueue.forEach(h => {
                dealDamage(h.target, h.amount || 1, h.side || ownerSideOf(h.target));
            });

            // Turno COMPARTIDO: no hay "primero" ni "segundo". Fase 1: ambos
            // eligen y pagan su carta contra el mismo estado; los Seres entran
            // a la vez a la cima. Fase 2: los efectos resuelven, todos contra
            // tableros ya actualizados por los dos — así el debuff de nadie
            // ve un despliegue que el otro aún no hizo. Cada jugador juega
            // sobre una COPIA de su mazo hecha en resetMatch: efectos que
            // roban/mutan cartas (c40) no tocan el mazo guardado del jugador.
            let play1 = beginPlay(gameState.p1, gameState.p1.deck || playerDeck);
            let play2 = beginPlay(gameState.p2, gameState.p2.deck || rivalDeck);
            if (play1) deployPlay(gameState.p1, play1);
            if (play2) deployPlay(gameState.p2, play2);
            if (play1) resolvePlay(gameState.p1, gameState.p2, play1);
            if (play2) resolvePlay(gameState.p2, gameState.p1, play2);

            // Las cartas muriendo o aturdidas este turno ya no suman gloria:
// aturdir = no atacar = no puntuar un tick.
            let boardPoints = (board) => board.reduce((sum, card) => {
                if (card.dying || card.stunned) return sum;
                let atk = (typeof card.atk === 'number') ? card.atk : 0;
                let mod = (typeof card.tempAtkMod === 'number') ? card.tempAtkMod : 0;
                return sum + Math.max(0, atk + mod);
            }, 0);
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

            // Decremento de Exilio AL FINAL del tick: así el render del tick
            // siguiente ya ve el valor correcto (evita que el icono dure un
            // turno más).
            [gameState.p1, gameState.p2].forEach(owner => {
                owner.activeBoard.forEach(c => {
                    if (c.stunned && !c.dying) {
                        c.exilioTurns = (c.exilioTurns || 0) - 1;
                        if (c.exilioTurns <= 0) {
                            c.stunned = false;
                            c.exilioTurns = 0;
                            c.atk = c._exilioSavedAtk || 0;
                            c.hp = c._exilioSavedHp || 0;
                            c._exilioSavedAtk = undefined;
                            c._exilioSavedHp = undefined;
                            queueFx({ t: 'liberado', side: sideOf(owner), uid: c.uid });
                        }
                    }
                });
            });

            updateHUD();
            renderBoards();
            // Los FX se materializan tras el render (el render borra el DOM).
            playQueuedFx();

            // La partida termina por diferencia de 50. Y además por
            // estancamiento: si ambos mazos se agotaron y en los tableros
            // no queda NINGUNA fuente de gloria (sin ATK, sin generadores
            // periódicos y sin impactos del Derrumbe pendientes, que el
            // turno siguiente pueden matar cartas o alimentar al Titán
            // c12), nada puede volver a mover el marcador: termina ahí
            // mismo y gana quien tenga más Puntos de Gloria (showGameOver
            // resuelve victoria, derrota o empate).
            if (Math.abs(gameState.p1.score - gameState.p2.score) >= 50) {
                pauseGame();
                showGameOver();
                return;
            }
            // Fin de partida garantizado: cuando ambos mazos se han jugado
            // completo, el combate se resuelve con la gloria acumulada. Los
            // Seres vivos seguirían sumando turno tras turno y la diferencia
            // de 50 podía no llegar nunca (partidas infinitas).
            if (gameState.p1.deckPointer >= (gameState.p1.deck || playerDeck).length &&
                gameState.p2.deckPointer >= (gameState.p2.deck || rivalDeck).length) {
                pauseGame();
                showGameOver();
                return;
            }
            if (!(gameState.pendingStrikes || []).length &&
                !canStillScore(gameState.p1) && !canStillScore(gameState.p2)) {
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
                inst: { ...nextCard, uid: Math.random().toString(36).slice(2, 9), tempAtkMod: 0, tempHpMod: 0, stunned: false, exilioTurns: 0, reflectCharges: 0, bloqueo: nextCard.bloqueo || 0, enfurecerCounter: 0 },
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
            // Los efectos pueden invocar: los summonCard anidados cuentan
            // para las misiones invoke_with (v1.9.4).
            gameState._inEffect = true;
            try {
                if (play.card.effect) play.card.effect(player, opponent, player.lastPlayed);
            } finally {
                gameState._inEffect = false;
            }

            // Los eventos no entran en tablero: se proyectan como hechizo
            // para que su activación se vea. El descuento del Oráculo
            // también avisa junto al contador de energía.
            if (play.card.kind === 'Evento') {
                // El trigger del Oráculo (c8: "tu siguiente Evento cuesta -1")
                // se consume al jugar ese Evento, sea cual sea su coste final.
                player.pendingEventDiscount = 0;
                queueFx({ t: 'cast', side: sideOf(player), card: play.card });
            }
            if (play.card.kind === 'Ser') {
                // El trigger de Teseo en Creta (teseo_creta: "tu siguiente Ser
                // cuesta -2") se consume al jugar ese Ser.
                player.pendingSerDiscount = 0;
            }
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
            // Contadores de misiones de la partida (v1.9.4).
            gameState.missionCounters = {};
            applyFxSpeed();
            syncControls();
            
            clearInterval(gameState.timer);
            // Avatar y nombre del perfil en el header del combate (v1.7.4).
            let avatarCard = ALL_CARDS.find(c => c.id === playerProfile.avatarId);
            let avatarEl = document.getElementById('p1-avatar');
            if (avatarCard && avatarEl) {
                avatarEl.style.backgroundImage = `url('${avatarCard.art}')`;
            }
            let nameEl = document.getElementById('p1-name');
            if (nameEl) nameEl.innerText = (playerProfile.name || 'Tú').slice(0, 12);
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
            gameState.deathQueue = [];
            gameState.p1 = { score: 0, energy: 0, deckPointer: 0, activeBoard: [], lastPlayed: null, extraPoints: 0, pendingEventDiscount: 0 };
            gameState.p2 = { score: 0, energy: 0, deckPointer: 0, activeBoard: [], lastPlayed: null, extraPoints: 0, pendingEventDiscount: 0 };
            gameState.pendingStrikes = [];
            // Copias de mazo por partida (DESPUÉS de re-crear p1/p2): el robo
            // de Hermes (c40) y cualquier mutación juegan sobre la copia, no
            // sobre el mazo guardado del jugador.
            // Copia PROFUNDA de las cartas (no solo del array): cada partida tiene
            // sus propias instancias. Así los efectos que mutan stats de cartas en
            // el mazo (Pasífae a6: +1 HP a Asterión en mazo) no contaminan las
            // plantillas de ALL_CARDS ni las copias del rival. Las funciones
            // (effect, startTurn, onDeath, damageReact) se copian por referencia:
            // son inmutables y deben compartirse.
            // SISTEMA DE FAMILIAS: el mazo guarda familyId (o ids sueltos); el
            // motor juega la forma marcada de cada familia.
            gameState.p1.deck = playerDeck.map(cardOrId => {
                let cardId = typeof cardOrId === 'string' ? cardOrId : cardOrId.id;
                let family = getFamilyById(cardId);
                if (family) {
                    let selectedForm = getSelectedPhase(family.id);
                    let formCard = ALL_CARDS.find(c => c.id === selectedForm);
                    return formCard ? { ...formCard } : null;
                }
                let card = ALL_CARDS.find(c => c.id === cardId);
                return card ? { ...card } : null;
            }).filter(c => c !== null);
            gameState.p2.deck = rivalDeck.map(c => ({ ...c }));
            document.getElementById('pause-overlay').classList.add('hidden-view');
            updateHUD();
            renderBoards();
        }

        // --- API PARA EL PANEL DEV ---
        // El panel dev (dev.js) lee el estado del combate a través de esta función
        // para no acoplarse a gameState directamente. Solo devuelve datos; no muta.
        function devGetStateSnapshot() {
            let snap = {
                turn: gameState.turn,
                isPlaying: gameState.isPlaying,
                speed: gameState.speed,
                p1: {
                    score: gameState.p1.score,
                    energy: gameState.p1.energy,
                    deckPointer: gameState.p1.deckPointer,
                    deckLength: (gameState.p1.deck || []).length,
                    board: gameState.p1.activeBoard.map(c => ({
                        id: c.id, name: c.name, atk: c.atk, hp: c.hp,
                        stunned: !!c.stunned, dying: !!c.dying,
                        exilioTurns: c.exilioTurns || 0
                    }))
                },
                p2: {
                    score: gameState.p2.score,
                    energy: gameState.p2.energy,
                    deckPointer: gameState.p2.deckPointer,
                    deckLength: (gameState.p2.deck || []).length,
                    board: gameState.p2.activeBoard.map(c => ({
                        id: c.id, name: c.name, atk: c.atk, hp: c.hp,
                        stunned: !!c.stunned, dying: !!c.dying,
                        exilioTurns: c.exilioTurns || 0
                    }))
                },
                chapter: currentChapter ? { id: currentChapter.id, title: currentChapter.title, isEvent: !!currentChapter.isEvent } : null
            };
            return snap;
        }

// --- KEYWORD: SERPIENTES X ---
// Al inicio de cada turno, inflige X de daño al Ser rival de la Fila 1.
// Si no hay rival, no se activa. No consume ATK/HP (las serpientes atacan
// solas). Se llama desde el startTurn de la carta que la tiene.
function serpientes(self, player, opp, X) {
    if (self.dying || self.stunned) return;
    let target = opp.activeBoard[0];
    if (!target || target.dying) return;
    dealDamage(target, X, sideOf(opp));
    queueFx({ t: 'debuff', side: sideOf(opp), uid: target.uid, text: '-' + X + ' HP', icon: 'fa-snake', overlay: 'hit' });
}

// --- KEYWORD: REFLEJO X (REAL) ---
// Inmune al próximo efecto rival DIRIGIDO (que designe a esta carta) y lo
// refleja al rival. Solo efectos hostiles dirigidos: petrificar, debuff de
// ATK/HP, daño dirigido, destrucción directa. NO refleja AoE (no designa a
// nadie concreto) ni buffs/gloria (no son hostiles).
// El llamador pasa un callback applyEffect(reflectedTarget) que aplica el
// efecto al target reflejado. Devuelve true si se reflejó (el efecto original
// NO debe aplicarse al target original).
function tryReflect(card, opponent, applyEffect) {
    if (!card || !(card.reflectCharges > 0)) return false;
    // Si la carta es inmune, el reflejo no se consume (la inmunidad gana).
    if (card.immuneThisTurn) return false;
    card.reflectCharges--;
    let targets = opponent.activeBoard.filter(c => !c.dying);
    if (!targets.length) return true; // refleja pero no hay a quién
    let target = targets[Math.floor(Math.random() * targets.length)];
    if (typeof applyEffect === 'function') applyEffect(target);
    queueFx({ t: 'debuff', side: sideOf(opponent), uid: target.uid, text: 'REFLEJADO', icon: 'fa-shield-halved', overlay: 'hit' });
    return true;
}

// --- KEYWORD: SERPIENTES DE LA CABEZA X ---
// Al morir: invoca X tokens 1/1 vanilla (Serpientes de la Cabeza) en el
// tablero del dueño. Se llama desde killCard si la carta tiene onDeath.
function serpientesDeLaCabeza(owner, X) {
    let tpl = ALL_CARDS.find(c => c.id === 'b0');
    if (!tpl) return;
    for (let i = 0; i < X; i++) summonCard(owner, tpl);
}

// --- KEYWORD: BLOQUEO X ---
// Amortigua hasta X puntos de CUALQUIER reducción de stats que reciba la
// carta: reducción de HP (daño), reducción de ATK. Es un escudo genérico.
// Cuando se agotan las X cargas, se desactiva.
// Devuelve la cantidad NO absorbida.
function bloqueoAbsorb(card, amount) {
    if (!card || !(card.bloqueo > 0)) return amount;
    let absorbed = Math.min(amount, card.bloqueo);
    card.bloqueo -= absorbed;
    if (absorbed > 0) {
        queueFx({ t: 'bloqueo', side: ownerSideOf(card), uid: card.uid, text: 'BLOQUEADO ' + absorbed, icon: 'fa-shield' });
    }
    return amount - absorbed;
}

// --- MECÁNICA: INVOCAR VÁSTAGO ---
// Busca un Vástago aleatorio en ALL_CARDS (subtype === 'Vástago') y lo invoca
// en el tablero del jugador. Si no hay Vástagos disponibles, no hace nada.
// Usado por Equidna (e2) al inicio de cada turno.
function invocarVastago(player) {
    if (!player) { console.error('invocarVastago: player inválido'); return; }
    let vastagos = ALL_CARDS.filter(c => c.subtype === 'Vástago');
    if (!vastagos.length) return;
    let chosen = vastagos[Math.floor(Math.random() * vastagos.length)];
    summonCard(player, chosen);
}

// --- MECÁNICA: DESTRUIR SER DE COSTE ALTO ---
// Destruye un Ser rival con coste >= minCost. Si hay varios, elige el de
// mayor coste. Si no hay ninguno, no hace nada.
// Usado por Heracles (e3) al entrar.
function destruirSerCosteAlto(opponent, minCost) {
    let targets = opponent.activeBoard.filter(c => !c.dying && c.cost >= minCost && !c.noDestroy);
    if (!targets.length) return false;
    let target = targets.reduce((max, c) => c.cost > max.cost ? c : max, targets[0]);
    killCard(target, sideOf(opponent));
    queueFx({ t: 'sacrifice', side: sideOf(opponent), uid: target.uid });
    return true;
}

// --- TRACKING DE MISIONES (v1.9.4) ---
// Suma amount a las misiones de tipo kind cuyo previousCardId es prevCardId.
function trackMission(prevCardId, kind, amount) {
    if (!gameState.missionCounters) gameState.missionCounters = {};
    for (let mid in CARD_MISSIONS) {
        let mission = CARD_MISSIONS[mid];
        if (mission.type === kind && mission.previousCardId === prevCardId) {
            gameState.missionCounters[mid] = (gameState.missionCounters[mid] || 0) + amount;
        }
    }
}

// Fortalecer y Gloria se cuentan por FX (los efectos de carta emiten
// fx 'buff' con '+X ATK' y fx 'gloria' con num/text): el envoltorio
// mantiene fx.js intacto y suma puntos en contadores globales de partida.
let _origQueueFx = queueFx;
queueFx = function(fx) {
    try {
        if (fx && fx.side === 'p1' && (fx.t === 'buff' || fx.t === 'gloria')) {
            let isAtk = fx.text && fx.text.indexOf('ATK') >= 0;
            if (fx.t === 'buff' && !isAtk) return _origQueueFx(fx);
            let pts = fx.num || 0;
            if (!pts && fx.text) { let m = String(fx.text).match(/\d+/); if (m) pts = parseInt(m[0], 10); }
            if (pts > 0) {
                if (!gameState.missionCounters) gameState.missionCounters = {};
                let key = fx.t === 'buff' ? '_fx:fortalecer_with' : '_fx:glory_with';
                gameState.missionCounters[key] = (gameState.missionCounters[key] || 0) + pts;
            }
        }
    } catch (e) { console.error('missionTrackFx:', e); }
    _origQueueFx(fx);
};
