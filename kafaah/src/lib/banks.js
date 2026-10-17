// ─────────────────────────────────────────────────────────────────────────────
//  kafaah · banks (server-side)
//  طبقة قراءة/كتابة بنوك الأسئلة من الملفات (src/data/banks/<specId>.json)
//
//  النموذج: كل تخصص (specialization) يحتوي على «بنك» واحد أو أكثر،
//  وكل بنك له عنوانه ووصفه وأسئلته الخاصة:
//
//    { specId, sectorId, updatedAt,
//      banks: [ { id, title, description, auto, createdAt, updatedAt, questions: [] } ] }
//
//  — متوافق مع الصيغة القديمة (questions على مستوى التخصص) ويُرقّيها تلقائيًا
//    إلى بنك واحد افتراضي بعنوان التخصص.
//  — تُستخدم من Route Handlers فقط (تعتمد على node:fs).
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import { ALL_SPECS, getSpec, findSectorIdBySpec } from './content.js';

const BANKS_DIR = path.join(process.cwd(), 'src', 'data', 'banks');

const today = () => new Date().toISOString().slice(0, 10);
const ALL_SPEC_IDS = new Set(ALL_SPECS.map((s) => s.id));

// ── in-memory cache (يُبطَل عند تغيّر زمن التعديل) ────────────────────────────
const cache = new Map(); // specId -> { mtimeMs, data }

function fileFor(specId) {
  return path.join(BANKS_DIR, `${specId}.json`);
}

function defaultBankId(specId) {
  return `${specId}-b1`;
}

// ── تطبيع الشكل ──────────────────────────────────────────────────────────────
function normalizeBank(specId, b, i) {
  const id = String(b?.id || `${specId}-b${i + 1}`);
  const title = typeof b?.title === 'string' ? b.title : '';
  const questions = Array.isArray(b?.questions) ? b.questions : [];
  const auto = b?.auto === true || !title;
  for (const q of questions) {
    q.specId = specId;
    q.bankId = id;
    q.bankTitle = title;
    q.bankAuto = auto;
  }
  return {
    id,
    title,
    description: typeof b?.description === 'string' ? b.description : '',
    auto,
    createdAt: b?.createdAt || today(),
    updatedAt: b?.updatedAt || today(),
    questions,
  };
}

function normalizeSpec(specId, raw) {
  const sectorId = raw?.sectorId || findSectorIdBySpec(specId);
  let banks;
  if (raw && Array.isArray(raw.banks)) {
    banks = raw.banks.map((b, i) => normalizeBank(specId, b, i));
  } else if (raw && Array.isArray(raw.questions)) {
    // ترقية الصيغة القديمة: أسئلة التخصص تُصبح بنكًا واحدًا افتراضيًا.
    banks = [
      normalizeBank(
        specId,
        {
          id: defaultBankId(specId),
          title: '',
          auto: true,
          createdAt: raw.updatedAt,
          updatedAt: raw.updatedAt,
          questions: raw.questions,
        },
        0,
      ),
    ];
  } else {
    banks = [];
  }
  return { specId, sectorId, updatedAt: raw?.updatedAt || today(), banks };
}

function serialize(specId, data) {
  return {
    specId,
    sectorId: data.sectorId || findSectorIdBySpec(specId),
    updatedAt: today(),
    count: (data.banks || []).reduce((s, b) => s + (b.questions?.length || 0), 0),
    banks: (data.banks || []).map((b) => ({
      id: b.id,
      title: b.title || '',
      description: b.description || '',
      ...(b.auto ? { auto: true } : {}),
      createdAt: b.createdAt || today(),
      updatedAt: b.updatedAt || today(),
      questions: b.questions || [],
    })),
  };
}

export function readSpec(specId) {
  const file = fileFor(specId);
  try {
    const st = fs.statSync(file);
    const hit = cache.get(specId);
    if (hit && hit.mtimeMs === st.mtimeMs) return hit.data;
    const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
    const data = normalizeSpec(specId, raw);
    cache.set(specId, { mtimeMs: st.mtimeMs, data });
    return data;
  } catch {
    return normalizeSpec(specId, null);
  }
}

