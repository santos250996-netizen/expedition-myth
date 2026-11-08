// --- CONSTRUCTOR DE MAZOS ---
// Persistencia (localStorage), drag & drop, editor de mazo y colección.

// --- ALMACENAMIENTO SEGURO ---
// En visores embebidos (iframe sandbox) localStorage lanza SecurityError al
// tocarlo; con este respaldo en memoria el juego carga igual y solo se pierde
// la persistencia entre recargas.
const _memStorage = {};
function safeStorageGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return _memStorage[key] !== undefined ? _memStorage[key] : null; }
}
function safeStorageSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { _memStorage[key] = value; }
}

// --- INICIALIZACIÓN ---
function loadDeck() {
    // Inicializar el inventario del jugador (cartas del Capítulo 1.0).
    initOwnedCards();

    // SISTEMA DE FAMILIAS: el mazo guarda familyId ('asterion', 'dedalo') para
    // familias y el id de la carta para cartas sueltas. Los ids legados de
    // fases ('c3', 'a2', 'a7'...) se normalizan al familyId de su familia.
    let normalizeIds = (ids) => {
        let out = [];
        (ids || []).forEach(id => {
            let family = getFamilyFor(id);
            let normalized = family ? family.id : id;
            if (!out.includes(normalized)) out.push(normalized);
        });
        return out;
    };
    // Entrada válida: carta suelta poseída, o familia cuya base se posee.
    let isValidEntry = (id) => {
        let family = getFamilyById(id);
        if (family) return ownedCardIds.includes(family.forms[0]);
        return ownedCardIds.includes(id);
    };

    let saved = safeStorageGet('nexo_deck_v1');
    if (saved) {
        try {
            let savedIds = JSON.parse(saved);
            playerDeck = normalizeIds(savedIds).filter(isValidEntry);
        } catch(e) { console.error("Error loading deck", e); }
    }

    // Sin mazo guardado (o vacío): starter con las cartas que se poseen.
    if (!playerDeck || playerDeck.length === 0) {
        playerDeck = normalizeIds(ALL_CARDS.filter(c => ownedCardIds.includes(c.id)).map(c => c.id)).slice(0, 10);
    }
    if (playerDeck.length > 10) playerDeck = playerDeck.slice(0, 10);

    // Override dev: si el mazo guardado tiene menos de 10 cartas, se rellena
    // con el resto de cartas disponibles hasta 10. Solo en modo dev.
    if (isDevMode() && playerDeck.length < 10) {
        let used = new Set(playerDeck);
        for (let c of ALL_CARDS) {
            if (playerDeck.length >= 10) break;
            let family = getFamilyFor(c.id);
            let entry = family ? family.id : c.id;
            if (!used.has(entry) && isValidEntry(entry)) { playerDeck.push(entry); used.add(entry); }
        }
    }

    // Validación: si alguna entrada del mazo guardado ya no es válida (por
    // reinicio de progreso, migración, etc.), se elimina. Si el mazo queda
    // vacío tras la validación, se reconstruye el starter.
    if (!isDevMode()) {
        playerDeck = playerDeck.filter(isValidEntry);
        if (playerDeck.length === 0) {
            playerDeck = normalizeIds(ALL_CARDS.filter(c => ownedCardIds.includes(c.id)).map(c => c.id)).slice(0, 10);
        }
    }
}

        function saveDeck() {
            try {
                // SISTEMA DE FAMILIAS: el mazo ya guarda ids (familyId o id de
                // carta suelta), no objetos.
                safeStorageSet('nexo_deck_v1', JSON.stringify(playerDeck));
                let indicator = document.getElementById('save-indicator');
                indicator.style.opacity = '1';
                setTimeout(() => { indicator.style.opacity = '0'; }, 2000);
            } catch(e) {}
        }
        // --- DRAG & DROP ---
        function handleDragStart(e, cardId, source) {
            draggedCardId = cardId;
            e.target.classList.add('opacity-40');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', source); 
        }

        function handleDragEnd(e) {
            e.target.classList.remove('opacity-40');
            document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        }

        function handleDragOver(e) {
            e.preventDefault(); // Crucial para permitir el drop
            e.dataTransfer.dropEffect = 'move';
        }

        function handleDragEnter(e) {
            e.preventDefault();
            e.currentTarget.classList.add('drag-over');
        }

        function handleDragLeave(e) {
            e.currentTarget.classList.remove('drag-over');
        }

        // Soltar en el contenedor del MAZO (incluye fondo vacío)
        function handleDropOnDeck(e) {
            e.preventDefault();
            e.currentTarget.classList.remove('drag-over');
            let source = e.dataTransfer.getData('text/plain');
            if (!draggedCardId) return;

            if (source === 'collection') {
                // SISTEMA DE FAMILIAS: draggedCardId es un id (familyId o de
                // carta suelta); addCardToDeck gestiona dup/licencia/límite.
                addCardToDeck(draggedCardId);
            }
        }

        // Soltar en el contenedor de la COLECCIÓN
        function handleDropOnCollection(e) {
            e.preventDefault();
            e.currentTarget.classList.remove('drag-over');
            let source = e.dataTransfer.getData('text/plain');
            if (source === 'deck') {
                removeCardFromDeck(draggedCardId);
            }
        }

        // Soltar SOBRE una carta específica del mazo
        function handleDropOnCard(e, targetIndex) {
            e.preventDefault();
            e.stopPropagation();
            let source = e.dataTransfer.getData('text/plain');
            // SISTEMA DE FAMILIAS: las entradas del mazo son ids (familyId o
            // id de carta suelta), no objetos.
            if (!draggedCardId) return;

            if (source === 'deck') {
                // Reordenar dentro del mazo
                let sourceIndex = playerDeck.indexOf(draggedCardId);
                if (sourceIndex > -1 && sourceIndex !== targetIndex) {
                    let [movedId] = playerDeck.splice(sourceIndex, 1);
                    // FIX: tras extraer, si la carta venía de antes el índice destino
                    // se desplaza una posición (off-by-one al reordenar).
                    let insertAt = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
                    playerDeck.splice(insertAt, 0, movedId);
                    saveDeck(); renderDeckEditor();
                }
            } else if (source === 'collection') {
                // FIX: soltar una carta de la colección ENCIMA de una carta del mazo
                // antes "caía al vacío" (stopPropagation impedía que llegara al contenedor).
                if (playerDeck.includes(draggedCardId)) return;
                if (playerDeck.length >= 10) { alert("El mazo está lleno (10/10)."); return; }
                playerDeck.splice(targetIndex, 0, draggedCardId);
                saveDeck(); renderDeckEditor(); renderCollection();
            }
        }

        // --- ACCIONES TÁCTILES ---
        // El drag & drop HTML5 no funciona en pantallas táctiles; estos tres
        // métodos ofrecen la misma funcionalidad con toques (y sirven en escritorio).
        function addCardToDeck(cardIdOrFamilyId) {
            if (!cardIdOrFamilyId) return;
            if (navigator.vibrate) navigator.vibrate(15);
            // SISTEMA DE FAMILIAS: el mazo guarda el familyId de las familias
            // (la forma marcada se resuelve al renderizar y al jugar).
            let family = getFamilyById(cardIdOrFamilyId);
            let idToAdd = family ? family.id : cardIdOrFamilyId;
            if (playerDeck.includes(idToAdd)) return;
            if (playerDeck.length >= 10) { alert("El mazo está lleno (10/10)."); return; }
            playerDeck.push(idToAdd);
            saveDeck(); renderDeckEditor(); renderCollection();
        }

        function removeCardFromDeck(cardIdOrFamilyId) {
            let idx = playerDeck.indexOf(cardIdOrFamilyId);
            if (idx > -1) {
                if (navigator.vibrate) navigator.vibrate(15);
                playerDeck.splice(idx, 1);
                saveDeck(); renderDeckEditor(); renderCollection();
            }
        }

        function moveDeckCard(index, dir) {
            let target = index + dir;
            if (target < 0 || target >= playerDeck.length) return;
            let [movedCard] = playerDeck.splice(index, 1);
            playerDeck.splice(target, 0, movedCard);
            saveDeck(); renderDeckEditor();
        }

        // --- RENDERIZADO DEL DECKBUILDER ---
        function renderDeckEditor() {
            let container = document.getElementById('deck-list-container');
            container.innerHTML = '';
            document.getElementById('builder-deck-count').innerText = playerDeck.length;

            if(playerDeck.length === 0) {
                container.innerHTML = `<div class="text-center text-slate-500 text-xs p-4">Toca el botón + de la colección para añadir cartas a tu mazo.</div>`;
                return;
            }

            playerDeck.forEach((idOrCard, idx) => {
                // SISTEMA DE FAMILIAS: la entrada es un familyId (se muestra la
                // forma marcada) o el id de una carta suelta.
                let displayCard = null;
                let family = getFamilyById(idOrCard);
                if (family) {
                    let selectedForm = getSelectedPhase(family.id);
                    displayCard = ALL_CARDS.find(c => c.id === selectedForm);
                } else {
                    displayCard = ALL_CARDS.find(c => c.id === idOrCard);
                }
                if (!displayCard) return;
                let item = document.createElement('div');
                item.className = "relative rounded-lg overflow-hidden border border-slate-700 cursor-grab hover:border-blue-500 transition-colors h-14";
                item.draggable = true;
                item.ondragstart = (e) => handleDragStart(e, idOrCard, 'deck');
                item.ondragend = handleDragEnd;
                item.ondragover = (e) => { e.preventDefault(); item.classList.add('border-cyan-400'); };
                item.ondragleave = (e) => { item.classList.remove('border-cyan-400'); };
                item.ondrop = (e) => handleDropOnCard(e, idx);
                item.onclick = () => openCardModal(idOrCard);

                item.innerHTML = `
                    <div class="absolute inset-0 bg-cover bg-center" style="background-image: url('${displayCard.art}');"></div>
                    <div class="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
                    <div class="absolute top-1 left-1 w-5 h-5 rounded-full bg-cyan-200 text-cyan-900 text-[10px] font-bold flex items-center justify-center border border-white">${displayCard.cost}</div>
                    <div class="absolute bottom-1 left-2 right-9 flex justify-between items-end">
                        <span class="text-[10px] text-white font-bold truncate drop-shadow-md">${displayCard.name}</span>
                        <div class="flex gap-1">
                            ${displayCard.kind === 'Ser' ? `
                                <span class="w-4 h-4 rounded-full bg-blue-900/90 border border-blue-400 text-white text-[8px] flex items-center justify-center">${displayCard.atk}</span>
                                <span class="w-4 h-4 rounded-full bg-red-900/90 border border-red-400 text-white text-[8px] flex items-center justify-center">${displayCard.hp}</span>
                            ` : ''}
                        </div>
                    </div>
                    <div class="absolute top-0 right-0 bottom-0 w-7 flex flex-col bg-black/70 border-l border-slate-600/50 z-10">
                        <button class="move-btn flex-1 text-cyan-300 text-[10px] leading-none flex items-center justify-center hover:bg-cyan-500/20 active:bg-cyan-500/40" data-dir="-1" aria-label="Subir carta" ${idx === 0 ? 'disabled' : ''}>▲</button>
                        <button class="move-btn flex-1 text-slate-300 text-[10px] leading-none flex items-center justify-center hover:bg-slate-500/20 active:bg-slate-500/40 border-y border-slate-600/50" data-dir="1" aria-label="Bajar carta" ${idx === playerDeck.length - 1 ? 'disabled' : ''}>▼</button>
                        <button class="remove-btn flex-1 text-red-400 text-[10px] leading-none flex items-center justify-center hover:bg-red-500/20 active:bg-red-500/40" aria-label="Quitar del mazo">✕</button>
                    </div>
                `;
                item.querySelectorAll('.move-btn').forEach(btn => {
                    btn.onclick = (e) => { e.stopPropagation(); moveDeckCard(idx, parseInt(btn.dataset.dir)); };
                });
                item.querySelector('.remove-btn').onclick = (e) => { e.stopPropagation(); removeCardFromDeck(idOrCard); };
                container.appendChild(item);
            });
        }

        function renderCollection() {
            let container = document.getElementById('collection-container');
            container.innerHTML = '';
            let seenRaw = safeStorageGet('nexo_seen_cards_v1');
            let seenCards = seenRaw ? (JSON.parse(seenRaw) || []) : [];

            // SISTEMA DE FAMILIAS: 1 carta por familia (con la forma marcada),
            // más las cartas sueltas poseídas que no estén en el mazo.
            let availableCards = [];
            for (let familyId in CARD_FAMILIES) {
                let family = CARD_FAMILIES[familyId];
                if (playerDeck.includes(familyId)) continue;
                // Solo familias poseídas: la base marca la posesión.
                if (!ownedCardIds.includes(family.forms[0])) continue;
                let selectedForm = getSelectedPhase(familyId);
                let card = ALL_CARDS.find(c => c.id === selectedForm);
                if (card) availableCards.push({ card, idOrCard: familyId });
            }
            ALL_CARDS.forEach(card => {
                if (!ownedCardIds.includes(card.id)) return;
                if (getFamilyFor(card.id)) return;
                if (playerDeck.includes(card.id)) return;
                availableCards.push({ card, idOrCard: card.id });
            });

            if (availableCards.length === 0) {
                container.innerHTML = `<div class="text-center text-slate-500 text-xs p-4">Gana combates en la Campaña para obtener nuevas cartas.</div>`;
                return;
            }

            // Mismo aspecto que las tiras del mazo (columna izquierda): arte,
            // degradado, coste cian y medallas ATK/HP; el "+" vive en la
            // columna de control de la derecha de la tira.
            availableCards.forEach(({ card, idOrCard }) => {
                let el = document.createElement('div');
                el.className = "relative rounded-lg overflow-hidden border border-slate-700 cursor-grab hover:border-blue-500 transition-colors h-14";
                el.draggable = true;
                el.ondragstart = (e) => handleDragStart(e, idOrCard, 'collection');
                el.ondragend = handleDragEnd;
                el.ondragover = (e) => { e.preventDefault(); el.classList.add('border-cyan-400'); };
                el.ondragleave = (e) => { el.classList.remove('border-cyan-400'); };
                el.onclick = () => openCardModal(idOrCard);
                let isNew = !seenCards.includes(card.id);

                el.innerHTML = `
                    <div class="absolute inset-0 bg-cover bg-center" style="background-image: url('${card.art}');"></div>
                    ${isNew ? '<div class="new-card-dot"></div>' : ''}
                    <div class="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
                    <div class="absolute top-1 left-1 w-5 h-5 rounded-full bg-cyan-200 text-cyan-900 text-[10px] font-bold flex items-center justify-center border border-white">${card.cost}</div>
                    <div class="absolute bottom-1 left-2 right-9 flex justify-between items-end">
                        <span class="text-[10px] text-white font-bold truncate drop-shadow-md">${card.name}</span>
                        <div class="flex gap-1">
                            ${card.kind === 'Ser' ? `
                                <span class="w-4 h-4 rounded-full bg-blue-900/90 border border-blue-400 text-white text-[8px] flex items-center justify-center">${card.atk}</span>
                                <span class="w-4 h-4 rounded-full bg-red-900/90 border border-red-400 text-white text-[8px] flex items-center justify-center">${card.hp}</span>
                            ` : ''}
                        </div>
                    </div>
                    <div class="absolute top-0 right-0 bottom-0 w-7 flex flex-col bg-black/70 border-l border-slate-600/50 z-10">
                        <button class="add-btn flex-1 text-cyan-300 text-lg leading-none flex items-center justify-center hover:bg-cyan-500/20 active:bg-cyan-500/40" aria-label="Añadir al mazo">+</button>
                    </div>
                `;
                el.querySelector('.add-btn').onclick = (e) => { e.stopPropagation(); addCardToDeck(idOrCard); };
                container.appendChild(el);
            });

            // Marcar todas las cartas mostradas como vistas.
            let allIds = availableCards.map(a => a.card.id);
            let updatedSeen = [...new Set([...seenCards, ...allIds])];
            safeStorageSet('nexo_seen_cards_v1', JSON.stringify(updatedSeen));
        }
