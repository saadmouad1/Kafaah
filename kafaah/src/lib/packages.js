// ─────────────────────────────────────────────────────────────────────────────
//  kafaah · packages (الباقات) — server-side store (src/data/packages.json)
//  الباقة الافتراضية: اشتراك شهري بسعر 5 دولار (لا توجد بوابات دفع بعد).
// ─────────────────────────────────────────────────────────────────────────────
import { readJson, writeJson, uid, today } from './store.js';

const FILE = 'packages.json';

const DEFAULT_PACKAGES = [
  {
    id: 'monthly',
    name: 'الاشتراك الشهري',
    nameEn: 'Monthly subscription',
    price: 5,
    currency: 'USD',
    interval: 'month',
    features: ['وصول كامل لبنوك الأسئلة', 'محاكاة امتحان غير محدودة', 'تحليل أداء ومساعد ذكي'],
    featuresEn: ['Full access to question banks', 'Unlimited mock exams', 'Analytics & AI assistant'],
    active: true,
    createdBy: 'system',
    createdAt: today(),
  },
];

function load() {
  const data = readJson(FILE, null);
  if (!data || !Array.isArray(data.packages)) {
    const seeded = { packages: JSON.parse(JSON.stringify(DEFAULT_PACKAGES)) };
    writeJson(FILE, seeded);
    return seeded;
  }
  return data;
}

function save(packages) {
  return writeJson(FILE, { packages });
}

export function listPackages({ activeOnly = false } = {}) {
  const list = load().packages;
  return activeOnly ? list.filter((p) => p.active !== false) : list;
}

export function getPackage(id) {
  return load().packages.find((p) => p.id === id) || null;
}

export function createPackage(input = {}) {
  const data = load();
  const name = String(input.name || '').trim();
  if (!name) throw new Error('اسم الباقة مطلوب');
  const price = Number(input.price);
  if (!Number.isFinite(price) || price < 0) throw new Error('السعر غير صالح');
  let id = String(input.id || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
  if (!id) id = uid('pkg');
  if (data.packages.some((p) => p.id === id)) throw new Error('معرّف الباقة مستخدم');
  const pkg = {
    id,
    name,
    nameEn: String(input.nameEn || '').trim(),
    price,
    currency: String(input.currency || 'USD').trim().toUpperCase(),
    interval: ['month', 'year', 'once'].includes(input.interval) ? input.interval : 'month',
    features: Array.isArray(input.features) ? input.features.map((f) => String(f).trim()).filter(Boolean) : [],
    featuresEn: Array.isArray(input.featuresEn) ? input.featuresEn.map((f) => String(f).trim()).filter(Boolean) : [],
    active: input.active !== false,
    createdBy: input.createdBy || 'admin',
    createdAt: today(),
  };
  data.packages.push(pkg);
  save(data.packages);
  return pkg;
}

export function updatePackage(id, patch = {}) {
  const data = load();
  const pkg = data.packages.find((p) => p.id === id);
  if (!pkg) throw new Error('الباقة غير موجودة');
  if (patch.name !== undefined) {
    const name = String(patch.name || '').trim();
    if (!name) throw new Error('اسم الباقة مطلوب');
    pkg.name = name;
  }
  if (patch.nameEn !== undefined) pkg.nameEn = String(patch.nameEn || '').trim();
  if (patch.price !== undefined) {
    const price = Number(patch.price);
    if (!Number.isFinite(price) || price < 0) throw new Error('السعر غير صالح');
    pkg.price = price;
  }
  if (patch.currency !== undefined) pkg.currency = String(patch.currency || 'USD').trim().toUpperCase();
  if (patch.interval !== undefined) pkg.interval = ['month', 'year', 'once'].includes(patch.interval) ? patch.interval : pkg.interval;
  if (patch.features !== undefined) pkg.features = Array.isArray(patch.features) ? patch.features.map((f) => String(f).trim()).filter(Boolean) : [];
  if (patch.featuresEn !== undefined) pkg.featuresEn = Array.isArray(patch.featuresEn) ? patch.featuresEn.map((f) => String(f).trim()).filter(Boolean) : [];
  if (patch.active !== undefined) pkg.active = !!patch.active;
  save(data.packages);
  return pkg;
}

export function deletePackage(id) {
  const data = load();
  const before = data.packages.length;
  data.packages = data.packages.filter((p) => p.id !== id);
  if (data.packages.length === before) throw new Error('الباقة غير موجودة');
  save(data.packages);
  return { deleted: before - data.packages.length };
}
