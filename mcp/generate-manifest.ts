import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import * as path from "node:path";
import {
  PROMPT_REGISTRY,
  RESOURCE_REGISTRY,
  RESOURCE_TEMPLATE_REGISTRY,
  TOOL_REGISTRY,
} from "./registry.js";
import { VERSION } from "./version.js";

const packageDir = path.dirname(fileURLToPath(import.meta.url));
const manifest = {
  $schema: "https://schema.modelcontextprotocol.io/server/v1",
  name: "sapstack",
  version: VERSION,
  description: `SAP operations advisory and Evidence Loop — ${TOOL_REGISTRY.length} tools, ${PROMPT_REGISTRY.length} prompts, ${RESOURCE_REGISTRY.length + RESOURCE_TEMPLATE_REGISTRY.length} resources/templates`,
  author: "BoxLogoDev",
  license: "MIT",
  homepage: "https://github.com/BoxLogoDev/sapstack",
  capabilities: {
    resources: { subscribe: false, listChanged: false },
    prompts: { listChanged: false },
    tools: { listChanged: false },
  },
  resources: RESOURCE_REGISTRY,
  resourceTemplates: RESOURCE_TEMPLATE_REGISTRY,
  prompts: PROMPT_REGISTRY,
  tools: TOOL_REGISTRY.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })),
  metadata: {
    toolCount: TOOL_REGISTRY.length,
    promptCount: PROMPT_REGISTRY.length,
    resourceCount: RESOURCE_REGISTRY.length + RESOURCE_TEMPLATE_REGISTRY.length,
    runtime: "@boxlogodev/sapstack-runtime",
  },
};

await writeFile(path.join(packageDir, "sapstack-server.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`generated MCP manifest v${VERSION}`);
