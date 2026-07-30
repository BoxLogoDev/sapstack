import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { getBundledAssetsDir } from '../utils/paths.ts';

/**
 * Seed the built-in SAP skills, agents, and commands without duplicating their
 * prompt content in Desktop source. Existing workspace overrides always win.
 */
export function seedSapstackKnowledge(rootPath: string): void {
  const assetsRoot = getBundledAssetsDir('sapstack');
  if (!assetsRoot || !existsSync(assetsRoot)) return;

  const skillsDest = join(rootPath, 'skills');
  mkdirSync(skillsDest, { recursive: true });
  const pluginsRoot = join(assetsRoot, 'plugins');
  if (existsSync(pluginsRoot)) {
    for (const plugin of readdirSync(pluginsRoot, { withFileTypes: true }).filter(entry => entry.isDirectory())) {
      const source = join(pluginsRoot, plugin.name, 'skills', plugin.name);
      const destination = join(skillsDest, plugin.name);
      if (existsSync(source) && !existsSync(destination)) cpSync(source, destination, { recursive: true });
    }
  }

  for (const directory of ['agents', 'commands']) {
    const sourceRoot = join(assetsRoot, directory);
    const destinationRoot = join(rootPath, directory);
    if (!existsSync(sourceRoot)) continue;
    mkdirSync(destinationRoot, { recursive: true });
    for (const entry of readdirSync(sourceRoot, { withFileTypes: true }).filter(item => item.isFile())) {
      const destination = join(destinationRoot, entry.name);
      if (!existsSync(destination)) cpSync(join(sourceRoot, entry.name), destination);
    }
  }
}
