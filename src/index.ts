import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { server } from "./server.js";

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Car Aggregator MCP Server running on stdio transport");
}

main().catch((error) => {
  console.error("Fatal error in main process:", error);
  process.exit(1);
});
