// ─────────────────────────────────────────────────────────────────────────────
//  kafaah · serverAccounts (إدارة الحسابات وكلمات المرور على الخادم)
//  تخزين دائم وموثوق في accounts.json عبر store.js المتوافق مع Vercel
// ─────────────────────────────────────────────────────────────────────────────
import { readJson, writeJson, uid, today } from './store.js';
import { upsertClient } from './clients.js';
import crypto from 'node:crypto';

const FILE = 'accounts.json';

// تجزئة كلمة المرور بشكل آمن باستخدام SHA-256 مع الملح (Salt)
function hashPassword(password, salt = 'kafaah_secure_salt_2026') {
  return crypto.createHash('sha256').update(`${salt}:${password}`).digest('hex');
}

function load() {
  const data = readJson(FILE, null);
  if (!data || !Array.isArray(data.accounts)) {
    const seeded = {
      accounts: [
        {
          id: 'acc_admin',
          email: 'saadmouad2004@gmail.com',
          name: 'سعد معاذ',
          passwordHash: hashPassword('716420699SS'),
          phone: '772686817',
          role: 'admin',
          createdAt: today(),
        },
      ],
    };
    writeJson(FILE, seeded);
    return seeded;
  }
  return data;
}

function save(accounts) {
  return writeJson(FILE, { accounts });
}

export function getAccountByEmail(email) {
  const e = String(email || '').trim().toLowerCase();
  return load().accounts.find((a) => a.email.toLowerCase() === e) || null;
}

// التحقق من صحة كلمة المرور للمستخدم
export function verifyCredentials(email, password) {
  const e = String(email || '').trim().toLowerCase();
  const cleanPass = String(password || '').trim();

  if (!e || !cleanPass) {
    throw new Error('يرجى إدخال البريد الإلكتروني وكلمة المرور');
  }

  const acc = getAccountByEmail(e);

  // إذا لم يكن الحساب موجوداً في accounts.json، نتحقق مما إذا كان مسجلاً كمسؤول في البيئة
  if (!acc) {
    if (e === (process.env.ADMIN_EMAIL || 'saadmouad2004@gmail.com').toLowerCase() &&
        cleanPass === (process.env.ADMIN_PASSWORD || '716420699SS')) {
      return {
        id: 'acc_admin',
        email: e,
        name: 'مدير المنصة',
        role: 'admin',
      };
    }
    throw new Error('لا يوجد حساب مسجّل بهذا البريد الإلكتروني. يرجى إنشاء حساب جديد أولاً.');
  }

  const inputHash = hashPassword(cleanPass);
  // توافق مع النظام القديم المشفر بـ btoa إن وجد
  const legacyMatch = acc.legacyPass && acc.legacyPass === Buffer.from(cleanPass).toString('base64');

  if (acc.passwordHash !== inputHash && !legacyMatch) {
    throw new Error('كلمة المرور غير صحيحة. يرجى التأكد منها أو النقر على «نسيت كلمة المرور».');
  }

  return {
    id: acc.id,
    email: acc.email,
    name: acc.name,
    phone: acc.phone || '',
    role: acc.role || 'user',
  };
}

// تسجيل حساب جديد
export function createServerAccount({ name, email, password, phone = '', sectorId = null, specId = null }) {
  const e = String(email || '').trim().toLowerCase();
  const cleanName = String(name || '').trim();
  const cleanPass = String(password || '').trim();

  if (!e || !e.includes('@')) throw new Error('يرجى إدخال بريد إلكتروني صحيح');
  if (!cleanName) throw new Error('الاسم الكامل مطلوب');
  if (cleanPass.length < 6) throw new Error('كلمة المرور يجب أن تتكون من 6 خانات على الأقل');

  const data = load();
  if (data.accounts.some((a) => a.email.toLowerCase() === e)) {
    throw new Error('هذا البريد الإلكتروني مسجّل بالفعل في كفاءة. يرجى تسجيل الدخول أو استعادة كلمة المرور.');
  }

  const newAcc = {
    id: uid('acc'),
    email: e,
    name: cleanName,
    passwordHash: hashPassword(cleanPass),
    phone: String(phone || '').trim(),
    sectorId,
    specId,
    role: 'user',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  data.accounts.push(newAcc);
  save(data.accounts);

  // مزامنة فورية في جدول العملاء لظهوره للمالك
  try {
    upsertClient({
      email: e,
      name: cleanName,
      phone,
      sectorId,
      specId,
      mode: 'register',
    });
  } catch (err) {
    console.warn('Upsert client warning during registration:', err.message);
  }

  return {
    id: newAcc.id,
    email: newAcc.email,
    name: newAcc.name,
    phone: newAcc.phone,
    role: newAcc.role,
  };
}

// إعادة تعيين كلمة المرور
export function resetServerAccountPassword(email, newPassword) {
  const e = String(email || '').trim().toLowerCase();
  const cleanPass = String(newPassword || '').trim();

  if (!cleanPass || cleanPass.length < 6) {
    throw new Error('كلمة المرور الجديدة يجب أن تكون 6 خانات على الأقل');
  }

  const data = load();
  let acc = data.accounts.find((a) => a.email.toLowerCase() === e);

  if (!acc) {
    // إذا لم يكن موجوداً، نقوم بإنشائه لضمان عدم ضياع حساب العميل
    acc = {
      id: uid('acc'),
      email: e,
      name: e.split('@')[0],
      passwordHash: hashPassword(cleanPass),
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.accounts.push(acc);
  } else {
    acc.passwordHash = hashPassword(cleanPass);
    acc.updatedAt = new Date().toISOString();
  }

  save(data.accounts);
  return {
    id: acc.id,
    email: acc.email,
    name: acc.name,
  };
}
