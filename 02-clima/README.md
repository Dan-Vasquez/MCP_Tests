# Servidor MCP de Clima

Este es un servidor MCP que proporciona información del clima utilizando la API de OpenWeatherMap.

## Funcionalidades

- **obtenerClimaActual**: Obtiene información del clima actual para una ciudad específica
- **obtenerPronostico**: Obtiene el pronóstico del clima para los próximos 5 días
- **obtenerRecomendaciones**: Proporciona recomendaciones basadas en las condiciones climáticas actuales

## Instalación

```bash
pnpm install
```

## Configuración

Es necesario obtener una API key gratuita de [OpenWeatherMap](https://openweathermap.org/api) y reemplazarla en el archivo `main.ts`.

## Compilación

```bash
pnpm build
```

## Ejecución

```bash
pnpm start
```

## Ejemplo de uso

Una vez conectado al servidor MCP, puedes realizar consultas como:

```
obtenerClimaActual("Madrid")
obtenerPronostico("Barcelona")
obtenerRecomendaciones("Valencia")
```