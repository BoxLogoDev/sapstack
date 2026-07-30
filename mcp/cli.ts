#!/usr/bin/env node

/**
 * sapstack MCP CLI — command-line wrapper for MCP server
 *
 * Usage:
 *   npx sapstack-mcp [--version] [--help] [--offline] [--sessions-dir PATH]
 */

import { parseArgs } from "node:util";
import { startStdio } from "./server.js";
import { VERSION } from "./version.js";

async function main() {
  const { values, positionals } = parseArgs({
    options: {
      version: { type: "boolean", short: "v" },
      help: { type: "boolean", short: "h" },
      offline: { type: "boolean" },
      "sessions-dir": { type: "string" },
    },
    strict: true,
    allowPositionals: true,
  });

  if (values.help) {
    console.log(`
sapstack MCP Server v${VERSION}

Usage:
  sapstack-mcp [OPTIONS]

Options:
  -v, --version          Show version
  -h, --help            Show this help
  --offline             Run in offline mode (skip network calls)
  --sessions-dir PATH   Custom sessions directory (default: .sapstack/sessions)

Examples:
  sapstack-mcp
  sapstack-mcp --offline
  sapstack-mcp --sessions-dir /tmp/sapstack-sessions
    `);
    process.exit(0);
  }

  if (values.version) {
    console.log(`sapstack MCP v${VERSION}`);
    process.exit(0);
  }

  const options = {
    offline: values.offline || false,
    sessionsDir: values["sessions-dir"],
  };

  if (options.offline) {
    console.error("[sapstack MCP] Running in offline mode");
  }

  if (options.sessionsDir) {
    console.error(`[sapstack MCP] Sessions directory: ${options.sessionsDir}`);
  }

  console.error("[sapstack MCP] Server starting...");
  if (options.offline) {
    process.env.SAPSTACK_OFFLINE = "1";
  }
  await startStdio({ sessionsDir: options.sessionsDir });
}

main().catch((err) => {
  console.error("CLI error:", err);
  process.exit(1);
});
