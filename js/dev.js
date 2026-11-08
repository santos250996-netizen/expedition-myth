// --- MODO DESARROLLADOR (DEV) ---
// Panel flotante y barra de combate para testear sin rejugar todo.
// Solo se monta si isDevMode() === true. No escribe en localStorage
// del jugador (el override vive en state.js/chapters.js/deck.js).
// Activación: ?dev=1 en la URL. Desactivación: ?dev=0.

function mountDevUI() {
    if (!isDevMode()) return;
    if (!document.getElementById('dev-toggle-btn')) {
        let btn = document.createElement('button');
        btn.id = 'dev-toggle-btn';
        btn.innerText = 'DEV';
        btn.className = 'fixed top-2 right-2 z-[70] bg-red-600 text-white font-orbitron font-black text-xs px-3 py-1.5 rounded-full shadow-lg border-2 border-red-300 active:scale-95';
        btn.onclick = () => toggleDevPanel();
        document.body.appendChild(btn);
    }
    if (!document.getElementById('dev-panel')) {
        let panel = document.createElement('div');
        panel.id = 'dev-panel';
        panel.className = 'fixed inset-0 bg-black/80 z-[80] hidden items-center justify-center p-4';
        panel.innerHTML = `
            <div class="bg-slate-900 border-2 border-red-500 rounded-xl p-4 w-full max-w-sm max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-3">
                    <span class="text-red-400 font-orbitron font-black text-sm tracking-widest">MODO DEV</span>
                    <button onclick="toggleDevPanel()" class="text-slate-400 hover:text-white text-xl">&times;</button>
                </div>
                <div class="space-y-2 text-xs">
                    <div class="bg-slate-800 rounded-lg p-2">
                        <div class="text-amber-300 font-bold mb-1">Overrides activos:</div>
                        <div class="text-slate-300">✓ Todos los capítulos desbloqueados</div>
                        <div class="text-slate-300">✓ Todas las cartas poseídas</div>
                        <div class="text-slate-300 text-[10px] mt-1 italic">(no se guardan en localStorage)</div>
                    </div>
                    <button onclick="devForceReward(true)" class="w-full bg-green-700 hover:bg-green-600 text-white font-bold py-2 rounded-lg">Forzar recompensa GANAR (33%)</button>
                    <button onclick="devForceReward(false)" class="w-full bg-orange-700 hover:bg-orange-600 text-white font-bold py-2 rounded-lg">Forzar recompensa PERDER (15%)</button>
                    <button onclick="devResetMatch()" class="w-full bg-blue-700 hover:bg-blue-600 text-white font-bold py-2 rounded-lg">Reset partida actual</button>
                    <button onclick="devShowState()" class="w-full bg-purple-700 hover:bg-purple-600 text-white font-bold py-2 rounded-lg">Ver estado del combate</button>
                    <button onclick="devJumpToChapter()" class="w-full bg-cyan-700 hover:bg-cyan-600 text-white font-bold py-2 rounded-lg">Ir a capítulo/evento...</button>
                    <button onclick="openPatchNotes()" class="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-2 rounded-lg">Notas del parche</button>
                    <button onclick="openDevBotDecks()" class="w-full bg-indigo-700 hover:bg-indigo-600 text-white font-bold py-2 rounded-lg">Mazos de bots (dev)</button>
                    <button onclick="devDisable()" class="w-full bg-red-800 hover:bg-red-700 text-white font-bold py-2 rounded-lg">Desactivar modo dev</button>
                </div>
            </div>
        `;
        document.body.appendChild(panel);
    }
    if (!document.getElementById('dev-combat-bar')) {
        let bar = document.createElement('div');
        bar.id = 'dev-combat-bar';
        bar.className = 'fixed bottom-20 left-2 right-2 z-[65] hidden bg-slate-950/95 border-2 border-red-500 rounded-xl p-2 flex gap-1';
        bar.innerHTML = `
            <button onclick="skipTurn()" class="flex-1 bg-slate-800 text-white text-[10px] font-bold py-1 rounded">Saltar turno</button>
            <button onclick="devShowState()" class="flex-1 bg-slate-800 text-white text-[10px] font-bold py-1 rounded">Estado</button>
            <button onclick="devForceReward(gameState.p1.score > gameState.p2.score)" class="flex-1 bg-slate-800 text-white text-[10px] font-bold py-1 rounded">Forzar drop</button>
            <button onclick="devResetMatch()" class="flex-1 bg-slate-800 text-white text-[10px] font-bold py-1 rounded">Reset</button>
        `;
        document.body.appendChild(bar);
    }
    updateDevCombatBar();
    let observer = new MutationObserver(() => updateDevCombatBar());
    document.querySelectorAll('.view-section').forEach(v => {
        observer.observe(v, { attributes: true, attributeFilter: ['class'] });
    });
}

