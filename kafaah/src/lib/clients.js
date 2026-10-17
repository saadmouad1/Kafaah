// ─────────────────────────────────────────────────────────────────────────────
//  kafaah · clients (العملاء) — server-side mirror (src/data/clients.json)
//  تُسجَّل الحسابات من صفحة التسجيل/الدخول لتظهر في لوحة المالك.
//  المصادقة نفسها تبقى محليّة على الجهاز في هذه النسخة.
// ─────────────────────────────────────────────────────────────────────────────
import { readJson, writeJson, uid, today } from './store.js';

const FILE = 'clients.json';

function load() {
  const data = readJson(FILE, null);
  if (!data || !Array.isArray(data.clients)) {
    const seeded = { clients: [] };
    writeJson(FILE, seeded);
    return seeded;
  }
  return data;
}

function save(clients) {
  return writeJson(FILE, { clients });
}

export function listClients() {
  return load().clients.sort((a, b) => String(b.lastSeenAt || b.createdAt || '').localeCompare(String(a.lastSeenAt || a.createdAt || '')));
}

export function getClient(id) {
  return load().clients.find((c) => c.id === id) || null;
}

export function getClientByEmail(email) {
  const e = String(email || '').trim().toLowerCase();
  return load().clients.find((c) => c.email === e) || null;
}

export function upsertClient({ email, name, phone, sectorId, specId, mode = 'touch' } = {}) {
  const e = String(email || '').trim().toLowerCase();
  if (!e) throw new Error('البريد الإلكتروني مطلوب');
  const data = load();
  let c = data.clients.find((x) => x.email === e);
  const now = new Date().toISOString();
  if (!c) {
    if (mode === 'touch') throw new Error('لا يوجد عميل بهذا البريد');
    c = {
      id: uid('cli'),
      email: e,
      name: String(name || '').trim() || e.split('@')[0],
      phone: String(phone || '').trim(),
      sectorId: sectorId || null,
      specId: specId || null,
      plan: 'trial',
      createdAt: now,
      lastSeenAt: now,
    };
    data.clients.push(c);
  } else {
    if (name) c.name = String(name).trim();
    if (phone !== undefined) c.phone = String(phone).trim();
    if (sectorId !== undefined) c.sectorId = sectorId || null;
    if (specId !== undefined) c.specId = specId || null;
    c.lastSeenAt = now;
  }
  save(data.clients);
  return c;
}

export function updateClient(id, patch = {}) {
  const data = load();
  const c = data.clients.find((x) => x.id === id);
  if (!c) throw new Error('العميل غير موجود');
  if (patch.name !== undefined) c.name = String(patch.name || '').trim();
  if (patch.phone !== undefined) c.phone = String(patch.phone || '').trim();
  if (patch.sectorId !== undefined) c.sectorId = patch.sectorId || null;
  if (patch.specId !== undefined) c.specId = patch.specId || null;
  if (patch.plan !== undefined) c.plan = patch.plan;
  save(data.clients);
  return c;
}

export function deleteClient(id) {
  const data = load();
  const before = data.clients.length;
  data.clients = data.clients.filter((c) => c.id !== id);
  if (data.clients.length === before) throw new Error('العميل غير موجود');
  save(data.clients);
  return { deleted: before - data.clients.length };
}
