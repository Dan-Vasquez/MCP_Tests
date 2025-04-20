import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "calculadora-server",
  version: "1.0.0"
});

// Definir la función de suma
server.defineFunction({
  name: "suma",
  description: "Suma dos números y devuelve el resultado",
  parameters: z.object({
    a: z.number().describe("Primer número para sumar"),
    b: z.number().describe("Segundo número para sumar")
  }),
  returnType: z.number(),
  handler: async ({ a, b }) => {
    return a + b;
  }
});

// Definir la función de resta
server.defineFunction({
  name: "resta",
  description: "Resta el segundo número del primero y devuelve el resultado",
  parameters: z.object({
    a: z.number().describe("Número del que se resta"),
    b: z.number().describe("Número a restar")
  }),
  returnType: z.number(),
  handler: async ({ a, b }) => {
    return a - b;
  }
});

// Definir la función de multiplicación
server.defineFunction({
  name: "multiplicacion",
  description: "Multiplica dos números y devuelve el resultado",
  parameters: z.object({
    a: z.number().describe("Primer factor"),
    b: z.number().describe("Segundo factor")
  }),
  returnType: z.number(),
  handler: async ({ a, b }) => {
    return a * b;
  }
});

// Definir la función de división
server.defineFunction({
  name: "division",
  description: "Divide el primer número por el segundo y devuelve el resultado",
  parameters: z.object({
    a: z.number().describe("Dividendo"),
    b: z.number().describe("Divisor")
  }),
  returnType: z.number(),
  handler: async ({ a, b }) => {
    if (b === 0) {
      throw new Error("No se puede dividir por cero");
    }
    return a / b;
  }
});

// Conectar el servidor
const transport = new StdioServerTransport();
await server.connect(transport);