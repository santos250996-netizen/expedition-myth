# Changelog de balance — Ecos del Olimpo

Registro de veredictos y mediciones del skill `tcg-balance-architect`.
Formato: fecha — carta — veredicto, con números y decisión.

### 2026-11-06 — Capítulo 1.3 "El Eclipse del Olimpo" (c31–c40) — set nuevo al pool
- Petición: 10 cartas nuevas del diseñador con lore del capítulo; mecánicas
  nuevas: aura de descuento de Eventos ampliada (c32), aceleración
  condicionada a la Fila 1 con gloria (c33), desgaste por turno (c34), buff
  temporal +2/+2 (c37), destrucción del más fuerte (c38) y robo de carta
  (c40).
- Método: veredicto CRUZADO vs vanilla del mismo coste, n=2000, seed 5,
  horizonte 25, mazo base c1–c10 (la candidata entra por la carta de su
  mismo coste). Marco de familia (escalera del pool, ver 1.2): c3 ancla 0.0,
  c2 +3.4, c6 −5.5, c9 −16.8, c5 −23.3, c7 −41.9.
- VEREDICTOS FINALES (Δ total / decisión):
  - **c31 Campeón del Eclipse** (Ser 5): spec 5/5 medía **+17.3 OP** (el
    golpe de 2 a la Fila 1 niega +15.5: a mitad de partida la renta
    concentrada en la cima hace el nip mucho más valioso que a coste 2, donde
    c26 medía +3.5). Ajuste a **4/4** → **+2.9**: caliente pero tolerable
    (familia de c2 +3.4; precedente c30 +4.1). El 2 de daño del spec se
    conserva intacto; nota de motor: "todos los Seres rivales en la Fila 1"
    colapsa al Ser de la cima, porque en este motor la Fila 1 es UNA posición.
  - **c32 Guardián del Templo de Delfos** (Ser 4): spec 2/6 medía −22.8 (el
    descuento de Eventos vale ≈ +4.4 en el pool base; el cuerpo perdía la
    renta de ATK, que vale ~14 pts por punto). Ajuste a **3/6** (curva
    exacta de 9 stats redistribuida a guardián) → **−9.1**: familia de
    c6/c28, coherente con el sabor de sacerdote defensivo.
  - **c33 Vidente Ciego de Arcadia** (Ser 2): spec intacto **1/3** →
    **−2.5** (ruido; mejor que el Vigía c28 −5.8 con la +1 gloria extra por
    turno si manda en la Fila 1). Sin cambios.
  - **c34 Coloso de Bronce Olvidado** (Ser 9): spec 7/9 medía **−37.1** en
    base y −25.8 en hostil: 16 stats vs 19 de curva MÁS el desgaste, que
    cuesta ≈ −20 pts de renta a horizonte 25. Ajuste a **10/10** (20 stats,
    la curva no basta a coste 9 cuando la carta se desgasta sola) →
    **−8.2**: familia de c6. Inmunidades (`noAtkRed`/`noDestroy`) reutilizan
    el sistema del 1.2; el desgaste NO es daño canónico (no dispara
    reacciones como la del Titán).
  - **c35 Heraldo de los Dioses** (Ser 3): spec 2/4 con "+1 ATK a todos tus
    Seres (él incluido)" medía **+11.3 OP** (misma renta compuesta que el
    Héroe de Bronce en 1.2). Con el precedente c30 se aplica a **los DEMÁS
    Seres** con el cuerpo spec intacto 2/4 → **−2.6**. Sin cambios de stats.
  - **c36 Eclipse de Zeus** (Evento 4): spec intacto (3 daño a todos los
    rivales) → **−26.0**: hermana menor de la Ira del Cielo (c25 −23.0), en
    familia ≈ c5. Sin cambios.
  - **c37 Bendición de Atenea** (Evento): spec coste 3 medía **−41.7** (el
    +HP temporal casi no vale y el buff dura un solo tick de gloria).
    Ajuste: **coste 2**, efecto spec intacto (+2/+2 hasta fin de turno) →
    **−20.7**: espejo exacto del Temblor c29 (−1 ATK rival este turno,
    −22.4). Simetría documentada: bendición propia a coste de cólera ajena.
  - **c38 Juicio de Hades** (Evento 5): spec intacto (destruye al de MÁS
    ATK + 5 gloria) → **−12.7**: familia de Pacto (c9 −16.8) pero con
    métricas muy superiores (0.93 muertes/partida, 93% ≥1, niega ≈ 33.3
    pts: caza la renta grande). Respeta `noDestroy`: elige el más fuerte
    ENTRE los destruibles (precedente c24). Sin cambios.
  - **c39 Cólera de Ares** (Evento 2): spec intacto (2 daño a TODOS) →
    **−21.6**: es la Disputa del Territorio c13 (−24.1) con otra piel; en
    familia ≈ c5. Sin cambios.
  - **c40 Traición de Hermes** (Evento 3): spec adaptado al motor → **−18.1**,
    familia de c9. El efecto mide +26.4 (gana +16.2 propio por jugar la
    carta robada y niega +10.2). Nota de diseño: este motor NO tiene mano;
    "roba 1 carta del mazo rival" se implementa como robo de la PRÓXIMA
    carta del mazo rival a tu propio mazo (lectura determinista, sin RNG,
    válida tick a tick). Sin cambios de coste.
