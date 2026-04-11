// triage.js — sapstack 엔드유저 셀프 트리아지 포털 로직
//
// 설계 원칙:
//   1. 정적 사이트로 유지 — 서버 없음, 빌드 없음, 모든 로직 브라우저 내
//   2. data/symptom-index.yaml을 raw.githubusercontent.com에서 직접 fetch
//   3. 심플한 fuzzy 매칭: 토큰 교집합 + 부분 문자열 + T-code 히트
//   4. 결과는 로컬 스토리지에 저장하지 않음 (개인정보 보호)
//   5. 에스컬레이션 페이로드는 Markdown 포맷으로 운영자 CLI에 바로 먹도록

const DATA_URL = 'https://raw.githubusercontent.com/BoxLogoDev/sapstack/main/data/symptom-index.yaml';
const SYNONYMS_URL = 'https://raw.githubusercontent.com/BoxLogoDev/sapstack/main/data/synonyms.yaml';

// 개발/로컬 환경용 폴백 — 같은 디렉토리의 data/ 경로
const LOCAL_DATA_URL = '../data/symptom-index.yaml';
const LOCAL_SYNONYMS_URL = '../data/synonyms.yaml';

let symptoms = [];
let synonyms = null;  // { variantToCanonical: Map, canonicalToAllForms: Map }
let selectedLang = 'ko';
let selectedCountry = 'kr';

// ────────────────────────────────────────────────────
// YAML 간이 파서 — symptom-index.yaml 특화
//
// 풀 YAML 파서 대신, 이 파일의 알려진 구조만 처리.
// 추후 symptom-index.yaml 구조가 복잡해지면 js-yaml을 CDN 로드로 전환.
// ────────────────────────────────────────────────────
function parseSymptomIndex(text) {
  const lines = text.split('\n');
  const out = [];
  let current = null;
  let currentKey = null;
  let currentSubKey = null;
  let inSymptoms = false;
  let indent = 0;

  const stripQuotes = s => {
    s = s.trim();
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
      return s.slice(1, -1);
    }
    return s;
  };

  const parseInlineArray = s => {
    // [a, b, "c d"] → ['a', 'b', 'c d']
    const inner = s.trim().replace(/^\[|\]$/g, '');
    if (!inner) return [];
    return inner.split(',').map(x => stripQuotes(x));
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (!raw.trim() || raw.trim().startsWith('#')) continue;

    // Top-level: symptoms:
    if (/^symptoms:\s*$/.test(raw)) {
      inSymptoms = true;
      continue;
    }

    // meta: 뒤는 파싱 중단
    if (/^meta:\s*$/.test(raw)) {
      if (current) out.push(current);
      inSymptoms = false;
      break;
    }
    if (!inSymptoms) continue;

    // 새 엔트리: "  - id: sym-..."
    const entryMatch = raw.match(/^\s{2}-\s+id:\s*(.+)$/);
    if (entryMatch) {
      if (current) out.push(current);
      current = {
        id: stripQuotes(entryMatch[1]),
        symptom_ko: '',
        symptom_ko_variants: [],   // 🆕 Slice 8-c
        symptom_en: '',
        symptom_de: '',             // 🆕 Slice 6
        symptom_ja: '',             // 🆕 Slice 6
        likely_modules: [],
        first_check_tcodes: [],
        typical_causes: [],
        evidence_needed: [],
        localized_checks: {},
        severity: 'medium',
        recurrence: 'common',
        related_sap_notes: [],
      };
      currentKey = null;
      currentSubKey = null;
      continue;
    }
    if (!current) continue;

    // 4-space indented fields
    const fieldMatch = raw.match(/^\s{4}(\w+):\s*(.*)$/);
    if (fieldMatch) {
      const key = fieldMatch[1];
      const val = fieldMatch[2];
      currentKey = key;
      currentSubKey = null;

      if (val.startsWith('[') && val.endsWith(']')) {
        current[key] = parseInlineArray(val);
      } else if (val === '') {
        // multi-line block — 🆕 symptom_ko_variants 포함
        current[key] = (['typical_causes','evidence_needed','related_sap_notes','symptom_ko_variants'].includes(key))
          ? []
          : (key === 'localized_checks' ? {} : '');
      } else {
        current[key] = stripQuotes(val);
      }
      continue;
    }

    // 6-space indented list item: "      - item"
    const listItemMatch = raw.match(/^\s{6}-\s*(.+)$/);
    if (listItemMatch) {
      const item = listItemMatch[1].trim();

      // evidence_needed는 인라인 맵 형태
      // - { type: transaction_log, target: "...", priority: critical }
      if (currentKey === 'evidence_needed' && item.startsWith('{')) {
        const obj = {};
        const body = item.replace(/^\{|\}$/g, '');
        body.split(',').forEach(pair => {
          const [k, v] = pair.split(':').map(s => s.trim());
          if (k && v !== undefined) obj[k] = stripQuotes(v);
        });
        current.evidence_needed.push(obj);
      } else if (Array.isArray(current[currentKey])) {
        current[currentKey].push(stripQuotes(item));
      }
      continue;
    }

    // 6-space indented key-value (localized_checks 하위)
    const subKeyMatch = raw.match(/^\s{6}(\w+):\s*$/);
    if (subKeyMatch && currentKey === 'localized_checks') {
      currentSubKey = subKeyMatch[1];
      current.localized_checks[currentSubKey] = [];
      continue;
    }

    // 8-space indented list item under localized_checks.kr
    const deepListMatch = raw.match(/^\s{8}-\s*(.+)$/);
    if (deepListMatch && currentSubKey && current.localized_checks[currentSubKey]) {
      current.localized_checks[currentSubKey].push(stripQuotes(deepListMatch[1].trim()));
      continue;
    }
  }

  if (current) out.push(current);
  return out.filter(s => s.id);
}

