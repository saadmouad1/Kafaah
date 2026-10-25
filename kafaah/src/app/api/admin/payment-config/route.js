import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/adminAuth';
import { readJson, writeJson } from '@/lib/store';
import { YEMEN_PAYMENT_CONFIG } from '@/lib/yemenPayConfig';
import { sendOtpEmail, sendApprovalNoticeToClient } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FILE = 'payment_config.json';

function getConfig() {
  const custom = readJson(FILE, null);
  if (custom && custom.beneficiaryName) {
    return { ...YEMEN_PAYMENT_CONFIG, ...custom };
  }
  return YEMEN_PAYMENT_CONFIG;
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'غير مصرّح — سجّل دخول المالك' }, { status: 401 });
  }
  return NextResponse.json({ ok: true, config: getConfig() });
}

export async function POST(req) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'غير مصرّح — سجّل دخول المالك' }, { status: 401 });
  }

  try {
    const body = await req.json();

    // ── إرسال بريد تجريبي لفحص البريد والشعار ──
    if (body.action === 'test_email') {
      const targetEmail = String(body.email || '').trim().toLowerCase();
      if (!targetEmail || !targetEmail.includes('@')) {
        return NextResponse.json({ error: 'يرجى إدخال بريد إلكتروني صالح للفحص' }, { status: 400 });
      }

      const res = await sendOtpEmail({
        email: targetEmail,
        code: '849201',
        name: 'مدير المنصة التجريبي',
        purpose: 'login',
      });

      return NextResponse.json({
        ok: true,
        message: `تم إرسال بريد تجريبي بالشعار المعتمد بنجاح إلى ${targetEmail} ✓ تفقد صندوق الوارد والبريد غير الهام (Spam)`,
        result: res,
      });
    }

    // ── تحديث بيانات الحسابات ──
    const current = getConfig();
    const updated = {
      ...current,
      beneficiaryName: body.beneficiaryName?.trim() || current.beneficiaryName,
      whatsappSupport: body.whatsappSupport?.trim() || current.whatsappSupport,
      jeeb: {
        ...current.jeeb,
        walletNumber: body.jeebWallet?.trim() || current.jeeb.walletNumber,
        beneficiary: body.beneficiaryName?.trim() || current.beneficiaryName,
      },
      kuraimi: {
        ...current.kuraimi,
        beneficiary: body.beneficiaryName?.trim() || current.beneficiaryName,
        accounts: Array.isArray(body.kuraimiAccounts) ? body.kuraimiAccounts : current.kuraimi.accounts,
      },
    };

    writeJson(FILE, updated);
    return NextResponse.json({ ok: true, message: 'تم حفظ إعدادات الحسابات البنكية بنجاح ✓', config: updated });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'فشل تحديث الإعدادات' }, { status: 400 });
  }
}
