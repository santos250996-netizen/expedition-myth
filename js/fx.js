// --- SISTEMA DE EFECTOS VISUALES (FX) ---
// Los efectos de las cartas encolan eventos en gameState.fxQueue durante el
// tick y playQueuedFx() los materializa DESPUÉS de renderBoards() (el render
// reconstruye el DOM en cada tick, así que aplicarlos antes sería borrarlos).
// La velocidad de partida escala la duración vía la variable CSS --fx-k.

        // Multiplicador de duración según la velocidad (1x, 2x, 4x).
        function fxK() {
            return gameState.speed === 4 ? 0.4 : (gameState.speed === 2 ? 0.65 : 1);
        }

        function applyFxSpeed() {
            document.body.style.setProperty('--fx-k', fxK());
        }

        function fxDurationMs(baseSec) {
            return Math.round(baseSec * 1000 * fxK());
        }

        function queueFx(fx) {
            if (Array.isArray(gameState.fxQueue)) gameState.fxQueue.push(fx);
        }

        function sideOf(player) { return player === gameState.p2 ? 'p2' : 'p1'; }

        function boardEl(side) { return document.getElementById(side + '-board'); }

        function cardElByUid(uid) {
            return uid ? document.querySelector(`[data-uid="${uid}"]`) : null;
        }

        // Texto flotante anclado al tablero DONDE VIVE la carta objetivo (las
        // cartas tienen overflow-hidden y offsetLeft es relativo a su propio
        // tablero; sin uid se usa el lado indicado como fallback).
        function fxFloatOver(side, uid, text, cls, icon) {
            let el = cardElByUid(uid);
            let board = el ? el.parentElement : boardEl(side);
            if (!board) return;
            let wrap = document.createElement('div');
            wrap.className = 'fx-float-wrap';
            wrap.style.left = (el ? el.offsetLeft + el.offsetWidth / 2 : board.offsetWidth / 2) + 'px';
            wrap.style.top = (el ? el.offsetTop + el.offsetHeight / 3 : board.offsetHeight / 2) + 'px';
            wrap.innerHTML = `<span class="fx-float ${cls}">${icon ? `<i class="fa-solid ${icon}"></i> ` : ''}${text}</span>`;
            board.appendChild(wrap);
            setTimeout(() => wrap.remove(), fxDurationMs(0.95));
        }

        // Capa animada DENTRO de la carta (niebla, lágrimas, flash...).
        // Si ya hay una capa del mismo tipo se reemplaza: evita apilar
        // overlays y garantiza que la animación se vea en cada aplicación.
        function fxOverlayOnCard(uid, cls, innerHtml) {
            let el = cardElByUid(uid);
            if (!el) return;
            let old = el.querySelector(':scope > .fx-overlay.' + cls);
            if (old) old.remove();
            let ov = document.createElement('div');
            ov.className = 'fx-overlay ' + cls;
            if (innerHtml) ov.innerHTML = innerHtml;
            el.appendChild(ov);
        }

        // Clase de animación sobre la carta (pulso, embestida, temblor...).
        // Se reinicia la clase: si ya estaba aplicada, la animación CSS no
        // volvería a verse (el choque de Embestida y el pulso del Sátiro
        // ocurren CADA inicio de turno y deben notarse cada vez).
        function fxClassOnCard(uid, cls) {
            let el = cardElByUid(uid);
            if (!el) return;
            el.classList.remove(cls);
            void el.offsetWidth; // forzar reflow para reiniciar la animación
            el.classList.add(cls);
        }

        // Proyección de carta-evento sobre el tablero de quien la castea:
        // es la forma de dar cuerpo a cartas que nunca entran al tablero.
        function fxEventCast(cardTpl, side) {
            let board = boardEl(side);
            if (!board) return;
            let proj = document.createElement('div');
            proj.className = 'fx-event-cast';
            proj.innerHTML = `
                <div class="fx-event-art" style="background-image:url('${cardTpl.art}')"></div>
                <div class="fx-event-shine"></div>
                <div class="fx-event-name"><i class="fa-solid ${cardTpl.icon}"></i> ${cardTpl.name}</div>`;
            board.appendChild(proj);
            setTimeout(() => proj.remove(), fxDurationMs(1.15));
        }

        // Haz de luz dorado que asciende (Puntos de Gloria).
        function fxGloriaBeam(side, cls) {
            let board = boardEl(side);
            if (!board) return;
            let beam = document.createElement('div');
            beam.className = 'fx-gloria-beam ' + (cls || '');
            board.appendChild(beam);
            setTimeout(() => beam.remove(), fxDurationMs(0.9));
        }

        // Contador flotante "+N" anclado al número del marcador: la gloria
        // instantánea de los Eventos se ve SUBIR en su sitio (además del
        // conteo animado del marcador).
        function fxScorePop(side, amount) {
            let el = document.getElementById(side + '-score');
            if (!el || !amount) return;
            let row = el.parentElement;
            let pop = document.createElement('span');
            pop.className = 'fx-float fx-gold fx-score-pop';
            pop.innerHTML = `+${amount} <i class="fa-solid fa-star" style="font-size:9px"></i>`;
            pop.style.left = (el.offsetLeft + el.offsetWidth / 2) + 'px';
            pop.style.top = (el.offsetTop - 4) + 'px';
            row.appendChild(pop);
            setTimeout(() => pop.remove(), fxDurationMs(1.05));
        }

        // Oleada de hojas que barre la fila (Ecos de Dodona).
        function fxLeafWave(side) {
            let board = boardEl(side);
            if (!board) return;
            let wave = document.createElement('div');
            wave.className = 'fx-wave';
            let leaves = '';
            for (let i = 0; i < 7; i++) {
                leaves += `<i class="fa-solid fa-leaf fx-leaf" style="top:${8 + i * 11}%; animation-delay:${i * 0.06}s;"></i>`;
            }
            wave.innerHTML = leaves;
            board.appendChild(wave);
            setTimeout(() => wave.remove(), fxDurationMs(1));
        }

        // Aviso "−1⚡" junto al contador de energía (descuento del Oráculo):
        // grande, con brillo propio y pulso verde del badge para que se
        // distinga de un vistazo.
        function fxDiscountPop(side, text) {
            let badge = document.getElementById(side + '-energy-badge');
            if (!badge) return;
            badge.classList.remove('fx-badge-pulse');
            void badge.offsetWidth;
            badge.classList.add('fx-badge-pulse');
            let pop = document.createElement('span');
            pop.className = 'fx-float fx-green fx-at-badge fx-discount-pop';
            pop.innerHTML = `${text} <i class="fa-solid fa-bolt"></i>`;
            badge.appendChild(pop);
            setTimeout(() => pop.remove(), fxDurationMs(1.1));
        }

        // Materializa la cola: un único punto por tipo para mantener
        // consistencia visual (colores: verde=buff, rojo=daño, dorado=gloria,
        // gris=niebla/debuff neutro).
        function playQueuedFx() {
            if (!Array.isArray(gameState.fxQueue)) return;
            gameState.fxQueue.forEach(fx => {
                try {
                    switch (fx.t) {
                        case 'cast':
                            fxEventCast(fx.card, fx.side);
                            break;
                        case 'gloria':
                            fxGloriaBeam(fx.side, 'fx-beam-soft');
                            fxFloatOver(fx.side, fx.uid, fx.text, 'fx-gold', fx.icon);
                            fxScorePop(fx.side, fx.num);
                            break;
                        case 'buff':
                            fxClassOnCard(fx.uid, 'fx-pulse-green');
                            fxFloatOver(fx.side, fx.uid, fx.text, 'fx-green', fx.icon);
                            break;
                        case 'debuff':
                            fxClassOnCard(fx.uid, fx.pulse || 'fx-pulse-gray');
                            if (fx.overlay === 'fog') fxOverlayOnCard(fx.uid, 'fx-fog-ov');
                            if (fx.overlay === 'tears') fxOverlayOnCard(fx.uid, 'fx-tears-ov');
                            if (fx.overlay === 'leaf') fxOverlayOnCard(fx.uid, 'fx-leaf-ov');
                            fxFloatOver(fx.side, fx.uid, fx.text, fx.cls || 'fx-red', fx.icon);
                            break;
                        case 'clash':
                            fxClassOnCard(fx.uidA, fx.side === 'p1' ? 'fx-clash-r' : 'fx-clash-l');
                            fxOverlayOnCard(fx.uidA, 'fx-hit-ov');
                            fxOverlayOnCard(fx.uidB, 'fx-hit-ov');
                            fxClassOnCard(fx.uidB, 'fx-shake');
                            fxFloatOver(fx.side, fx.uidB, '-1 HP', 'fx-red', 'fa-heart-crack');
                            fxFloatOver(fx.side, fx.uidA, '-1 HP', 'fx-red', 'fa-heart-crack');
                            break;
                        case 'sacrifice':
                            fxOverlayOnCard(fx.uid, 'fx-blood-ov');
                            fxClassOnCard(fx.uid, 'fx-shake');
                            break;
                        case 'wave':
                            fxLeafWave(fx.side);
                            break;
                        case 'discount':
                            fxDiscountPop(fx.side, fx.text || '−1');
                            break;
                    }
                } catch (e) { console.error('fx:', e); }
            });
            gameState.fxQueue = [];
        }
