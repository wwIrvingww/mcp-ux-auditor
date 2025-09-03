import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z, type ZodRawShape } from "zod";import { analyzeHtml } from "./analysis.js";

const mcpServer = new McpServer({
  name: "mcp-ux-auditor",
  version: "0.1.0",
});


const InputShape: ZodRawShape = {
  html: z.string().min(1, "html requerido"),
};
mcpServer.registerTool(
  "ux_audit.analyze",
  {
    title: "UX Auditor - Analyze HTML",
    description: "Analiza HTML y devuelve métricas básicas de UX.",
    inputSchema: InputShape,              // <-- aquí el cambio
  },
  async (args) => {
    const { html } = z.object(InputShape).parse(args);
    const report = analyzeHtml(html);
    return { content: [{ type: "text", text: JSON.stringify(report, null, 2) }] };
  }
);



async function main() {
  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);

}

main().catch((err) => {
  console.error("MCP server error:", err);
  process.exit(1);
});
