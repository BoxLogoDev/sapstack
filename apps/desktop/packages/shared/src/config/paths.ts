/**
 * Centralized path configuration for sapstack Desktop.
 *
 * Supports multi-instance development via SAPSTACK_DESKTOP_CONFIG_DIR environment variable.
 * When running from a numbered folder (e.g., craft-tui-agent-1), the detect-instance.sh
 * script sets SAPSTACK_DESKTOP_CONFIG_DIR to ~/.sapstack-desktop-1, allowing multiple instances to run
 * simultaneously with separate configurations.
 *
 * Default (non-numbered folders): ~/.sapstack-desktop/
 * Instance 1 (-1 suffix): ~/.sapstack-desktop-1/
 * Instance 2 (-2 suffix): ~/.sapstack-desktop-2/
 */

import { homedir } from 'os';
import { join } from 'path';

// Allow override via environment variable for multi-instance dev
// Falls back to default ~/.sapstack-desktop/ for production and non-numbered dev folders
export const CONFIG_DIR = process.env.SAPSTACK_DESKTOP_CONFIG_DIR
  || process.env.CRAFT_CONFIG_DIR // Legacy source compatibility for one migration cycle.
  || join(homedir(), '.sapstack-desktop');
