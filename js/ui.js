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
            
            // Configurar el Tipo (SER o EVENTO)
            let kindBadge = document.getElementById('modal-card-kind');
            kindBadge.innerText = card.kind.toUpperCase();
            
            let typeIcon = document.getElementById('modal-card-type-icon');
            let typeText = document.getElementById('modal-card-type');
            
            if (card.kind === 'Ser') {
                kindBadge.className = "text-[9px] bg-blue-900/80 text-blue-200 px-1.5 py-0.5 rounded border border-blue-600 backdrop-blur-sm";
                typeIcon.className = "fa-solid fa-shield-halved text-[8px] text-blue-400";
                typeText.innerText = "SER";
                typeText.className = "text-blue-400 text-[8px] font-bold uppercase tracking-wider";
                
                document.getElementById('modal-card-atk').innerText = card.atk;
                document.getElementById('modal-card-hp').innerText = card.hp;
                document.getElementById('modal-card-atk').style.display = 'flex';
                document.getElementById('modal-card-hp').style.display = 'flex';
            } else {
                kindBadge.className = "text-[9px] bg-amber-900/80 text-amber-200 px-1.5 py-0.5 rounded border border-amber-600 backdrop-blur-sm";
                typeIcon.className = "fa-solid fa-bolt text-[8px] text-amber-400";
                typeText.innerText = "EVENTO";
                typeText.className = "text-amber-400 text-[8px] font-bold uppercase tracking-wider";
                
                document.getElementById('modal-card-atk').style.display = 'none';
                document.getElementById('modal-card-hp').style.display = 'none';
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
            document.getElementById('turn-counter').innerText = Math.max(1, gameState.turn);
            document.getElementById('p1-score').innerText = gameState.p1.score;
            document.getElementById('p2-score').innerText = gameState.p2.score;

            let total = gameState.p1.score + gameState.p2.score;
            let p1Pct = total === 0 ? 50 : Math.min(95, Math.max(5, (gameState.p1.score / total) * 100));
            document.getElementById('p1-bar').style.width = `${p1Pct}%`;
            document.getElementById('p2-bar').style.width = `${100 - p1Pct}%`;

            document.getElementById('p1-energy-badge').innerText = gameState.p1.energy;
            document.getElementById('p2-energy-badge').innerText = gameState.p2.energy;

            let p1Next = playerDeck[gameState.p1.deckPointer];
            document.getElementById('p1-next-card-name').innerText = p1Next ? p1Next.name : "No quedan cartas";
            document.getElementById('p1-next-icon').className = p1Next ? `fa-solid ${p1Next.icon} text-xs` : "fa-solid fa-ban text-xs opacity-50";

            let p2Next = rivalDeck[gameState.p2.deckPointer];
            document.getElementById('p2-next-card-name').innerText = p2Next ? p2Next.name : "No quedan cartas";
            document.getElementById('p2-next-icon').className = p2Next ? `fa-solid ${p2Next.icon} text-xs` : "fa-solid fa-ban text-xs opacity-50";
        }

        function renderBoards() {
            let p1Board = document.getElementById('p1-board');
            p1Board.innerHTML = '';
            gameState.p1.activeBoard.forEach((card) => { 
                p1Board.appendChild(createCardElement(card, 'blue', gameState.justDeployed.includes(card.uid))); 
            });

            let p2Board = document.getElementById('p2-board');
            p2Board.innerHTML = '';
            gameState.p2.activeBoard.forEach((card) => { 
                p2Board.appendChild(createCardElement(card, 'purple', gameState.justDeployed.includes(card.uid))); 
            });
        }

        function createCardElement(card, theme, animate) {
            let cardDiv = document.createElement('div');
            let isBlue = theme === 'blue';
            let borderColor = isBlue ? 'border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'border-fuchsia-400 shadow-[0_0_10px_rgba(217,70,239,0.5)]';
            
            cardDiv.className = `w-full max-w-[160px] h-[60px] border-2 ${borderColor} rounded-lg relative overflow-hidden flex flex-col justify-between ${animate ? 'animate-deploy' : ''} cursor-pointer hover:scale-105 transition-transform`;
            cardDiv.onclick = () => openCardModal(card.id);
            
            let displayAtk = Math.max(0, card.atk + (card.tempAtkMod || 0));

            cardDiv.innerHTML = `
                <div class="absolute inset-0 bg-cover bg-center" style="background-image: url('${card.art}');"></div>
                <div class="absolute inset-x-0 top-0 h-5 bg-gradient-to-b from-black/75 to-transparent pointer-events-none"></div>
                <div class="absolute top-0.5 left-1 w-full text-[7px] text-white/90 font-bold truncate pointer-events-none px-1 drop-shadow-md">${card.name}</div>
                <div class="absolute bottom-1 right-1 flex gap-1 z-10 pointer-events-none">
                    <div class="w-5 h-5 rounded-full bg-blue-950/90 border border-cyan-400 flex items-center justify-center text-white font-bold text-[9px] shadow-lg">${displayAtk}</div>
                    <div class="w-5 h-5 rounded-full bg-red-950/90 border border-red-400 flex items-center justify-center text-white font-bold text-[9px] shadow-lg">${card.hp}</div>
                </div>
            `;
            return cardDiv;
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
            switchView('view-chapters');
        }

        function renderChapterSelect() {
            let container = document.getElementById('chapters-list');
            // A prueba de fallos: si algo rompe (p. ej. un JS viejo en caché)
            // se muestra un aviso visible en lugar de una lista vacía.
            try {
                let frag = document.createDocumentFragment();

                CHAPTERS.forEach((ch) => {
                    let done = isChapterCompleted(ch.id);
                    let item = document.createElement('div');
                    item.className = "active:scale-[0.98] transition-transform cursor-pointer";
                    item.onclick = () => openChapterIntro(ch.id);
                    item.innerHTML = `
                        <div class="relative rounded-xl overflow-hidden border-2 ${done ? 'border-amber-400/70 shadow-[0_0_15px_rgba(251,191,36,0.25)]' : 'border-blue-500/70 shadow-[0_0_15px_rgba(59,130,246,0.25)]'}">
                            <div class="aspect-[16/10] bg-cover bg-center" style="background-image:url('${ch.art}')"></div>
                            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/45"></div>
                            <div class="absolute top-2 left-3 right-3 flex items-center justify-between">
                                <span class="text-[9px] font-orbitron tracking-[0.25em] text-amber-300 font-bold">CAPÍTULO ${ch.number}</span>
                                ${done
                                    ? '<span class="text-[8px] bg-green-600/90 text-white px-1.5 py-0.5 rounded font-bold">✓ COMPLETADO</span>'
                                    : '<span class="text-[8px] bg-blue-600/90 text-white px-1.5 py-0.5 rounded font-bold">DISPONIBLE</span>'}
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

            switchView('view-chapter-intro');
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
        }
