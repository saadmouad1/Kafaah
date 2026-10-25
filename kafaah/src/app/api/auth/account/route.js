import { NextResponse } from 'next/server';
import {
  verifyCredentials,
  createServerAccount,
  resetServerAccountPassword,
  getAccountByEmail
} from '@/lib/serverAccounts';
import { readJson, writeJson } from '@/lib/store';
import { signUserSession } from '@/lib/apiSecurity';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'طلب غير صالح' }, { status: 400 });
  }

  const { action, email, password, newPassword, name, phone, sectorId, specId, code } = body;
  const cleanEmail = String(email || '').trim().toLowerCase();

  // ── ١) التحقق من بيانات الدخول (الإيميل وكلمة السر) ──────────────────────
  if (action === 'verify_credentials') {
    try {
      const user = verifyCredentials(cleanEmail, password);
      const token = signUserSession(user.email);
      const res = NextResponse.json({ ok: true, user, token });
      res.cookies.set('kafaah_user_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 24 * 60 * 60,
      });
      return res;
    } catch (err) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
    }
  }

  // ── ٢) إنشاء حساب جديد ──────────────────────────────────────────────────
  if (action === 'register') {
    try {
      const user = createServerAccount({
        name,
        email: cleanEmail,
        password,
        phone,
        sectorId,
        specId,
      });
      const token = signUserSession(user.email);
      const res = NextResponse.json({ ok: true, user, token });
      res.cookies.set('kafaah_user_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 24 * 60 * 60,
      });
      return res;
    } catch (err) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
    }
  }

  // ── ٣) إعادة تعيين كلمة المرور عبر الرمز الأمني OTP ─────────────────────
  if (action === 'reset_password') {
    if (!cleanEmail) {
      return NextResponse.json({ ok: false, error: 'البريد الإلكتروني مطلوب' }, { status: 400 });
    }
    const cleanCode = String(code || '').trim().replace(/\s+/g, '');
    if (!cleanCode || cleanCode.length !== 6) {
      return NextResponse.json({ ok: false, error: 'يرجى إدخال رمز التحقق المكون من 6 أرقام' }, { status: 400 });
    }
    if (!newPassword || String(newPassword).length < 6) {
      return NextResponse.json({ ok: false, error: 'كلمة المرور الجديدة يجب أن تكون 6 خانات على الأقل' }, { status: 400 });
    }

    // التحقق من صحة الـ OTP من جدول الرموز
    const store = readJson('otp_codes.json', { otps: [] });
    const record = store.otps?.find((item) => item.email.toLowerCase() === cleanEmail);

    if (!record) {
      return NextResponse.json({ ok: false, error: 'لم يتم طلب رمز تحقق لهذا البريد أو انتهت صلاحيته' }, { status: 400 });
    }

    if (Date.now() > record.expiresAt) {
      store.otps = store.otps.filter((item) => item.email.toLowerCase() !== cleanEmail);
      writeJson('otp_codes.json', store);
      return NextResponse.json({ ok: false, error: 'انتهت صلاحية الرمز الأمني. اطلب رمزاً جديداً' }, { status: 400 });
    }

    if (record.code !== cleanCode) {
      record.attempts = (record.attempts || 0) + 1;
      writeJson('otp_codes.json', store);
      return NextResponse.json({ ok: false, error: 'رمز التحقق غير صحيح' }, { status: 400 });
    }

    // تم التحقق بنجاح من الرمز! نقوم بتحديث كلمة المرور
    store.otps = store.otps.filter((item) => item.email.toLowerCase() !== cleanEmail);
    writeJson('otp_codes.json', store);

    try {
      const user = resetServerAccountPassword(cleanEmail, newPassword);
      return NextResponse.json({
        ok: true,
        message: 'تم تعيين كلمة المرور الجديدة بنجاح! يمكنك الآن تسجيل الدخول مباشرة.',
        user,
      });
    } catch (err) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
    }
  }

  // ── ٤) فحص وجود الحساب ───────────────────────────────────────────────────
  if (action === 'check_exists') {
    const acc = getAccountByEmail(cleanEmail);
    return NextResponse.json({ ok: true, exists: !!acc });
  }

  return NextResponse.json({ ok: false, error: 'إجراء غير مدعوم' }, { status: 400 });
}
