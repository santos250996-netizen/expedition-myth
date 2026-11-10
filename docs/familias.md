# Familias — Ecos del Olimpo

Documento interno de diseño. No aparece en el juego.
Versión: 1.0 — 2026-11-10

## Reglas de familia

1. Cada familia tiene 3 formas: base (I), forma II y forma III.
2. Cada forma tiene un arquetipo principal distinto. No se puede repetir el mismo arquetipo principal entre formas de la misma familia.
3. Las formas pueden mezclar tipos (Ser, Evento, Token).
4. Forma 2: 2 misiones con la forma base.
5. Forma 3: 4 misiones (2 con la forma base + 2 con la forma 2).
6. Las misiones tienen relación con el lore de la familia.
7. El mazo guarda el familyId; el motor juega la forma marcada.
8. En combate no se puede cambiar la forma.

## Familias actuales

### asterion (c3 → a2 → a3)
- I: c3 Asterión, el Minotauro (Tanque).
- II: a2 Asterión, Enfurecido (Agresor).
- III: a3 Asterión, el Señor del Laberinto (Control).

### dedalo (a7 → a10 → talos)
- I: a7 Dédalo, el Arquitecto (Invocador).
- II: a10 El Laberinto de Creta (Control).
- III: talos El Talos (AoE).

### mortales (c1 → fuego → muros)
- I: c1 Mortales de Arcadia (base).
- II: fuego Mortales del Fuego (Buffer).
- III: muros Mortales de los Muros (Tanque).

### satiro (c2 → sat_cortejo → sat_pan)
- I: c2 Sátiro de los Bosques (Escalador).
- II: sat_cortejo Sátiro del Cortejo (Buffer).
- III: sat_pan Pan, el del Grito (Control).

### plegaria (c4 → altar_zeus → tocado_rayo)
- I: c4 Plegaria Arcana (Generador).
- II: altar_zeus El Altar de Zeus (Buffer).
- III: tocado_rayo El Tocado por el Rayo (Ejecutor).

### niebla (c5 → sombra_niebla → espectro_niebla)
- I: c5 Niebla del Caos (Debuffer).
- II: sombra_niebla La Sombra en la Niebla (Control + Anti-sinergia).
- III: espectro_niebla El Espectro de la Niebla (Ejecutor).

## Patrón de misiones

- Forma 2: 2 misiones con la forma base.
- Forma 3: 4 misiones (2 con forma base + 2 con forma 2).

Ver docs/misiones.md para los tipos de misión.