- Motor (js/game.js, js/ui.js): (1) `oracleDiscountFor` ahora cuenta TODAS
  las auras vivas (c8 y c32; mazos singleton → máx −2); el HUD de "SIGUIENTE"
  usa la misma función. La protección anti-contrarresto de c32 queda como
  texto futuro: en el pool actual NINGÚN efecto contrarresta Eventos, así
  que es inerte (documentado, no simulado). (2) `tempHpMod` nuevo: el +HP
  temporal de c37 expira al comenzar el tick siguiente y puede matar si el
  daño recibido consumió la bendición. (3) Copia de mazo por partida en
  `resetMatch` (`p1.deck`/`p2.deck`): el robo de c40 muta la copia, nunca el
  mazo guardado del jugador; el HUD lee la copia.
- Dificultad del capítulo (bot en orden fijo): se calibró el ORDEN del mazo
  bot con las mismas 10 cartas. Final elegido c33→c39→c32→c37→c35→c40→
  c31→c36→c38→c34: mazo base c1–c10 gana **0.3%** (n=2000, seed 5; el bot
  1.2 dejaba 0.6% — el 1.3 es más duro) y un mazo optimizado con las cartas
  fuertes del pool gana **69.6%** (objetivo ≈70%: el capítulo empuja a
  reconstruir mazo con el set del eclipse, sin ser injusto).
- Nota: el epílogo deja abierta la Guerra de los Dioses para el capítulo
  siguiente; las artes usan paleta de eclipse (obsidiana + corona dorada).

### 2026-11-05 — Capítulo 1.2 "El Veredicto de la Sangre y el Bronce" (c21–c30) — set nuevo al pool
- Petición: 10 cartas nuevas del diseñador con lore del capítulo; mecánicas
  nuevas: buff de HP, inmunidades, energía condicional, gloria escalada.
- Método: veredicto CRUZADO vs vanilla del mismo coste, n=2000, seed 5,
  horizonte 25. Contexto primario: mazo base c1–c10 (la candidata entra por
  la carta de su mismo coste). Contexto secundario "hostil" (c5,c6,c9,c10,
  c11,c13,c14,c15,c16,c19) para las cartas cuyos efectos dependen de que el
  rival tenga remoción/daño (curación, inmunidades).
- Marco de familia (escalera del pool base, n=1000): c3 ancla 0.0, c2 +3.4,
  c6 −5.5, c9 −16.8, c5 −23.3, c7 −41.9. "Dentro de familia" = entre esos
  extremos ya aceptados en el juego (PvE).