export function writeSpec(specId, data) {
  const file = fileFor(specId);
  const payload = serialize(specId, data);
  fs.mkdirSync(BANKS_DIR, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(payload, null, 1), 'utf8');
  cache.delete(specId);
  return normalizeSpec(specId, payload);
}

// ── بيانات وصفية للبنك ───────────────────────────────────────────────────────
export function bankMeta(specId, bank) {
  const difficulties = { easy: 0, medium: 0, hard: 0 };
  for (const q of bank.questions || []) {
    const d = q.difficulty === 'easy' ? 'easy' : q.difficulty === 'hard' ? 'hard' : 'medium';
    difficulties[d]++;
  }
  return {
    id: bank.id,
    specId,
    sectorId: findSectorIdBySpec(specId),
    title: bank.title,
    description: bank.description,
    auto: !!bank.auto,
    count: (bank.questions || []).length,
    difficulties,
    createdAt: bank.createdAt,
    updatedAt: bank.updatedAt,
  };
}

export function listBanks(specId) {
  return readSpec(specId).banks.map((b) => bankMeta(specId, b));
}

// بنوك نطاق معيّن (قسم/تخصصات) مع اسم التخصص — لاختيار البنك في البحث والمحاكاة.
export function banksFor({ sector = null, spec = null, specs = null } = {}) {
  const out = [];
  for (const id of resolveSpecs({ sector, spec, specs })) {
    const meta = getSpec(id);
    for (const b of listBanks(id)) {
      out.push({ ...b, specLabel: meta?.label || id });
    }
  }
  return out;
}

// ── فهرس البنوك (عدّ لكل تخصص) ───────────────────────────────────────────────
let indexCache = null;
let indexCacheAt = 0;

export function getBankIndex({ fresh = false } = {}) {
  const now = Date.now();
  if (!fresh && indexCache && now - indexCacheAt < 1500) return indexCache;
  const items = ALL_SPECS.map((spec) => {
    const data = readSpec(spec.id);
    const banks = data.banks.map((b) => bankMeta(spec.id, b));
    const count = banks.reduce((s, b) => s + b.count, 0);
    return {
      specId: spec.id,
      label: spec.label,
      sectorId: spec.sectorId,
      sectorLabel: spec.sectorLabel,
      count,
      bankCount: banks.length,
      banks,
      updatedAt: data.updatedAt,
    };
  });
  const bySector = {};
  for (const it of items) {
    bySector[it.sectorId] = (bySector[it.sectorId] || 0) + it.count;
  }
  indexCache = { total: items.reduce((s, i) => s + i.count, 0), bySector, items };
  indexCacheAt = now;
  return indexCache;
}

// ── أدوات مساعدة ─────────────────────────────────────────────────────────────
function normText(s) {
  return String(s || '').toLowerCase();
}

function toSpecList(specs) {
  const raw = Array.isArray(specs) ? specs : String(specs ?? '').split(',');
  return raw.map((s) => String(s).trim()).filter((s) => ALL_SPEC_IDS.has(s));
}

function resolveSpecs({ sector = null, spec = null, specs = null } = {}) {
  const hasSpecs = specs != null && String(specs).trim() !== '';
  if (hasSpecs) return toSpecList(specs); // فلتر صريح: قد يكون فارغًا => لا نتائج
  if (spec && spec !== 'all' && ALL_SPEC_IDS.has(spec)) return [spec];
  if (sector && sector !== 'all') return ALL_SPECS.filter((s) => s.sectorId === sector).map((s) => s.id);
  return ALL_SPECS.map((s) => s.id);
}

// فلتر البنوك: null/undefined = كل البنوك، مصفوفة (قد تكون فارغة) = صريح.
function toBankList(banks) {
  if (banks == null) return null;
  const raw = Array.isArray(banks) ? banks : String(banks).split(',');
  return raw.map((s) => String(s).trim()).filter(Boolean);
}