function updateDevCombatBar() {
    let bar = document.getElementById('dev-combat-bar');
    if (!bar) return;
    let inGame = !document.getElementById('view-game').classList.contains('hidden-view');
    bar.classList.toggle('hidden', !inGame);
    let selectedLabel = devSelectedBotDeck ? 'Mazo: ' + devSelectedBotDeck.length + ' cartas' : 'Mazo: aleatorio';
    let info = document.getElementById('dev-selected-deck-label');
    if (!info) {
        info = document.createElement('div');
        info.id = 'dev-selected-deck-label';
        info.className = 'w-full text-center text-[8px] text-indigo-300 font-bold mt-1';
        bar.appendChild(info);
    }
    info.innerText = selectedLabel;
}

function toggleDevPanel() {
    let panel = document.getElementById('dev-panel');
    if (!panel) return;
    panel.classList.toggle('hidden');
    panel.classList.toggle('flex');
}

function devForceReward(win) {
    if (!currentChapter) { alert('No hay capítulo activo.'); return; }
    let deckSource = currentChapter.botDecks && currentChapter.botDecks[0]
        ? currentChapter.botDecks[0]
        : (currentChapter.botDeck || []);
    // En modo dev, ownedCardIds contiene TODAS las cartas (override), así que
    // filtrar por !ownedCardIds dejaría el array vacío. Para testear el modal
    // de recompensa, se elige una carta al azar del botDeck sin filtrar.
    if (deckSource.length === 0) { alert('El botDeck está vacío.'); return; }
    let newCardId = deckSource[Math.floor(Math.random() * deckSource.length)];
    if (!ownedCardIds.includes(newCardId)) ownedCardIds.push(newCardId);
    let cardData = ALL_CARDS.find(c => c.id === newCardId);
    // Renderizar el modal de recompensa (mismo que showGameOver usa).
    if (typeof renderRewardCard === 'function') {
        renderRewardCard(newCardId);
        let rc = document.getElementById('gameover-reward-card');
        if (rc) rc.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    alert('Recompensa forzada (' + (win ? 'ganar' : 'perder') + '): ' + (cardData ? cardData.name : newCardId));
}

function devResetMatch() {
    if (!currentChapter) { alert('No hay capítulo activo.'); return; }
    resetMatch();
    startGame();
    alert('Partida reiniciada.');
}

function devShowState() {
    let snap = devGetStateSnapshot();
    let text = JSON.stringify(snap, null, 2);
    let modal = document.getElementById('dev-state-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'dev-state-modal';
        modal.className = 'fixed inset-0 bg-black/90 z-[90] flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="bg-slate-900 border-2 border-purple-500 rounded-xl p-3 w-full max-w-md max-h-[80vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-purple-400 font-orbitron font-bold text-xs">ESTADO</span>
                    <button onclick="document.getElementById('dev-state-modal').remove()" class="text-slate-400 hover:text-white text-xl">&times;</button>
                </div>
                <pre id="dev-state-pre" class="text-[9px] text-slate-300 whitespace-pre-wrap font-mono"></pre>
            </div>
        `;
        document.body.appendChild(modal);
    }
    document.getElementById('dev-state-pre').innerText = text;
}

function devJumpToChapter() {
    let options = CHAPTERS.map((c, i) => (i + 1) + '. ' + (c.isEvent ? 'EVENTO ' : 'CAP ') + c.title).join('\n');
    let input = prompt('Ir a:\n' + options + '\n\nEscribe el número:');
    if (!input) return;
    let idx = parseInt(input) - 1;
    if (isNaN(idx) || idx < 0 || idx >= CHAPTERS.length) { alert('Número inválido.'); return; }
    let ch = CHAPTERS[idx];
    openChapterIntro(ch.id);
}

function devDisable() {
    setDevMode(false);
    alert('Modo dev desactivado. Recarga la página para salir.');
    location.search = '';
}

function openDevBotDecks() {
    let modal = document.getElementById('dev-botdecks-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'dev-botdecks-modal';
        modal.className = 'fixed inset-0 bg-black/90 z-[90] flex items-center justify-center p-3';
        document.body.appendChild(modal);
    }
    renderDevBotDecks();
    modal.classList.remove('hidden');
}

function closeDevBotDecks() {
    let modal = document.getElementById('dev-botdecks-modal');
    if (modal) modal.classList.add('hidden');
}

function renderDevBotDecks() {
    let modal = document.getElementById('dev-botdecks-modal');
    if (!modal) return;
    let devDecks = getDevBotDecks();
    let chapters = CHAPTERS.filter(c => c.botDecks || c.botDeck);
    let html = '<div class="bg-slate-900 border-2 border-indigo-500 rounded-xl p-3 w-full max-w-md max-h-[90vh] overflow-y-auto">';
    html += '<div class="flex justify-between items-center mb-3"><span class="text-indigo-400 font-orbitron font-black text-sm tracking-widest">MAZOS DE BOTS (DEV)</span><button onclick="closeDevBotDecks()" class="text-slate-400 hover:text-white text-xl">&times;</button></div>';
    chapters.forEach(ch => {
        let originalOrders = ch.botDecks || [ch.botDeck];
        let chapterDevDecks = devDecks[ch.id] || {};
        let orderNames = Object.keys(chapterDevDecks).length > 0 ? Object.keys(chapterDevDecks) : originalOrders.map((_, i) => ['aggressive','defensive','balanced'][i] || ('order' + i));
        html += '<div class="mb-4 bg-slate-800 rounded-lg p-2">';
        html += '<div class="text-amber-300 font-orbitron font-bold text-xs mb-2">' + ch.title + ' (' + ch.id + ')</div>';
        orderNames.forEach((orderName, idx) => {
            let deck = chapterDevDecks[orderName] || originalOrders[idx] || [];
            html += '<div class="mb-2">';
            html += '<div class="flex justify-between items-center mb-1"><span class="text-slate-300 text-[10px] font-bold">' + orderName + '</span>';
            html += '<div class="flex gap-1">';
            html += '<button onclick="devSelectBotDeck(\'' + ch.id + '\',\'' + orderName + '\')" class="bg-green-700 text-white text-[9px] px-2 py-1 rounded">Usar</button>';
            html += '<button onclick="devExportBotDeck(\'' + ch.id + '\',\'' + orderName + '\')" class="bg-blue-700 text-white text-[9px] px-2 py-1 rounded">Exportar</button>';
            html += '</div></div>';
            html += '<div class="flex flex-wrap gap-1">';
            deck.forEach((cardId, i) => {
                let card = ALL_CARDS.find(c => c.id === cardId);
                let name = card ? card.name : cardId;
                html += '<span class="bg-slate-700 text-white text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1">' + name;
                html += '<button onclick="devMoveBotDeckCard(\'' + ch.id + '\',\'' + orderName + '\',' + i + ',-1)" class="text-cyan-300">▲</button>';
                html += '<button onclick="devMoveBotDeckCard(\'' + ch.id + '\',\'' + orderName + '\',' + i + ',1)" class="text-cyan-300">▼</button>';
                html += '</span>';
            });
            html += '</div></div>';
        });
        html += '<button onclick="devCreateBotDeck(\'' + ch.id + '\')" class="w-full bg-purple-700 text-white text-[10px] font-bold py-1 rounded mt-1">+ Crear mazo nuevo</button>';
        html += '</div>';
    });
    html += '<button onclick="devResetBotDecks()" class="w-full bg-red-800 text-white text-[10px] font-bold py-2 rounded mt-2">Resetear mazos de bots</button>';
    html += '</div>';
    modal.innerHTML = html;
}

function devSelectBotDeck(chapterId, orderName) {
    let devDecks = getDevBotDecks();
    let deck = devDecks[chapterId] && devDecks[chapterId][orderName];
    if (!deck) {
        let ch = CHAPTERS.find(c => c.id === chapterId);
        let idx = ['aggressive','defensive','balanced'].indexOf(orderName);
        let original = ch.botDecks ? ch.botDecks[idx] : ch.botDeck;
        deck = original || [];
    }
    devSelectedBotDeck = [...deck];
    alert('Mazo seleccionado: ' + orderName + ' (' + deck.length + ' cartas).');
    closeDevBotDecks();
    updateDevCombatBar();
}

function devMoveBotDeckCard(chapterId, orderName, index, dir) {
    let devDecks = getDevBotDecks();
    let ch = CHAPTERS.find(c => c.id === chapterId);
    let idx = ['aggressive','defensive','balanced'].indexOf(orderName);
    let original = ch.botDecks ? ch.botDecks[idx] : ch.botDeck;
    if (!devDecks[chapterId]) devDecks[chapterId] = {};
    if (!devDecks[chapterId][orderName]) devDecks[chapterId][orderName] = [...(original || [])];
    let deck = devDecks[chapterId][orderName];
    let target = index + dir;
    if (target < 0 || target >= deck.length) return;
    let [moved] = deck.splice(index, 1);
    deck.splice(target, 0, moved);
    saveDevBotDecks(devDecks);
    renderDevBotDecks();
}

function devCreateBotDeck(chapterId) {
    let name = prompt('Nombre del nuevo mazo (ej. mazo4):');
    if (!name) return;
    let devDecks = getDevBotDecks();
    if (!devDecks[chapterId]) devDecks[chapterId] = {};
    devDecks[chapterId][name] = [];
    saveDevBotDecks(devDecks);
    renderDevBotDecks();
    alert('Mazo "' + name + '" creado (vacío).');
}

function devExportBotDeck(chapterId, orderName) {
    let devDecks = getDevBotDecks();
    let ch = CHAPTERS.find(c => c.id === chapterId);
    let idx = ['aggressive','defensive','balanced'].indexOf(orderName);
    let deck = (devDecks[chapterId] && devDecks[chapterId][orderName]) || (ch.botDecks ? ch.botDecks[idx] : ch.botDeck) || [];
    let json = JSON.stringify(deck);
    if (navigator.clipboard) {
        navigator.clipboard.writeText(json).then(() => {
            alert('Mazo exportado al portapapeles:\n\n' + json);
        }).catch(() => {
            prompt('Copia este JSON en chapters.js:', json);
        });
    } else {
        prompt('Copia este JSON en chapters.js:', json);
    }
}

function devResetBotDecks() {
    if (!confirm('¿Resetear todos los mazos de bots a los originales?')) return;
    safeStorageSet('nexo_dev_botdecks_v1', '{}');
    devSelectedBotDeck = null;
    renderDevBotDecks();
    alert('Mazos de bots reseteados.');
    updateDevCombatBar();
}
