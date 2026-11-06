# Capítulo 1.0 — El Despertar en la Hélade (Especificación oficial)

> Lore y diseño original de las 10 cartas del capítulo, tal como lo definió el
> diseñador. Al final se incluye la reconciliación con el estado actual del juego
> (`js/cards.js`, versión `v20261106i`), auditada con la
> [Guía de Balance](guia-de-balance.md).

## Lore del capítulo

La historia comienza en una Grecia arcaica y dividida. Las tribus moran en valles
oscuros y en las laderas de Arcadia, temiendo la noche y rindiendo culto a las
fuerzas telúricas de la tierra.

- **La Niebla del Caos**: Una densa penumbra cae sobre los valles. Los mortales
  desesperados elevan sus primeras plegarias en altares de piedra tosca.
- **Los Primeros Encuentros**: De las sombras de los bosques antiguos surgen
  criaturas híbridas y feroces que atacan los primeros asentamientos.
- **La Chispa de la Fe**: La devoción de los mortales resuena en las alturas del
  Olimpo, provocando la primera intervención divina directa.

## Las 10 cartas y su lore (especificación original)

### 1. Mortal de Arcadia (Ser)

**Lore**: En las laderas de los valles oscuros, pequeños grupos de hombres y mujeres
intentan sobrevivir al frío y a la intemperie. No tienen armas de bronce ni armaduras
pesadas, solo una frágil voluntad y fogatas improvisadas para espantar a la noche.

- Coste: 1 — ATK: 1 — HP: 1
- Efecto: Ninguno.

### 2. Sátiro de los Bosques (Ser)

**Lore**: De la espesura más profunda de los matorrales surgen criaturas híbridas de
torso humano y patas caprinas. Son seres salvajes y caóticos que no obedecen a ninguna
ley humana, merodeando los bordes de los caminos para asustar y desorientar a los viajeros.

- Coste: 2 — ATK: 0 — HP: 2
- Efecto: Inicio de turno: Gana +1 ATK por cada otro Ser aliado en el tablero.

### 3. Minotauro Joven (Ser)

**Lore**: Encerrados en cuevas profundas y laberintos naturales de piedra tosca crecen
bestias colosales con cuerpo de hombre y cabeza de toro. Su fuerza bruta es incontrolable
y comienzan a salir de sus guaridas atraídos por el olor del ganado humano.

- Coste: 3 — ATK: 2 — HP: 4
- Efecto: Ninguno.

### 4. Plegaria Arcana (Evento)

**Lore**: Ante el terror de la oscuridad, los jefes de las tribus alzan las manos al
cielo estrellado y elevan sus primeros cánticos y ofrendas. Esta devoción pura resuena
por primera vez en las alturas, atrayendo la atención de fuerzas invisibles.

- Coste: 1 — ATK: 0 — HP: 0
- Efecto: Otorga +4 Puntos de Gloria instantáneos.

### 5. Niebla del Caos (Evento)

**Lore**: Una densa penumbra inexplorada desciende de los cielos y cubre los valles
arcaicos de Grecia. Esta neblina antinatural nubla el juicio de las tribus y debilita
los primeros asentamientos humanos, obligándolos a dar sus primeros pasos a ciegas en
la oscuridad.

- Coste: 2 — ATK: 0 — HP: 0
- Efecto: Reduce en -2 el ATK de TODOS los Seres rivales (permanente).

### 6. El Lamento de la Fuente Seca (Ser)

**Lore**: Las protectoras de los manantiales sufren la corrupción de la niebla. Al verse
marchitas y sin agua pura, pierden la razón y se convierten en espectros errantes que
lloran desconsoladamente, confundiendo con sus cantos a cualquiera que se acerque.

- Coste: 2 — ATK: 1 — HP: 2
- Efecto: Al entrar: Reduce en -1 el ATK del Ser rival en la Fila 1 (permanente).

### 7. La Embestida de Erimanto (Ser)

**Lore**: Desde las cumbres heladas desciende una bestia descomunal: un jabalí salvaje
de piel acorazada y colmillos afilados que arrasa con los primeros cultivos y siembra
el pánico absoluto en las laderas de Arcadia.

- Coste: 5 — ATK: 4 — HP: 6
- Efecto: Inicio de turno: Inflige 1 daño al Ser rival de su misma fila. Pierde 1 HP propio.

### 8. El Balbuceo del Oráculo Ciego (Ser)

**Lore**: En una cueva donde los vapores de la tierra escapan por las grietas, un
anciano inhala los efluvios telúricos. Entra en un profundo trance y comienza a escupir
profecías indescifrables sobre un destino escrito con sangre y bronce.

- Coste: 1 — ATK: 0 — HP: 1
- Efecto: Trigger (al entrar): Tu siguiente Evento cuesta -1 Energía (mínimo 0).

### 9. Pacto de Sangre en el Altar de Piedra (Evento)