// ── الاستعلام ────────────────────────────────────────────────────────────────
export function queryQuestions({
  sector = null,
  spec = null,
  specs = null,
  bank = null,
  banks = null,
  subject = null,
  difficulty = null,
  search = null,
  limit = 20,
  offset = 0,
} = {}) {
  const bankFilter = toBankList(bank ?? banks);
  let pool = [];

  for (const id of resolveSpecs({ sector, spec, specs })) {
    const data = readSpec(id);
    for (const b of data.banks) {
      if (bankFilter && !bankFilter.includes(b.id)) continue;
      if (b.questions.length) pool = pool.concat(b.questions);
    }
  }

  if (subject && subject !== 'all') {
    pool = pool.filter((q) => q.subject === subject || (q.tags || []).includes(subject));
  }
  if (difficulty && difficulty !== 'all') {
    pool = pool.filter((q) => q.difficulty === difficulty);
  }
  if (search) {
    const t = normText(search);
    pool = pool.filter(
      (q) =>
        normText(q.text).includes(t) ||
        (q.options || []).some((o) => normText(o).includes(t)) ||
        normText(q.subject).includes(t) ||
        (q.tags || []).some((tag) => normText(tag).includes(t)),
    );
  }

  const total = pool.length;
  const lim = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const off = Math.max(parseInt(offset, 10) || 0, 0);
  const page = pool.slice(off, off + lim);

  return {
    total,
    limit: lim,
    offset: off,
    hasMore: off + lim < total,
    questions: page,
  };
}

// ── المواد المتاحة (تُستخدم إداريًا فقط — ليست وحدة التنظيم) ──────────────────
export function subjectsFor({ sector = null, spec = null, specs = null } = {}) {
  const set = new Set();
  for (const id of resolveSpecs({ sector, spec, specs })) {
    for (const b of readSpec(id).banks) {
      for (const q of b.questions) if (q.subject) set.add(q.subject);
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'ar'));
}

// ── عمليات الأدمن ────────────────────────────────────────────────────────────
function uid(specId, n) {
  return `${specId}-a${Date.now().toString(36)}${n ?? ''}${Math.random().toString(36).slice(2, 6)}`;
}

