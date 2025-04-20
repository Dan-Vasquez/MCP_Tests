import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fetch from "node-fetch";

const server = new McpServer({
  name: "clima-server",
  version: "1.0.0"
});

// API key para OpenWeatherMap (deberías obtener una gratis en su sitio web)
const API_KEY = "tu_api_key_aqui"; // Reemplazar con tu API key real

// Definir la función para obtener el clima actual por ciudad
server.defineFunction({
  name: "obtenerClimaActual",
  description: "Obtiene información del clima actual para una ciudad específica",
  parameters: z.object({
    ciudad: z.string().describe("Nombre de la ciudad para consultar el clima")
  }),
  returnType: z.object({
    ciudad: z.string(),
    pais: z.string(),
    temperatura: z.number(),
    sensacionTermica: z.number(),
    descripcion: z.string(),
    humedad: z.number(),
    velocidadViento: z.number()
  }),
  handler: async ({ ciudad }) => {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(ciudad)}&units=metric&lang=es&appid=${API_KEY}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error al obtener datos del clima: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        ciudad: data.name,
        pais: data.sys.country,
        temperatura: data.main.temp,
        sensacionTermica: data.main.feels_like,
        descripcion: data.weather[0].description,
        humedad: data.main.humidity,
        velocidadViento: data.wind.speed
      };
    } catch (error) {
      console.error("Error:", error);
      throw new Error(`No se pudo obtener información del clima para ${ciudad}: ${error.message}`);
    }
  }
});

// Definir función para obtener pronóstico de 5 días
server.defineFunction({
  name: "obtenerPronostico",
  description: "Obtiene el pronóstico del clima para los próximos 5 días",
  parameters: z.object({
    ciudad: z.string().describe("Nombre de la ciudad para consultar el pronóstico")
  }),
  returnType: z.array(
    z.object({
      fecha: z.string(),
      temperaturaMax: z.number(),
      temperaturaMin: z.number(),
      descripcion: z.string()
    })
  ),
  handler: async ({ ciudad }) => {
    try {
      const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(ciudad)}&units=metric&lang=es&appid=${API_KEY}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error al obtener pronóstico: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Procesar los datos para obtener el pronóstico por día
      const pronosticoPorDia = {};
      
      // La API devuelve datos cada 3 horas, los agrupamos por día
      data.list.forEach(item => {
        const fecha = item.dt_txt.split(' ')[0]; // Formato YYYY-MM-DD
        
        if (!pronosticoPorDia[fecha]) {
          pronosticoPorDia[fecha] = {
            temperaturaMax: -Infinity,
            temperaturaMin: Infinity,
            descripciones: {}
          };
        }
        
        // Actualizar temperaturas máximas y mínimas
        if (item.main.temp_max > pronosticoPorDia[fecha].temperaturaMax) {
          pronosticoPorDia[fecha].temperaturaMax = item.main.temp_max;
        }
        
        if (item.main.temp_min < pronosticoPorDia[fecha].temperaturaMin) {
          pronosticoPorDia[fecha].temperaturaMin = item.main.temp_min;
        }
        
        // Contar las descripciones para elegir la más común
        const descripcion = item.weather[0].description;
        pronosticoPorDia[fecha].descripciones[descripcion] = 
          (pronosticoPorDia[fecha].descripciones[descripcion] || 0) + 1;
      });
      
      // Convertir el objeto a un array de resultados
      return Object.keys(pronosticoPorDia).map(fecha => {
        // Encontrar la descripción más común para ese día
        let maxCount = 0;
        let descripcionComun = "";
        
        Object.entries(pronosticoPorDia[fecha].descripciones).forEach(([desc, count]) => {
          if (count > maxCount) {
            maxCount = count;
            descripcionComun = desc;
          }
        });
        
        return {
          fecha,
          temperaturaMax: pronosticoPorDia[fecha].temperaturaMax,
          temperaturaMin: pronosticoPorDia[fecha].temperaturaMin,
          descripcion: descripcionComun
        };
      });
    } catch (error) {
      console.error("Error:", error);
      throw new Error(`No se pudo obtener el pronóstico para ${ciudad}: ${error.message}`);
    }
  }
});

// Definir función para obtener recomendaciones basadas en el clima
server.defineFunction({
  name: "obtenerRecomendaciones",
  description: "Obtiene recomendaciones basadas en las condiciones climáticas actuales",
  parameters: z.object({
    ciudad: z.string().describe("Nombre de la ciudad")
  }),
  returnType: z.object({
    recomendaciones: z.array(z.string()),
    condicionesActuales: z.string()
  }),
  handler: async ({ ciudad }) => {
    try {
      // Reutilizar la función anterior para obtener el clima actual
      const clima = await server.callFunction("obtenerClimaActual", { ciudad });
      
      // Generar recomendaciones basadas en las condiciones
      const recomendaciones = [];
      
      // Recomendaciones basadas en temperatura
      if (clima.temperatura > 30) {
        recomendaciones.push("Mantente hidratado y usa protector solar");
        recomendaciones.push("Evita actividades al aire libre entre 11 AM y 3 PM");
      } else if (clima.temperatura > 25) {
        recomendaciones.push("Usa ropa ligera y lleva agua contigo");
      } else if (clima.temperatura < 10) {
        recomendaciones.push("Abrígate bien, las temperaturas están bajas");
      } else if (clima.temperatura < 5) {
        recomendaciones.push("Usa varias capas de ropa y evita exposición prolongada al frío");
      }
      
      // Recomendaciones basadas en condiciones climáticas
      if (clima.descripcion.includes("lluvia")) {
        recomendaciones.push("Lleva paraguas y calzado impermeable");
      } else if (clima.descripcion.includes("nieve")) {
        recomendaciones.push("Ten precaución al conducir y usa calzado antideslizante");
      } else if (clima.descripcion.includes("tormenta")) {
        recomendaciones.push("Evita actividades al aire libre y mantente alejado de árboles y postes eléctricos");
      }
      
      // Recomendaciones basadas en viento
      if (clima.velocidadViento > 20) {
        recomendaciones.push("Hay fuertes vientos, ten cuidado con objetos que puedan volar");
      }
      
      // Si no hay recomendaciones específicas
      if (recomendaciones.length === 0) {
        recomendaciones.push("Las condiciones climáticas son favorables para actividades al aire libre");
      }
      
      return {
        recomendaciones,
        condicionesActuales: `${clima.temperatura}°C, ${clima.descripcion}`
      };
    } catch (error) {
      console.error("Error:", error);
      throw new Error(`No se pudieron generar recomendaciones: ${error.message}`);
    }
  }
});

// Conectar el servidor
const transport = new StdioServerTransport();
await server.connect(transport);