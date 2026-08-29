-- export-cbo.lua — vsp lua 워커: CBO(Z/Y) 소스 열거·수집·파일 기록
--
-- 입력(env — export-cbo.mjs 가 설정):
--   VSP_CBO_PATTERNS  패키지/이름 패턴 CSV (예: "Z*,Y*")
--   VSP_CBO_EXCLUDE   제외 패키지 CSV (정확 일치)
--   VSP_CBO_OUT       src 출력 루트 (예: C:/Users/x/.sapstack/cbo/DS4/src)
--   VSP_CBO_TYPEMAP   "TYPE=ext" CSV — naming.mjs 가 직렬화 (단일 원천 유지)
--   VSP_CBO_CLASINC   "include=suffix" CSV — CLAS 부속 include
--   VSP_CBO_DRY       "1" 이면 파일 미기록 (열거·카운트만)
--   VSP_CBO_LIMIT     테스트용 객체 수 상한 (0/미설정 = 무제한)
--   VSP_CBO_MAX       searchObject max (기본 100000)
--
-- 출력(stdout): 객체당 JSON 1줄
--   {"name":"...","type":"...","package":"...","file":"...","status":"ok|skip|fail","reason":"...","loc":N}
-- 진행 로그는 stderr.

local function getenv(k, d) local v = os.getenv(k); if v == nil or v == '' then return d end return v end
local function eprint(s) io.stderr:write(s .. '\n') end

local function splitCsv(s)
  local out = {}
  for item in string.gmatch(s or '', '([^,]+)') do
    item = item:match('^%s*(.-)%s*$')
    if #item > 0 then out[#out + 1] = item end
  end
  return out
end

-- JSON 문자열 이스케이프 (값은 SAP 오브젝트명/경로라 단순하지만 방어적으로)
local function jstr(s)
  s = tostring(s or '')
  s = s:gsub('\\', '\\\\'):gsub('"', '\\"'):gsub('\n', '\\n'):gsub('\r', '\\r'):gsub('\t', '\\t')
  return '"' .. s .. '"'
end

local function emit(o)
  print(string.format('{"name":%s,"type":%s,"package":%s,"file":%s,"status":%s,"reason":%s,"loc":%d}',
    jstr(o.name), jstr(o.type), jstr(o.package), jstr(o.file or ''), jstr(o.status), jstr(o.reason or ''), o.loc or 0))
end

-- ── 설정 로드 ────────────────────────────────────────────────
local patterns = splitCsv(getenv('VSP_CBO_PATTERNS', 'Z*,Y*'))
local excludeList = splitCsv(getenv('VSP_CBO_EXCLUDE', ''))
local OUT = getenv('VSP_CBO_OUT', '')
local DRY = getenv('VSP_CBO_DRY', '0') == '1'
local LIMIT = tonumber(getenv('VSP_CBO_LIMIT', '0')) or 0
local MAX = tonumber(getenv('VSP_CBO_MAX', '100000')) or 100000

if OUT == '' and not DRY then error('VSP_CBO_OUT 미설정') end

local typeExt = {}
for _, pair in ipairs(splitCsv(getenv('VSP_CBO_TYPEMAP', ''))) do
  local t, e = pair:match('^(.-)=(.+)$')
  if t then typeExt[t:upper()] = e end
