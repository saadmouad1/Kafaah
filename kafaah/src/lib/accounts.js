'use client';
// ─────────────────────────────────────────────────────────────────────────────
//  kafaah · accounts (حسابات المستخدمين والمصادقة على العميل)
//  تخزين محلي مع مزامنة متكاملة مع الخادم عبر /api/auth/account
// ─────────────────────────────────────────────────────────────────────────────

const KEY = 'kafaah_accounts_v1';

function read() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

function write(list) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
}

const enc = (s) => (typeof btoa !== 'undefined' ? btoa(unescape(encodeURIComponent(s))) : s);

export function registerAccount({ name, email, password, phone = '', sectorId = null, specId = null }) {
  const list = read();
  const e = (email || '').trim().toLowerCase();
  if (!e || !e.includes('@')) throw new Error('يرجى إدخال بريد إلكتروني صحيح');
  if (!name?.trim()) throw new Error('الاسم مطلوب');
  if ((password || '').length < 6) throw new Error('كلمة المرور يجب أن تكون ٦ أحرف على الأقل');

  let acc = list.find((a) => a.email === e);
  if (!acc) {
    acc = {
      id: Date.now().toString(36),
      name: name.trim(),
      email: e,
      phone: phone.trim(),
      sectorId,
      specId,
      pass: enc(password),
      createdAt: new Date().toISOString(),
    };
    list.push(acc);
  } else {
    acc.name = name.trim();
    acc.pass = enc(password);
    if (phone) acc.phone = phone.trim();
    if (sectorId) acc.sectorId = sectorId;
    if (specId) acc.specId = specId;
  }
  write(list);

  // مزامنة مع الخادم في الخلفية
  if (typeof fetch !== 'undefined') {
    fetch('/api/auth/account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', email: e, name: name.trim(), password, phone, sectorId, specId }),
    }).catch(() => {});
  }

  return acc;
}

export function loginAccount(email, password) {
  const list = read();
  const e = (email || '').trim().toLowerCase();
  const acc = list.find((a) => a.email === e);
  if (acc && acc.pass === enc(password)) {
    return acc;
  }
  return null;
}

export function updateLocalPassword(email, newPassword) {
  const list = read();
  const e = (email || '').trim().toLowerCase();
  const acc = list.find((a) => a.email === e);
  if (acc) {
    acc.pass = enc(newPassword);
    write(list);
  } else {
    list.push({
      id: Date.now().toString(36),
      name: e.split('@')[0],
      email: e,
      pass: enc(newPassword),
      createdAt: new Date().toISOString(),
    });
    write(list);
  }
}

export function accountExists(email) {
  return read().some((a) => a.email === (email || '').trim().toLowerCase());
}
