# Expedition Myth: El Nexo del Tejido

Juego de cartas coleccionables **auto-batalla** inspirado en los mitos del mundo, por capítulos. Construyes tu mazo, lo pones en el tablero y las criaturas y eventos se enfrentan automáticamente en una partida que avanza turno a turno.

* **Capítulo 1.0 — Raíces Heládicas:** 10 cartas (Mortal de Arcadia, Sátiro de los Bosques, Minotauro Joven, Plegaria Arcana, Niebla del Caos, El Lamento de la Fuente Seca, La Embestida de Erimanto, El Balbuceo del Oráculo Ciego, Pacto de Sangre en el Altar de Piedra, Los Ecos del Bosque de Dodona).
* **Capítulo 1.1 — Las Grietas de la Discordia:** 10 cartas (El Acechador de los Matorrales, El Despertar del Titán Menor, La Disputa del Territorio, El Canto Embrujado de la Hondonada, El Guardián del Fuego Sagrado, La Sombra en el Pozo, Saqueo a la Luz de la Antorcha, El Centinela del Barranco, Derrumbe de las Rocas Sagradas, La Profecía de la Sangre Derramada).
* **Capítulo 1.2 — El Veredicto de la Sangre y el Bronce:** 10 cartas (El Juramento de las Lanzas de Bronce, El Forjador del Yunque Oculto, La Ofrenda de Hecatombe, El Coloso de la Grieta Profunda, La Ira del Cielo Abierto, El Cazador de Bestias de las Colinas, El Juicio del Rayo Caído, El Vigía de la Muralla Ciclópea, El Temblor de las Raíces Ocultas, El Despertar del Héroe de Bronce).
* **Capítulo 1.3 — El Eclipse del Olimpo:** 10 cartas (El Campeón del Eclipse, El Guardián del Templo de Delfos, El Vidente Ciego de Arcadia, El Coloso de Bronce Olvidado, El Heraldo de los Dioses, El Eclipse de Zeus, La Bendición de Atenea, El Juicio de Hades, La Cólera de Ares, La Traición de Hermes).

## Cómo se juega

1. **MAZOS:** arma tu mazo (máx. 10 copias de las 10 cartas). En móvil toca el botón **+** de la colección para añadir cartas, y usa **▲ ▼ ✕** sobre cada carta del mazo para reordenarla o quitarla. En escritorio también puedes arrastrarlas.
2. **JUGAR:** la partida corre sola — cada jugador despliega una carta por turno si tiene Energía suficiente.
3. Cada turno, el **ATK** total de tu tablero se suma a tu marcador; el rival hace lo propio.
4. La partida se decide por **diferencia de 50 Puntos de Gloria**. Y ojo al estancamiento: si ambos mazos se agotan y en los tableros ya no queda nada que pueda sumar gloria (sin ATK ni generadores periódicos), termina ahí mismo y gana quien tenga más Puntos de Gloria — con igualdad, empate. Guarda detalles de cada carta tocándola (con su lore).

## Estructura del proyecto

```
expedition-myth/
├── index.html          # Marcado de las vistas (menú, capítulos, combate, mazos, deckbuilder)
├── manifest.json       # Manifiesto PWA (instalable en móvil)
├── icon.svg            # Icono de la app / favicon
├── sw.js               # Service worker: precachea e imagen del juego (apertura instantánea)
├── css/
│   └── styles.css      # Tema cósmico, animaciones, FX y paneles néon
├── js/
│   ├── cards.js        # Datos: plantillas de cartas (stats, arte, lore, efectos)
│   ├── state.js        # Estado global de la partida
│   ├── fx.js           # Motor de efectos visuales: cola por tick, proyección de eventos, textos flotantes
│   ├── deck.js         # Constructor de mazos: persistencia, drag & drop y acciones táctiles
│   ├── chapters.js     # Datos narrativos de la campaña y mazos del bot
│   ├── ui.js           # Modal de carta, HUD, tableros (reconciliados por uid) y fin de partida
│   ├── game.js         # Motor: reloj de turnos, despliegue, efectos y victoria
│   └── main.js         # Navegación entre vistas, service worker e inicialización
├── netlify.toml        # Config de despliegue estático
├── docs/
│   ├── guia-de-balance.md      # Guía oficial de balance: reglas matemáticas de diseño
│   ├── capitulo-1.0-cartas.md  # Spec original del cap. 1.0 + reconciliación con el juego
│   └── capitulo-1.1-cartas.md  # Spec del cap. 1.1 (canon aplicado) + auditoría por carta
│   └── capitulo-1.2-cartas.md  # Spec del cap. 1.2 (canon aplicado) + reglas del escudo del Coloso
└── README.md
```

## Documentación de diseño

* **[docs/guia-de-balance.md](docs/guia-de-balance.md)** — la guía oficial de balance: fórmulas de presupuesto (`Coste × 2`), tabla de valores de efectos, multiplicadores de alcance y reglas de drawbacks. Es la referencia normativa para crear y auditar cartas.
* **[docs/capitulo-1.0-cartas.md](docs/capitulo-1.0-cartas.md)** — lore y especificación original de las 10 cartas del capítulo 1.0. Canon **aplicado al juego** desde `v20261106j`, con el historial de la realineación.
* **[docs/capitulo-1.1-cartas.md](docs/capitulo-1.1-cartas.md)** — lore y especificación del capítulo 1.1 (canon aplicado), auditoría por carta y la regla definitiva de valoración de energía: cualquier efecto de Energía (positivo o negativo) vale 2 de presupuesto, ×2 si es pasivo.
* **[docs/capitulo-1.2-cartas.md](docs/capitulo-1.2-cartas.md)** — lore y especificación del capítulo 1.2 (canon aplicado en `v20261106l/m`), reglas completas del escudo del Coloso, la regla de Energía y del turno 1, y auditoría por carta.

## Caché y rendimiento

Un service worker (`sw.js`) precachea el shell y **todas las imágenes** de cartas y capítulos en la primera visita; a partir de ahí todo se sirve desde caché (stale-while-revalidate) y reabrir el juego es instantáneo, incluso sin conexión. Para publicar cambios de assets, sube la versión `CACHE` de `sw.js` y los `?v=` del HTML. El tablero de combate se reconcilia por `uid` (los nodos del DOM se reutilizan), así que los cambios de ATK/HP se animan en el sitio sin repintar imágenes.

## Ejecutar en local

No hay paso de build ni dependencias:

```bash
# Opción 1: abrir index.html directamente en el navegador
# Opción 2: servir la carpeta
python3 -m http.server 8000
# o
npx serve .
```

## Desplegar

* **Netlify:** arrastra la carpeta del proyecto a https://app.netlify.com/drop (o conecta este repo; `netlify.toml` ya está listo).
* **GitHub Pages:** Settings → Pages → Branch `main` → root.
* **Vercel:** importa el repo, framework "Other", sin comandos de build.

## Stack

HTML5 + CSS3 + JavaScript vanilla, con Tailwind CSS, Font Awesome y las tipografías vendorizadas en el repo (sin CDN: funciona offline y en el APK). Sin frameworks, sin build, sin backend: el mazo se guarda en `localStorage`.
