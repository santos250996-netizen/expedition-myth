// --- ARRANQUE Y NAVEGACIÓN ---
// Cambio de vistas, sincronización de controles e inicialización.
        // --- NAVEGACIÓN ---
        function switchView(viewId) {
            // FIX: al salir del combate hay que parar el timer y ocultar la pausa,
            // si no el juego seguía corriendo en segundo plano tras volver al menú.
            if (viewId !== 'view-game') {
                pauseGame();
                document.getElementById('pause-overlay').classList.add('hidden-view');
            }
            document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden-view'));
            document.getElementById(viewId).classList.remove('hidden-view');
            // Fondo de capítulo en cada cambio de pantalla: combate → capítulo
            // en juego; resto de UIs → capítulo más avanzado del jugador.
            updateGlobalBackground(viewId);
            if (viewId === 'view-home') updateHomeChapterLabel();
            if (viewId === 'view-game') resetMatch();
            if (viewId === 'view-chapters') renderChapterSelect();
            if (viewId === 'view-deckbuilder') { renderDeckEditor(); renderCollection(); }
            if (viewId === 'view-decks') document.getElementById('deck-count-label').innerText = playerDeck.length;
        }

        // --- CONTROLES DE REPRODUCCIÓN (estado centralizado) ---
        function syncControls() {
            document.getElementById('lbl-play-pause').innerText = gameState.isPlaying ? "PAUSA" : "SEGUIR";
            document.getElementById('icon-pause-game').className = gameState.isPlaying ? "fa-solid fa-pause text-sm" : "fa-solid fa-play text-sm";
        }
        window.onload = () => {
            loadDeck();
            document.getElementById('deck-count-label').innerText = playerDeck.length;
            updateHUD();
            renderBoards();
            updateGlobalBackground('view-home');
            updateHomeChapterLabel();
        };
