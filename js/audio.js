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

// --- BGM: musica del menu (v1.11.1) ---
// Loop gapless: intento WebAudio (AudioBufferSourceNode con loop=true,
// empalme sample-perfect porque el fichero de 60s es ciclico por
// construccion); si no hay AudioContext o falla la carga, fallback a
// Audio element con loop=true. El slider "Musica" de Opciones llama a
// setMusicVolume (nexo_music_vol, 0-100). La politica de autoplay exige
// un gesto: si el contexto esta suspendido se engancha el primer
// pointerdown/keydown/touchstart y ahi arranca.
const BGM_PATH = 'assets/audio/bgm/bgm_menu.ogg';
const BGM_VOLUME_DEFAULT = 0.5;
let BGM_buffer = null, BGM_ctx = null, BGM_gain = null, BGM_src = null;
let BGM_fallback = null, BGM_playing = false, BGM_mode = '';
let BGM_fadeTimer = null, BGM_gestureHooked = false;

function getMusicVolume() {
    let raw = safeStorageGet('nexo_music_vol');
    if (raw === null || raw === undefined) return BGM_VOLUME_DEFAULT;
    let v = parseFloat(raw);
    if (isNaN(v)) return BGM_VOLUME_DEFAULT;
    return Math.max(0, Math.min(1, v / 100));
}

function setMusicVolume(value) {
    safeStorageSet('nexo_music_vol', value);
    applyMusicVolume();
}

function applyMusicVolume() {
    let v = getMusicVolume();
    if (BGM_gain && BGM_ctx) BGM_gain.gain.value = v;
    if (BGM_fallback) BGM_fallback.volume = v;
}

function getBgmState() {
    return { playing: BGM_playing, mode: BGM_mode, ready: !!(BGM_buffer || BGM_fallback) };
}

function newBgmFallback() {
    BGM_fallback = new Audio(BGM_PATH);
    BGM_fallback.loop = true;
    BGM_fallback.preload = 'auto';
    BGM_fallback.volume = getMusicVolume();
}

function preloadBgm() {
    if (!(window.AudioContext || window.webkitAudioContext)) { newBgmFallback(); return; }
    if (BGM_ctx || BGM_buffer || BGM_fallback) return;
    try {
        BGM_ctx = new (window.AudioContext || window.webkitAudioContext)();
        BGM_gain = BGM_ctx.createGain();
        BGM_gain.gain.value = getMusicVolume();
        BGM_gain.connect(BGM_ctx.destination);
        fetch(BGM_PATH).then(r => {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.arrayBuffer();
        }).then(b => BGM_ctx.decodeAudioData(b)).then(buf => {
            BGM_buffer = buf;
            if (BGM_playing && BGM_ctx.state === 'running') playBgmSource();
        }).catch(() => {
            if (!BGM_fallback) { newBgmFallback(); if (BGM_playing) BGM_fallback.play().catch(() => {}); }
        });
    } catch (e) {
        BGM_ctx = null; BGM_gain = null;
        newBgmFallback();
    }
}

function playBgmSource() {
    if (!BGM_ctx || !BGM_buffer || BGM_src) return;
    try {
        BGM_src = BGM_ctx.createBufferSource();
        BGM_src.buffer = BGM_buffer;
        BGM_src.loop = true; // empalme sample-perfect: el fichero es ciclico
        BGM_src.connect(BGM_gain);
        BGM_src.start();
        BGM_mode = 'webaudio';
    } catch (e) { BGM_src = null; }
}

function hookBgmGesture() {
    if (BGM_gestureHooked) return;
    BGM_gestureHooked = true;
    let go = () => {
        BGM_gestureHooked = false;
        document.removeEventListener('pointerdown', go);
        document.removeEventListener('keydown', go);
        document.removeEventListener('touchstart', go);
        if (!BGM_playing) return;
        if (BGM_ctx && BGM_ctx.state === 'suspended') {
            BGM_ctx.resume().then(() => { if (BGM_playing && !BGM_src) playBgmSource(); }).catch(() => {});
        }
        if (BGM_fallback && BGM_playing) BGM_fallback.play().catch(() => {});
    };
    document.addEventListener('pointerdown', go);
    document.addEventListener('keydown', go);
    document.addEventListener('touchstart', go);
}

function startBgm() {
    if (BGM_playing) return;
    BGM_playing = true;
    clearInterval(BGM_fadeTimer);
    if (BGM_ctx) {
        if (BGM_ctx.state === 'suspended') hookBgmGesture();
        else if (BGM_buffer) playBgmSource();
    }
    if (BGM_fallback) BGM_fallback.play().catch(() => hookBgmGesture());
    if (!BGM_ctx && !BGM_fallback) { preloadBgm(); hookBgmGesture(); }
}

function stopBgm(fadeSec) {
    if (!BGM_playing) return;
    BGM_playing = false;
    clearInterval(BGM_fadeTimer);
    let steps = Math.max(1, Math.round((fadeSec || 0) * 1000 / 60));
    let step = 0;
    let base = BGM_ctx ? BGM_gain.gain.value : (BGM_fallback ? BGM_fallback.volume : 0);
    BGM_fadeTimer = setInterval(() => {
        step++;
        let v = Math.max(0, base * (1 - step / steps));
        if (BGM_ctx) BGM_gain.gain.value = v;
        if (BGM_fallback) BGM_fallback.volume = v;
        if (step >= steps) {
            clearInterval(BGM_fadeTimer);
            if (BGM_src) { try { BGM_src.stop(); } catch (e) {} BGM_src = null; }
            if (BGM_fallback) BGM_fallback.pause();
            applyMusicVolume(); // deja el nivel listo para el proximo arranque
        }
    }, 60);
}
