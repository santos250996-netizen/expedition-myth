// --- INTERFAZ ---
// Modal de detalle de carta, HUD, tableros y pantallas de fin de partida.

// --- MODAL DE CARTA: 2 MODOS (COMBATE / LORE) ---
// Por defecto: COMBATE (stats + efecto + keyword, sin lore).
// Al tocar la carta: LORE (se oculta todo, arte expandido, lore debajo).
// Toggle solo tocando la carta. Icono sutil como indicador.
let cardModalMode = 'combat';
// Si la carta mostrada tiene keyword (lo decide renderCardModalContent);
// applyCardModalMode lo consulta para no re-mostrar el bloque en cartas
// sin keyword (c1) al volver a modo combate.
let cardModalHasKeyword = false;

function openCardModal(cardId) {
    let card = ALL_CARDS.find(c => c.id === cardId);
    if (!card) return;
    if (navigator.vibrate) navigator.vibrate(15);

    // FIX: al abrir el detalle en combate se pausaba y al cerrar nunca se reanudaba.
    modalAutoPaused = false;
    if (gameState.isPlaying) { pauseGame(); modalAutoPaused = true; }

    // Guardar la carta activa para el toggle.
    window._modalActiveCard = card;
    cardModalMode = 'combat';

    // Renderizar en modo combate.
    renderCardModalContent(card);
    applyCardModalMode();

    document.getElementById('card-modal').classList.remove('hidden-view');
}

// Renderiza el contenido del modal (arte, coste, nombre, tipo, stats, desc,
// facción, keyword, lore). NO decide qué se ve; eso lo hace applyCardModalMode.
function renderCardModalContent(card) {
    document.getElementById('modal-card-art').style.backgroundImage = `url('${card.art}')`;
    document.getElementById('modal-card-cost').innerText = card.cost;
    document.getElementById('modal-card-name').innerText = card.name;
    document.getElementById('modal-card-desc').innerText = card.desc;
    document.getElementById('modal-card-lore').innerText = card.lore || '';

    let factionEl = document.getElementById('modal-card-faction');
    if (factionEl) factionEl.innerText = card.faction ? card.faction.toUpperCase() : 'NEUTRAL';

    let typeIcon = document.getElementById('modal-card-type-icon');
    let typeText = document.getElementById('modal-card-type');
    let statsBox = document.querySelector('.card-stats-box');
    if (card.kind === 'Ser') {
        typeIcon.className = "fa-solid fa-shield-halved text-[8px] text-blue-400";
        typeText.innerText = "SER";
        typeText.className = "bg-blue-600 text-white text-[8px] px-1 rounded font-bold uppercase";
        document.getElementById('modal-card-atk').innerText = card.atk;
        document.getElementById('modal-card-hp').innerText = card.hp;
        if (statsBox) statsBox.style.display = 'flex';
    } else if (card.kind === 'Token') {
        typeIcon.className = "fa-solid fa-shield-halved text-[8px] text-emerald-400";
        typeText.innerText = "TOKEN";
        typeText.className = "bg-emerald-600 text-white text-[8px] px-1 rounded font-bold uppercase";
        document.getElementById('modal-card-atk').innerText = card.atk;
        document.getElementById('modal-card-hp').innerText = card.hp;
        if (statsBox) statsBox.style.display = 'flex';
    } else {
        typeIcon.className = "fa-solid fa-bolt text-[8px] text-amber-400";
        typeText.innerText = "EVENTO";
        typeText.className = "bg-amber-600 text-white text-[8px] px-1 rounded font-bold uppercase";
        // Los Eventos no tienen stats: se oculta la caja (en modo lore la
        // oculta el CSS con !important, así que no hace falta nada más).
        if (statsBox) statsBox.style.display = 'none';
    }

    // Keyword.
    let keywordBox = document.getElementById('modal-keyword-box');
    let keywordText = document.getElementById('modal-keyword-text');
    let keywordExplanation = '';
    if (card.desc && card.desc.includes('Embestida')) {
        keywordExplanation = "<strong>Embestida X:</strong> Consume X ATK y HP para infligir X de daño al Ser rival de su misma fila.";
    } else if (card.desc && card.desc.includes('Laberinto')) {
        keywordExplanation = "<strong>Laberinto X:</strong> Atrapa a un Ser rival aleatorio X turnos. Mientras esté atrapado, su ATK y HP son 0 y no puede ser afectado por nada.";
    } else if (card.desc && card.desc.includes('Bloqueo')) {
        keywordExplanation = "<strong>Bloqueo X:</strong> Amortigua hasta X puntos de reducción (ATK o HP) sobre tus cartas. Al agotarse, el efecto se desactiva.";
    } else if (card.desc && card.desc.includes('Enfurecer')) {
        keywordExplanation = "<strong>Enfurecer X:</strong> Cada vez que esta carta recibe daño, gana +X ATK permanentemente.";
    } else if (card.desc && card.desc.includes('Petrificar')) {
        keywordExplanation = "<strong>Petrificar X:</strong> Convierte a un Ser rival aleatorio en piedra X turnos. Mientras esté petrificado, no puntúa (no suma su ATK a la Gloria), pero sigue atacando y recibiendo daño con normalidad.";
    } else if (card.desc && card.desc.includes('Reflejo')) {
        keywordExplanation = "<strong>Reflejo X:</strong> Inmune al próximo efecto rival que targetee a esta carta. El efecto se refleja y se aplica a una carta aleatoria del rival.";
    }
    if (keywordExplanation) {
        keywordText.innerHTML = keywordExplanation;
        cardModalHasKeyword = true;
        keywordBox.classList.remove('hidden-view');
    } else {
        cardModalHasKeyword = false;
        keywordBox.classList.add('hidden-view');
    }
}

// Aplica el modo actual al modal (combate o lore): muestra/oculta elementos.
function applyCardModalMode() {
    let isLore = cardModalMode === 'lore';
    let frame = document.querySelector('.card-modal-frame');
    if (frame) frame.classList.toggle('card-modal-lore-mode', isLore);

    // El lore box (debajo del marco) se muestra solo en modo lore Y si la
    // carta tiene lore. Si no hay lore, el bloque se queda oculto aunque
    // estemos en modo lore (evita un bloque vacío).
    let loreBox = document.getElementById('card-modal-lore-box');
    let activeCard = window._modalActiveCard;
    let hasLore = activeCard && activeCard.lore && activeCard.lore.trim() !== '';
    if (loreBox) loreBox.classList.toggle('hidden-view', !isLore || !hasLore);

    // El keyword-box se oculta en modo lore (en combate lo gestiona
    // renderCardModalContent según si la carta tiene keyword).
    let keywordBox = document.getElementById('modal-keyword-box');
    if (keywordBox) keywordBox.classList.toggle('hidden-view', isLore || !cardModalHasKeyword);

    // Icono indicador.
    let hint = document.getElementById('modal-card-mode-hint');
    if (hint) {
        hint.innerHTML = isLore
            ? '<i class="fa-solid fa-swords"></i>'
            : '<i class="fa-solid fa-book-open"></i>';
    }
}

// Toggle entre modos al tocar la carta.
function toggleCardModalMode() {
    cardModalMode = cardModalMode === 'combat' ? 'lore' : 'combat';
    applyCardModalMode();
}