// ────────────────────────────────────────────────────
// synonyms.yaml 로드 — terms + abbreviations + business_time
// 간이 파서: "- canonical: xxx" 블록만 읽고 variants/primary 추출
// ────────────────────────────────────────────────────
function parseSynonyms(text) {
  const variantToCanonical = new Map();   // "코스트센터" → "cost_center"
  const canonicalToAllForms = new Map();  // "cost_center" → ["코스트 센터", "원가센터", "KOSTL", ...]
  const lines = text.split('\n');

  let currentCanonical = null;
  let currentForms = [];

  const flush = () => {
    if (currentCanonical && currentForms.length) {
      canonicalToAllForms.set(currentCanonical, currentForms);
      for (const form of currentForms) {
        const key = form.toLowerCase().replace(/\s+/g, '');
        if (!variantToCanonical.has(key)) {
          variantToCanonical.set(key, currentCanonical);
        }
      }
    }
    currentCanonical = null;
    currentForms = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (!raw.trim() || raw.trimStart().startsWith('#')) continue;

    // 새 canonical 엔트리 시작
    const canonicalMatch = raw.match(/^\s*-\s+canonical:\s*(\S+)/);
    if (canonicalMatch) {
      flush();
      currentCanonical = canonicalMatch[1].trim();
      continue;
    }
    if (!currentCanonical) continue;

    // field_forms: [BSEG, BKPF, ...]
    const fieldMatch = raw.match(/^\s+field_forms?:\s*\[([^\]]+)\]/);
    if (fieldMatch) {
      fieldMatch[1].split(',').forEach(f => currentForms.push(f.trim().replace(/['"]/g, '')));
      continue;
    }

    // en: Cost Center
    const enMatch = raw.match(/^\s+en:\s*(.+)$/);
    if (enMatch) {
      currentForms.push(enMatch[1].trim().replace(/^['"]|['"]$/g, ''));
      continue;
    }

    // short: TR (abbreviations)
    const shortMatch = raw.match(/^\s*-\s+short:\s*(\S+)/);
    if (shortMatch) {
      flush();
      currentCanonical = shortMatch[1].trim();
      currentForms.push(currentCanonical);
      continue;
    }

    // ko: "xxx"  (inline)
    const koInlineMatch = raw.match(/^\s+ko:\s*(?:\{\s*primary:\s*)?["']([^"']+)["']/);
    if (koInlineMatch) {
      currentForms.push(koInlineMatch[1].trim());
      continue;
    }

    // primary: "xxx" (block under ko:)
    const primaryMatch = raw.match(/^\s+primary:\s*["']([^"']+)["']/);
    if (primaryMatch) {
      currentForms.push(primaryMatch[1].trim());
      continue;
    }

    // variants: [...]  or  ko_variants: [...]
    const variantsMatch = raw.match(/^\s+(?:ko_)?variants:\s*\[([^\]]+)\]/);
    if (variantsMatch) {
      variantsMatch[1].split(',').forEach(v => {
        const clean = v.trim().replace(/^['"]|['"]$/g, '');
        if (clean) currentForms.push(clean);
      });
      continue;
    }

    // business_time canonical entry: "- canonical: d_minus_1"
    // 그리고 "    ko: 'D-1'" 단일 라인
    // 이미 위에서 처리됨
  }
  flush();

  return { variantToCanonical, canonicalToAllForms };
}

// 쿼리 토큰을 synonym canonical로 확장
// "코스트센터 변경" → 원래 토큰 + cost_center의 모든 variants
function expandQueryTokens(tokens) {
  if (!synonyms) return { original: tokens, expanded: [] };
  const expanded = new Set();
  const hitCanonicals = new Set();

  // 개별 토큰 매칭
  for (const t of tokens) {
    const key = t.toLowerCase().replace(/\s+/g, '');
    if (synonyms.variantToCanonical.has(key)) {
      const canonical = synonyms.variantToCanonical.get(key);
      hitCanonicals.add(canonical);
    }
  }

  // 2그램/3그램 매칭 — "코스트 센터" 같은 복합어
  for (let n = 2; n <= 3; n++) {
    for (let i = 0; i <= tokens.length - n; i++) {
      const ngram = tokens.slice(i, i + n).join('');
      if (synonyms.variantToCanonical.has(ngram)) {
        hitCanonicals.add(synonyms.variantToCanonical.get(ngram));
      }
    }
  }

  // 확장: 각 canonical의 모든 form을 추가
  for (const c of hitCanonicals) {
    const forms = synonyms.canonicalToAllForms.get(c) || [];
    for (const f of forms) {
      expanded.add(f.toLowerCase());
    }
  }

  return { original: tokens, expanded: Array.from(expanded), hits: Array.from(hitCanonicals) };
}

// ────────────────────────────────────────────────────
// Fuzzy 매칭 — symptoms × query
// ────────────────────────────────────────────────────
const STOP_WORDS_KO = ['에서', '때문', '안', '잘', '좀', '거', '것', '수', '이', '가', '을', '를', '은', '는', '도', '만', '의', '에', '와', '과'];
const STOP_WORDS_EN = ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'of', 'to', 'in', 'on', 'at', 'for', 'with'];

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[.,!?'"()\[\]{}]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 2)
    .filter(t => !STOP_WORDS_KO.includes(t) && !STOP_WORDS_EN.includes(t));
}

function extractTcodes(text) {
  // SAP T-code 패턴: 영문대문자/숫자 2-8자, 일반적으로 "F110", "SE16N", "MIGO", "ST22"
  const matches = text.toUpperCase().match(/\b[A-Z]{2}[0-9A-Z]{1,6}\b/g) || [];
  return Array.from(new Set(matches));
}

function scoreSymptom(sym, queryTokens, queryTcodes, expansion, lang) {
  let score = 0;
  const candidates = [];

  // 언어별 증상 필드 — primary
  if (lang === 'ko' && sym.symptom_ko) candidates.push(sym.symptom_ko);
  if (sym.symptom_en) candidates.push(sym.symptom_en);
  if (lang === 'de' && sym.symptom_de) candidates.push(sym.symptom_de);
  if (lang === 'ja' && sym.symptom_ja) candidates.push(sym.symptom_ja);

  // 🆕 Slice 8-c: ko_variants를 매칭 대상에 포함
  if (lang === 'ko' && Array.isArray(sym.symptom_ko_variants)) {
    sym.symptom_ko_variants.forEach(v => candidates.push(v));
  }

  // 🆕 Slice 8-c: typical_causes도 fuzzy 매칭에 포함 (발화체 원인 수용)
  if (Array.isArray(sym.typical_causes)) {
    sym.typical_causes.forEach(c => candidates.push(c));
  }

  candidates.push(sym.id);
  (sym.likely_modules || []).forEach(m => candidates.push(m));
  (sym.first_check_tcodes || []).forEach(t => candidates.push(t));

  const hay = candidates.join(' ').toLowerCase();
  const hayTokens = tokenize(hay);

  // 원본 쿼리 토큰 점수
  queryTokens.forEach(qt => {
    if (hayTokens.some(ht => ht.includes(qt) || qt.includes(ht))) {
      score += 2;
    }
    if (hay.includes(qt)) {
      score += 1;
    }
  });

  // 🆕 Slice 8-d: synonym 확장 토큰 점수 (가중치 더 높음)
  //    사용자가 정확한 SAP 용어를 알고 있다는 신호이므로 가중
  if (expansion && expansion.expanded) {
    expansion.expanded.forEach(et => {
      if (hay.includes(et)) {
        score += 3;  // 원본 토큰보다 +1 가중
      }
    });

    // canonical이 매칭된 수만큼 보너스 (다양한 synonym이 맞으면 신호 강함)
    if (expansion.hits && expansion.hits.length > 0) {
      score += Math.min(expansion.hits.length * 1.5, 6);
    }
  }

  // T-code 히트는 큰 가중
  queryTcodes.forEach(qtc => {
    if ((sym.first_check_tcodes || []).map(t => t.toUpperCase()).includes(qtc)) {
      score += 5;
    }
    if (hay.toUpperCase().includes(qtc)) {
      score += 3;
    }
  });

  // severity/recurrence 가중
  if (sym.severity === 'critical') score += 0.5;
  if (sym.recurrence === 'frequent') score += 0.3;

  return score;
}

function normalizeConfidence(score, maxScore) {
  if (maxScore === 0) return 0;
  return Math.min(score / maxScore, 1);
}

// ────────────────────────────────────────────────────
// Render 결과
// ────────────────────────────────────────────────────
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function confidenceTier(c) {
  if (c >= 0.65) return 'high';
  if (c >= 0.35) return 'medium';
  return 'low';
}

function confidenceLabel(tier) {
  return { high: '높음', medium: '중간', low: '낮음' }[tier];
}

function renderSymptomCard(sym, confidence, query) {
  const tier = confidenceTier(confidence);
  const primaryText = selectedLang === 'ko' ? sym.symptom_ko : sym.symptom_en;
  const modules = (sym.likely_modules || []).map(m => `<span class="module-pill">${escapeHtml(m)}</span>`).join('');
  const tcodes = (sym.first_check_tcodes || []).map(t => `<span class="tcode-pill">${escapeHtml(t)}</span>`).join('');
  const causes = (sym.typical_causes || [])
    .map(c => `<li>${escapeHtml(c)}</li>`)
    .join('');

  const localized = sym.localized_checks && sym.localized_checks[selectedCountry];
  let localizedBlock = '';
  if (localized && localized.length > 0) {
    const items = localized.map(l => `<li>${escapeHtml(l)}</li>`).join('');
    const flag = { kr: '🇰🇷', de: '🇩🇪', us: '🇺🇸', jp: '🇯🇵' }[selectedCountry] || '🌐';
    localizedBlock = `
      <div class="localized-checks">
        <div class="localized-checks-label">${flag} 지역 특화 체크</div>
        <ul>${items}</ul>
      </div>
    `;
  }

  return `
    <div class="symptom-card" data-id="${escapeHtml(sym.id)}">
      <div class="symptom-card-header">
        <div class="symptom-card-title">${escapeHtml(primaryText || sym.id)}</div>
        <div class="confidence-badge ${tier}">신뢰도: ${confidenceLabel(tier)} (${Math.round(confidence * 100)}%)</div>
      </div>
      <div class="symptom-meta">
        ${modules} · ${tcodes}
      </div>
      ${causes ? `<ul class="typical-causes">${causes}</ul>` : ''}
      ${localizedBlock}
      <button class="escalate-btn" data-sym="${escapeHtml(sym.id)}" data-query="${escapeHtml(query)}">
        → 이 증상으로 운영자 에스컬레이션
      </button>
    </div>
  `;
}

function renderResults(results, query) {
  const listEl = document.getElementById('results-list');
  const summaryEl = document.getElementById('results-summary');
  const stepResults = document.getElementById('step-results');
  stepResults.hidden = false;

  if (results.length === 0) {
    summaryEl.innerHTML = `<strong>매칭된 증상이 없습니다.</strong>`;
    listEl.innerHTML = `
      <div class="no-match">
        <strong>그래도 도움이 필요하시죠?</strong>
        아래 4단계에서 운영자에게 증상을 그대로 전달할 수 있습니다.
      </div>
    `;
    // 에스컬레이션 섹션 항상 표시
    showEscalationSection(query, null);
    return;
  }

  summaryEl.innerHTML = `
    <strong>${results.length}개 증상</strong>이 매칭되었습니다.
    가장 관련 있는 순서로 정렬되어 있습니다. 아래 힌트로 해결이 어렵다면
    운영자 에스컬레이션 버튼을 사용하세요.
  `;
  listEl.innerHTML = results
    .map(({ sym, confidence }) => renderSymptomCard(sym, confidence, query))
    .join('');

  // 각 카드의 escalate 버튼에 이벤트 바인딩
  listEl.querySelectorAll('.escalate-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const symId = btn.dataset.sym;
      const matchedSym = symptoms.find(s => s.id === symId);
      showEscalationSection(query, matchedSym);
    });
  });
}

// ────────────────────────────────────────────────────
// Escalation payload (Markdown for operator CLI)
// ────────────────────────────────────────────────────
function buildHandoffPayload(query, matchedSym) {
  const timestamp = new Date().toISOString();
  const lines = [];
  lines.push(`# sapstack Triage Handoff`);
  lines.push('');
  lines.push(`- 생성 시각: ${timestamp}`);
  lines.push(`- 언어: ${selectedLang}`);
  lines.push(`- 국가: ${selectedCountry}`);
  lines.push(`- Surface: web_triage`);
  lines.push('');
  lines.push(`## 원본 증상 설명 (엔드유저 입력)`);
  lines.push('');
  lines.push(query.split('\n').map(l => `> ${l}`).join('\n'));
  lines.push('');
  if (matchedSym) {
    lines.push(`## 매칭된 증상 인덱스 엔트리`);
    lines.push('');
    lines.push(`- ID: \`${matchedSym.id}\``);
    lines.push(`- 관련 모듈: ${(matchedSym.likely_modules || []).join(', ')}`);
    lines.push(`- 초기 체크 T-code: ${(matchedSym.first_check_tcodes || []).join(', ')}`);
    if (matchedSym.typical_causes && matchedSym.typical_causes.length > 0) {
      lines.push('');
      lines.push(`### 전형적 원인`);
      matchedSym.typical_causes.forEach(c => lines.push(`- ${c}`));
    }
    const local = matchedSym.localized_checks && matchedSym.localized_checks[selectedCountry];
    if (local && local.length > 0) {
      lines.push('');
      lines.push(`### ${selectedCountry.toUpperCase()} 지역 특화 체크`);
      local.forEach(l => lines.push(`- ${l}`));
    }
  } else {
    lines.push(`## 매칭된 증상 인덱스 엔트리`);
    lines.push('');
    lines.push(`(매칭 없음 — 운영자가 증상 텍스트를 바탕으로 새 세션 시작)`);
  }
  lines.push('');
  lines.push(`## 운영자 다음 행동`);
  lines.push('');
  lines.push('Claude Code에서 아래 커맨드를 실행하세요:');
  lines.push('');
  lines.push('```bash');
  const sympShort = query.replace(/\n/g, ' ').replace(/"/g, '\\"').slice(0, 120);
  lines.push(`/sap-session-start "${sympShort}" \\`);
  lines.push(`  --country ${selectedCountry} \\`);
  lines.push(`  --language ${selectedLang} \\`);
  lines.push(`  --reporter-role end_user`);
  lines.push('```');
  lines.push('');
  lines.push(`세션이 시작되면 \`/sap-session-next-turn <session_id>\` 로 Hypothesis 턴을 진행합니다.`);
  lines.push('');
  lines.push(`---`);
  lines.push('');
  lines.push(`🔒 개인정보 필터: 자동 스캔 대상 — 주민번호 패턴(\\d{6}-\\d{7}), 카드번호 패턴(\\d{4}-\\d{4}-\\d{4}-\\d{4})`);
  lines.push(`   위 패턴이 감지되면 이 페이로드를 복사하지 마시고 마스킹 후 재시도하세요.`);
  return lines.join('\n');
}

function scanForPII(text) {
  const patterns = [
    { name: '주민등록번호', re: /\d{6}-\d{7}/ },
    { name: '카드번호', re: /\d{4}-\d{4}-\d{4}-\d{4}/ },
    { name: '비밀번호 단어', re: /password|비밀번호|passwd/i },
  ];
  return patterns.filter(p => p.re.test(text)).map(p => p.name);
}

function showEscalationSection(query, matchedSym) {
  const stepEl = document.getElementById('step-escalation');
  const ta = document.getElementById('handoff-payload');
  stepEl.hidden = false;
  const payload = buildHandoffPayload(query, matchedSym);
  ta.value = payload;

  const piiHits = scanForPII(query);
  const note = stepEl.querySelector('.privacy-note');
  if (piiHits.length > 0) {
    note.innerHTML = `
      ⚠️ <strong>개인정보 감지</strong>: 입력에 다음 패턴이 포함되어 있습니다 — ${piiHits.join(', ')}.
      복사 전 반드시 마스킹하세요. 해당 부분을 <code>***</code>로 교체 후 다시 "진단 힌트 받기"를 눌러주세요.
    `;
  } else {
    note.innerHTML = `
      🔒 <strong>개인정보 주의</strong>: 페이로드에 주민번호·카드번호·비밀번호가
      포함되지 않았는지 복사 전 확인하세요. sapstack은 증상 텍스트를 외부로
      전송하지 않으며, 모든 매칭은 브라우저 안에서 수행됩니다.
    `;
  }

  // Smooth scroll
  stepEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ────────────────────────────────────────────────────
// 메인 흐름
// ────────────────────────────────────────────────────
async function fetchWithFallback(remoteUrl, localUrl) {
  try {
    const r = await fetch(remoteUrl);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.text();
  } catch (err) {
    console.warn('[sapstack triage] Remote load failed, trying local', err);
    const r = await fetch(localUrl);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.text();
  }
}

async function loadSymptoms() {
  try {
    const text = await fetchWithFallback(DATA_URL, LOCAL_DATA_URL);
    symptoms = parseSymptomIndex(text);
    console.log(`[sapstack triage] ${symptoms.length} symptoms loaded`);
  } catch (err) {
    console.error('[sapstack triage] Symptom load failed', err);
    document.getElementById('results-summary').innerHTML =
      `<strong>데이터 로드 실패</strong>: symptom-index를 불러올 수 없습니다.`;
  }

  // 🆕 Slice 8-d: synonyms.yaml 로드 (실패해도 fallback으로 동작)
  try {
    const text = await fetchWithFallback(SYNONYMS_URL, LOCAL_SYNONYMS_URL);
    synonyms = parseSynonyms(text);
    console.log(`[sapstack triage] ${synonyms.canonicalToAllForms.size} synonym canonicals loaded`);
  } catch (err) {
    console.warn('[sapstack triage] Synonyms not loaded — matching will work without expansion', err);
    synonyms = null;
  }
}

function runTriage() {
  const query = document.getElementById('symptom-text').value.trim();
  if (!query) {
    alert('증상을 한 문장 이상 입력해주세요.');
    return;
  }

  selectedLang = document.getElementById('lang-select').value;
  selectedCountry = document.getElementById('country-select').value;

  const queryTokens = tokenize(query);
  const queryTcodes = extractTcodes(query);
  const expansion = expandQueryTokens(queryTokens);

  if (expansion.hits && expansion.hits.length > 0) {
    console.log('[sapstack triage] Query expanded via synonyms:', expansion.hits);
  }

  const scored = symptoms
    .map(sym => ({ sym, score: scoreSymptom(sym, queryTokens, queryTcodes, expansion, selectedLang) }))
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score);

  const maxScore = scored[0]?.score || 1;
  const results = scored
    .slice(0, 5)
    .map(({ sym, score }) => ({ sym, confidence: normalizeConfidence(score, maxScore) }));

  renderResults(results, query);
}

// Event bindings
document.addEventListener('DOMContentLoaded', async () => {
  await loadSymptoms();

  document.getElementById('triage-submit').addEventListener('click', runTriage);

  // 예시 칩 클릭
  document.querySelectorAll('.example-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.getElementById('symptom-text').value = chip.dataset.text;
    });
  });

  // 복사 버튼
  document.getElementById('copy-payload').addEventListener('click', async () => {
    const ta = document.getElementById('handoff-payload');
    try {
      await navigator.clipboard.writeText(ta.value);
      const btn = document.getElementById('copy-payload');
      const original = btn.textContent;
      btn.textContent = '✅ 복사 완료';
      setTimeout(() => { btn.textContent = original; }, 2000);
    } catch (err) {
      ta.select();
      document.execCommand('copy');
    }
  });

  // 다운로드 버튼
  document.getElementById('download-payload').addEventListener('click', () => {
    const ta = document.getElementById('handoff-payload');
    const blob = new Blob([ta.value], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    a.download = `sapstack-handoff-${ts}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Ctrl+Enter로 빠른 실행
  document.getElementById('symptom-text').addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      runTriage();
    }
  });
});
