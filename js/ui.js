// --- INTERFAZ ---
// Modal de detalle de carta, HUD, tableros y pantallas de fin de partida.

// --- MODAL DE CARTA: 2 MODOS (COMBATE / LORE) ---
// Por defecto: COMBATE (stats + efecto + keyword, sin lore).
// Al tocar la carta: LORE (se oculta todo, arte expandido, lore debajo).
// Toggle solo tocando la carta. Icono sutil como indicador.
let cardModalMode = 'combat';

// LEYENDAS: explicaciones por trigger/keyword. El panel del modal lista
// SOLO las que la desc de la carta usa (ambar = triggers, cyan = keywords).
const LEYENDAS = {
    // Triggers
    'Al entrar': 'Al entrar al tablero, se dispara el efecto.',
    'Inicio de turno': 'Al comenzar cada turno, si se cumple la condicion de la carta, se dispara el efecto.',
    'Al morir': 'Cuando esta carta muere, se dispara el efecto.',
    'Embestida': 'Consume X ATK y X HP de esta carta para disparar el efecto que le siga.',
    'Enfurecer': 'Acumula daño recibido. Al llegar a X, dispara el efecto que le siga y resetea el contador.',
    'Sacrificio': 'Resta X HP en total de tus Seres (de mas HP a menos) para disparar el efecto que le siga. Si no hay X HP disponibles, no se dispara.',
    // Keywords
    'Daño': 'Inflige X de daño a un objetivo.',
    'Debilitar': 'Reduce X ATK de un objetivo.',
    'Fortalecer': 'Aumenta X ATK de un objetivo.',
    'Blindar': 'Aumenta X HP de un objetivo.',
    'Gloria': 'Otorga X Puntos de Gloria.',
    'Destruir': 'Destruye instantaneamente a un objetivo.',
    'Exilio': 'Exilia a un Ser rival X turnos. Mientras este exiliado: ATK y HP a 0, no ataca, no puntua, no recibe daño ni efectos, no es target de nada.',
    'Invocar': 'Invoca X copias de una carta en tu tablero.',
    'Inmune': 'Inmune a efectos rivales X turnos.',
    'Descuento': 'Reduce en X el coste de tu proxima carta.',
    'Bloqueo': 'Amortigua hasta X puntos de reduccion de ATK o HP sobre esta carta. Al agotarse, el efecto se desactiva.',
    'Reflejo': 'Inmune al proximo efecto rival que targetee a esta carta. El efecto se refleja y se aplica a una carta aleatoria del rival.'
};

// Vista activa dentro de la pantalla de capítulos: campaña o eventos.
let currentChapterView = 'campaign';

function openCardModal(cardIdOrFamilyId) {
    // SISTEMA DE FAMILIAS: acepta familyId ('asterion') o id de carta suelta.
    let family = getFamilyById(cardIdOrFamilyId);
    let card = null;
    if (family) {
        let selectedForm = getSelectedPhase(family.id);
        card = ALL_CARDS.find(c => c.id === selectedForm);
    } else {
        card = ALL_CARDS.find(c => c.id === cardIdOrFamilyId);
    }
    if (!card) return;
    if (navigator.vibrate) navigator.vibrate(15);
    markedPhaseId = null;

    // FIX: al abrir el detalle en combate se pausaba y al cerrar nunca se reanudaba.
    modalAutoPaused = false;
    if (gameState.isPlaying) { pauseGame(); modalAutoPaused = true; }

    // Guardar la carta activa y su familia para el toggle y el selector.
    window._modalActiveCard = card;
    window._modalActiveFamilyId = family ? family.id : null;
    cardModalMode = 'combat';

    // Renderizar en modo combate.
    renderCardModalContent(card);
    applyCardModalMode();

    document.getElementById('card-modal').classList.remove('hidden-view');
    // Inicializar el gesto de deslizar (solo si es familia).
    if (family) initCardModalSwipe();
}