**Lore**: Desesperados por detener las malas cosechas y los ataques, los mortales
construyen altares toscos de roca y entregan la vida de sus cazadores en un ritual
oscuro para apaciguar a las fuerzas que los acechan.

- Coste: 3 — ATK: 0 — HP: 0
- Efecto: Destruye el Ser rival con menos HP. Otorga +4 Puntos de Gloria. Como
  condición, resta 4 HP a tu Ser aliado con más HP. Si no tienes un Ser aliado,
  el efecto no se activa.

### 10. Los Ecos del Bosque de Dodona (Evento)

**Lore**: Los robles milenarios de los bosques sagrados guardan secretos antiguos.
Cuando los intrusos se adentran sin respeto, las hojas y el viento susurran nombres
prohibidos que paralizan la voluntad y confunden las mentes de los enemigos.

- Coste: 1 — ATK: 0 — HP: 0
- Efecto: Reduce en -1 el ATK de TODOS los Seres (rivales y aliados) permanentemente.

---

## Reconciliación: especificación original vs. estado actual del juego

Las cartas del 1.0 se ajustaron en iteraciones de balance previas a este documento
(reparto de stats, alcance de efectos y valores de gloria). Esta sección registra
ambas versiones para que no haya contradicción silenciosa. La **Guía de Balance** es
la referencia normativa para cartas nuevas; realinear las de este capítulo con ella
es una decisión de diseño pendiente, no aplicada en este commit.

| Carta | Canon original | Actual en el juego (`v20261106i`) | Veredicto de la guía (actual) |
| --- | --- | --- | --- |
| c1 Mortal de Arcadia | 1/1, sin efecto | Igual | ✅ Exacto (2/2) |
| c2 Sátiro de los Bosques | 0/2, +1 ATK por otro Ser aliado al inicio | Igual; el buff se aplica "hasta el final del turno" (se recalcula cada tick) | ✅ Exacto (2+2=4) |
| c3 Minotauro Joven | 2/4, sin efecto | **3/4**, sin efecto | ❌ +1 sobre presupuesto (7 vs 6) |
| c4 Plegaria Arcana | +4 Puntos de Gloria | **+2 Puntos de Gloria** | ✅ Bajo (1 vs 2; el canon cuadraba exacto) |
| c5 Niebla del Caos | -2 ATK a TODOS los rivales (permanente) | **-2 ATK solo al Ser rival en la posición 1** (permanente) | ✅ Bajo (2 vs 4; el canon cuadraba exacto) |
| c6 El Lamento de la Fuente Seca | 1/2, al entrar -1 ATK a Fila 1 | **1/3**, mismo efecto | ❌ +1 sobre presupuesto (5 vs 4) |
| c7 La Embestida de Erimanto | 4/6, inicio: 1 daño a su fila y pierde 1 HP | **4/3**, mismo efecto | ✅ Bajo (7 vs 10; el canon cuadraba exacto) |
| c8 El Balbuceo del Oráculo Ciego | 0/1, al entrar: siguiente Evento -1 Energía | **0/2**, efecto ampliado a **aura persistente** (todos tus Eventos -1 Energía mientras esté en tablero) | ❌ +2 sobre presupuesto (4 vs 2) |
| c9 Pacto de Sangre en el Altar de Piedra | Destruir al de menos HP + 4 PG, con drawback (-4 HP a tu Ser con más HP) y condición (requiere Ser aliado) | **Destruir al de menos HP + 6 PG, sin drawback ni condición** | ❌ +5 sobre presupuesto (11 vs 6); el canon cuadraba exacto |
| c10 Los Ecos del Bosque de Dodona | -1 ATK a TODOS los Seres, rivales y aliados (permanente) | **-1 ATK solo a los rivales, solo durante el turno actual** | ✅ Exacto (2 vs 2) |

Notas de la auditoría:

- El ejemplo 2 de la guía (Acechador de los Matorrales, c11: coste 2, 1/2, 1 de daño
  al rival de la posición 1) y el ejemplo 3 (Disputa del Territorio, c13: coste 2,
  2 de daño a todos) **siguen cuadrando exactamente** con el juego actual.
- El ejemplo 4 de la guía cita al Guardián del Fuego Sagrado (c15) con su diseño
  original (coste 4, 0/4, +8 Gloria al inicio). En el juego actual es **2/4 con
  +1 Gloria al inicio** (presupuesto 8: stats 6 + efecto 0.5 = 6.5, bajo presupuesto).
- Las desviaciones sobre presupuesto detectadas son: **c9 (+5)**, **c8 (+2)**,
  **c3 (+1)** y **c6 (+1)**. Ninguna supera la Regla de Oro por margen roto salvo
  c9, que es la carta más fuerte del capítulo frente a la especificación original.
- Los cambios de alcance (c5, c10) y de duración (c8, c10) fueron decisiones de
  diseño de iteraciones anteriores, documentadas aquí; el capítulo se juega así
  desde antes de que existiera la guía escrita.
