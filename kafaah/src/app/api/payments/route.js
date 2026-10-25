import { NextResponse } from 'next/server';
import { createPaymentRequest, listPayments } from '@/lib/payments';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/payments?email=... → استعلام العميل عن حالة طلبات دفعه
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = (searchParams.get('email') || '').trim();
    if (!email) {
      return NextResponse.json({ payments: [] });
    }
    const payments = listPayments({ email });
    return NextResponse.json({ payments });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'تعذّر جلب حالة الدفع' }, { status: 500 });
  }
}

// POST /api/payments → إرسال إشعار دفع جديد من العميل
export async function POST(request) {
  try {
    const body = await request.json();
    const payment = await createPaymentRequest(body);
    return NextResponse.json({ ok: true, payment });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message || 'تعذّر إرسال إشعار الدفع' }, { status: 400 });
  }
}