function closeCardModal() {
    document.getElementById('card-modal').classList.add('hidden-view');
    cardModalMode = 'combat';
    window._modalActiveCard = null;
    // FIX: reanudar solo si esta modal fue quien pausó el juego.
    if (modalAutoPaused) {
        modalAutoPaused = false;
        if (!document.getElementById('view-game').classList.contains('hidden-view')) {
            startGame();
        }
    }
}

function updateHUD() {
    let turnEl = document.getElementById('turn-counter');
    if (turnEl.innerText !== String(Math.max(1, gameState.turn))) {
        turnEl.innerText = Math.max(1, gameState.turn);
        turnEl.classList.remove('turn-pulse');
        void turnEl.offsetWidth;
        turnEl.classList.add('turn-pulse');
    }

    // La puntuación cuenta hacia su nuevo valor en lugar de saltar:
    // el marcador se lee y se sigue el ritmo de la partida.
    tweenScore(document.getElementById('p1-score'), gameState.p1.score);
    tweenScore(document.getElementById('p2-score'), gameState.p2.score);

    let total = gameState.p1.score + gameState.p2.score;
    let p1Pct = total === 0 ? 50 : Math.min(95, Math.max(5, (gameState.p1.score / total) * 100));
    document.getElementById('p1-bar').style.width = `${p1Pct}%`;
    document.getElementById('p2-bar').style.width = `${100 - p1Pct}%`;

    document.getElementById('p1-energy-badge').innerText = gameState.p1.energy;
    document.getElementById('p2-energy-badge').innerText = gameState.p2.energy;

    // Mazos por partida (copias en resetMatch): la caja SIGUIENTE refleja el
    // robo de Hermes (c40) y cualquier mutación del mazo durante el combate.
    renderNextBox('p1', (gameState.p1.deck || playerDeck)[gameState.p1.deckPointer], gameState.p1);
    renderNextBox('p2', (gameState.p2.deck || rivalDeck)[gameState.p2.deckPointer], gameState.p2);
}

// Cuenta animada del marcador (rAF, easing de salida).
function tweenScore(el, target) {
    let from = +(el.dataset.v || 0);
    if (from === target) { el.innerText = target; return; }
    el.dataset.v = target;
    if (el._twRaf) cancelAnimationFrame(el._twRaf);
    let t0 = performance.now();
    let dur = Math.min(600, Math.max(250, Math.abs(target - from) * 18));
    let step = (now) => {
        let k = Math.min(1, (now - t0) / dur);
        el.innerText = Math.round(from + (target - from) * (1 - Math.pow(1 - k, 3)));
        if (k < 1) el._twRaf = requestAnimationFrame(step);
        else el._twRaf = null;
    };
    el._twRaf = requestAnimationFrame(step);
}

// Panel SIGUIENTE: miniatura del arte de la próxima carta del mazo y
// su coste de energía EFECTIVO (las auras c20/c32 y el trigger del
// Oráculo c8 abaratan los Eventos).
// Imagen pequeña + coste al lado: menos espacio que icono + nombre.
function renderNextBox(prefix, nextCard, player) {
    let box = document.getElementById(prefix + '-next-box');
    if (!box) return;

    if (!nextCard) {
        box.innerHTML = '<span class="text-[9px] text-slate-500 font-bold px-1">Sin cartas</span>';
        return;
    }

    let discount = oracleDiscountFor(player, nextCard);
    let effCost = Math.max(0, nextCard.cost - discount);
    let isP1 = prefix === 'p1';
    let artBorder = discount ? 'border-green-400 shadow-[0_0_8px_rgba(74,222,128,0.7)]' : (isP1 ? 'border-blue-400/60' : 'border-fuchsia-400/60');
    let costBorder = discount ? 'border-green-400 text-green-300' : (isP1 ? 'border-cyan-400 text-cyan-300' : 'border-fuchsia-400 text-fuchsia-300');

    box.innerHTML = `
        <div class="w-12 h-8 rounded overflow-hidden border ${artBorder} bg-slate-800 bg-cover bg-center shrink-0" style="background-image:url('${nextCard.art}')" title="${nextCard.name}"></div>
        <div class="w-5 h-5 rounded-full bg-slate-950 border ${costBorder} flex items-center justify-center font-orbitron font-bold text-[10px] shrink-0">${effCost}</div>
    `;
}

function renderBoards() {
    syncBoard('p1', gameState.p1.activeBoard, 'blue');
    syncBoard('p2', gameState.p2.activeBoard, 'purple');

    // Pintar las cartas en plena animación de muerte: killCard las retiró
    // del tablero en el mismo tick en que murieron, así que aquí solo
    // queda proyectar su copia moribunda (la clase animate-dissolve sobre
    // el envoltorio apaga también su badge de gloria) hasta el próximo
    // tick, cuando la limpieza de deathQueue y syncBoard la retiran.
    if (gameState.deathQueue && gameState.deathQueue.length > 0) {
        gameState.deathQueue.forEach(({ card, side }) => {
            let board = document.getElementById((side === 'p1' ? 'p1' : 'p2') + '-board');
            if (!board) return;
            let el = createCardElement(card, side === 'p1' ? 'blue' : 'purple', false);
            el.classList.add('animate-dissolve');
            el.style.pointerEvents = 'none';
            board.appendChild(el);
        });
    }
}

// Reconciliación por uid: en lugar de reconstruir los tableros cada tick
// (lo que repintaba imágenes y mataba cualquier transición) se reutilizan
// los nodos existentes, se actualizan en el sitio y solo entran/salen
// las cartas que de verdad entran o salen.
function syncBoard(prefix, cards, theme) {
    let board = document.getElementById(prefix + '-board');
    let stale = new Map();
    Array.from(board.children).forEach(el => stale.set(el.dataset.boardUid, el));

    cards.forEach((card, idx) => {
        let el = stale.get(card.uid);
        if (el) {
            stale.delete(card.uid);
            updateCardElement(el, card);
        } else {
            el = createCardElement(card, theme, gameState.justDeployed.includes(card.uid));
            // Las cartas recién desplegadas también llevan sus estados
            // persistentes (reflejo, buff/debuff, inmune, bloqueo, petrificado)
            // desde el primer render, no solo a partir del siguiente tick.
            updateCardElement(el, card);
        }
        // El orden del estado es la verdad: las nuevas cartas entran por la cima.
        let ref = board.children[idx] || null;
        if (ref !== el) board.insertBefore(el, ref);
    });
    // Retiradas este tick (se vieron disolverse el turno anterior).
    stale.forEach(el => el.remove());
}