end
local clasInc = {}
for _, pair in ipairs(splitCsv(getenv('VSP_CBO_CLASINC', ''))) do
  local i, s = pair:match('^(.-)=(.+)$')
  if i then clasInc[#clasInc + 1] = { include = i, suffix = s } end
end

local exclude = {}
for _, p in ipairs(excludeList) do exclude[p:upper()] = true end

-- ── 가드/매칭 (naming.mjs 와 동일 규칙) ─────────────────────
local function isCustomPackage(pkg)
  local c = (pkg or ''):sub(1, 1):upper()
  return c == 'Z' or c == 'Y' or c == '$'
end
local function matchesPatterns(pkg)
  pkg = (pkg or ''):upper()
  if not isCustomPackage(pkg) then return false end
  for _, raw in ipairs(patterns) do
    local p = raw:upper()
    if isCustomPackage(p) then
      if p:sub(-1) == '*' then
        local prefix = p:sub(1, -2)
        if pkg:sub(1, #prefix) == prefix then return true end
      elseif pkg == p then return true end
    end
  end
  return false
end

-- ── 열거: 커스텀 이름 우주 + 적응형 슬라이싱 ─────────────────
-- 열거는 "이름" 기준(searchObject), 대상 선별은 "패키지" 기준이다.
-- 패키지 ZFI1 안에 ZFI0171TOP·SAPMZFI0010·LZFI01U01 처럼 다양한 이름이
-- 살기 때문에 쿼리는 커스텀 명명 전체(Z/Y + SAPM/SAPL/L 변형)를 덮는다.
--
-- ADT quickSearch 는 결과가 아주 클 때(수만 건) 일부 오브젝트의 타입을
-- 'SOBJ/P' 로 뭉뚱그린다(인클루드가 대표 피해자). SOBJ/P 가 섞이면
-- 프리픽스를 한 글자 더 붙여 재쿼리(깊이 3까지)하고, 그래도 남으면
-- 이름 단건 재조회로 진짜 타입을 복원한다.
-- 주의: $TMP 등 $ 패키지의 비-Z/Y 이름 오브젝트는 이 우주에 안 잡힌다(문서화됨).
local ROOTS = { 'Z', 'Y', 'SAPMZ', 'SAPMY', 'SAPLZ', 'SAPLY', 'LZ', 'LY' }
local CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_'

local objects, seenObj = {}, {}
local sobjResidue = {}

local function keep(o)
  local key = o.type .. '\0' .. o.name
  if seenObj[key] then return end
  if not matchesPatterns(o.package) or exclude[(o.package or ''):upper()] then return end
  seenObj[key] = true
  if o.type == 'SOBJ/P' then
    sobjResidue[#sobjResidue + 1] = o
  else
    objects[#objects + 1] = o
  end
end

local function hasDegraded(rows)
  for i = 1, #rows do if rows[i].type == 'SOBJ/P' then return true end end
  return false
end

local function enumerate(prefix, depth)
  local rows, err = searchObject(prefix .. '*', MAX)
  if not rows then
    eprint('[enum-fail] ' .. prefix .. '*: ' .. tostring(err))
    return
  end
  if hasDegraded(rows) and depth < 3 then
    eprint('[enum] ' .. prefix .. '* -> ' .. #rows .. ' hits (타입 열화) — 세분화')
    for c in CHARS:gmatch('.') do enumerate(prefix .. c, depth + 1) end
    -- 프리픽스 정확 일치 이름(예: 'Z' 그 자체)은 세분화로 못 잡으므로 단건 확인
    local exact = searchObject(prefix, 5)
    if exact then for i = 1, #exact do if exact[i].name:upper() == prefix:upper() then keep(exact[i]) end end end
  else
    for i = 1, #rows do keep(rows[i]) end
  end
end

for _, root in ipairs(ROOTS) do enumerate(root, 0) end

-- 잔여 SOBJ/P: 이름 단건 재조회로 진짜 타입 복원
if #sobjResidue > 0 then
  eprint('[enum] SOBJ/P 잔여 ' .. #sobjResidue .. '건 — 단건 타입 복원')
  for idx, o in ipairs(sobjResidue) do
    local r = searchObject(o.name, 5)
    local resolved = nil
    if r then
      for i = 1, #r do
        if r[i].name:upper() == o.name:upper() and r[i].type ~= 'SOBJ/P' then resolved = r[i]; break end
      end
    end
    if resolved then
      local key = resolved.type .. '\0' .. resolved.name
      if not seenObj[key] then seenObj[key] = true; objects[#objects + 1] = resolved end
    else
      objects[#objects + 1] = o -- 복원 실패 — unsupported-type 스킵으로 기록됨
    end
    if idx % 500 == 0 then eprint('[enum] 복원 진행 ' .. idx .. '/' .. #sobjResidue) end
  end
end
eprint('[enum] total unique objects: ' .. #objects)

if LIMIT > 0 and #objects > LIMIT then
  local trimmed = {}
  for i = 1, LIMIT do trimmed[i] = objects[i] end
  objects = trimmed
  eprint('[enum] LIMIT applied: ' .. LIMIT)
end

-- ── 수집 ─────────────────────────────────────────────────────
-- 파일은 OUT 루트에 "평면"으로만 쓴다 (SAP 오브젝트명은 전역 유일 →
-- 파일명 충돌 없음). 패키지별 디렉터리 배치는 export-cbo.mjs 가 수행 —
-- Lua os.execute(mkdir)는 셸 의존적이라 신뢰하지 않는다.
local function writeFile(path, content)
  local f, ferr = io.open(path, 'wb')
  if not f then return false, tostring(ferr) end
  f:write(content)
  f:close()
  return true
end

local function countLines(s)
  local n = 1
  for _ in s:gmatch('\n') do n = n + 1 end
  return n
end

local function fetchType(adtType)
  local group = adtType:match('^(%w+)')
  if adtType:upper() == 'PROG/I' then return 'INCL' end
  return group
end

local function filenameFor(name, adtType)
  local ext = typeExt[adtType:upper()]
  if not ext then return nil end
  return name:lower():gsub('/', '#') .. ext
end

local done = 0
for _, o in ipairs(objects) do
  local t = o.type:upper()
  local fname = filenameFor(o.name, t)
  if not fname then
    emit({ name = o.name, type = o.type, package = o.package, status = 'skip', reason = 'unsupported-type' })
  elseif t == 'FUGR/F' then
    -- 함수그룹 본체는 SAPL/L include 로 별도 수집됨 — 메타 파일만
    local okw, werr = true, nil
    if not DRY then
      okw, werr = writeFile(OUT .. '/' .. fname,
        '{"type":"FUGR","name":"' .. o.name .. '","note":"본체는 sapl' .. o.name:lower() .. '.prog.abap 및 l' .. o.name:lower() .. '*.prog.abap include 참조"}\n')
    end
    if okw then
      emit({ name = o.name, type = o.type, package = o.package, file = fname, status = 'ok', loc = 1 })
    else
      emit({ name = o.name, type = o.type, package = o.package, status = 'fail', reason = 'write: ' .. tostring(werr) })
    end
  else
    local src, err = getSource(fetchType(t), o.name)
    if not src then
      emit({ name = o.name, type = o.type, package = o.package, status = 'fail', reason = tostring(err) })
    else
      local okw, werr = true, nil
      if not DRY then
        okw, werr = writeFile(OUT .. '/' .. fname, src)
      end
      if not okw then
        emit({ name = o.name, type = o.type, package = o.package, status = 'fail', reason = 'write: ' .. tostring(werr) })
      else
        emit({ name = o.name, type = o.type, package = o.package, file = fname, status = 'ok', loc = countLines(src) })
        -- CLAS 부속 include (없으면 조용히 무시 — 정상)
        if t == 'CLAS/OC' and not DRY then
          for _, ci in ipairs(clasInc) do
            local inc = getSource('CLAS', o.name, ci.include)
            if inc and #inc > 0 then
              local incName = o.name:lower():gsub('/', '#') .. ci.suffix
              if writeFile(OUT .. '/' .. incName, inc) then
                emit({ name = o.name .. '(' .. ci.include .. ')', type = 'CLAS/I', package = o.package, file = incName, status = 'ok', loc = countLines(inc) })
              end
            end
          end
        end
      end
    end
  end
  done = done + 1
  if done % 200 == 0 then eprint('[progress] ' .. done .. '/' .. #objects) end
end
eprint('[done] ' .. done .. ' objects processed')
