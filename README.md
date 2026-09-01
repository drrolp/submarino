# Submarino

Proyecto de juego multijugador basado en una sala compartida, con lógica principal implementada en Java y la interfaz web en JavaScript para poder publicarse en GitHub Pages.

## Estructura

- `docs/`: pantalla web y lógica frontend para GitHub Pages.
- `src/main/java/com/submarino/`: clases de lógica central del juego en Java.
- `src/test/java/com/submarino/`: pruebas unitarias de la lógica del tablero.

## Requisitos

- Java 17+
- Maven 3.9+
- Navegador moderno

## Ejecutar la lógica Java

```bash
cd d:/dev/submarino
D:\dev\submarino\.mvn\maven-3.9.16\bin\mvn.cmd test
```

## Ejecutar la app web localmente

Puedes abrir el archivo `docs/index.html` directamente en el navegador o servir la carpeta con un servidor local:

```bash
cd d:/dev/submarino
python -m http.server 8000
```

Luego visita:

```text
http://localhost:8000/docs/
```

## Publicar en GitHub Pages

1. Sube este repositorio a GitHub.
2. En GitHub, abre Settings > Pages.
3. Selecciona la rama principal y la carpeta `docs` como origen.
4. Guarda la configuración.
5. Tu juego estará disponible en una URL tipo:

```text
https://<usuario>.github.io/<repositorio>/
```

## Cómo funciona el juego

1. La persona que crea la sala define la cantidad de jugadores y el tamaño del tablero.
2. Cada jugador entra con la clave de la sala.
3. Cuando todos están listos, el host inicia la partida.
4. El juego alterna turnos para atacar las celdas del rival.

> La versión de GitHub Pages funciona como una app estática. La sala y el progreso se guardan con `localStorage` dentro del navegador para facilitar la demo en una sola web pública.
