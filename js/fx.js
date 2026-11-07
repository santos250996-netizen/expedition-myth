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
        // azul=invocación, morado=debuff, gris=laberinto).
        function playQueuedFx() {
            if (!Array.isArray(gameState.fxQueue)) return;
            gameState.fxQueue.forEach((fx, i) => {
                // Micro-pausa dramática: cada FX se materializa con un pequeño retardo
                // incremental (solo visual, no pausa el tick). Se acorta con --fx-k.
                let delay = Math.round(i * 60 * fxK());
                setTimeout(() => {
                    try {
                        switch (fx.t) {
                            case 'cast':
                                fxEventCast(fx.card, fx.side);
                                break;
                            case 'gloria':
                                fxGloriaBeam(fx.side, 'fx-beam-soft');
                                fxFlash(fx.uid, 'gold');
                                fxFloatOver(fx.side, fx.uid, fx.text, 'fx-gold fx-float-big', fx.icon);
                                fxScorePop(fx.side, fx.num);
                                break;
                            case 'buff':
                                fxFlash(fx.uid, 'green');
                                fxFloatOver(fx.side, fx.uid, fx.text, 'fx-green fx-float-big', fx.icon);
                                break;
                            case 'debuff':
                                fxFlash(fx.uid, 'purple');
                                if (fx.overlay === 'fog') fxOverlayOnCard(fx.uid, 'fx-fog-ov');
                                if (fx.overlay === 'tears') fxOverlayOnCard(fx.uid, 'fx-tears-ov');
                                if (fx.overlay === 'leaf') fxOverlayOnCard(fx.uid, 'fx-leaf-ov');
                                if (fx.overlay === 'hit') fxOverlayOnCard(fx.uid, 'fx-hit-ov');
                                fxFloatOver(fx.side, fx.uid, fx.text, (fx.cls || 'fx-red') + ' fx-float-big', fx.icon);
                                break;
                            case 'clash':
                                // Embestida: flash rojo en ambas cartas + sacudida fuerte.
                                fxFlash(fx.uidA, 'red');
                                fxFlash(fx.uidB, 'red');
                                fxShakeHard(fx.uidB);
                                fxOverlayOnCard(fx.uidA, 'fx-hit-ov');
                                fxOverlayOnCard(fx.uidB, 'fx-hit-ov');
                                fxFloatOver(fx.side, fx.uidB, '-1 HP', 'fx-red fx-float-big', 'fa-heart-crack');
                                fxFloatOver(fx.side, fx.uidA, '-1 HP', 'fx-red fx-float-big', 'fa-heart-crack');
                                break;
                            case 'sacrifice':
                                fxFlash(fx.uid, 'red');
                                fxOverlayOnCard(fx.uid, 'fx-blood-ov');
                                fxShakeHard(fx.uid);
                                break;
                            case 'wave':
                                fxLeafWave(fx.side);
                                // Flash rojo en todas las cartas del tablero afectado.
                                let board = boardEl(fx.side);
                                if (board) board.querySelectorAll('[data-uid]').forEach(el => {
                                    let uid = el.dataset.uid;
                                    if (uid) fxFlash(uid, 'red');
                                });
                                break;
                            case 'discount':
                                fxDiscountPop(fx.side, fx.text || '−1');
                                break;
                            case 'laberinto':
                                // Atrapar: encoge + oscurece + icono. SIN texto.
                                fxLaberintoTrap(fx.uid);
                                break;
                            case 'liberado':
                                // Liberar: vuelve a tamaño + flash verde.
                                fxLaberintoRelease(fx.uid);
                                break;
                            case 'summon':
                                // Invocación: la carta cae con rebote + flash azul.
                                fxDropIn(fx.uid);
                                fxFlash(fx.uid, 'blue');
                                fxFloatOver(fx.side, fx.uid, 'INVOCADO', 'fx-blue fx-float-big', 'fa-wand-sparkles');
                                break;
                        }
                    } catch (e) { console.error('fx:', e); }
                }, delay);
            });
            gameState.fxQueue = [];
        }

        // --- HELPERS FX MEJORADOS ---
        // Flash de color sobre la carta (sin texto). Colores por tipo de efecto.
        function fxFlash(uid, color) {
            let el = cardElByUid(uid);
            if (!el) return;
            let cls = 'fx-flash-' + color;
            el.classList.remove('fx-flash-red','fx-flash-green','fx-flash-purple','fx-flash-gold','fx-flash-blue','fx-flash-gray');
            void el.offsetWidth;
            el.classList.add(cls);
            setTimeout(() => el.classList.remove(cls), fxDurationMs(0.7));
        }

        // Laberinto: encoge + oscurece + icono grande (sin texto). Se queda así
        // mientras dure el atrapamiento (la clase no se quita hasta fxLiberado).
        function fxLaberintoTrap(uid) {
            let el = cardElByUid(uid);
            if (!el) return;
            el.classList.add('fx-lab');
            let icon = document.createElement('div');
            icon.className = 'fx-lab-icon';
            icon.innerHTML = '<i class="fa-solid fa-maze"></i>';
            el.appendChild(icon);
            fxFlash(uid, 'gray');
        }

        // Laberinto liberado: vuelve a tamaño + flash verde + quita icono.
        function fxLaberintoRelease(uid) {
            let el = cardElByUid(uid);
            if (!el) return;
            el.classList.remove('fx-lab');
            el.classList.add('fx-liberado');
            let icon = el.querySelector('.fx-lab-icon');
            if (icon) icon.remove();
            setTimeout(() => el.classList.remove('fx-liberado'), fxDurationMs(0.7));
        }

        // Invocación: la carta cae desde arriba con rebote.
        function fxDropIn(uid) {
            let el = cardElByUid(uid);
            if (!el) return;
            el.classList.add('fx-drop-in');
            setTimeout(() => el.classList.remove('fx-drop-in'), fxDurationMs(0.6));
        }

        // Sacudida fuerte para Embestida.
        function fxShakeHard(uid) {
            let el = cardElByUid(uid);
            if (!el) return;
            el.classList.add('fx-shake-hard');
            setTimeout(() => el.classList.remove('fx-shake-hard'), fxDurationMs(0.5));
        }
