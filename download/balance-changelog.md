# Changelog de balance — Ecos del Olimpo

Registro de veredictos y mediciones del skill `tcg-balance-architect`.
Formato: fecha — carta — veredicto, con números y decisión.

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
