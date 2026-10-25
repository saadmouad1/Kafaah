import { NextResponse } from 'next/server';
import { assignSubscription, listSubscriptions } from '@/lib/subscriptions';
import { listPayments } from '@/lib/payments';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/subscriptions?email= → فحص حالة الاشتراك المعتمد وإشعارات الدفع المعلقة
export async function GET(request) {
  try {
    const email = (new URL(request.url).searchParams.get('email') || '').trim().toLowerCase();
    if (!email) {
      return NextResponse.json({
        ok: false,
        isSubscribed: false,
        status: 'unauthenticated',
        subscription: null,
      });
    }

    // 1. فحص الاشتراكات في subscriptions.json
    const allSubs = listSubscriptions();
    const sub = allSubs.find((s) => (s.email || '').toLowerCase() === email) || null;
    const now = new Date();
    const isSubscribed = Boolean(
      sub &&
      sub.status === 'active' &&
      sub.expiresAt &&
      new Date(sub.expiresAt) > now
    );

    // 2. فحص طلبات الدفع المعلقة في payments.json
    const userPayments = listPayments({ email });
    const pendingPayment = userPayments.find((p) => p.status === 'pending') || null;
    const latestPayment = userPayments[0] || null;

    let status = 'none';
    if (isSubscribed) {
      status = 'active';
    } else if (pendingPayment) {
      status = 'pending';
    } else if (sub && sub.status === 'expired') {
      status = 'expired';
    }

    return NextResponse.json({
      ok: true,
      email,
      isSubscribed,
      status, // 'active' | 'pending' | 'none' | 'expired'
      subscription: sub,
      pendingPayment,
      latestPayment,
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      isSubscribed: false,
      status: 'error',
      error: error.message,
    });
  }
}

// POST /api/subscriptions → تسجيل أو تجديد اشتراك (من لوحة المالك أو معتمد)
export async function POST(request) {
  try {
    const body = await request.json();
    const sub = assignSubscription({
      email: body.email,
      clientName: body.name,
      packageId: body.packageId,
      status: body.status || 'active',
    });

    if (body.email) {
      try {
        await prisma.user.updateMany({
          where: { email: body.email.trim().toLowerCase() },
          data: { subscription: body.packageId || 'premium' },
        });
      } catch (dbErr) {
        console.warn('Prisma user subscription sync error:', dbErr.message);
      }
    }

    return NextResponse.json({ ok: true, subscription: sub });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error.message || 'تعذّر تسجيل أو تجديد الاشتراك' },
      { status: 400 }
    );
  }
}
