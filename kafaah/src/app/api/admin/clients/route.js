import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/adminAuth';
import { listClients, updateClient, deleteClient, upsertClient } from '@/lib/clients';
import { listSubscriptions } from '@/lib/subscriptions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const deny = () => NextResponse.json({ error: 'غير مصرّح — سجّل دخول المالك' }, { status: 401 });

// GET /api/admin/clients → العملاء + اشتراكاتهم
export async function GET() {
  if (!(await isAdmin())) return deny();
  try {
    return NextResponse.json({ clients: listClients(), subscriptions: listSubscriptions() });
  } catch (error) {
    return NextResponse.json({ error: 'تعذّر تحميل العملاء' }, { status: 500 });
  }
}

// POST /api/admin/clients  body: { action: 'create'|'update'|'delete', ... }
export async function POST(request) {
  if (!(await isAdmin())) return deny();
  try {
    const body = await request.json();
    switch (body.action) {
      case 'create':
        return NextResponse.json({ ok: true, client: upsertClient({ ...body, mode: 'register' }) });
      case 'update':
        return NextResponse.json({ ok: true, client: updateClient(body.id, body.patch || {}) });
      case 'delete':
        return NextResponse.json({ ok: true, ...deleteClient(body.id) });
      default:
        return NextResponse.json({ error: 'إجراء غير معروف' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message || 'فشل تنفيذ الإجراء' }, { status: 400 });
  }
}
