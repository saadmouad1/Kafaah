import { NextResponse } from 'next/server';
import { assignSubscription, listSubscriptions } from '@/lib/subscriptions';

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

// POST /api/subscriptions → تسجيل اشتراك (من العميل مباشرة؛ لا بوابات دفع بعد)
// body: { email, name?, packageId }
export async function POST(request) {
  try {
    const body = await request.json();
    const sub = assignSubscription({ email: body.email, clientName: body.name, packageId: body.packageId });
    return NextResponse.json({ ok: true, subscription: sub });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message || 'تعذّر تسجيل الاشتراك' }, { status: 400 });
  }
}
