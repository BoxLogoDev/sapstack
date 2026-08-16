/**
 * 폐쇄망(망분리) 모드.
 *
 * SAP 운영망은 대개 인터넷이 차단돼 있고, 외부로 나가는 요청이 존재한다는 사실
 * 자체가 보안 심사 탈락 사유가 된다. 이 모드가 켜지면 앱은 크래시 리포팅과
 * 업데이트 폴링을 아예 시작하지 않는다.
 *
 * 활성 조건 — 하나만 참이어도 켜진다.
 *   1) SAPSTACK_AIRGAPPED 환경변수. 배포 이미지나 런처에서 고정할 때 쓴다.
 *   2) ~/.sapstack/config.yaml 의 `air_gapped: true`. 사용자가 설정에서 켤 때.
 *
 * Sentry 초기화보다 먼저 평가돼야 해서 동기로 읽는다. 같은 이유로 js-yaml 을
 * 쓰지 않고 해당 키 한 줄만 정규식으로 확인한다 — 판정 하나 때문에 YAML 파서를
 * 부트 경로에 끌어들일 이유가 없다.
 */
import { readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";

let cached: boolean | undefined;

function detect(): boolean {
  const flag = process.env.SAPSTACK_AIRGAPPED;
  if (flag && flag !== "0" && flag.toLowerCase() !== "false") return true;

  try {
    // sapstack-runtime.ts 의 environmentProfilePath() 와 같은 규칙을 쓴다.
    const configPath = join(
      process.env.SAPSTACK_WORKSPACE || homedir(),
      ".sapstack",
      "config.yaml",
    );
    return /^[ \t]*air_gapped[ \t]*:[ \t]*true[ \t]*$/m.test(
      readFileSync(configPath, "utf8"),
    );
  } catch {
    // 파일이 없거나 읽지 못하면 설정되지 않은 것으로 본다. 기본을 "켜짐"으로
    // 두면 일반 사용자가 업데이트를 영원히 받지 못한다.
    return false;
  }
}

/**
 * 프로세스 수명 동안 한 번만 판정한다. 설정을 바꾸면 재시작이 필요하다 —
 * Sentry 는 이미 init 된 뒤에 끌 수 없기 때문에 런타임 토글은 의미가 없다.
 */
export function isAirGapped(): boolean {
  if (cached === undefined) cached = detect();
  return cached;
}
