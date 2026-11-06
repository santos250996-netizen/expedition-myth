# Capítulo 1.2 — El Veredicto de la Sangre y el Bronce (Especificación oficial)

> Lore y diseño de las 10 cartas del capítulo. El capítulo existía en el juego
> desde el marco de familia del simulador; con el spec del diseñador quedó
> **realineado al canon en `v20261106l`** y pulido en `v20261106m` (regla
> definitiva de Energía): las 10 cartas de `js/cards.js` coinciden una a una
> con esta página. Reglas de auditoría: [Guía de Balance](guia-de-balance.md).

## Lore del capítulo

El conflicto latente en los valles de Arcadia ha cruzado un punto de no retorno.
La tierra misma, sacudida por la tensión entre las tribus humanas, las bestias
primigenias y los susurros de los titanes subterráneos, comienza a desgarrarse.
Ya no se trata solo de sobrevivir a la noche o de disputar un territorio de
caza: las alianzas se rompen, los primeros héroes locales levantan armas de
bronce rudimentario y las fuerzas invisibles del cosmos griego empiezan a
manifestarse con una brutalidad inusitada sobre el mundo mortal.

**Beats**: 1) *El Juramento de Bronce* — ante la masacre total, los jefes de las
aldeas rivales sellan un pacto de sangre sobre un escudo oxidado: nace la
primera línea de defensa organizada de la Hélade. 2) *El Fuego de la Forja* —
en las entrañas de una caverna humeante, el Forjador del Yunque Oculto extrae
los primeros minerales verdaderos y da forma a las primeras armas de bronce.
3) *El Cielo Responde* — el humo de la Hecatombe cruza las barreras celestiales:
un trueno cae sobre el campo de batalla y los supervivientes ven la destrucción
como el veredicto de los dioses.

**Epílogo**: el bronce habló y la sangre pagó el veredicto: las tribus que
juraron sobre el escudo oxidado ya no son bandas dispersas, sino el embrión de
las futuras ciudades-estado. Pero bajo las grietas siguen susurrando los
titanes, el Coloso avanza sin obedecer a nadie... y el humo de la próxima
ofrenda ya empieza a ascender hacia el Olimpo.

## Las 10 cartas y su lore (canon `v20261106l`)

### 1. El Juramento de las Lanzas de Bronce (Evento)

**Lore**: Ante la inminencia de una masacre total, los jefes de las aldeas
rivales se ven obligados a deponer temporalmente sus disputas internas. En un
claro del bosque iluminado por hogueras, sellan un pacto de sangre sobre un
escudo oxidado, jurando unir sus fuerzas y crear la primera línea de defensa
organizada de la Hélade.

- Coste: 3 — ATK: 0 — HP: 0
- Efecto: Otorga +1 ATK y +2 HP a todos tus Seres aliados en el tablero.

### 2. El Forjador del Yunque Oculto (Ser)

**Lore**: En las entrañas de una caverna humeante donde el fuego de la tierra
brota sin descanso, un mortal solitario e ingenioso logra extraer los primeros
minerales verdaderos de la roca. Con un pesado martillo de piedra, golpea el
metal incandescente para dar forma a las primeras armas y armaduras de bronce
rudimentario, cambiando para siempre el equilibrio de la guerra.

- Coste: 3 — ATK: 1 — HP: 3
- Efecto: Al entrar: Otorga +2 ATK al Ser aliado en la Fila 2 (el que está
  justo debajo de él).

### 3. La Ofrenda de Hecatombe (Evento)

**Lore**: Buscando desesperadamente el favor de los cielos ante la magnitud del
conflicto, los sacerdotes de los nuevos asentamientos organizan el primer
sacrificio masivo de ganado en un altar de mármol negro. El humo denso y
aromático de la ofrenda asciende hacia las nubes, exigiendo una respuesta
directa de las deidades olímpicas.

- Coste: 4 — ATK: 0 — HP: 0
- Efecto: Resta 1 HP a todos tus Seres aliados e inflige el doble de esa
  cantidad como daño al Ser rival en la Fila 1 (daño = Seres sacrificados × 2).

### 4. El Coloso de la Grieta Profunda (Ser)

**Lore**: Un gigantesco autómata de piedra viva y engranajes de bronce antiguo,
olvidado desde las eras de la Titanomaquia, emerge de las profundidades de un
abismo abierto por los terremotos. No responde a mandatos humanos ni divinos;
avanza de manera implacable aplastando todo a su paso, guiado únicamente por el
impulso ancestral de destruir la superficie.

