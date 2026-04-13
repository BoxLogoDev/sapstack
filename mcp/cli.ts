#!/usr/bin/env node

/**
 * sapstack MCP CLI — command-line wrapper for MCP server
 *
 * Usage:
 *   npx sapstack-mcp [--version] [--help] [--offline] [--sessions-dir PATH]
 */

import { parseArgs } from "node:util";
import { startServer } from "./server.js";

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
sapstack MCP Server v1.6.0

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
    console.log("sapstack MCP v1.6.0");
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

  // Start the server (stdio transport is set up in server.ts)
  console.error("[sapstack MCP] Server starting...");
  // The server is already set up with stdio transport in server.ts main()
  // This CLI is just a wrapper that parses CLI args and could set environment variables
}

main().catch((err) => {
  console.error("CLI error:", err);
  process.exit(1);
});
