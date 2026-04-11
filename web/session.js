// session.js — sapstack Evidence Loop 세션 뷰어
//
// 설계:
//   1. 읽기 전용 — 세션 상태를 절대 수정하지 않음
//   2. 의존성 0 — 빌드 없음, CDN 없음, 간이 YAML 파서 내장
//   3. 파일은 드래그앤드롭 또는 파일 선택으로 로드
//   4. 데모 모드 — F110 dog-food 시나리오를 하드코딩된 샘플로 제공
//   5. 모든 렌더링은 session-state.schema.yaml 구조를 참조

// ────────────────────────────────────────────────────
// 아주 간단한 YAML 파서 (session-state 구조 특화)
// ────────────────────────────────────────────────────
function simpleYamlParse(text) {
  // 이 파서는 session-state.yaml의 알려진 구조만 처리합니다.
  // 복잡한 YAML(앵커·다중 문서·복잡한 들여쓰기 변경)은 지원하지 않습니다.
  // 필요 시 js-yaml로 교체하세요.

  const root = {};
  const lines = text.split('\n');
  const stack = [{ indent: -1, obj: root, key: null }];

  function currentParent() {
    return stack[stack.length - 1];
  }

  function parseScalar(s) {
    s = s.trim();
    if (s === '') return '';
    if (s === 'null' || s === '~') return null;
    if (s === 'true') return true;
    if (s === 'false') return false;
    if (/^-?\d+$/.test(s)) return parseInt(s, 10);
    if (/^-?\d+\.\d+$/.test(s)) return parseFloat(s);
    // quoted string
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
      return s.slice(1, -1);
    }
    // inline array
    if (s.startsWith('[') && s.endsWith(']')) {
      const inner = s.slice(1, -1).trim();
      if (!inner) return [];
      return inner.split(',').map(x => parseScalar(x.trim()));
    }
    // inline object
    if (s.startsWith('{') && s.endsWith('}')) {
      const obj = {};
      const inner = s.slice(1, -1).trim();
      if (!inner) return {};
      inner.split(',').forEach(pair => {
        const idx = pair.indexOf(':');
        if (idx > 0) {
          const k = pair.slice(0, idx).trim();
          const v = parseScalar(pair.slice(idx + 1).trim());
          obj[k] = v;
        }
      });
      return obj;
    }
    return s;
  }

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (raw.trim() === '' || raw.trim().startsWith('#')) continue;

    // Calculate indent
    const indent = raw.length - raw.trimStart().length;
    const line = raw.trim();

    // Pop stack until parent indent < current
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }
    const parent = currentParent().obj;

    // Array item
    if (line.startsWith('- ')) {
      const rest = line.slice(2).trim();
      // Parent must be array
      let arr = parent;
      if (!Array.isArray(arr)) {
        // parent.key should point to array
        const lastKey = currentParent().key;
        if (lastKey && Array.isArray(parent[lastKey])) {
          arr = parent[lastKey];
        } else if (lastKey) {
          parent[lastKey] = [];
          arr = parent[lastKey];
        }
      }

      // Object array item: "- key: value"
      const kvMatch = rest.match(/^([\w.-]+):\s*(.*)$/);
      if (kvMatch) {
        const obj = {};
        const key = kvMatch[1];
        const val = kvMatch[2];
        if (val === '') {
          obj[key] = null; // to be filled by children
          arr.push(obj);
          stack.push({ indent, obj, key });
        } else {
          obj[key] = parseScalar(val);
          arr.push(obj);
          stack.push({ indent, obj, key: null });
        }
      } else {
        // Scalar array item
        arr.push(parseScalar(rest));
      }
      continue;
    }

    // Key-value
    const kvMatch = line.match(/^([\w.-]+):\s*(.*)$/);
    if (kvMatch) {
      const key = kvMatch[1];
      const val = kvMatch[2];

      if (val === '' || val === null) {
        parent[key] = parent[key] || {};
        stack.push({ indent, obj: parent[key], key: null });
        currentParent().key = key;
      } else {
        parent[key] = parseScalar(val);
        currentParent().key = key;
      }
    }
  }

  return root;
}

