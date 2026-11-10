# Misiones — Ecos del Olimpo

Documento interno de diseño. No aparece en el juego.
Versión: 1.0 — 2026-11-10

## Estructura

- Forma 2: 2 misiones con la forma base.
- Forma 3: 4 misiones (2 con la forma base + 2 con la forma 2).

## Tipos de misión

| Tipo | Qué cuenta | Dónde se trackea |
|---|---|---|
| games_with | Jugar la carta en N partidas | showGameOver |
| wins | Ganar N combates con la carta en tablero | showGameOver |
| exilio_received | Recibir Exilio con la carta en tablero | exilio() |
| kills_with | Destruir N Seres rivales con la carta | killCard() |
| invoke_with | Invocar N cartas con la carta | summonCard() |
| exile_with | Exiliar N rivales con la carta | exilio() |
| fortalecer_with | Dar N de Fortalecer con la carta | efecto de la carta |
| glory_with | Sumar N Gloria con la carta | efecto de la carta |

## Panel de misiones

- Separado del panel de leyenda (debajo).
- Fijo.
- Cuando todas las misiones de la forma están completadas, el panel desaparece (cede el espacio).
- Cuando no están completadas, muestra el progreso (2/5, etc.).

## Tracking

Los contadores se llevan en `gameState.missionCounters = { [cardId]: { killsWith, invokeWith, exileWith, fortalecerWith, gloryWith } }` y se consumen en `showGameOver()` para actualizar el progreso persistente (`getProgressFor` / `updateProgressFor`).
