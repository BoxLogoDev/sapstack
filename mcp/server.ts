import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as yaml from "js-yaml";
import { SapstackRuntime } from "../packages/runtime/src/index.js";
import {
  dispatchTool,
  PROMPT_REGISTRY,
  RESOURCE_REGISTRY,
  RESOURCE_TEMPLATE_REGISTRY,
  TOOL_REGISTRY,
} from "./registry.js";
import { VERSION } from "./version.js";

function textResult(value: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text:
          typeof value === "string" ? value : JSON.stringify(value, null, 2),
      },
    ],
  };
}

async function readResource(
  runtime: SapstackRuntime,
  uri: string,
): Promise<{ mimeType: string; text: string }> {
  const staticAssets: Record<string, [string, string]> = {
    "sapstack://rules/universal": ["AGENTS.md", "text/markdown"],
    "sapstack://data/tcodes": ["data/tcodes.yaml", "application/yaml"],
    "sapstack://data/sap-notes": ["data/sap-notes.yaml", "application/yaml"],
    "sapstack://data/symptom-index": [
      "data/symptom-index.yaml",
      "application/yaml",
    ],
  };
  const staticAsset = staticAssets[uri];
  if (staticAsset)
    return {
      mimeType: staticAsset[1],
      text: await runtime.assets.readText(staticAsset[0]),
    };

  if (uri === "sapstack://sessions/list") {
    return {
      mimeType: "application/json",
      text: JSON.stringify(await runtime.sessions.list({ limit: 50 }), null, 2),
    };
  }

  const skill = uri.match(/^sapstack:\/\/skill\/([a-z0-9-]+)$/);
  if (skill) {
    const plugin = skill[1].startsWith("sap-") ? skill[1] : `sap-${skill[1]}`;
    return {
      mimeType: "text/markdown",
      text: await runtime.assets.readText(
        `plugins/${plugin}/skills/${plugin}/SKILL.md`,
      ),
    };
  }

  const schema = uri.match(/^sapstack:\/\/schema\/([a-z0-9-]+)$/);
  if (schema)
    return {
      mimeType: "application/yaml",
      text: await runtime.assets.readText(`schemas/${schema[1]}.schema.yaml`),
    };

  const bundle = uri.match(
    /^sapstack:\/\/session\/(sess-[0-9]{8}-[a-z0-9]{6})\/bundle\/(evb-[0-9]{8}-[a-z0-9]{6})$/,
  );
  if (bundle) {
    const state = await runtime.sessions.get(bundle[1]);
    const value = state.bundles?.find(
      (entry: any) => entry.bundle_id === bundle[2],
    );
    if (!value) throw new Error(`Evidence bundle not found: ${bundle[2]}`);
    return {
      mimeType: "application/yaml",
      text: yaml.dump(value, { lineWidth: -1, noRefs: true }),
    };
  }

  const session = uri.match(
    /^sapstack:\/\/session\/(sess-[0-9]{8}-[a-z0-9]{6})$/,
  );
  if (session)
    return {
      mimeType: "application/yaml",
      text: yaml.dump(await runtime.sessions.get(session[1]), {
        lineWidth: -1,
        noRefs: true,
      }),
    };

  throw new Error(`Unknown resource URI: ${uri}`);
}

export function createSapstackMcpServer(runtime: SapstackRuntime): Server {
  const server = new Server(
    { name: "sapstack-mcp", version: VERSION },
    { capabilities: { tools: {}, prompts: {}, resources: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOL_REGISTRY.map(({ name, description, inputSchema }) => ({
      name,
      description,
      inputSchema,
    })),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      return textResult(
        await dispatchTool(
          runtime,
          request.params.name,
          request.params.arguments || {},
        ),
      );
    } catch (error) {
      return {
        ...textResult(`Error: ${(error as Error).message}`),
        isError: true,
      };
    }
  });

  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: [...RESOURCE_REGISTRY],
  }));
  server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => ({
    resourceTemplates: [...RESOURCE_TEMPLATE_REGISTRY],
  }));
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const result = await readResource(runtime, request.params.uri);
    return {
      contents: [
        {
          uri: request.params.uri,
          mimeType: result.mimeType,
          text: result.text,
        },
      ],
    };
  });

  server.setRequestHandler(ListPromptsRequestSchema, async () => ({
    prompts: [...PROMPT_REGISTRY],
  }));
  server.setRequestHandler(GetPromptRequestSchema, async (request) => ({
    description: PROMPT_REGISTRY.find(
      (prompt) => prompt.name === request.params.name,
    )?.description,
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: await runtime.knowledge.getPrompt(
            request.params.name,
            request.params.arguments || {},
          ),
        },
      },
    ],
  }));

  return server;
}

export async function startStdio(
  options: { sessionsDir?: string } = {},
): Promise<void> {
  const runtime = await SapstackRuntime.create({
    moduleUrl: import.meta.url,
    sessionsDir: options.sessionsDir,
  });
  const server = createSapstackMcpServer(runtime);
  await server.connect(new StdioServerTransport());
  console.error(`[sapstack MCP] v${VERSION} ready on stdio`);
}
