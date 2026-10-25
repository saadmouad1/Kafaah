import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/adminAuth';
import { listPayments, approvePayment, rejectPayment, getPaymentStats } from '@/lib/payments';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const deny = () => NextResponse.json({ error: 'غير مصرّح — سجّل دخول المالك' }, { status: 401 });

// GET /api/admin/payments → قائمة طلبات الدفع + الإحصاءات
export async function GET() {
  if (!(await isAdmin())) return deny();
  try {
    const payments = listPayments();
    const stats = getPaymentStats();
    return NextResponse.json({ payments, stats });
  } catch (error) {
    return NextResponse.json({ error: 'تعذّر تحميل طلبات الدفع' }, { status: 500 });
  }
}

// POST /api/admin/payments  body: { action: 'approve' | 'reject', id: '...', reason?: '...' }
export async function POST(request) {
  if (!(await isAdmin())) return deny();
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: 'معرّف الطلب مطلوب' }, { status: 400 });
    }

    if (body.action === 'approve') {
      const res = await approvePayment(body.id, 'admin');
      return NextResponse.json({ ok: true, ...res });
    }

    if (body.action === 'reject') {
      const res = rejectPayment(body.id, body.reason, 'admin');
      return NextResponse.json({ ok: true, payment: res });
    }

    return NextResponse.json({ error: 'إجراء غير معروف' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'فشل معالجة طلب الدفع' }, { status: 400 });
  }
}