function createCardElement(card, theme, animate) {
    // Envoltorio necesario: el badge de gloria vive FUERA del marco de la
    // carta (que recorta su contenido con overflow-hidden). El envoltorio
    // lleva data-board-uid para la reconciliación del tablero; data-uid
    // queda en la carta como ancla exclusiva de los FX.
    let wrap = document.createElement('div');
    wrap.className = 'relative w-full max-w-[160px]';
    wrap.dataset.boardUid = card.uid || '';

    let cardDiv = document.createElement('div');
    let isBlue = theme === 'blue';
    let borderColor = isBlue ? 'border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'border-fuchsia-400 shadow-[0_0_10px_rgba(217,70,239,0.5)]';

    // oracle-aura: los auras de descuento (Profecía c20, Guardián de
    // Delfos c32) respiran mientras estén en tablero. animate-dissolve:
    // cartas muriendo este tick.
    cardDiv.className = `w-full h-[60px] border-2 ${borderColor} rounded-lg relative overflow-hidden flex flex-col justify-between ${animate ? 'animate-deploy' : ''} ${(card.id === 'c20' || card.id === 'c32') ? 'oracle-aura' : ''} ${card.dying ? 'animate-dissolve' : ''} cursor-pointer hover:scale-105 active:scale-95 transition-transform`;
    cardDiv.dataset.uid = card.uid || '';
    cardDiv.onclick = () => openCardModal(card.id);

    let displayAtk = Math.max(0, card.atk + (card.tempAtkMod || 0));

    cardDiv.innerHTML = `
        <div class="absolute inset-0 bg-cover bg-center" style="background-image: url('${card.art}');"></div>
        <div class="absolute inset-x-0 top-0 h-5 bg-gradient-to-b from-black/75 to-transparent pointer-events-none"></div>
        <div class="absolute top-0.5 left-1 w-full text-[7px] text-white/90 font-bold truncate pointer-events-none px-1 drop-shadow-md">${card.name}</div>
        <div class="absolute bottom-1 right-1 flex gap-1 z-10 pointer-events-none">
            <div class="stat-atk w-5 h-5 rounded-full bg-blue-950/90 border border-cyan-400 flex items-center justify-center text-white font-bold text-[9px] shadow-lg">${displayAtk}</div>
            <div class="stat-hp w-5 h-5 rounded-full bg-red-950/90 border border-red-400 flex items-center justify-center text-white font-bold text-[9px] shadow-lg">${card.hp}</div>
        </div>
    `;
    wrap.appendChild(cardDiv);

    // Indicador permanente de gloria: cada Ser muestra junto a su esquina,
    // fuera del marco, cuánta gloria suma al final del turno (su ATK
    // efectivo). Los Eventos no puntúan por turno → sin badge.
    if (card.kind === 'Ser') {
        let noScore = card.dying || card.stunned || (card.petrifiedTurns > 0);
        let badge = document.createElement('div');
        badge.className = 'glory-badge ' + (isBlue ? 'side-left' : 'side-right') + (noScore ? ' glory-dim' : '');
        badge.innerHTML = `<i class="fa-solid fa-bolt"></i><span class="glory-badge-val">+${noScore ? 0 : displayAtk}</span>`;
        wrap.appendChild(badge);
    }
    return wrap;
}

// Actualiza en el sitio los datos vivos de una carta ya renderizada y
// anima los cambios de ATK/HP (verde sube, rojo baja).
function updateCardElement(el, card) {
    // el es el envoltorio: las clases de estado viven en la carta interior.
    let cardEl = el.querySelector('[data-uid]') || el;
    cardEl.classList.toggle('animate-dissolve', !!card.dying);
    let displayAtk = Math.max(0, card.atk + (card.tempAtkMod || 0));
    let atkEl = el.querySelector('.stat-atk');
    let hpEl = el.querySelector('.stat-hp');
    if (atkEl && +atkEl.innerText !== displayAtk) {
        let rose = displayAtk > +atkEl.innerText;
        atkEl.innerText = displayAtk;
        flashStat(atkEl, rose);
    }
    if (hpEl && +hpEl.innerText !== card.hp) {
        let rose = card.hp > +hpEl.innerText;
        hpEl.innerText = card.hp;
        flashStat(hpEl, rose);
    }
    // El badge de gloria refleja el ATK efectivo y se atenúa si el Ser no
    // puntúa este turno (aturdido o muriendo).
    let noScore = card.dying || card.stunned || (card.petrifiedTurns > 0);
    let badgeVal = el.querySelector('.glory-badge-val');
    let expectedBadge = '+' + (noScore ? 0 : displayAtk);
    if (badgeVal && badgeVal.innerText !== expectedBadge) badgeVal.innerText = expectedBadge;
    let badge = el.querySelector('.glory-badge');
    if (badge) badge.classList.toggle('glory-dim', noScore);

    // Laberinto persistente: el render reconstruye el DOM en cada tick, así
    // que el FX transitorio (fx-lab) se perdería. Se deriva del estado
    // lógico (card.stunned) y se reaplica en cada render.
    if (card.stunned) {
        if (!cardEl.classList.contains('fx-lab')) cardEl.classList.add('fx-lab');
        if (!cardEl.querySelector('.fx-lab-icon')) {
            let icon = document.createElement('div');
            icon.className = 'fx-lab-icon';
            icon.innerHTML = '<i class="fa-solid fa-maze"></i>';
            cardEl.appendChild(icon);
        }
    } else {
        cardEl.classList.remove('fx-lab');
        let icon = cardEl.querySelector('.fx-lab-icon');
        if (icon) icon.remove();
    }

    // Petrificado persistente: solo no puntúa, pero el estado visual (gris +
    // icono de ojo tachado) se reaplica en cada render para que se vea
    // mientras dure.
    if (card.petrifiedTurns > 0) {
        if (!cardEl.classList.contains('fx-petrificado')) cardEl.classList.add('fx-petrificado');
        if (!cardEl.querySelector('.fx-petrified-icon')) {
            let icon = document.createElement('div');
            icon.className = 'fx-petrified-icon';
            icon.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
            cardEl.appendChild(icon);
        }
    } else {
        cardEl.classList.remove('fx-petrificado');
        let icon = cardEl.querySelector('.fx-petrified-icon');
        if (icon) icon.remove();
    }

    // Reflejo persistente: glow azul + icono escudo con contador.
    if (card.reflectCharges > 0) {
        if (!cardEl.classList.contains('fx-reflejo')) cardEl.classList.add('fx-reflejo');
        let icon = cardEl.querySelector('.fx-reflejo-icon');
        if (!icon) {
            icon = document.createElement('div');
            icon.className = 'fx-reflejo-icon';
            cardEl.appendChild(icon);
        }
        icon.innerHTML = '<i class="fa-solid fa-shield-halved"></i> ' + card.reflectCharges;
    } else {
        cardEl.classList.remove('fx-reflejo');
        let icon = cardEl.querySelector('.fx-reflejo-icon');
        if (icon) icon.remove();
    }

    // Buff ATK persistente: glow verde + icono flecha arriba.
    let tempAtk = card.tempAtkMod || 0;
    if (tempAtk > 0) {
        if (!cardEl.classList.contains('fx-buff-atk')) cardEl.classList.add('fx-buff-atk');
        if (!cardEl.querySelector('.fx-buff-atk-icon')) {
            let icon = document.createElement('div');
            icon.className = 'fx-buff-atk-icon';
            icon.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
            cardEl.appendChild(icon);
        }
    } else {
        cardEl.classList.remove('fx-buff-atk');
        let icon = cardEl.querySelector('.fx-buff-atk-icon');
        if (icon) icon.remove();
    }

    // Debuff ATK persistente: glow rojo + icono flecha abajo.
    if (tempAtk < 0) {
        if (!cardEl.classList.contains('fx-debuff-atk')) cardEl.classList.add('fx-debuff-atk');
        if (!cardEl.querySelector('.fx-debuff-atk-icon')) {
            let icon = document.createElement('div');
            icon.className = 'fx-debuff-atk-icon';
            icon.innerHTML = '<i class="fa-solid fa-arrow-down"></i>';
            cardEl.appendChild(icon);
        }
    } else {
        cardEl.classList.remove('fx-debuff-atk');
        let icon = cardEl.querySelector('.fx-debuff-atk-icon');
        if (icon) icon.remove();
    }

    // Inmune persistente: glow blanco + icono fantasma.
    if (card.immuneThisTurn) {
        if (!cardEl.classList.contains('fx-inmune')) cardEl.classList.add('fx-inmune');
        if (!cardEl.querySelector('.fx-inmune-icon')) {
            let icon = document.createElement('div');
            icon.className = 'fx-inmune-icon';
            icon.innerHTML = '<i class="fa-solid fa-ghost"></i>';
            cardEl.appendChild(icon);
        }
    } else {
        cardEl.classList.remove('fx-inmune');
        let icon = cardEl.querySelector('.fx-inmune-icon');
        if (icon) icon.remove();
    }

    // Bloqueo persistente: glow dorado + icono escudo con contador.
    if (card.bloqueo > 0) {
        if (!cardEl.classList.contains('fx-bloqueo')) cardEl.classList.add('fx-bloqueo');
        let icon = cardEl.querySelector('.fx-bloqueo-icon');
        if (!icon) {
            icon = document.createElement('div');
            icon.className = 'fx-bloqueo-icon';
            cardEl.appendChild(icon);
        }
        icon.innerHTML = '<i class="fa-solid fa-shield"></i> ' + card.bloqueo;
    } else {
        cardEl.classList.remove('fx-bloqueo');
        let icon = cardEl.querySelector('.fx-bloqueo-icon');
        if (icon) icon.remove();
    }
}

