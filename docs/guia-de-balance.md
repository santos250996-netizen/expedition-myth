# Guía de Balance — Ecos del Olimpo

> Documento oficial del diseñador. Establece las reglas matemáticas para crear y
> balancear cartas en el juego. El objetivo es que cualquier carta nueva pueda ser
> evaluada objetivamente para saber si está rota, si es justa o si es débil.
> Es la referencia normativa para toda carta nueva a partir de ahora.

---

## 1. Tipos de carta

- **SER**: Tiene ATK y HP. Se queda en el tablero y suma puntos cada turno.
- **EVENTO**: No tiene ATK ni HP. Hace su efecto y desaparece.

## 2. Fórmula base para seres sin efecto

```
Coste * 2 = Total de Stats (ATK + HP)
```

Ejemplos:

- Coste 1: 2 puntos (1/1, 0/2, 2/0)
- Coste 2: 4 puntos (2/2, 1/3, 3/1, 0/4)
- Coste 3: 6 puntos (3/3, 2/4, 4/2, 1/5, 5/1)
- Coste 4: 8 puntos (4/4, 3/5, 5/3, 2/6, 6/2)
- Coste 5: 10 puntos (5/5, 4/6, 6/4, etc.)
- Coste 8: 16 puntos (8/8, 6/10, etc.)

## 3. Fórmula base para seres con efecto

```
(Coste * 2) - Valor del Efecto = Total de Stats (ATK + HP)
```

El "Valor del Efecto" se decide según la tabla de la sección 5.

## 4. Fórmula base para eventos

```
(Coste * 2) - Valor del Efecto = 0 (no tiene stats)
```

Si el valor del efecto es mayor que `Coste * 2`, el evento es demasiado poderoso para su coste.

## 5. Valor de los efectos (tabla definitiva)

| Efecto | Valor |
| --- | --- |
| Daño directo (1 objetivo) | 1 de daño = Valor 1 |
| Daño directo (2+ objetivos) | 1 de daño = Valor 2 (multiplicador de alcance x2) |
| Reducción de ATK (1 objetivo) | -1 ATK = Valor 1 (permanente) |
| Reducción de ATK (2+ objetivos) | -1 ATK = Valor 2 (permanente, alcance x2) |
| Buff de ATK (1 objetivo) | +1 ATK = Valor 1 |
| Buff de ATK (2+ objetivos) | +1 ATK = Valor 2 |
| Buff de HP (1 objetivo) | +1 HP = Valor 0.5 |
| Buff de HP (2+ objetivos) | +1 HP a todos = Valor 1 |
| Generación de Energía | +1 Energía = Valor 1 |
| Generación de Puntos de Gloria | 2 Puntos = Valor 1 (1 Punto de presupuesto = 2 Puntos de Gloria) |
| Destrucción directa (1 Ser rival) | Valor 8 (fijo) |
| Ver o manipular el mazo rival | Valor 2-3 |

**IMPORTANTE**: La Gloria NO se ve afectada por el multiplicador de inicio de turno.
Siempre se calcula como 2 Puntos de Gloria = 1 de presupuesto.

## 6. Multiplicador de alcance

- Efecto que afecta a **UN SOLO** objetivo: Multiplicador **x1**.
- Efecto que afecta a **DOS O MÁS** objetivos (o a todos): Multiplicador **x2**.

## 7. Regla de condiciones (drawbacks)

Si un efecto tiene una condición o drawback, ese drawback se **RESTA** del valor del efecto.

Si la condición NO se puede cumplir, el efecto NO se activa. Esto es un riesgo que
justifica que el efecto principal sea más poderoso.

**EJEMPLO 1 — Pacto de Sangre (Evento, Coste 3)**

- Efecto principal: Destruir el Ser rival con menos HP (Valor 8) + 4 Puntos de Gloria (Valor 2).
- Drawback: Quitar 4 HP a tu Ser con más HP (Valor 4, se resta).
- Valor neto: 8 + 2 - 4 = 6. Presupuesto: 6. ✅ Justo.
- Si no tienes un Ser aliado, el efecto no se activa.

