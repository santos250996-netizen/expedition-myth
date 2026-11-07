// --- INTERFAZ ---
// Modal de detalle de carta, HUD, tableros y pantallas de fin de partida.

// --- MODAL DE CARTA ---
function openCardModal(cardId) {
    let card = ALL_CARDS.find(c => c.id === cardId);
    if(!card) return;

    // FIX: al abrir el detalle en combate se pausaba y al cerrar nunca se reanudaba.
    modalAutoPaused = false;
    if (gameState.isPlaying) { pauseGame(); modalAutoPaused = true; }

    document.getElementById('modal-card-art').style.backgroundImage = `url('${card.art}')`;
    document.getElementById('modal-card-cost').innerText = card.cost;
    document.getElementById('modal-card-name').innerText = card.name;
    document.getElementById('modal-card-desc').innerText = card.desc;
    document.getElementById('modal-card-lore').innerText = card.lore;

    // Facción
    let factionEl = document.getElementById('modal-card-faction');
    if (factionEl) {
        factionEl.innerText = card.faction ? card.faction.toUpperCase() : 'NEUTRAL';
    }

    // Tipo (SER / EVENTO)
    let typeIcon = document.getElementById('modal-card-type-icon');
    let typeText = document.getElementById('modal-card-type');
    
    if (card.kind === 'Ser') {
        typeIcon.className = "fa-solid fa-shield-halved text-[8px] text-blue-400";
        typeText.innerText = "SER";
        typeText.className = "bg-blue-600 text-white text-[8px] px-1 rounded font-bold uppercase";
        document.getElementById('modal-card-atk').innerText = card.atk;
        document.getElementById('modal-card-hp').innerText = card.hp;
        document.getElementById('modal-card-atk').style.display = 'flex';
        document.getElementById('modal-card-hp').style.display = 'flex';
    } else {
        typeIcon.className = "fa-solid fa-bolt text-[8px] text-amber-400";
        typeText.innerText = "EVENTO";
        typeText.className = "bg-amber-600 text-white text-[8px] px-1 rounded font-bold uppercase";
        document.getElementById('modal-card-atk').style.display = 'none';
        document.getElementById('modal-card-hp').style.display = 'none';
    }

    // Explicación de la keyword
    let keywordBox = document.getElementById('modal-keyword-box');
    let keywordText = document.getElementById('modal-keyword-text');
    let keywordExplanation = '';

    if (card.desc.includes('Embestida')) {
        keywordExplanation = "<strong>Embestida X:</strong> Consume X ATK y HP para infligir X de daño al Ser rival de su misma fila.";
    } else if (card.desc.includes('Laberinto')) {
        keywordExplanation = "<strong>Laberinto X:</strong> Atrapa a un Ser rival aleatorio X turnos. Mientras esté atrapado, su ATK y HP son 0 y no puede ser afectado por nada.";
    } else if (card.desc.includes('Bloqueo')) {
        keywordExplanation = "<strong>Bloqueo X:</strong> Amortigua hasta X puntos de reducción (ATK o HP) sobre tus cartas. Al agotarse, el efecto se desactiva.";
    } else if (card.desc.includes('Enfurecer')) {
        keywordExplanation = "<strong>Enfurecer X:</strong> Cada vez que esta carta recibe daño, gana +X ATK permanentemente.";
    }

    if (keywordExplanation) {
        keywordText.innerHTML = keywordExplanation;
        keywordBox.classList.remove('hidden');
    } else {
        keywordBox.classList.add('hidden');
    }

    document.getElementById('card-modal').classList.remove('hidden-view');
}

function closeCardModal() {
    document.getElementById('card-modal').classList.add('hidden-view');
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
        let badge = document.createElement('div');
        badge.className = 'glory-badge ' + (isBlue ? 'side-left' : 'side-right') + (card.dying ? ' glory-dim' : '');
        badge.innerHTML = `<i class="fa-solid fa-bolt"></i><span class="glory-badge-val">+${displayAtk}</span>`;
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
    let badgeVal = el.querySelector('.glory-badge-val');
    if (badgeVal && badgeVal.innerText !== '+' + displayAtk) badgeVal.innerText = '+' + displayAtk;
    let badge = el.querySelector('.glory-badge');
    if (badge) badge.classList.toggle('glory-dim', !!card.stunned || !!card.dying);
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

    // Avance de la historia: al vencer en un capítulo se marca como
    // completado y se muestra su epílogo en el modal.
    let epilogueBox = document.getElementById('gameover-epilogue');
    if (p1Score > p2Score && currentChapter) {
        markChapterCompleted(currentChapter.id);
        document.getElementById('gameover-epilogue-text').innerText = currentChapter.epilogue;
        epilogueBox.classList.remove('hidden');
    } else {
        epilogueBox.classList.add('hidden');
    }

    // --- SISTEMA DE RECOMPENSAS ---
    // Al ganar en un capítulo que no sea el tutorial (1.0) hay un 33% de
    // probabilidades de llevarse una carta del mazo del rival que falte en
    // la colección. Va DESPUÉS del epílogo: si se ejecutara antes, el
    // innerText del epílogo machacaría el mensaje de recompensa.
    if (p1Score > p2Score && currentChapter && currentChapter.id !== 1 && Math.random() < 0.33) {
        let cardsToGive = currentChapter.botDeck.filter(id => !ownedCardIds.includes(id));
        if (cardsToGive.length > 0) {
            let newCardId = cardsToGive[Math.floor(Math.random() * cardsToGive.length)];
            ownedCardIds.push(newCardId);
            safeStorageSet('nexo_owned_cards', JSON.stringify(ownedCardIds));

            let cardData = ALL_CARDS.find(c => c.id === newCardId);
            document.getElementById('gameover-epilogue-text').innerText += `\n\n¡Has obtenido una nueva carta: ${cardData.name}!`;
            epilogueBox.classList.remove('hidden');
        }
    }

    // Aviso háptico suave al cerrar la partida (móvil).
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

function closeGameOverModal() { document.getElementById('gameover-modal').classList.add('hidden-view'); }
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

function renderChapterSelect() {
    let container = document.getElementById('chapters-list');
    // A prueba de fallos: si algo rompe (p. ej. un JS viejo en caché)
    // se muestra un aviso visible en lugar de una lista vacía.
    try {
        let frag = document.createDocumentFragment();

        // Los completados se desplazan al fondo: arriba queda siempre
        // el próximo capítulo a jugar (orden estable entre iguales).
        let ordered = [...CHAPTERS].sort((a, b) =>
            (isChapterCompleted(a.id) ? 1 : 0) - (isChapterCompleted(b.id) ? 1 : 0)
        );

        ordered.forEach((ch, index) => {
            let done = isChapterCompleted(ch.id);
            // Un capítulo está desbloqueado si es el primero, si el anterior
            // (en la lista ordenada) ya está completado o si él mismo lo está.
            let unlocked = (index === 0) || isChapterCompleted(ordered[index - 1].id) || done;
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
                            <i class="fa-solid fa-user-ninja text-fuchsia-300"></i> Rival: ${ch.rival.name} · ${ch.botDeck.length} cartas
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
        safeStorageSet('nexo_profile_v1', 'null');
        // El mazo guardado también se borra: al recargar se reconstruye el
        // starter con las cartas del Capítulo 1.0 (el aviso promete perder
        // "mazos" también, no solo cartas).
        safeStorageSet('nexo_deck_v1', '');
        location.reload(); // Recargar la app para reiniciar todo
    }
}