function flashStat(badge, rose) {
    badge.classList.remove('stat-up', 'stat-down');
    void badge.offsetWidth; // reinicia la animación si ya estaba activa
    badge.classList.add(rose ? 'stat-up' : 'stat-down');
}

function showGameOver() {
    let p1Score = gameState.p1.score;
    let p2Score = gameState.p2.score;
    let title = document.getElementById('gameover-title');

    if (p1Score > p2Score) { title.innerText = "¡VICTORIA!"; title.className = "text-3xl font-orbitron font-black text-amber-400 mb-2 glow-text-blue"; }
    else if (p1Score < p2Score) { title.innerText = "DERROTA"; title.className = "text-3xl font-orbitron font-black text-red-500 mb-2"; }
    else { title.innerText = "EMPATE"; title.className = "text-3xl font-orbitron font-black text-slate-300 mb-2"; }

    document.getElementById('final-p1').innerText = p1Score;
    document.getElementById('final-p2').innerText = p2Score;

    let epilogueBox = document.getElementById('gameover-epilogue');
    let won = p1Score > p2Score;
    let isEvent = currentChapter && currentChapter.isEvent;
    let isTutorial = currentChapter && currentChapter.id === 1;
    let progressDone = false;

    // Avance de la historia / evento
    if (currentChapter) {
        if (isEvent) {
            if (won) { markEventCompleted(currentChapter.id); progressDone = true; }
        } else if (won) {
            markChapterCompleted(currentChapter.id);
            progressDone = true;
        }
    }

    if (progressDone && currentChapter) {
        document.getElementById('gameover-epilogue-text').innerText = currentChapter.epilogue;
        epilogueBox.classList.remove('hidden');
    } else {
        epilogueBox.classList.add('hidden');
    }

    // --- SISTEMA DE RECOMPENSAS ---
    // Ganar Cap 2+ o evento: 33%. Perder Cap 2+ o evento: 15%.
    // Cap 1 (tutorial): sin recompensa. Empate: sin recompensa.
    let rewardChance = won ? 0.33 : (p2Score > p1Score ? 0.15 : 0);
    let canReward = currentChapter && !isTutorial && rewardChance > 0;
    let rewardCardId = null;
    if (canReward && Math.random() < rewardChance) {
        let cardsToGive = currentChapter.botDecks && currentChapter.botDecks[0]
            ? currentChapter.botDecks[0].filter(id => !ownedCardIds.includes(id))
            : (currentChapter.botDeck || []).filter(id => !ownedCardIds.includes(id));
        if (cardsToGive.length > 0) {
            let newCardId = cardsToGive[Math.floor(Math.random() * cardsToGive.length)];
            ownedCardIds.push(newCardId);
            safeStorageSet('nexo_owned_cards', JSON.stringify(ownedCardIds));
            rewardCardId = newCardId;
            let cardData = ALL_CARDS.find(c => c.id === newCardId);
            let rewardText = (won ? '¡Has obtenido una nueva carta: ' : 'A pesar de la derrota, has obtenido: ') + (cardData ? cardData.name : newCardId) + '!';
            if (progressDone) {
                document.getElementById('gameover-epilogue-text').innerText += `\n\n${rewardText}`;
            } else {
                document.getElementById('gameover-epilogue-text').innerText = rewardText;
                epilogueBox.classList.remove('hidden');
            }
        }
    }
    // Carta de recompensa flotante (arte + nombre + tipo + coste + stats).
    renderRewardCard(rewardCardId);

    if (navigator.vibrate) navigator.vibrate(p1Score >= p2Score ? [30, 40, 60] : 50);

    // --- TUTORIAL: AVANZAR AL GANAR O PERDER ---
    if (tutorialActive && currentChapter && currentChapter.id === 1) {
        if (gameState.p1.score > gameState.p2.score) {
            setTimeout(() => setTutorialStep(5), 1000);
        } else {
            setTimeout(() => showTutorialMessage("Has perdido", "Ve al Deckbuilder (Mazos) y prueba a ordenar tus cartas de otra manera."), 1000);
        }
    }

    document.getElementById('gameover-modal').classList.remove('hidden-view');
}

// --- CARTA DE RECOMPENSA EN EL MODAL DE GAMEOVER ---
// Muestra la carta obtenida con arte, nombre, tipo, coste y stats.
// Animación fade+scale. Tocable para abrir el detalle (openCardModal).
function renderRewardCard(cardId) {
    let container = document.getElementById('gameover-reward-card');
    if (!container) return;
    if (!cardId) { container.innerHTML = ''; container.classList.add('hidden-view'); return; }
    let card = ALL_CARDS.find(c => c.id === cardId);
    if (!card) { container.innerHTML = ''; container.classList.add('hidden-view'); return; }

    let typeLabel = card.kind === 'Ser' ? 'SER' : (card.kind === 'Token' ? 'TOKEN' : 'EVENTO');
    let typeColor = card.kind === 'Ser' ? 'bg-blue-600' : (card.kind === 'Token' ? 'bg-emerald-600' : 'bg-amber-600');
    let statsHtml = '';
    if (card.kind === 'Ser' || card.kind === 'Token') {
        statsHtml = `<div class="flex gap-1 mt-1">
            <span class="w-5 h-5 rounded-full bg-blue-950 border border-cyan-400 flex items-center justify-center text-white font-bold text-[9px]">${card.atk}</span>
            <span class="w-5 h-5 rounded-full bg-red-950 border border-red-400 flex items-center justify-center text-white font-bold text-[9px]">${card.hp}</span>
        </div>`;
    }
    container.innerHTML = `
        <div class="flex flex-col items-center gap-2">
            <div class="text-[9px] font-orbitron font-bold tracking-widest text-amber-300">¡NUEVA CARTA OBTENIDA!</div>
            <div class="fx-reward-card relative w-24 h-32 rounded-lg overflow-hidden border-2 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.6)] cursor-pointer active:scale-95 transition-transform"
                 onclick="openCardModal('${card.id}')">
                <div class="reward-new-badge">NUEVA</div>
                <div class="absolute inset-0 bg-cover bg-center" style="background-image:url('${card.art}')"></div>
                <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40"></div>
                <div class="absolute top-1 left-1 w-5 h-5 rounded-full bg-cyan-200 text-cyan-900 text-[10px] font-bold flex items-center justify-center border border-white">${card.cost}</div>
                <div class="absolute top-1 right-1 ${typeColor} text-white text-[7px] px-1 rounded font-bold">${typeLabel}</div>
                <div class="absolute bottom-1 left-1 right-1">
                    <div class="text-white font-orbitron font-bold text-[9px] leading-tight truncate drop-shadow-md">${card.name}</div>
                    <div class="text-amber-300 text-[8px] font-bold uppercase">${card.faction || 'Neutral'}</div>
                    ${statsHtml}
                </div>
            </div>
        </div>
    `;
    container.classList.remove('hidden-view');
    if (navigator.vibrate) navigator.vibrate([30, 40, 60]);
}

