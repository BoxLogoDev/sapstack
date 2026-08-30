// Version is read from package.json — the single source of truth.
// All build scripts, CI workflows, and runtime code use this value.
// sapstack fork: 이 값은 릴리스 때 apps/electron/package.json 과 함께 올려야 한다 —
// 설정 → 앱 → 정보의 버전 표시, OAuth User-Agent, 시스템 프롬프트가 전부 이 값을 읽는다
// (0.11.2 로 방치돼 정보 화면이 upstream 버전을 보여주던 사고의 재발 방지).
import pkg from '../../package.json';

export const APP_VERSION: string = pkg.version;

export function getAppVersion(): string {
  return APP_VERSION;
}

export * from './install.ts';
export * from './manifest.ts';
export * from './version.ts';
