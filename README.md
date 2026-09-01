# Submarino

Versión web estática del juego submarino pensada para GitHub Pages.

## Estructura

- `docs/index.html`: página principal con el juego, CSS y JavaScript en un solo archivo.

## Ejecutar localmente

```bash
cd d:/dev/submarino
python -m http.server 8000
```

Luego abre:

```text
http://localhost:8000/docs/
```

## Publicar en GitHub Pages

1. Sube este repositorio a GitHub.
2. En GitHub, abre Settings > Pages.
3. Selecciona la rama principal y la carpeta `docs` como origen.
4. Guarda la configuración.
5. Tu juego quedará disponible en una URL tipo:

```text
https://<usuario>.github.io/<repositorio>/
```

## Cómo funciona

1. La persona que crea la sala define la cantidad de jugadores y el tamaño del tablero.
2. Cada jugador entra con la clave de la sala.
3. Cuando todos están listos, el host inicia la partida.
4. Los turnos se alternan para atacar las celdas del rival.

> La versión de GitHub Pages funciona como una app estática y guarda la sala en el almacenamiento local del navegador para facilitar la demo.