- Veredictos finales (Δ total / efecto / decisión):
  - **c22 Forjador del Yunque Oculto** (Ser 3, 2/4): +0.2 EQUILIBRADA. El
    "+1 ATK al aliado de la Fila 1" se auto-aplica (al resolver, él ES la
    Fila 1): 3/4 efectivo = ancla. Spec del diseñador intacto.
  - **c26 Cazador de Bestias** (Ser 2): spec 2/2 medía +3.5 OP; ajuste a
    **2/1** → −1.9 EQUILIBRADA (negación 4.8 pts, 0.49 kills/partida).
  - **c24 Coloso de la Grieta Profunda** (Ser 8): spec 6/8 (14 stats) medía
    −14.0; ajuste a **7/10** (curva exacta 17) → −4.3 en contexto base y
    +2.8 en contexto hostil (las inmunidades valen más cuanto más remoción
    hay): promedio ≈ 0. Flags `noAtkRed`/`noDestroy` respetan Niebla,
    Lamento, Sombra, Ecos y Temblor, y sacan al Coloso del objetivo de
    Pacto (que elige el más débil ENTRE los destruibles).
  - **c25 Ira del Cielo Abierto** (Evento 4): −23.0 con spec intacto (4 daño
    a todos los rivales: 1.73 kills/partida, 87% de partidas con ≥1,
    niega 31.5 pts). Dentro de familia (≈ c5 −23.3). Sin cambios.
  - **c29 Temblor de las Raíces** (Evento 2): −22.4 con spec intacto (−1 ATK
    rival este turno). Dentro de familia; es el espejo de c10 a coste +1
    (c10 −17.2), coherente. Sin cambios.
  - **c28 Vigía de la Muralla Ciclópea** (Ser 2, 1/4): −5.8 (familia de c6
    −5.5). La +1⚡ solo corre mientras sea la cima: cualquier Ser nuevo lo
    desplaza. Spec intacto.
  - **c21 Juramento de las Lanzas de Bronce** (Evento 3): spec (+2 HP a
    todos) medía −41.4, el HP casi no vale en el pool base. Ajuste: **+3 HP
    y +4 gloria** → −37.9 en base, −17.6 en hostil (ahí la curación sí
    compra turnos de renta). Queda en el tramo bajo de familia (mejor que
    c7 −41.9). Pendiente del diseñador si quiere empujarlo más.
  - **c27 Juicio del Rayo Caído** (Evento): spec (+1/Ser, máx 5, coste 3)
    medía −42.4; ajuste a **coste 2 y +2/Ser (máx 8)** → −20.6, familia
    baja (c4 −16.2 / c10 −17.2). Con 3 Seres rinde +6 a coste 2.
  - **c23 Ofrenda de Hecatombe** (Evento 4): spec (resta 1 HP a tus Seres y
    pega esa cantidad) medía −53.9 (el auto-daño mataba los 1/1 propios).
    Ajuste: **3 de daño a la cima rival por cada Ser propio (sin
    auto-daño)** → −41.4 en base pero niega 13.7 (0.59 kills/partida) y
    −25.5 en hostil. La más floja del capítulo junto a c21; conserva la
    identidad de "hechizo grande escalable".
  - **c30 Despertar del Héroe de Bronce** (Ser 5): spec (5/6, +1 ATK
    permanente a TODOS los aliados, él incluido) medía **+33.8 OP** (la
    renta compuesta de buffearse a sí mismo). Ajuste: **4/6 y buffea a los
    DEMÁS Seres** (no a él) → +4.1: caliente pero tolerable para la carta
    culminante del capítulo (comparar c2 +3.4). Alternativa fría 3/6 →
    −8.6, a decisión del diseñador.
- Motor: flags de inmunidad (`noAtkRed`, `noDestroy`) implementados en
  js/cards.js y en la registry del simulador a la vez; las instancias los
  heredan por spread. Curación (+HP) y energía extra condicional reutilizan
  los FX existentes (buff/discount).
- Nota: el mazo del bot del capítulo juega el set con curva limpia:
  c26(2) c28(2) c29(2) c22(3) c21(3) c30(5) c23(4) c25(4) c27(2) c24(8).

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
