# SISTEMA DE EFECTOS — ECOS DEL OLIMPO

> **Nota de mantenimiento (v1.9.0):** este documento se ha generado a partir del
> paquete v1.9.0 (definiciones de keywords del modal, formato de `desc` y código
> del motor). El `.txt` original "SISTEMA DE EFECTOS — ECOS DEL OLIMPO" no estaba
> disponible en el entorno de trabajo: sustituye este archivo por tu versión
> normativa cuando quieras. La única sección pendiente de confirmar es la
> **fórmula de PPT** (marcada con 【】 más abajo).

## 1. Idea general

Cada efecto de carta se describe con el mismo vocabulario: un **trigger** (cuando
ocurre), una **keyword** (qué hace) y un **alcance** (a quién le afecta). La
`desc` visible de la carta y el código del motor usan el mismo lenguaje, así que
una carta se puede leer sin abrir el código.

## 2. Formato de `desc`

```
[Trigger] xX: [Keyword] [Alcance].
```

- `xX` es la **repetición**: cuántas veces se aplica el efecto. Si no aparece,
  el efecto se aplica 1 vez. Ejemplo real: `Al entrar x2: Exilio 2 a 1 rival aleatorio.` (b10).
- Las habilidades **pasivas** (no tienen trigger) se escriben solo con la
  keyword: `Bloqueo 2.`, `Embestida 1.`
- Varias frases en la misma `desc` son varios efectos que se aplican en orden:
  `Al entrar: Gloria 4. Destruir al rival con menos HP. Daño 4 a tu Ser con mas HP.` (c9).

## 3. Los 3 triggers

| Trigger | Cuándo se dispara | En el motor |
| --- | --- | --- |
| `Al entrar:` | Cuando la carta se despliega en el tablero. | `effect(p, opp)` al invocar. |
| `Al morir:` | Cuando la carta muere en el tablero. | `onDeath` al eliminarla. |
| `Inicio de turno:` | Al empezar el turno de su dueño (puede llevar condición entre paréntesis). | `startTurn(self, p, opp)`. |

Condiciones frecuentes entre paréntesis: `(si hay aliados)` (c2),
`(si esta en Fila 1 y hay rival)` (b2), `(si es la ultima carta de tu columna)` (e2).

## 4. Keywords

### 4.1 Las 12 keywords puras

Definiciones canónicas (las mismas que muestra el panel KEYWORD del modal):

| Keyword | Definición |
| --- | --- |
| **Embestida X** | Al inicio de cada turno, consume X ATK y X HP para infligir X de daño al Ser rival de su fila. |
| **Enfurecer X** | Cada vez que esta carta recibe daño, gana +X ATK permanentemente. |
| **Bloqueo X** | Amortigua hasta X puntos de reduccion de ATK o HP sobre esta carta. Al agotarse, el efecto se desactiva. |
| **Reflejo X** | Inmune al proximo efecto rival que targetee a esta carta. El efecto se refleja y se aplica a una carta aleatoria del rival. |
| **Daño X** | Inflige X de daño a un objetivo. |
| **Debilitar X** | Reduce X ATK de un objetivo. |
| **Fortalecer X** | Aumenta X ATK de un objetivo. |
| **Blindar X** | Aumenta X HP de un objetivo. |
| **Destruir** | Destruye instantaneamente a un objetivo. |
| **Invocar X** | Invoca X copias de una carta en tu tablero. |
| **Inmune X** | Inmune a efectos rivales X turnos. |
| **Descuento X** | Reduce en X el coste de tu proxima carta. |

### 4.2 Las 2 keywords compuestas

- **Exilio X** — unifica las antiguas *Laberinto* y *Petrificar*. Definición
  canónica: *Exilia a un Ser rival X turnos. Mientras este exiliado: ATK y HP a
  0, no ataca, no puntua, no recibe daño ni efectos, no es target de nada.*
  Implementación: `stunned: true` + `exilioTurns: X`, ATK/HP guardados en
  `_exilioSavedAtk` / `_exilioSavedHp` y puestos a 0; el contador se decrementa
  al final de cada tick y al llegar a 0 la carta recupera stats y dispara el FX
  `liberado`. Un objetivo exiliado no puede ser elegido por otros efectos
  (`!c.stunned` en los filtros de target).
- **Gloria X** — otorga X Puntos de Gloria directos (`p.score += X`); se combina
  con otros efectos en la misma `desc` (b8: `Gloria 2 + Fortalecer 1...`,
  c9: `Gloria 4. Destruir...`). También existe la forma variable
  `Gloria X por cada aliado` (a5, b1) que calcula X al vuelo.

> La partición exacta "12 puras / 2 compuestas" es la del `.txt` original del
> dueño; aquí se recogen las 14 definiciones vigentes en el modal.

## 5. Los 9 alcances

Alcances observados en el juego (con cartas de ejemplo):

1. `a 1 rival aleatorio` — a3, a10, b2, b10.
2. `a todos los rivales` — c5, talos.
3. `a Fila 1 rival` — c6, b4, sat_pan.
4. `a todos los aliados` — b5, b9, sat_cortejo.
5. `a todos (rivales + aliados)` — c10.
6. `al aliado con mas ATK` / `al rival con mas ATK` — b6 / a11.
7. `al rival con menos HP` / `a tu Ser con mas HP` — c9.
8. `por cada aliado` (variable) — c2, a5, b1.
9. `a todos tus [familia] (tablero + mazo)` — a6, fuego.

Otros alcances especiales que ya existen: `1 rival con coste >= 5` (e3),
`al siguiente Evento` (c8), `a Fila 1 rival` condicionado a fila (b2).
La lista canónica de 9 alcances con sus multiplicadores de presupuesto es la
del `.txt` original.

## 6. Reglas del motor (resumen normativo)

1. **Exilio**: el exiliado es `stunned`; no suma Gloria (`boardPoints` salta
   `dying || stunned`), no puede ser target, no recibe daño ni efectos, y sus
   triggers propios no se ejecutan. Al liberarse recupera ATK/HP guardados.
2. **Bloqueo X** se consume por puntos absorbidos (`bloqueoAbsorb`) y solo
   amortigua reducciones de ATK o HP sobre la carta que lo lleva.
3. **Reflejo X** tiene X cargas (`reflectCharges`); cada reflejo consume una.
4. **Inmune** marca `immuneThisTurn` en la carta durante el turno correspondiente.
5. **Descuento X** se aplica al siguiente Evento jugado (`oracleDiscount`).
6. **Invocar** entra por `summonCard` (máximo 12 cartas en tablero) y dispara
   los efectos "Al entrar" de lo invocado cuando corresponde.
7. **Gloria** se acumula en `p.score`; la partida se decide por diferencia de
   50 Puntos de Gloria y el estancamiento se detecta con `canStillScore()`
   (una carta exiliada solo "cuenta" mientras tenga turnos de exilio por
   consumir).
8. Las **misiones** escuchan el motor: `exilio_received` (la carta
   `previousCardId` recibe Exilio), `wins` (combates ganados con la carta en
   tablero) y `games_with` (partidas jugadas con la carta en tablero).

## 7. Fórmula de PPT

【Pendiente del `.txt` original "SISTEMA DE EFECTOS — ECOS DEL OLIMPO": la
fórmula exacta de PPT y su tabla de valores por keyword. Lo observado en el
código: la Gloria por turno de una carta es `max(0, ATK + tempAtkMod)` y las
cartas exiliadas no puntúan; la guía general de presupuesto (`Coste × 2`,
multiplicadores de alcance y drawbacks) vive en `docs/guia-de-balance.md`.】