- Coste: 8 — ATK: 3 — HP: 5
- Efecto: Aura de protección global: amortigua hasta 4 puntos de reducción
  (ATK o HP) sobre TODAS tus cartas. Al agotarse los 4 puntos, el efecto se
  desactiva. (Reglas del escudo más abajo.)

### 5. La Ira del Cielo Abierto (Evento)

**Lore**: El humo de la Hecatombe finalmente cruza las barreras celestiales y
llama la atención en las alturas. Sin previo aviso, un destello cegador rasga
la bóveda celeste y un trueno ensordecedor cae directamente sobre el campo de
batalla, desatando una tormenta de fuego y electricidad que carboniza tanto a
las bestias como a los guerreros humanos.

- Coste: 4 — ATK: 0 — HP: 0
- Efecto: Inflige 4 de daño al HP de todos los Seres rivales en el tablero.

### 6. El Cazador de Bestias de las Colinas (Ser)

**Lore**: Un guerrero curtido en mil batallas solitarias, que ha cambiado las
toscas lanzas de madera por una jabaliza con punta de bronce forjado. Se
desplaza en silencio por los desfiladeros, especializado en rastrear y dar
caza a las criaturas más peligrosas que amenazan los flancos de los nuevos
asentamientos.

- Coste: 2 — ATK: 1 — HP: 1
- Efecto: Al entrar: Inflige 2 de daño al HP del Ser rival en la Fila 1.

### 7. El Juicio del Rayo Caído (Evento)

**Lore**: Tras la tormenta eléctrica desatada en los cielos, los restos
humeantes del campo de batalla quedan marcados por la energía divina. Los
guerreros que logran sobrevivir al impacto del rayo experimentan un fervor
fanático, viendo la destrucción como una señal inequívoca de que los dioses han
puesto sus ojos en la Hélade.

- Coste: 3 — ATK: 0 — HP: 0
- Efecto: Otorga +3 Puntos de Gloria por cada Ser aliado en el tablero (sin
  límite máximo).

### 8. El Vigía de la Muralla Ciclópea (Ser)

**Lore**: El primer guerrero en ocupar una posición defensiva elevada sobre los
bloques de piedra tosca recién amontonados. Dotado de una pesada protección de
bronce, vigila incansablemente el horizonte, dando la voz de alarma ante
cualquier incursión de bestias o enemigos.

- Coste: 3 — ATK: 0 — HP: 2
- Efecto: Inicio de turno: Si está en la Fila 1, ganas +1 Energía extra.

### 9. El Temblor de las Raíces Ocultas (Evento)

**Lore**: La tierra de Arcadia vuelve a convulsionarse con violencia. Las
profundidades del abismo liberan ondas de choque que agrietan los campos de
cultivo y derriban las empalizadas de madera, obligando a ambos bandos a luchar
al borde de precipicios humeantes.

- Coste: 2 — ATK: 0 — HP: 0
- Efecto: Dispara 4 veces. Cada disparo reduce 1 HP a un Ser aleatorio en el
  tablero (puede ser aliado o rival).

### 10. El Despertar del Héroe de Bronce (Ser)

**Lore**: Un mortal excepcional, bañado por el fuego de la forja y la gloria de
la primera victoria organizada, alza su espada de bronce ante los suyos. Su
presencia imponente unifica a las tribus dispersas y marca el fin de la era del
miedo primitivo, dando paso directo al nacimiento de las grandes ciudades-estado.

- Coste: 5 — ATK: 4 — HP: 4
- Efecto: Al entrar: Otorga +1 ATK permanente a todos los Seres aliados en el
  tablero (incluyéndose a sí mismo: entra en la Fila 1 antes de que resuelvan
  los efectos).

## Reglas del escudo del Coloso (c24)

Implementado como aura con **4 cargas** (`shieldCharges`) sobre la instancia
del Coloso, verificada carta a carta en el harness y en vivo:

- **Absorbe** reducciones de stat: Niebla c5, Lamento c6, Ecos c10, Canto c14,
  Sombra c16 (ATK) y los 4 disparos del Temblor c29 (HP). Protege a TODAS tus
  cartas, Coloso incluido; si una reducción de 2 encuentra solo 1 carga, absorbe
  1 y el resto pasa (el agotamiento puede ocurrir en pleno efecto).
- **No absorbe** daño directo (Disputa c13, Acechador c11, Derrumbe c19, Ira
  c25, choques de Embestida c7), destrucción directa (Pacto c9, Juicio de Hades
  c38 — el Coloso del canon **ya no es inmune** a nada) ni **costes propios**
  (sacrificio de la Ofrenda c23, Embestida c7, desgaste del Coloso de Bronce c34).