// Renderiza el contenido del modal (arte, coste, nombre, tipo, stats, desc,
// facción, keyword, misión, selector de formas). NO decide qué se ve; eso lo
// hace applyCardModalMode. Muestra la carta pasada tal cual (la forma marcada
// la resuelven openCardModal y markPhase).
function renderCardModalContent(card) {
    let displayCard = card;
    let familyId = window._modalActiveFamilyId;

    document.getElementById('modal-card-art').style.backgroundImage = `url('${displayCard.art}')`;
    document.getElementById('modal-card-cost').innerText = displayCard.cost;
    document.getElementById('modal-card-name').innerText = displayCard.name;
    // Nombre en modo lore (arriba del arte).
    let loreName = document.getElementById('modal-card-lore-name');
    if (loreName) loreName.innerText = displayCard.name;
    let descEl = document.getElementById('modal-card-desc');
    if (descEl) {
        let descHtml = displayCard.desc || '';
        let triggerKeys = ['Al entrar','Inicio de turno','Al morir','Embestida','Enfurecer','Sacrificio'];
        // Ordenar por longitud descendente para evitar que "Daño" se
        // coma "Daño 2" dentro de otra palabra.
        let allKeys = Object.keys(LEYENDAS).sort((a,b) => b.length - a.length);
        allKeys.forEach(key => {
            if (!descHtml.includes(key)) return;
            let isTrigger = triggerKeys.includes(key);
            let color = isTrigger ? 'text-amber-300' : 'text-cyan-300';
            let regex = new RegExp('\\b' + key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g');
            descHtml = descHtml.replace(regex, `<span class="${color}">${key}</span>`);
        });
        descEl.innerHTML = descHtml;
    }

    let typeIcon = document.getElementById('modal-card-type-icon');
    let typeText = document.getElementById('modal-card-type');
    let statsBox = document.querySelector('.card-stats-box');
    if (displayCard.kind === 'Ser' && displayCard.subtype === 'Vástago') {
        typeIcon.className = "fa-solid fa-paw text-[8px] text-amber-400";
        typeText.innerText = "VÁSTAGO";
        typeText.className = "bg-amber-600 text-white text-[8px] px-1 rounded font-bold uppercase";
        document.getElementById('modal-card-atk').innerHTML = displayCard.atk;
        document.getElementById('modal-card-hp').innerHTML = displayCard.hp;
        if (statsBox) statsBox.style.display = 'flex';
    } else if (displayCard.kind === 'Ser') {
        typeIcon.className = "fa-solid fa-shield-halved text-[8px] text-blue-400";
        typeText.innerText = "SER";
        typeText.className = "bg-blue-600 text-white text-[8px] px-1 rounded font-bold uppercase";
        document.getElementById('modal-card-atk').innerHTML = displayCard.atk;
        document.getElementById('modal-card-hp').innerHTML = displayCard.hp;
        if (statsBox) statsBox.style.display = 'flex';
    } else if (displayCard.kind === 'Token') {
        typeIcon.className = "fa-solid fa-shield-halved text-[8px] text-emerald-400";
        typeText.innerText = "TOKEN";
        typeText.className = "bg-emerald-600 text-white text-[8px] px-1 rounded font-bold uppercase";
        document.getElementById('modal-card-atk').innerHTML = displayCard.atk;
        document.getElementById('modal-card-hp').innerHTML = displayCard.hp;
        if (statsBox) statsBox.style.display = 'flex';
    } else {
        typeIcon.className = "fa-solid fa-bolt text-[8px] text-amber-400";
        typeText.innerText = "EVENTO";
        typeText.className = "bg-amber-600 text-white text-[8px] px-1 rounded font-bold uppercase";
        // Los Eventos no tienen stats: se oculta la caja (en modo lore la
        // oculta el CSS con !important, así que no hace falta nada más).
        if (statsBox) statsBox.style.display = 'none';
    }

    // Leyenda (solo los triggers/keywords que la desc de la carta usa).
    let infoHtml = '';
    if (displayCard.desc) {
        let keys = new Set();
        // Detectar triggers y keywords presentes en la desc.
        for (let key in LEYENDAS) {
            if (displayCard.desc.includes(key)) keys.add(key);
        }
        if (keys.size > 0) {
            let list = '';
            keys.forEach(key => {
                let isTrigger = ['Al entrar','Inicio de turno','Al morir','Embestida','Enfurecer','Sacrificio'].includes(key);
                let color = isTrigger ? 'text-amber-300' : 'text-cyan-300';
                let icon = isTrigger ? 'fa-bolt' : 'fa-key';
                list += `<li class="mb-1 flex gap-1 items-start"><i class="fa-solid ${icon} ${color} text-[8px] mt-1"></i><span class="text-[10px] text-slate-300 leading-tight"><strong class="${color}">${key}:</strong> ${LEYENDAS[key]}</span></li>`;
            });
            infoHtml = `<ul class="space-y-1">${list}</ul>`;
        }
    }

    // --- PANEL DE INFORMACIÓN (leyenda, lore o misión según el modo) ---
    let infoPanel = document.getElementById('modal-info-content');
    if (infoPanel) {
        if (cardModalMode === 'lore') {
            infoPanel.innerHTML = `<p class="text-[10px] text-slate-400 italic leading-tight text-center">${displayCard.lore || ''}</p>`;
        } else {
            let html = infoHtml;
            if (!html) html = '<p class="text-[10px] text-slate-500 text-center">Sin informacion.</p>';
            infoPanel.innerHTML = html;
        }
    }

    // --- PANEL DE MISIONES (separado de la leyenda; oculto si todo completado) ---
    let missionPanel = document.getElementById('modal-missions-panel');
    let missionContent = document.getElementById('modal-missions-content');
    if (missionPanel && missionContent) {
        let formId = displayCard.id;
        // Misiones que desbloquean esta forma; si la carta no tiene (forma
        // base o carta suelta), se muestran las que se progresan con ella.
        let ownMissions = [];
        let prevMissions = [];
        for (let mid in CARD_MISSIONS) {
            let m = CARD_MISSIONS[mid];
            let fam = CARD_FAMILIES[m.familyId];
            if (!fam) continue;
            if (fam.forms[m.formIndex] === formId) ownMissions.push({ id: mid, mission: m });
            else if (m.previousCardId === formId) prevMissions.push({ id: mid, mission: m });
        }
        let currentMissions = ownMissions.length > 0 ? ownMissions : prevMissions;
        let allCompleted = currentMissions.length > 0 && currentMissions.every(({id, mission}) => {
            let p = getProgressFor(id);
            if (mission.type === 'wins') return (p.wins||0) >= mission.count;
            if (mission.type === 'games_with') return (p.gamesWith||0) >= mission.count;
            if (mission.type === 'exilio_received') return (p.exilioReceived||0) >= mission.count;
            if (mission.type === 'kills_with') return (p.killsWith||0) >= mission.count;
            if (mission.type === 'invoke_with') return (p.invokeWith||0) >= mission.count;
            if (mission.type === 'exile_with') return (p.exileWith||0) >= mission.count;
            if (mission.type === 'fortalecer_with') return (p.fortalecerWith||0) >= mission.count;
            if (mission.type === 'glory_with') return (p.gloryWith||0) >= mission.count;
            return false;
        });
        if (currentMissions.length === 0 || allCompleted) {
            missionPanel.style.display = 'none';
            missionContent.innerHTML = '';
        } else {
            missionPanel.style.display = 'block';
            let html = '';
            currentMissions.forEach(({id, mission}) => {
                let p = getProgressFor(id);
                let current = 0;
                if (mission.type === 'wins') current = p.wins||0;
                if (mission.type === 'games_with') current = p.gamesWith||0;
                if (mission.type === 'exilio_received') current = p.exilioReceived||0;
                if (mission.type === 'kills_with') current = p.killsWith||0;
                if (mission.type === 'invoke_with') current = p.invokeWith||0;
                if (mission.type === 'exile_with') current = p.exileWith||0;
                if (mission.type === 'fortalecer_with') current = p.fortalecerWith||0;
                if (mission.type === 'glory_with') current = p.gloryWith||0;
                let completed = current >= mission.count;
                let pct = Math.min(100, (current / mission.count) * 100);
                html += `<div class="mb-1"><p class="text-[9px] text-slate-300 leading-tight">${mission.description}</p>`;
                html += `<div class="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-0.5"><div class="h-full ${completed ? 'bg-emerald-500' : 'bg-purple-500'}" style="width:${pct}%"></div></div>`;
                html += `<p class="text-[8px] text-slate-400 text-right">${current}/${mission.count}</p></div>`;
            });
            missionContent.innerHTML = html;
        }
    }

    // --- SELECTOR DE FORMAS (solo si la carta pertenece a una familia) ---
    // En combate NO se puede cambiar la forma: se muestran como texto no
    // clickable con un cartel.
    let phaseSelector = document.getElementById('modal-phase-selector');
    if (phaseSelector) {
        if (familyId) {
            let family = CARD_FAMILIES[familyId];
            let selectedPhaseId = getSelectedPhase(familyId);
            let inCombat = !document.getElementById('view-game').classList.contains('hidden-view');
            let html = '<div class="text-[8px] font-orbitron font-bold uppercase tracking-[0.2em] text-amber-300 text-center mb-1">FORMAS</div>';
            html += '<div class="flex gap-1 justify-center">';
            family.forms.forEach((formId, idx) => {
                let isUnlocked = isFormUnlocked(familyId, formId);
                let isSelected = (selectedPhaseId === formId);
                let label = ['I', 'II', 'III'][idx];
                let color = isSelected ? 'bg-amber-600 text-white' : (isUnlocked ? 'bg-slate-700 text-slate-200' : 'bg-slate-800 text-slate-500');
                let lockIcon = isUnlocked ? '' : ' 🔒';
                if (inCombat) {
                    html += `<span class="px-2 py-1 rounded text-[10px] font-bold ${color} opacity-60 cursor-not-allowed">${label}${lockIcon}</span>`;
                } else {
                    html += `<button onclick="markPhase('${familyId}','${formId}')" class="px-2 py-1 rounded text-[10px] font-bold ${color}">${label}${lockIcon}</button>`;
                }
            });
            html += '</div>';
            if (inCombat) {
                html += '<p class="text-[8px] text-slate-500 text-center mt-1">No puedes cambiar la forma en combate</p>';
            }
            phaseSelector.innerHTML = html;
            phaseSelector.style.display = 'block';
        } else {
            phaseSelector.style.display = 'none';
            phaseSelector.innerHTML = '';
        }
    }
}

// Marca una fase y la previsualiza EN VIVO (aunque esté bloqueada).
// Al cerrar el modal, se aplica la fase seleccionada (si está desbloqueada;
// si no, la anterior desbloqueada).
let markedPhaseId = null;

function markPhase(familyId, formId) {
    // En combate NO se puede cambiar la forma.
    let inCombat = !document.getElementById('view-game').classList.contains('hidden-view');
    if (inCombat) {
        alert('No puedes cambiar la forma en combate.');
        return;
    }
    // Previsualizar la forma tocada (aunque esté bloqueada).
    markedPhaseId = formId;
    let card = ALL_CARDS.find(c => c.id === formId);
    if (card) {
        window._modalActiveFamilyId = familyId;
        // Renderizar la carta completa (arte, stats, efecto, lore, misión).
        renderCardModalContent(card);
        // La carta activa pasa a ser la previsualizada (el modo lore lee de
        // aquí) y se re-aplica el modo actual del modal.
        window._modalActiveCard = card;
        applyCardModalMode();
        // Actualizar el estilo de los botones del selector (marcar el tocado).
        let phaseSelector = document.getElementById('modal-phase-selector');
        if (phaseSelector) {
            let family = CARD_FAMILIES[familyId];
            let buttons = phaseSelector.querySelectorAll('button');
            buttons.forEach((btn, idx) => {
                let isMarked = (family.forms[idx] === formId);
                let isUnlocked = isFormUnlocked(familyId, family.forms[idx]);
                if (isMarked) {
                    btn.className = 'px-2 py-1 rounded text-[10px] font-bold bg-amber-600 text-white ring-2 ring-amber-300';
                } else {
                    btn.className = 'px-2 py-1 rounded text-[10px] font-bold ' + (isUnlocked ? 'bg-slate-700 text-slate-200' : 'bg-slate-800 text-slate-500');
                }
            });
        }
    }
}

// Aplica el modo actual al modal (combate o lore): muestra/oculta elementos.
function applyCardModalMode() {
    let isLore = cardModalMode === 'lore';
    let frame = document.querySelector('.card-modal-frame');
    if (frame) frame.classList.toggle('card-modal-lore-mode', isLore);

    // Mostrar el nombre en modo lore.
    let loreName = document.getElementById('modal-card-lore-name');
    if (loreName) loreName.style.display = isLore ? 'block' : 'none';

    // El lore box (debajo del marco) se muestra solo en modo lore Y si la
    // carta tiene lore. Si no hay lore, el bloque se queda oculto aunque
    // estemos en modo lore (evita un bloque vacío).
    let loreBox = document.getElementById('card-modal-lore-box');
    let activeCard = window._modalActiveCard;
    let hasLore = activeCard && activeCard.lore && activeCard.lore.trim() !== '';
    if (loreBox) loreBox.classList.toggle('hidden-view', !isLore || !hasLore);

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
    // PANEL ÚNICO: el contenido del panel cambia con el modo (lore frente a
    // keyword/misión), así que hay que re-renderizarlo.
    if (window._modalActiveCard) renderCardModalContent(window._modalActiveCard);
    applyCardModalMode();
}

function closeCardModal() {
    // Aplicar la forma marcada (si hay) al cerrar: se guarda en la familia
    // activa (resuelta a la forma desbloqueada más cercana si la marcada está
    // bloqueada). En combate no hay marca (markPhase lo impide).
    if (markedPhaseId) {
        let familyId = window._modalActiveFamilyId;
        if (familyId) {
            let resolved = resolvePhase(familyId, markedPhaseId);
            setSelectedPhase(familyId, resolved);
        }
        markedPhaseId = null;
    }
    document.getElementById('card-modal').classList.add('hidden-view');
    cardModalMode = 'combat';
    window._modalActiveCard = null;
    window._modalActiveFamilyId = null;
    // Refresco en vivo del deckbuilder tras aplicar una forma.
    if (!document.getElementById('view-deckbuilder').classList.contains('hidden-view')) {
        renderDeckEditor();
        renderCollection();
    }
    // Reanudar solo si el modal pauso la partida, la vista de juego
    // sigue activa y NO hay gameover visible (evita reanudar una
    // partida ya terminada por un tick que cayo con el modal abierto).
    if (modalAutoPaused) {
        modalAutoPaused = false;
        let inGame = !document.getElementById('view-game').classList.contains('hidden-view');
        let gameOver = !document.getElementById('gameover-modal').classList.contains('hidden-view');
        if (inGame && !gameOver) startGame();
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
            <div class="stat-atk"><span>${displayAtk}</span></div>
            <div class="stat-hp"><span>${card.hp}</span></div>
        </div>
    `;
    wrap.appendChild(cardDiv);

    // Indicador permanente de gloria: cada Ser muestra junto a su esquina,
    // fuera del marco, cuánta gloria suma al final del turno (su ATK
    // efectivo). Los Eventos no puntúan por turno → sin badge.
    if (card.kind === 'Ser') {
        let noScore = card.dying || card.stunned;
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
        (atkEl.querySelector('span') || atkEl).innerText = displayAtk;
        flashStat(atkEl, rose);
    }
    if (hpEl && +hpEl.innerText !== card.hp) {
        let rose = card.hp > +hpEl.innerText;
        (hpEl.querySelector('span') || hpEl).innerText = card.hp;
        flashStat(hpEl, rose);
    }
    // El badge de gloria refleja el ATK efectivo y se atenúa si el Ser no
    // puntúa este turno (aturdido o muriendo).
    let noScore = card.dying || card.stunned;
    let badgeVal = el.querySelector('.glory-badge-val');
    let expectedBadge = '+' + (noScore ? 0 : displayAtk);
    if (badgeVal && badgeVal.innerText !== expectedBadge) badgeVal.innerText = expectedBadge;
    let badge = el.querySelector('.glory-badge');
    if (badge) badge.classList.toggle('glory-dim', noScore);

    // Exilio persistente: el render reconstruye el DOM en cada tick, así
    // que el FX transitorio (fx-exilio) se perdería. Se deriva del estado
    // lógico (card.stunned + card.exilioTurns) y se reaplica en cada render.
    if (card.stunned && card.exilioTurns > 0) {
        if (!cardEl.classList.contains('fx-exilio')) cardEl.classList.add('fx-exilio');
        if (!cardEl.querySelector('.fx-exilio-icon')) {
            let icon = document.createElement('div');
            icon.className = 'fx-exilio-icon';
            icon.innerHTML = '<i class="fa-solid fa-maze"></i>';
            cardEl.appendChild(icon);
        }
    } else {
        cardEl.classList.remove('fx-exilio');
        let icon = cardEl.querySelector('.fx-exilio-icon');
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
    // Cartas jugadas por p1 en la partida (tablero + mazo ya robado +
    // ultima jugada): para misiones de tipo games_with_both.
    let p1PlayedIds = new Set();
    gameState.p1.activeBoard.forEach(c => p1PlayedIds.add(c.id));
    if (gameState.p1.deck) gameState.p1.deck.slice(0, gameState.p1.deckPointer).forEach(c => p1PlayedIds.add(c.id));
    if (gameState.p1.lastPlayed) p1PlayedIds.add(gameState.p1.lastPlayed.id);
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
    if (won) incrementWin();
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
        let allBotCards = currentChapter.botDecks && currentChapter.botDecks[0]
            ? currentChapter.botDecks[0]
            : (currentChapter.botDeck || []);
        // Solo cartas sueltas o formas base. Nunca formas 2/3 ni Tokens.
        let cardsToGive = allBotCards.filter(id => {
            let card = ALL_CARDS.find(c => c.id === id);
            if (!card) return false;
            if (card.kind === 'Token') return false;
            if (card.subtype === 'Vástago') return false;
            let family = getFamilyFor(id);
            if (family && family.forms[0] !== id) return false; // forma 2/3
            if (ownedCardIds.includes(id)) return false;
            return true;
        });
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
    // Recompensa integrada en el modal de victoria (entre la puntuacion
    // y los botones), con arte, nombre, tipo, coste y stats.
    let rewardSlot = document.getElementById('gameover-reward-slot');
    if (rewardSlot) {
        rewardSlot.innerHTML = '';
        if (rewardCardId) {
            let card = ALL_CARDS.find(c => c.id === rewardCardId);
            if (card) {
                let typeLabel = card.kind === 'Ser' ? 'SER' : (card.kind === 'Token' ? 'TOKEN' : 'EVENTO');
                let typeColor = card.kind === 'Ser' ? 'bg-blue-600' : (card.kind === 'Token' ? 'bg-emerald-600' : 'bg-amber-600');
                let statsHtml = '';
                if (card.kind === 'Ser' || card.kind === 'Token') {
                    statsHtml = `<div class="flex gap-1 mt-1">
                        <span class="stat-atk" style="width:20px;height:20px;font-size:9px;">${card.atk}</span>
                        <span class="stat-hp" style="width:20px;height:20px;font-size:9px;">${card.hp}</span>
                    </div>`;
                }
                rewardSlot.innerHTML = `
                    <div class="flex flex-col items-center gap-1">
                        <div class="text-[9px] font-orbitron font-bold tracking-widest text-amber-300">¡NUEVA CARTA OBTENIDA!</div>
                        <div class="relative w-20 h-28 rounded-lg overflow-hidden border-2 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)]">
                            <div class="absolute inset-0 bg-cover bg-center" style="background-image:url('${card.art}')"></div>
                            <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40"></div>
                            <div class="absolute top-1 left-1 w-5 h-5 rounded-full bg-cyan-200 text-cyan-900 text-[10px] font-bold flex items-center justify-center border border-white">${card.cost}</div>
                            <div class="absolute top-1 right-1 ${typeColor} text-white text-[7px] px-1 rounded font-bold">${typeLabel}</div>
                            <div class="absolute bottom-1 left-1 right-1">
                                <div class="text-white font-orbitron font-bold text-[9px] leading-tight truncate drop-shadow-md">${card.name}</div>
                                ${statsHtml}
                            </div>
                        </div>
                    </div>`;
                rewardSlot.classList.remove('hidden-view');
            }
        } else {
            rewardSlot.classList.add('hidden-view');
        }
    }

    if (navigator.vibrate) navigator.vibrate(p1Score >= p2Score ? [30, 40, 60] : 50);

    // --- TUTORIAL: AVANZAR AL GANAR O PERDER ---
    if (tutorialActive && currentChapter && currentChapter.id === 1) {
        if (gameState.p1.score > gameState.p2.score) {
            setTimeout(() => setTutorialStep(5), 1000);
        } else {
            setTimeout(() => showTutorialMessage("Has perdido", "Ve al Deckbuilder (Mazos) y prueba a ordenar tus cartas de otra manera."), 1000);
        }
    }

    // Trackear misiones de tipo "wins" y "games_with".
    let uniqueCardIds = new Set(gameState.p1.activeBoard.map(c => c.id));
    uniqueCardIds.forEach(cardId => {
        for (let missionCardId in CARD_MISSIONS) {
            let mission = CARD_MISSIONS[missionCardId];
            if (mission.previousCardId === cardId) {
                if (mission.type === 'wins' && won) {
                    let progress = getProgressFor(missionCardId);
                    // El desbloqueo lo centraliza consumeMissionCounters: una
                    // forma se libera solo cuando TODAS sus misiones acaban.
                    updateProgressFor(missionCardId, { wins: (progress.wins || 0) + 1 });
                } else if (mission.type === 'games_with') {
                    let progress = getProgressFor(missionCardId);
                    updateProgressFor(missionCardId, { gamesWith: (progress.gamesWith || 0) + 1 });
                } else if (mission.type === 'games_with_both') {
                    // Ambas cartas deben haber sido jugadas en la partida.
                    // El desbloqueo lo centraliza consumeMissionCounters.
                    if (p1PlayedIds.has(mission.previousCardId) && p1PlayedIds.has(mission.secondCardId)) {
                        let progress = getProgressFor(missionCardId);
                        updateProgressFor(missionCardId, { gamesWith: (progress.gamesWith || 0) + 1 });
                    }
                }
            }
        }
    });

    // Misiones nuevas (v1.9.4): consume los contadores de la partida
    // (muertos/invocaciones/exilios/Fortalecer/Gloria) y desbloquea formas.
    consumeMissionCounters();

    // Refresca el candado del boton de eventos en el instante de ganar
    // el Cap 1 (sin esperar a la siguiente navegacion a home).
    updateEventsButtonState();
    // Refresca el perfil si el jugador vuelve a el tras el combate.
    if (!document.getElementById('view-profile').classList.contains('hidden-view')) {
        renderProfile();
    }
    document.getElementById('gameover-modal').classList.remove('hidden-view');
}

// --- CONSUMO DE MISIONES NUEVAS (v1.9.4) ---
// Los contadores de kills/invoke/exile ya vienen condicionados por el motor
// (la carta previousCardId viva en el tablero al ocurrir el evento); los de
// Fortalecer y Gloria son globales por partida y se acreditan a las misiones
// cuyo previousCardId sigue vivo en tablero o esta en el mazo del jugador.
// El desbloqueo de formas se centraliza aqui: una forma se libera solo
// cuando TODAS sus misiones estan completadas.
function consumeMissionCounters() {
    let counters = gameState.missionCounters || {};
    let aliveIds = new Set(gameState.p1.activeBoard.filter(c => !c.dying).map(c => c.id));
    let prevIds = new Set([...aliveIds, ...playerDeck]);
    let keyFor = { kills_with: 'killsWith', invoke_with: 'invokeWith', exile_with: 'exileWith', fortalecer_with: 'fortalecerWith', glory_with: 'gloryWith' };
    let fxKeys = { fortalecer_with: '_fx:fortalecer_with', glory_with: '_fx:glory_with' };
    for (let mid in CARD_MISSIONS) {
        let mission = CARD_MISSIONS[mid];
        let key = keyFor[mission.type];
        if (!key) continue;
        let inc;
        if (fxKeys[mission.type]) {
            if (!prevIds.has(mission.previousCardId)) continue;
            inc = counters[fxKeys[mission.type]] || 0;
        } else {
            inc = counters[mid] || 0;
        }
        if (inc <= 0) continue;
        let progress = getProgressFor(mid);
        updateProgressFor(mid, { [key]: (progress[key] || 0) + inc });
    }
    for (let familyId in CARD_FAMILIES) {
        let family = CARD_FAMILIES[familyId];
        family.forms.forEach((formId, idx) => {
            if (idx === 0 || isFormUnlocked(familyId, formId)) return;
            let missionsOfForm = Object.keys(CARD_MISSIONS).filter(mid => CARD_MISSIONS[mid].familyId === familyId && CARD_MISSIONS[mid].formIndex === idx);
            if (!missionsOfForm.length) return;
            let allDone = missionsOfForm.every(mid => {
                let m = CARD_MISSIONS[mid], p = getProgressFor(mid);
                let cur = 0;
                if (m.type === 'wins') cur = p.wins || 0;
                if (m.type === 'games_with') cur = p.gamesWith || 0;
                if (m.type === 'exilio_received') cur = p.exilioReceived || 0;
                if (m.type === 'kills_with') cur = p.killsWith || 0;
                if (m.type === 'invoke_with') cur = p.invokeWith || 0;
                if (m.type === 'exile_with') cur = p.exileWith || 0;
                if (m.type === 'fortalecer_with') cur = p.fortalecerWith || 0;
                if (m.type === 'glory_with') cur = p.gloryWith || 0;
                return cur >= m.count;
            });
            if (allDone) {
                unlockForm(familyId, formId);
                let cardData = ALL_CARDS.find(c => c.id === formId);
                showTutorialMessage('¡Misión completada!', 'Has desbloqueado la forma: ' + (cardData ? cardData.name : formId));
            }
        });
    }
    gameState.missionCounters = {};
}

function closeGameOverModal() {
    document.getElementById('gameover-modal').classList.add('hidden-view');
    let rc = document.getElementById('gameover-reward-slot');
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
    let lastArt = safeStorageGet('nexo_last_chapter_art_v1');
    if (viewId === 'view-chapter-intro' || viewId === 'view-game') {
        art = currentChapter ? currentChapter.art : (getProgressChapter() || {}).art;
    } else if (viewId === 'view-chapters') {
        if (currentChapterView === 'events') {
            let events = CHAPTERS.filter(c => c.isEvent);
            let nextEvent = events.find(e => !isEventCompleted(e.id)) || events[events.length - 1];
            if (nextEvent) art = nextEvent.art;
            else { let ch = getProgressChapter(); art = ch ? ch.art : null; }
        } else {
            let ch = getProgressChapter();
            art = ch ? ch.art : null;
        }
    } else {
        // Home, mazos, deckbuilder, perfil, opciones:
        // fondo del ultimo combate jugado (cap o evento, gane o pierda).
        // Fallback al progreso si nunca se ha jugado.
        if (lastArt) {
            art = lastArt;
        } else {
            let ch = getProgressChapter();
            art = ch ? ch.art : null;
        }
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
    currentChapterView = 'campaign';
    if (tutorialActive && tutorialStep === 1) setTutorialStep(2);
    switchView('view-chapters');
    updateGlobalBackground('view-chapters');
}

function openEvents() {
    currentChapterView = 'events';
    if (!isChapterCompleted(1)) {
        if (navigator.vibrate) navigator.vibrate(30);
        return;
    }
    switchView('view-chapters');
    updateGlobalBackground('view-chapters');
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
    let titleEl = document.getElementById('chapters-title');
    let subtitleEl = document.getElementById('chapters-subtitle');

    if (currentChapterView === 'campaign') {
        if (titleEl) titleEl.innerText = 'CAPÍTULOS';
        if (subtitleEl) subtitleEl.innerText = 'La campaña se narra capítulo a capítulo';
        // ADAPTACIÓN: en el HTML ambas listas comparten el contenedor de
        // scroll, así que se alterna la lista de capítulos directamente (y la
        // sección de eventos, que sí tiene un padre propio con su título).
        if (eventsContainer) eventsContainer.parentElement.style.display = 'none';
        if (container) container.style.display = '';
    } else {
        if (titleEl) titleEl.innerText = 'EVENTOS';
        if (subtitleEl) subtitleEl.innerText = 'Subhistorias paralelas';
        if (eventsContainer) eventsContainer.parentElement.style.display = '';
        if (container) container.style.display = 'none';
    }

    if (currentChapterView === 'campaign' && container) {
        try {
            let frag = document.createDocumentFragment();
            let campaign = CHAPTERS.filter(ch => !ch.isEvent);
            let ordered = [...campaign].sort((a, b) =>
                (isChapterCompleted(a.id) ? 1 : 0) - (isChapterCompleted(b.id) ? 1 : 0)
            );
            ordered.forEach((ch, index) => {
                let done = isChapterCompleted(ch.id);
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
            container.innerHTML = '';
            container.appendChild(frag);
        } catch (e) { console.error('renderChapterSelect:', e); }
    }

    if (currentChapterView === 'events' && eventsContainer) {
        try {
            let efrag = document.createDocumentFragment();
            let events = CHAPTERS.filter(ch => ch.isEvent);
            events.forEach(ev => {
                let done = isEventCompleted(ev.id);
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
        } catch (e) { console.error('renderChapterSelect events:', e); }
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
    // Recordar el arte de este combate para el fondo global de las
    // demas vistas (home, mazos, perfil, opciones).
    safeStorageSet('nexo_last_chapter_art_v1', currentChapter.art);
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

    let statsBox = document.getElementById('profile-stats-box');
    if (statsBox) {
        let stats = getPlayerStats();
        let chapters = getCompletedChapters().length;
        let events = getCompletedEvents().length;
        let cards = ownedCardIds.length;
        statsBox.innerHTML = `
            <div class="grid grid-cols-2 gap-2">
                <div class="bg-slate-900 border border-slate-700 rounded-lg p-2 text-center">
                    <div class="text-lg font-orbitron font-black text-amber-400">${stats.wins || 0}</div>
                    <div class="text-[9px] text-slate-400 font-bold uppercase">Combates ganados</div>
                </div>
                <div class="bg-slate-900 border border-slate-700 rounded-lg p-2 text-center">
                    <div class="text-lg font-orbitron font-black text-emerald-400">${chapters}</div>
                    <div class="text-[9px] text-slate-400 font-bold uppercase">Capítulos</div>
                </div>
                <div class="bg-slate-900 border border-slate-700 rounded-lg p-2 text-center">
                    <div class="text-lg font-orbitron font-black text-fuchsia-400">${events}</div>
                    <div class="text-[9px] text-slate-400 font-bold uppercase">Eventos</div>
                </div>
                <div class="bg-slate-900 border border-slate-700 rounded-lg p-2 text-center">
                    <div class="text-lg font-orbitron font-black text-cyan-400">${cards}</div>
                    <div class="text-[9px] text-slate-400 font-bold uppercase">Cartas</div>
                </div>
            </div>
        `;
    }
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
// setSfxVolume vive en audio.js (v1.11.0): guarda nexo_sfx_vol y aplica el
// volumen real a los Audio objects cacheados. El slider de Opciones la invoca.

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
        safeStorageSet('nexo_deck_v1', '');
        safeStorageSet('nexo_decks_v1', '');
        safeStorageSet('nexo_active_deck_v1', '');
        safeStorageSet('nexo_unlocked_forms_v1', '');
        safeStorageSet('nexo_selected_phases_v1', '');
        safeStorageSet('nexo_card_progress_v1', '');
        safeStorageSet('nexo_stats_v1', '');
        safeStorageSet('nexo_last_seen_version', '');
        safeStorageSet('nexo_last_chapter_art_v1', '');
        location.reload();
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
    loadDeck();
    switchView('view-deckbuilder');
    setTimeout(() => { renderDeckEditor(); renderCollection(); }, 50);
}

// --- GESTO DE DESLIZAR EN EL MODAL DE FAMILIA ---
// Deslizar izquierda/derecha cambia entre las formas de la familia.
// Solo funciona si el modal tiene una familia activa (window._modalActiveFamilyId).
// Umbral: 50px. La carta sigue al dedo mientras se desliza.

let _swipeStartX = null;
let _swipeCurrentFormIndex = -1;
let _swipeMaxDistance = 0;

function initCardModalSwipe() {
    let frame = document.querySelector('.card-modal-frame');
    if (!frame || frame._swipeInitialized) return;
    frame._swipeInitialized = true;

    frame.addEventListener('touchstart', (e) => {
        if (!window._modalActiveFamilyId) return;
        _swipeStartX = e.touches[0].clientX;
        _swipeMaxDistance = 0;
        // Índice actual de la forma mostrada.
        let family = CARD_FAMILIES[window._modalActiveFamilyId];
        if (!family) return;
        let currentForm = window._modalActiveCard ? window._modalActiveCard.id : family.forms[0];
        _swipeCurrentFormIndex = family.forms.indexOf(currentForm);
        if (_swipeCurrentFormIndex === -1) _swipeCurrentFormIndex = 0;
    }, { passive: true });

    frame.addEventListener('touchmove', (e) => {
        if (_swipeStartX === null) return;
        let dx = e.touches[0].clientX - _swipeStartX;
        // La carta sigue al dedo (máx 30px para no romper el layout).
        let limitedDx = Math.max(-30, Math.min(30, dx));
        frame.style.transform = `translateX(${limitedDx}px)`;
        frame.style.transition = 'none';
        _swipeMaxDistance = Math.abs(dx);
    }, { passive: true });

    frame.addEventListener('touchend', (e) => {
        if (_swipeStartX === null) return;
        let dx = e.changedTouches[0].clientX - _swipeStartX;
        _swipeStartX = null;

        // Reset visual.
        frame.style.transition = 'transform 0.2s ease';
        frame.style.transform = '';

        // Umbral: 50px.
        if (Math.abs(dx) < 50) return;

        let family = CARD_FAMILIES[window._modalActiveFamilyId];
        if (!family) return;

        let newIndex = _swipeCurrentFormIndex;
        if (dx < 0) {
            // Deslizar a la izquierda: forma siguiente.
            newIndex = Math.min(family.forms.length - 1, _swipeCurrentFormIndex + 1);
        } else {
            // Deslizar a la derecha: forma anterior.
            newIndex = Math.max(0, _swipeCurrentFormIndex - 1);
        }

        if (newIndex === _swipeCurrentFormIndex) return; // no hay cambio

        let newFormId = family.forms[newIndex];
        let card = ALL_CARDS.find(c => c.id === newFormId);
        if (card) {
            markPhase(window._modalActiveFamilyId, newFormId);
        }
    }, { passive: true });
}

// --- NAVEGACIÓN: TOCAR EL BOTÓN ACTIVO VUELVE A HOME ---
function handleNavClick(viewId, opener) {
    let currentView = document.querySelector('.view-section:not(.hidden-view)');
    let currentId = currentView ? currentView.id : null;

    if (viewId === 'view-decks') {
        if (currentId === 'view-deckbuilder') { switchView('view-decks'); renderDeckSelect(); return; }
        if (currentId === 'view-decks') { openDeckForEdit(getActiveDeckId()); return; }
        opener(); return;
    }

    let isCurrent = (currentId === viewId);
    if (isCurrent) switchView('view-home');
    else opener();
}

// --- LISTA DE MAZOS (ABRIR / RENOMBRAR / CREAR / ELIMINAR) ---
// Un box 3/2 por mazo con el arte de su primera carta (en familias, la
// forma marcada). El arte y el nombre abren el deckbuilder; el lapiz
// renombra con prompt.
function renderDeckSelect() {
    let container = document.getElementById('decks-list');
    if (!container) return;
    let decks = getDecks();
    let activeId = getActiveDeckId();
    let html = '';
    decks.forEach(deck => {
        let isActive = deck.id === activeId;
        // Resolver arte de la primera carta.
        // Soporta: familyId ('asterion'), cardId de familia ('c3'),
        // cardId suelta ('c1') y objeto carta.
        let art = 'assets/cartas/carta-01-mortales-de-arcadia.webp';
        let firstEntry = deck.cards && deck.cards.length > 0 ? deck.cards[0] : null;
        if (firstEntry) {
            let entryId = typeof firstEntry === 'string'
                ? firstEntry
                : (firstEntry && firstEntry.id ? firstEntry.id : null);
            if (entryId) {
                let family = getFamilyById(entryId);
                if (!family) {
                    let fam = getFamilyFor(entryId);
                    if (fam) family = fam;
                }
                if (family) {
                    let selectedForm = getSelectedPhase(family.id);
                    let formCard = ALL_CARDS.find(c => c.id === selectedForm)
                        || ALL_CARDS.find(c => c.id === family.forms[0]);
                    if (formCard) art = formCard.art;
                } else {
                    let card = ALL_CARDS.find(c => c.id === entryId);
                    if (card) art = card.art;
                }
            }
        }
        html += `
            <div class="relative rounded-xl overflow-hidden border-2 ${isActive ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)]' : 'border-slate-700'} aspect-[3/2]" style="aspect-ratio:3/2">
                <div class="absolute inset-0 bg-cover bg-center cursor-pointer" style="background-image:url('${art}')" onclick="openDeckForEdit('${deck.id}')"></div>
                <div class="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/90 to-transparent pointer-events-none"></div>
                <div class="absolute bottom-0 inset-x-0 flex items-center justify-between px-3 py-2 gap-2">
                    <span class="text-white font-orbitron font-bold text-sm truncate flex-1 drop-shadow-md cursor-pointer" onclick="openDeckForEdit('${deck.id}')">${deck.name}</span>
                    <button onclick="event.stopPropagation(); renameDeckPrompt('${deck.id}')" class="w-8 h-8 rounded-full bg-slate-900/80 border border-slate-600 text-xs text-blue-300 shrink-0 active:scale-95" aria-label="Renombrar mazo">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    ${decks.length > 1 ? `<button onclick="event.stopPropagation(); if(confirm('¿Eliminar este mazo?')) { if(deleteDeck('${deck.id}')) { loadDeck(); renderDeckSelect(); } }" class="w-8 h-8 rounded-full bg-slate-900/80 border border-red-500/60 text-xs text-red-300 shrink-0 active:scale-95" aria-label="Eliminar mazo"><i class="fa-solid fa-trash"></i></button>` : ''}
                </div>
            </div>
        `;
    });
    html += `<button onclick="createDeck(); renderDeckSelect();" class="w-full bg-emerald-700 text-white font-bold py-2.5 rounded-lg text-xs mt-3 active:scale-95"><i class="fa-solid fa-plus"></i> Crear mazo nuevo</button>`;
    container.innerHTML = html;
}

// Renombrar mazo desde el lapiz del box (prompt nativo). Cancelar o
// dejar vacio no cambia nada.
function renameDeckPrompt(deckId) {
    let decks = getDecks();
    let deck = decks.find(d => d.id === deckId);
    if (!deck) return;
    let newName = prompt('Nuevo nombre del mazo:', deck.name);
    if (newName === null) return;
    newName = newName.trim();
    if (newName === '') return;
    renameDeck(deckId, newName);
    renderDeckSelect();
}

// Abre el deckbuilder con el mazo indicado (arte o nombre del box de la lista).
function openDeckForEdit(deckId) {
    setActiveDeckId(deckId);
    loadDeck();
    renderDeckEditor();
    renderCollection();
    switchView('view-deckbuilder');
}

