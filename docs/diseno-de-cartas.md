# Diseño de cartas — Ecos del Olimpo

Documento interno de diseño. No aparece en el juego.
Versión: 1.0 — 2026-11-10

## Flujo de creación de una carta

1. Lore: escribir el mito (3-4 frases).
2. Nombre: fiel al mito original. No inventar nombres genéricos.
3. Tipo: Ser, Evento o Token.
4. Arquetipo: elegir 1 principal (+ 1 secundario si aplica). Ver docs/arquetipos.md.
5. Trigger: elegir entre los 6. Ver docs/sistema-de-efectos.md.
6. Efecto: elegir keyword + alcance.
7. Stats: calcular PPT. Stats + efectos = coste × 2.
8. Desc: escribir en formato `[Trigger] X: [Keyword] [Alcance]`.
9. Panel de keywords: añadir la explicación de las keywords usadas (se hace automático con LEYENDAS).
10. Verificar PPT: que cuadre.

## Flujo de creación de una familia

1. Lore de la familia: cómo evoluciona la carta base a las formas 2 y 3. Cada forma tiene lore propio.
2. Nombres: fieles al mito original. No inventar.
3. Tipos: pueden mezclarse (Ser / Evento / Token).
4. Arquetipos: 3 distintos (uno por forma).
5. Efectos: distintos por forma. Variar triggers y keywords.
6. Stats y PPT: verificar cada uno.
7. Misiones: forma 2 = 2 misiones, forma 3 = 4 misiones. Relacionadas con el lore y las keywords.
8. Tipos de misión nuevos: si hace falta, añadirlos en docs/misiones.md.

## Reglas de diseño

1. Lore primero. Sin lore no hay carta.
2. Cada forma de una familia tiene arquetipo principal distinto.
3. PPT = coste × 2. Verificar siempre.
4. El PPT es interno. No se explica al jugador.
5. Máximo 2 efectos por carta.
6. Máximo 2 keywords por carta.
7. Daño X es la única forma de reducir HP.
8. Bloqueo y Reflejo llevan trigger "Al entrar:".
9. Embestida, Enfurecer, Sacrificio son triggers.
10. Embestida X y Enfurecer X: el efecto vale 2X PPT (X = PPT efecto / 2).
11. Sacrificio X: suma X PPT al presupuesto.
12. Las recompensas solo dan forma base, nunca formas 2/3 ni Tokens.
13. Las misiones siguen el patrón: forma 2 = 2 misiones, forma 3 = 4 misiones.
14. Las misiones tienen relación con el lore.
15. Panel de misiones desaparece al completarse.
16. Colores en la UI: ámbar triggers, cian keywords.

## Ejemplos

- Buffer puro: El Altar de Zeus (coste 2, Evento, Fortalecer 2 a todos los aliados).
- Ejecutor puntual: El Tocado por el Rayo (coste 5, Ser 1/1, destruye el rival de coste más alto ≥ 4).
- Control con anti-sinergia: La Sombra en la Niebla (coste 3, Ser 2/2, Exilio 1 al inicio de turno solo si hay un Ser exiliado).
- Ejecutor póstumo: El Espectro de la Niebla (coste 5, Ser 1/1, al morir destruye al rival con más ATK).
