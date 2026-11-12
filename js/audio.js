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
