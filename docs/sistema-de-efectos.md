# SISTEMA DE EFECTOS — ECOS DEL OLIMPO

> **Nota de mantenimiento (v1.9.2):** documento CERRADO con el paquete v1.9.2
> (triggers Embestida/Enfurecer/Sacrificio definidos y ligados al PPT). El
> paquete pedía copiar un bloque literal de este documento que no llegó en el
> mensaje, así que esta versión se reconstruye con las secciones 1-4 de ese
> paquete (6 triggers, 12 keywords, 6 alcances, relación con el PPT) más las
> reglas de motor vigentes y las definiciones del panel LEYENDAS del modal.
> Cualquier ajuste normativo posterior del dueño se aplica sobre esta base.

## 1. Idea general

Cada efecto de carta se describe con el mismo vocabulario: un **trigger**
(cuándo ocurre), una **keyword** (qué hace) y un **alcance** (a quién le
afecta). La `desc` visible de la carta y el código del motor usan el mismo
lenguaje, así que una carta se puede leer sin abrir el código.

## 2. Formato de `desc`

```
[Trigger]: [Keyword] [Alcance].
```

- Si no aparece trigger, el efecto es pasivo o se aplica al entrar según la
  keyword (`Bloqueo 2.` en a4/b3/muros).
- Varias frases en la misma `desc` son varios efectos que se aplican en orden:
  `Sacrificio 4: Gloria 4. Destruir 1 rival con menos HP.` (c9),
  `Al entrar: Exilio 2 a 1 rival aleatorio. Inicio de turno (...): Daño 1 a Fila 1 rival. Al morir: Invocar 2 Serpientes de la Cabeza.` (b2).

## 3. Los 6 triggers

| Trigger | Cuándo se dispara | En el motor |
| --- | --- | --- |
| `Al entrar:` (on play) | Cuando la carta se despliega en el tablero. | `effect(p, opp)` al invocar. |
| `Inicio de turno:` (start turn) | Al empezar el turno de su dueño (puede llevar condición entre paréntesis). | `startTurn(self, p, opp)`. |
| `Al morir:` (on death) | Cuando la carta muere en el tablero. | `onDeath` al eliminarla. |
| `Embestida X` | Al inicio de cada turno, si la carta puede pagar X ATK y X HP. | `embestida()` consume el coste y dispara `embestidaEffect(self, p, opp)`, que decide el objetivo. |
| `Enfurecer X` | Cada vez que la carta recibe daño, acumulando hasta X. | `dealDamage()` llama a `enfurecer(target, dmg)`; al llegar al umbral dispara `enfurecerEffect(target, owner)` y resetea el contador a 0. |
| `Sacrificio X` | Al jugar la carta, si tus Seres suman al menos X HP. | `sacrificio(player, X, applyEffect)`: resta X HP de tus Seres (de más HP a menos, con FX de golpe y muerte vía `killCard` si alguno llega a 0) y solo entonces dispara el efecto. |

Condiciones frecuentes entre paréntesis: `(si hay aliados)` (c2),
`(si esta en Fila 1)` (b2), `(si es la ultima carta de tu columna)` (e2).

## 4. Las 12 keywords puras

Definiciones canónicas (las mismas que lista la leyenda del modal):

| Keyword | Definición |
| --- | --- |
| **Daño X** | Inflige X de daño a un objetivo. |
| **Debilitar X** | Reduce X ATK de un objetivo. |
| **Fortalecer X** | Aumenta X ATK de un objetivo. |
| **Blindar X** | Aumenta X HP de un objetivo. |
| **Gloria X** | Otorga X Puntos de Gloria. |
| **Destruir** | Destruye instantaneamente a un objetivo. |
| **Exilio X** | Exilia a un Ser rival X turnos. Mientras este exiliado: ATK y HP a 0, no ataca, no puntua, no recibe daño ni efectos, no es target de nada. |
| **Invocar X** | Invoca X copias de una carta en tu tablero. |
| **Inmune X** | Inmune a efectos rivales X turnos. |
| **Descuento X** | Reduce en X el coste de tu proxima carta. |
| **Bloqueo X** | Amortigua hasta X puntos de reduccion de ATK o HP sobre esta carta. Al agotarse, el efecto se desactiva. |
| **Reflejo X** | Inmune al proximo efecto rival que targetee a esta carta. El efecto se refleja y se aplica a una carta aleatoria del rival. |

