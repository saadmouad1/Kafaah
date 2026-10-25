import { NextResponse } from 'next/server';
import { readJson, writeJson } from '@/lib/store';
import { sendOtpEmail } from '@/lib/email';
import { signUserSession } from '@/lib/apiSecurity';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FILE = 'otp_codes.json';

function getOtpStore() {
  const data = readJson(FILE, null);
  if (!data || !Array.isArray(data.otps)) {
    return { otps: [] };
  }
  return data;
}

function saveOtpStore(store) {
  writeJson(FILE, store);
}

// توليد رمز سري عشوائي من 6 أرقام
function generateOtpCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 });
  }

  const { action, email, code, name, purpose } = body;
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return NextResponse.json({ error: 'يرجى إدخال بريد إلكتروني صحيح' }, { status: 400 });
  }

  const now = Date.now();
  const store = getOtpStore();

  // تنظيف الرموز المنتهية أقدم من 30 دقيقة
  store.otps = store.otps.filter((item) => item.expiresAt > now - 30 * 60 * 1000);

  // ── ١) إرسال رمز OTP جديد ────────────────────────────────────────────────
  if (action === 'send') {
    // منع تكرار الإرسال السريع (Spam protection: 45 ثانية بين كل طلب)
    const existing = store.otps.find((item) => item.email === cleanEmail && item.expiresAt > now);
    if (existing && existing.createdAt && now - existing.createdAt < 45 * 1000) {
      const waitSec = Math.ceil((45 * 1000 - (now - existing.createdAt)) / 1000);
      return NextResponse.json({
        error: `يرجى الانتظار ${waitSec} ثانية قبل طلب رمز جديد`,
        waitSec,
      }, { status: 429 });
    }

    const otpCode = generateOtpCode();
    const expiresAt = now + 10 * 60 * 1000; // صلاحية 10 دقائق

    // حذف أي رمز قديم لنفس الإيميل
    store.otps = store.otps.filter((item) => item.email !== cleanEmail);
    store.otps.push({
      email: cleanEmail,
      code: otpCode,
      createdAt: now,
      expiresAt,
      attempts: 0,
      name: name || '',
    });
    saveOtpStore(store);

    try {
      await sendOtpEmail({
        email: cleanEmail,
        code: otpCode,
        name: name || cleanEmail.split('@')[0],
        purpose: purpose || 'login',
      });
      return NextResponse.json({
        ok: true,
        message: 'تم إرسال رمز التحقق الأمني إلى بريدك الإلكتروني بنجاح ✨',
        expiresInSec: 600,
      });
    } catch (mailErr) {
      console.error('OTP Send error:', mailErr);
      return NextResponse.json({
        error: 'تعذّر إرسال رمز التحقق حالياً. تأكد من صحة البريد وحاول مجدداً.',
      }, { status: 500 });
    }
  }

  // ── ٢) التحقق من رمز OTP ────────────────────────────────────────────────
  if (action === 'verify') {
    const cleanCode = (code || '').trim().replace(/\s+/g, '');
    if (!cleanCode) {
      return NextResponse.json({ error: 'يرجى إدخال رمز التحقق المكون من 6 أرقام' }, { status: 400 });
    }

    const record = store.otps.find((item) => item.email === cleanEmail);

    if (!record) {
      return NextResponse.json({ error: 'لم يتم طلب رمز تحقق لهذا البريد أو انتهت صلاحيته' }, { status: 400 });
    }

    if (now > record.expiresAt) {
      store.otps = store.otps.filter((item) => item.email !== cleanEmail);
      saveOtpStore(store);
      return NextResponse.json({ error: 'انتهت صلاحية الرمز. يرجى طلب رمز جديد' }, { status: 400 });
    }

    if (record.attempts >= 5) {
      store.otps = store.otps.filter((item) => item.email !== cleanEmail);
      saveOtpStore(store);
      return NextResponse.json({ error: 'تم تجاوز الحد الأقصى للمحاولات الخاطئة. اطلب رمزاً جديداً' }, { status: 429 });
    }

    if (record.code !== cleanCode) {
      record.attempts = (record.attempts || 0) + 1;
      saveOtpStore(store);
      const remainingAttempts = 5 - record.attempts;
      return NextResponse.json({
        error: `رمز التحقق غير صحيح. متبقي لديك ${remainingAttempts} محاولات`,
      }, { status: 400 });
    }

    // الرمز صحيح! نحذفه لمنع إعادة استخدامه
    store.otps = store.otps.filter((item) => item.email !== cleanEmail);
    saveOtpStore(store);

    const token = signUserSession(cleanEmail);
    const res = NextResponse.json({
      ok: true,
      verified: true,
      email: cleanEmail,
      token,
      message: 'تم التحقق بنجاح ✓',
    });

    res.cookies.set('kafaah_user_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 24 * 60 * 60, // 60 days
    });

    return res;
  }

  return NextResponse.json({ error: 'إجراء غير مدعوم' }, { status: 400 });
}