// ────────────────────────────────────────────────────
// 렌더링 헬퍼
// ────────────────────────────────────────────────────
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

function formatTime(iso) {
  if (!iso) return '-';
  try {
    const d = new Date(iso);
    return d.toLocaleString('ko-KR', { hour12: false });
  } catch {
    return iso;
  }
}

// ────────────────────────────────────────────────────
// 세션 데이터 렌더링
// ────────────────────────────────────────────────────
function renderSession(data) {
  if (!data || !data.session_id) {
    showError('state.yaml로 보이지 않습니다. session_id 필드가 없습니다.');
    return;
  }

  document.getElementById('session-id-display').textContent = data.session_id;
  renderHeader(data);
  renderTimeline(data);
  renderHypotheses(data);
  renderVerdicts(data);
  renderAudit(data);

  document.getElementById('step-session').hidden = false;
  document.getElementById('step-timeline').hidden = false;
  document.getElementById('step-hypotheses').hidden = false;
  document.getElementById('step-verdicts').hidden = false;
  document.getElementById('step-audit').hidden = false;
}

function renderHeader(data) {
  const ctx = data.sap_context || {};
  const reporter = data.initial_symptom || {};
  const html = `
    <div class="session-meta-grid">
      <div class="session-meta-item">
        <span class="label">Status</span>
        <span class="value"><span class="status-pill ${data.status || 'intake'}">${escapeHtml(data.status || 'intake')}</span></span>
      </div>
      <div class="session-meta-item">
        <span class="label">Created</span>
        <span class="value">${escapeHtml(formatTime(data.created_at))}</span>
      </div>
      <div class="session-meta-item">
        <span class="label">Release</span>
        <span class="value">${escapeHtml(ctx.release || '-')}</span>
      </div>
      <div class="session-meta-item">
        <span class="label">Deployment</span>
        <span class="value">${escapeHtml(ctx.deployment || '-')}</span>
      </div>
      <div class="session-meta-item">
        <span class="label">Client</span>
        <span class="value">${escapeHtml(ctx.client || '-')}</span>
      </div>
      <div class="session-meta-item">
        <span class="label">Country</span>
        <span class="value">${escapeHtml((ctx.country_iso || '').toUpperCase() || '-')}</span>
      </div>
      <div class="session-meta-item">
        <span class="label">Language</span>
        <span class="value">${escapeHtml(ctx.language || '-')}</span>
      </div>
      <div class="session-meta-item">
        <span class="label">Turn #</span>
        <span class="value">${escapeHtml(data.current_turn_number || '-')}</span>
      </div>
    </div>
    ${reporter.description ? `
      <div style="margin-top: 0.85rem; padding: 0.75rem 0.95rem; background: #0d1117; border-left: 3px solid #58a6ff; border-radius: 2px;">
        <div style="font-size: 0.75rem; color: #8b949e; margin-bottom: 0.3rem;">초기 증상</div>
        <div style="color: #c9d1d9; font-size: 0.9rem; line-height: 1.5;">${escapeHtml(reporter.description)}</div>
        ${reporter.matched_symptom_index_entry ? `<div style="margin-top: 0.3rem; font-size: 0.78rem; color: #8b949e;">매칭: <code>${escapeHtml(reporter.matched_symptom_index_entry)}</code></div>` : ''}
      </div>
    ` : ''}
  `;
  document.getElementById('session-header').innerHTML = html;
}

