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
            let saved = safeStorageGet('nexo_deck_v1');
            if (saved) {
                try {
                    let savedIds = JSON.parse(saved);
                    let uniqueIds = [...new Set(savedIds)];
                    playerDeck = uniqueIds.map(id => ALL_CARDS.find(c => c.id === id)).filter(c => c !== undefined);
                } catch(e) { console.error("Error loading deck", e); }
            }
            if (!playerDeck || playerDeck.length === 0) playerDeck = [...ALL_CARDS];
            if (playerDeck.length > 10) playerDeck = playerDeck.slice(0, 10);
        }

        function saveDeck() {
            try { 
                safeStorageSet('nexo_deck_v1', JSON.stringify(playerDeck.map(c => c.id)));
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
            let card = ALL_CARDS.find(c => c.id === draggedCardId);
            if (!card) return;

            if (source === 'collection') {
                if (playerDeck.length >= 10) { alert("El mazo está lleno (10/10)."); return; }
                playerDeck.push(card); // Lo añade al final del array
                saveDeck(); renderDeckEditor(); renderCollection();
            }
        }

        // Soltar en el contenedor de la COLECCIÓN
        function handleDropOnCollection(e) {
            e.preventDefault();
            e.currentTarget.classList.remove('drag-over');
            let source = e.dataTransfer.getData('text/plain');
            if (source === 'deck') {
                let idx = playerDeck.findIndex(c => c.id === draggedCardId);
                if (idx > -1) {
                    playerDeck.splice(idx, 1);
                    saveDeck(); renderDeckEditor(); renderCollection();
                }
            }
        }

        // Soltar SOBRE una carta específica del mazo
        function handleDropOnCard(e, targetIndex) {
            e.preventDefault();
            e.stopPropagation(); 
            let source = e.dataTransfer.getData('text/plain');
            let card = ALL_CARDS.find(c => c.id === draggedCardId);
            if (!card) return;

            if (source === 'deck') {
                // Reordenar dentro del mazo
                let sourceIndex = playerDeck.findIndex(c => c.id === card.id);
                if (sourceIndex > -1 && sourceIndex !== targetIndex) {
                    let [movedCard] = playerDeck.splice(sourceIndex, 1);
                    // FIX: tras extraer, si la carta venía de antes el índice destino
                    // se desplaza una posición (off-by-one al reordenar).
                    let insertAt = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
                    playerDeck.splice(insertAt, 0, movedCard);
                    saveDeck(); renderDeckEditor();
                }
            } else if (source === 'collection') {
                // FIX: soltar una carta de la colección ENCIMA de una carta del mazo
                // antes "caía al vacío" (stopPropagation impedía que llegara al contenedor).
                if (playerDeck.length >= 10) { alert("El mazo está lleno (10/10)."); return; }
                playerDeck.splice(targetIndex, 0, card);
                saveDeck(); renderDeckEditor(); renderCollection();
            }
        }

        // --- ACCIONES TÁCTILES ---
        // El drag & drop HTML5 no funciona en pantallas táctiles; estos tres
        // métodos ofrecen la misma funcionalidad con toques (y sirven en escritorio).
        function addCardToDeck(cardId) {
            let card = ALL_CARDS.find(c => c.id === cardId);
            if (!card) return;
            if (playerDeck.some(c => c.id === cardId)) return;
            if (playerDeck.length >= 10) { alert("El mazo está lleno (10/10)."); return; }
            playerDeck.push(card);
            saveDeck(); renderDeckEditor(); renderCollection();
        }

        function removeCardFromDeck(cardId) {
            let idx = playerDeck.findIndex(c => c.id === cardId);
            if (idx > -1) {
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

            playerDeck.forEach((card, idx) => {
                let item = document.createElement('div');
                item.className = "relative rounded-lg overflow-hidden border border-slate-700 cursor-grab hover:border-blue-500 transition-colors h-14";
                item.draggable = true;
                item.ondragstart = (e) => handleDragStart(e, card.id, 'deck');
                item.ondragend = handleDragEnd;
                item.ondragover = (e) => { e.preventDefault(); item.classList.add('border-cyan-400'); };
                item.ondragleave = (e) => { item.classList.remove('border-cyan-400'); };
                item.ondrop = (e) => handleDropOnCard(e, idx);
                item.onclick = () => openCardModal(card.id);

                item.innerHTML = `
                    <div class="absolute inset-0 bg-cover bg-center" style="background-image: url('${card.art}');"></div>
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
                        <button class="move-btn flex-1 text-cyan-300 text-[10px] leading-none flex items-center justify-center hover:bg-cyan-500/20 active:bg-cyan-500/40" data-dir="-1" aria-label="Subir carta" ${idx === 0 ? 'disabled' : ''}>▲</button>
                        <button class="move-btn flex-1 text-slate-300 text-[10px] leading-none flex items-center justify-center hover:bg-slate-500/20 active:bg-slate-500/40 border-y border-slate-600/50" data-dir="1" aria-label="Bajar carta" ${idx === playerDeck.length - 1 ? 'disabled' : ''}>▼</button>
                        <button class="remove-btn flex-1 text-red-400 text-[10px] leading-none flex items-center justify-center hover:bg-red-500/20 active:bg-red-500/40" aria-label="Quitar del mazo">✕</button>
                    </div>
                `;
                item.querySelectorAll('.move-btn').forEach(btn => {
                    btn.onclick = (e) => { e.stopPropagation(); moveDeckCard(idx, parseInt(btn.dataset.dir)); };
                });
                item.querySelector('.remove-btn').onclick = (e) => { e.stopPropagation(); removeCardFromDeck(card.id); };
                container.appendChild(item);
            });
        }

        function renderCollection() {
            let container = document.getElementById('collection-container');
            container.innerHTML = '';
            let availableCards = ALL_CARDS.filter(card => !playerDeck.some(d => d.id === card.id));

            if (availableCards.length === 0) {
                container.innerHTML = `<div class="text-center text-slate-500 text-xs p-4">Todas las cartas están en tu mazo.</div>`;
                return;
            }

            // Mismo aspecto que las tiras del mazo (columna izquierda): arte,
            // degradado, coste cian y medallas ATK/HP; el "+" vive en la
            // columna de control de la derecha de la tira.
            availableCards.forEach((card) => {
                let el = document.createElement('div');
                el.className = "relative rounded-lg overflow-hidden border border-slate-700 cursor-grab hover:border-blue-500 transition-colors h-14";
                el.draggable = true;
                el.ondragstart = (e) => handleDragStart(e, card.id, 'collection');
                el.ondragend = handleDragEnd;
                el.ondragover = (e) => { e.preventDefault(); el.classList.add('border-cyan-400'); };
                el.ondragleave = (e) => { el.classList.remove('border-cyan-400'); };
                el.onclick = () => openCardModal(card.id);

                el.innerHTML = `
                    <div class="absolute inset-0 bg-cover bg-center" style="background-image: url('${card.art}');"></div>
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
                el.querySelector('.add-btn').onclick = (e) => { e.stopPropagation(); addCardToDeck(card.id); };
                container.appendChild(el);
            });
        }
