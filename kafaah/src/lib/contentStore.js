// ─────────────────────────────────────────────────────────────────────────────
//  kafaah · content store (server-side)
//  المصدر القابل للتعديل للأقسام (Sectors) والتخصصات (Specializations).
//  يُهيَّأ أول مرة من الافتراضيات في content.js، ثم يُدار من لوحة المالك
//  عبر src/data/content.json. تُستخدم من Route Handlers فقط.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import { SECTORS as DEFAULT_SECTORS } from './content.js';

const FILE = path.join(process.cwd(), 'src', 'data', 'content.json');
let cache = null; // { mtimeMs, sectors }

function clone(x) {
  return JSON.parse(JSON.stringify(x));
}

function seed() {
  const sectors = clone(DEFAULT_SECTORS);
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify({ sectors }, null, 1), 'utf8');
  } catch {}
  return sectors;
}

export function loadSectors() {
  try {
    const st = fs.statSync(FILE);
    if (cache && cache.mtimeMs === st.mtimeMs) return cache.sectors;
    const raw = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    const sectors = Array.isArray(raw?.sectors) ? raw.sectors : Array.isArray(raw) ? raw : seed();
    cache = { mtimeMs: st.mtimeMs, sectors };
    return sectors;
  } catch {
    const sectors = seed();
    try {
      const st = fs.statSync(FILE);
      cache = { mtimeMs: st.mtimeMs, sectors };
    } catch {}
    return sectors;
  }
}

function allSpecsOf(sectors) {
  return sectors.flatMap((sector) =>
    (sector.specializations || []).map((spec) => ({
      ...spec,
      sectorId: sector.id,
      sectorLabel: sector.label,
      sectorColor: sector.color,
      sectorIcon: sector.icon,
    })),
  );
}

export function loadContent() {
  const sectors = loadSectors();
  return { sectors, specs: allSpecsOf(sectors) };
}

export function getContentSpec(id) {
  return allSpecsOf(loadSectors()).find((s) => s.id === id) || null;
}

export function contentSpecIds() {
  return allSpecsOf(loadSectors()).map((s) => s.id);
}

export function findSectorIdBySpec(specId) {
  return getContentSpec(specId)?.sectorId || loadSectors()[0]?.id || 'medical';
}

function save(sectors) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify({ sectors }, null, 1), 'utf8');
  cache = null;
  return sectors;
}

