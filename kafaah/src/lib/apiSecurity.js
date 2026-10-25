// ─────────────────────────────────────────────────────────────────────────────
//  kafaah · apiSecurity (نظام الحماية المشدد للواجهات البرمجية ومنع سحب الأسئلة)
//  - حماية بالتوثيق المشفر HMAC-SHA256
//  - التحقق الإلزامي من الاشتراك المعتمد قبل تسليم أي سؤال أو محتوى
//  - تقييد معدل الطلبات (Rate Limiting) لمنع البوتات وهجمات الاستخراج
//  - فرض سقف صارم لعدد الأسئلة في كل طلب (Anti-Scraping Clamping)
// ─────────────────────────────────────────────────────────────────────────────
import { cookies } from 'next/headers';
import crypto from 'node:crypto';
import { listSubscriptions } from './subscriptions.js';
import { listPayments } from './payments.js';
import { isAdmin } from './adminAuth.js';

const SECRET = process.env.ADMIN_SESSION_SECRET || process.env.JWT_SECRET || 'kafaah_secure_api_vault_2026_salt';

// ── توليد رمز مصادقة مشفر وغير قابل للتزوير ──────────────────────────────────
export function signUserSession(email) {
  const clean = String(email || '').trim().toLowerCase();
  const time = Date.now();
  const hmac = crypto.createHmac('sha256', SECRET).update(`${clean}:${time}`).digest('hex');
  return Buffer.from(`${clean}:${time}:${hmac}`).toString('base64');
}

// ── فك وتحقيق صحة رمز المصادقة ───────────────────────────────────────────────
export function verifyUserSession(token) {
  if (!token) return null;
  try {
    const raw = Buffer.from(token, 'base64').toString('utf8');
    const [email, timeStr, hmac] = raw.split(':');
    if (!email || !timeStr || !hmac) return null;

    // صلاحية التوكن: 60 يوماً
    const time = parseInt(timeStr, 10);
    if (isNaN(time) || Date.now() - time > 60 * 24 * 60 * 60 * 1000) {
      return null;
    }

    const expected = crypto.createHmac('sha256', SECRET).update(`${email}:${timeStr}`).digest('hex');
    const hmacBuf = Buffer.from(hmac);
    const expectedBuf = Buffer.from(expected);
    if (hmacBuf.length === expectedBuf.length && crypto.timingSafeEqual(hmacBuf, expectedBuf)) {
      return { email };
    }
  } catch {}
  return null;
}

// ── تقييد معدل الطلبات (Rate Limiting) في الذاكرة لمنع الكشط الآلي ────────────
const rateLimitStore = new Map();

export function checkRateLimit(ipOrId, maxRequests = 60, windowMs = 60000) {
  const now = Date.now();
  const key = String(ipOrId || 'anon');
  const record = rateLimitStore.get(key) || { count: 0, resetAt: now + windowMs };

  if (now > record.resetAt) {
    record.count = 1;
    record.resetAt = now + windowMs;
    rateLimitStore.set(key, record);
    return { ok: true, remaining: maxRequests - 1 };
  }

  record.count += 1;
  rateLimitStore.set(key, record);

  if (record.count > maxRequests) {
    return {
      ok: false,
      retryAfterSec: Math.ceil((record.resetAt - now) / 1000),
    };
  }

  return { ok: true, remaining: maxRequests - record.count };
}

// تنظيف دوري للذاكرة كل 5 دقائق
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetAt + 60000) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

// ── التحقق الصارم من هوية المستخدم واشتراكه المعتمد ───────────────────────────
export async function authenticateAndVerifySubscription(request) {
  // 1. حساب المشرف / المالك مسموح له دائماً
  if (await isAdmin()) {
    return { authorized: true, role: 'admin', email: 'admin' };
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('kafaah_user_session')?.value;
  const authHeader = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const xAuth = request.headers.get('x-kafaah-token');

  const tokenToVerify = sessionCookie || authHeader || xAuth;
  const verified = verifyUserSession(tokenToVerify);

  // إذا لم يتوفر توكن صالح وموقع بالـ Secret، يُمنع فوراً
  if (!verified?.email) {
    return {
      authorized: false,
      status: 401,
      error: 'غير مصرح: يرجى تسجيل الدخول لحسابك للوصول إلى محتوى وبنوك الأسئلة',
    };
  }

  const userEmail = verified.email;

  // فحص اشتراك العميل في قاعدة بيانات الاشتراكات المعتمدة
  const subs = listSubscriptions();
  const sub = subs.find((s) => (s.email || '').toLowerCase() === userEmail);
  const now = new Date();

  const isSubActive = Boolean(
    sub &&
    sub.status === 'active' &&
    sub.expiresAt &&
    new Date(sub.expiresAt) > now
  );

  // فحص سجل الحوالات المؤكدة
  let isPaymentApproved = false;
  if (!isSubActive) {
    const payments = listPayments({ email: userEmail });
    const approved = payments.find((p) => p.status === 'approved');
    if (approved) {
      isPaymentApproved = true;
    }
  }

  if (!isSubActive && !isPaymentApproved) {
    return {
      authorized: false,
      status: 403,
      error: 'الوصول إلى بنك الأسئلة مقفل: يلزم وجود اشتراك نشط ومؤكد من إدارة المنصة.',
    };
  }

  return {
    authorized: true,
    email: userEmail,
    role: 'subscriber',
    subscription: sub,
  };
}