Notas de implementación: **Exilio** unifica las antiguas *Laberinto* y
*Petrificar* (`stunned: true` + `exilioTurns: X`, stats guardados en
`_exilioSavedAtk` / `_exilioSavedHp`); **Gloria** se acumula en `p.score` y
admite la forma variable `Gloria X por cada aliado` (a5, b1); **Bloqueo** se
consume por puntos absorbidos (`bloqueoAbsorb`); **Reflejo** tiene X cargas
(`reflectCharges`); **Descuento** se aplica al siguiente Evento
(`oracleDiscount`); **Invocar** entra por `summonCard` (máximo 12 cartas).

## 5. Los 6 alcances (simplificados)

| Alcance | Multiplicador | Uso típico |
| --- | --- | --- |
| 1 objetivo | x1 | `a Fila 1 rival` (c6, b4, sat_pan), `al rival con mas ATK` (a11), `al aliado con mas ATK` (b6). |
| +1 objetivo | x2 | Doble aplicación del mismo efecto (b10: `Al entrar x2: Exilio 2...`). |
| Aleatorio | x1 | `a 1 rival aleatorio` (c7, a2, a3, a10, b2, b10). |
| Self | x1 | La carta misma (Blindar/Fortalecer a si misma, coste del propio Embestida). |
| Mazo | x1 (1 carta) / x2 (+1 carta) | Buscar en el mazo: `Invocar 1 Asterion, el Minotauro` (a8, a9), a6 `a todos tus Asterion (tablero + mazo)`. |
| Filtro | x1 | Condiciones de selección: `1 rival con coste >= 5` (e3), `todos los rivales` (c5, talos), `todos los aliados` (b5, b9, sat_cortejo), `todos los Seres` (c10, fuego). |

## 6. Reglas del motor (resumen normativo)

1. **Embestida X**: se activa al inicio de cada turno mientras haya stats para
   pagar y quede algún rival vivo. Consume X ATK y X HP de la carta (si el
   pago la remata, queda `dying` con FX de sacrificio) y dispara el
   `embestidaEffect` de la carta, que elige objetivo y aplica la keyword.
2. **Enfurecer X**: el daño entra siempre por `dealDamage` (canónico: Reflejo,
   Bloqueo y muerte incluidos); después de aplicar el daño, `enfurecer()`
   acumula el daño real (`dmg` tras Bloqueo) en `enfurecerCounter` y al
   alcanzar el umbral dispara el efecto y pone el contador a 0.
3. **Sacrificio X**: si los Seres del jugador no suman X HP, el trigger no se
   dispara y no hace nada (ni FX ni efecto). El reparto va siempre de más HP a
   menos y puede matar a un Ser propio (`killCard`).
4. **Exilio**: el exiliado es `stunned`; no suma Gloria (`boardPoints` salta
   `dying || stunned`), no puede ser target, no recibe daño ni efectos, y sus
   triggers propios no se ejecutan. Al liberarse recupera ATK/HP guardados.
5. **Inmune** marca `immuneThisTurn` durante el turno correspondiente.
6. **Gloria** decide la partida por diferencia de 50 Puntos de Gloria; el
   estancamiento se detecta con `canStillScore()`.
7. Las **misiones** escuchan el motor: `exilio_received`, `wins` y
   `games_with`.

## 7. Relación de los triggers nuevos con el PPT

- **Embestida X**: paga 2X PPT en juego. El efecto que le sigue vale 2X PPT.
  No suma PPT al presupuesto. X = PPT efecto / 2.
- **Enfurecer X**: no paga. El efecto vale X PPT (el PPT del efecto se divide
  entre 2, y X también). No suma PPT al presupuesto (la carta tiene stats
  reducidos). X = PPT efecto / 2.
- **Sacrificio X**: paga X HP. El efecto vale lo que valga. Suma X PPT al
  presupuesto.

Ejemplos vigentes: c7 y a2 (`Embestida 1: Daño 2` — paga 2 PPT, el Daño 2
vale 2 PPT); c9 (`Sacrificio 4: Gloria 4. Destruir 1 rival con menos HP.` —
paga 4 HP y suma 4 PPT de presupuesto; Gloria 4 + Destruir se valoran dentro
de ese presupuesto). La tabla de valores por keyword del presupuesto general
(`Coste × 2`, multiplicadores de alcance y drawbacks) sigue en
`docs/guia-de-balance.md`.

## 8. Panel del modal

La leyenda del modal (constante `LEYENDAS` en `ui.js`) lista SOLO los
triggers y keywords que la `desc` de la carta usa, sin títulos: ámbar
(`fa-bolt`) para los 6 triggers y cian (`fa-key`) para las 12 keywords, con
las definiciones de las secciones 3 y 4. En modo lore el panel muestra el
lore de la carta; en modo combate, leyenda + misión si la carta tiene.
