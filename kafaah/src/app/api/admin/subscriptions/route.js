import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/adminAuth';
import { listSubscriptions, assignSubscription, updateSubscription, deleteSubscription, subscriptionStats } from '@/lib/subscriptions';
import { listPackages } from '@/lib/packages';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const deny = () => NextResponse.json({ error: 'غير مصرّح — سجّل دخول المالك' }, { status: 401 });

// GET /api/admin/subscriptions → الاشتراكات + الإحصاءات + الباقات
export async function GET() {
  if (!(await isAdmin())) return deny();
  try {
    return NextResponse.json({ subscriptions: listSubscriptions(), stats: subscriptionStats(), packages: listPackages() });
  } catch (error) {
    return NextResponse.json({ error: 'تعذّر تحميل الاشتراكات' }, { status: 500 });
  }
}

// POST /api/admin/subscriptions  body: { action: 'assign'|'update'|'delete', ... }
export async function POST(request) {
  if (!(await isAdmin())) return deny();
  try {
    const body = await request.json();
    switch (body.action) {
      case 'assign':
        return NextResponse.json({ ok: true, subscription: assignSubscription(body) });
      case 'update':
        return NextResponse.json({ ok: true, subscription: updateSubscription(body.id, body.patch || {}) });
      case 'delete':
        return NextResponse.json({ ok: true, ...deleteSubscription(body.id) });
      default:
        return NextResponse.json({ error: 'إجراء غير معروف' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message || 'فشل تنفيذ الإجراء' }, { status: 400 });
  }
}
