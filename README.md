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

Una implementación básica de un servidor MCP que ofrece operaciones matemáticas simples.

**Pasos para implementar:**

1. Iniciar un proyecto nuevo:
   ```bash
   mkdir 01-Calculadora
   cd 01-Calculadora
   pnpm init
   ```

2. Instalar las dependencias necesarias:
   ```bash
   pnpm install @modelcontextprotocol/sdk zod
   pnpm install -D typescript
   ```

3. Crear archivo `tsconfig.json` para configurar TypeScript

4. Crear archivo `main.ts` con la estructura básica:
   ```typescript
   import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
   import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

   const server = new McpServer({
     name: "example-server",
     version: "1.0.0"
   });

   // ... set up server resources, tools, and prompts ...

   const transport = new StdioServerTransport();
   await server.connect(transport);
   ```

5. Añadir funciones para las operaciones matemáticas usando Zod para validación

6. Compilar y ejecutar:
   ```bash
   pnpm build
   pnpm start
   ```

---

*Nota: Los proyectos en este repositorio están en constante evolución y sirven principalmente como material de aprendizaje.*