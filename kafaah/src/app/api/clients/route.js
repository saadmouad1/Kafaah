import { NextResponse } from 'next/server';
import { upsertClient } from '@/lib/clients';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/clients → تسجيل/تحديث عميل (من صفحة التسجيل أو الدخول)
// body: { action: 'register'|'touch', email, name?, phone?, sectorId?, specId? }
export async function POST(request) {
  try {
    const body = await request.json();
    const action = body.action === 'register' ? 'register' : 'touch';
    const client = upsertClient({
      email: body.email,
      name: body.name,
      phone: body.phone,
      sectorId: body.sectorId,
      specId: body.specId,
      mode: action,
    });
    return NextResponse.json({ ok: true, client });
  } catch (error) {
    // لا نُفشل تجربة المستخدم المحلية إن تعذّرت المزامنة
    return NextResponse.json({ ok: false, error: error.message || 'تعذّرت المزامنة' }, { status: 200 });
  }
}
