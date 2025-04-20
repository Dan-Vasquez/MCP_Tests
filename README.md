# MCP_Tests

## Repositorio de Desarrollo y Experimentación MCP

Este repositorio contiene una colección de servidores MCP (Model Context Protocol) desarrollados como parte de mi proceso de aprendizaje y experimentación.

### Contenido

El repositorio incluye implementaciones que van desde lo básico hasta integraciones más avanzadas:

- **Implementaciones básicas**: Servidores que manejan operaciones sencillas como cálculos matemáticos y respuestas de texto
- **Procesamiento de datos**: Manipulación y transformación de diferentes tipos de información
- **Integraciones con APIs**: Conexiones con servicios externos gratuitos para expandir funcionalidades
- **Experimentos diversos**: Pruebas de concepto y prototipos en desarrollo

### Propósito

Este espacio sirve como laboratorio práctico para probar conceptos, mejorar habilidades de desarrollo y documentar el progreso en la implementación de servidores MCP funcionales.

### Proyectos

#### 01-Calculadora

Implementación básica de un servidor MCP que realiza operaciones matemáticas como suma, resta, multiplicación y división.

#### 02-Clima

Servidor MCP que se conecta a la API de OpenWeatherMap para proporcionar:
- Información del clima actual para cualquier ciudad
- Pronóstico para los próximos 5 días
- Recomendaciones basadas en condiciones climáticas

Para usar este servidor, necesitarás obtener una API key gratuita de [OpenWeatherMap](https://openweathermap.org/api).

### Implementación Básica

Una implementación básica de un servidor MCP.

**Pasos para implementar:**

1. Iniciar un proyecto nuevo:
   ```bash
   mkdir <nombre_del_mcp>
   cd <nombre_del_mcp>
   pnpm init
   ```

2. Instalar las dependencias necesarias:
   ```bash
   pnpm install @modelcontextprotocol/sdk
   pnpm install zod
   ```

3. Agregar en el package.json `"type": "module"`

4. Crear archivo `main.ts` con la estructura básica:
   ```typescript
   import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
   import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
   import {z} from "zod";

   const server = new McpServer({
     name: "example-server",
     version: "1.0.0"
   });

   // ... set up server resources, tools, and prompts ...

   const transport = new StdioServerTransport();
   await server.connect(transport);
   ```

5. Añadir funciones de recursos, herramietas, prompts, etc. Usando Zod para validación

6. Compilar y ejecutar (Si no ejecuta nada esta funcionando):
   ```bash
   npx -y tsx main.ts
   ```
7. Ejecutar el inspector para probar el MCP creado:
   ```bash
   npx -y @npx @modelcontextprotocol/inspector npx -y tsx main.ts
   ```
---

*Nota: Los proyectos en este repositorio están en constante evolución y sirven principalmente como material de aprendizaje.*