function renderTimeline(data) {
  const turns = data.turns || [];
  if (turns.length === 0) {
    document.getElementById('timeline-list').innerHTML = '<div class="no-match">턴 기록이 없습니다.</div>';
    return;
  }

  const html = turns.map(t => {
    const refs = t.artifact_refs || {};
    const artifacts = [];
    if (refs.bundle_ids) refs.bundle_ids.forEach(id => artifacts.push(`<span class="artifact-ref">${escapeHtml(id)}</span>`));
    if (refs.hypothesis_ids) refs.hypothesis_ids.forEach(id => artifacts.push(`<span class="artifact-ref">${escapeHtml(id)}</span>`));
    if (refs.followup_request_id) artifacts.push(`<span class="artifact-ref">${escapeHtml(refs.followup_request_id)}</span>`);
    if (refs.verdict_id) artifacts.push(`<span class="artifact-ref">${escapeHtml(refs.verdict_id)}</span>`);

    return `
      <div class="turn-card turn-type-${t.turn_type || 'unknown'}">
        <div class="turn-card-head">
          <div class="title">Turn ${t.turn_number} — ${escapeHtml((t.turn_type || '').toUpperCase())}</div>
          <div class="time">${escapeHtml(formatTime(t.started_at))}${t.completed_at ? ' → ' + formatTime(t.completed_at) : ''}</div>
        </div>
        <div class="turn-card-body">
          상태: <strong>${escapeHtml(t.status || '-')}</strong> · Surface: ${escapeHtml(t.surface || '-')}
          ${t.duration_minutes !== undefined ? ` · 소요: ${t.duration_minutes}분` : ''}
          ${artifacts.length > 0 ? `<div>${artifacts.join('')}</div>` : ''}
        </div>
      </div>
    `;
  }).join('');

  document.getElementById('timeline-list').innerHTML = html;
}

