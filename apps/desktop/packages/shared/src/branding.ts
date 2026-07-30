/**
 * Centralized branding assets for sapstack Desktop
 * Used by OAuth callback pages
 */

export const SAPSTACK_DESKTOP_LOGO = [
  '██████  █████  ██████  ███████ ████████  █████   ██████ ██   ██',
  '██     ██   ██ ██   ██ ██         ██    ██   ██ ██      ██  ██ ',
  '██████ ███████ ██████  ███████    ██    ███████ ██      █████  ',
  '    ██ ██   ██ ██           ██    ██    ██   ██ ██      ██  ██ ',
  '██████ ██   ██ ██      ███████    ██    ██   ██  ██████ ██   ██',
] as const;

/** Logo as a single string for HTML templates */
export const SAPSTACK_DESKTOP_LOGO_HTML = SAPSTACK_DESKTOP_LOGO.map((line) => line.trimEnd()).join('\n');

/** Session viewer base URL */
export const VIEWER_URL = 'https://boxlogodev.github.io/sapstack/session.html';