function closeGameOverModal() {
    document.getElementById('gameover-modal').classList.add('hidden-view');
    let rc = document.getElementById('gameover-reward-card');
    if (rc) { rc.innerHTML = ''; rc.classList.add('hidden-view'); }
}
function closeGameOverAndRestart() { closeGameOverModal(); resetMatch(); startGame(); }

// --- FONDO GLOBAL POR CAPÍTULO ---
// Regla: el combate muestra siempre el capítulo en juego; el resto de
// pantallas muestran el capítulo más avanzado del jugador (el primero
// sin completar, o el último si todo está completado). Dos capas se
// alternan para lograr un crossfade suave entre artes.
function getProgressChapter() {
    if (!CHAPTERS.length) return null;
    return CHAPTERS.find(c => !isChapterCompleted(c.id)) || CHAPTERS[CHAPTERS.length - 1];
}

let _bgActiveLayer = 'a';
let _bgCurrentUrl = null;

function setGlobalChapterBg(url) {
    if (!url || url === _bgCurrentUrl) return;
    let showLayer = document.getElementById(`chapter-bg-layer-${_bgActiveLayer === 'a' ? 'b' : 'a'}`);
    let hideLayer = document.getElementById(`chapter-bg-layer-${_bgActiveLayer}`);
    showLayer.style.backgroundImage = `url('${url}')`;
    showLayer.classList.add('active');
    hideLayer.classList.remove('active');
    _bgActiveLayer = (_bgActiveLayer === 'a' ? 'b' : 'a');
    _bgCurrentUrl = url;
}

function updateGlobalBackground(viewId) {
    let art;
    if (viewId === 'view-chapter-intro' || viewId === 'view-game') {
        art = currentChapter ? currentChapter.art : (getProgressChapter() || {}).art;
    } else {
        let ch = getProgressChapter();
        art = ch ? ch.art : null;
    }
    if (art) setGlobalChapterBg(art);
}

function updateHomeChapterLabel() {
    let ch = getProgressChapter();
    if (ch) document.getElementById('home-chapter-label').innerText = `Capítulo ${ch.number}: ${ch.title}`;
}

// --- CAPÍTULOS ---
// Selección de capítulos, intro narrativa y lanzamiento del combate
// con el arte y el mazo del bot del capítulo activo.
function openChapters() {
    // Tutorial: abrir la pantalla de capítulos avanza al paso 2.
    if (tutorialActive && tutorialStep === 1) setTutorialStep(2);
    switchView('view-chapters');
}

