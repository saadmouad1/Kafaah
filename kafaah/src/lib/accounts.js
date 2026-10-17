'use client';
// حسابات محلية بسيطة (تُخزَّن في المتصفح) — كافية للنسخة الحالية.
const KEY = 'kafaah_accounts_v1';

function read() {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function write(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {}
}
const enc = (s) => (typeof btoa !== 'undefined' ? btoa(unescape(encodeURIComponent(s))) : s);

export function registerAccount({ name, email, password }) {
  const list = read();
  const e = email.trim().toLowerCase();
  if (list.some((a) => a.email === e)) throw new Error('هذا البريد مسجّل مسبقًا');
  if (!name?.trim()) throw new Error('الاسم مطلوب');
  if ((password || '').length < 6) throw new Error('كلمة المرور يجب أن تكون ٦ أحرف على الأقل');
  const acc = { id: Date.now().toString(36), name: name.trim(), email: e, pass: enc(password), createdAt: new Date().toISOString() };
  list.push(acc);
  write(list);
  return acc;
}

export function loginAccount(email, password) {
  const list = read();
  const e = email.trim().toLowerCase();
  const acc = list.find((a) => a.email === e);
  if (!acc) throw new Error('لا يوجد حساب بهذا البريد');
  if (acc.pass !== enc(password)) throw new Error('كلمة المرور غير صحيحة');
  return acc;
}

export function accountExists(email) {
  return read().some((a) => a.email === email.trim().toLowerCase());
}
