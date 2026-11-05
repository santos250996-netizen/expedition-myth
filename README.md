# Expedition Myth: El Nexo del Tejido

Juego de cartas coleccionables **auto-batalla** inspirado en los mitos del mundo, por capítulos. Construyes tu mazo, lo pones en el tablero y las criaturas y eventos se enfrentan automáticamente en una partida que avanza turno a turno.

* **Capítulo I — Raíces Heládicas:** 10 cartas (Mortal de Arcadia, Sátiro de los Bosques, Minotauro Joven, Plegaria Arcana, Niebla del Caos, El Lamento de la Fuente Seca, La Embestida de Erimanto, El Balbuceo del Oráculo Ciego, Pacto de Sangre en el Altar de Piedra, Los Ecos del Bosque de Dodona).

## Cómo se juega

1. **MAZOS:** arma tu mazo (máx. 10 copias de las 10 cartas). En móvil toca el botón **+** de la colección para añadir cartas, y usa **▲ ▼ ✕** sobre cada carta del mazo para reordenarla o quitarla. En escritorio también puedes arrastrarlas.
2. **JUGAR:** la partida corre sola — cada jugador despliega una carta por turno si tiene Energía suficiente.
3. Cada turno, el **ATK** total de tu tablero se suma a tu marcador; el rival hace lo propio.
4. Al agotarse ambos mazos, gana quien acumuló más puntos. Guarda detalles de cada carta tocándola (con su lore).

## Estructura del proyecto

```
expedition-myth/
├── index.html          # Marcado de las 4 vistas (menú, combate, mazos, altador)
├── css/
│   └── styles.css      # Tema cósmico, animaciones y paneles néon
├── js/
│   ├── cards.js        # Datos: plantillas de cartas (stats, arte, lore, efectos)
│   ├── state.js        # Estado global de la partida
│   ├── deck.js         # Constructor de mazos: persistencia, drag & drop y acciones táctiles
│   ├── ui.js           # Modal de carta, HUD, tableros y fin de partida
│   ├── game.js         # Motor: reloj de turnos, despliegue, efectos y victoria
│   └── main.js         # Navegación entre vistas e inicialización
├── netlify.toml        # Config de despliegue estático
└── README.md
```

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

HTML5 + CSS3 + JavaScript vanilla, con Tailwind CSS y Font Awesome vía CDN. Sin frameworks, sin build, sin backend: el mazo se guarda en `localStorage`.