function openEvents() {
    if (!isChapterCompleted(1)) {
        // Bloqueado: el botón ya se ve gris con candado (CSS). No hacer nada.
        // Si quieres feedback, puedes vibrar ligeramente en móvil.
        if (navigator.vibrate) navigator.vibrate(30);
        return;
    }
    switchView('view-chapters');
    setTimeout(() => {
        let el = document.getElementById('events-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 120);
}

// Actualiza el estado visual del botón de eventos (con o sin candado) según
// si el Cap 1 está completado. Se llama al cambiar de vista y al cargar.
function updateEventsButtonState() {
    let btn = document.getElementById('btn-events');
    if (!btn) return;
    let locked = !isChapterCompleted(1) && !isDevMode();
    btn.classList.toggle('locked', locked);
}

function renderChapterSelect() {
    let container = document.getElementById('chapters-list');
    let eventsContainer = document.getElementById('events-list');
    // A prueba de fallos: si algo rompe (p. ej. un JS viejo en caché)
    // se muestra un aviso visible en lugar de una lista vacía.
    try {
        let frag = document.createDocumentFragment();
        let campaign = CHAPTERS.filter(ch => !ch.isEvent);
        let events = CHAPTERS.filter(ch => ch.isEvent);

        // Los completados se desplazan al fondo: arriba queda siempre
        // el próximo capítulo a jugar (orden estable entre iguales).
        let ordered = [...campaign].sort((a, b) =>
            (isChapterCompleted(a.id) ? 1 : 0) - (isChapterCompleted(b.id) ? 1 : 0)
        );

        ordered.forEach((ch, index) => {
            let done = isChapterCompleted(ch.id);
            // Un capítulo está desbloqueado si es el primero, si el anterior
            // (en la lista ordenada) ya está completado o si él mismo lo está.
            let unlocked = isDevMode() || (index === 0) || isChapterCompleted(ordered[index - 1].id) || done;
            let item = document.createElement('div');
            item.className = "active:scale-[0.98] transition-transform cursor-pointer";
            item.onclick = () => {
                if (unlocked) openChapterIntro(ch.id);
                else alert("Completa el capítulo anterior para desbloquear este.");
            };
            item.innerHTML = `
                <div class="relative rounded-xl overflow-hidden border-2 ${done ? 'border-amber-400/70 shadow-[0_0_15px_rgba(251,191,36,0.25)]' : (unlocked ? 'border-blue-500/70 shadow-[0_0_15px_rgba(59,130,246,0.25)]' : 'border-slate-700 opacity-50')}">
                    <div class="aspect-[16/10] bg-cover bg-center" style="background-image:url('${ch.art}')"></div>
                    <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/45"></div>
                    <div class="absolute top-2 left-3 right-3 flex items-center justify-between">
                        <span class="text-[9px] font-orbitron tracking-[0.25em] text-amber-300 font-bold">CAPÍTULO ${ch.number}</span>
                        ${done
                            ? '<span class="text-[8px] bg-green-600/90 text-white px-1.5 py-0.5 rounded font-bold">✓ COMPLETADO</span>'
                            : (unlocked
                                ? '<span class="text-[8px] bg-blue-600/90 text-white px-1.5 py-0.5 rounded font-bold">DISPONIBLE</span>'
                                : '<span class="text-[8px] bg-slate-600/90 text-white px-1.5 py-0.5 rounded font-bold"><i class="fa-solid fa-lock"></i> BLOQUEADO</span>')}
                    </div>
                    <div class="absolute bottom-2 left-3 right-3">
                        <div class="text-white font-orbitron font-black text-base leading-tight">${ch.title}</div>
                        <div class="text-[10px] text-slate-300 font-bold mt-0.5">
                            <i class="fa-solid fa-user-ninja text-fuchsia-300"></i> Rival: ${ch.rival.name} · ${(ch.botDecks && ch.botDecks[0] ? ch.botDecks[0].length : (ch.botDeck ? ch.botDeck.length : 0))} cartas
                        </div>
                    </div>
                </div>
            `;
            frag.appendChild(item);
        });

        // Hueco para capítulos futuros: la campaña crecerá.
        let locked = document.createElement('div');
        locked.className = "relative rounded-xl border-2 border-dashed border-slate-800 bg-slate-900/60 overflow-hidden aspect-[16/10] flex flex-col items-center justify-center gap-2 opacity-70";
        locked.innerHTML = `
            <i class="fa-solid fa-lock text-2xl text-slate-600"></i>
            <span class="text-slate-400 font-orbitron font-bold text-xs tracking-widest">PRÓXIMAMENTE</span>
            <span class="text-[10px] text-slate-500">Nuevos capítulos, mazos y lore en camino...</span>
        `;
        frag.appendChild(locked);

        container.innerHTML = '';
        container.appendChild(frag);

        // --- EVENTOS ---
        if (eventsContainer) {
            let efrag = document.createDocumentFragment();
            events.forEach(ev => {
                let done = isEventCompleted(ev.id);
                // El desbloqueo mira el registro correcto: si lo referenciado
                // es un evento, su victoria se guarda en nexo_events_v1
                // (markEventCompleted); si es capítulo, en nexo_chapters_v1.
                let src = ev.unlockedBy ? CHAPTERS.find(c => c.id === ev.unlockedBy) : null;
                let unlocked = isDevMode() || !ev.unlockedBy || (src && src.isEvent ? isEventCompleted(ev.unlockedBy) : isChapterCompleted(ev.unlockedBy));
                let item = document.createElement('div');
                item.className = "active:scale-[0.98] transition-transform cursor-pointer";
                item.onclick = () => {
                    if (unlocked) openChapterIntro(ev.id);
                    else alert("Completa el Capítulo " + ev.unlockedBy + " para desbloquear este evento.");
                };
                item.innerHTML = `
                    <div class="relative rounded-xl overflow-hidden border-2 ${done ? 'border-emerald-400/70 shadow-[0_0_15px_rgba(52,211,153,0.25)]' : (unlocked ? 'border-emerald-500/70 shadow-[0_0_15px_rgba(52,211,153,0.25)]' : 'border-slate-700 opacity-50')}">
                        <div class="aspect-[16/10] bg-cover bg-center" style="background-image:url('${ev.art}')"></div>
                        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/45"></div>
                        <div class="absolute top-2 left-3 right-3 flex items-center justify-between">
                            <span class="text-[9px] font-orbitron tracking-[0.25em] text-emerald-300 font-bold">EVENTO ${ev.number}</span>
                            ${done
                                ? '<span class="text-[8px] bg-green-600/90 text-white px-1.5 py-0.5 rounded font-bold">✓ COMPLETADO</span>'
                                : (unlocked
                                    ? '<span class="text-[8px] bg-emerald-600/90 text-white px-1.5 py-0.5 rounded font-bold">DISPONIBLE</span>'
                                    : '<span class="text-[8px] bg-slate-600/90 text-white px-1.5 py-0.5 rounded font-bold"><i class="fa-solid fa-lock"></i> BLOQUEADO</span>')}
                        </div>
                        <div class="absolute bottom-2 left-3 right-3">
                            <div class="text-white font-orbitron font-black text-base leading-tight">${ev.title}</div>
                            <div class="text-[10px] text-slate-300 font-bold mt-0.5">
                                <i class="fa-solid fa-user-ninja text-emerald-300"></i> Rival: ${ev.rival.name} · ${(ev.botDecks && ev.botDecks[0] ? ev.botDecks[0].length : (ev.botDeck ? ev.botDeck.length : 0))} cartas
                            </div>
                        </div>
                    </div>
                `;
                efrag.appendChild(item);
            });
            eventsContainer.innerHTML = '';
            eventsContainer.appendChild(efrag);
        }
    } catch (e) {
        console.error('renderChapterSelect:', e);
        container.innerHTML = '<div class="bg-slate-900 border border-red-500/60 rounded-xl p-4 text-center"><div class="text-red-400 font-orbitron font-bold text-sm">No se pudieron cargar los capítulos</div><p class="text-slate-400 text-xs mt-1">Fuerza la recarga de la página (Ctrl+Shift+R) e inténtalo de nuevo.</p></div>';
    }
}

function openChapterIntro(chapterId) {
    let ch = CHAPTERS.find(c => c.id === chapterId);
    if (!ch) return;
    currentChapter = ch;
    // Tutorial: al abrir la intro del capítulo avanza al paso 3.
    if (tutorialActive && tutorialStep === 2) setTutorialStep(3);

    document.getElementById('intro-chapter-number').innerText = ch.number;
    document.getElementById('intro-chapter-title').innerText = ch.title;
    document.getElementById('intro-chapter-subtitle').innerText = ch.subtitle;

    let beats = document.getElementById('intro-beats');
    beats.innerHTML = ch.beats.map(b => `
        <div class="flex gap-3 bg-slate-900/80 border border-slate-700 rounded-xl p-3">
            <div class="w-8 h-8 rounded-full bg-blue-950/80 border border-amber-400/60 flex items-center justify-center text-amber-300 shrink-0">
                <i class="fa-solid ${b.icon} text-xs"></i>
            </div>
            <div>
                <div class="text-amber-300 font-orbitron font-bold text-xs">${b.title}</div>
                <p class="text-slate-300 text-[11px] leading-snug mt-0.5">${b.text}</p>
            </div>
        </div>
    `).join('');

    // El lore se muestra primero: las acciones aparecen tras el primer tap.
    document.getElementById('view-chapter-intro').classList.remove('lore-revealed');

    switchView('view-chapter-intro');
}

// Acciones del capítulo tras el primer tap (regla permanente, no solo del
// tutorial): los botones se muestran y el lore se desenfoca para no estorbar.
function revealChapterActions() {
    let view = document.getElementById('view-chapter-intro');
    if (view && !view.classList.contains('lore-revealed')) view.classList.add('lore-revealed');
}

function launchChapterCombat() {
    if (!currentChapter) { openChapters(); return; }
    if (playerDeck.length === 0) { alert("¡Tu mazo está vacío!"); return; }
    if (navigator.vibrate) navigator.vibrate([20, 30, 40]);

    rivalDeck = getChapterBotDeck();
    document.getElementById('rival-name').innerText = currentChapter.rival.name;
    document.getElementById('rival-sub').innerHTML = `${currentChapter.rival.sub} <i class="fa-solid fa-eye"></i>`;

    // El fondo de combate lo fija updateGlobalBackground() con el
    // capítulo en juego al entrar en view-game.
    closeGameOverModal();
    startGame();
    // Tutorial: el paso 4 se activa DESPUÉS de arrancar el combate, para que
    // el toast didáctico encuentre el juego en marcha y pueda pausarlo.
    if (tutorialActive && tutorialStep === 3) setTutorialStep(4);
}

// --- SISTEMA DE TUTORIAL ---
let tutorialActive = false;
let tutorialStep = 0;
let tutorialTimeout = null;
let tutorialSerShown = false;
let tutorialEventShown = false;

// Token de invalidez: cada show/hide lo incrementa. Un hide retardado solo
// se completa si su token sigue vigente; así, un toast que se vuelve a
// mostrar 400 ms después de ocultarse (p. ej. el siguiente mensaje didáctico
// del mismo tick en que se reanuda) no es enterrado por el timer anterior.
let tutorialToastToken = 0;

function hideTutorialToast() {
    let toast = document.getElementById('tutorial-toast');
    if (!toast) return;
    let token = ++tutorialToastToken;
    toast.classList.remove('active', 'wait-tap');
    setTimeout(() => {
        if (token === tutorialToastToken) toast.classList.add('hidden-view');
    }, 400);
}

function showTutorialMessage(title, text) {
    let toast = document.getElementById('tutorial-toast');
    let toastTitle = document.getElementById('tutorial-toast-title');
    let toastText = document.getElementById('tutorial-toast-text');
    if (!toast || !toastTitle || !toastText) return;
    tutorialToastToken++; // anula cualquier hide pendiente de un toast anterior
    toastTitle.innerText = title;
    toastText.innerText = text;
    clearTimeout(tutorialTimeout);
    toast.classList.remove('hidden-view', 'wait-tap');
    setTimeout(() => {
        if (toast.classList.contains('hidden-view')) return;
        toast.classList.add('active');
    }, 10);

    // Regla permanente del modo guiado: en combate, cada intervención del
    // tutorial PAUSA la partida y espera un tap del jugador para continuar.
    let inCombat = !document.getElementById('view-game').classList.contains('hidden-view');
    if (inCombat) {
        if (gameState.isPlaying) pauseGame();
        toast.classList.add('wait-tap');
        toast.onclick = () => {
            hideTutorialToast();
            // Con el modal de fin de partida visible no hay nada que
            // reanudar; si el jugador ya reanudó por su cuenta, tampoco.
            let over = !document.getElementById('gameover-modal').classList.contains('hidden-view');
            if (!over && !gameState.isPlaying) startGame();
        };
        return;
    }

    toast.onclick = hideTutorialToast;
    tutorialTimeout = setTimeout(hideTutorialToast, 6000);
}

function setTutorialStep(step) {
    tutorialStep = step;
    document.querySelectorAll('.tutorial-glow').forEach(el => el.classList.remove('tutorial-glow'));
    document.querySelectorAll('.tutorial-blocked').forEach(el => el.classList.remove('tutorial-blocked'));

    let btnCampaign = document.getElementById('btn-campaign');
    let btnDecks = document.getElementById('btn-decks');
    let btnEvents = document.getElementById('btn-events');
    let btnPvp = document.getElementById('btn-pvp');
    let btnComingSoon = document.getElementById('btn-coming-soon');

    // Bloquear siempre los futuros
    if (btnEvents) btnEvents.classList.add('tutorial-blocked');
    if (btnPvp) btnPvp.classList.add('tutorial-blocked');
    if (btnComingSoon) btnComingSoon.classList.add('tutorial-blocked');

    if (step === 1) {
        if (btnDecks) btnDecks.classList.add('tutorial-blocked');
        if (btnCampaign) btnCampaign.classList.add('tutorial-glow');
        showTutorialMessage("¡Bienvenido a Ecos del Olimpo!", "Toca 'Campaña' en la barra inferior para empezar el tutorial.");
    } else if (step === 2) {
        if (btnDecks) btnDecks.classList.add('tutorial-blocked');
        if (btnCampaign) btnCampaign.classList.add('tutorial-blocked');
        showTutorialMessage("Capítulo 1.0: El Despertar en la Hélade", "Este es el tutorial. Tócalo para empezar.");
    } else if (step === 3) {
        if (btnDecks) btnDecks.classList.add('tutorial-blocked');
        if (btnCampaign) btnCampaign.classList.add('tutorial-blocked');
        let btnContinue = document.querySelector('#view-chapter-intro button');
        if (btnContinue) btnContinue.classList.add('tutorial-glow');
        showTutorialMessage("Lee la historia", "Tómate tu tiempo. Toca la pantalla para mostrar las acciones y luego toca 'Comenzar combate'.");
    } else if (step === 4) {
        if (btnDecks) btnDecks.classList.add('tutorial-blocked');
        if (btnCampaign) btnCampaign.classList.add('tutorial-blocked');
    } else if (step === 5) {
        if (btnDecks) btnDecks.classList.add('tutorial-glow');
        if (btnCampaign) btnCampaign.classList.add('tutorial-blocked');
        showTutorialMessage("¡Deckbuilder desbloqueado!", "Toca 'Mazos' para ver tus cartas y armar tu mazo.");
    } else if (step === 6) {
        tutorialActive = false;
        safeStorageSet('nexo_tutorial_v1', 'true');
        showTutorialMessage("¡Tutorial completado!", "Ya puedes jugar la campaña y obtener nuevas cartas. ¡El Olimpo te espera!");
    }
}

function startTutorial() {
    tutorialActive = true;
    tutorialSerShown = false;
    tutorialEventShown = false;
    setTutorialStep(1);
}

// --- LÓGICA DE PERFIL ---

function renderProfile() {
    // Avatar actual
    let avatarDisplay = document.getElementById('profile-avatar-display');
    let avatarCard = ALL_CARDS.find(c => c.id === playerProfile.avatarId);
    if (avatarCard && avatarDisplay) {
        avatarDisplay.style.backgroundImage = `url('${avatarCard.art}')`;
    }

    // Nombre
    let nameInput = document.getElementById('profile-name-input');
    if (nameInput) nameInput.value = playerProfile.name;

    // Galería de avatares
    let gallery = document.getElementById('profile-avatar-gallery');
    if (!gallery) return;
    gallery.innerHTML = '';

    // Solo se muestran los avatares de las cartas que el jugador posee.
    // Sin inventario (no debería pasar) se ofrece el Mortal como base;
    // Set: el inventario no guarda duplicados de avatar.
    let unlockedIds = [...new Set(ownedCardIds.length > 0 ? ownedCardIds : ['c1'])];
    unlockedIds.forEach(id => {
        let card = ALL_CARDS.find(c => c.id === id);
        if (!card) return;
        let el = document.createElement('div');
        el.className = `avatar-option ${playerProfile.avatarId === id ? 'selected' : ''}`;
        el.style.backgroundImage = `url('${card.art}')`;
        el.onclick = () => {
            playerProfile.avatarId = id;
            saveProfile();
            renderProfile();
        };
        gallery.appendChild(el);
    });
}

function saveProfileName() {
    let nameInput = document.getElementById('profile-name-input');
    if (nameInput && nameInput.value.trim() !== '') {
        playerProfile.name = nameInput.value.trim();
        saveProfile();
        showTutorialMessage("Perfil guardado", "Tu nombre ha sido actualizado.");
    }
}

function openAvatarGallery() {
    // Simplemente hace scroll a la galería o muestra un mensaje
    let gallery = document.getElementById('profile-avatar-gallery');
    if (gallery) gallery.scrollIntoView({ behavior: 'smooth' });
}

// --- LÓGICA DE OPCIONES ---

function setMusicVolume(value) {
    // Guardar en localStorage
    safeStorageSet('nexo_music_vol', value);
    // Aquí podrías ajustar el volumen de un objeto Audio si tienes música
}

function setSfxVolume(value) {
    safeStorageSet('nexo_sfx_vol', value);
}

function showCredits() {
    alert("Ecos del Olimpo\n\nUn juego de cartas mitológico.\nCreado por [Tu Nombre].\n\n¡Gracias por jugar!");
}

function confirmResetProgress() {
    if (confirm("¿Estás seguro de que quieres reiniciar todo tu progreso? Perderás todas las cartas, mazos y capítulos completados.")) {
        safeStorageSet('nexo_owned_cards', '[]');
        safeStorageSet('nexo_tutorial_v1', 'false');
        safeStorageSet('nexo_chapters_v1', '[]');
        safeStorageSet('nexo_events_v1', '[]');
        safeStorageSet('nexo_profile_v1', 'null');
        // El mazo guardado también se borra: al recargar se reconstruye el
        // starter con las cartas del Capítulo 1.0 (el aviso promete perder
        // "mazos" también, no solo cartas).
        safeStorageSet('nexo_deck_v1', '');
        // Notas del parche: al reiniciar, el banner vuelve a aparecer.
        safeStorageSet('nexo_last_seen_version', '');
        location.reload(); // Recargar la app para reiniciar todo
    }
}

// --- NOTAS DEL PARCHE (UI) ---
// Modal con historial versionado. La versión más reciente se abre por defecto;
// las anteriores son colapsables. En modo dev se muestra también la sección
// [DEV]. Al abrir, se marca la versión como vista (banner y badge se apagan).

function openPatchNotes() {
    let modal = document.getElementById('patch-notes-modal');
    if (!modal) return;
    renderPatchNotes();
    modal.classList.remove('hidden-view');
    // Marcar la versión más reciente como vista.
    let latest = (typeof getLatestVersion === 'function') ? getLatestVersion() : null;
    if (latest) setLastSeenVersion(latest);
    updatePatchNotesBadge();
}

function closePatchNotes() {
    let modal = document.getElementById('patch-notes-modal');
    if (modal) modal.classList.add('hidden-view');
}

function renderPatchNotes() {
    let container = document.getElementById('patch-notes-list');
    if (!container) return;
    let notes = (typeof getVisiblePatchNotes === 'function') ? getVisiblePatchNotes() : [];
    if (!notes.length) {
        container.innerHTML = '<p class="text-slate-500 text-xs text-center">No hay notas disponibles.</p>';
        return;
    }
    let html = '';
    notes.forEach((note, idx) => {
        let isLatest = idx === 0;
        let devTag = note.dev ? '<span class="bg-red-600 text-white text-[8px] px-1.5 py-0.5 rounded font-bold ml-2">DEV</span>' : '';
        let changesHtml = '';
        if (note.changes) {
            if (note.changes.new && note.changes.new.length) {
                changesHtml += `<div class="mb-2"><div class="text-emerald-400 font-bold text-[10px] mb-1"><i class="fa-solid fa-plus-circle"></i> NUEVO</div><ul class="text-slate-300 text-[10px] space-y-0.5 ml-3">${note.changes.new.map(x => `<li>• ${x}</li>`).join('')}</ul></div>`;
            }
            if (note.changes.buffs && note.changes.buffs.length) {
                changesHtml += `<div class="mb-2"><div class="text-blue-400 font-bold text-[10px] mb-1"><i class="fa-solid fa-arrow-up"></i> BUFFS</div><ul class="text-slate-300 text-[10px] space-y-0.5 ml-3">${note.changes.buffs.map(x => `<li>• ${x}</li>`).join('')}</ul></div>`;
            }
            if (note.changes.nerfs && note.changes.nerfs.length) {
                changesHtml += `<div class="mb-2"><div class="text-orange-400 font-bold text-[10px] mb-1"><i class="fa-solid fa-arrow-down"></i> NERFS</div><ul class="text-slate-300 text-[10px] space-y-0.5 ml-3">${note.changes.nerfs.map(x => `<li>• ${x}</li>`).join('')}</ul></div>`;
            }
            if (note.changes.fixes && note.changes.fixes.length) {
                changesHtml += `<div class="mb-2"><div class="text-purple-400 font-bold text-[10px] mb-1"><i class="fa-solid fa-wrench"></i> FIXES</div><ul class="text-slate-300 text-[10px] space-y-0.5 ml-3">${note.changes.fixes.map(x => `<li>• ${x}</li>`).join('')}</ul></div>`;
            }
            if (note.changes.removed && note.changes.removed.length) {
                changesHtml += `<div class="mb-2"><div class="text-red-400 font-bold text-[10px] mb-1"><i class="fa-solid fa-trash"></i> ELIMINADO</div><ul class="text-slate-300 text-[10px] space-y-0.5 ml-3">${note.changes.removed.map(x => `<li>• ${x}</li>`).join('')}</ul></div>`;
            }
        }
        let highlightsHtml = '';
        if (note.highlights && note.highlights.length) {
            highlightsHtml = `<div class="mb-2 bg-slate-800/60 rounded p-2"><div class="text-amber-300 font-bold text-[10px] mb-1"><i class="fa-solid fa-star"></i> DESTACADO</div><ul class="text-amber-100/80 text-[10px] space-y-0.5 ml-3">${note.highlights.map(x => `<li>• ${x}</li>`).join('')}</ul></div>`;
        }
        let bodyId = 'patch-body-' + idx;
        let arrow = isLatest ? '▼' : '▶';
        html += `
            <div class="bg-slate-900 border border-slate-700 rounded-lg mb-2 overflow-hidden">
                <button onclick="togglePatchBody(${idx})" class="w-full flex items-center justify-between px-3 py-2 active:bg-slate-800">
                    <div class="text-left">
                        <div class="text-white font-orbitron font-bold text-xs">v${note.version}${devTag} — ${note.title}</div>
                        <div class="text-slate-500 text-[9px]">${note.date}</div>
                    </div>
                    <span id="patch-arrow-${idx}" class="text-slate-400 text-[10px]">${arrow}</span>
                </button>
                <div id="${bodyId}" class="px-3 pb-3 ${isLatest ? '' : 'hidden'}">
                    ${highlightsHtml}
                    ${changesHtml}
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function togglePatchBody(idx) {
    let body = document.getElementById('patch-body-' + idx);
    let arrow = document.getElementById('patch-arrow-' + idx);
    if (!body) return;
    let hidden = body.classList.toggle('hidden');
    if (arrow) arrow.innerText = hidden ? '▶' : '▼';
}

// Actualiza el badge del botón de Opciones y el banner de la home según si
// el jugador ya vio la versión más reciente.
function updatePatchNotesBadge() {
    let latest = (typeof getLatestVersion === 'function') ? getLatestVersion() : null;
    let seen = getLastSeenVersion();
    let hasNew = latest && latest !== seen;

    let badge = document.getElementById('settings-new-badge');
    if (badge) badge.classList.toggle('hidden', !hasNew);

    let patchBtnBadge = document.getElementById('settings-patch-badge');
    if (patchBtnBadge) patchBtnBadge.classList.toggle('hidden', !hasNew);

    let banner = document.getElementById('home-patch-banner');
    if (banner) {
        if (hasNew) {
            let label = document.getElementById('home-patch-banner-label');
            if (label) label.innerText = 'v' + latest + ' disponible';
            banner.classList.remove('hidden');
        } else {
            banner.classList.add('hidden');
        }
    }
}

// Llamada al arrancar: actualiza badge y banner. En modo dev, no muestra el
// banner (para no molestar en testeo), pero el botón de Opciones sigue activo.
function checkNewVersion() {
    if (typeof isDevMode === 'function' && isDevMode()) {
        let banner = document.getElementById('home-patch-banner');
        if (banner) banner.classList.add('hidden');
        let badge = document.getElementById('settings-new-badge');
        if (badge) badge.classList.add('hidden');
        return;
    }
    updatePatchNotesBadge();
}

// Abre el deckbuilder desde el modal de gameover.
function openDeckbuilderFromGameover() {
    closeGameOverModal();
    switchView('view-deckbuilder');
    setTimeout(() => { renderDeckEditor(); renderCollection(); }, 50);
}
