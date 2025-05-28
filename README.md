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

## 03-Laboratorio MCP con n8n 🖇️🤖

En esta fase migramos las pruebas de MCP desde código puro a **n8n**, usando el *Self-Hosted AI Starter-Kit*, con los nodos nativos de MCP y los nodos personalizados **`n8n-nodes-mcp`**. El objetivo es:

1. Levantar un **MCP Server** sobre SSE que exponga cuatro operaciones sobre Google Sheets.  
2. Crear un **AI Agent** (Gemini 2.5 flash) capaz de descubrir herramientas MCP remotas y ejecutarlas dinámicamente desde una conversación con un LLM.

### 1. Prerrequisitos

| Componente | Versión |
|------------|---------|
| Docker + Docker Compose | ≥ 24 |
| Node | ≥ 18 (para herramientas locales) |
| n8n *Self-Hosted AI Starter-Kit* | `git clone https://github.com/n8n-io/self-hosted-ai-starter-kit.git` |
| Paquete extra | `npm i -g supergateway` (solo si vas a usar Claude Desktop) |

### 2. Instalación rápida del Starter-Kit para gpu de Nvidia

```bash
git clone https://github.com/n8n-io/self-hosted-ai-starter-kit.git
cd self-hosted-ai-starter-kit
docker compose --profile gpu-nvidia up
```

### 3. Importar los flujos de trabajo

En la carpeta `/workflows` de este repo encontrarás dos archivos JSON exportados desde n8n:

| Fichero                        | Descripción                                                      |
| ------------------------------ | ---------------------------------------------------------------- |
| `mcp_server_gsheets.json`      | MCP Server con 4 herramientas CRUD sobre Google Sheets           |
| `ai_agent_gemini_travily_gsheets.json` | Agente Chat (Gemini 2.5 flash) + memoria simple + MCP Client (Travily y Google sheets) |

1. Abre **n8n → Import Workflow → Select File** y activa ambos.
2. Crea las **credenciales de Google Sheets** con service account preferiblemente y, si usas Travily, establece la credencial **MCP Client (STDIO) account**.

### 4. Flujo *MCP Server Google Sheets*

El objetivo es realizar un CRUD sobre una tabla de clientes que tienen el siguiente esquema: 

|Nombre|Apellido|Edad|Correo|NumeroTrabajo|Observacion|

```
[MCP Server Trigger]──Tools──► Buscar Todos
                       ├──────► Buscar
                       ├──────► Agregar
                       └──────► Eliminar
```

* **Endpoint SSE:** `http://0.0.0.0:5678/mcp/<path>/sse`
* **Herramientas expuestas**

  * `buscar_todos` (read: sheet)
  * `buscar` (read: sheet)
  * `agregar` (create: sheet)
  * `eliminar` (delete: sheet)

Cada nodo Sheets va *detrás* de un nodo **MCP Tool: Custom n8n Workflow** donde se define el schema `input/output` que Claude/Cursor usará para la llamada.

### 5. Flujo *AI Agent Gemini + Travily*

```
[Chat Trigger] → [AI Agent]
                 ├─ Chat Model…… Google Gemini Chat Model
                 ├─ Memory……… Simple Memory
                 └─ Tools………  • MCP Client  (SSE Endpoint = del paso 4)
                                • Herramientas de Travily (listTools)
                                • Ejecutor (executeTool)
```

#### 5.1 Configuración del MCP Client (Travily)

| Campo          | Valor                                |
| -------------- | ------------------------------------ |
| **Credential** | *MCP Client (STDIO) account*         |
| Command        | `npx`                                |
| Arguments      | `-y tavily-mcp@0.1.4`                |
| Environments   | `TAVILY_API_KEY=tvly-<YOUR_API_KEY>` |

Esto inicia `tavily-mcp` en modo **stdio**, que luego n8n enruta al nodo **Ejecutor** (`executeTool`).

#### 5.2 Configuración del MCP Client que ejecuta las herramientas

| Campo          | Valor                                |
| -------------- | ------------------------------------ |
| **Credential** | *MCP Client (STDIO) account*         |
| Tool Description        | Set Automatically                                |
| Operation      | Execute Tool              |
| Tool Name   | `{{ $fromAI("tool") }}` |
|Tool Parameters| Defined automatically by the model|

### 6. Pruebas rápidas

```bash
# Validar que el servidor SSE responde
curl -N http://localhost:5678/mcp/<path>/sse
```

Si no ocurre ningun error y la terminal se queda escuchando todo esta correcto.

### 7. Uso desde Cursor / Claude

* **Cursor** desde las opciones buscar MPC y agregar un nuevo SSE.
* **Claude Desktop** requiere el puente `supergateway`:

```jsonc
{
  "mcpServers": {
    "n8n-local": {
      "command": "npx",
      "args": [
        "-y",
        "supergateway",
        "--sse",
        "http://127.0.0.1:5678/mcp/<path>/sse"   //127.0.0.1 es la ip que expone docker, tabien se puede utilizar localhost: o la ip Wifi LAN
      ]
    }
  }
}
```

Reinicia la aplicación y verás las herramientas dentro de Claude.

### 8. Recursos adicionales

* **n8n-nodes-mcp** → [https://github.com/n8n-io/n8n-nodes-mcp](https://github.com/n8n-io/n8n-nodes-mcp)
  Colección de nodos “MCP Tool” y “MCP Client” usados en este laboratorio.
* **Model Context Protocol** → [https://modelcontextprotocol.io](https://modelcontextprotocol.io)
* **n8n** → [Self-Hosted AI Starter-Kit](https://github.com/n8n-io/self-hosted-ai-starter-kit.git)

*Nota: Los proyectos en este repositorio están en constante evolución y sirven principalmente como material de aprendizaje.*