**EJEMPLO 2 — La Embestida de Erimanto (Ser, Coste 5)**

- Efecto principal: Al inicio de tu turno, inflige 1 daño al Ser rival de su misma fila (Valor 1).
- Drawback: Pierde 1 HP propio (autodaño, Valor 1, se resta).
- Valor neto del efecto: 1 - 1 = 0.
- Presupuesto: 5 * 2 = 10.
- Stats: 10 - 0 = 10 puntos (4/6 o 5/5). ✅ Justo.

## 8. Regla especial: efectos de inicio de turno

Los efectos de inicio de turno (pasivos) son más difíciles de valorar porque dependen
de cuánto tiempo estén en el tablero.

Regla práctica:

- En cartas de **coste bajo (1-2)**: El efecto de inicio de turno es MUY valioso
  (se activa muchas veces). Asígnale un valor alto (**2-3**).
- En cartas de **coste alto (5+)**: El efecto de inicio de turno es POCO valioso
  (se activa pocas veces). Asígnale un valor bajo (**1**).

**EXCEPCIÓN**: La Gloria no se ve afectada por esta regla. Siempre vale
2 Puntos de Gloria = 1 de presupuesto.

## 9. Ejemplos prácticos

**EJEMPLO 1 — Ser sin efecto**

Carta: Mortal de Arcadia (Coste 1)
Presupuesto: 1 * 2 = 2.
Stats: 1 ATK / 1 HP = 2 puntos. ✅ Cumple.

**EJEMPLO 2 — Ser con efecto (1 objetivo)**

Carta: Acechador de los Matorrales (Coste 2, 1 daño al rival de Fila 1)
Presupuesto: 2 * 2 = 4.
Valor del efecto: 1 daño * 1 (alcance) = 1.
Stats esperados: 4 - 1 = 3.
Stats actuales: 1 ATK / 2 HP = 3. ✅ Cumple.

**EJEMPLO 3 — Evento con efecto en área**

Carta: La Disputa del Territorio (Coste 2, 2 daño a TODOS los Seres)
Presupuesto: 2 * 2 = 4.
Valor del efecto: 2 daño * 2 (alcance) = 4.
Stats: 4 - 4 = 0 (evento). ✅ Cumple.

**EJEMPLO 4 — Ser con efecto de inicio de turno (Gloria)**

Carta: Guardián del Fuego Sagrado (Coste 4, 0/4, +8 Gloria al inicio del turno)
Presupuesto: 4 * 2 = 8.
Stats: 0 ATK / 4 HP = 4 puntos.
Valor del efecto: +8 Gloria = Valor 4 (8/2 = 4).
Total: 4 + 4 = 8. ✅ Cumple.

**EJEMPLO 5 — Evento con buff de HP a todos los aliados**

Carta: El Juramento de las Lanzas de Bronce (Coste 3, +2 HP a todos los aliados)
Presupuesto: 3 * 2 = 6.
Valor del efecto: +2 HP (valor base 1) * 2 (alcance) = 2.
Stats: 6 - 2 = 4. Pero es un evento, así que no tiene stats. El valor 2 es menor que 6,
así que es un evento justo. ✅ Cumple.

## 10. Regla de oro

El valor del efecto **NUNCA** puede ser mayor que el presupuesto total de la carta
(`Coste * 2`). Si lo es, la carta es imposible de balancear y hay que subirle el
coste o cambiar el efecto.

## 11. Filosofía del juego

El juego es de decisiones. Si el rival tiene una carta que se buffea cada turno, tú
debes tener en tu mazo una carta que la elimine (como el Pacto de Sangre o el
Derrumbe de Rocas). No se trata de que todas las cartas sean igual de fuertes, sino
de que cada una tenga un counter claro.
