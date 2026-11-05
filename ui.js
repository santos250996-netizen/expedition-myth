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
            document.getElementById('gameover-modal').classList.remove('hidden-view');
        }

        function closeGameOverModal() { document.getElementById('gameover-modal').classList.add('hidden-view'); }
        function closeGameOverAndRestart() { closeGameOverModal(); resetMatch(); startGame(); }
