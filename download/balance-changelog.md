# Changelog de balance — Ecos del Olimpo

Registro de veredictos y mediciones del skill `tcg-balance-architect`.
Formato: fecha — carta — veredicto, con números y decisión.

### 2026-11-05 — Capítulo 1.1 "Las Grietas de la Discordia" (c11–c20) — set nuevo al pool
- Petición: 10 cartas nuevas con lore del diseñador (versión "balanceada").
- Decisión: se suben con los números EXACTOS del diseñador; el simulador
  mide y reporta, no edita diseño.
- Escalera cruzada (n=200, horizonte 25; Δ pts vs vanilla del mismo coste,
  mazo de contexto = el propio set nuevo):
  - **OP**: c18 Centinela del Barranco **+29.6** (+16.5% winrate) — el +1 ATK
    permanente mientras está en Fila 1 se acumula varios ticks seguidos (el
    ATK es renta en este juego: el cuerpo que crece compone). Sugerencia si
    se quiere frenar: que el buff dure solo el turno (como el Sátiro) o
    cuerpo 2/5.
  - **OP moderado**: c20 Profecía **+12.5** (+2.5% winrate) — 6/4 a coste 5
    con +1⚡ cuando hay ≥3 Seres. Sugerencia: 6/3 o umbral de 4 Seres.
  - En banda: c16 Sombra en el Pozo +1.8.
  - Ligeramente flojas (cerca del ruido): c11 Acechador −3.9, c17 Saqueo
    −4.5, c19 Derrumbe −5.5.
  - Flojas: c15 Guardián −9.2 (paga 3 stats por +1 gloria/turno), c14 Canto
    −11.8, c12 Titán Menor −14.7 (11 stats vs 17 de vanilla; el crecimiento
    por daño apenas come en un pool con poca fuente de daño — en el mazo del
    capítulo, que sí tiene AoE y choques, come más), c13 Disputa −24.1 (el
    AoE pega también a la RENTA propia).
- Motor: nuevas mecánicas implementadas en juego y simulador a la vez
  (daño canónico con reacción al daño, aturdimiento 1 tick, triggers de
  inicio de turno condicionales). Simetría re-verificada tras el parche:
  diff +1.48 pts (idéntico al pre-parche, determinismo OK).
- Nota: el mazo del bot del capítulo juega el set nuevo con curva de
  energía 1-carta-por-tick: c17(1) c11(2) c14(2) c13(2) c16(3) c19(3)
  c15(4) c18(4) c20(5) c12(8).

### 2026-11-05 — Medición base del pool (c1–c10) — escalera cruzada
- Petición: crear el skill de balance y medir el pool inicial.
- Método: medición CRUZADA (la carta a la izquierda vs vanilla de su mismo
  coste a la derecha, ambos mazos barajados, horizonte 25). Nota metodológica:
  la primera versión medía con la carta en AMBOS lados (espejo) y el valor se
  cancelaba simétricamente — artefacto detectado y corregido; el pool NO está
  uniformemente en banda.
- Números (n=200, Δ total en pts vs vanilla del mismo coste):
  - En banda: Sátiro (c2) +1.6, Mortal (c1) −1.2, Minotauro (c3) ancla.
  - Oráculo (c8) −2.1 — límite de banda.
  - Flojas: Lamento (c6) −7.4, Pacto (c9) −16.6, Plegaria (c4) −18.6,
    Ecos (c10) −20.1, Niebla (c5) −28.5, Embestida (c7) −44.6.
- Lectura: los EFECTOS de destrucción/negación son fuertes (Pacto destruye
  0.88 Seres/partida, 88% de partidas; el choque de Embestida niega ~10 pts)
  — la intuición del diseñador es correcta — pero el coste total (hueco de
  Ser + tempo de 1 carta/tick +, en Embestida, un cuerpo que se auto-destruye
  en ~2.5 turnos) deja a Eventos y Embestida por debajo de la vanilla de su
  coste end-to-end.
- Candidatas a buff (pendiente de decisión del diseñador): Embestida (coste 4,
  o +HP sin auto-daño), Niebla, Ecos, Plegaria.
- Nota de motor: la ventaja histórica del segundo jugador (~52% vs 46%) quedó
  eliminada con el turno compartido (despliegue y resolución simultáneos,
  choques de Embestida aplicados juntos). Simulador validado tick a tick
  contra el navegador: 25/25 ticks idénticos (1:1-1 … 25:119-119).
