// --- SISTEMA DE AUDIO ---
// Reproductor de efectos de sonido (SFX). Sin dependencias
// externas. Cache de Audio objects para no recrearlos.

const SFX_CACHE = {};
const SFX_VOLUME_DEFAULT = 0.5;

function getSfxVolume() {
    let raw = safeStorageGet('nexo_sfx_vol');
    if (raw === null || raw === undefined) return SFX_VOLUME_DEFAULT;
    let v = parseFloat(raw);
    if (isNaN(v)) return SFX_VOLUME_DEFAULT;
    return Math.max(0, Math.min(1, v / 100));
}

function setSfxVolume(value) {
    safeStorageSet('nexo_sfx_vol', value);
    for (let name in SFX_CACHE) {
        if (SFX_CACHE[name]) SFX_CACHE[name].volume = getSfxVolume();
    }
}

function getSfxPath(name) {
    let base = 'assets/audio/';
    let keywordNames = ['dano','debilitar','fortalecer','blindar','gloria','destruir','exilio','invocar','inmune','descuento','bloqueo','reflejo'];
    let triggerNames = ['al_entrar','inicio_turno','al_morir','embestida','enfurecer','sacrificio'];
    let baseNames = ['carta_jugada','turno'];
    if (keywordNames.includes(name)) return base + 'keywords/' + name + '.ogg';
    if (triggerNames.includes(name)) return base + 'triggers/' + name + '.ogg';
    if (baseNames.includes(name)) return base + 'base/' + name + '.ogg';
    return null;
}

function playSfx(name) {
    let path = getSfxPath(name);
    if (!path) return;
    let audio = SFX_CACHE[name];
    if (!audio) {
        audio = new Audio(path);
        audio.preload = 'auto';
        audio.volume = getSfxVolume();
        SFX_CACHE[name] = audio;
    }
    try {
        audio.currentTime = 0;
        audio.play().catch(() => {});
    } catch (e) {}
}

function preloadSfx() {
    let names = ['dano','debilitar','fortalecer','blindar','gloria','destruir','exilio','invocar','inmune','descuento','bloqueo','reflejo','al_entrar','inicio_turno','al_morir','embestida','enfurecer','sacrificio','carta_jugada','turno'];
    names.forEach(name => {
        let path = getSfxPath(name);
        if (!path) return;
        if (!SFX_CACHE[name]) {
            let audio = new Audio(path);
            audio.preload = 'auto';
            audio.volume = getSfxVolume();
            SFX_CACHE[name] = audio;
        }
    });
}

// --- MUSICA DE FONDO (BGM) v1.11.1 ---
// Canal separado del de SFX. Reproduce una BGM en loop (o una sola vez)
// con fade in/out entre pistas. El slider "Musica" de Opciones llama a
// setMusicVolume (nexo_music_vol, 0-100), que solo afecta a la BGM.

let BGM_CURRENT = null;        // nombre de la BGM actual
let BGM_AUDIO = null;          // objeto Audio actual
let BGM_FADE_TIMER = null;     // timer del fade
let BGM_GESTURE_HOOKED = false;

function getMusicVolume() {
    let raw = safeStorageGet('nexo_music_vol');
    if (raw === null || raw === undefined) return 0.5;
    let v = parseFloat(raw);
    if (isNaN(v)) return 0.5;
    return Math.max(0, Math.min(1, v / 100));
}

function setMusicVolume(value) {
    safeStorageSet('nexo_music_vol', value);
    if (BGM_AUDIO) {
        BGM_AUDIO.volume = getMusicVolume();
    }
}

function getBgmPath(name) {
    return 'assets/audio/bgm/bgm_' + name + '.ogg';
}

function playBgm(name, options) {
    // name: 'menu', 'combate', 'victoria', 'derrota'
    // options: { loop: true/false, fadeIn: ms, fadeOut: ms }
    if (BGM_CURRENT === name) return; // ya esta sonando
    let opts = options || {};
    let loop = opts.loop !== undefined ? opts.loop : (name === 'menu' || name === 'combate');
    let fadeIn = opts.fadeIn !== undefined ? opts.fadeIn : 800;
    let fadeOut = opts.fadeOut !== undefined ? opts.fadeOut : 600;

    // Fade out de la BGM actual (si hay)
    if (BGM_AUDIO) {
        let oldAudio = BGM_AUDIO;
        let oldVol = oldAudio.volume;
        let steps = 20;
        let stepTime = fadeOut / steps;
        let step = 0;
        let fadeOutTimer = setInterval(() => {
            step++;
            oldAudio.volume = Math.max(0, oldVol * (1 - step / steps));
            if (step >= steps) {
                clearInterval(fadeOutTimer);
                oldAudio.pause();
                oldAudio.currentTime = 0;
            }
        }, stepTime);
    }

    // Fade in de la nueva BGM
    let audio = new Audio(getBgmPath(name));
    audio.loop = loop;
    audio.volume = 0;
    audio.preload = 'auto';
    BGM_AUDIO = audio;
    BGM_CURRENT = name;

    // Autoplay: si el navegador rechaza el arranque sin gesto, se engancha
    // el primer pointerdown/keydown/touchstart y ahi re-intenta (v1.11.1).
    audio.play().catch(() => hookBgmGesture(audio));

    let targetVol = getMusicVolume();
    let steps = 20;
    let stepTime = fadeIn / steps;
    let step = 0;
    if (BGM_FADE_TIMER) clearInterval(BGM_FADE_TIMER);
    BGM_FADE_TIMER = setInterval(() => {
        step++;
        audio.volume = Math.min(targetVol, targetVol * (step / steps));
        if (step >= steps) {
            clearInterval(BGM_FADE_TIMER);
            BGM_FADE_TIMER = null;
        }
    }, stepTime);
}

function stopBgm(fadeOut) {
    if (!BGM_AUDIO) return;
    let ms = fadeOut !== undefined ? fadeOut : 600;
    let audio = BGM_AUDIO;
    let oldVol = audio.volume;
    let steps = 20;
    let stepTime = ms / steps;
    let step = 0;
    let timer = setInterval(() => {
        step++;
        audio.volume = Math.max(0, oldVol * (1 - step / steps));
        if (step >= steps) {
            clearInterval(timer);
            audio.pause();
            audio.currentTime = 0;
            BGM_AUDIO = null;
            BGM_CURRENT = null;
        }
    }, stepTime);
}

// Reintenta la BGM pendiente con el primer gesto del usuario (politica de
// autoplay del WebView: el play() inicial puede ser rechazado sin gesto).
function hookBgmGesture(audio) {
    if (BGM_GESTURE_HOOKED) return;
    BGM_GESTURE_HOOKED = true;
    let go = () => {
        BGM_GESTURE_HOOKED = false;
        document.removeEventListener('pointerdown', go);
        document.removeEventListener('keydown', go);
        document.removeEventListener('touchstart', go);
        let a = (audio && audio === BGM_AUDIO) ? audio : BGM_AUDIO;
        if (a) a.play().catch(() => {});
    };
    document.addEventListener('pointerdown', go);
    document.addEventListener('keydown', go);
    document.addEventListener('touchstart', go);
}

// Estado actual del canal de musica (para verificacion y test).
function getBgmState() {
    return { current: BGM_CURRENT, playing: !!(BGM_AUDIO && !BGM_AUDIO.paused) };
}
