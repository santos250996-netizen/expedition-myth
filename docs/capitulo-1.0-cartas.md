# Capítulo 1.0 — El Despertar en la Hélade (Especificación oficial)

> Lore y diseño original de las 10 cartas del capítulo, tal como lo definió el
> diseñador. Al final se incluye la reconciliación con el estado actual del juego
> (`js/cards.js`, versión `v20261106k`), auditada con la
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

- Coste: 2 — ATK: 1 — HP: 1
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

## Aplicación al juego: canon vigente desde `v20261106k`

**El canon de esta página ya está APLICADO al juego.** Las 10 cartas del
capítulo 1.0 en `js/cards.js` coinciden una a una con la especificación
original y cumplen la [Guía de Balance](guia-de-balance.md): veredicto exacto
o bajo presupuesto en las diez. Los ejemplos 2 y 3 de la guía (c11 Acechador,
c13 Disputa) siguen cuadrando; el ejemplo 4 (c15 Guardián) corresponde al
capítulo 1.1 y también cuadra tras su realineación
(ver [capitulo-1.1-cartas.md](capitulo-1.1-cartas.md)).

Historial: entre el diseño original y la guía escrita hubo iteraciones de
balance que desviaron varias cartas del canon. La auditoría previa a
`v20261106j` detectó sobre presupuesto a c9 Pacto de Sangre (+5: destruir +
6 PG sin drawback, cuando el canon cuadra 8 + 2 − 4 = 6), c8 Oráculo (+2),
c3 Minotauro (+1) y c6 Lamento (+1); y por debajo a c4 (−1), c5 (−2) y
c7 (−3). La realineación aplicada fue:

| Carta | Estado desviado (pre-`j`) | Canon aplicado en `v20261106k` |
| --- | --- | --- |
| c3 Minotauro Joven | 3/4 | 2/4 |
| c4 Plegaria Arcana | +2 PG | +4 PG |
| c5 Niebla del Caos | -2 ATK solo a la cima rival | -2 ATK a TODOS los rivales |
| c6 Lamento de la Fuente Seca | 1/3 | 1/2 |
| c7 Embestida de Erimanto | 4/3 | 4/6 |
| c8 Oráculo Ciego | 0/2, aura permanente de descuento | 1/1 a coste 2, trigger: siguiente Evento -1 |
| c9 Pacto de Sangre | +6 PG, sin drawback ni condición | +4 PG, drawback -4 HP al propio más fuerte, requiere Ser aliado |
| c10 Ecos de Dodona | -1 ATK solo rivales, 1 turno | -1 ATK a TODOS los Seres, permanente |

Refinamiento `v20261106k`: la revisión final del diseñador fijó el Oráculo
Ciego (c8) en **coste 2 con cuerpo 1/1** (antes 1/0/1); el resto del capítulo
queda como en `v20261106j`.

Verificación: 41 aserciones automáticas sobre stats y efectos
(`scripts/test_canon_20261106j.js` del workspace) más partida completa de
humo en navegador sin errores de consola.
