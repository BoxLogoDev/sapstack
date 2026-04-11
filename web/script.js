// sapstack SAP Note Resolver — static web UI
// 정적 사이트 — data/sap-notes.yaml을 parse하여 검색 UI 제공
// GitHub Pages에서 작동하며 data/sap-notes.yaml을 raw.githubusercontent.com으로 가져옵니다.

const DATA_URL = 'https://raw.githubusercontent.com/BoxLogoDev/sapstack/main/data/sap-notes.yaml';

let allNotes = [];
let currentCategory = 'all';
let currentQuery = '';

// ────────────────────────────────────────────────────
// Simple YAML parser (sap-notes.yaml 특화)
// ────────────────────────────────────────────────────
function parseSapNotesYaml(text) {
  const notes = [];
  const lines = text.split('\n');
  let current = null;
  let inNotes = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim() === 'notes:') {
      inNotes = true;
      continue;
    }
    if (line.trim() === 'meta:') {
      inNotes = false;
      if (current) notes.push(current);
      break;
    }
    if (!inNotes) continue;

    // 새 엔트리 시작
    const idMatch = line.match(/^\s*-\s*id:\s*"?([^"]+)"?/);
    if (idMatch) {
      if (current) notes.push(current);
      current = { id: idMatch[1].trim(), keywords: [], modules: [] };
      continue;
    }

    if (!current) continue;

    const titleMatch = line.match(/^\s+title:\s*"?(.+?)"?\s*$/);
    if (titleMatch) {
      current.title = titleMatch[1].replace(/"$/, '');
      continue;
    }

    const keywordsMatch = line.match(/^\s+keywords:\s*\[(.+)\]/);
    if (keywordsMatch) {
      current.keywords = keywordsMatch[1].split(',').map(k => k.trim().replace(/^["']|["']$/g, ''));
      continue;
    }

    const modulesMatch = line.match(/^\s+modules:\s*\[(.+)\]/);
    if (modulesMatch) {
      current.modules = modulesMatch[1].split(',').map(m => m.trim().replace(/^["']|["']$/g, ''));
      continue;
    }

    const releaseMatch = line.match(/^\s+release:\s*(\w+)/);
    if (releaseMatch) {
      current.release = releaseMatch[1];
      continue;
    }

    const categoryMatch = line.match(/^\s+category:\s*(\w+)/);
    if (categoryMatch) {
      current.category = categoryMatch[1];
      continue;
    }

    const urlMatch = line.match(/^\s+url:\s*(.+?)\s*$/);
    if (urlMatch) {
      current.url = urlMatch[1];
      continue;
    }
  }

  if (current && inNotes) notes.push(current);
  return notes.filter(n => n.id && n.title);
}

// ────────────────────────────────────────────────────
// Render
// ────────────────────────────────────────────────────
function renderNote(note) {
  const categoryClass = note.category || 'config';
  return `
    <div class="note-card">
      <div class="note-header">
        <div class="note-id">Note ${note.id}</div>
        <div class="note-category ${categoryClass}">${(note.category || 'general').toUpperCase()}</div>
      </div>
      <div class="note-title">${escapeHtml(note.title)}</div>
      <div class="note-meta">
        <span class="label">모듈:</span>
        ${note.modules.map(m => `<span class="module">${escapeHtml(m)}</span>`).join('')}
        <span class="label">릴리스:</span>
        <span class="release">${note.release || 'both'}</span>
      </div>
      <a href="${note.url}" target="_blank" rel="noopener noreferrer" class="note-link">
        🔗 SAP Support Portal에서 보기 →
      </a>
    </div>
  `;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function render() {
  const resultsEl = document.getElementById('results');
  const filteredCountEl = document.getElementById('filtered-count');

  let filtered = allNotes;

  // 카테고리 필터
  if (currentCategory !== 'all') {
    filtered = filtered.filter(n => n.category === currentCategory);
  }

  // 검색 필터
  if (currentQuery) {
    const q = currentQuery.toLowerCase();
    filtered = filtered.filter(n => {
      return (
        n.id.toLowerCase().includes(q) ||
        n.title.toLowerCase().includes(q) ||
        n.keywords.some(k => k.toLowerCase().includes(q)) ||
        n.modules.some(m => m.toLowerCase().includes(q))
      );
    });
  }

  filteredCountEl.textContent = filtered.length;

  if (filtered.length === 0) {
    resultsEl.innerHTML = `
      <div class="no-results">
        <p>😕 매칭되는 SAP Note가 없습니다.</p>
        <p style="margin-top: 0.5rem; font-size: 0.9rem;">
          다른 키워드를 시도하거나, <a href="https://github.com/BoxLogoDev/sapstack/issues">Issue</a>에 새 Note 추가를 요청하세요.
        </p>
      </div>
    `;
    return;
  }

  resultsEl.innerHTML = filtered.map(renderNote).join('');
}

// ────────────────────────────────────────────────────
// Init
// ────────────────────────────────────────────────────
async function init() {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    allNotes = parseSapNotesYaml(text);

    document.getElementById('total-count').textContent = allNotes.length;
    render();
  } catch (err) {
    document.getElementById('results').innerHTML = `
      <div class="no-results">
        <p>❌ 데이터 로딩 실패: ${err.message}</p>
        <p style="margin-top: 0.5rem;">
          로컬에서 열려면 <code>python3 -m http.server</code> 로 실행하세요.
        </p>
      </div>
    `;
    console.error(err);
  }
}

// Event listeners
document.getElementById('search-input').addEventListener('input', (e) => {
  currentQuery = e.target.value.trim();
  render();
});

document.querySelectorAll('.filter').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = btn.dataset.category;
    render();
  });
});

init();