const slug = (s) => String(s || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');

// مخطّط افتراضي للتخصص الجديد
function defaultBlueprint(input) {
  return {
    questions: Number(input?.questions) || 100,
    minutes: Number(input?.minutes) || 120,
    passScore: Number(input?.passScore) || 60,
  };
}

const LEXICON_DEFAULT = {
  field: 'المجال المهني',
  practitioner: 'الممارس',
  exam: 'امتحان المزاولة',
  caseWord: 'السؤال',
  questionNoun: 'سؤال',
  practiceTitle: 'التدريب',
  practiceSub: 'تدريب على أسئلة تخصصك مع شرح مفصّل.',
  mockTitle: 'محاكاة الامتحان',
  bankTitle: 'بنك الأسئلة',
};

// ── الأقسام ─────────────────────────────────────────────────────────────────
export function addSector(input = {}) {
  const sectors = loadSectors();
  const label = String(input.label || '').trim();
  if (!label) throw new Error('اسم القسم مطلوب');
  let id = slug(input.id) || `sector${sectors.length + 1}`;
  if (sectors.some((s) => s.id === id)) throw new Error('معرّف القسم مستخدم');
  const color = String(input.color || '#0ea5a4');
  const sector = {
    id,
    label,
    short: String(input.short || label).trim(),
    icon: String(input.icon || 'health'),
    color,
    colorSoft: String(input.colorSoft || '#e6fffb'),
    gradient: Array.isArray(input.gradient) && input.gradient.length === 2 ? input.gradient : [color, color],
    tagline: String(input.tagline || '').trim(),
    description: String(input.description || '').trim(),
    lexicon: { ...LEXICON_DEFAULT, ...(input.lexicon || {}) },
    specializations: [],
  };
  sectors.push(sector);
  save(sectors);
  return sector;
}

export function updateSector(id, patch = {}) {
  const sectors = loadSectors();
  const s = sectors.find((x) => x.id === id);
  if (!s) throw new Error('القسم غير موجود');
  for (const k of ['label', 'short', 'icon', 'color', 'colorSoft', 'tagline', 'description']) {
    if (patch[k] !== undefined) s[k] = String(patch[k] ?? '').trim();
  }
  if (Array.isArray(patch.gradient) && patch.gradient.length === 2) s.gradient = patch.gradient;
  if (patch.lexicon && typeof patch.lexicon === 'object') s.lexicon = { ...s.lexicon, ...patch.lexicon };
  save(sectors);
  return s;
}

export function deleteSector(id) {
  const sectors = loadSectors();
  const idx = sectors.findIndex((s) => s.id === id);
  if (idx < 0) throw new Error('القسم غير موجود');
  sectors.splice(idx, 1);
  save(sectors);
  return { deleted: 1 };
}

// ── التخصصات ────────────────────────────────────────────────────────────────
export function addSpec(sectorId, input = {}) {
  const sectors = loadSectors();
  const sector = sectors.find((s) => s.id === sectorId);
  if (!sector) throw new Error('القسم غير موجود');
  const label = String(input.label || '').trim();
  if (!label) throw new Error('اسم التخصص مطلوب');
  const allIds = new Set(allSpecsOf(sectors).map((s) => s.id));
  let id = slug(input.id) || `${sectorId}_s${(sector.specializations?.length || 0) + 1}`;
  if (allIds.has(id)) throw new Error('معرّف التخصص مستخدم');
  const spec = {
    id,
    label,
    country: String(input.country || '').trim(),
    authority: String(input.authority || '').trim(),
    blueprint: defaultBlueprint(input),
    keywords: Array.isArray(input.keywords) ? input.keywords : [],
  };
  sector.specializations = sector.specializations || [];
  sector.specializations.push(spec);
  save(sectors);
  return spec;
}

export function updateSpec(specId, patch = {}) {
  const sectors = loadSectors();
  for (const sector of sectors) {
    const spec = (sector.specializations || []).find((sp) => sp.id === specId);
    if (!spec) continue;
    for (const k of ['label', 'country', 'authority']) {
      if (patch[k] !== undefined) spec[k] = String(patch[k] ?? '').trim();
    }
    if (patch.blueprint && typeof patch.blueprint === 'object') {
      spec.blueprint = { ...defaultBlueprint(spec), ...patch.blueprint };
      spec.blueprint.questions = Number(spec.blueprint.questions) || 100;
      spec.blueprint.minutes = Number(spec.blueprint.minutes) || 120;
      spec.blueprint.passScore = Number(spec.blueprint.passScore) || 60;
    }
    if (Array.isArray(patch.keywords)) spec.keywords = patch.keywords;
    // نقل التخصص إلى قسم آخر
    if (patch.moveToSector && patch.moveToSector !== sector.id) {
      const target = sectors.find((s) => s.id === patch.moveToSector);
      if (!target) throw new Error('القسم الهدف غير موجود');
      sector.specializations = sector.specializations.filter((sp) => sp.id !== specId);
      target.specializations = target.specializations || [];
      target.specializations.push(spec);
    }
    save(sectors);
    return spec;
  }
  throw new Error('التخصص غير موجود');
}

export function deleteSpec(specId) {
  const sectors = loadSectors();
  for (const sector of sectors) {
    const before = (sector.specializations || []).length;
    sector.specializations = (sector.specializations || []).filter((sp) => sp.id !== specId);
    if (sector.specializations.length !== before) {
      save(sectors);
      return { deleted: 1 };
    }
  }
  throw new Error('التخصص غير موجود');
}
