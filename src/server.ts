// src/server.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { analyzeHtml } from "./analysis.js";

const mcpServer = new McpServer({
  name: "mcp-ux-auditor",
  version: "0.1.0",
});

// Define esquema de entrada con zod (opcional pero recomendable)
const InputSchema = z.object({
  html: z.string().min(1, "html requerido"),
});

// Registrar la tool usando la API actual
mcpServer.registerTool(
  "ux_audit.analyze",
  {
    title: "UX Auditor - Analyze HTML",
    description: "Analiza HTML y devuelve métricas básicas de UX.",
    inputSchema: {
      type: "object",
      properties: { html: { type: "string" } },
      required: ["html"],
    },
  },
  async (args) => {
    const parsed = InputSchema.parse(args);
    const report = analyzeHtml(parsed.html);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(report, null, 2),
        },
      ],
    };
  }
);

// Conectar transporte STDIO
async function main() {
  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);
  // Nota: no imprimir por stdout; logs deben usar stderr o archivos
  // (el proceso quedará a la espera de llamadas por STDIO)
}

main().catch((err) => {
  // escribe errores a stderr para no romper el protocolo STDIO
  console.error("MCP server error:", err);
  process.exit(1);
});