function cleanQuestion(specId, bankId, q, i) {
  const options = (q.options || []).map((o) => String(o ?? '').trim()).filter((o) => o.length);
  let correctIndex = Number.isInteger(q.correctIndex) ? q.correctIndex : 0;
  if (correctIndex < 0 || correctIndex >= options.length) correctIndex = 0;
  return {
    id: q.id || uid(specId, i),
    sectorId: q.sectorId || findSectorIdBySpec(specId),
    specId,
    bankId,
    subject: (q.subject || 'عام').trim(),
    topic: q.topic || null,
    difficulty: ['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : 'medium',
    language: /[\u0600-\u06FF]/.test(q.text || '') ? 'ar' : 'en',
    text: String(q.text || '').trim(),
    options,
    correctIndex,
    explanation: (q.explanation || '').trim() || null,
    source: (q.source || 'أُضيف من لوحة التحكم').trim(),
    tags: Array.isArray(q.tags) ? q.tags.slice(0, 8) : [],
  };
}

function ensureBank(data, specId, bankId) {
  if (bankId) {
    const found = data.banks.find((b) => b.id === bankId);
    if (found) return found;
    throw new Error('البنك غير موجود');
  }
  if (data.banks.length) return data.banks[0];
  const bank = {
    id: defaultBankId(specId),
    title: '',
    description: '',
    auto: true,
    createdAt: today(),
    updatedAt: today(),
    questions: [],
  };
  data.banks.push(bank);
  return bank;
}

function nextBankId(specId, banks) {
  let max = 0;
  for (const b of banks) {
    const m = /-b(\d+)$/.exec(b.id || '');
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `${specId}-b${max + 1}`;
}

// ── إدارة البنوك ─────────────────────────────────────────────────────────────
export function createBank(specId, { title, description } = {}) {
  if (!getSpec(specId)) throw new Error('تخصص غير معروف');
  const cleanTitle = String(title || '').trim();
  if (!cleanTitle) throw new Error('عنوان البنك مطلوب');
  const data = readSpec(specId);
  const bank = {
    id: nextBankId(specId, data.banks),
    title: cleanTitle,
    description: String(description || '').trim(),
    auto: false,
    createdAt: today(),
    updatedAt: today(),
    questions: [],
  };
  data.banks.push(bank);
  writeSpec(specId, data);
  return bankMeta(specId, bank);
}

export function updateBank(specId, bankId, patch = {}) {
  const data = readSpec(specId);
  const bank = data.banks.find((b) => b.id === bankId);
  if (!bank) throw new Error('البنك غير موجود');
  if (patch.title !== undefined) {
    const t = String(patch.title || '').trim();
    if (!t) throw new Error('عنوان البنك مطلوب');
    bank.title = t;
    bank.auto = false;
  }
  if (patch.description !== undefined) bank.description = String(patch.description || '').trim();
  bank.updatedAt = today();
  writeSpec(specId, data);
  return bankMeta(specId, bank);
}

export function deleteBank(specId, bankId) {
  const data = readSpec(specId);
  const before = data.banks.length;
  data.banks = data.banks.filter((b) => b.id !== bankId);
  if (data.banks.length === before) throw new Error('البنك غير موجود');
  writeSpec(specId, data);
  return { deleted: before - data.banks.length };
}

// ── إدارة الأسئلة داخل بنك ───────────────────────────────────────────────────
export function addQuestions(specId, bankId, list, { merge = false } = {}) {
  if (!getSpec(specId)) throw new Error('تخصص غير معروف');
  const data = readSpec(specId);
  const bank = ensureBank(data, specId, bankId);
  const incoming = (Array.isArray(list) ? list : [list])
    .map((q, i) => cleanQuestion(specId, bank.id, q, i))
    .filter((q) => q.text && q.options.length >= 2);
  const byId = new Map(bank.questions.map((q) => [q.id, q]));
  let added = 0;
  for (const q of incoming) {
    if (!byId.has(q.id)) added++;
    byId.set(q.id, q);
  }
  bank.questions = [...byId.values()];
  bank.updatedAt = today();
  writeSpec(specId, data);
  return { added, total: bank.questions.length, skipped: incoming.length - added, bankId: bank.id };
}

export function updateQuestion(specId, bankId, id, patch) {
  const data = readSpec(specId);
  const scope = bankId ? data.banks.filter((b) => b.id === bankId) : data.banks;
  for (const b of scope) {
    const idx = b.questions.findIndex((q) => q.id === id);
    if (idx < 0) continue;
    const merged = cleanQuestion(specId, b.id, { ...b.questions[idx], ...patch }, 0);
    merged.id = id;
    b.questions[idx] = merged;
    b.updatedAt = today();
    writeSpec(specId, data);
    return merged;
  }
  throw new Error('السؤال غير موجود');
}

export function deleteQuestion(specId, bankId, id) {
  const data = readSpec(specId);
  const scope = bankId ? data.banks.filter((b) => b.id === bankId) : data.banks;
  for (const b of scope) {
    const before = b.questions.length;
    b.questions = b.questions.filter((q) => q.id !== id);
    if (b.questions.length !== before) {
      b.updatedAt = today();
      writeSpec(specId, data);
      return { deleted: before - b.questions.length, bankId: b.id };
    }
  }
  return { deleted: 0 };
}

export function replaceBankQuestions(specId, bankId, questions) {
  if (!getSpec(specId)) throw new Error('تخصص غير معروف');
  const data = readSpec(specId);
  const bank = ensureBank(data, specId, bankId);
  const clean = (questions || [])
    .map((q, i) => cleanQuestion(specId, bank.id, q, i))
    .filter((q) => q.text && q.options.length >= 2);
  bank.questions = clean;
  bank.updatedAt = today();
  writeSpec(specId, data);
  return { total: clean.length, bankId: bank.id };
}

// ── إحصاءات للوحة التحكم ─────────────────────────────────────────────────────
export function bankStats() {
  const idx = getBankIndex({ fresh: true });
  return {
    total: idx.total,
    specs: idx.items.filter((i) => i.count > 0).length,
    banks: idx.items.reduce((s, i) => s + i.bankCount, 0),
    subjects: subjectsFor({}).length,
    bySector: idx.bySector,
    items: idx.items,
  };
}

// ── بحث عميق + تكرار الأسئلة ─────────────────────────────────────────────────
//   يُطبّع النص العربي (إزالة التشكيل، توحيد الألف/الياء/الهاء...) ثم يجمع
//   الأسئلة المتطابقة ويحسب كم مرة تكرر السؤال وفي أي بنك/تخصص ظهر.
export function normalizeAr(s) {
  return String(s ?? '')
    .toLowerCase()
    .replace(/[\u064B-\u0652\u0670\u0640\u06D6-\u06ED]/g, '') // تشكيل + تطويل
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/[ىئ]/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ة/g, 'ه')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function deepSearch({
  sector = null,
  spec = null,
  specs = null,
  bank = null,
  banks = null,
  q = '',
  groupLimit = 60,
} = {}) {
  const query = normalizeAr(q);
  const tokens = query.split(' ').filter((t) => t.length >= 2);
  const groups = new Map();
  const banksSet = new Set();
  let matchedRows = 0;

  if (query) {
    const bankFilter = toBankList(bank ?? banks);
    for (const id of resolveSpecs({ sector, spec, specs })) {
      const data = readSpec(id);
      const meta = getSpec(id);
      for (const b of data.banks) {
        if (bankFilter && !bankFilter.includes(b.id)) continue;
        for (const item of b.questions) {
          const hay = normalizeAr(item.text);
          if (!hay) continue;
          const hit = tokens.length <= 1 ? hay.includes(query) : tokens.every((t) => hay.includes(t));
          if (!hit) continue;
          matchedRows += 1;
          banksSet.add(b.id);
          let g = groups.get(hay);
          if (!g) {
            g = {
              key: hay,
              text: item.text,
              options: item.options || [],
              correctIndex: item.correctIndex ?? 0,
              explanation: item.explanation || null,
              subject: item.subject || 'عام',
              occurrences: [],
            };
            groups.set(hay, g);
          }
          g.occurrences.push({
            id: item.id,
            specId: id,
            specLabel: meta?.label || id,
            sectorId: meta?.sectorId || findSectorIdBySpec(id),
            subject: item.subject || 'عام',
            difficulty: item.difficulty || 'medium',
            source: item.source || null,
            bankId: b.id,
            bankTitle: b.title || '',
            bankAuto: !!b.auto,
          });
        }
      }
    }
  }

  const all = [...groups.values()]
    .map((g) => {
      const bankIds = [...new Set(g.occurrences.map((o) => o.bankId))];
      const specIds = [...new Set(g.occurrences.map((o) => o.specId))];
      const subjects = [...new Set(g.occurrences.map((o) => o.subject))];
      return { ...g, count: g.occurrences.length, banks: bankIds.length, bankIds, specIds, subjects };
    })
    .sort((a, b) => b.count - a.count || b.occurrences.length - a.occurrences.length);

  const top = all.slice(0, Math.max(1, Math.min(parseInt(groupLimit, 10) || 60, 200)));
  return {
    query: q,
    matchedRows,
    unique: all.length,
    banksInvolved: banksSet.size,
    duplicated: all.filter((g) => g.count > 1).length,
    groups: top,
    truncated: all.length > top.length,
  };
}

// ── تلميحات/اقتراحات بحث ─────────────────────────────────────────────────────
export function searchSuggestions({ sector = null, spec = null, specs = null, bank = null, banks = null, limit = 8 } = {}) {
  const bankFilter = toBankList(bank ?? banks);
  const subjects = new Set();
  const topics = new Set();
  for (const id of resolveSpecs({ sector, spec, specs })) {
    for (const b of readSpec(id).banks) {
      if (bankFilter && !bankFilter.includes(b.id)) continue;
      for (const item of b.questions) {
        if (item.subject) subjects.add(item.subject);
        if (item.topic) topics.add(item.topic);
      }
    }
  }
  return [...subjects, ...topics]
    .filter(Boolean)
    .slice(0, Math.max(1, Math.min(parseInt(limit, 10) || 8, 24)));
}