- A las 0 cargas el aura queda desactivada; el cuerpo 3/5 sigue combatiendo.
- Las reducciones de HP del Temblor **no son daño canónico**: no pasan por
  `dealDamage` y por tanto no alimentan la reacción del Titán c12.

## Regla de Energía y turno 1 (`v20261106m`)

- **Energía inicial 0**: el primer +1 lo otorga el tick del turno 1. Antes el
  juego regalaba 1 inicial que, sumado al del tick, hacía +2 efectivos desde el
  segundo turno (bug reportado por el diseñador). Verificado en vivo: 19 turnos
  con `energía real = simulación +1/turno` exactos.
- **Valor de la Energía en la guía**: cualquier efecto de Energía (positivo o
  negativo) = 2 de presupuesto; pasivo/recurrente ×2 (ejemplo 6 nuevo de la
  guía, origen: la Profecía c20 → 3/3).

## Auditoría según la Guía de Balance (canon = juego en `v20261106m`)

| Carta | Presupuesto (Coste×2) | Stats | Efecto valorado | Total | Veredicto |
| --- | --- | --- | --- | --- | --- |
| c21 Juramento de las Lanzas | 6 | — | +1 ATK a todos (2) + +2 HP a todos (2) = 4 | 4 | ✅ Bajo presupuesto (ejemplo 5 de la guía, ampliado) |
| c22 Forjador del Yunque Oculto | 6 | 4 (1/3) | +2 ATK condicionado a Fila 2 = 2 | 6 | ✅ Exacto |
| c23 Ofrenda de Hecatombe | 8 | — | daño 2×n (4 con n=2) - drawback 1 HP por propio (2) = 2 | 2–4 | ✅ El drawback escala con el payoff |
| c24 Coloso de la Grieta Profunda | 16 | 8 (3/5) | escudo de 4 puntos = 4 | 12 | ✅ Bajo presupuesto (llega a coste 8) |
| c25 Ira del Cielo Abierto | 8 | — | 4 daño a todos ×2 alcance = 8 | 8 | ✅ Exacto |
| c26 Cazador de Bestias | 4 | 2 (1/1) | 2 daño a 1 objetivo = 2 | 4 | ✅ Exacto |
| c27 Juicio del Rayo Caído | 6 | — | +3 PG por aliado: 2 aliados = 6 | 6+ | ⚖️ Sin tope, apuesta de escalada declarada por el diseñador |
| c28 Vigía de la Muralla Ciclópea | 6 | 1 (0/2) | +1 Energía/turno = 2, condición Fila 1 | 3 | ⚖️ Bajo fórmula estricta; compensa su exposición en la fila de combate |
| c29 Temblor de las Raíces Ocultas | 4 | — | 4 disparos de 1 = 4, con fuego amigo | 4 | ✅ Exacto (el azar paga el alcance) |
| c30 Despertar del Héroe de Bronce | 10 | 8 (4/4) | +1 ATK a 2+ objetivos = 2 | 10 | ✅ Exacto |

## Desviaciones corregidas respecto al marco del simulador

Antes de la realineación (`v20261106l`), el juego tenía: c21 **+3 HP y +4 PG**,
c22 **2/4 con +1 ATK a Fila 1 (a sí mismo)**, c23 **3 de daño por aliado sin
sacrificio**, c24 **7/10 inmune** a reducción y destrucción, c26 **2/1**,
c27 **coste 2, +2 PG con tope +8**, c28 **coste 2, 1/4**, c29 **-1 ATK temporal
a los rivales** y c30 **4/6 sin buffearse a sí mismo**. La Ira del Cielo
Abierto (c25) ya coincidía y no se tocó. El arte de c21, c22, c27 y c30 se
**recreó de cero** en `v20261106l` con composiciones nuevas sobre el mismo
estilo del capítulo (dark fantasy frío con acentos de bronce).

## Verificación

- **Harness de canon** (`scripts/test_canon_20261106j.js`): 63 aserciones en
  verde, incluidas stats exactas de las 5 cartas con cambio de cuerpo, el
  ciclo completo del escudo (absorción parcial, agotamiento en pleno efecto,
  desactivación), el fuego amigo del Temblor con aleatoriedad determinista y
  los 4 mazos del bot.
- **Smoke en vivo** (Caddy :3000): energía exacta durante 19 turnos en 1.0
  (real = simulación sin fantasma), capítulo 1.2 con el Coloso desplegándose
  3/5 con escudo a 4 cargas, el Héroe buffeándose a sí mismo (5 ATK) y el arte
  nuevo visible en las mini-cartas del tablero, sin errores de consola.
