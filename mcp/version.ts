import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

function readVersion(): string {
  for (const candidate of ["./package.json", "../package.json"]) {
    try {
      const value = require(candidate) as { name?: string; version?: string };
      if (value.name === "@boxlogodev/sapstack-mcp" && value.version) return value.version;
    } catch {
      // The first candidate differs between source and bundled execution.
    }
  }
  throw new Error("Unable to resolve @boxlogodev/sapstack-mcp package version");
}

export const VERSION = readVersion();
