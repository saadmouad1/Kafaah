import { NextResponse } from 'next/server';
import { assignSubscription, listSubscriptions } from '@/lib/subscriptions';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/subscriptions?email= → اشتراك عميل معيّن (لعرضه في الإعدادات)
export async function GET(request) {
  try {
    const email = (new URL(request.url).searchParams.get('email') || '').trim().toLowerCase();
    const all = listSubscriptions();
    const found = email ? all.find((s) => s.email === email) || null : null;
    return NextResponse.json({ subscription: found });
  } catch (error) {
    return NextResponse.json({ subscription: null });
  }
}

// POST /api/subscriptions → تسجيل أو تجديد اشتراك (من العميل أو لوحة المالك)
// body: { email, name?, packageId }
export async function POST(request) {
  try {
    const body = await request.json();
    const sub = assignSubscription({ email: body.email, clientName: body.name, packageId: body.packageId });
    
    // مزامنة حالة الاشتراك مع قاعدة البيانات في جدول المستخدمين إن وجد
    if (body.email) {
      try {
        await prisma.user.updateMany({
          where: { email: body.email.trim().toLowerCase() },
          data: { subscription: body.packageId || 'premium' }
        });
      } catch (dbErr) {
        // لا نوقف الطلب إذا تعذر اتصال قاعدة البيانات
        console.warn('Prisma user subscription sync error:', dbErr.message);
      }
    }

    return NextResponse.json({ ok: true, subscription: sub });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message || 'تعذّر تسجيل أو تجديد الاشتراك' }, { status: 400 });
  }
}