function renderHypotheses(data) {
  const hypos = data.hypotheses || [];
  if (hypos.length === 0) {
    document.getElementById('hypotheses-list').innerHTML = '<div class="no-match">제안된 가설이 없습니다.</div>';
    return;
  }

  const html = hypos.map(h => {
    const chainHtml = Array.isArray(h.technical_chain) && h.technical_chain.length > 0
      ? `<ul class="hypo-chain">${h.technical_chain.map(c => `<li>${escapeHtml(c)}</li>`).join('')}</ul>`
      : '';

    const falsifHtml = Array.isArray(h.falsification_evidence) && h.falsification_evidence.length > 0
      ? `
        <div class="hypo-falsif">
          <div class="hypo-falsif-label">반증 조건</div>
          <ul>
            ${h.falsification_evidence.map(f => `<li><strong>${escapeHtml(f.then)}</strong>: ${escapeHtml(f.if_observed)}</li>`).join('')}
          </ul>
        </div>
      `
      : '';

    return `
      <div class="hypo-card">
        <div class="hypo-card-head">
          <div class="hypo-id">${escapeHtml(h.hypothesis_id)} — 신뢰도 ${(h.confidence_tier || '-')} (${((h.confidence || 0) * 100).toFixed(0)}%)</div>
          <div class="hypo-status ${h.status || 'proposed'}">${escapeHtml(h.status || 'proposed')}</div>
        </div>
        <div class="hypo-statement">${escapeHtml(h.statement || '')}</div>
        ${chainHtml}
        ${falsifHtml}
        ${h.impacted_modules && h.impacted_modules.length > 0 ? `
          <div style="margin-top: 0.5rem; font-size: 0.78rem; color: #8b949e;">
            영향 모듈: ${h.impacted_modules.map(m => `<span class="module-pill">${escapeHtml(m)}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  document.getElementById('hypotheses-list').innerHTML = html;
}

function renderVerdicts(data) {
  const verdicts = data.verdicts || [];
  if (verdicts.length === 0) {
    document.getElementById('verdicts-list').innerHTML = '<div class="no-match">Verdict가 아직 없습니다.</div>';
    return;
  }

  const html = verdicts.map(v => {
    const resolutions = (v.resolutions || []).map(r => {
      const fixPlan = r.fix_plan ? `
        <div class="fix-plan">
          <div class="fix-plan-label">🛠 Fix Plan</div>
          ${r.fix_plan.audience ? `<div style="font-size: 0.78rem; color: #8b949e; margin-bottom: 0.35rem;">대상: ${escapeHtml(r.fix_plan.audience)} · Transport: ${r.fix_plan.transport_required ? '필요' : '불필요'} · 리뷰어: ${r.fix_plan.reviewer_required ? '필수' : '선택'}</div>` : ''}
          ${Array.isArray(r.fix_plan.steps) ? `
            <ol class="fix-steps">
              ${r.fix_plan.steps.map(s => `<li>${escapeHtml(s.description || '')}${s.tcode ? ` <code>${escapeHtml(s.tcode)}</code>` : ''}${s.menu_path ? `<br><span style="font-size: 0.78rem; color: #8b949e;">메뉴: ${escapeHtml(s.menu_path)}</span>` : ''}</li>`).join('')}
            </ol>
          ` : ''}
        </div>
      ` : '';

      const rollbackPlan = r.rollback_plan ? `
        <div class="rollback-plan">
          <div class="rollback-plan-label">↩️ Rollback Plan</div>
          ${Array.isArray(r.rollback_plan.trigger_conditions) ? `
            <div style="font-size: 0.78rem; color: #f0883e; margin-bottom: 0.35rem;">
              트리거: ${r.rollback_plan.trigger_conditions.map(t => escapeHtml(t)).join(' · ')}
            </div>
          ` : ''}
          ${Array.isArray(r.rollback_plan.steps) ? `
            <ol class="fix-steps">
              ${r.rollback_plan.steps.map(s => `<li>${escapeHtml(s.description || '')}${s.tcode ? ` <code>${escapeHtml(s.tcode)}</code>` : ''}</li>`).join('')}
            </ol>
          ` : ''}
        </div>
      ` : '';

      const preventionPlan = r.prevention_plan ? `
        <div class="prevention-plan">
          <div class="prevention-plan-label">🛡 Prevention</div>
          ${Array.isArray(r.prevention_plan.recommendations) ? `
            <ul style="padding-left: 1.3rem; font-size: 0.82rem;">
              ${r.prevention_plan.recommendations.map(rec => `<li>${escapeHtml(rec)}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      ` : '';

      return `
        <div class="resolution-block ${r.status || ''}">
          <div style="font-weight: 600; color: #f0f6fc; margin-bottom: 0.4rem;">
            ${escapeHtml(r.hypothesis_id)} — <span class="hypo-status ${r.status}">${escapeHtml(r.status)}</span>
          </div>
          ${fixPlan}
          ${rollbackPlan}
          ${preventionPlan}
        </div>
      `;
    }).join('');

    return `
      <div class="verdict-card">
        <div class="verdict-overall ${v.overall_state || ''}">${escapeHtml(v.overall_state || '-')}</div>
        <div style="color: #c9d1d9; font-size: 0.88rem; margin-bottom: 0.6rem; line-height: 1.5;">${escapeHtml(v.summary || '')}</div>
        ${resolutions}
      </div>
    `;
  }).join('');

  document.getElementById('verdicts-list').innerHTML = html;
}

function renderAudit(data) {
  const trail = data.audit_trail || [];
  if (trail.length === 0) {
    document.getElementById('audit-list').innerHTML = '<div class="no-match">Audit trail이 없습니다.</div>';
    return;
  }

  const html = trail.map(e => `
    <div class="audit-line">
      <span class="audit-time">${escapeHtml(formatTime(e.at))}</span>
      <span class="audit-action">${escapeHtml(e.action || '')}</span>
      <span class="audit-note">${escapeHtml((e.actor && e.actor.role) || '-')} · ${escapeHtml(e.ref_id || '')} ${e.note ? '— ' + escapeHtml(e.note) : ''}</span>
    </div>
  `).join('');

  document.getElementById('audit-list').innerHTML = html;
}

function showError(msg) {
  document.getElementById('step-session').hidden = false;
  document.getElementById('session-id-display').textContent = '오류';
  document.getElementById('session-header').innerHTML = `<div class="session-error">${escapeHtml(msg)}</div>`;
}

// ────────────────────────────────────────────────────
// 파일 로드
// ────────────────────────────────────────────────────
function handleFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const text = e.target.result;
      let data;
      if (file.name.endsWith('.json')) {
        data = JSON.parse(text);
      } else {
        data = simpleYamlParse(text);
      }
      renderSession(data);
    } catch (err) {
      console.error(err);
      showError(`파일 파싱 실패: ${err.message}`);
    }
  };
  reader.readAsText(file);
}

// ────────────────────────────────────────────────────
// Demo 세션 (F110 dog-food)
// ────────────────────────────────────────────────────
const DEMO_SESSION = {
  session_id: 'sess-20260412-demo12',
  schema_version: '1.0.0',
  created_at: '2026-04-12T09:10:00+09:00',
  last_updated_at: '2026-04-12T09:35:00+09:00',
  originating_surface: 'cli',
  status: 'resolved',
  current_turn_number: 4,
  created_by: { role: 'operator', handle: 'demo-ops' },
  initial_symptom: {
    description: "F110 Proposal 실패 — 벤더 100234 한 건만 'No valid payment method', 어제까지 정상",
    reporter_role: 'operator',
    language: 'ko',
    country_iso: 'kr',
    matched_symptom_index_entry: 'sym-f110-no-payment-method',
  },
  sap_context: {
    release: 'S4_2022',
    deployment: 'on_premise',
    client: '100',
    country_iso: 'kr',
    language: 'ko',
  },
  turns: [
    { turn_number: 1, turn_type: 'intake', status: 'complete', started_at: '2026-04-12T09:10:00+09:00', completed_at: '2026-04-12T09:15:00+09:00', surface: 'cli', duration_minutes: 5, artifact_refs: { bundle_ids: ['evb-20260412-a7k3qz'] } },
    { turn_number: 2, turn_type: 'hypothesis', status: 'complete', started_at: '2026-04-12T09:15:00+09:00', completed_at: '2026-04-12T09:18:00+09:00', surface: 'cli', duration_minutes: 3, artifact_refs: { hypothesis_ids: ['h-001','h-002','h-003','h-004'], followup_request_id: 'flr-20260412-b8m2nc' } },
    { turn_number: 3, turn_type: 'collect', status: 'complete', started_at: '2026-04-12T09:18:00+09:00', completed_at: '2026-04-12T09:30:00+09:00', surface: 'cli', duration_minutes: 12, artifact_refs: { bundle_ids: ['evb-20260412-d9p2xr'] } },
    { turn_number: 4, turn_type: 'verify', status: 'complete', started_at: '2026-04-12T09:30:00+09:00', completed_at: '2026-04-12T09:35:00+09:00', surface: 'cli', duration_minutes: 5, artifact_refs: { verdict_id: 'vdc-20260412-c4n8qw' } },
  ],
  hypotheses: [
    {
      hypothesis_id: 'h-001',
      statement: '벤더 100234의 LFB1.ZWELS 공란 — F110이 지급방법 후보를 못 찾음',
      confidence: 0.55,
      confidence_tier: 'medium',
      impacted_modules: ['FI','TR'],
      status: 'inconclusive',
      technical_chain: [
        'F110 Proposal은 LFB1-ZWELS를 읽어 후보 결정',
        'ZWELS 공란이면 Bank Determination 이전 드롭',
      ],
      falsification_evidence: [
        { if_observed: "LFB1.ZWELS = 'T'", then: 'refute' },
      ],
    },
    {
      hypothesis_id: 'h-002',
      statement: '어제 17:42 사용자가 벤더 100234의 LFB1.ZWELS를 T → 공란으로 변경',
      confidence: 0.70,
      confidence_tier: 'high',
      impacted_modules: ['FI'],
      status: 'confirmed',
      technical_chain: [
        'CDHDR/CDPOS에 LFB1 변경 이력 기록됨',
        '변경 이후 F110이 지급방법을 못 찾아 실패',
      ],
      falsification_evidence: [
        { if_observed: 'CDHDR에 어제 17:00 이후 변경 없음', then: 'refute' },
      ],
    },
    {
      hypothesis_id: 'h-003',
      statement: 'FBZP Bank Determination에서 지급방법 T 제거',
      confidence: 0.25,
      confidence_tier: 'low',
      impacted_modules: ['FI'],
      status: 'refuted',
      falsification_evidence: [
        { if_observed: '다른 벤더는 T로 정상 처리', then: 'refute' },
      ],
    },
    {
      hypothesis_id: 'h-004',
      statement: '컨트롤 가설: 일시적 WP 오류 — 재시도로 해결',
      confidence: 0.10,
      confidence_tier: 'low',
      impacted_modules: ['BASIS'],
      status: 'refuted',
      falsification_evidence: [
        { if_observed: '재시도 시 동일 에러 반복', then: 'refute' },
      ],
    },
  ],
  verdicts: [
    {
      verdict_id: 'vdc-20260412-c4n8qw',
      overall_state: 'resolved',
      summary: 'H2(어제 17:42 ZWELS 변경) 확정. 1 체크 만에 근본 원인 도달.',
      resolutions: [
        {
          hypothesis_id: 'h-002',
          status: 'confirmed',
          fix_plan: {
            audience: 'operator',
            transport_required: false,
            reviewer_required: true,
            steps: [
              { step_number: 1, description: 'XK02 실행', tcode: 'XK02', menu_path: 'Accounting → Financial accounting → Accounts payable → Master records → Change' },
              { step_number: 2, description: '벤더 100234 → 회사코드 1000 → Payment transactions → ZWELS="T" → Save' },
            ],
          },
          rollback_plan: {
            trigger_conditions: ['F110 재실행 시 다른 에러 발생', '원천세 계산 비정상'],
            steps: [
              { step_number: 1, description: 'XK02에서 ZWELS 공란으로 되돌리기', tcode: 'XK02' },
            ],
          },
          prevention_plan: {
            recommendations: [
              '벤더 마스터 변경 권한 검토 (SUIM)',
              'ZWELS 공란 주 1회 모니터링',
            ],
          },
        },
      ],
    },
  ],
  audit_trail: [
    { at: '2026-04-12T09:10:00+09:00', action: 'session_created', actor: { role: 'operator' }, ref_id: 'sess-20260412-demo12' },
    { at: '2026-04-12T09:15:00+09:00', action: 'bundle_added', actor: { role: 'operator' }, ref_id: 'evb-20260412-a7k3qz' },
    { at: '2026-04-12T09:18:00+09:00', action: 'hypothesis_proposed', actor: { role: 'operator' }, ref_id: 'h-001', note: '+3 others' },
    { at: '2026-04-12T09:18:00+09:00', action: 'followup_requested', actor: { role: 'operator' }, ref_id: 'flr-20260412-b8m2nc' },
    { at: '2026-04-12T09:30:00+09:00', action: 'bundle_added', actor: { role: 'operator' }, ref_id: 'evb-20260412-d9p2xr', note: 'chk-001, chk-002 matched' },
    { at: '2026-04-12T09:35:00+09:00', action: 'hypothesis_confirmed', actor: { role: 'operator' }, ref_id: 'h-002' },
    { at: '2026-04-12T09:35:00+09:00', action: 'verdict_issued', actor: { role: 'operator' }, ref_id: 'vdc-20260412-c4n8qw' },
  ],
};

// ────────────────────────────────────────────────────
// 이벤트 바인딩
// ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  });

  document.getElementById('load-demo').addEventListener('click', () => {
    renderSession(DEMO_SESSION);
  });
});
