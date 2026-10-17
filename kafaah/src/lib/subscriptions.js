// ─────────────────────────────────────────────────────────────────────────────
//  kafaah · subscriptions (الاشتراكات) — server-side store (src/data/subscriptions.json)
//  لا توجد بوابات دفع بعد؛ تُسجَّل الاشتراكات يدويًا من لوحة المالك أو من العميل.
// ─────────────────────────────────────────────────────────────────────────────
import { readJson, writeJson, uid } from './store.js';
import { getPackage } from './packages.js';

const FILE = 'subscriptions.json';

function load() {
  const data = readJson(FILE, null);
  if (!data || !Array.isArray(data.subscriptions)) {
    const seeded = { subscriptions: [] };
    writeJson(FILE, seeded);
    return seeded;
  }
  return data;
}

function save(subscriptions) {
  return writeJson(FILE, { subscriptions });
}

function addInterval(from, interval) {
  const d = new Date(from);
  if (interval === 'year') d.setFullYear(d.getFullYear() + 1);
  else if (interval === 'once') d.setFullYear(d.getFullYear() + 100);
  else d.setMonth(d.getMonth() + 1);
  return d.toISOString();
}

export function listSubscriptions() {
  return load().subscriptions.sort((a, b) => String(b.startedAt || '').localeCompare(String(a.startedAt || '')));
}

export function getSubscription(id) {
  return load().subscriptions.find((s) => s.id === id) || null;
}

// إنشاء/تجديد اشتراك لعميل حسب بريده.
export function assignSubscription({ email, clientName, clientId, packageId, status = 'active' } = {}) {
  const e = String(email || '').trim().toLowerCase();
  if (!e) throw new Error('بريد العميل مطلوب');
  const pkg = getPackage(packageId);
  if (!pkg) throw new Error('الباقة غير موجودة');
  const data = load();
  const now = new Date().toISOString();
  let sub = data.subscriptions.find((s) => s.email === e);
  if (sub) {
    sub.packageId = pkg.id;
    sub.packageName = pkg.name;
    sub.price = pkg.price;
    sub.currency = pkg.currency;
    sub.status = status;
    sub.startedAt = now;
    // إذا كان الاشتراك ساريًا، يُمدَّد من تاريخ الانتهاء الحالي؛ وإن كان منتهيًا يُمدَّد من الآن
    const baseDate = (sub.expiresAt && new Date(sub.expiresAt) > new Date()) ? sub.expiresAt : now;
    sub.expiresAt = addInterval(baseDate, pkg.interval);
    sub.clientName = clientName || sub.clientName || '';
    if (clientId) sub.clientId = clientId;
  } else {
    sub = {
      id: uid('sub'),
      clientId: clientId || null,
      email: e,
      clientName: clientName || '',
      packageId: pkg.id,
      packageName: pkg.name,
      price: pkg.price,
      currency: pkg.currency,
      status,
      startedAt: now,
      expiresAt: addInterval(now, pkg.interval),
      createdAt: now,
    };
    data.subscriptions.push(sub);
  }
  save(data.subscriptions);
  return sub;
}

export function updateSubscription(id, patch = {}) {
  const data = load();
  const sub = data.subscriptions.find((s) => s.id === id);
  if (!sub) throw new Error('الاشتراك غير موجود');
  if (patch.status !== undefined) sub.status = ['active', 'canceled', 'expired'].includes(patch.status) ? patch.status : sub.status;
  if (patch.expiresAt !== undefined) sub.expiresAt = patch.expiresAt || sub.expiresAt;
  if (patch.packageId !== undefined) {
    const pkg = getPackage(patch.packageId);
    if (!pkg) throw new Error('الباقة غير موجودة');
    sub.packageId = pkg.id;
    sub.packageName = pkg.name;
    sub.price = pkg.price;
    sub.currency = pkg.currency;
  }
  save(data.subscriptions);
  return sub;
}

export function deleteSubscription(id) {
  const data = load();
  const before = data.subscriptions.length;
  data.subscriptions = data.subscriptions.filter((s) => s.id !== id);
  if (data.subscriptions.length === before) throw new Error('الاشتراك غير موجود');
  save(data.subscriptions);
  return { deleted: before - data.subscriptions.length };
}

export function subscriptionStats() {
  const subs = load().subscriptions;
  const active = subs.filter((s) => s.status === 'active');
  const mrr = active.reduce((sum, s) => {
    const monthly = s.packageId === 'yearly' ? (s.price || 0) / 12 : s.packageId === 'once' ? 0 : (s.price || 0);
    return sum + monthly;
  }, 0);
  return { total: subs.length, active: active.length, canceled: subs.filter((s) => s.status === 'canceled').length, mrr: Math.round(mrr * 100) / 100 };
}
